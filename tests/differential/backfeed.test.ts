import { it, expect } from "vitest";
import { example } from "../helpers.js";
import {
  selectStringFuse,
  calculateProject,
} from "../../packages/core/src/index.js";
const base = {
  isc_a: 14,
  parallel_strings: 1,
  max_series_fuse_a: 25,
  voc_cold_v: 1000,
};
it("a single string cannot assume zero inverter backfeed", () => {
  const r = selectStringFuse(example().policy, base);
  expect(r.required).toBeNull();
  expect(r.reverse_a).toBeNull();
  expect(r.checks.flatMap((c) => c.missing)).toContain("inverter_backfeed_a");
});
it("explicit zero inverter backfeed leaves a single string without reverse current", () => {
  const r = selectStringFuse(example().policy, {
    ...base,
    inverter_backfeed_a: 0,
  } as any);
  expect(r.required).toBe(false);
  expect(r.reverse_a).toBe(0);
});
it("adds full backfeed to factored parallel-string current, without splitting across inputs", () => {
  const r = selectStringFuse(example().policy, {
    ...base,
    parallel_strings: 3,
    reverse_current_withstand_a: 30,
    inverter_backfeed_a: 5,
  } as any);
  expect(r.reverse_a).toBe(40);
  expect(r.required).toBe(true);
  expect(r.rating_a).toBe(25);
});
it("series fuse rating is not module reverse withstand even with known backfeed", () => {
  const r = selectStringFuse(example().policy, {
    ...base,
    parallel_strings: 3,
    inverter_backfeed_a: 0,
  } as any);
  expect(r.required).toBeNull();
  expect(r.checks.flatMap((c) => c.missing)).toContain(
    "reverse_current_withstand_a",
  );
});
it("rejects insufficient rated fuse voltage and breaking capacity independently", () => {
  const device = {
    id: "synthetic-fuse",
    name: "Synthetic gPV25",
    family: "gPV",
    rated_current_a: 25,
    rated_dc_voltage_v: 900,
    breaking_capacity_a: 30,
    total_clearing_i2t_a2s: null,
    sources: [],
  };
  const r = selectStringFuse(example().policy, {
    ...base,
    parallel_strings: 3,
    reverse_current_withstand_a: 30,
    inverter_backfeed_a: 5,
    device,
  } as any);
  expect(r.checks.find((c) => c.id === "FUSE_DC_VOLTAGE")?.status).toBe("FAIL");
  expect(r.checks.find((c) => c.id === "FUSE_BREAKING_CAPACITY")?.status).toBe(
    "FAIL",
  );
  expect(r.checks.find((c) => c.id === "FUSE_COORDINATION")?.status).toBe(
    "UNKNOWN",
  );
});
it("missing declared backfeed propagates through the shared project pipeline", () => {
  const p = example();
  delete (p.inverter as any).max_backfeed_current_a;
  const r = calculateProject(p);
  expect(r.dc_lines[0]!.fuse.required).toBeNull();
  expect(r.checks.flatMap((c) => c.missing)).toContain("inverter_backfeed_a");
});
