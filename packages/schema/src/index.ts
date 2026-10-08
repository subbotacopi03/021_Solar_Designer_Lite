import { z } from "zod";
const positive = z.number().finite().positive();
const nonnegative = z.number().finite().nonnegative();
const count = positive.int();
const optionalPositive = positive.nullish();
const negative = z.number().finite().negative().nullish();
const temperature = z.number().finite().min(-100).max(200).nullish();
export const SourceSchema = z.strictObject({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.url().optional(),
  verification: z.enum(["USER_INPUT", "UNVERIFIED", "VERIFIED", "SYNTHETIC"]),
  reviewed_on: z.iso.date().optional(),
  document_revision: z.string().min(1).optional(),
  locator: z.string().min(1).optional(),
  sha256: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  notes: z.string().min(1).optional(),
});
const equipmentMetadata = {
  manufacturer: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  units: z.record(z.string(), z.string()).optional(),
  data_notes: z.array(z.string()).optional(),
};
export const PvModuleSchema = z
  .strictObject({
    id: z.string().min(1),
    name: z.string().min(1),
    ...equipmentMetadata,
    pmax_w: positive,
    voc_v: positive,
    vmp_v: positive,
    isc_a: positive,
    imp_a: positive,
    beta_voc_pct_c: negative,
    beta_vmp_pct_c: negative,
    alpha_isc_pct_c: optionalPositive,
    gamma_pmax_pct_c: negative,
    max_system_voltage_v: optionalPositive,
    max_series_fuse_a: optionalPositive,
    reverse_current_withstand_a: optionalPositive,
    sources: z.array(SourceSchema),
  })
  .refine((m) => m.vmp_v < m.voc_v, {
    message: "Vmp must be below Voc",
    path: ["vmp_v"],
  })
  .refine((m) => m.imp_a <= m.isc_a, {
    message: "Imp must not exceed Isc",
    path: ["imp_a"],
  });
export const MpptSchema = z
  .strictObject({
    id: z.string().min(1),
    min_voltage_v: positive,
    max_voltage_v: positive,
    max_current_a: optionalPositive,
    max_isc_a: optionalPositive,
    max_strings: count.nullish(),
    inputs: count.nullish(),
    max_current_per_input_a: optionalPositive,
    max_isc_per_input_a: optionalPositive,
  })
  .refine((m) => m.min_voltage_v < m.max_voltage_v, {
    message: "Invalid MPPT window",
  });
export const InverterSchema = z
  .strictObject({
    id: z.string().min(1),
    name: z.string().min(1),
    ...equipmentMetadata,
    ac_power_w: positive,
    ac_voltage_v: positive,
    phases: z.union([z.literal(1), z.literal(3)]),
    max_dc_voltage_v: positive,
    max_dc_power_w: optionalPositive,
    max_backfeed_current_a: nonnegative.nullish(),
    mppts: z.array(MpptSchema).min(1).max(100),
    requires_optimizer: z.boolean(),
    sources: z.array(SourceSchema),
  })
  .refine((i) => new Set(i.mppts.map((m) => m.id)).size === i.mppts.length, {
    message: "Duplicate MPPT IDs",
  })
  .refine((i) => i.mppts.every((m) => m.max_voltage_v <= i.max_dc_voltage_v), {
    message: "MPPT voltage exceeds max DC voltage",
  });
export const OptimizerSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  max_input_voltage_v: positive,
  max_input_current_a: positive,
  max_input_power_w: positive,
  sources: z.array(SourceSchema),
});
export const SiteConditionsSchema = z
  .strictObject({
    t_min_cell_c: temperature,
    t_max_cell_c: temperature,
    cos_phi: z.number().finite().gt(0).max(1).nullish(),
  })
  .refine(
    (s) =>
      s.t_min_cell_c == null ||
      s.t_max_cell_c == null ||
      s.t_min_cell_c <= s.t_max_cell_c,
    { message: "Tmin must not exceed Tmax" },
  );
export const FactorEvidenceSchema = z.strictObject({
  factor: z.number().finite().gt(0).max(1).nullish(),
  basis: z.string().min(1),
  sources: z.array(SourceSchema),
});
export const AmpacityReferenceSchema = z.strictObject({
  installation_method: z.string().min(1),
  ambient_temp_c: temperature,
  conductor_temp_c: temperature,
  grouped_circuits: count.nullish(),
  sources: z.array(SourceSchema),
});
export const DeratingEvidenceSchema = z.strictObject({
  temperature: FactorEvidenceSchema,
  grouping: FactorEvidenceSchema,
  installation: FactorEvidenceSchema,
  applies_to: z
    .strictObject({
      cable_id: z.string().min(1),
      reference_iz_a: positive,
      reference: AmpacityReferenceSchema.nullable(),
      installation_method: z.string().min(1),
      ambient_temp_c: z.number().finite(),
      conductor_temp_c: z.number().finite(),
      grouped_circuits: count,
    })
    .optional(),
});
export const CableSchema = z.strictObject({
  ...equipmentMetadata,
  id: z.string().min(1),
  name: z.string().min(1),
  circuit: z.enum(["DC", "AC"]),
  material: z.enum(["Cu", "Al"]),
  section_mm2: positive,
  r20_ohm_km: optionalPositive,
  alpha_per_c: optionalPositive,
  x_ohm_km: nonnegative.nullish(),
  max_voltage_v: optionalPositive,
  max_conductor_temp_c: temperature,
  iz_a: optionalPositive,
  installation_basis: z.string().min(1),
  ampacity_reference: AmpacityReferenceSchema.optional(),
  sources: z.array(SourceSchema),
});
export const ElectricalPolicySchema = z
  .strictObject({
    id: z.string().min(1),
    isc_factor: positive.min(1).nullish(),
    dc_ac_band: z.tuple([positive, positive]).nullish(),
    dc_drop_max_pct: optionalPositive,
    ac_drop_max_pct: optionalPositive,
    breaker_ratings_a: z.array(positive).min(1),
    fuse_ratings_a: z.array(positive).min(1),
    isolator_ratings_a: z.array(positive).min(1),
    fuse_min_factor: positive.nullish(),
    fuse_max_factor: positive.nullish(),
    sources: z.array(SourceSchema),
  })
  .refine((p) => p.dc_ac_band == null || p.dc_ac_band[0] <= p.dc_ac_band[1], {
    message: "Invalid DC/AC band",
  })
  .refine(
    (p) =>
      p.fuse_min_factor == null ||
      p.fuse_max_factor == null ||
      p.fuse_min_factor <= p.fuse_max_factor,
    { message: "Invalid fuse factors" },
  );
export const StringConfigurationSchema = z.strictObject({
  id: z.string().min(1),
  inverter: count,
  mppt_id: z.string().min(1),
  plane_id: z.string().min(1),
  modules: count,
});
export const MpptConfigurationSchema = z.strictObject({
  inverter: count,
  mppt_id: z.string(),
  strings: z.array(StringConfigurationSchema),
});
export const EngineeringCheckSchema = z.strictObject({
  id: z.string(),
  status: z.enum(["PASS", "WARN", "FAIL", "UNKNOWN", "NOT_APPLICABLE"]),
  demand: z.number().finite().nullable(),
  capacity: z.number().finite().nullable(),
  unit: z.string(),
  utilization: z.number().finite().nullable(),
  missing: z.array(z.string()),
  basis: z.string(),
  source_ids: z.array(z.string()),
  message_key: z.string(),
});
export const CircuitInputSchema = z.strictObject({
  installation_method: z.string().min(1).nullish(),
  ambient_temp_c: temperature,
  grouped_circuits: count.nullish(),
  derating_evidence: DeratingEvidenceSchema.optional(),
  length_m: nonnegative.nullish(),
  conductor_temp_c: temperature,
  derating_factor: z.number().finite().gt(0).max(1).nullish(),
  derating_basis: z.string().min(1).nullish(),
});
export const DcRouteInputSchema = z.strictObject({
  target: StringConfigurationSchema,
  circuit: CircuitInputSchema,
});
export const AcRouteInputSchema = z.strictObject({
  inverter: count,
  circuit: CircuitInputSchema,
});
export const StringFuseDeviceSchema = z.strictObject({
  ...equipmentMetadata,
  id: z.string().min(1),
  name: z.string().min(1),
  family: z.string().min(1),
  rated_current_a: positive,
  rated_dc_voltage_v: optionalPositive,
  breaking_capacity_a: optionalPositive,
  total_clearing_i2t_a2s: optionalPositive,
  sources: z.array(SourceSchema),
});
export const DcSwitchProfileSchema = z.strictObject({
  id: z.string().min(1),
  operational_voltage_v: optionalPositive,
  operational_current_a: optionalPositive,
  utilization_category: z.string().min(1),
  poles: count,
  circuits: count,
  wiring_diagrams: z.array(z.string().min(1)).min(1),
});
export const DcSwitchDeviceSchema = z
  .strictObject({
    ...equipmentMetadata,
    id: z.string().min(1),
    name: z.string().min(1),
    insulation_voltage_v: optionalPositive,
    thermal_current_a: optionalPositive,
    profiles: z.array(DcSwitchProfileSchema).min(1).max(20),
    sources: z.array(SourceSchema),
  })
  .refine(
    (d) => new Set(d.profiles.map((p) => p.id)).size === d.profiles.length,
    { message: "Duplicate DC switch profile IDs" },
  );
export const DcSwitchContextSchema = z.strictObject({
  rating_id: z.string().min(1).nullish(),
  required_category: z.string().min(1).nullish(),
  wiring_diagram: z.string().min(1).nullish(),
  poles: count.nullish(),
  scope: z.enum(["PER_STRING", "MPPT", "INVERTER"]).nullish(),
  sources: z.array(SourceSchema),
});
const SpdTypeSchema = z.enum(["T1", "T2", "T1+T2"]);
const DcSystemSchema = z.enum(["ISOLATED", "GROUNDED"]);
export const SpdDeviceSchema = z.strictObject({
  ...equipmentMetadata,
  id: z.string().min(1),
  name: z.string().min(1),
  type: SpdTypeSchema,
  ucpv_v: optionalPositive,
  max_uoc_stc_v: optionalPositive,
  iscpv_a: optionalPositive,
  up_kv: optionalPositive,
  in_8_20_ka: optionalPositive,
  imax_8_20_ka: optionalPositive,
  iimp_10_350_ka: optionalPositive,
  pv_systems: z.array(DcSystemSchema),
  sources: z.array(SourceSchema),
});
export const SpdContextSchema = z.strictObject({
  earthing_system: z.string().min(1).nullish(),
  dc_system: DcSystemSchema.nullish(),
  lps_present: z.boolean().nullish(),
  lps_separation_maintained: z.boolean().nullish(),
  required_type: SpdTypeSchema.nullish(),
  required_in_8_20_ka: optionalPositive,
  required_iimp_10_350_ka: optionalPositive,
  equipment_impulse_withstand_kv: optionalPositive,
  connection_length_m: nonnegative.nullish(),
  coordination_basis: z.string().min(1).nullish(),
  requirement_sources: z.array(SourceSchema),
});
export const ProjectSchema = z
  .strictObject({
    schema_version: z.literal("0.1.0"),
    name: z.string().min(1).max(200),
    module: PvModuleSchema,
    inverter: InverterSchema,
    inverter_quantity: count.max(100),
    planes: z
      .array(
        z.strictObject({
          id: z.string().min(1),
          name: z.string(),
          module_count: count.max(100000),
        }),
      )
      .min(1)
      .max(100),
    site: SiteConditionsSchema,
    policy: ElectricalPolicySchema,
    cables: z.array(CableSchema).max(500),
    dc: CircuitInputSchema,
    ac: CircuitInputSchema,
    dc_routes: z.array(DcRouteInputSchema).max(10000).optional(),
    ac_routes: z.array(AcRouteInputSchema).max(100).optional(),
    prospective_short_circuit_ka: optionalPositive,
    breaker_icu_ka: optionalPositive,
    manual_strings: z.array(StringConfigurationSchema).max(10000).optional(),
    dc_switch_device: DcSwitchDeviceSchema.optional(),
    dc_switch_context: DcSwitchContextSchema.optional(),
    string_fuse_device: StringFuseDeviceSchema.optional(),
    spd_device: SpdDeviceSchema.optional(),
    spd_context: SpdContextSchema.optional(),
  })
  .refine((p) => new Set(p.planes.map((x) => x.id)).size === p.planes.length, {
    message: "Duplicate plane IDs",
  })
  .refine((p) => new Set(p.cables.map((x) => x.id)).size === p.cables.length, {
    message: "Duplicate cable IDs",
  })
  .refine(
    (p) =>
      new Set(p.dc_routes?.map((r) => r.target.id)).size ===
      (p.dc_routes?.length ?? 0),
    { message: "Duplicate DC route target IDs" },
  )
  .refine(
    (p) =>
      new Set(p.ac_routes?.map((r) => r.inverter)).size ===
      (p.ac_routes?.length ?? 0),
    { message: "Duplicate AC route inverter targets" },
  );
export type PvModule = z.infer<typeof PvModuleSchema>;
export type Inverter = z.infer<typeof InverterSchema>;
export type Mppt = z.infer<typeof MpptSchema>;
export type Cable = z.infer<typeof CableSchema>;
export type ElectricalPolicy = z.infer<typeof ElectricalPolicySchema>;
export type EngineeringCheck = z.infer<typeof EngineeringCheckSchema>;
export type StringConfiguration = z.infer<typeof StringConfigurationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Status = EngineeringCheck["status"];

export type CircuitInput = z.infer<typeof CircuitInputSchema>;

export type StringFuseDevice = z.infer<typeof StringFuseDeviceSchema>;

export type SpdDevice = z.infer<typeof SpdDeviceSchema>;
export type SpdContext = z.infer<typeof SpdContextSchema>;

export type DcSwitchDevice = z.infer<typeof DcSwitchDeviceSchema>;
export type DcSwitchContext = z.infer<typeof DcSwitchContextSchema>;
