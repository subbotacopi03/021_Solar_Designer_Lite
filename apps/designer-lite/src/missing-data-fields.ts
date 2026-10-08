type Description = { uk: string; en: string; unit: string };
export const descriptions = new Map<string, Description>([
  [
    "beta_vmp_pct_c",
    {
      uk: "Температурний коефіцієнт βVmp",
      en: "Vmp temperature coefficient βVmp",
      unit: "%/°C",
    },
  ],
  [
    "beta_voc_pct_c",
    {
      uk: "Температурний коефіцієнт βVoc",
      en: "Voc temperature coefficient βVoc",
      unit: "%/°C",
    },
  ],
  [
    "t_min_cell_c",
    {
      uk: "Мінімальна температура комірки",
      en: "Minimum cell temperature",
      unit: "°C",
    },
  ],
  [
    "t_max_cell_c",
    {
      uk: "Максимальна температура комірки",
      en: "Maximum cell temperature",
      unit: "°C",
    },
  ],
  [
    "cos_phi",
    { uk: "Коефіцієнт потужності cosφ", en: "Power factor cosφ", unit: "—" },
  ],
  [
    "max_system_voltage_v",
    {
      uk: "Максимальна системна напруга модуля",
      en: "Module maximum system voltage",
      unit: "V",
    },
  ],
  [
    "reverse_current_withstand_a",
    {
      uk: "Допустимий зворотний струм модуля",
      en: "Module reverse-current withstand",
      unit: "A",
    },
  ],
  [
    "max_series_fuse_a",
    {
      uk: "Максимальний номінал послідовного запобіжника",
      en: "Maximum series fuse rating",
      unit: "A",
    },
  ],
  [
    "max_current_per_input_a",
    {
      uk: "Ліміт Imp фізичного входу",
      en: "Physical input Imp limit",
      unit: "A",
    },
  ],
  [
    "max_isc_per_input_a",
    {
      uk: "Ліміт Isc фізичного входу",
      en: "Physical input Isc limit",
      unit: "A",
    },
  ],
  ["max_current_a", { uk: "Ліміт Imp MPPT", en: "MPPT Imp limit", unit: "A" }],
  ["max_isc_a", { uk: "Ліміт Isc MPPT", en: "MPPT Isc limit", unit: "A" }],
  [
    "inputs",
    {
      uk: "Кількість фізичних входів",
      en: "Physical input count",
      unit: "pcs",
    },
  ],
  [
    "max_strings",
    { uk: "Ліміт стрінгів MPPT", en: "MPPT string limit", unit: "pcs" },
  ],
  [
    "max_dc_power_w",
    {
      uk: "Максимальна DC потужність інвертора",
      en: "Inverter maximum DC power",
      unit: "W",
    },
  ],
  [
    "inverter_backfeed_a",
    {
      uk: "Зворотний струм від інвертора",
      en: "Inverter backfeed current",
      unit: "A",
    },
  ],
  [
    "isc_factor",
    {
      uk: "Явний розрахунковий коефіцієнт Isc",
      en: "Explicit Isc design factor",
      unit: "—",
    },
  ],
  [
    "dc_ac_band",
    {
      uk: "Прийнятий діапазон DC/AC",
      en: "Chosen DC/AC policy band",
      unit: "—",
    },
  ],
  [
    "length_m",
    { uk: "Довжина траси в один бік", en: "One-way route length", unit: "m" },
  ],
  [
    "conductor_temp_c",
    {
      uk: "Розрахункова температура провідника",
      en: "Design conductor temperature",
      unit: "°C",
    },
  ],
  [
    "ambient_temp_c",
    { uk: "Температура середовища", en: "Ambient temperature", unit: "°C" },
  ],
  [
    "installation_method",
    { uk: "Спосіб прокладання", en: "Installation method", unit: "—" },
  ],
  [
    "grouped_circuits",
    {
      uk: "Кількість згрупованих кіл",
      en: "Grouped circuit count",
      unit: "pcs",
    },
  ],
  [
    "derating_factor",
    {
      uk: "Коефіцієнт зниження допустимого струму",
      en: "Ampacity derating factor",
      unit: "—",
    },
  ],
  [
    "derating_basis",
    { uk: "Підстава коефіцієнта зниження", en: "Derating basis", unit: "—" },
  ],
  [
    "derating_evidence",
    {
      uk: "Джерела й застосовність derating",
      en: "Derating evidence and applicability",
      unit: "—",
    },
  ],
  [
    "r20_ohm_km",
    {
      uk: "Опір провідника при 20 °C",
      en: "Conductor resistance at 20 °C",
      unit: "Ω/km",
    },
  ],
  [
    "alpha_per_c",
    {
      uk: "Температурний коефіцієнт опору",
      en: "Resistance temperature coefficient",
      unit: "1/°C",
    },
  ],
  [
    "x_ohm_km",
    { uk: "Реактивний опір кабелю", en: "Cable reactance", unit: "Ω/km" },
  ],
  [
    "iz_a",
    {
      uk: "Допустимий струм за умовами джерела",
      en: "Ampacity in reference conditions",
      unit: "A",
    },
  ],
  [
    "max_voltage_v",
    { uk: "Номінальна напруга кабелю", en: "Cable voltage rating", unit: "V" },
  ],
  [
    "max_conductor_temp_c",
    {
      uk: "Гранична температура кабелю",
      en: "Cable temperature rating",
      unit: "°C",
    },
  ],
  [
    "drop_limit_pct",
    {
      uk: "Прийнятий ліміт падіння напруги",
      en: "Chosen voltage-drop limit",
      unit: "%",
    },
  ],
  [
    "prospective_short_circuit_ka",
    {
      uk: "Очікуваний струм короткого замикання",
      en: "Prospective short-circuit current",
      unit: "kA",
    },
  ],
  [
    "breaker_icu_ka",
    {
      uk: "Вимикальна здатність автомата Icu",
      en: "Breaker breaking capacity Icu",
      unit: "kA",
    },
  ],
  ["cable_catalog", { uk: "Каталог кабелів", en: "Cable catalog", unit: "—" }],
  [
    "earthing_system",
    { uk: "Система заземлення", en: "Earthing system", unit: "—" },
  ],
  [
    "lps_separation",
    {
      uk: "Відокремлення від блискавкозахисту",
      en: "LPS separation",
      unit: "—",
    },
  ],
  [
    "spd_coordination",
    { uk: "Узгодження SPD", en: "SPD coordination", unit: "—" },
  ],
  [
    "device_curves",
    {
      uk: "Характеристики захисних пристроїв",
      en: "Protective device characteristics",
      unit: "—",
    },
  ],
  [
    "fault_loop",
    {
      uk: "Перевірка петлі замикання",
      en: "Fault-loop verification",
      unit: "—",
    },
  ],
]);
export const moduleFields = [
  "beta_vmp_pct_c",
  "beta_voc_pct_c",
  "alpha_isc_pct_c",
  "gamma_pmax_pct_c",
  "max_system_voltage_v",
  "max_series_fuse_a",
  "reverse_current_withstand_a",
];
export const mpptFields = [
  "max_current_per_input_a",
  "max_isc_per_input_a",
  "max_current_a",
  "max_isc_a",
  "inputs",
  "max_strings",
];
export const circuitFields = [
  "length_m",
  "conductor_temp_c",
  "ambient_temp_c",
  "installation_method",
  "grouped_circuits",
  "derating_factor",
  "derating_basis",
  "derating_evidence",
];
export const cableFields = [
  "r20_ohm_km",
  "alpha_per_c",
  "x_ohm_km",
  "iz_a",
  "max_voltage_v",
  "max_conductor_temp_c",
];
