import { expect, it } from "vitest";
import {
  calculateProject,
  projectReport,
} from "../../packages/core/src/index.js";
import { example } from "../helpers.js";

it("keeps imported identifiers and names as text rather than forged report structure", () => {
  const p = example();
  p.manual_strings = [
    {
      id: "s1\n## Fake result\n- PASS: approved | forged",
      inverter: 1,
      mppt_id: p.inverter.mppts[0]!.id,
      plane_id: p.planes[0]!.id,
      modules: 15,
    },
  ];
  p.name = "Project\n# Fake approval";
  p.module.name = "<img src=x onerror=evil()>";
  p.module.data_notes = [
    "Source\n## Fake manufacturer approval\n[click](javascript:evil)",
  ];
  const before = calculateProject(p);
  const report = projectReport(p, before, "en");
  expect(report).not.toContain("\n## Fake result");
  expect(report).not.toContain("\n- PASS: approved");
  expect(report).not.toContain("\n# Fake approval");
  expect(report).not.toContain("\n## Fake manufacturer approval");
  expect(report).not.toContain("<img");
  expect(report).not.toContain("[click](javascript:evil)");
  expect(report).toContain("Fake result");
  expect(report).toContain("&lt;img");
  expect(calculateProject(p)).toEqual(before);
  expect(p.manual_strings[0]!.id).toContain("\n");
});
