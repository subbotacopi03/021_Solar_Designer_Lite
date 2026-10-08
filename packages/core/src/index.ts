import { reportText, reportLine } from "./markdown-text.js";
import {
  ProjectSchema,
  type Project,
  type EngineeringCheck,
} from "../../schema/src/index.js";
import {
  generateStringPlan,
  validateStringPlan,
  stringLengthRange,
} from "./strings.js";
import { calculateAcCurrent } from "./fundamentals.js";
import { check, finding, overall } from "./checks.js";
import { assessDcSwitchCandidate } from "./dc-switch.js";
export * from "./dc-switch.js";
import { assessSpdCandidate } from "./spd.js";
export * from "./spd.js";
import {
  resolveDcRoute,
  resolveAcRoute,
  orphanRouteChecks,
  cableRouteQuantities,
} from "./routes.js";
export * from "./routes.js";
import { sizeCable } from "./cables.js";
import {
  standardRatingAtLeast,
  selectStringFuse,
  selectDcIsolator,
  checkBreakingCapacity,
  spdAssessment,
} from "./protection.js";
export * from "./fundamentals.js";
export * from "./strings.js";
export * from "./checks.js";
export * from "./cables.js";
export * from "./protection.js";
import { assertFiniteCalculation } from "./numerical-safety.js";
export { CalculationRangeError } from "./numerical-safety.js";
export const ENGINE_VERSION = "0.1.0";
export function calculateProject(raw: unknown) {
  const p = ProjectSchema.parse(raw);
  const requested = p.planes.reduce((a, x) => a + x.module_count, 0);
  const generated = p.manual_strings
    ? {
        strings: p.manual_strings,
        checks: [] as EngineeringCheck[],
        unassigned:
          requested - p.manual_strings.reduce((a, x) => a + x.modules, 0),
      }
    : generateStringPlan(p);
  const strings = generated.strings,
    installed = strings.reduce((a, x) => a + x.modules, 0),
    dcPower = installed * p.module.pmax_w,
    acPower = p.inverter.ac_power_w * p.inverter_quantity;
  const checks = [...generated.checks, ...validateStringPlan(p, strings)];
  if (p.inverter.requires_optimizer)
    checks.push(
      finding(
        "OPTIMIZER_ENGINE",
        "UNKNOWN",
        "Optimizer topology is not implemented",
        ["optimizer_topology"],
      ),
    );
  const unknownLayout = generated.checks.some((c) => c.status === "UNKNOWN");
  checks.push(
    unknownLayout
      ? finding(
          "ALLOCATION",
          "UNKNOWN",
          "Allocation cannot be assessed without complete string data",
          ["string_data"],
        )
      : check(
          "ALLOCATION",
          installed,
          requested,
          "modules",
          "All requested modules must be allocated",
          [],
          "min",
        ),
  );
  const ratio = dcPower / acPower,
    band = p.policy.dc_ac_band;
  if (band) {
    checks.push(
      check(
        "RATIO_MAX",
        unknownLayout ? null : ratio,
        band[1],
        "",
        "Explicit project policy",
      ),
    );
    checks.push(
      check(
        "RATIO_MIN",
        unknownLayout ? null : ratio,
        band[0],
        "",
        "Explicit project policy",
        [],
        "min",
      ),
    );
  } else
    checks.push(
      finding(
        "RATIO_POLICY",
        "UNKNOWN",
        "Ratio is calculated, acceptance band is not defined",
        ["dc_ac_band"],
      ),
    );
  const acCurrent =
    p.site.cos_phi == null
      ? null
      : calculateAcCurrent(
          p.inverter.ac_power_w,
          p.inverter.ac_voltage_v,
          p.inverter.phases,
          p.site.cos_phi,
        );
  const breaker =
    acCurrent == null
      ? null
      : standardRatingAtLeast(p.policy.breaker_ratings_a, acCurrent);
  if (breaker == null)
    checks.push(
      finding(
        "AC_BREAKER_RATING",
        acCurrent == null ? "UNKNOWN" : "FAIL",
        "No rating available",
        ["cos_phi_or_standard_rating"],
      ),
    );
  const acLines = Array.from({ length: p.inverter_quantity }, (_, index) => {
    const inverter = index + 1,
      route = resolveAcRoute(p, inverter),
      circuit = route.circuit_input;
    const cable = sizeCable(p.cables, {
      ...circuit,
      circuit: p.inverter.phases === 3 ? "AC3" : "AC1",
      ib_a: acCurrent,
      in_a: breaker,
      length_m: circuit.length_m,
      voltage_v: p.inverter.ac_voltage_v,
      required_voltage_v: p.inverter.ac_voltage_v,
      conductor_temp_c: circuit.conductor_temp_c,
      derating_factor: circuit.derating_factor,
      derating_basis: circuit.derating_basis,
      drop_limit_pct: p.policy.ac_drop_max_pct,
      cos_phi: p.site.cos_phi,
    });
    // Preserve legacy first-feeder check IDs; every further feeder has a distinct prefix.
    checks.push(
      ...cable.checks.map((c) => ({
        ...c,
        id: inverter === 1 ? c.id : `INV${inverter}:AC:${c.id}`,
      })),
    );
    return { inverter, ...route, cable };
  });
  const ac = acLines[0]!.cable; // Compatibility alias ONLY for inverter1.
  checks.push(
    checkBreakingCapacity(p.breaker_icu_ka, p.prospective_short_circuit_ka),
    ...orphanRouteChecks(p, strings),
  );
  const dcLines = strings.map((row) => {
    const mppt = p.inverter.mppts.find((m) => m.id === row.mppt_id);
    const range = mppt ? stringLengthRange(p, mppt) : null;
    const k = strings.filter(
      (s) => s.inverter === row.inverter && s.mppt_id === row.mppt_id,
    ).length;
    const voc =
        range?.voc_cold_v == null ? null : range.voc_cold_v * row.modules,
      vmp = range?.vmp_hot_v == null ? null : range.vmp_hot_v * row.modules;
    const fuse = selectStringFuse(p.policy, {
      isc_a: p.module.isc_a,
      parallel_strings: k,
      max_series_fuse_a: p.module.max_series_fuse_a,
      reverse_current_withstand_a: p.module.reverse_current_withstand_a,
      voc_cold_v: voc,
      inverter_backfeed_a: p.inverter.max_backfeed_current_a,
      device: p.string_fuse_device,
    });
    const ib =
      p.policy.isc_factor == null ? null : p.module.isc_a * p.policy.isc_factor;
    const switchChecks = p.dc_switch_device
      ? assessDcSwitchCandidate({
          device: p.dc_switch_device,
          context: p.dc_switch_context,
          voc_cold_v: voc,
          design_current_a: ib,
        })
      : [];
    const route = resolveDcRoute(p, row, strings),
      circuit = route.circuit_input;
    checks.push(...route.checks);
    const cable = sizeCable(p.cables, {
      ...circuit,
      circuit: "DC",
      ib_a: ib,
      in_a:
        p.string_fuse_device?.rated_current_a ??
        (fuse.required === null ? null : (fuse.rating_a ?? ib)),
      length_m: circuit.length_m,
      voltage_v: vmp,
      required_voltage_v: voc,
      conductor_temp_c: circuit.conductor_temp_c,
      derating_factor: circuit.derating_factor,
      derating_basis: circuit.derating_basis,
      drop_limit_pct: p.policy.dc_drop_max_pct,
    });
    checks.push(
      ...switchChecks.map((c) => ({ ...c, id: row.id + ":" + c.id })),
      ...fuse.checks.map((c) => ({ ...c, id: row.id + ":" + c.id })),
      ...cable.checks.map((c) => ({ ...c, id: row.id + ":" + c.id })),
    );
    return {
      string_id: row.id,
      circuit_input: route.circuit_input,
      input_origin: route.input_origin,
      voc_cold_v: voc,
      vmp_hot_v: vmp,
      ib_a: ib,
      fuse,
      isolator_a: p.dc_switch_device
        ? null
        : selectDcIsolator(p.policy, p.module.isc_a),
      dc_switch_checks: switchChecks,
      cable,
    };
  });
  if (p.dc_switch_device && !strings.length)
    checks.push(
      ...assessDcSwitchCandidate({
        device: p.dc_switch_device,
        context: p.dc_switch_context,
        voc_cold_v: null,
        design_current_a: null,
      }).map((c) => ({ ...c, id: "PRELIMINARY:" + c.id })),
    );
  if (p.spd_device) {
    const groups = new Map<string, typeof strings>();
    for (const row of strings) {
      const key = `INV${row.inverter}:${row.mppt_id}`;
      groups.set(key, [...(groups.get(key) ?? []), row]);
    }
    if (!groups.size) groups.set("PRELIMINARY", []);
    for (const [key, group] of groups) {
      const row = group[0],
        mppt = p.inverter.mppts.find((m) => m.id === row?.mppt_id);
      const range = mppt ? stringLengthRange(p, mppt) : null;
      const n = group.length ? Math.max(...group.map((s) => s.modules)) : null;
      const arrayCurrent =
        !group.length || p.policy.isc_factor == null
          ? null
          : group.length * p.module.isc_a * p.policy.isc_factor;
      const prospective =
        !group.length ||
        p.policy.isc_factor == null ||
        p.inverter.max_backfeed_current_a == null
          ? null
          : group.length * p.module.isc_a * p.policy.isc_factor +
            p.inverter.max_backfeed_current_a;
      checks.push(
        ...assessSpdCandidate({
          device: p.spd_device,
          context: p.spd_context,
          voc_cold_v:
            n == null || range?.voc_cold_v == null
              ? null
              : n * range.voc_cold_v,
          voc_stc_v: n == null ? null : n * p.module.voc_v,
          prospective_current_a: prospective,
          known_current_lower_bound_a: group.length
            ? (arrayCurrent ?? 0) + (p.inverter.max_backfeed_current_a ?? 0)
            : null,
        }).map((c) => ({ ...c, id: key + ":" + c.id })),
      );
    }
  }
  checks.push(
    spdAssessment(),
    finding(
      "PROTECTION_SCOPE",
      "UNKNOWN",
      "Full protection design remains outside v0.1: I2 ≤ 1.45 Iz, disconnection time, adiabatic withstand, RCD, DC switch utilization category and fault-specific inverter backfeed coordination",
      [
        "device_curves",
        "fault_loop",
        "earthing_system",
        "fault_specific_backfeed_coordination",
      ],
    ),
  );
  for (const source of [
    ...p.module.sources,
    ...p.inverter.sources,
    ...p.policy.sources,
  ])
    if (source.verification !== "VERIFIED")
      checks.push({
        ...finding("SOURCE:" + source.id, "WARN", source.label),
        source_ids: [source.id],
      });
  const bom: { item: string; quantity: number; unit: string; basis: string }[] =
    [
      {
        item: p.module.name,
        quantity: installed,
        unit: "pcs",
        basis: "Installed modules",
      },
      {
        item: p.inverter.name,
        quantity: p.inverter_quantity,
        unit: "pcs",
        basis: "Declared inverter fleet",
      },
    ];
  const cableBom = cableRouteQuantities(
    [
      ...dcLines.map((line) => ({
        cable_id: line.cable.selected?.cable.id ?? null,
        length_m: line.circuit_input.length_m,
        conductors: 2 as const,
      })),
      ...acLines.map((line) => ({
        cable_id: line.cable.selected?.cable.id ?? null,
        length_m: line.circuit_input.length_m,
        conductors: 1 as const,
      })),
    ],
    !unknownLayout && installed === requested,
  );
  checks.push(...cableBom.checks);
  for (const entry of cableBom.totals)
    bom.push({
      ...entry,
      unit: "m",
      basis:
        "Known selected feeder routes only; DC two conductors / AC one multicore; partial if routes omitted; no reserve",
    });
  const isolators = new Map<number, number>(),
    fuses = new Map<number, number>();
  for (const line of dcLines) {
    if (line.isolator_a != null)
      isolators.set(line.isolator_a, (isolators.get(line.isolator_a) ?? 0) + 1);
    if (line.fuse.rating_a != null)
      fuses.set(line.fuse.rating_a, (fuses.get(line.fuse.rating_a) ?? 0) + 1);
  }
  if (
    p.dc_switch_device &&
    p.dc_switch_context?.scope === "PER_STRING" &&
    dcLines.length
  )
    bom.push({
      item: p.dc_switch_device.name,
      quantity: dcLines.length,
      unit: "pcs",
      basis:
        "Unapproved per-string candidate; nominal checks do not establish installation/coordination",
    });
  for (const [rating, quantity] of isolators)
    bom.push({
      item: `DC isolator candidate ${rating} A`,
      quantity,
      unit: "pcs",
      basis:
        "Per-string candidate topology; manufacturer utilization category and voltage remain unverified",
    });
  for (const [rating, quantity] of fuses)
    bom.push({
      item: `DC string fuse candidate ${rating} A`,
      quantity,
      unit: "pcs",
      basis:
        "Per-string candidate; confirm polarity poles, DC voltage, backfeed and coordination",
    });
  if (breaker)
    bom.push({
      item: `AC breaker candidate ${breaker} A`,
      quantity: p.inverter_quantity,
      unit: "pcs",
      basis: "Rating candidate; fault and curve checks required",
    });
  return assertFiniteCalculation({
    engine_version: ENGINE_VERSION,
    schema_version: p.schema_version,
    status: overall(checks),
    requested_modules: requested,
    installed_modules: installed,
    unassigned_modules: generated.unassigned,
    dc_power_w: dcPower,
    requested_dc_power_w: requested * p.module.pmax_w,
    ac_power_w: acPower,
    dc_ac_ratio: ratio,
    ac_current_per_inverter_a: acCurrent,
    breaker_candidate_a: breaker,
    ranges: p.inverter.mppts.map((mppt) => ({
      mppt_id: mppt.id,
      ...stringLengthRange(p, mppt),
    })),
    strings,
    dc_lines: dcLines,
    ac,
    ac_lines: acLines,
    cable_bom: cableBom,
    checks,
    bom,
  });
}
export type ProjectResult = ReturnType<typeof calculateProject>;
function cableCandidateAudit(result: ProjectResult, uk: boolean): string[] {
  const lines = [
    ...result.dc_lines.map((line) => ({ label: `DC ${line.string_id}`, line })),
    ...result.ac_lines.map((line) => ({
      label: `AC INV${line.inverter}`,
      line,
    })),
  ];
  return [
    reportLine`\n## ${uk ? "Аудит кабельних кандидатів" : "Cable candidate audit"}`,
    ...lines.flatMap(({ label, line }) => [
      reportLine`### ${label} · ${line.input_origin} · selected=${line.cable.selected?.cable.id ?? "UNKNOWN"}`,
      ...line.cable.candidates.flatMap((candidate) => [
        reportLine`- ${candidate.cable.id} · ${candidate.cable.section_mm2} mm² · ${candidate.status}; R(T)=${candidate.r_ohm_km ?? "UNKNOWN"} Ω/km; Iz×k=${candidate.iz_derated_a ?? "UNKNOWN"} A; ΔU=${candidate.drop_v ?? "UNKNOWN"} V / ${candidate.drop_pct ?? "UNKNOWN"}%`,
        ...candidate.checks
          .filter((c) => c.status !== "PASS")
          .map(
            (c) =>
              reportLine`  ${c.status} · ${c.id}: ${c.demand ?? "UNKNOWN"} / ${c.capacity ?? "UNKNOWN"} ${c.unit}; ${c.basis}; missing=${c.missing.join(",") || "—"}; sources=${c.source_ids.join(",") || "UNKNOWN"}`,
          ),
      ]),
      ...(line.cable.candidates.length
        ? []
        : [uk ? "Немає кандидатів у каталозі." : "No catalog candidates."]),
    ]),
  ];
}
export { type SoftwareAttribution } from "./software-credit.js";
import { softwareCredit, type SoftwareAttribution } from "./software-credit.js";
export function projectReport(
  p: Project,
  result: ProjectResult,
  language: "uk" | "en" = "uk",
  attribution?: SoftwareAttribution,
) {
  const uk = language === "uk";
  return [
    reportLine`# ${p.name}`,
    reportLine`${uk ? "Попередній електричний розрахунок" : "Preliminary electrical calculation"} · OpenPV ${ENGINE_VERSION}`,
    reportLine`Status: ${result.status}`,
    ...(attribution ? softwareCredit(attribution, language) : []),
    reportLine`Modules: ${result.installed_modules}/${result.requested_modules}`,
    reportLine`DC: ${(result.dc_power_w / 1000).toFixed(3)} kWp · AC: ${(result.ac_power_w / 1000).toFixed(3)} kW · DC/AC: ${result.dc_ac_ratio.toFixed(4)}`,
    reportLine`Tmin cell: ${p.site.t_min_cell_c ?? "UNKNOWN"} °C · Tmax cell: ${p.site.t_max_cell_c ?? "UNKNOWN"} °C`,
    reportLine`\n## ${uk ? "Обладнання та джерела" : "Equipment and sources"}`,
    ...([p.module, p.inverter] as const).flatMap((equipment) => [
      reportLine`### ${equipment.manufacturer ?? "USER INPUT / SYNTHETIC"} · ${equipment.model ?? equipment.name}`,
      ...Object.entries(equipment)
        .filter(([key, value]) => typeof value === "number" || value === null)
        .map(
          ([key, value]) =>
            reportLine`${key}: ${value ?? "UNKNOWN"} ${equipment.units?.[key] ?? ""}`,
        ),
      ...("mppts" in equipment
        ? equipment.mppts.flatMap((mppt) => [
            reportLine`MPPT ${mppt.id}: ${mppt.min_voltage_v}–${mppt.max_voltage_v} V; Imp ${mppt.max_current_a ?? "UNKNOWN"} A; Isc ${mppt.max_isc_a ?? "UNKNOWN"} A; physical inputs ${mppt.inputs ?? "UNKNOWN"}`,
            reportLine`max_current_per_input_a: ${mppt.max_current_per_input_a ?? "UNKNOWN"} A; max_isc_per_input_a: ${mppt.max_isc_per_input_a ?? "UNKNOWN"} A`,
          ])
        : []),
      ...(equipment.data_notes ?? []).map((note) => reportLine`- ${note}`),
      ...equipment.sources.map(
        (source) =>
          reportLine`- ${source.verification} · ${source.label} · ${source.url ?? "UNKNOWN URL"} · ${source.reviewed_on ?? "UNKNOWN DATE"} · ${source.document_revision ?? "UNKNOWN REVISION"} · ${source.locator ?? ""} · ${source.notes ?? ""}`,
      ),
    ]),
    ...(p.dc_switch_device
      ? [
          reportLine`\n## ${uk ? "Кандидат DC-роз’єднувача" : "DC switch-disconnector candidate"}`,
          reportText(JSON.stringify(p.dc_switch_device)),
          reportText(JSON.stringify(p.dc_switch_context ?? "UNKNOWN context")),
        ]
      : []),
    ...(p.spd_device
      ? [
          reportLine`\n## ${uk ? "Кандидат SPD" : "SPD candidate"}`,
          reportText(JSON.stringify(p.spd_device)),
          reportText(JSON.stringify(p.spd_context ?? "UNKNOWN context")),
        ]
      : []),
    ...(p.string_fuse_device
      ? [
          reportLine`\n## ${uk ? "Кандидат запобіжника" : "Fuse candidate"}`,
          reportText(JSON.stringify(p.string_fuse_device)),
        ]
      : []),
    reportLine`\n## ${uk ? "Кабельні дані та derating" : "Cable data and derating"}`,
    ...p.cables.flatMap((cable) => [
      reportLine`${cable.manufacturer ?? "SYNTHETIC / USER INPUT"} ${cable.model ?? cable.name}; R20=${cable.r20_ohm_km ?? "UNKNOWN"} Ω/km; α=${cable.alpha_per_c ?? "UNKNOWN"} 1/°C; X=${cable.x_ohm_km ?? "UNKNOWN"} Ω/km; Iz=${cable.iz_a ?? "UNKNOWN"} A`,
      reportText(cable.installation_basis),
      reportLine`Ampacity reference: ${JSON.stringify(cable.ampacity_reference ?? "UNKNOWN")}`,
      ...(cable.data_notes ?? []).map(reportText),
      ...cable.sources.map(
        (source) =>
          reportLine`${source.verification} · ${source.url ?? source.label} · ${source.reviewed_on ?? "UNKNOWN DATE"}`,
      ),
    ]),
    ...(["dc", "ac"] as const).map(
      (side) => reportLine`${side.toUpperCase()}: ${JSON.stringify(p[side])}`,
    ),
    reportLine`\n## ${uk ? "Кабельні траси" : "Cable routes"}`,
    ...result.dc_lines.map(
      (line) =>
        reportLine`DC ${line.string_id} · ${line.input_origin} · ${JSON.stringify(line.circuit_input)}`,
    ),
    ...result.ac_lines.map(
      (line) =>
        reportLine`AC INV${line.inverter} · ${line.input_origin} · ${JSON.stringify(line.circuit_input)} · cable=${line.cable.selected?.cable.id ?? "UNKNOWN"}`,
    ),
    reportLine`Cable BOM omitted routes: ${result.cable_bom.omitted_routes}; unresolved DC layout: ${result.cable_bom.unresolved_dc_layout}`,
    reportLine`Saved DC routes: ${JSON.stringify(p.dc_routes ?? [])}`,
    reportLine`Saved AC routes: ${JSON.stringify(p.ac_routes ?? [])}`,
    ...cableCandidateAudit(result, uk),
    reportLine`\n## ${uk ? "Стрінги" : "Strings"}`,
    "| ID | Inverter | MPPT | Plane | Modules |",
    "|---|---:|---|---|---:|",
    ...result.strings.map(
      (s) =>
        reportLine`| ${s.id} | ${s.inverter} | ${s.mppt_id} | ${s.plane_id} | ${s.modules} |`,
    ),
    reportLine`\n## ${uk ? "Перевірки" : "Checks"}`,
    ...result.checks.map(
      (c) =>
        reportLine`- ${c.status} · ${c.id}: ${c.demand ?? "?"} / ${c.capacity ?? "?"} ${c.unit} — ${c.basis}${c.missing.length ? " · missing: " + c.missing.join(", ") : ""}`,
    ),
    `\n## BOM`,
    "| Item | Quantity | Unit | Basis |",
    "|---|---:|---|---|",
    ...result.bom.map(
      (x) => reportLine`| ${x.item} | ${x.quantity} | ${x.unit} | ${x.basis} |`,
    ),
    "\n## Scope",
    uk
      ? "AC — окремий фідер кожного інвертора з власними умовами траси. DC — окремий кабель кожного стрінгу. Джерела обладнання наведено вище; навчальні policies та непідтверджені кабельні дані не є нормативним погодженням. Повна нормативна перевірка захисту, SPD, заземлення та проєктне погодження не виконані."
      : "AC is one independently assessed feeder per inverter; DC is one route per string. Equipment sources are listed above; teaching policies and unverified ampacity do not establish regulatory compliance. Full protection, SPD, earthing and regulatory review not completed.",
  ].join("\n");
}
