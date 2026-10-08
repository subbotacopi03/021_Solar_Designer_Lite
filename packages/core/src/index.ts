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
  // AC route is one identical feeder per inverter; never the aggregate plant feeder.
  const ac = sizeCable(p.cables, {
    ...p.ac,
    circuit: p.inverter.phases === 3 ? "AC3" : "AC1",
    ib_a: acCurrent,
    in_a: breaker,
    length_m: p.ac.length_m,
    voltage_v: p.inverter.ac_voltage_v,
    required_voltage_v: p.inverter.ac_voltage_v,
    conductor_temp_c: p.ac.conductor_temp_c,
    derating_factor: p.ac.derating_factor,
    derating_basis: p.ac.derating_basis,
    drop_limit_pct: p.policy.ac_drop_max_pct,
    cos_phi: p.site.cos_phi,
  });
  checks.push(
    ...ac.checks,
    checkBreakingCapacity(p.breaker_icu_ka, p.prospective_short_circuit_ka),
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
    const cable = sizeCable(p.cables, {
      ...p.dc,
      circuit: "DC",
      ib_a: ib,
      in_a: fuse.required === null ? null : (fuse.rating_a ?? ib),
      length_m: p.dc.length_m,
      voltage_v: vmp,
      required_voltage_v: voc,
      conductor_temp_c: p.dc.conductor_temp_c,
      derating_factor: p.dc.derating_factor,
      derating_basis: p.dc.derating_basis,
      drop_limit_pct: p.policy.dc_drop_max_pct,
    });
    checks.push(
      ...fuse.checks.map((c) => ({ ...c, id: row.id + ":" + c.id })),
      ...cable.checks.map((c) => ({ ...c, id: row.id + ":" + c.id })),
    );
    return {
      string_id: row.id,
      voc_cold_v: voc,
      vmp_hot_v: vmp,
      ib_a: ib,
      fuse,
      isolator_a: selectDcIsolator(p.policy, p.module.isc_a),
      cable,
    };
  });
  checks.push(
    spdAssessment(),
    finding(
      "PROTECTION_SCOPE",
      "UNKNOWN",
      "Full protection design remains outside v0.1: I2 ≤ 1.45 Iz, disconnection time, adiabatic withstand, RCD, DC switch utilization category and inverter backfeed",
      ["device_curves", "fault_loop", "earthing_system", "backfeed"],
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
  const cableQty = new Map<string, number>();
  for (const line of dcLines)
    if (line.cable.selected && p.dc.length_m != null) {
      const id = line.cable.selected.cable.id;
      cableQty.set(id, (cableQty.get(id) ?? 0) + 2 * p.dc.length_m);
    }
  if (ac.selected && p.ac.length_m != null)
    cableQty.set(
      ac.selected.cable.id,
      (cableQty.get(ac.selected.cable.id) ?? 0) +
        p.ac.length_m * p.inverter_quantity,
    );
  for (const [id, quantity] of cableQty)
    bom.push({
      item: id,
      quantity,
      unit: "m",
      basis: id.startsWith("dc")
        ? "Two separate conductors per DC string; no reserve"
        : "One multicore feeder per inverter; no reserve",
    });
  const isolators = new Map<number, number>(),
    fuses = new Map<number, number>();
  for (const line of dcLines) {
    if (line.isolator_a != null)
      isolators.set(line.isolator_a, (isolators.get(line.isolator_a) ?? 0) + 1);
    if (line.fuse.rating_a != null)
      fuses.set(line.fuse.rating_a, (fuses.get(line.fuse.rating_a) ?? 0) + 1);
  }
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
  return {
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
    checks,
    bom,
  };
}
export type ProjectResult = ReturnType<typeof calculateProject>;
export function projectReport(
  p: Project,
  result: ProjectResult,
  language: "uk" | "en" = "uk",
) {
  const uk = language === "uk";
  return [
    `# ${p.name}`,
    `${uk ? "Попередній електричний розрахунок" : "Preliminary electrical calculation"} · OpenPV ${ENGINE_VERSION}`,
    `Status: ${result.status}`,
    `Modules: ${result.installed_modules}/${result.requested_modules}`,
    `DC: ${(result.dc_power_w / 1000).toFixed(3)} kWp · AC: ${(result.ac_power_w / 1000).toFixed(3)} kW · DC/AC: ${result.dc_ac_ratio.toFixed(4)}`,
    `Tmin cell: ${p.site.t_min_cell_c ?? "UNKNOWN"} °C · Tmax cell: ${p.site.t_max_cell_c ?? "UNKNOWN"} °C`,
    `\n## ${uk ? "Обладнання та джерела" : "Equipment and sources"}`,
    ...([p.module, p.inverter] as const).flatMap((equipment) => [
      `### ${equipment.manufacturer ?? "USER INPUT / SYNTHETIC"} · ${equipment.model ?? equipment.name}`,
      ...Object.entries(equipment)
        .filter(([key, value]) => typeof value === "number" || value === null)
        .map(
          ([key, value]) =>
            `${key}: ${value ?? "UNKNOWN"} ${equipment.units?.[key] ?? ""}`,
        ),
      ...("mppts" in equipment
        ? equipment.mppts.flatMap((mppt) => [
            `MPPT ${mppt.id}: ${mppt.min_voltage_v}–${mppt.max_voltage_v} V; Imp ${mppt.max_current_a ?? "UNKNOWN"} A; Isc ${mppt.max_isc_a ?? "UNKNOWN"} A; physical inputs ${mppt.inputs ?? "UNKNOWN"}`,
            `max_current_per_input_a: ${mppt.max_current_per_input_a ?? "UNKNOWN"} A; max_isc_per_input_a: ${mppt.max_isc_per_input_a ?? "UNKNOWN"} A`,
          ])
        : []),
      ...(equipment.data_notes ?? []).map((note) => `- ${note}`),
      ...equipment.sources.map(
        (source) =>
          `- ${source.verification} · ${source.label} · ${source.url ?? "UNKNOWN URL"} · ${source.reviewed_on ?? "UNKNOWN DATE"} · ${source.document_revision ?? "UNKNOWN REVISION"} · ${source.locator ?? ""} · ${source.notes ?? ""}`,
      ),
    ]),
    ...(p.string_fuse_device
      ? [
          `\n## ${uk ? "Кандидат запобіжника" : "Fuse candidate"}`,
          JSON.stringify(p.string_fuse_device),
        ]
      : []),
    `\n## ${uk ? "Кабельні дані та derating" : "Cable data and derating"}`,
    ...p.cables.flatMap((cable) => [
      `${cable.manufacturer ?? "SYNTHETIC / USER INPUT"} ${cable.model ?? cable.name}; R20=${cable.r20_ohm_km ?? "UNKNOWN"} Ω/km; α=${cable.alpha_per_c ?? "UNKNOWN"} 1/°C; X=${cable.x_ohm_km ?? "UNKNOWN"} Ω/km; Iz=${cable.iz_a ?? "UNKNOWN"} A`,
      cable.installation_basis,
      ...(cable.data_notes ?? []),
      ...cable.sources.map(
        (source) =>
          `${source.verification} · ${source.url ?? source.label} · ${source.reviewed_on ?? "UNKNOWN DATE"}`,
      ),
    ]),
    ...(["dc", "ac"] as const).map(
      (side) => `${side.toUpperCase()}: ${JSON.stringify(p[side])}`,
    ),
    `\n## ${uk ? "Стрінги" : "Strings"}`,
    "| ID | Inverter | MPPT | Plane | Modules |",
    "|---|---:|---|---|---:|",
    ...result.strings.map(
      (s) =>
        `| ${s.id} | ${s.inverter} | ${s.mppt_id} | ${s.plane_id} | ${s.modules} |`,
    ),
    `\n## ${uk ? "Перевірки" : "Checks"}`,
    ...result.checks.map(
      (c) =>
        `- ${c.status} · ${c.id}: ${c.demand ?? "?"} / ${c.capacity ?? "?"} ${c.unit} — ${c.basis}${c.missing.length ? " · missing: " + c.missing.join(", ") : ""}`,
    ),
    `\n## BOM`,
    "| Item | Quantity | Unit | Basis |",
    "|---|---:|---|---|",
    ...result.bom.map(
      (x) => `| ${x.item} | ${x.quantity} | ${x.unit} | ${x.basis} |`,
    ),
    "\n## Scope",
    uk
      ? "AC — окремий однаковий фідер кожного інвертора. DC — окремий кабель кожного стрінгу. Джерела обладнання наведено вище; навчальні policies та непідтверджені кабельні дані не є нормативним погодженням. Повна нормативна перевірка захисту, SPD, заземлення та проєктне погодження не виконані."
      : "AC is one identical feeder per inverter; DC is one route per string. Equipment sources are listed above; teaching policies and unverified ampacity do not establish regulatory compliance. Full protection, SPD, earthing and regulatory review not completed.",
  ].join("\n");
}
