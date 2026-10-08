import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const definitions = [
  [
    "PV-TEMP",
    "packages/core/src/fundamentals.ts",
    ["moduleVoltageAt", "moduleVmpAt"],
    "Vstc × (1 + beta/100 × (Tcell − 25))",
    "V, %/°C, °C",
  ],
  [
    "AC-CURRENT",
    "packages/core/src/fundamentals.ts",
    ["calculateAcCurrent"],
    "Pout / (k × U × cosPhi); k=√3 or 1",
    "W, V, A",
  ],
  [
    "CABLE-RESISTANCE",
    "packages/core/src/fundamentals.ts",
    ["resistanceAtTemperature"],
    "R20 × (1 + alpha × (Tconductor − 20))",
    "Ω/km, 1/°C, °C",
  ],
  [
    "VOLTAGE-DROP",
    "packages/core/src/fundamentals.ts",
    ["voltageDropV"],
    "k × L/1000 × I × (RcosPhi + XsinPhi)",
    "m, A, Ω/km, V",
  ],
  [
    "STRING-RANGE",
    "packages/core/src/strings.ts",
    [
      "stringLengthRange",
      "parallelCapacity",
      "generateStringPlan",
      "validateStringPlan",
    ],
    "Nmin=ceil(Vmppt_min/Vmp_hot); Nmax=min(floor(Vlimit/Voc_cold),floor(Vmppt_max/Vmp_cold))",
    "V, A, modules",
  ],
  [
    "CABLE-SIZING",
    "packages/core/src/cables.ts",
    ["evaluateCable", "sizeCable"],
    "Ib ≤ In ≤ Iz × derating; ΔU ≤ explicit limit",
    "A, %, mm²",
  ],
  [
    "PROTECTION",
    "packages/core/src/protection.ts",
    ["selectStringFuse", "selectDcIsolator", "checkBreakingCapacity"],
    "Explicit manufacturer ratings and policy; unknown backfeed is not assumed",
    "A, V, kA",
  ],
];
definitions.push([
  "SPD-CANDIDATE",
  "packages/core/src/spd.ts",
  ["assessSpdCandidate"],
  "Separate assembly Ucpv/UocSTC/Iscpv/Up and impulse-waveform limits; explicit context, no LPS-only type choice",
  "V, A, kV, kA8/20µs, kA10/350µs",
]);
definitions.push([
  "DC-SWITCH",
  "packages/core/src/dc-switch.ts",
  ["assessDcSwitchCandidate"],
  "Explicit Ue/Ie/category/poles/wiring profile; per-string nominal assessment, no Ui/Ith substitution",
  "V DC, A, poles",
]);
definitions.push([
  "CABLE-ROUTE-QUANTITY",
  "packages/core/src/routes.ts",
  [
    "resolveDcRoute",
    "resolveAcRoute",
    "orphanRouteChecks",
    "cableRouteQuantities",
  ],
  "Known selected routes only: DC2 × one-way length; AC1 × one-way multicore length; stale/missing routes never use fallback",
  "m, conductors, inverter index",
]);
const manifest = {
  version: "0.1.0",
  hash_basis:
    "Complete UTF-8 source file SHA-256 (conservative change barrier, not approval)",
  formulas: definitions.map(([id, path, symbols, formula, units]) => ({
    id,
    path,
    symbols,
    formula,
    units,
    sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
  })),
};
const target = "docs/spec/formula-manifest.json";
if (process.argv.includes("--update")) {
  writeFileSync(target, JSON.stringify(manifest, null, 2) + "\n");
  console.log("Manifest updated; engineering review still required");
} else {
  const current = JSON.parse(readFileSync(target, "utf8"));
  if (JSON.stringify(current) !== JSON.stringify(manifest)) {
    console.error(
      "Formula source changed. Review formulas and golden tests before manifest:update.",
    );
    process.exitCode = 1;
  } else
    console.log(`Formula manifest: ${manifest.formulas.length} entries match`);
}
