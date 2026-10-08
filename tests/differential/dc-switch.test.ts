import { it, expect } from "vitest";
import * as core from "../../packages/core/src/index.js";
import type {
  DcSwitchDevice,
  DcSwitchContext,
} from "../../packages/schema/src/index.js";
import { readFileSync } from "node:fs";
import {
  ProjectSchema,
  DcSwitchDeviceSchema,
} from "../../packages/schema/src/index.js";
import { example } from "../helpers.js";
const device: DcSwitchDevice = {
  id: "abb-otdc32f2",
  name: "ABB OTDC32F2",
  manufacturer: "ABB",
  model: "OTDC32F2 / 1SCA121456R1001",
  insulation_voltage_v: 1250,
  thermal_current_a: 45,
  profiles: [
    {
      id: "dc21b-1000-2p",
      operational_voltage_v: 1000,
      operational_current_a: 20,
      utilization_category: "DC-21B",
      poles: 2,
      circuits: 1,
      wiring_diagrams: ["2a", "2b"],
    },
  ],
  sources: [],
};
const context: DcSwitchContext = {
  rating_id: "dc21b-1000-2p",
  required_category: "DC-21B",
  wiring_diagram: "2a",
  scope: "PER_STRING",
  sources: [],
};
function assess(
  extra: Partial<Parameters<typeof core.assessDcSwitchCandidate>[0]> = {},
) {
  return core.assessDcSwitchCandidate({
    device,
    context,
    voc_cold_v: 900,
    design_current_a: 17.5,
    ...extra,
  });
}
it("checks Ue instead of larger Ui independently of unknown coordination", () => {
  const checks = assess({ voc_cold_v: 19 * 56.3 });
  expect(checks.find((c) => c.id === "DC_SWITCH_VOLTAGE")?.status).toBe("FAIL");
  expect(checks.find((c) => c.id === "DC_SWITCH_SCOPE")?.status).toBe(
    "UNKNOWN",
  );
});
it("checks operational Ie20 rather than model32 or thermal Ith45", () => {
  expect(
    assess({ design_current_a: 25 }).find((c) => c.id === "DC_SWITCH_CURRENT")
      ?.status,
  ).toBe("FAIL");
  expect(assess().find((c) => c.id === "DC_SWITCH_CURRENT")?.status).toBe(
    "PASS",
  );
});
it("cannot substitute DC-21B for an explicit DC-PV2 requirement", () => {
  expect(
    assess({ context: { ...context, required_category: "DC-PV2" } }).find(
      (c) => c.id === "DC_SWITCH_CATEGORY",
    )?.status,
  ).toBe("FAIL");
});
it("rejects an unsupported pole wiring identifier", () => {
  expect(
    assess({ context: { ...context, wiring_diagram: "5a" } }).find(
      (c) => c.id === "DC_SWITCH_WIRING",
    )?.status,
  ).toBe("FAIL");
});
it("missing selected profile or unknown design current remains UNKNOWN", () => {
  expect(
    assess({ context: { ...context, rating_id: null } }).find(
      (c) => c.id === "DC_SWITCH_PROFILE",
    )?.status,
  ).toBe("UNKNOWN");
  expect(
    assess({ design_current_a: null }).find((c) => c.id === "DC_SWITCH_CURRENT")
      ?.status,
  ).toBe("UNKNOWN");
});
it("does not calculate an MPPT combiner from one-string current", () => {
  const checks = assess({ context: { ...context, scope: "MPPT" } });
  expect(checks.find((c) => c.id === "DC_SWITCH_TOPOLOGY")?.status).toBe(
    "UNKNOWN",
  );
  expect(checks.find((c) => c.id === "DC_SWITCH_CURRENT")?.status).toBe(
    "UNKNOWN",
  );
});
it("shared pipeline reports nominal device failures without replacing cable protective In", () => {
  const p = example();
  const before = core.calculateProject(p);
  p.dc_switch_device = device;
  p.dc_switch_context = { ...context, required_category: "DC-PV2" };
  const r = core.calculateProject(p);
  expect(
    r.checks.some(
      (c) => c.id.endsWith(":DC_SWITCH_CATEGORY") && c.status === "FAIL",
    ),
  ).toBe(true);
  expect(r.dc_lines[0]!.cable.selected?.cable.id).toBe(
    before.dc_lines[0]!.cable.selected?.cable.id,
  );
  expect(core.projectReport(p, r)).toContain("1SCA121456R1001");
});
it("declared pole count must match the selected diagram profile", () => {
  expect(
    assess({ context: { ...context, poles: 4 } }).find(
      (c) => c.id === "DC_SWITCH_POLES",
    )?.status,
  ).toBe("FAIL");
});

it("source-limited example survives strict schema/save/load and preserves operational ratings", () => {
  const p = ProjectSchema.parse(
    JSON.parse(
      readFileSync("data/examples/dc-switch-source-limited.json", "utf8"),
    ),
  );
  expect(ProjectSchema.parse(JSON.parse(JSON.stringify(p)))).toEqual(p);
  expect(p.dc_switch_device!.profiles[0]!.operational_current_a).toBe(20);
  expect(p.dc_switch_device!.thermal_current_a).toBe(45);
  expect(core.calculateProject(p).status).toBe("UNKNOWN");
  expect(core.projectReport(p, core.calculateProject(p), "en")).toContain(
    "1SCC301022C0201",
  );
});
it("schema rejects duplicate profile IDs instead of choosing ambiguous manufacturer data", () => {
  expect(
    DcSwitchDeviceSchema.safeParse({
      ...device,
      profiles: [device.profiles[0], device.profiles[0]],
    }).success,
  ).toBe(false);
});
it.each([null, "MPPT", "INVERTER"] as const)(
  "unknown/unsupported scope %s cannot erase known single-string excess",
  (scope) => {
    const checks = assess({
      context: { ...context, scope },
      voc_cold_v: 19 * 56.3,
      design_current_a: 25,
    });
    expect(checks.find((c) => c.id === "DC_SWITCH_VOLTAGE")?.status).toBe(
      "FAIL",
    );
    expect(checks.find((c) => c.id === "DC_SWITCH_CURRENT")?.status).toBe(
      "FAIL",
    );
    expect(checks.find((c) => c.id === "DC_SWITCH_TOPOLOGY")?.status).toBe(
      "UNKNOWN",
    );
  },
);
