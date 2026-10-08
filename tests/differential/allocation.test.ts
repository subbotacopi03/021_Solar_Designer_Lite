import { describe, it, expect } from "vitest";
import { example } from "../helpers.js";
import {
  generateStringPlan,
  validateStringPlan,
} from "../../packages/core/src/index.js";
function constrained() {
  const p = example();
  p.site.t_min_cell_c = 25;
  p.site.t_max_cell_c = 25;
  // Vmp=42 V at STC: A ceil(252/42)=6..floor(798/42)=19;
  // B 6..10; Voc 19*50=950 V <1100 V. One physical input each.
  p.inverter.mppts = p.inverter.mppts.slice(0, 2).map((m, index) => ({
    ...m,
    min_voltage_v: 252,
    max_voltage_v: index === 0 ? 798 : 420,
    inputs: 1,
    max_strings: 1,
  }));
  p.planes = [
    { id: "E", name: "East", module_count: 10 },
    { id: "W", name: "West", module_count: 19 },
  ];
  return p;
}
describe("bounded allocation recovery", () => {
  it("reserves the only long-string MPPT for the plane that needs it", () => {
    const p = constrained(),
      r = generateStringPlan(p);
    // Independent witness: E10 on B and W19 on A =29; old greedy E10 on A strands nine W modules.
    expect(r.unassigned).toBe(0);
    expect(r.strings.reduce((sum, s) => sum + s.modules, 0)).toBe(29);
    expect(r.strings.find((s) => s.plane_id === "W")?.mppt_id).toBe("MPPT1");
    expect(
      validateStringPlan(p, r.strings).some((c) => c.status === "FAIL"),
    ).toBe(false);
    expect(generateStringPlan(p)).toEqual(r);
  });
  it("recovers with multiple inverter power quotas and separate planes", () => {
    const p = constrained();
    p.inverter_quantity = 2;
    p.inverter.max_dc_power_w = 29 * 585;
    p.planes[0]!.module_count = 20;
    p.planes[1]!.module_count = 38;
    // Per inverter: 19*585 +10*585 =16965 W exactly. Four occupied independent trackers.
    const r = generateStringPlan(p);
    expect(r.unassigned).toBe(0);
    expect(
      validateStringPlan(p, r.strings).filter((c) => c.status === "FAIL"),
    ).toEqual([]);
    expect(r.strings).toHaveLength(4);
  });
  it("reports the recovery size limit without claiming infeasibility", () => {
    const p = constrained();
    p.inverter_quantity = 13;
    p.planes[0]!.module_count = 1;
    const r = generateStringPlan(p);
    expect(r.unassigned).toBe(1);
    expect(
      r.checks.find((c) => c.id === "ALLOCATION_SEARCH_LIMIT")?.status,
    ).toBe("WARN");
  });
  it("missing Vmp coefficient cannot hide a known manual Voc failure", () => {
    const p = example();
    p.module.beta_vmp_pct_c = null;
    const rows = [
      {
        id: "oversized",
        inverter: 1,
        mppt_id: "MPPT1",
        plane_id: "south",
        modules: 20,
      },
    ];
    const checks = validateStringPlan(p, rows);
    expect(checks.find((c) => c.id === "oversized:VOC_DC")?.demand).toBeCloseTo(
      1126,
    );
    expect(checks.find((c) => c.id === "oversized:VOC_DC")?.status).toBe(
      "FAIL",
    );
    expect(checks.find((c) => c.id === "oversized:VMP_MIN")?.status).toBe(
      "UNKNOWN",
    );
  });
  it("manual witness receives the same voltage, current, input and power checks", () => {
    const p = constrained();
    const manual = [
      { id: "E10", inverter: 1, mppt_id: "MPPT2", plane_id: "E", modules: 10 },
      { id: "W19", inverter: 1, mppt_id: "MPPT1", plane_id: "W", modules: 19 },
    ];
    expect(validateStringPlan(p, manual).some((c) => c.status === "FAIL")).toBe(
      false,
    );
    p.inverter.max_dc_power_w = 16964;
    expect(
      validateStringPlan(p, manual).find((c) => c.id === "INV1:DC_POWER")
        ?.status,
    ).toBe("FAIL");
  });
});
