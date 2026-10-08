import type { EngineeringCheck, Status } from "../../schema/src/index.js";
export function check(
  id: string,
  demand: number | null | undefined,
  capacity: number | null | undefined,
  unit: string,
  basis: string,
  missing: string[] = [],
  direction: "max" | "min" = "max",
  sources: string[] = [],
): EngineeringCheck {
  const d = demand ?? null,
    c = capacity ?? null;
  const known =
    d !== null && c !== null && Number.isFinite(d) && Number.isFinite(c);
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
export function finding(
  id: string,
  status: Status,
  basis: string,
  missing: string[] = [],
): EngineeringCheck {
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
export function overall(checks: EngineeringCheck[]): Status {
  for (const s of ["FAIL", "UNKNOWN", "WARN"] as const)
    if (checks.some((c) => c.status === s)) return s;
  return "PASS";
}
