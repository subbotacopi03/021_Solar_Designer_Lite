export function check(id, demand, capacity, unit, basis, missing = [], direction = "max", sources = []) {
    const d = demand ?? null, c = capacity ?? null;
    const known = d !== null && c !== null && Number.isFinite(d) && Number.isFinite(c);
    return {
        id,
        status: known
            ? (direction === "max" ? d <= c + 1e-9 : d + 1e-9 >= c)
                ? "PASS"
                : "FAIL"
            : "UNKNOWN",
        demand: d,
        capacity: c,
        unit,
        utilization: known && c !== 0 ? d / c : null,
        missing: known ? [] : missing,
        basis,
        source_ids: sources,
        message_key: id,
    };
}
export function finding(id, status, basis, missing = []) {
    return {
        id,
        status,
        demand: null,
        capacity: null,
        unit: "",
        utilization: null,
        missing,
        basis,
        source_ids: [],
        message_key: id,
    };
}
export function overall(checks) {
    for (const s of ["FAIL", "UNKNOWN", "WARN"])
        if (checks.some((c) => c.status === s))
            return s;
    return "PASS";
}
//# sourceMappingURL=checks.js.map