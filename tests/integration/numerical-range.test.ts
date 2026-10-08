import { describe, expect, it } from "vitest";
import { calculateProject } from "../../packages/core/src/index.js";
import { ProjectSchema } from "../../packages/schema/src/index.js";
import { example } from "../helpers.js";

describe("exported calculation representability", () => {
  it("rejects requested power overflow instead of serializing it to null", () => {
    const project = example();
    project.module.pmax_w = 1e308;
    expect(ProjectSchema.safeParse(project).success).toBe(true);
    // Independent integer arithmetic: mathematical requested power is out of range.
    expect(120n * 10n ** 308n > BigInt(Number.MAX_VALUE)).toBe(true);
    expect(() => calculateProject(project)).toThrow(
      /numeric range.*requested_dc_power_w/,
    );
  });
  it("rejects ratio overflow for finite positive AC power", () => {
    const project = example();
    project.inverter.ac_power_w = 1e-308;
    expect(ProjectSchema.safeParse(project).success).toBe(true);
    // 70,200 / 10^-308 = 702 * 10^309, independently beyond Number.MAX_VALUE.
    expect(702n * 10n ** 309n > BigInt(Number.MAX_VALUE)).toBe(true);
    const before = structuredClone(project);
    expect(() => calculateProject(project)).toThrow(
      /numeric range.*dc_ac_ratio/,
    );
    expect(project).toEqual(before);
  });
});
