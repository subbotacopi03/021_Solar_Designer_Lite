import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { example } from "../helpers.js";
import {
  PvModuleSchema,
  InverterSchema,
  SourceSchema,
  ProjectSchema,
} from "../../packages/schema/src/index.js";
import {
  calculateProject,
  moduleVoltageAt,
  projectReport,
} from "../../packages/core/src/index.js";
const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
describe("manufacturer equipment provenance and UNKNOWN pipeline", () => {
  it("accepts dated field evidence while preserving strict schema", () => {
    expect(
      SourceSchema.safeParse({
        id: "sma",
        label: "Official manual",
        url: "https://manuals.sma.de/",
        verification: "VERIFIED",
        reviewed_on: "2026-10-08",
        document_revision: "STP8-10-3AV-40",
        locator: "Technical data, DC input",
        notes: "Tracker ratings; connector ratings not stated",
      }).success,
    ).toBe(true);
    expect(
      SourceSchema.safeParse({
        id: "x",
        label: "x",
        verification: "VERIFIED",
        reviewed_on: "yesterday",
      }).success,
    ).toBe(false);
  });
  it("contains at least two exact module and inverter SKUs with unresolved values", () => {
    const mp = "data/equipment/verified/modules.json",
      ip = "data/equipment/verified/inverters.json";
    expect(existsSync(mp) && existsSync(ip)).toBe(true);
    const modules = read(mp).map((x: unknown) => PvModuleSchema.parse(x));
    const inverters = read(ip).map((x: unknown) => InverterSchema.parse(x));
    expect(
      new Set(modules.map((x: any) => x.model)).size,
    ).toBeGreaterThanOrEqual(2);
    expect(
      new Set(inverters.map((x: any) => x.model)).size,
    ).toBeGreaterThanOrEqual(2);
    const m = modules.find((x: any) => x.model === "TSM-440NEG9R.28")!;
    expect(m.beta_vmp_pct_c).toBeNull();
    expect(m.reverse_current_withstand_a).toBeNull();
    // Independent arithmetic: 52.2 * [1 + (-0.24/100) * (-20 - 25)] = 57.8376 V.
    expect(moduleVoltageAt(m.voc_v, m.beta_voc_pct_c!, -20)).toBeCloseTo(
      57.8376,
      8,
    );
    for (const inv of inverters) {
      expect(inv.requires_optimizer).toBe(false);
      expect(inv.mppts.map((x: any) => x.inputs)).toEqual([2, 1]);
      expect(inv.mppts[0]!.max_current_per_input_a).toBeNull();
      expect(inv.mppts[0]!.max_isc_per_input_a).toBeNull();
      expect(inv.mppts.map((x: any) => x.max_current_a)).toEqual([20, 12]);
    }
  });
  it.each(["trina-435-sma-8", "trina-440-sma-10"])(
    "%s survives save/load and produces an honest sourced report",
    (name) => {
      const path = `data/examples/${name}.json`;
      expect(existsSync(path)).toBe(true);
      const p = ProjectSchema.parse(read(path)),
        r = calculateProject(p);
      expect(r.status).toBe("UNKNOWN");
      expect(r.installed_modules).toBe(0);
      expect(r.checks.some((c) => c.status === "FAIL")).toBe(false);
      expect(r.checks.find((c) => c.id === "STRING_DATA")?.missing).toContain(
        "beta_vmp_pct_c",
      );
      expect(calculateProject(JSON.parse(JSON.stringify(p)))).toEqual(r);
      for (const lang of ["uk", "en"] as const) {
        const report = projectReport(p, r, lang);
        expect(report).toContain(p.module.sources[0]!.url);
        expect(report).toContain("2026-10-08");
        expect(report).toContain("beta_vmp_pct_c");
        expect(report).toContain("max_current_per_input_a");
        expect(report).toContain("UNKNOWN");
      }
    },
  );
  it("legacy synthetic examples remain accepted and explicitly labelled", () => {
    const p = example();
    expect(p.module.sources[0]!.verification).toBe("SYNTHETIC");
    expect(calculateProject(p).installed_modules).toBe(120);
  });
});
