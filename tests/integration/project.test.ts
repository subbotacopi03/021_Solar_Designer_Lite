import { it, expect, describe } from "vitest";
import { example } from "../helpers.js";
import {
  calculateProject,
  generateStringPlan,
  projectReport,
} from "../../packages/core/src/index.js";
import {
  ProjectSchema,
  EngineeringCheckSchema,
} from "../../packages/schema/src/index.js";
import { execFileSync, spawnSync } from "node:child_process";
describe("complete project workflow", () => {
  it("120 modules complete, equal input yields equal result", () => {
    const p = example(),
      r = calculateProject(p);
    expect(r.installed_modules).toBe(120);
    expect(r.unassigned_modules).toBe(0);
    expect(r.dc_ac_ratio).toBeCloseTo(1.404);
    expect(r.strings).toHaveLength(7);
    expect(r.ac_current_per_inverter_a).toBeCloseTo(75.9671406828455);
    expect(calculateProject(p)).toEqual(r);
    expect(r.status).toBe("UNKNOWN");
    expect(r.checks.some((c) => c.status === "FAIL")).toBe(false);
  });
  it("generator respects per-inverter max DC power", () => {
    const p = example();
    p.inverter_quantity = 2;
    p.planes[0]!.module_count = 240;
    const r = calculateProject(p);
    expect(r.installed_modules).toBe(240);
    expect(
      r.checks
        .filter((c) => c.id.endsWith("DC_POWER"))
        .every((c) => c.status === "PASS"),
    ).toBe(true);
  });
  it("all result checks conform to schema", () => {
    const r = calculateProject(example());
    for (const c of r.checks)
      expect(EngineeringCheckSchema.safeParse(c).success, c.id).toBe(true);
  });
  it("save/load keeps engineering result", () => {
    const p = example(),
      restored = ProjectSchema.parse(JSON.parse(JSON.stringify(p)));
    expect(calculateProject(restored)).toEqual(calculateProject(p));
  });
  it("BOM DC wire includes both polarity conductors", () => {
    const p = example();
    const r = calculateProject(p);
    const sum = r.bom
      .filter((b) => b.item.startsWith("dc-"))
      .reduce((a, b) => a + b.quantity, 0);
    expect(sum).toBe(r.strings.length * 2 * p.dc.length_m!);
  });
  it("AC per inverter, not total plant current", () => {
    const p = example();
    p.inverter_quantity = 2;
    const r = calculateProject(p);
    expect(r.ac_current_per_inverter_a).toBeCloseTo(75.9671406828455);
    expect(r.bom.find((b) => b.item.startsWith("ac-"))?.quantity).toBe(160);
  });
  it("different planes never parallel on one MPPT", () => {
    const p = example();
    p.planes = [
      { id: "E", name: "East", module_count: 60 },
      { id: "W", name: "West", module_count: 60 },
    ];
    const r = calculateProject(p);
    expect(r.installed_modules).toBe(120);
    for (const s of r.strings)
      expect(
        new Set(
          r.strings
            .filter((x) => x.inverter === s.inverter && x.mppt_id === s.mppt_id)
            .map((x) => x.plane_id),
        ).size,
      ).toBe(1);
  });
  it("insufficient slots gives FAIL with honest remaining count", () => {
    const p = example();
    p.planes[0]!.module_count = 10000;
    const r = calculateProject(p);
    expect(r.status).toBe("FAIL");
    expect(r.unassigned_modules).toBeGreaterThan(0);
  });
  it("missing cable derating never gets default 1", () => {
    const p = example();
    p.ac.derating_factor = null;
    expect(calculateProject(p).ac.selected).toBeNull();
  });
  it("no DC/AC actual means no cables BOM", () => {
    const p = example();
    p.cables = [];
    const r = calculateProject(p);
    expect(r.bom.filter((b) => b.unit === "m")).toHaveLength(0);
    expect(r.ac.selected).toBeNull();
  });
  it("Markdown report preserves failures and unknowns", () => {
    const p = example();
    const report = projectReport(p, calculateProject(p));
    expect(report).toContain("UNKNOWN");
    expect(report).toContain("BOM");
    expect(report).toContain("120/120");
  });
  it("no input mutation", () => {
    const p = example(),
      before = JSON.stringify(p);
    calculateProject(p);
    expect(JSON.stringify(p)).toBe(before);
  });
  it("invalid manual references fail", () => {
    const p = example();
    p.manual_strings = [
      { id: "a", inverter: 99, mppt_id: "bad", plane_id: "bad", modules: 20 },
    ];
    expect(calculateProject(p).status).toBe("FAIL");
  });
  for (let count = 6; count <= 180; count += 6)
    it(`allocation invariants ${count}`, () => {
      const p = example();
      p.planes[0]!.module_count = count;
      const r = generateStringPlan(p);
      expect(r.strings.reduce((a, s) => a + s.modules, 0) + r.unassigned).toBe(
        count,
      );
      expect(r.strings.every((s) => s.modules >= 6 && s.modules <= 19)).toBe(
        true,
      );
      expect(new Set(r.strings.map((s) => s.id)).size).toBe(r.strings.length);
    });
});
