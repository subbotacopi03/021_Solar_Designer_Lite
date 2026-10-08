import type { EngineeringCheck, SpdDevice, SpdContext } from "../../schema/src/index.js";
/** Necessary device checks only. No LPS-driven type selection or compliance verdict. */
export declare function assessSpdCandidate(input: {
    device: SpdDevice;
    context?: SpdContext;
    voc_cold_v: number | null;
    voc_stc_v: number | null;
    prospective_current_a: number | null;
    known_current_lower_bound_a?: number | null;
}): EngineeringCheck[];
