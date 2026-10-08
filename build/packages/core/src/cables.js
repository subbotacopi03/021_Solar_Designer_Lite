import { resistanceAtTemperature, voltageDropV } from "./fundamentals.js";
import { check, finding, overall } from "./checks.js";
export function evaluateCable(cable, input) {
    const missing = [];
    for (const [k, v] of Object.entries({
        ib_a: input.ib_a,
        length_m: input.length_m,
        voltage_v: input.voltage_v,
        conductor_temp_c: input.conductor_temp_c,
        derating_factor: input.derating_factor,
        derating_basis: input.derating_basis,
        iz_a: cable.iz_a,
        in_a: input.in_a,
        drop_limit_pct: input.drop_limit_pct,
        required_voltage_v: input.required_voltage_v,
    }))
        if (v == null)
            missing.push(k);
    if (input.circuit !== "DC") {
        if (input.cos_phi == null)
            missing.push("cos_phi");
        if (cable.x_ohm_km == null)
            missing.push("x_ohm_km");
    }
    const r = input.conductor_temp_c == null
        ? null
        : resistanceAtTemperature(cable.r20_ohm_km, cable.alpha_per_c, input.conductor_temp_c);
    const drop = r == null || input.ib_a == null || input.length_m == null
        ? null
        : voltageDropV({
            circuit: input.circuit,
            current_a: input.ib_a,
            length_m: input.length_m,
            r_ohm_km: r,
            cos_phi: input.cos_phi,
            x_ohm_km: cable.x_ohm_km,
        });
    const pct = drop == null || input.voltage_v == null
        ? null
        : (drop / input.voltage_v) * 100;
    const iz = cable.iz_a == null || input.derating_factor == null
        ? null
        : cable.iz_a * input.derating_factor;
    const checks = [
        check(cable.id + ":IB_IN", input.ib_a, input.in_a, "A", "Ib ≤ In", missing),
        check(cable.id + ":IN_IZ", input.in_a, iz, "A", "In ≤ Iz × kT × kg", missing),
        check(cable.id + ":DROP", pct, input.drop_limit_pct, "%", "One-way route; R at design conductor temperature", missing),
        check(cable.id + ":VOLTAGE", input.required_voltage_v, cable.max_voltage_v, "V", "Rated voltage; confirm conductor-to-earth arrangement", ["max_voltage_v", "required_voltage_v"]),
        check(cable.id + ":TEMPERATURE", input.conductor_temp_c, cable.max_conductor_temp_c, "°C", "Cable temperature rating", ["max_conductor_temp_c"]),
    ];
    if (missing.length)
        checks.push(finding(cable.id + ":DATA", "UNKNOWN", "Missing circuit data", missing));
    if (!cable.sources.length ||
        cable.sources.some((s) => s.verification !== "VERIFIED"))
        checks.push(finding(cable.id + ":PROVENANCE", "WARN", "Catalog ampacity is preliminary; verify datasheet and installation method"));
    for (const c of checks)
        c.source_ids = cable.sources.map((s) => s.id);
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
export function sizeCable(catalog, input) {
    const candidates = catalog
        .filter((c) => c.circuit === (input.circuit === "DC" ? "DC" : "AC"))
        .sort((a, b) => a.section_mm2 - b.section_mm2 || a.id.localeCompare(b.id))
        .map((c) => evaluateCable(c, input));
    const selected = candidates.find((c) => c.status === "PASS" || c.status === "WARN") ?? null;
    const checks = selected?.checks ?? [
        finding("CABLE_SELECTION", candidates.some((c) => c.status === "UNKNOWN") || !candidates.length
            ? "UNKNOWN"
            : "FAIL", "No proven single-run candidate; no automatic parallel cables", !candidates.length ? ["cable_catalog"] : []),
    ];
    return { selected, candidates, checks };
}
//# sourceMappingURL=cables.js.map