import { check, finding } from "./checks.js";
export function standardRatingAtLeast(series, value) {
    if (!Number.isFinite(value) || value <= 0)
        throw new RangeError("Invalid design current");
    return [...series].sort((a, b) => a - b).find((x) => x >= value) ?? null;
}
export function selectStringFuse(policy, input) {
    const reverse = (input.parallel_strings - 1) * input.isc_a;
    // Maximum series fuse rating is NOT a declared reverse-current withstand rating.
    if (input.parallel_strings === 1)
        return {
            required: false,
            rating_a: null,
            reverse_a: reverse,
            checks: [
                finding("FUSE_REQUIREMENT", "NOT_APPLICABLE", "Single string; only array backfeed considered, inverter backfeed must be checked separately"),
            ],
        };
    if (input.reverse_current_withstand_a == null)
        return {
            required: null,
            rating_a: null,
            reverse_a: reverse,
            checks: [
                finding("FUSE_REQUIREMENT", "UNKNOWN", "Maximum series fuse rating cannot substitute reverse-current withstand", ["reverse_current_withstand_a", "inverter_backfeed"]),
            ],
        };
    const required = reverse > input.reverse_current_withstand_a;
    if (!required)
        return {
            required,
            rating_a: null,
            reverse_a: reverse,
            checks: [
                finding("FUSE_REQUIREMENT", "PASS", "Array reverse current below explicitly declared withstand; inverter backfeed excluded"),
            ],
        };
    if (policy.fuse_min_factor == null ||
        policy.fuse_max_factor == null ||
        input.max_series_fuse_a == null)
        return {
            required,
            rating_a: null,
            reverse_a: reverse,
            checks: [
                finding("FUSE_RATING", "UNKNOWN", "Fuse policy or module rating missing", ["fuse_factors", "max_series_fuse_a"]),
            ],
        };
    const min = policy.fuse_min_factor * input.isc_a, max = Math.min(policy.fuse_max_factor * input.isc_a, input.max_series_fuse_a), rating = standardRatingAtLeast(policy.fuse_ratings_a, min);
    return {
        required,
        rating_a: rating != null && rating <= max ? rating : null,
        reverse_a: reverse,
        checks: [
            rating == null || rating > max
                ? finding("FUSE_RATING", "FAIL", "No standard rating inside explicit fuse range")
                : check("FUSE_RATING", rating, max, "A", "Explicit policy range; manufacturer confirmation required"),
        ],
    };
}
export function selectDcIsolator(policy, isc) {
    return policy.isc_factor == null
        ? null
        : standardRatingAtLeast(policy.isolator_ratings_a, isc * policy.isc_factor);
}
export function checkBreakingCapacity(icu, ik) {
    return check("AC_BREAKING_CAPACITY", ik, icu, "kA", "Prospective fault current ≤ device Icu at actual system voltage", ["prospective_short_circuit_ka", "breaker_icu_ka"]);
}
export function spdAssessment() {
    return finding("SPD", "UNKNOWN", "SPD topology requires earthing system, LPS separation, routing, impulse current and manufacturer coordination. No automatic T1/T2 verdict.", ["earthing_system", "lps_separation", "spd_coordination"]);
}
//# sourceMappingURL=protection.js.map