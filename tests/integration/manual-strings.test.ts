import { describe, expect, it } from "vitest";
import { calculateProject } from "../../packages/core/src/index.js";
import { example } from "../helpers.js";
import {
  createBlankManualDraft,
  renderManualStrings,
} from "../../apps/designer-lite/src/manual-strings.js";

describe("manual string plan editor", () => {
  it("creates a unique row without inventing a module count", () => {
    const project = example();
    expect(createBlankManualDraft(project, ["s1", "s2"])).toEqual({
      id: "s3",
      inverter: "1",
      mppt_id: project.inverter.mppts[0]!.id,
      plane_id: project.planes[0]!.id,
      modules: "",
    });
  });

  it("renders the beginner controls and warns that checks still apply", () => {
    const project = example();
    const html = renderManualStrings(project, calculateProject(project), "en");
    expect(html).toContain("manualPlan");
    expect(html).toContain("Add string");
    expect(html).toContain("Apply manual plan");
    expect(html).toContain("electrical checks");
  });

  it("preserves imported inverter, MPPT, and plane values with missing targets", () => {
    const project = example();
    project.manual_strings = [
      {
        id: "legacy-string",
        inverter: 2,
        mppt_id: "missing-mppt",
        plane_id: "missing-plane",
        modules: 12,
      },
    ];
    const html = renderManualStrings(project, calculateProject(project), "en");
    expect(html).toContain(
      '<option value="2" selected>Missing target: 2</option>',
    );
    expect(html).toContain(
      '<option value="missing-mppt" selected>Missing target: missing-mppt</option>',
    );
    expect(html).toContain(
      '<option value="missing-plane" selected>Missing target: missing-plane</option>',
    );
  });
});
