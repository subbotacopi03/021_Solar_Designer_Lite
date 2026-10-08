import type {
  EngineeringCheck,
  SpdDevice,
  SpdContext,
} from "../../schema/src/index.js";
import { check, finding } from "./checks.js";
/** Necessary device checks only. No LPS-driven type selection or compliance verdict. */
export function assessSpdCandidate(input: {
  device: SpdDevice;
  context?: SpdContext;
  voc_cold_v: number | null;
  voc_stc_v: number | null;
  prospective_current_a: number | null;
  known_current_lower_bound_a?: number | null;
}): EngineeringCheck[] {
  const d = input.device,
    c = input.context;
  const checks: EngineeringCheck[] = [
    check(
      "SPD_UCPV",
      input.voc_cold_v,
      d.ucpv_v,
      "V",
      "Cold string Voc ≤ declared assembly Ucpv",
      ["voc_cold_v", "ucpv_v"],
    ),
    check(
      "SPD_UOC_STC",
      input.voc_stc_v,
      d.max_uoc_stc_v,
      "V",
      "STC string Voc ≤ separately published UocSTC bound",
      ["voc_stc_v", "max_uoc_stc_v"],
    ),
    check(
      "SPD_ISCPV",
      input.prospective_current_a ??
        (input.known_current_lower_bound_a != null &&
        d.iscpv_a != null &&
        input.known_current_lower_bound_a > d.iscpv_a
          ? input.known_current_lower_bound_a
          : null),
      d.iscpv_a,
      "A",
      "Full short-circuit current ≤ IEC Iscpv; known nonnegative contribution lower bound proves FAIL only",
      ["prospective_current_a", "iscpv_a"],
    ),
    check(
      "SPD_UP",
      d.up_kv,
      c?.equipment_impulse_withstand_kv,
      "kV",
      "Necessary device-only Up ≤ equipment withstand; connection lead voltage not included",
      ["up_kv", "equipment_impulse_withstand_kv"],
    ),
    check(
      "SPD_IN_8_20",
      c?.required_in_8_20_ka,
      d.in_8_20_ka,
      "kA 8/20 µs",
      "Nominal discharge current against explicit sourced requirement",
      ["required_in_8_20_ka", "in_8_20_ka"],
    ),
  ];
  const compatible =
    c?.required_type === d.type ||
    (d.type === "T1+T2" && c?.required_type != null);
  checks.push(
    finding(
      "SPD_TYPE",
      c?.required_type == null ? "UNKNOWN" : compatible ? "PASS" : "FAIL",
      "Required type is explicit and sourced; LPS presence alone does not choose T1/T2",
      c?.required_type == null ? ["required_type"] : [],
    ),
  );
  if (c?.required_type === "T1" || c?.required_type === "T1+T2")
    checks.push(
      check(
        "SPD_IIMP_10_350",
        c.required_iimp_10_350_ka,
        d.iimp_10_350_ka,
        "kA 10/350 µs",
        "Lightning impulse rating; In/Imax 8/20 cannot substitute Iimp10/350",
        ["required_iimp_10_350_ka", "iimp_10_350_ka"],
      ),
    );
  checks.push(
    finding(
      "SPD_DC_SYSTEM",
      c?.dc_system == null
        ? "UNKNOWN"
        : d.pv_systems.includes(c.dc_system)
          ? "PASS"
          : "FAIL",
      "Declared PV DC system compatibility; detailed pole/earthing coordination still required",
      c?.dc_system == null ? ["dc_system"] : [],
    ),
  );
  const missing: string[] = [];
  for (const [key, value] of Object.entries({
    earthing_system: c?.earthing_system,
    dc_system: c?.dc_system,
    lps_present: c?.lps_present,
    connection_length_m: c?.connection_length_m,
    coordination_basis: c?.coordination_basis,
  }))
    if (value == null) missing.push(key);
  if (c?.lps_present !== false && c?.lps_separation_maintained == null)
    missing.push("lps_separation_maintained");
  if (
    !c?.requirement_sources.length ||
    c.requirement_sources.some((s) => s.verification !== "VERIFIED")
  )
    missing.push("verified_requirement_sources");
  checks.push(
    finding(
      "SPD_CONTEXT",
      missing.length ? "UNKNOWN" : "PASS",
      "Explicit installation context and requirement provenance; national standard approval not inferred",
      missing,
    ),
  );
  if (!d.sources.length || d.sources.some((s) => s.verification !== "VERIFIED"))
    checks.push(
      finding(
        "SPD_SOURCE",
        "WARN",
        "Manufacturer assembly ratings require source verification",
      ),
    );
  checks.push(
    finding(
      "SPD_SCOPE",
      "UNKNOWN",
      "Full routing/lead inductance, protected zones, impulse coordination, upstream protection, earthing and national requirements are not established",
      [
        "lead_voltage",
        "coordinated_installation",
        "applicable_standard_review",
      ],
    ),
  );
  for (const check of checks)
    check.source_ids = [
      ...new Set(
        [...d.sources, ...(c?.requirement_sources ?? [])].map((s) => s.id),
      ),
    ];
  return checks;
}
