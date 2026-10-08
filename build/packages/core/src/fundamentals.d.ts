import { type PvModule } from "../../schema/src/index.js";
export declare const STC_CELL_TEMPERATURE_C = 25;
export declare function validatePvModule(input: unknown): import("zod").ZodSafeParseResult<{
    id: string;
    name: string;
    pmax_w: number;
    voc_v: number;
    vmp_v: number;
    isc_a: number;
    imp_a: number;
    sources: {
        id: string;
        label: string;
        verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
        url?: string | undefined;
    }[];
    beta_voc_pct_c?: number | null | undefined;
    beta_vmp_pct_c?: number | null | undefined;
    alpha_isc_pct_c?: number | null | undefined;
    gamma_pmax_pct_c?: number | null | undefined;
    max_system_voltage_v?: number | null | undefined;
    max_series_fuse_a?: number | null | undefined;
    reverse_current_withstand_a?: number | null | undefined;
}>;
export declare function validateInverter(input: unknown): import("zod").ZodSafeParseResult<{
    id: string;
    name: string;
    ac_power_w: number;
    ac_voltage_v: number;
    phases: 1 | 3;
    max_dc_voltage_v: number;
    mppts: {
        id: string;
        min_voltage_v: number;
        max_voltage_v: number;
        max_current_a?: number | null | undefined;
        max_isc_a?: number | null | undefined;
        max_strings?: number | null | undefined;
        inputs?: number | null | undefined;
        max_current_per_input_a?: number | null | undefined;
        max_isc_per_input_a?: number | null | undefined;
    }[];
    requires_optimizer: boolean;
    sources: {
        id: string;
        label: string;
        verification: "USER_INPUT" | "UNVERIFIED" | "VERIFIED" | "SYNTHETIC";
        url?: string | undefined;
    }[];
    max_dc_power_w?: number | null | undefined;
}>;
export declare function moduleVoltageAt(voc: number, beta: number, temp: number): number;
export declare function moduleVmpAt(module: PvModule, temp: number, allowApproximation?: boolean): {
    value: null;
    basis: string;
    missing: string[];
} | {
    value: number;
    basis: string;
    missing: string[];
};
export declare function calculateAcCurrent(powerW: number, voltageV: number, phases: 1 | 3, cosPhi: number): number;
export declare function resistanceAtTemperature(r20: number, alpha: number, temp: number): number;
export declare function voltageDropV(input: {
    circuit: "DC" | "AC1" | "AC3";
    current_a: number;
    length_m: number;
    r_ohm_km: number;
    cos_phi?: number | null;
    x_ohm_km?: number | null;
}): number | null;
