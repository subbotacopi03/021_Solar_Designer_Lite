import type { ElectricalPolicy } from "../../schema/src/index.js";
export declare function standardRatingAtLeast(series: readonly number[], value: number): number | null;
export declare function selectStringFuse(policy: ElectricalPolicy, input: {
    isc_a: number;
    parallel_strings: number;
    max_series_fuse_a: number | null | undefined;
    reverse_current_withstand_a?: number | null;
    voc_cold_v: number | null;
}): {
    required: boolean;
    rating_a: null;
    reverse_a: number;
    checks: {
        id: string;
        status: "PASS" | "WARN" | "FAIL" | "UNKNOWN" | "NOT_APPLICABLE";
        demand: number | null;
        capacity: number | null;
        unit: string;
        utilization: number | null;
        missing: string[];
        basis: string;
        source_ids: string[];
        message_key: string;
    }[];
} | {
    required: null;
    rating_a: null;
    reverse_a: number;
    checks: {
        id: string;
        status: "PASS" | "WARN" | "FAIL" | "UNKNOWN" | "NOT_APPLICABLE";
        demand: number | null;
        capacity: number | null;
        unit: string;
        utilization: number | null;
        missing: string[];
        basis: string;
        source_ids: string[];
        message_key: string;
    }[];
} | {
    required: true;
    rating_a: number | null;
    reverse_a: number;
    checks: {
        id: string;
        status: "PASS" | "WARN" | "FAIL" | "UNKNOWN" | "NOT_APPLICABLE";
        demand: number | null;
        capacity: number | null;
        unit: string;
        utilization: number | null;
        missing: string[];
        basis: string;
        source_ids: string[];
        message_key: string;
    }[];
};
export declare function selectDcIsolator(policy: ElectricalPolicy, isc: number): number | null;
export declare function checkBreakingCapacity(icu: number | null | undefined, ik: number | null | undefined): {
    id: string;
    status: "PASS" | "WARN" | "FAIL" | "UNKNOWN" | "NOT_APPLICABLE";
    demand: number | null;
    capacity: number | null;
    unit: string;
    utilization: number | null;
    missing: string[];
    basis: string;
    source_ids: string[];
    message_key: string;
};
export declare function spdAssessment(): {
    id: string;
    status: "PASS" | "WARN" | "FAIL" | "UNKNOWN" | "NOT_APPLICABLE";
    demand: number | null;
    capacity: number | null;
    unit: string;
    utilization: number | null;
    missing: string[];
    basis: string;
    source_ids: string[];
    message_key: string;
};
