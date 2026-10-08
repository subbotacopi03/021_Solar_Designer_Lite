import type {
  DcSwitchDevice,
  DcSwitchContext,
  EngineeringCheck,
} from "../../schema/src/index.js";
import { check, finding } from "./checks.js";
/** Necessary nominal checks, explicitly per string; not protective-device coordination. */
export function assessDcSwitchCandidate(input: {
  device: DcSwitchDevice;
  context?: DcSwitchContext;
  voc_cold_v: number | null;
  design_current_a: number | null;
}): EngineeringCheck[] {
  const d = input.device,
    c = input.context;
  const profile = d.profiles.find((p) => p.id === c?.rating_id);
  const perString = c?.scope === "PER_STRING" && profile?.circuits === 1;
  const knownDemand = (
    value: number | null,
    capacity: number | null | undefined,
  ) =>
    perString || (value != null && capacity != null && value > capacity + 1e-9)
      ? value
      : null;
  const checks = [
    finding(
      "DC_SWITCH_PROFILE",
      profile ? "PASS" : "UNKNOWN",
      "Explicit manufacturer operational profile; no use of Ui/Ith or model name",
      profile ? [] : ["rating_id"],
    ),
    finding(
      "DC_SWITCH_TOPOLOGY",
      perString ? "PASS" : "UNKNOWN",
      "Only separately installed per-string, single-circuit candidate supported; no inferred combiner current",
      perString ? [] : ["per_string_single_circuit_topology"],
    ),
    check(
      "DC_SWITCH_VOLTAGE",
      knownDemand(input.voc_cold_v, profile?.operational_voltage_v),
      profile?.operational_voltage_v,
      "V DC",
      "Cold string Voc ≤ selected operational Ue; Ui is not Ue. A known single-string lower bound proves FAIL only under unknown topology",
      [
        "voc_cold_v",
        "operational_voltage_v",
        ...(!perString ? ["supported_topology"] : []),
      ],
    ),
    check(
      "DC_SWITCH_CURRENT",
      knownDemand(input.design_current_a, profile?.operational_current_a),
      profile?.operational_current_a,
      "A",
      "Explicit design Isc ≤ selected operational Ie; Ith is not Ie. A known single-string lower bound proves FAIL only under unknown topology",
      [
        "design_current_a",
        "operational_current_a",
        ...(!perString ? ["supported_topology"] : []),
      ],
    ),
    finding(
      "DC_SWITCH_CATEGORY",
      !profile || c?.required_category == null
        ? "UNKNOWN"
        : c.required_category === profile.utilization_category
          ? "PASS"
          : "FAIL",
      "Exact explicitly required category; no assumed equivalence between DC-21B/DC-PV1/DC-PV2",
      c?.required_category == null
        ? ["required_category"]
        : !profile
          ? ["rating_id"]
          : [],
    ),
    finding(
      "DC_SWITCH_WIRING",
      !profile || c?.wiring_diagram == null
        ? "UNKNOWN"
        : profile.wiring_diagrams.includes(c.wiring_diagram)
          ? "PASS"
          : "FAIL",
      "Explicit manufacturer circuit identifier, not inferred from pole count",
      c?.wiring_diagram == null
        ? ["wiring_diagram"]
        : !profile
          ? ["rating_id"]
          : [],
    ),
    finding(
      "DC_SWITCH_POLES",
      !profile || c?.poles == null
        ? "UNKNOWN"
        : c.poles === profile.poles
          ? "PASS"
          : "FAIL",
      "Declared installed pole count must match selected operational profile",
      c?.poles == null ? ["poles"] : !profile ? ["rating_id"] : [],
    ),
    finding(
      "DC_SWITCH_REQUIREMENT_SOURCE",
      c?.sources.length && c.sources.every((s) => s.verification === "VERIFIED")
        ? "PASS"
        : "UNKNOWN",
      "Installation/category requirement needs evidence; product rating does not establish national requirement",
      c?.sources.length && c.sources.every((s) => s.verification === "VERIFIED")
        ? []
        : ["verified_installation_requirement_sources"],
    ),
    finding(
      "DC_SWITCH_SCOPE",
      "UNKNOWN",
      "Ambient/enclosure/terminals/physical wiring, fault duration/Icw/Icm, reverse-current switching and upstream/national coordination not established. Switch Ie does not replace cable protective In.",
      [
        "installation_conditions",
        "physical_wiring_review",
        "fault_and_reverse_switching_coordination",
        "applicable_requirements",
      ],
    ),
  ];
  if (!d.sources.length || d.sources.some((s) => s.verification !== "VERIFIED"))
    checks.push(
      finding(
        "DC_SWITCH_SOURCE",
        "WARN",
        "Manufacturer operational profile requires evidence",
      ),
    );
  for (const check of checks)
    check.source_ids = [
      ...new Set([...d.sources, ...(c?.sources ?? [])].map((s) => s.id)),
    ];
  return checks;
}
