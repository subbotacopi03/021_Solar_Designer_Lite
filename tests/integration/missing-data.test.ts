import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { ProjectSchema } from "../../packages/schema/src/index.js";
import { calculateProject } from "../../packages/core/src/index.js";
import {
  collectMissingData,
  renderMissingData,
} from "../../apps/designer-lite/src/missing-data.js";
import { example } from "../helpers.js";
const real = () =>
  ProjectSchema.parse(
    JSON.parse(readFileSync("data/examples/trina435-manual24.json", "utf8")),
  );

describe("missing-data guidance uses existing engineering findings", () => {
  it("separates missing beta from already provided temperature dependencies", () => {
    const p = real(),
      r = calculateProject(p),
      before = structuredClone({ p, r });
    const groups = collectMissingData(p, r);
    const beta = groups.find((g) => g.path === "module.beta_vmp_pct_c")!;
    expect(beta.state).toBe("MISSING");
    expect(beta.checks.map((c) => c.id).sort()).toEqual([
      "s1:VMP_MAX",
      "s1:VMP_MIN",
      "s2:VMP_MAX",
      "s2:VMP_MIN",
    ]);
    expect(groups.find((g) => g.path === "site.t_max_cell_c")?.state).toBe(
      "PROVIDED",
    );
    expect(beta.sources).toEqual(p.module.sources);
    expect({ p, r }).toEqual(before);
  });
  it("keeps physical connector limits separate for MPPT A and B", () => {
    const p = real();
    const groups = collectMissingData(p, calculateProject(p));
    const inputs = groups.filter((g) => g.field === "max_current_per_input_a");
    expect(inputs).toHaveLength(2);
    expect(inputs.map((g) => g.path)).toEqual([
      "inverter.mppts.0.max_current_per_input_a",
      "inverter.mppts.1.max_current_per_input_a",
    ]);
    expect(inputs.every((g) => g.state === "MISSING")).toBe(true);
    expect(inputs[0]!.checks.map((c) => c.id)).toEqual(["INV1:A:INPUT_IMP"]);
  });
  it("includes unresolved candidate details even when selection has no missing list", () => {
    const p = example();
    p.ac.length_m = null;
    const r = calculateProject(p);
    expect(r.ac_lines[0]!.cable.selected).toBeNull();
    const groups = collectMissingData(p, r).filter(
      (g) => g.field === "length_m" && g.scope === "ac:0",
    );
    expect(groups.length).toBeGreaterThan(0);
    expect(groups.every((g) => g.state === "MISSING")).toBe(true);
    expect(groups[0]!.checks.some((c) => c.id.includes(":DATA"))).toBe(true);
  });
  it("uses effective empty inputs for stale overrides, never saved old length", () => {
    const p = example();
    const first = calculateProject(p).strings[0]!;
    p.manual_strings = [first];
    p.dc_routes = [
      {
        target: { ...first, modules: first.modules + 1 },
        circuit: { length_m: 123 },
      },
    ];
    const r = calculateProject(p);
    const groups = collectMissingData(p, r).filter(
      (g) => g.field === "length_m" && g.scope === "dc:0",
    );
    expect(groups.length).toBeGreaterThan(0);
    expect(groups.every((g) => g.state === "MISSING" && g.value == null)).toBe(
      true,
    );
  });
  it("retains same-ID source variants and renders imported values safely", () => {
    const p = real();
    p.module.sources.push({
      ...p.module.sources[0]!,
      locator: "<img src=x onerror=alert(1)>",
      url: "javascript:alert(1)",
    });
    const r = calculateProject(p);
    const groups = collectMissingData(p, r);
    expect(
      groups.find((g) => g.field === "beta_vmp_pct_c")!.sources,
    ).toHaveLength(2);
    const html = renderMissingData(p, r, "en");
    expect(html).toContain("βVmp");
    expect(html).toContain("%/°C");
    expect(html).toContain("already provided");
    expect(html).toContain("&lt;img");
    expect(html).not.toContain("<img");
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain("TSM_EN_2023_A");
  });
  it("does not hide known FAIL or silently drop unknown dependency keys", () => {
    const p = real();
    p.manual_strings![0]!.modules = 25;
    const r = calculateProject(p);
    r.checks.push({
      id: "future",
      status: "UNKNOWN",
      demand: null,
      capacity: null,
      unit: "",
      utilization: null,
      missing: ["future_input"],
      basis: "Future check",
      source_ids: [],
      message_key: "future",
    });
    expect(r.status).toBe("FAIL");
    expect(
      collectMissingData(p, r).find((g) => g.field === "future_input")?.state,
    ).toBe("REVIEW");
    expect(renderMissingData(p, r, "uk")).toContain("FAIL");
    expect(renderMissingData(p, r, "en")).toContain("future_input");
  });
  it("announces affected-check truncation instead of silently hiding records", () => {
    const p = real(),
      r = calculateProject(p);
    for (let i = 0; i < 101; i++)
      r.checks.push({
        id: `extra-${i}`,
        status: "UNKNOWN",
        demand: null,
        capacity: null,
        unit: "",
        utilization: null,
        missing: ["beta_vmp_pct_c"],
        basis: "Test dependency",
        source_ids: [],
        message_key: "extra",
      });
    expect(renderMissingData(p, r, "en")).toContain(
      "Showing the first 100 checks",
    );
  });
  it("preserves imported equipment names that resemble object property names", () => {
    const p = real();
    p.module.name = "constructor";
    const html = renderMissingData(p, calculateProject(p), "uk");
    expect(html).toContain("constructor · Не задано");
    expect(html).not.toContain("function Object");
  });
});
