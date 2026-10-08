import type { DcSwitchDevice, DcSwitchContext, EngineeringCheck } from "../../schema/src/index.js";
/** Necessary nominal checks, explicitly per string; not protective-device coordination. */
export declare function assessDcSwitchCandidate(input: {
    device: DcSwitchDevice;
    context?: DcSwitchContext;
    voc_cold_v: number | null;
    design_current_a: number | null;
}): EngineeringCheck[];
