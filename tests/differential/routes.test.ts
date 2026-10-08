import { it, expect } from "vitest";
import {
  calculateProject,
  projectReport,
} from "../../packages/core/src/index.js";
import {
  ProjectSchema,
  type Project,
  type Cable,
} from "../../packages/schema/src/index.js";
import { example } from "../helpers.js";
function fixture() {
  const p = example();
  p.inverter_quantity = 2;
  p.policy.dc_ac_band = null;
  p.policy.dc_drop_max_pct = 3;
  p.dc.conductor_temp_c = 70;
  p.planes = [{ id: "south", name: "South", module_count: 20 }];
  p.manual_strings = [1, 2].map((inverter) => ({
    id: `s${inverter}`,
    inverter,
    mppt_id: p.inverter.mppts[0]!.id,
    plane_id: "south",
    modules: 10,
  }));
  p.cables = p.cables.filter((c) => ["dc-demo-4", "ac-demo-50"].includes(c.id));
  return p;
}
function routes(p: Project, lengths: (number | null)[]) {
  return p.manual_strings!.map((target, i) => ({
    target: structuredClone(target),
    circuit: { ...p.dc, length_m: lengths[i]! },
  }));
}
it("common inputs remain compatible but each inverter has a separate feeder result", () => {
  const p = fixture(),
    r = calculateProject(p);
  expect(r.ac_lines).toHaveLength(2);
  expect(r.ac_lines.map((l) => l.circuit_input.length_m)).toEqual([80, 80]);
  expect(r.ac).toEqual(r.ac_lines[0]!.cable);
  expect(r.dc_lines.every((l) => l.input_origin === "COMMON")).toBe(true);
});
it("DC route BOM sums two conductors per actual route, not common length times strings", () => {
  const p = fixture();
  p.dc_routes = routes(p, [10, 30]);
  const r = calculateProject(p);
  expect(r.dc_lines.map((l) => l.circuit_input.length_m)).toEqual([10, 30]);
  expect(r.bom.find((b) => b.item === "dc-demo-4")?.quantity).toBe(80);
  expect(r.cable_bom.omitted_routes).toBe(0);
});
it("null length in a complete override never inherits the common route", () => {
  const p = fixture();
  p.dc_routes = routes(p, [null, 30]);
  const r = calculateProject(p);
  expect(r.dc_lines[0]!.circuit_input.length_m).toBeNull();
  expect(r.dc_lines[0]!.cable.selected).toBeNull();
  expect(r.bom.find((b) => b.item === "dc-demo-4")?.quantity).toBe(60);
  expect(r.cable_bom.omitted_routes).toBe(1);
  expect(r.checks.find((c) => c.id === "CABLE_BOM_SCOPE")?.status).toBe(
    "UNKNOWN",
  );
});
it("a changed module count makes an override stale instead of silently reusing its length", () => {
  const p = fixture();
  p.dc_routes = routes(p, [10, 30]);
  p.manual_strings![0]!.modules = 11;
  p.planes[0]!.module_count = 21;
  const r = calculateProject(p);
  expect(r.dc_lines[0]!.input_origin).toBe("STALE_OVERRIDE");
  expect(r.dc_lines[0]!.circuit_input.length_m).toBeUndefined();
  expect(r.dc_lines[0]!.cable.selected).toBeNull();
  expect(
    r.checks.some(
      (c) => c.id.endsWith("ROUTE_STALE") && c.status === "UNKNOWN",
    ),
  ).toBe(true);
});
it("orphan routes are explicit UNKNOWN and never enter another route's BOM", () => {
  const p = fixture();
  p.dc_routes = [
    {
      target: { ...p.manual_strings![0]!, id: "removed-string" },
      circuit: { ...p.dc, length_m: 999 },
    },
  ];
  const r = calculateProject(p);
  expect(r.dc_lines.every((l) => l.input_origin === "COMMON")).toBe(true);
  expect(
    r.checks.some(
      (c) => c.id.endsWith("ROUTE_ORPHAN") && c.status === "UNKNOWN",
    ),
  ).toBe(true);
  expect(r.bom.find((b) => b.item === "dc-demo-4")?.quantity).toBe(
    4 * p.dc.length_m!,
  );
});
it("duplicate DC and AC targets are schema errors, not first-match overrides", () => {
  const p = fixture();
  const dc = routes(p, [10, 30])[0]!;
  expect(ProjectSchema.safeParse({ ...p, dc_routes: [dc, dc] }).success).toBe(
    false,
  );
  const ac = { inverter: 1, circuit: p.ac };
  expect(ProjectSchema.safeParse({ ...p, ac_routes: [ac, ac] }).success).toBe(
    false,
  );
});
it("AC routes choose independent sections and sum known one-way feeder lengths", () => {
  const p = fixture();
  const template = p.cables.find((c) => c.circuit === "AC")!;
  const small: Cable = {
    ...template,
    id: "ac-fixture-small",
    section_mm2: 10,
    r20_ohm_km: 1,
    alpha_per_c: 0.004,
    x_ohm_km: 0,
    iz_a: 100,
  };
  p.cables = [
    p.cables[0]!,
    small,
    {
      ...small,
      id: "ac-fixture-large",
      section_mm2: 20,
      r20_ohm_km: 0.5,
      iz_a: 200,
    },
  ];
  p.policy.ac_drop_max_pct = 2;
  p.ac_routes = [
    { inverter: 1, circuit: { ...p.ac, length_m: 20 } },
    { inverter: 2, circuit: { ...p.ac, length_m: 80 } },
  ];
  const r = calculateProject(p);
  expect(r.ac_lines.map((l) => l.cable.selected?.cable.id)).toEqual([
    "ac-fixture-small",
    "ac-fixture-large",
  ]);
  expect(r.ac_lines[0]!.cable.selected?.drop_v).toBeCloseTo(3, 8);
  expect(r.ac_lines[1]!.cable.selected?.drop_v).toBeCloseTo(6, 8);
  expect(r.bom.find((b) => b.item === "ac-fixture-small")?.quantity).toBe(20);
  expect(r.bom.find((b) => b.item === "ac-fixture-large")?.quantity).toBe(80);
});
it("partial AC overrides retain UNKNOWN fields instead of merging common values", () => {
  const p = fixture();
  p.ac_routes = [{ inverter: 2, circuit: { length_m: 20 } }];
  const r = calculateProject(p);
  expect(r.ac_lines[1]!.input_origin).toBe("OVERRIDE");
  expect(r.ac_lines[1]!.circuit_input.conductor_temp_c).toBeUndefined();
  expect(r.ac_lines[1]!.cable.selected).toBeNull();
  expect(r.ac_lines[0]!.cable.selected).not.toBeNull();
});
it("removed inverter AC override is orphaned without losing other feeder results", () => {
  const p = fixture();
  p.ac_routes = [{ inverter: 3, circuit: p.ac }];
  const r = calculateProject(p);
  expect(r.ac_lines).toHaveLength(2);
  expect(
    r.checks.some(
      (c) => c.id === "AC:INV3:ROUTE_ORPHAN" && c.status === "UNKNOWN",
    ),
  ).toBe(true);
});
it("schema/save/load/report retain complete route conditions and origins", () => {
  const p = fixture();
  p.dc_routes = routes(p, [10, 30]);
  p.ac_routes = [{ inverter: 2, circuit: { ...p.ac, length_m: 20 } }];
  const parsed = ProjectSchema.parse(JSON.parse(JSON.stringify(p)));
  expect(parsed.dc_routes).toEqual(p.dc_routes);
  const r = calculateProject(parsed);
  const report = projectReport(parsed, r, "en");
  expect(report).toContain("Cable routes");
  expect(report).toContain("OVERRIDE");
  expect(report).toContain("s2");
  expect(report).toContain('"length_m":30');
});

it.each(["inverter", "mppt_id", "plane_id"] as const)(
  "changed DC %s binding invalidates the saved route",
  (key) => {
    const p = fixture();
    p.dc_routes = routes(p, [10, 30]);
    const row = p.manual_strings![0]!;
    if (key === "inverter") row.inverter = 2;
    else row[key] = "changed-target";
    const r = calculateProject(p);
    expect(r.dc_lines[0]!.input_origin).toBe("STALE_OVERRIDE");
    expect(r.dc_lines[0]!.cable.selected).toBeNull();
  },
);
it("unresolved automatic allocation makes the known cable BOM partial", () => {
  const p = fixture();
  delete p.manual_strings;
  p.module.beta_vmp_pct_c = null;
  const r = calculateProject(p);
  expect(r.strings).toHaveLength(0);
  expect(r.cable_bom.unresolved_dc_layout).toBe(true);
  expect(r.checks.find((c) => c.id === "CABLE_BOM_SCOPE")?.status).toBe(
    "UNKNOWN",
  );
});

it("one saved DC route cannot bind to duplicate manual string IDs", () => {
  const p = fixture();
  p.manual_strings = [
    p.manual_strings![0]!,
    structuredClone(p.manual_strings![0]!),
  ];
  p.dc_routes = [
    {
      target: structuredClone(p.manual_strings[0]!),
      circuit: { ...p.dc, length_m: 10 },
    },
  ];
  const r = calculateProject(p);
  expect(
    r.checks.some((c) => c.id === "DUPLICATE_STRING_ID" && c.status === "FAIL"),
  ).toBe(true);
  expect(r.dc_lines.map((l) => l.input_origin)).toEqual([
    "AMBIGUOUS_OVERRIDE",
    "AMBIGUOUS_OVERRIDE",
  ]);
  expect(r.dc_lines.every((l) => l.cable.selected === null)).toBe(true);
  expect(r.bom.find((b) => b.item === "dc-demo-4")).toBeUndefined();
  expect(r.cable_bom.omitted_routes).toBe(2);
});
it("each DC route uses its own conductor temperature in independent loop-drop arithmetic", () => {
  const p = fixture();
  p.dc_routes = routes(p, [10, 10]);
  p.dc_routes[0]!.circuit.conductor_temp_c = 20;
  p.dc_routes[1]!.circuit.conductor_temp_c = 70;
  const r = calculateProject(p);
  // Synthetic fixture: Ib=14×1.25=17.5 A; R20=4.61; alpha=.00393.
  // DC loop:2×10m/1000×17.5×R(T); no helper-derived expected values.
  expect(r.dc_lines[0]!.cable.selected?.r_ohm_km).toBeCloseTo(4.61, 10);
  expect(r.dc_lines[1]!.cable.selected?.r_ohm_km).toBeCloseTo(5.515865, 10);
  expect(r.dc_lines[0]!.cable.selected?.drop_v).toBeCloseTo(1.6135, 10);
  expect(r.dc_lines[1]!.cable.selected?.drop_v).toBeCloseTo(1.93055275, 10);
});
it("route overrides retain unverified evidence and assess applicability independently", () => {
  const p = fixture(),
    cable = p.cables[0]!;
  const factor = (value: number) => ({
    factor: value,
    basis: "Synthetic route regression",
    sources: cable.sources,
  });
  p.dc = {
    ...p.dc,
    installation_method: "SINGLE_CABLE_OUTDOORS",
    ambient_temp_c: 40,
    grouped_circuits: 1,
    derating_evidence: {
      temperature: factor(0.8),
      grouping: factor(1),
      installation: factor(1),
      applies_to: {
        cable_id: cable.id,
        reference_iz_a: cable.iz_a!,
        reference: null,
        installation_method: "SINGLE_CABLE_OUTDOORS",
        ambient_temp_c: 40,
        conductor_temp_c: 70,
        grouped_circuits: 1,
      },
    },
  };
  p.dc_routes = routes(p, [10, 30]);
  p.dc_routes[0]!.circuit.ambient_temp_c = 60;
  const r = calculateProject(
    ProjectSchema.parse(JSON.parse(JSON.stringify(p))),
  );
  expect(r.dc_lines[0]!.cable.selected).toBeNull();
  expect(
    r.dc_lines[0]!.cable.candidates[0]!.checks.find((c) =>
      c.id.endsWith("DERATING_APPLICABILITY"),
    )?.status,
  ).toBe("UNKNOWN");
  expect(
    r.dc_lines[1]!.cable.candidates[0]!.checks.find((c) =>
      c.id.endsWith("DERATING_APPLICABILITY"),
    )?.status,
  ).toBe("PASS");
  // Synthetic evidence is never upgraded to VERIFIED: applicability alone does not prove selection.
  expect(r.dc_lines[1]!.cable.selected).toBeNull();
  expect(
    r.dc_lines[1]!.cable.candidates[0]!.checks.some((c) =>
      c.missing.includes("verified_derating_sources"),
    ),
  ).toBe(true);
  expect(r.dc_lines[1]!.circuit_input.derating_evidence).toEqual(
    p.dc.derating_evidence,
  );
});

it("Markdown candidate audit retains known FAIL and UNKNOWN reasons with actual route conditions", () => {
  const p = fixture();
  p.dc_routes = routes(p, [null, 30]);
  p.cables[0]!.max_voltage_v = 100;
  const r = calculateProject(p),
    report = projectReport(p, r, "en");
  expect(report).toContain("Cable candidate audit");
  expect(report).toContain("DC s1 · OVERRIDE");
  expect(report).toContain("FAIL · dc-demo-4:VOLTAGE");
  expect(report).toContain("UNKNOWN · dc-demo-4:DROP");
  expect(report).toContain("length_m");
  expect(report).toContain("R(T)");
  expect(report).toContain("synthetic-demo");
  expect(projectReport(p, r, "uk")).toContain("Аудит кабельних кандидатів");
});
