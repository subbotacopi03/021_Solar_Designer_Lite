type Lang = "uk" | "en";

const labels: Record<string, [uk: string, en: string]> = {
  pmax_w: ["Pmax, W", "Pmax, W"],
  voc_v: ["Voc, V", "Voc, V"],
  vmp_v: ["Vmp, V", "Vmp, V"],
  isc_a: ["Isc, A", "Isc, A"],
  imp_a: ["Imp, A", "Imp, A"],
  beta_voc_pct_c: ["βVoc, %/°C (від’ємний)", "βVoc, %/°C (negative)"],
  beta_vmp_pct_c: ["βVmp, %/°C (від’ємний)", "βVmp, %/°C (negative)"],
  alpha_isc_pct_c: ["αIsc, %/°C (додатний)", "αIsc, %/°C (positive)"],
  gamma_pmax_pct_c: ["γPmax, %/°C (від’ємний)", "γPmax, %/°C (negative)"],
  max_system_voltage_v: [
    "Макс. напруга системи модуля, V",
    "Module max system voltage, V",
  ],
  max_series_fuse_a: ["Макс. послідовний запобіжник, A", "Max series fuse, A"],
  reverse_current_withstand_a: [
    "Стійкість до зворотного струму, A",
    "Reverse current withstand, A",
  ],
  ac_power_w: ["Номінальна AC потужність, W", "Rated AC power, W"],
  ac_voltage_v: ["Номінальна AC напруга, V", "Rated AC voltage, V"],
  max_dc_voltage_v: ["Макс. DC напруга, V", "Max DC voltage, V"],
  max_dc_power_w: ["Макс. DC потужність, W", "Max DC power, W"],
  max_backfeed_current_a: [
    "Макс. зворотний струм інвертора в PV, A",
    "Max inverter backfeed current, A",
  ],
  phases: ["Фази", "Phases"],
  id: ["ID", "ID"],
  min_voltage_v: ["Vmin MPPT, V", "MPPT Vmin, V"],
  max_voltage_v: ["Vmax MPPT, V", "MPPT Vmax, V"],
  max_current_a: ["Imp max MPPT, A", "MPPT Imp max, A"],
  max_isc_a: ["Isc max MPPT, A", "MPPT Isc max, A"],
  max_strings: ["Макс. стрінгів", "Max strings"],
  inputs: ["Фізичних входів", "Physical inputs"],
  max_current_per_input_a: ["Imp max на вхід, A", "Imp max per input, A"],
  max_isc_per_input_a: ["Isc max на вхід, A", "Isc max per input, A"],
};

export const moduleFields = [
  "pmax_w",
  "voc_v",
  "vmp_v",
  "isc_a",
  "imp_a",
  "beta_voc_pct_c",
  "beta_vmp_pct_c",
  "alpha_isc_pct_c",
  "gamma_pmax_pct_c",
  "max_system_voltage_v",
  "max_series_fuse_a",
  "reverse_current_withstand_a",
] as const;

export const inverterFields = [
  "ac_power_w",
  "ac_voltage_v",
  "max_dc_voltage_v",
  "max_dc_power_w",
  "max_backfeed_current_a",
] as const;

export const mpptFields = [
  "min_voltage_v",
  "max_voltage_v",
  "max_current_a",
  "max_isc_a",
  "max_strings",
  "inputs",
  "max_current_per_input_a",
  "max_isc_per_input_a",
] as const;

export function equipmentLabel(key: string, lang: Lang): string {
  const pair = labels[key];
  return pair ? pair[lang === "uk" ? 0 : 1] : key;
}
