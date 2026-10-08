import { z } from "zod";
export declare const SourceSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    url: z.ZodOptional<z.ZodURL>;
    verification: z.ZodEnum<{
        USER_INPUT: "USER_INPUT";
        UNVERIFIED: "UNVERIFIED";
        VERIFIED: "VERIFIED";
        SYNTHETIC: "SYNTHETIC";
    }>;
    reviewed_on: z.ZodOptional<z.ZodISODate>;
    document_revision: z.ZodOptional<z.ZodString>;
    locator: z.ZodOptional<z.ZodString>;
    sha256: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const PvModuleSchema: z.ZodObject<{
    pmax_w: z.ZodNumber;
    voc_v: z.ZodNumber;
    vmp_v: z.ZodNumber;
    isc_a: z.ZodNumber;
    imp_a: z.ZodNumber;
    beta_voc_pct_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    beta_vmp_pct_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    alpha_isc_pct_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    gamma_pmax_pct_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_system_voltage_v: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_series_fuse_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    reverse_current_withstand_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        url: z.ZodOptional<z.ZodURL>;
        verification: z.ZodEnum<{
            USER_INPUT: "USER_INPUT";
            UNVERIFIED: "UNVERIFIED";
            VERIFIED: "VERIFIED";
            SYNTHETIC: "SYNTHETIC";
        }>;
        reviewed_on: z.ZodOptional<z.ZodISODate>;
        document_revision: z.ZodOptional<z.ZodString>;
        locator: z.ZodOptional<z.ZodString>;
        sha256: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    manufacturer: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    units: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    data_notes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    id: z.ZodString;
    name: z.ZodString;
}, z.core.$strict>;
export declare const MpptSchema: z.ZodObject<{
    id: z.ZodString;
    min_voltage_v: z.ZodNumber;
    max_voltage_v: z.ZodNumber;
    max_current_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_isc_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_strings: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    inputs: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_current_per_input_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_isc_per_input_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strict>;
export declare const InverterSchema: z.ZodObject<{
    ac_power_w: z.ZodNumber;
    ac_voltage_v: z.ZodNumber;
    phases: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<3>]>;
    max_dc_voltage_v: z.ZodNumber;
    max_dc_power_w: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    mppts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        min_voltage_v: z.ZodNumber;
        max_voltage_v: z.ZodNumber;
        max_current_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_isc_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_strings: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        inputs: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_current_per_input_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_isc_per_input_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strict>>;
    requires_optimizer: z.ZodBoolean;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        url: z.ZodOptional<z.ZodURL>;
        verification: z.ZodEnum<{
            USER_INPUT: "USER_INPUT";
            UNVERIFIED: "UNVERIFIED";
            VERIFIED: "VERIFIED";
            SYNTHETIC: "SYNTHETIC";
        }>;
        reviewed_on: z.ZodOptional<z.ZodISODate>;
        document_revision: z.ZodOptional<z.ZodString>;
        locator: z.ZodOptional<z.ZodString>;
        sha256: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    manufacturer: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    units: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    data_notes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    id: z.ZodString;
    name: z.ZodString;
}, z.core.$strict>;
export declare const OptimizerSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    max_input_voltage_v: z.ZodNumber;
    max_input_current_a: z.ZodNumber;
    max_input_power_w: z.ZodNumber;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        url: z.ZodOptional<z.ZodURL>;
        verification: z.ZodEnum<{
            USER_INPUT: "USER_INPUT";
            UNVERIFIED: "UNVERIFIED";
            VERIFIED: "VERIFIED";
            SYNTHETIC: "SYNTHETIC";
        }>;
        reviewed_on: z.ZodOptional<z.ZodISODate>;
        document_revision: z.ZodOptional<z.ZodString>;
        locator: z.ZodOptional<z.ZodString>;
        sha256: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const SiteConditionsSchema: z.ZodObject<{
    t_min_cell_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    t_max_cell_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cos_phi: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strict>;
export declare const CableSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    circuit: z.ZodEnum<{
        DC: "DC";
        AC: "AC";
    }>;
    material: z.ZodEnum<{
        Cu: "Cu";
        Al: "Al";
    }>;
    section_mm2: z.ZodNumber;
    r20_ohm_km: z.ZodNumber;
    alpha_per_c: z.ZodNumber;
    x_ohm_km: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_voltage_v: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_conductor_temp_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    iz_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    installation_basis: z.ZodString;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        url: z.ZodOptional<z.ZodURL>;
        verification: z.ZodEnum<{
            USER_INPUT: "USER_INPUT";
            UNVERIFIED: "UNVERIFIED";
            VERIFIED: "VERIFIED";
            SYNTHETIC: "SYNTHETIC";
        }>;
        reviewed_on: z.ZodOptional<z.ZodISODate>;
        document_revision: z.ZodOptional<z.ZodString>;
        locator: z.ZodOptional<z.ZodString>;
        sha256: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const ElectricalPolicySchema: z.ZodObject<{
    id: z.ZodString;
    isc_factor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    dc_ac_band: z.ZodOptional<z.ZodNullable<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>>;
    dc_drop_max_pct: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    ac_drop_max_pct: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    breaker_ratings_a: z.ZodArray<z.ZodNumber>;
    fuse_ratings_a: z.ZodArray<z.ZodNumber>;
    isolator_ratings_a: z.ZodArray<z.ZodNumber>;
    fuse_min_factor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    fuse_max_factor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        url: z.ZodOptional<z.ZodURL>;
        verification: z.ZodEnum<{
            USER_INPUT: "USER_INPUT";
            UNVERIFIED: "UNVERIFIED";
            VERIFIED: "VERIFIED";
            SYNTHETIC: "SYNTHETIC";
        }>;
        reviewed_on: z.ZodOptional<z.ZodISODate>;
        document_revision: z.ZodOptional<z.ZodString>;
        locator: z.ZodOptional<z.ZodString>;
        sha256: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const StringConfigurationSchema: z.ZodObject<{
    id: z.ZodString;
    inverter: z.ZodNumber;
    mppt_id: z.ZodString;
    plane_id: z.ZodString;
    modules: z.ZodNumber;
}, z.core.$strict>;
export declare const MpptConfigurationSchema: z.ZodObject<{
    inverter: z.ZodNumber;
    mppt_id: z.ZodString;
    strings: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        inverter: z.ZodNumber;
        mppt_id: z.ZodString;
        plane_id: z.ZodString;
        modules: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const EngineeringCheckSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<{
        PASS: "PASS";
        WARN: "WARN";
        FAIL: "FAIL";
        UNKNOWN: "UNKNOWN";
        NOT_APPLICABLE: "NOT_APPLICABLE";
    }>;
    demand: z.ZodNullable<z.ZodNumber>;
    capacity: z.ZodNullable<z.ZodNumber>;
    unit: z.ZodString;
    utilization: z.ZodNullable<z.ZodNumber>;
    missing: z.ZodArray<z.ZodString>;
    basis: z.ZodString;
    source_ids: z.ZodArray<z.ZodString>;
    message_key: z.ZodString;
}, z.core.$strict>;
export declare const CircuitInputSchema: z.ZodObject<{
    length_m: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    conductor_temp_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    derating_factor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    derating_basis: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export declare const ProjectSchema: z.ZodObject<{
    schema_version: z.ZodLiteral<"0.1.0">;
    name: z.ZodString;
    module: z.ZodObject<{
        pmax_w: z.ZodNumber;
        voc_v: z.ZodNumber;
        vmp_v: z.ZodNumber;
        isc_a: z.ZodNumber;
        imp_a: z.ZodNumber;
        beta_voc_pct_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        beta_vmp_pct_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        alpha_isc_pct_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        gamma_pmax_pct_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_system_voltage_v: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_series_fuse_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        reverse_current_withstand_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        sources: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            url: z.ZodOptional<z.ZodURL>;
            verification: z.ZodEnum<{
                USER_INPUT: "USER_INPUT";
                UNVERIFIED: "UNVERIFIED";
                VERIFIED: "VERIFIED";
                SYNTHETIC: "SYNTHETIC";
            }>;
            reviewed_on: z.ZodOptional<z.ZodISODate>;
            document_revision: z.ZodOptional<z.ZodString>;
            locator: z.ZodOptional<z.ZodString>;
            sha256: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        manufacturer: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        units: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        data_notes: z.ZodOptional<z.ZodArray<z.ZodString>>;
        id: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>;
    inverter: z.ZodObject<{
        ac_power_w: z.ZodNumber;
        ac_voltage_v: z.ZodNumber;
        phases: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<3>]>;
        max_dc_voltage_v: z.ZodNumber;
        max_dc_power_w: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        mppts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            min_voltage_v: z.ZodNumber;
            max_voltage_v: z.ZodNumber;
            max_current_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_isc_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_strings: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            inputs: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_current_per_input_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_isc_per_input_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, z.core.$strict>>;
        requires_optimizer: z.ZodBoolean;
        sources: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            url: z.ZodOptional<z.ZodURL>;
            verification: z.ZodEnum<{
                USER_INPUT: "USER_INPUT";
                UNVERIFIED: "UNVERIFIED";
                VERIFIED: "VERIFIED";
                SYNTHETIC: "SYNTHETIC";
            }>;
            reviewed_on: z.ZodOptional<z.ZodISODate>;
            document_revision: z.ZodOptional<z.ZodString>;
            locator: z.ZodOptional<z.ZodString>;
            sha256: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        manufacturer: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        units: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        data_notes: z.ZodOptional<z.ZodArray<z.ZodString>>;
        id: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>;
    inverter_quantity: z.ZodNumber;
    planes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        module_count: z.ZodNumber;
    }, z.core.$strict>>;
    site: z.ZodObject<{
        t_min_cell_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        t_max_cell_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        cos_phi: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strict>;
    policy: z.ZodObject<{
        id: z.ZodString;
        isc_factor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        dc_ac_band: z.ZodOptional<z.ZodNullable<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>>;
        dc_drop_max_pct: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        ac_drop_max_pct: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        breaker_ratings_a: z.ZodArray<z.ZodNumber>;
        fuse_ratings_a: z.ZodArray<z.ZodNumber>;
        isolator_ratings_a: z.ZodArray<z.ZodNumber>;
        fuse_min_factor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        fuse_max_factor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        sources: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            url: z.ZodOptional<z.ZodURL>;
            verification: z.ZodEnum<{
                USER_INPUT: "USER_INPUT";
                UNVERIFIED: "UNVERIFIED";
                VERIFIED: "VERIFIED";
                SYNTHETIC: "SYNTHETIC";
            }>;
            reviewed_on: z.ZodOptional<z.ZodISODate>;
            document_revision: z.ZodOptional<z.ZodString>;
            locator: z.ZodOptional<z.ZodString>;
            sha256: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    cables: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        circuit: z.ZodEnum<{
            DC: "DC";
            AC: "AC";
        }>;
        material: z.ZodEnum<{
            Cu: "Cu";
            Al: "Al";
        }>;
        section_mm2: z.ZodNumber;
        r20_ohm_km: z.ZodNumber;
        alpha_per_c: z.ZodNumber;
        x_ohm_km: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_voltage_v: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_conductor_temp_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        iz_a: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        installation_basis: z.ZodString;
        sources: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            url: z.ZodOptional<z.ZodURL>;
            verification: z.ZodEnum<{
                USER_INPUT: "USER_INPUT";
                UNVERIFIED: "UNVERIFIED";
                VERIFIED: "VERIFIED";
                SYNTHETIC: "SYNTHETIC";
            }>;
            reviewed_on: z.ZodOptional<z.ZodISODate>;
            document_revision: z.ZodOptional<z.ZodString>;
            locator: z.ZodOptional<z.ZodString>;
            sha256: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    dc: z.ZodObject<{
        length_m: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        conductor_temp_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        derating_factor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        derating_basis: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    ac: z.ZodObject<{
        length_m: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        conductor_temp_c: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        derating_factor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        derating_basis: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    prospective_short_circuit_ka: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    breaker_icu_ka: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    manual_strings: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        inverter: z.ZodNumber;
        mppt_id: z.ZodString;
        plane_id: z.ZodString;
        modules: z.ZodNumber;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type PvModule = z.infer<typeof PvModuleSchema>;
export type Inverter = z.infer<typeof InverterSchema>;
export type Mppt = z.infer<typeof MpptSchema>;
export type Cable = z.infer<typeof CableSchema>;
export type ElectricalPolicy = z.infer<typeof ElectricalPolicySchema>;
export type EngineeringCheck = z.infer<typeof EngineeringCheckSchema>;
export type StringConfiguration = z.infer<typeof StringConfigurationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Status = EngineeringCheck["status"];
