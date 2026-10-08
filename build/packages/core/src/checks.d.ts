import type { EngineeringCheck, Status } from "../../schema/src/index.js";
export declare function check(id: string, demand: number | null | undefined, capacity: number | null | undefined, unit: string, basis: string, missing?: string[], direction?: "max" | "min", sources?: string[]): EngineeringCheck;
export declare function finding(id: string, status: Status, basis: string, missing?: string[]): EngineeringCheck;
export declare function overall(checks: EngineeringCheck[]): Status;
