import { type Project } from "../../schema/src/index.js";
export * from "./fundamentals.js";
export * from "./strings.js";
export * from "./checks.js";
export * from "./cables.js";
export * from "./protection.js";
export declare const ENGINE_VERSION = "0.1.0";
export declare function calculateProject(raw: unknown): {
    engine_version: string;
    schema_version: "0.1.0";
    status: "PASS" | "WARN" | "FAIL" | "UNKNOWN" | "NOT_APPLICABLE";
    requested_modules: number;
    installed_modules: number;
    unassigned_modules: number;
    dc_power_w: number;
    requested_dc_power_w: number;
    ac_power_w: number;
    dc_ac_ratio: number;
    ac_current_per_inverter_a: number | null;
    breaker_candidate_a: number | null;
    ranges: ({
        min: null;
        max: null;
        voc_cold_v: null;
        vmp_hot_v: null;
        vmp_cold_v: null;
        missing: string[];
        mppt_id: string;
    } | {
        min: number;
        max: number;
        voc_cold_v: number;
        vmp_hot_v: number;
        vmp_cold_v: number;
        missing: string[];
        mppt_id: string;
    })[];
    strings: {
        id: string;
        inverter: number;
        mppt_id: string;
        plane_id: string;
        modules: number;
    }[];
    dc_lines: {
        string_id: string;
        voc_cold_v: number | null;
        vmp_hot_v: number | null;
        ib_a: number | null;
        fuse: {
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
        isolator_a: number | null;
        cable: {
            selected: {
                cable: {
                    id: string;
                    name: string;
                    circuit: "DC" | "AC";
                    material: "Cu" | "Al";
                    section_mm2: number;
                    r20_ohm_km: number;
                    alpha_per_c: number;
                    installation_basis: string;
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
                    x_ohm_km?: number | null | undefined;
                    max_voltage_v?: number | null | undefined;
                    max_conductor_temp_c?: number | null | undefined;
                    iz_a?: number | null | undefined;
                };
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
                status: "PASS" | "WARN" | "FAIL" | "UNKNOWN" | "NOT_APPLICABLE";
                r_ohm_km: number | null;
                drop_v: number | null;
                drop_pct: number | null;
                iz_derated_a: number | null;
            } | null;
            candidates: {
                cable: {
                    id: string;
                    name: string;
                    circuit: "DC" | "AC";
                    material: "Cu" | "Al";
                    section_mm2: number;
                    r20_ohm_km: number;
                    alpha_per_c: number;
                    installation_basis: string;
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
                    x_ohm_km?: number | null | undefined;
                    max_voltage_v?: number | null | undefined;
                    max_conductor_temp_c?: number | null | undefined;
                    iz_a?: number | null | undefined;
                };
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
                status: "PASS" | "WARN" | "FAIL" | "UNKNOWN" | "NOT_APPLICABLE";
                r_ohm_km: number | null;
                drop_v: number | null;
                drop_pct: number | null;
                iz_derated_a: number | null;
            }[];
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
    }[];
    ac: {
        selected: {
            cable: {
                id: string;
                name: string;
                circuit: "DC" | "AC";
                material: "Cu" | "Al";
                section_mm2: number;
                r20_ohm_km: number;
                alpha_per_c: number;
                installation_basis: string;
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
                x_ohm_km?: number | null | undefined;
                max_voltage_v?: number | null | undefined;
                max_conductor_temp_c?: number | null | undefined;
                iz_a?: number | null | undefined;
            };
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
            status: "PASS" | "WARN" | "FAIL" | "UNKNOWN" | "NOT_APPLICABLE";
            r_ohm_km: number | null;
            drop_v: number | null;
            drop_pct: number | null;
            iz_derated_a: number | null;
        } | null;
        candidates: {
            cable: {
                id: string;
                name: string;
                circuit: "DC" | "AC";
                material: "Cu" | "Al";
                section_mm2: number;
                r20_ohm_km: number;
                alpha_per_c: number;
                installation_basis: string;
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
                x_ohm_km?: number | null | undefined;
                max_voltage_v?: number | null | undefined;
                max_conductor_temp_c?: number | null | undefined;
                iz_a?: number | null | undefined;
            };
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
            status: "PASS" | "WARN" | "FAIL" | "UNKNOWN" | "NOT_APPLICABLE";
            r_ohm_km: number | null;
            drop_v: number | null;
            drop_pct: number | null;
            iz_derated_a: number | null;
        }[];
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
    bom: {
        item: string;
        quantity: number;
        unit: string;
        basis: string;
    }[];
};
export type ProjectResult = ReturnType<typeof calculateProject>;
export declare function projectReport(p: Project, result: ProjectResult, language?: "uk" | "en"): string;
