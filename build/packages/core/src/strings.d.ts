import type { Project, Mppt, StringConfiguration, EngineeringCheck } from "../../schema/src/index.js";
export declare function stringLengthRange(p: Project, mppt: Mppt): {
    min: number | null;
    max: number | null;
    voc_cold_v: number | null;
    vmp_hot_v: number | null;
    vmp_cold_v: number | null;
    missing: string[];
};
export declare function parallelCapacity(p: Project, mppt: Mppt): {
    count: null;
    missing: string[];
} | {
    count: number;
    missing: string[];
};
/** Greedy deterministic whole-MPPT allocation. Same plane and same length on parallel strings; no Y connectors. */
export declare function generateStringPlan(p: Project): {
    strings: StringConfiguration[];
    checks: EngineeringCheck[];
    unassigned: number;
};
export declare function validateStringPlan(p: Project, strings: StringConfiguration[]): EngineeringCheck[];
