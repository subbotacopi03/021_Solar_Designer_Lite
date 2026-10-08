import { it, expect } from "vitest";
import { example } from "../helpers.js";
import {
  CableSchema,
  CircuitInputSchema,
} from "../../packages/schema/src/index.js";
import {
  evaluateCable,
  sizeCable,
  type CableInput,
} from "../../packages/core/src/index.js";
const source = {
  id: "test-reference",
  label: "Explicit synthetic arithmetic fixture, not manufacturer data",
  verification: "SYNTHETIC" as const,
};
const factor = (value: number | null) => ({
  factor: value,
  basis: "Independent arithmetic fixture",
  sources: [source],
});
function input(): CableInput {
  return {
    circuit: "DC",
    ib_a: 20,
    in_a: 25,
    length_m: 20,
    voltage_v: 600,
    required_voltage_v: 1000,
    conductor_temp_c: 70,
    derating_factor: null,
    derating_basis: null,
    drop_limit_pct: 3,
    installation_method: "SINGLE_CABLE_OUTDOORS",
    ambient_temp_c: 60,
    grouped_circuits: 1,
    derating_evidence: {
      temperature: factor(0.8),
      grouping: factor(0.7),
      installation: factor(1),
    },
  } as CableInput;
}
it("preserves source-limited cable resistance as UNKNOWN without inventing alpha", () => {
  const cable = { ...example().cables[0]!, iz_a: 55, alpha_per_c: null };
  expect(CableSchema.safeParse(cable).success).toBe(true);
  const r = evaluateCable(cable as any, input());
  expect(r.r_ohm_km).toBeNull();
  expect(r.drop_v).toBeNull();
  expect(r.status).toBe("UNKNOWN");
});
it("uses the explicit factor product and conductor temperature, not ambient", () => {
  const cable = {
    ...example().cables[0]!,
    iz_a: 55,
    r20_ohm_km: 5.09,
    alpha_per_c: 0.00393,
  };
  const r = evaluateCable(cable, input());
  expect(r.iz_derated_a).toBeCloseTo(30.8, 8);
  expect(r.r_ohm_km).toBeCloseTo(6.090185, 8);
  expect(r.drop_v).toBeCloseTo(4.872148, 8);
});
it("rejects an aggregate factor that contradicts the evidence product", () => {
  const i = input();
  i.derating_factor = 0.9;
  const r = evaluateCable({ ...example().cables[0]!, iz_a: 55 }, i);
  expect(r.checks.find((c) => c.id.endsWith(":DERATING_PRODUCT"))?.status).toBe(
    "FAIL",
  );
});
it("does not auto-select a manufacturer profile without installation applicability", () => {
  const cable = {
    ...example().cables[0]!,
    ampacity_reference: {
      installation_method: "SINGLE_CABLE_OUTDOORS",
      ambient_temp_c: 60,
      conductor_temp_c: null,
      grouped_circuits: 1,
      sources: [source],
    },
  };
  const i = input();
  i.installation_method = "CONDUIT";
  expect(CableSchema.safeParse(cable).success).toBe(true);
  expect(sizeCable([cable], i).selected).toBeNull();
  const r = evaluateCable(cable, i);
  expect(
    r.checks.find((c) => c.id.endsWith(":INSTALLATION_PROFILE"))?.status,
  ).toBe("UNKNOWN");
});
it("structured derating survives schema/save/load without hidden site defaults", () => {
  expect(CircuitInputSchema.safeParse(input()).success).toBe(false); // Not a circuit object: electrical result fields are strict.
  const {
    length_m,
    conductor_temp_c,
    derating_factor,
    derating_basis,
    installation_method,
    ambient_temp_c,
    grouped_circuits,
    derating_evidence,
  } = input();
  const circuit = {
    length_m,
    conductor_temp_c,
    derating_factor,
    derating_basis,
    installation_method,
    ambient_temp_c,
    grouped_circuits,
    derating_evidence,
  };
  expect(CircuitInputSchema.safeParse(circuit).success).toBe(true);
  expect(
    CircuitInputSchema.parse(JSON.parse(JSON.stringify(circuit)))
      .ambient_temp_c,
  ).toBe(60);
});
it("derating evidence is bound to its cable, reference and actual conditions", () => {
  const cable = { ...example().cables[0]!, iz_a: 55 };
  const i = input();
  i.derating_evidence = {
    ...i.derating_evidence!,
    applies_to: {
      cable_id: cable.id,
      reference_iz_a: 55,
      reference: null,
      installation_method: "SINGLE_CABLE_OUTDOORS",
      ambient_temp_c: 60,
      conductor_temp_c: 70,
      grouped_circuits: 1,
    },
  } as any;
  expect(
    evaluateCable(cable, i).checks.find((c) =>
      c.id.endsWith(":DERATING_APPLICABILITY"),
    )?.status,
  ).toBe("PASS");
  i.ambient_temp_c = 100;
  i.grouped_circuits = 10;
  expect(sizeCable([cable], i).selected).toBeNull();
  expect(
    evaluateCable(cable, i).checks.find((c) =>
      c.id.endsWith(":DERATING_APPLICABILITY"),
    )?.status,
  ).toBe("UNKNOWN");
});
