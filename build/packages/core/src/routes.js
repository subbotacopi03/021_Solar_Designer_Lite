import { finding } from "./checks.js";
export function resolveDcRoute(p, target, currentPlan) {
    const route = p.dc_routes?.find((r) => r.target.id === target.id);
    if (!route)
        return {
            circuit_input: p.dc,
            input_origin: "COMMON",
            checks: [],
        };
    if (currentPlan.filter((s) => s.id === target.id).length !== 1)
        return {
            circuit_input: {},
            input_origin: "AMBIGUOUS_OVERRIDE",
            checks: [
                finding(`${target.id}:ROUTE_AMBIGUOUS`, "UNKNOWN", "Saved DC route target ID is not unique in current plan; fix duplicate string IDs before binding", ["unique_route_target"]),
            ],
        };
    const matches = ["id", "inverter", "mppt_id", "plane_id", "modules"].every((key) => route.target[key] === target[key]);
    return matches
        ? {
            circuit_input: route.circuit,
            input_origin: "OVERRIDE",
            checks: [],
        }
        : {
            circuit_input: {},
            input_origin: "STALE_OVERRIDE",
            checks: [
                finding(`${target.id}:ROUTE_STALE`, "UNKNOWN", "Saved route allocation snapshot differs from current string; explicit rebind or removal required", ["confirmed_route_target"]),
            ],
        };
}
export function resolveAcRoute(p, inverter) {
    const route = p.ac_routes?.find((r) => r.inverter === inverter);
    return {
        circuit_input: route ? route.circuit : p.ac,
        input_origin: route ? "OVERRIDE" : "COMMON",
    };
}
export function orphanRouteChecks(p, strings) {
    const ids = new Set(strings.map((s) => s.id));
    return [
        ...(p.dc_routes ?? [])
            .filter((r) => !ids.has(r.target.id))
            .map((r) => finding(`DC:${r.target.id}:ROUTE_ORPHAN`, "UNKNOWN", "Saved DC route target is absent from current plan; no reuse on another feeder", ["current_route_target"])),
        ...(p.ac_routes ?? [])
            .filter((r) => r.inverter > p.inverter_quantity)
            .map((r) => finding(`AC:INV${r.inverter}:ROUTE_ORPHAN`, "UNKNOWN", "Saved AC feeder targets an inverter outside the current fleet", ["current_route_target"])),
    ];
}
export function cableRouteQuantities(routes, dcLayoutComplete) {
    const quantities = new Map();
    let omitted = 0;
    for (const route of routes) {
        if (route.cable_id == null || route.length_m == null) {
            omitted++;
            continue;
        }
        quantities.set(route.cable_id, (quantities.get(route.cable_id) ?? 0) + route.conductors * route.length_m);
    }
    return {
        totals: [...quantities].map(([item, quantity]) => ({ item, quantity })),
        omitted_routes: omitted,
        unresolved_dc_layout: !dcLayoutComplete,
        checks: [
            finding("CABLE_BOM_SCOPE", omitted || !dcLayoutComplete ? "UNKNOWN" : "PASS", "Known selected routes only: two conductors per DC string, one multicore per inverter; omitted routes/layout make totals partial; no reserve", [
                ...(omitted ? ["unquantified_feeder_routes"] : []),
                ...(!dcLayoutComplete ? ["unresolved_dc_layout"] : []),
            ]),
        ],
    };
}
//# sourceMappingURL=routes.js.map