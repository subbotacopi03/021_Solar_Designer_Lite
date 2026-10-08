import {
  PvModuleSchema,
  InverterSchema,
  type PvModule,
} from "../../schema/src/index.js";
export const STC_CELL_TEMPERATURE_C = 25;
export function validatePvModule(input: unknown) {
  return PvModuleSchema.safeParse(input);
}
export function validateInverter(input: unknown) {
  return InverterSchema.safeParse(input);
}
function positive(v: number) {
  if (!Number.isFinite(v) || v <= 0)
    throw new RangeError("Expected finite positive number");
}
export function moduleVoltageAt(
  voc: number,
  beta: number,
  temp: number,
): number {
  positive(voc);
  if (!Number.isFinite(beta) || beta >= 0 || !Number.isFinite(temp))
    throw new RangeError("Invalid signed coefficient or temperature");
  const value = voc * (1 + (beta / 100) * (temp - STC_CELL_TEMPERATURE_C));
  positive(value);
  return value;
}
export function moduleVmpAt(
  module: PvModule,
  temp: number,
  allowApproximation = false,
) {
  let beta = module.beta_vmp_pct_c;
  let basis = "DATASHEET";
  let missing: string[] = [];
  if (beta == null) {
    missing = ["beta_vmp_pct_c"];
    if (
      allowApproximation &&
      module.gamma_pmax_pct_c != null &&
      module.alpha_isc_pct_c != null
    ) {
      beta = module.gamma_pmax_pct_c - module.alpha_isc_pct_c;
      basis = "APPROXIMATED_GAMMA_ALPHA";
    } else return { value: null, basis: "UNKNOWN", missing };
  }
  return { value: moduleVoltageAt(module.vmp_v, beta, temp), basis, missing };
}
export function calculateAcCurrent(
  powerW: number,
  voltageV: number,
  phases: 1 | 3,
  cosPhi: number,
): number {
  positive(powerW);
  positive(voltageV);
  if (
    (phases !== 1 && phases !== 3) ||
    !Number.isFinite(cosPhi) ||
    cosPhi <= 0 ||
    cosPhi > 1
  )
    throw new RangeError("Invalid phases or power factor");
  return powerW / ((phases === 3 ? Math.sqrt(3) : 1) * voltageV * cosPhi);
}
export function resistanceAtTemperature(
  r20: number,
  alpha: number,
  temp: number,
): number {
  positive(r20);
  positive(alpha);
  if (!Number.isFinite(temp))
    throw new RangeError("Invalid conductor temperature");
  const value = r20 * (1 + alpha * (temp - 20));
  positive(value);
  return value;
}
export function voltageDropV(input: {
  circuit: "DC" | "AC1" | "AC3";
  current_a: number;
  length_m: number;
  r_ohm_km: number;
  cos_phi?: number | null;
  x_ohm_km?: number | null;
}): number | null {
  positive(input.current_a);
  positive(input.r_ohm_km);
  if (!Number.isFinite(input.length_m) || input.length_m < 0)
    throw new RangeError("Invalid length");
  if (input.circuit === "DC")
    return ((2 * input.length_m) / 1000) * input.current_a * input.r_ohm_km;
  const c = input.cos_phi,
    x = input.x_ohm_km;
  if (c == null || x == null) return null;
  if (!Number.isFinite(c) || c <= 0 || c > 1 || !Number.isFinite(x) || x < 0)
    throw new RangeError("Invalid AC parameters");
  return (
    (((input.circuit === "AC3" ? Math.sqrt(3) : 2) * input.length_m) / 1000) *
    input.current_a *
    (input.r_ohm_km * c + x * Math.sqrt(1 - c * c))
  );
}
