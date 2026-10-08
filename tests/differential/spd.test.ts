import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import * as core from "../../packages/core/src/index.js";
it("keeps SPD candidate assessment separate from the protection stub", () => {
  expect(typeof (core as any).assessSpdCandidate).toBe("function");
});
const device = {
  id: "phoenix-2800628",
  name: "VAL-MS1000DC-PV/2+V",
  type: "T2",
  ucpv_v: 1170,
  max_uoc_stc_v: 975,
  iscpv_a: 2000,
  up_kv: 3.7,
  in_8_20_ka: 15,
  imax_8_20_ka: 40,
  iimp_10_350_ka: null,
  pv_systems: ["ISOLATED", "GROUNDED"],
  sources: [],
};
function assess(extra: Record<string, unknown> = {}) {
  expect(typeof (core as any).assessSpdCandidate).toBe("function");
  return (core as any).assessSpdCandidate({
    device,
    voc_cold_v: 1100,
    voc_stc_v: 1000,
    prospective_current_a: 20,
    ...extra,
  });
}
it("separates cold continuous voltage and the published STC voltage bound", () => {
  const checks = assess();
  expect(checks.find((c: any) => c.id === "SPD_UCPV").status).toBe("PASS");
  expect(checks.find((c: any) => c.id === "SPD_UOC_STC").status).toBe("FAIL");
});
it("LPS presence alone cannot select T1 or T2", () => {
  const checks = assess({
    context: { lps_present: true, requirement_sources: [] },
  });
  expect(checks.find((c: any) => c.id === "SPD_TYPE").status).toBe("UNKNOWN");
  expect(checks.find((c: any) => c.id === "SPD_CONTEXT").missing).toContain(
    "lps_separation_maintained",
  );
});
it("a T2 candidate cannot satisfy an explicit T1 requirement", () => {
  const checks = assess({
    context: {
      required_type: "T1",
      required_iimp_10_350_ka: 12.5,
      requirement_sources: [],
    },
  });
  expect(checks.find((c: any) => c.id === "SPD_TYPE").status).toBe("FAIL");
  expect(checks.find((c: any) => c.id === "SPD_IIMP_10_350").status).toBe(
    "UNKNOWN",
  );
});
it("known short-circuit and device Up violations remain FAIL independently of unknown context", () => {
  const checks = assess({
    prospective_current_a: 2001,
    context: { equipment_impulse_withstand_kv: 3, requirement_sources: [] },
  });
  expect(checks.find((c: any) => c.id === "SPD_ISCPV").status).toBe("FAIL");
  expect(checks.find((c: any) => c.id === "SPD_UP").status).toBe("FAIL");
  expect(checks.find((c: any) => c.id === "SPD_SCOPE").status).toBe("UNKNOWN");
});
it("uses the exact assembly ratings rather than marketing name, UL rating or replacement plug", () => {
  const catalog = JSON.parse(
    readFileSync("data/equipment/verified/spds.json", "utf8"),
  );
  const d = catalog.find((d: any) => d.model === "2800628");
  expect(d.ucpv_v).toBe(1170);
  expect(d.iscpv_a).toBe(2000);
  expect(d.iimp_10_350_ka).toBeNull();
});
it("known array current can prove SPD failure while total backfeed stays unknown", async () => {
  const { example } = await import("../helpers.js");
  const p = example();
  p.planes = [{ id: "south", name: "south", module_count: 10 }];
  p.manual_strings = [
    {
      id: "s1",
      inverter: 1,
      mppt_id: p.inverter.mppts[0]!.id,
      plane_id: "south",
      modules: 10,
    },
  ];
  p.inverter.max_backfeed_current_a = null;
  p.spd_device = {
    ...device,
    type: "T2",
    pv_systems: ["ISOLATED", "GROUNDED"],
    iscpv_a: 10,
  };
  const r = core.calculateProject(p);
  expect(r.checks.find((c) => c.id.endsWith(":SPD_ISCPV"))?.status).toBe(
    "FAIL",
  );
});
it("an SPD current lower bound inside capacity cannot prove PASS without the total", () => {
  const checks = assess({
    prospective_current_a: null,
    known_current_lower_bound_a: 20,
  });
  expect(checks.find((c: any) => c.id === "SPD_ISCPV").status).toBe("UNKNOWN");
});
it("known inverter contribution proves SPD failure even when array factor is unknown", async () => {
  const { example } = await import("../helpers.js");
  const p = example();
  p.planes = [{ id: "south", name: "south", module_count: 10 }];
  p.manual_strings = [
    {
      id: "s1",
      inverter: 1,
      mppt_id: p.inverter.mppts[0]!.id,
      plane_id: "south",
      modules: 10,
    },
  ];
  p.policy.isc_factor = null;
  p.inverter.max_backfeed_current_a = 2001;
  p.spd_device = {
    ...device,
    type: "T2",
    pv_systems: ["ISOLATED", "GROUNDED"],
  };
  expect(
    core.calculateProject(p).checks.find((c) => c.id.endsWith(":SPD_ISCPV"))
      ?.status,
  ).toBe("FAIL");
});
