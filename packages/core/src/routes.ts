import type {
  Project,
  StringConfiguration,
  CircuitInput,
  EngineeringCheck,
} from "../../schema/src/index.js";
import { finding } from "./checks.js";
export function resolveDcRoute(
  p: Project,
  target: StringConfiguration,
  currentPlan: readonly StringConfiguration[],
) {
  const route = p.dc_routes?.find((r) => r.target.id === target.id);
  if (!route)
    return {
      circuit_input: p.dc,
      input_origin: "COMMON" as const,
      checks: [] as EngineeringCheck[],
    };
  if (currentPlan.filter((s) => s.id === target.id).length !== 1)
    return {
      circuit_input: {} as CircuitInput,
      input_origin: "AMBIGUOUS_OVERRIDE" as const,
      checks: [
        finding(
          `${target.id}:ROUTE_AMBIGUOUS`,
          "UNKNOWN",
          "Saved DC route target ID is not unique in current plan; fix duplicate string IDs before binding",
          ["unique_route_target"],
        ),
      ],
    };
  const matches = (
    ["id", "inverter", "mppt_id", "plane_id", "modules"] as const
  ).every((key) => route.target[key] === target[key]);
  return matches
    ? {
        circuit_input: route.circuit,
        input_origin: "OVERRIDE" as const,
        checks: [] as EngineeringCheck[],
      }
    : {
        circuit_input: {} as CircuitInput,
        input_origin: "STALE_OVERRIDE" as const,
        checks: [
          finding(
            `${target.id}:ROUTE_STALE`,
            "UNKNOWN",
            "Saved route allocation snapshot differs from current string; explicit rebind or removal required",
            ["confirmed_route_target"],
          ),
        ],
      };
}
export function resolveAcRoute(p: Project, inverter: number) {
  const route = p.ac_routes?.find((r) => r.inverter === inverter);
  return {
    circuit_input: route ? route.circuit : p.ac,
    input_origin: route ? ("OVERRIDE" as const) : ("COMMON" as const),
  };
}
export function orphanRouteChecks(
  p: Project,
  strings: StringConfiguration[],
): EngineeringCheck[] {
  const ids = new Set(strings.map((s) => s.id));
  return [
    ...(p.dc_routes ?? [])
      .filter((r) => !ids.has(r.target.id))
      .map((r) =>
        finding(
          `DC:${r.target.id}:ROUTE_ORPHAN`,
          "UNKNOWN",
          "Saved DC route target is absent from current plan; no reuse on another feeder",
          ["current_route_target"],
        ),
      ),
    ...(p.ac_routes ?? [])
      .filter((r) => r.inverter > p.inverter_quantity)
      .map((r) =>
        finding(
          `AC:INV${r.inverter}:ROUTE_ORPHAN`,
          "UNKNOWN",
          "Saved AC feeder targets an inverter outside the current fleet",
          ["current_route_target"],
        ),
      ),
  ];
}
export function cableRouteQuantities(
  routes: {
    cable_id: string | null;
    length_m: number | null | undefined;
    conductors: 1 | 2;
  }[],
  dcLayoutComplete: boolean,
) {
  const quantities = new Map<string, number>();
  let omitted = 0;
  for (const route of routes) {
    if (route.cable_id == null || route.length_m == null) {
      omitted++;
      continue;
    }
    quantities.set(
      route.cable_id,
      (quantities.get(route.cable_id) ?? 0) + route.conductors * route.length_m,
    );
  }
  return {
    totals: [...quantities].map(([item, quantity]) => ({ item, quantity })),
    omitted_routes: omitted,
    unresolved_dc_layout: !dcLayoutComplete,
    checks: [
      finding(
        "CABLE_BOM_SCOPE",
        omitted || !dcLayoutComplete ? "UNKNOWN" : "PASS",
        "Known selected routes only: two conductors per DC string, one multicore per inverter; omitted routes/layout make totals partial; no reserve",
        [
          ...(omitted ? ["unquantified_feeder_routes"] : []),
          ...(!dcLayoutComplete ? ["unresolved_dc_layout"] : []),
        ],
      ),
    ],
  };
}
