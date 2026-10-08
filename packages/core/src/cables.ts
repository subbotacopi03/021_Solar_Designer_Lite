import type {
  Cable,
  EngineeringCheck,
  CircuitInput,
} from "../../schema/src/index.js";
import { resistanceAtTemperature, voltageDropV } from "./fundamentals.js";
import { check, finding, overall } from "./checks.js";
export type CableInput = Pick<
  CircuitInput,
  | "installation_method"
  | "ambient_temp_c"
  | "grouped_circuits"
  | "derating_evidence"
> & {
  circuit: "DC" | "AC1" | "AC3";
  ib_a: number | null;
  in_a: number | null;
  length_m: number | null | undefined;
  voltage_v: number | null;
  required_voltage_v: number | null;
  conductor_temp_c: number | null | undefined;
  derating_factor: number | null | undefined;
  derating_basis: string | null | undefined;
  drop_limit_pct: number | null | undefined;
  cos_phi?: number | null;
};
export function evaluateCable(cable: Cable, input: CableInput) {
  const missing: string[] = [];
  for (const [k, v] of Object.entries({
    ib_a: input.ib_a,
    length_m: input.length_m,
    voltage_v: input.voltage_v,
    conductor_temp_c: input.conductor_temp_c,
    ...(!input.derating_evidence
      ? {
          derating_factor: input.derating_factor,
          derating_basis: input.derating_basis,
        }
      : {}),
    r20_ohm_km: cable.r20_ohm_km,
    alpha_per_c: cable.alpha_per_c,
    iz_a: cable.iz_a,
    in_a: input.in_a,
    drop_limit_pct: input.drop_limit_pct,
    required_voltage_v: input.required_voltage_v,
  }))
    if (v == null) missing.push(k);
  if (input.circuit !== "DC") {
    if (input.cos_phi == null) missing.push("cos_phi");
    if (cable.x_ohm_km == null) missing.push("x_ohm_km");
  }
  const r =
    input.conductor_temp_c == null ||
    cable.r20_ohm_km == null ||
    cable.alpha_per_c == null
      ? null
      : resistanceAtTemperature(
          cable.r20_ohm_km,
          cable.alpha_per_c,
          input.conductor_temp_c,
        );
  const drop =
    r == null || input.ib_a == null || input.length_m == null
      ? null
      : voltageDropV({
          circuit: input.circuit,
          current_a: input.ib_a,
          length_m: input.length_m,
          r_ohm_km: r,
          cos_phi: input.cos_phi,
          x_ohm_km: cable.x_ohm_km,
        });
  const pct =
    drop == null || input.voltage_v == null
      ? null
      : (drop / input.voltage_v) * 100;
  const evidence = input.derating_evidence;
  const factors = evidence
    ? [evidence.temperature, evidence.grouping, evidence.installation]
    : [];
  const factor = evidence
    ? factors.every((e) => e.factor != null)
      ? factors.reduce((product, e) => product * e.factor!, 1)
      : null
    : input.derating_factor;
  const iz = cable.iz_a == null || factor == null ? null : cable.iz_a * factor;
  const checks: EngineeringCheck[] = [
    check(cable.id + ":IB_IN", input.ib_a, input.in_a, "A", "Ib ≤ In", missing),
    check(
      cable.id + ":IN_IZ",
      input.in_a,
      iz,
      "A",
      "In ≤ Iz × kT × kg",
      missing,
    ),
    check(
      cable.id + ":DROP",
      pct,
      input.drop_limit_pct,
      "%",
      "One-way route; R at design conductor temperature",
      missing,
    ),
    check(
      cable.id + ":VOLTAGE",
      input.required_voltage_v,
      cable.max_voltage_v,
      "V",
      "Rated voltage; confirm conductor-to-earth arrangement",
      ["max_voltage_v", "required_voltage_v"],
    ),
    check(
      cable.id + ":TEMPERATURE",
      input.conductor_temp_c,
      cable.max_conductor_temp_c,
      "°C",
      "Cable temperature rating",
      ["max_conductor_temp_c"],
    ),
  ];
  if (evidence) {
    const applies = evidence.applies_to;
    const applicable =
      applies != null &&
      applies.cable_id === cable.id &&
      applies.reference_iz_a === cable.iz_a &&
      JSON.stringify(applies.reference) ===
        JSON.stringify(cable.ampacity_reference ?? null) &&
      applies.installation_method === input.installation_method &&
      applies.ambient_temp_c === input.ambient_temp_c &&
      applies.conductor_temp_c === input.conductor_temp_c &&
      applies.grouped_circuits === input.grouped_circuits;
    checks.push(
      finding(
        cable.id + ":DERATING_APPLICABILITY",
        applicable ? "PASS" : "UNKNOWN",
        "Factors apply only to the explicit cable/reference and exact actual conditions; changed conditions require new evidence",
        applicable ? [] : ["applicable_derating_snapshot"],
      ),
    );
    if (factor == null) missing.push("derating_evidence.factors");
    if (
      factors.some(
        (e) =>
          !e.sources.length ||
          e.sources.some((s) => s.verification !== "VERIFIED"),
      )
    )
      missing.push("verified_derating_sources");
    if (input.derating_factor != null && factor != null)
      checks.push(
        finding(
          cable.id + ":DERATING_PRODUCT",
          Math.abs(input.derating_factor - factor) <= 1e-9 ? "PASS" : "FAIL",
          "Explicit aggregate factor must equal the sourced temperature × grouping × installation product",
        ),
      );
  }
  const reference = cable.ampacity_reference;
  if (reference) {
    const profileMissing: string[] = [];
    for (const [key, value] of Object.entries({
      installation_method: input.installation_method,
      ambient_temp_c: input.ambient_temp_c,
      grouped_circuits: input.grouped_circuits,
      derating_evidence: evidence,
      reference_ambient_temp_c: reference.ambient_temp_c,
      reference_conductor_temp_c: reference.conductor_temp_c,
      reference_grouped_circuits: reference.grouped_circuits,
    }))
      if (value == null) profileMissing.push(key);
    if (input.installation_method !== reference.installation_method)
      profileMissing.push("applicable_installation_method");
    if (
      reference.conductor_temp_c != null &&
      input.conductor_temp_c !== reference.conductor_temp_c
    )
      profileMissing.push("conductor_temperature_ampacity_profile");
    if (
      !reference.sources.length ||
      reference.sources.some((s) => s.verification !== "VERIFIED")
    )
      profileMissing.push("verified_ampacity_reference_sources");
    checks.push(
      finding(
        cable.id + ":INSTALLATION_PROFILE",
        profileMissing.length ? "UNKNOWN" : "PASS",
        "Ampacity reference applicability: method, ambient, conductor temperature and grouping; no implicit factors",
        profileMissing,
      ),
    );
  }
  if (missing.length)
    checks.push(
      finding(cable.id + ":DATA", "UNKNOWN", "Missing circuit data", missing),
    );
  if (
    !cable.sources.length ||
    cable.sources.some((s) => s.verification !== "VERIFIED")
  )
    checks.push(
      finding(
        cable.id + ":PROVENANCE",
        "WARN",
        "Catalog ampacity is preliminary; verify datasheet and installation method",
      ),
    );
  for (const c of checks)
    c.source_ids = [
      ...new Set(
        [
          ...cable.sources,
          ...(reference?.sources ?? []),
          ...factors.flatMap((e) => e.sources),
        ].map((s) => s.id),
      ),
    ];
  return {
    cable,
    checks,
    status: overall(checks),
    r_ohm_km: r,
    drop_v: drop,
    drop_pct: pct,
    iz_derated_a: iz,
  };
}
export function sizeCable(catalog: Cable[], input: CableInput) {
  const candidates = catalog
    .filter((c) => c.circuit === (input.circuit === "DC" ? "DC" : "AC"))
    .sort((a, b) => a.section_mm2 - b.section_mm2 || a.id.localeCompare(b.id))
    .map((c) => evaluateCable(c, input));
  const selected =
    candidates.find((c) => c.status === "PASS" || c.status === "WARN") ?? null;
  const checks = selected?.checks ?? [
    finding(
      "CABLE_SELECTION",
      candidates.some((c) => c.status === "UNKNOWN") || !candidates.length
        ? "UNKNOWN"
        : "FAIL",
      "No proven single-run candidate; no automatic parallel cables",
      !candidates.length ? ["cable_catalog"] : [],
    ),
  ];
  return { selected, candidates, checks };
}
