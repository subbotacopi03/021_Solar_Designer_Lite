import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  moduleVoltageAt,
  moduleVmpAt,
  calculateAcCurrent,
  resistanceAtTemperature,
  voltageDropV,
  stringLengthRange,
  parallelCapacity,
  standardRatingAtLeast,
  evaluateCable,
  sizeCable,
  selectStringFuse,
  checkBreakingCapacity,
} from "../../packages/core/src/index.js";
import { example } from "../helpers.js";
const fixtures = JSON.parse(
  readFileSync(new URL("./fixtures.json", import.meta.url), "utf8"),
);
describe("Independent arithmetic golden cases", () => {
  for (const f of fixtures)
    it(f.id, () =>
      expect(moduleVoltageAt(f.v, f.beta, f.t) * f.n).toBeCloseTo(
        f.expected,
        5,
      ),
    );
  it("GT-STR-02 window, separate Isc rating", () => {
    const p = example();
    Object.assign(p.module, {
      voc_v: 49.5,
      vmp_v: 41.8,
      isc_a: 13.9,
      imp_a: 13.1,
      beta_voc_pct_c: -0.25,
      beta_vmp_pct_c: -0.35,
    });
    p.site.t_min_cell_c = -22;
    const range = stringLengthRange(p, p.inverter.mppts[0]!);
    expect(range.min).toBe(6);
    expect(range.max).toBe(19);
    expect(range.voc_cold_v).toBeCloseTo(55.31625, 5);
    expect(parallelCapacity(p, p.inverter.mppts[0]!).count).toBe(1);
  });
  it("GT-STR-04 incompatible MPPT lower voltage", () => {
    const p = example();
    p.inverter.mppts[0]!.min_voltage_v = 900;
    const r = stringLengthRange(p, p.inverter.mppts[0]!);
    expect(r.min!).toBeGreaterThan(r.max!);
  });
  it("GT-CAB-01 exact DC voltage drop", () =>
    expect(
      voltageDropV({ circuit: "DC", current_a: 10, length_m: 50, r_ohm_km: 4 }),
    ).toBe(4));
  it("GD-07 R70 AC includes cosPhi and X", () => {
    const r = resistanceAtTemperature(1.15, 0.00393, 70);
    const v = voltageDropV({
      circuit: "AC3",
      current_a: 72.2,
      length_m: 80,
      r_ohm_km: r,
      cos_phi: 0.95,
      x_ohm_km: 0.08,
    });
    expect((v! / 400) * 100).toBeCloseTo(3.3318311536232224, 10);
  });
  it("GD-08 R90 DC", () => {
    const r = resistanceAtTemperature(3.39, 0.00393, 90);
    expect(
      (voltageDropV({
        circuit: "DC",
        current_a: 12.5,
        length_m: 30,
        r_ohm_km: r,
      })! /
        700) *
        100,
    ).toBeCloseTo(0.4631345357142858, 10);
  });
  it("GD-06 AC output power excludes efficiency", () =>
    expect(calculateAcCurrent(50000, 400, 3, 0.95)).toBeCloseTo(
      75.9671406828455,
      10,
    ));
  it("SPEC-10 supersedes legacy GT-AC-01 efficiency", () =>
    expect(calculateAcCurrent(100000, 400, 3, 1)).toBeCloseTo(
      144.33756729740645,
      10,
    ));
  it("single phase output power", () =>
    expect(calculateAcCurrent(10000, 230, 1, 0.98)).toBeCloseTo(
      44.36557231588288,
      10,
    ));
  it("GT-PRT-01 rating lookup", () => {
    expect(standardRatingAtLeast([20, 6, 10, 16], 11)).toBe(16);
    expect(standardRatingAtLeast([6, 10, 16, 20], 21)).toBeNull();
  });
  it("GT-BRK-01 Icu independent of In", () => {
    expect(standardRatingAtLeast([20, 32, 40, 50, 63], 45)).toBe(50);
    expect(checkBreakingCapacity(20, 18).status).toBe("PASS");
    expect(checkBreakingCapacity(6, 6.1).status).toBe("FAIL");
  });
  it("fuse golden arithmetic only with explicit withstand data", () => {
    const p = example();
    const r = selectStringFuse(p.policy, {
      isc_a: 14,
      parallel_strings: 3,
      max_series_fuse_a: 25,
      reverse_current_withstand_a: 25,
      inverter_backfeed_a: 0,
      voc_cold_v: 1000,
    });
    expect(r.required).toBe(true);
    expect(r.rating_a).toBe(25);
  });
  it("GT-CAB-05 4 to 6 mm² from explicit derating", () => {
    const p = example();
    const inp = {
      circuit: "DC" as const,
      ib_a: 27.5,
      in_a: 27.5,
      length_m: 35,
      voltage_v: 1500,
      required_voltage_v: 1000,
      conductor_temp_c: 90,
      derating_factor: 1,
      derating_basis: "Independent test factor",
      drop_limit_pct: 1,
    };
    expect(sizeCable(p.cables, inp).selected?.cable.section_mm2).toBe(4);
    expect(
      sizeCable(p.cables, { ...inp, derating_factor: 0.57 }).selected?.cable
        .section_mm2,
    ).toBe(6);
  });
  it("candidate Iz derated preserves Ib/In coordination", () => {
    const p = example();
    const c = p.cables.find((c) => c.id === "ac-demo-16")!;
    const r = evaluateCable(c, {
      circuit: "AC3",
      ib_a: 72,
      in_a: 80,
      length_m: 10,
      voltage_v: 400,
      required_voltage_v: 400,
      cos_phi: 1,
      conductor_temp_c: 70,
      derating_factor: 0.87,
      derating_basis: "test",
      drop_limit_pct: 3,
    });
    expect(r.checks.find((c) => c.id.endsWith("IN_IZ"))?.status).toBe("FAIL");
    expect(r.iz_derated_a).toBeCloseTo(73.95);
  });
});
