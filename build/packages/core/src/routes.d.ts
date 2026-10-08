import type { Project, StringConfiguration, CircuitInput, EngineeringCheck } from "../../schema/src/index.js";
export declare function resolveDcRoute(p: Project, target: StringConfiguration, currentPlan: readonly StringConfiguration[]): {
    circuit_input: {
        installation_method?: string | null | undefined;
        ambient_temp_c?: number | null | undefined;
        grouped_circuits?: number | null | undefined;
        derating_evidence?: {
            temperature: {
                basis: string;
                sources: {
                    id: string;
                    label: string;
                    verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                    url?: string | undefined;
                    reviewed_on?: string | undefined;
                    document_revision?: string | undefined;
                    locator?: string | undefined;
                    sha256?: string | undefined;
                    notes?: string | undefined;
                }[];
                factor?: number | null | undefined;
            };
            grouping: {
                basis: string;
                sources: {
                    id: string;
                    label: string;
                    verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                    url?: string | undefined;
                    reviewed_on?: string | undefined;
                    document_revision?: string | undefined;
                    locator?: string | undefined;
                    sha256?: string | undefined;
                    notes?: string | undefined;
                }[];
                factor?: number | null | undefined;
            };
            installation: {
                basis: string;
                sources: {
                    id: string;
                    label: string;
                    verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                    url?: string | undefined;
                    reviewed_on?: string | undefined;
                    document_revision?: string | undefined;
                    locator?: string | undefined;
                    sha256?: string | undefined;
                    notes?: string | undefined;
                }[];
                factor?: number | null | undefined;
            };
            applies_to?: {
                cable_id: string;
                reference_iz_a: number;
                reference: {
                    installation_method: string;
                    sources: {
                        id: string;
                        label: string;
                        verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                        url?: string | undefined;
                        reviewed_on?: string | undefined;
                        document_revision?: string | undefined;
                        locator?: string | undefined;
                        sha256?: string | undefined;
                        notes?: string | undefined;
                    }[];
                    ambient_temp_c?: number | null | undefined;
                    conductor_temp_c?: number | null | undefined;
                    grouped_circuits?: number | null | undefined;
                } | null;
                installation_method: string;
                ambient_temp_c: number;
                conductor_temp_c: number;
                grouped_circuits: number;
            } | undefined;
        } | undefined;
        length_m?: number | null | undefined;
        conductor_temp_c?: number | null | undefined;
        derating_factor?: number | null | undefined;
        derating_basis?: string | null | undefined;
    };
    input_origin: "COMMON";
    checks: EngineeringCheck[];
} | {
    circuit_input: CircuitInput;
    input_origin: "AMBIGUOUS_OVERRIDE";
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
    circuit_input: {
        installation_method?: string | null | undefined;
        ambient_temp_c?: number | null | undefined;
        grouped_circuits?: number | null | undefined;
        derating_evidence?: {
            temperature: {
                basis: string;
                sources: {
                    id: string;
                    label: string;
                    verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                    url?: string | undefined;
                    reviewed_on?: string | undefined;
                    document_revision?: string | undefined;
                    locator?: string | undefined;
                    sha256?: string | undefined;
                    notes?: string | undefined;
                }[];
                factor?: number | null | undefined;
            };
            grouping: {
                basis: string;
                sources: {
                    id: string;
                    label: string;
                    verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                    url?: string | undefined;
                    reviewed_on?: string | undefined;
                    document_revision?: string | undefined;
                    locator?: string | undefined;
                    sha256?: string | undefined;
                    notes?: string | undefined;
                }[];
                factor?: number | null | undefined;
            };
            installation: {
                basis: string;
                sources: {
                    id: string;
                    label: string;
                    verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                    url?: string | undefined;
                    reviewed_on?: string | undefined;
                    document_revision?: string | undefined;
                    locator?: string | undefined;
                    sha256?: string | undefined;
                    notes?: string | undefined;
                }[];
                factor?: number | null | undefined;
            };
            applies_to?: {
                cable_id: string;
                reference_iz_a: number;
                reference: {
                    installation_method: string;
                    sources: {
                        id: string;
                        label: string;
                        verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                        url?: string | undefined;
                        reviewed_on?: string | undefined;
                        document_revision?: string | undefined;
                        locator?: string | undefined;
                        sha256?: string | undefined;
                        notes?: string | undefined;
                    }[];
                    ambient_temp_c?: number | null | undefined;
                    conductor_temp_c?: number | null | undefined;
                    grouped_circuits?: number | null | undefined;
                } | null;
                installation_method: string;
                ambient_temp_c: number;
                conductor_temp_c: number;
                grouped_circuits: number;
            } | undefined;
        } | undefined;
        length_m?: number | null | undefined;
        conductor_temp_c?: number | null | undefined;
        derating_factor?: number | null | undefined;
        derating_basis?: string | null | undefined;
    };
    input_origin: "OVERRIDE";
    checks: EngineeringCheck[];
} | {
    circuit_input: CircuitInput;
    input_origin: "STALE_OVERRIDE";
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
export declare function resolveAcRoute(p: Project, inverter: number): {
    circuit_input: {
        installation_method?: string | null | undefined;
        ambient_temp_c?: number | null | undefined;
        grouped_circuits?: number | null | undefined;
        derating_evidence?: {
            temperature: {
                basis: string;
                sources: {
                    id: string;
                    label: string;
                    verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                    url?: string | undefined;
                    reviewed_on?: string | undefined;
                    document_revision?: string | undefined;
                    locator?: string | undefined;
                    sha256?: string | undefined;
                    notes?: string | undefined;
                }[];
                factor?: number | null | undefined;
            };
            grouping: {
                basis: string;
                sources: {
                    id: string;
                    label: string;
                    verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                    url?: string | undefined;
                    reviewed_on?: string | undefined;
                    document_revision?: string | undefined;
                    locator?: string | undefined;
                    sha256?: string | undefined;
                    notes?: string | undefined;
                }[];
                factor?: number | null | undefined;
            };
            installation: {
                basis: string;
                sources: {
                    id: string;
                    label: string;
                    verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                    url?: string | undefined;
                    reviewed_on?: string | undefined;
                    document_revision?: string | undefined;
                    locator?: string | undefined;
                    sha256?: string | undefined;
                    notes?: string | undefined;
                }[];
                factor?: number | null | undefined;
            };
            applies_to?: {
                cable_id: string;
                reference_iz_a: number;
                reference: {
                    installation_method: string;
                    sources: {
                        id: string;
                        label: string;
                        verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
                        url?: string | undefined;
                        reviewed_on?: string | undefined;
                        document_revision?: string | undefined;
                        locator?: string | undefined;
                        sha256?: string | undefined;
                        notes?: string | undefined;
                    }[];
                    ambient_temp_c?: number | null | undefined;
                    conductor_temp_c?: number | null | undefined;
                    grouped_circuits?: number | null | undefined;
                } | null;
                installation_method: string;
                ambient_temp_c: number;
                conductor_temp_c: number;
                grouped_circuits: number;
            } | undefined;
        } | undefined;
        length_m?: number | null | undefined;
        conductor_temp_c?: number | null | undefined;
        derating_factor?: number | null | undefined;
        derating_basis?: string | null | undefined;
    };
    input_origin: "COMMON" | "OVERRIDE";
};
export declare function orphanRouteChecks(p: Project, strings: StringConfiguration[]): EngineeringCheck[];
export declare function cableRouteQuantities(routes: {
    cable_id: string | null;
    length_m: number | null | undefined;
    conductors: 1 | 2;
}[], dcLayoutComplete: boolean): {
    totals: {
        item: string;
        quantity: number;
    }[];
    omitted_routes: number;
    unresolved_dc_layout: boolean;
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
