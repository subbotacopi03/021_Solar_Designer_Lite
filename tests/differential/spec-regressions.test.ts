import { it, expect, describe } from "vitest";
import { example } from "../helpers.js";
import {
  PvModuleSchema,
  ProjectSchema,
  InverterSchema,
} from "../../packages/schema/src/index.js";
import {
  calculateProject,
  moduleVoltageAt,
  moduleVmpAt,
  stringLengthRange,
  parallelCapacity,
  voltageDropV,
  selectStringFuse,
} from "../../packages/core/src/index.js";
describe("SPEC decisions, not legacy-result approval", () => {
  for (const beta of [0, 0.28, 1])
    it("GD-02 reject beta " + beta, () => {
      const m = example().module;
      m.beta_voc_pct_c = beta;
      expect(PvModuleSchema.safeParse(m).success).toBe(false);
      expect(() => moduleVoltageAt(50, beta, -20)).toThrow();
    });
  it("GD-03 module 1000 V system cap", () => {
    const p = example();
    p.module.max_system_voltage_v = 1000;
    expect(stringLengthRange(p, p.inverter.mppts[0]!).max).toBe(17);
  });
  it("GD-04 no Tmin default", () => {
    const p = example();
    p.site.t_min_cell_c = null;
    const r = calculateProject(p);
    expect(r.status).toBe("UNKNOWN");
    expect(r.strings).toHaveLength(0);
    expect(r.checks.flatMap((c) => c.missing)).toContain("t_min_cell_c");
  });
  it("GD-05 no Voc substitution for beta Vmp", () => {
    const p = example();
    p.module.beta_vmp_pct_c = null;
    expect(moduleVmpAt(p.module, 70).value).toBeNull();
    const a = moduleVmpAt(p.module, 70, true);
    expect(a.basis).toBe("APPROXIMATED_GAMMA_ALPHA");
    expect(a.missing).toContain("beta_vmp_pct_c");
    expect(calculateProject(p).strings).toHaveLength(0);
  });
  it("SPEC-04 do not substitute Imp cap for missing Isc cap", () => {
    const p = example();
    p.inverter.mppts[0]!.max_isc_a = null;
    expect(parallelCapacity(p, p.inverter.mppts[0]!).count).toBeNull();
  });
  it("SPEC-04 physical input rating blocks one string", () => {
    const p = example();
    p.inverter.mppts[0]!.max_current_per_input_a = 10;
    expect(parallelCapacity(p, p.inverter.mppts[0]!).count).toBe(0);
  });
  it("SPEC-06 missing X does not silently become zero", () =>
    expect(
      voltageDropV({
        circuit: "AC3",
        current_a: 10,
        length_m: 10,
        r_ohm_km: 1,
        cos_phi: 1,
      }),
    ).toBeNull());
  it("SPEC-09 missing ratio band keeps value but verdict unknown", () => {
    const p = example();
    p.policy.dc_ac_band = null;
    const r = calculateProject(p);
    expect(r.dc_ac_ratio).toBeCloseTo(1.404);
    expect(r.checks.find((c) => c.id === "RATIO_POLICY")?.status).toBe(
      "UNKNOWN",
    );
  });
  it("No reverse-current assumption from maximum series fuse", () => {
    const p = example();
    const f = selectStringFuse(p.policy, {
      isc_a: 14,
      parallel_strings: 3,
      max_series_fuse_a: 25,
      voc_cold_v: 1000,
    });
    expect(f.required).toBeNull();
    expect(f.rating_a).toBeNull();
  });
  for (const key of ["voc_v", "isc_a", "pmax_w"])
    it("reject invalid " + key, () => {
      const p: any = example();
      p.module[key] = 0;
      expect(ProjectSchema.safeParse(p).success).toBe(false);
    });
  it("reject nonfinite module value", () => {
    const p = example();
    p.module.voc_v = NaN;
    expect(PvModuleSchema.safeParse(p.module).success).toBe(false);
  });
  it("reject beta wrong units sign", () => {
    const p = example();
    p.module.alpha_isc_pct_c = -0.04;
    expect(PvModuleSchema.safeParse(p.module).success).toBe(false);
  });
  it("reject inconsistent MPPT voltage", () => {
    const i = example().inverter;
    i.mppts[0]!.max_voltage_v = 1200;
    expect(InverterSchema.safeParse(i).success).toBe(false);
  });
  it("reject duplicate MPPT IDs", () => {
    const i = example().inverter;
    i.mppts[1]!.id = i.mppts[0]!.id;
    expect(InverterSchema.safeParse(i).success).toBe(false);
  });
  it("reject temperatures reversed", () => {
    const p = example();
    p.site.t_min_cell_c = 80;
    expect(ProjectSchema.safeParse(p).success).toBe(false);
  });
  it("reject prices and unknown customer properties", () => {
    const p: any = example();
    p.price = 100;
    expect(ProjectSchema.safeParse(p).success).toBe(false);
  });
  it("reject zero inverter fleet", () => {
    const p = example();
    p.inverter_quantity = 0;
    expect(ProjectSchema.safeParse(p).success).toBe(false);
  });
  it("reject unknown schema version", () => {
    const p: any = example();
    p.schema_version = "2.0.0";
    expect(ProjectSchema.safeParse(p).success).toBe(false);
  });
  it("manual mixed lengths fail on same MPPT", () => {
    const p = example();
    p.manual_strings = [
      {
        id: "a",
        inverter: 1,
        mppt_id: "MPPT1",
        plane_id: "south",
        modules: 19,
      },
      {
        id: "b",
        inverter: 1,
        mppt_id: "MPPT1",
        plane_id: "south",
        modules: 18,
      },
    ];
    expect(
      calculateProject(p).checks.some(
        (c) => c.id.endsWith("PARALLEL_MISMATCH") && c.status === "FAIL",
      ),
    ).toBe(true);
  });
  it("manual optimizer plan cannot bypass unsupported engine", () => {
    const p = example();
    p.inverter.requires_optimizer = true;
    p.manual_strings = [
      {
        id: "a",
        inverter: 1,
        mppt_id: "MPPT1",
        plane_id: "south",
        modules: 19,
      },
    ];
    expect(
      calculateProject(p).checks.find((c) => c.id === "OPTIMIZER_ENGINE")
        ?.status,
    ).toBe("UNKNOWN");
  });
});
