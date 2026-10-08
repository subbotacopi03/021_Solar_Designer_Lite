import { type Project, type EngineeringCheck } from "../../schema/src/index.js";
export * from "./dc-switch.js";
export * from "./spd.js";
export * from "./routes.js";
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
    ranges: {
        min: number | null;
        max: number | null;
        voc_cold_v: number | null;
        vmp_hot_v: number | null;
        vmp_cold_v: number | null;
        missing: string[];
        mppt_id: string;
    }[];
    strings: {
        id: string;
        inverter: number;
        mppt_id: string;
        plane_id: string;
        modules: number;
    }[];
    dc_lines: {
        string_id: string;
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
        input_origin: "COMMON" | "AMBIGUOUS_OVERRIDE" | "OVERRIDE" | "STALE_OVERRIDE";
        voc_cold_v: number | null;
        vmp_hot_v: number | null;
        ib_a: number | null;
        fuse: {
            required: boolean | null;
            rating_a: number | null;
            reverse_a: number | null;
            checks: EngineeringCheck[];
        };
        isolator_a: number | null;
        dc_switch_checks: {
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
        cable: {
            selected: {
                cable: {
                    id: string;
                    name: string;
                    circuit: "DC" | "AC";
                    material: "Cu" | "Al";
                    section_mm2: number;
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
                    r20_ohm_km?: number | null | undefined;
                    alpha_per_c?: number | null | undefined;
                    x_ohm_km?: number | null | undefined;
                    max_voltage_v?: number | null | undefined;
                    max_conductor_temp_c?: number | null | undefined;
                    iz_a?: number | null | undefined;
                    ampacity_reference?: {
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
                    } | undefined;
                    manufacturer?: string | undefined;
                    model?: string | undefined;
                    units?: Record<string, string> | undefined;
                    data_notes?: string[] | undefined;
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
                    r20_ohm_km?: number | null | undefined;
                    alpha_per_c?: number | null | undefined;
                    x_ohm_km?: number | null | undefined;
                    max_voltage_v?: number | null | undefined;
                    max_conductor_temp_c?: number | null | undefined;
                    iz_a?: number | null | undefined;
                    ampacity_reference?: {
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
                    } | undefined;
                    manufacturer?: string | undefined;
                    model?: string | undefined;
                    units?: Record<string, string> | undefined;
                    data_notes?: string[] | undefined;
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
                r20_ohm_km?: number | null | undefined;
                alpha_per_c?: number | null | undefined;
                x_ohm_km?: number | null | undefined;
                max_voltage_v?: number | null | undefined;
                max_conductor_temp_c?: number | null | undefined;
                iz_a?: number | null | undefined;
                ampacity_reference?: {
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
                } | undefined;
                manufacturer?: string | undefined;
                model?: string | undefined;
                units?: Record<string, string> | undefined;
                data_notes?: string[] | undefined;
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
                r20_ohm_km?: number | null | undefined;
                alpha_per_c?: number | null | undefined;
                x_ohm_km?: number | null | undefined;
                max_voltage_v?: number | null | undefined;
                max_conductor_temp_c?: number | null | undefined;
                iz_a?: number | null | undefined;
                ampacity_reference?: {
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
                } | undefined;
                manufacturer?: string | undefined;
                model?: string | undefined;
                units?: Record<string, string> | undefined;
                data_notes?: string[] | undefined;
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
    ac_lines: {
        cable: {
            selected: {
                cable: {
                    id: string;
                    name: string;
                    circuit: "DC" | "AC";
                    material: "Cu" | "Al";
                    section_mm2: number;
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
                    r20_ohm_km?: number | null | undefined;
                    alpha_per_c?: number | null | undefined;
                    x_ohm_km?: number | null | undefined;
                    max_voltage_v?: number | null | undefined;
                    max_conductor_temp_c?: number | null | undefined;
                    iz_a?: number | null | undefined;
                    ampacity_reference?: {
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
                    } | undefined;
                    manufacturer?: string | undefined;
                    model?: string | undefined;
                    units?: Record<string, string> | undefined;
                    data_notes?: string[] | undefined;
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
                    r20_ohm_km?: number | null | undefined;
                    alpha_per_c?: number | null | undefined;
                    x_ohm_km?: number | null | undefined;
                    max_voltage_v?: number | null | undefined;
                    max_conductor_temp_c?: number | null | undefined;
                    iz_a?: number | null | undefined;
                    ampacity_reference?: {
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
                    } | undefined;
                    manufacturer?: string | undefined;
                    model?: string | undefined;
                    units?: Record<string, string> | undefined;
                    data_notes?: string[] | undefined;
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
        inverter: number;
    }[];
    cable_bom: {
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
export { type SoftwareAttribution } from "./software-credit.js";
import { type SoftwareAttribution } from "./software-credit.js";
export declare function projectReport(p: Project, result: ProjectResult, language?: "uk" | "en", attribution?: SoftwareAttribution): string;
