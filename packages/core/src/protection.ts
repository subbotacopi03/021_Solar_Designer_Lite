import type {
  ElectricalPolicy,
  EngineeringCheck,
  StringFuseDevice,
} from "../../schema/src/index.js";
import { check, finding } from "./checks.js";
export function standardRatingAtLeast(
  series: readonly number[],
  value: number,
) {
  if (!Number.isFinite(value) || value <= 0)
    throw new RangeError("Invalid design current");
  return [...series].sort((a, b) => a - b).find((x) => x >= value) ?? null;
}
export function selectStringFuse(
  policy: ElectricalPolicy,
  input: {
    isc_a: number;
    parallel_strings: number;
    max_series_fuse_a: number | null | undefined;
    reverse_current_withstand_a?: number | null;
    inverter_backfeed_a?: number | null;
    voc_cold_v: number | null;
    device?: StringFuseDevice;
  },
): {
  required: boolean | null;
  rating_a: number | null;
  reverse_a: number | null;
  checks: EngineeringCheck[];
} {
  const arrayReverse =
    input.parallel_strings === 1
      ? 0
      : policy.isc_factor == null
        ? null
        : (input.parallel_strings - 1) * input.isc_a * policy.isc_factor;
  const reverse =
    arrayReverse == null || input.inverter_backfeed_a == null
      ? null
      : arrayReverse + input.inverter_backfeed_a;
  const knownLowerBound =
    (arrayReverse ?? 0) + (input.inverter_backfeed_a ?? 0);
  const checks: EngineeringCheck[] = [];
  const device = input.device;
  if (device) {
    checks.push(
      finding(
        "FUSE_FAMILY",
        device.family === "gPV" ? "PASS" : "FAIL",
        "Candidate must be a photovoltaic gPV fuse; no substitution by current rating alone",
      ),
      check(
        "FUSE_DC_VOLTAGE",
        input.voc_cold_v,
        device.rated_dc_voltage_v,
        "V",
        "Cold string voltage ≤ declared fuse DC voltage",
        ["voc_cold_v", "rated_dc_voltage_v"],
      ),
      check(
        "FUSE_BREAKING_CAPACITY",
        reverse ??
          (device.breaking_capacity_a != null &&
          knownLowerBound > device.breaking_capacity_a
            ? knownLowerBound
            : null),
        device.breaking_capacity_a,
        "A",
        "Full reverse contribution ≤ device DC breaking capacity; a known nonnegative contribution lower bound can prove FAIL but not PASS",
        ["reverse_current", "breaking_capacity_a"],
      ),
      finding(
        "FUSE_COORDINATION",
        "UNKNOWN",
        "Nominal checks do not prove fault clearing, time-current coordination, holder/pole suitability or total clearing energy",
        [
          "time_current_curves",
          "fault_duration",
          "holder_and_poles",
          "cable_withstand",
        ],
      ),
    );
    checks.push(
      check(
        "FUSE_MODULE_MAX",
        device.rated_current_a,
        input.max_series_fuse_a,
        "A",
        "Supplied In ≤ module maximum series fuse, independent of necessity",
        ["max_series_fuse_a"],
      ),
      check(
        "FUSE_MIN_RATING",
        device.rated_current_a,
        policy.fuse_min_factor == null
          ? null
          : policy.fuse_min_factor * input.isc_a,
        "A",
        "Supplied In ≥ explicit policy lower bound",
        ["fuse_min_factor"],
        "min",
      ),
      check(
        "FUSE_RATING",
        device.rated_current_a,
        policy.fuse_max_factor == null
          ? null
          : policy.fuse_max_factor * input.isc_a,
        "A",
        "Supplied In ≤ explicit policy upper bound",
        ["fuse_max_factor"],
      ),
    );
    if (
      !device.sources.length ||
      device.sources.some((s) => s.verification !== "VERIFIED")
    )
      checks.push(
        finding(
          "FUSE_SOURCE",
          "WARN",
          "Device ratings require manufacturer evidence",
        ),
      );
    for (const c of checks) c.source_ids = device.sources.map((s) => s.id);
  }
  if (reverse == null)
    return {
      required: null,
      rating_a: null,
      reverse_a: null,
      checks: [
        ...checks,
        finding(
          "FUSE_REQUIREMENT",
          "UNKNOWN",
          "No zero-backfeed assumption; total reverse current requires explicit array factor and inverter backfeed",
          [
            ...(arrayReverse == null ? ["isc_factor"] : []),
            ...(input.inverter_backfeed_a == null
              ? ["inverter_backfeed_a"]
              : []),
          ],
        ),
      ],
    };
  if (reverse === 0)
    return {
      required: false,
      rating_a: null,
      reverse_a: 0,
      checks: [
        ...checks,
        finding(
          "FUSE_REQUIREMENT",
          "NOT_APPLICABLE",
          "Zero array and explicitly declared inverter backfeed; limited reverse-current assessment only",
        ),
      ],
    };
  if (input.reverse_current_withstand_a == null)
    return {
      required: null,
      rating_a: null,
      reverse_a: reverse,
      checks: [
        ...checks,
        finding(
          "FUSE_REQUIREMENT",
          "UNKNOWN",
          "Maximum series fuse rating cannot substitute module reverse-current withstand",
          ["reverse_current_withstand_a"],
        ),
      ],
    };
  const required = reverse > input.reverse_current_withstand_a;
  if (!required)
    return {
      required: false,
      rating_a: null,
      reverse_a: reverse,
      checks: [
        ...checks,
        check(
          "FUSE_REQUIREMENT",
          reverse,
          input.reverse_current_withstand_a,
          "A",
          "Combined array and inverter reverse current ≤ explicitly declared module withstand",
        ),
      ],
    };
  if (
    policy.fuse_min_factor == null ||
    policy.fuse_max_factor == null ||
    input.max_series_fuse_a == null
  )
    return {
      required: true,
      rating_a: null,
      reverse_a: reverse,
      checks: [
        ...checks,
        finding(
          "FUSE_RATING",
          "UNKNOWN",
          "Fuse policy or module series-fuse rating missing",
          ["fuse_factors", "max_series_fuse_a"],
        ),
      ],
    };
  const min = policy.fuse_min_factor * input.isc_a;
  const max = Math.min(
    policy.fuse_max_factor * input.isc_a,
    input.max_series_fuse_a,
  );
  const rating =
    device?.rated_current_a ??
    standardRatingAtLeast(policy.fuse_ratings_a, min);
  if (!device)
    checks.push(
      check(
        "FUSE_MIN_RATING",
        rating,
        min,
        "A",
        "Explicit lower fuse factor",
        [],
        "min",
      ),
      check(
        "FUSE_RATING",
        rating,
        max,
        "A",
        "Explicit policy upper bound and module maximum series-fuse rating",
      ),
    );
  if (rating == null)
    checks.push(
      finding(
        "FUSE_RATING_AVAILABLE",
        "FAIL",
        "No rating available inside explicit fuse range",
      ),
    );
  return {
    required: true,
    rating_a: rating != null && rating >= min && rating <= max ? rating : null,
    reverse_a: reverse,
    checks,
  };
}
export function selectDcIsolator(policy: ElectricalPolicy, isc: number) {
  return policy.isc_factor == null
    ? null
    : standardRatingAtLeast(policy.isolator_ratings_a, isc * policy.isc_factor);
}
export function checkBreakingCapacity(
  icu: number | null | undefined,
  ik: number | null | undefined,
) {
  return check(
    "AC_BREAKING_CAPACITY",
    ik,
    icu,
    "kA",
    "Prospective fault current ≤ device Icu at actual system voltage",
    ["prospective_short_circuit_ka", "breaker_icu_ka"],
  );
}
export function spdAssessment() {
  return finding(
    "SPD",
    "UNKNOWN",
    "SPD topology requires earthing system, LPS separation, routing, impulse current and manufacturer coordination. No automatic T1/T2 verdict.",
    ["earthing_system", "lps_separation", "spd_coordination"],
  );
}
