import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
const root = mkdtempSync(join(tmpdir(), "openpv-cli-"));
const run = (args) =>
  spawnSync(process.execPath, ["build/packages/cli/src/index.js", ...args], {
    encoding: "utf8",
  });
const demo = "data/examples/student-50kw.json",
  results = [];
try {
  let r = run(["validate", demo]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /VALID/);
  results.push("validate: exit 0");
  r = run(["calculate", demo]);
  assert.equal(r.status, 3);
  const result = JSON.parse(r.stdout);
  assert.equal(result.installed_modules, 120);
  results.push("calculate: UNKNOWN exit 3, JSON result 120 modules");
  const report = join(root, "report.md");
  r = run(["report", demo, "--out", report, "--lang", "uk"]);
  assert.equal(r.status, 3);
  assert.match(readFileSync(report, "utf8"), /120\/120/);
  results.push("report: Markdown written, exit 3");
  for (const name of ["trina-435-sma-8", "trina-440-sma-10"]) {
    const file = `data/examples/${name}.json`;
    const input = JSON.parse(readFileSync(file, "utf8"));
    r = run(["validate", file]);
    assert.equal(r.status, 0);
    results.push(`${name}: valid schema, exit 0`);
    r = run(["calculate", file]);
    assert.equal(r.status, 3);
    assert.equal(JSON.parse(r.stdout).status, "UNKNOWN");
    results.push(`${name}: sourced input retains UNKNOWN, exit 3`);
    for (const language of ["uk", "en"]) {
      r = run(["report", file, "--lang", language]);
      assert.equal(r.status, 3);
      assert.ok(r.stdout.includes(input.module.model));
      assert.ok(r.stdout.includes(input.module.sources[0].url));
      assert.ok(r.stdout.includes("2026-10-08"));
      assert.ok(r.stdout.includes("beta_vmp_pct_c"));
      results.push(
        `${name}: ${language} report includes evidence and UNKNOWN, exit 3`,
      );
    }
  }
  r = run(["calculate", "data/examples/constrained-planes.json"]);
  assert.equal(r.status, 3);
  assert.equal(JSON.parse(r.stdout).installed_modules, 58);
  assert.equal(JSON.parse(r.stdout).unassigned_modules, 0);
  results.push(
    "constraint recovery: 58/58, per-inverter power quotas, UNKNOWN scope exit 3",
  );
  r = run(["calculate", "data/examples/source-limited-cable.json"]);
  assert.equal(r.status, 3);
  assert.equal(JSON.parse(r.stdout).dc_lines[0].cable.selected, null);
  results.push(
    "source-limited cable: missing alpha/applicability retain UNKNOWN, exit 3",
  );
  r = run(["calculate", "data/examples/fuse-voltage-fail.json"]);
  assert.equal(r.status, 1);
  assert.ok(
    JSON.parse(r.stdout).checks.some(
      (c) => c.id.endsWith("FUSE_DC_VOLTAGE") && c.status === "FAIL",
    ),
  );
  results.push(
    "manufacturer fuse voltage: 1069.7 V exceeds1000 V rating, FAIL exit1",
  );
  r = run(["calculate", "data/examples/spd-source-limited.json"]);
  assert.equal(r.status, 3);
  assert.ok(
    JSON.parse(r.stdout).checks.some(
      (c) => c.id.endsWith("SPD_TYPE") && c.status === "UNKNOWN",
    ),
  );
  results.push("SPD: LPS true alone leaves required type UNKNOWN, exit3");
  for (const [name, code] of [
    ["dc-switch-source-limited", 3],
    ["dc-switch-voltage-fail", 1],
  ]) {
    r = run(["calculate", `data/examples/${name}.json`]);
    assert.equal(r.status, code);
    const value = JSON.parse(r.stdout);
    assert.ok(
      value.checks.some(
        (c) => c.id.endsWith("DC_SWITCH_SCOPE") && c.status === "UNKNOWN",
      ),
    );
    if (code === 1)
      assert.ok(
        value.checks.some(
          (c) => c.id.endsWith("DC_SWITCH_VOLTAGE") && c.status === "FAIL",
        ),
      );
    results.push(`${name}: explicit operational ratings/scope, exit${code}`);
  }
  r = run([
    "report",
    "data/examples/dc-switch-source-limited.json",
    "--lang",
    "en",
  ]);
  assert.equal(r.status, 3);
  assert.match(r.stdout, /1SCA121456R1001/);
  assert.match(r.stdout, /operational_current_a/);
  results.push(
    "DC switch report: exact SKU/source/profile retained, UNKNOWN exit3",
  );
  const routesFile = "data/examples/individual-routes.json";
  r = run(["validate", routesFile]);
  assert.equal(r.status, 0);
  results.push("individual routes: strict schema exit0");
  r = run(["calculate", routesFile]);
  assert.equal(r.status, 3);
  const routed = JSON.parse(r.stdout);
  assert.deepEqual(
    routed.ac_lines.map((l) => l.circuit_input.length_m),
    [20, 80],
  );
  assert.equal(routed.bom.find((b) => b.item === "dc-demo-4").quantity, 80);
  assert.equal(routed.bom.find((b) => b.item === "ac-demo-50").quantity, 100);
  assert.equal(routed.cable_bom.omitted_routes, 0);
  results.push(
    "individual routes: DC2×(10+30)=80m; AC20+80=100m; UNKNOWN exit3",
  );
  for (const language of ["uk", "en"]) {
    r = run(["report", routesFile, "--lang", language]);
    assert.equal(r.status, 3);
    assert.match(r.stdout, /AC INV2 · OVERRIDE/);
    assert.match(r.stdout, /R\(T\)/);
    assert.match(
      r.stdout,
      language === "uk"
        ? /Аудит кабельних кандидатів/
        : /Cable candidate audit/,
    );
    assert.match(r.stdout, /"length_m":30/);
    results.push(
      `individual routes: ${language} report retains actual conditions/origins`,
    );
  }
  const manualFile = "data/examples/trina435-manual24.json";
  r = run(["validate", manualFile]);
  assert.equal(r.status, 0);
  results.push("real manual case: valid schema exit0");
  r = run(["calculate", manualFile]);
  assert.equal(r.status, 3);
  const manualResult = JSON.parse(r.stdout);
  assert.equal(manualResult.installed_modules, 24);
  assert.equal(manualResult.unassigned_modules, 0);
  const voltages = manualResult.checks.filter((c) => c.id.endsWith(":VOC_DC"));
  assert.equal(voltages.length, 2);
  assert.ok(voltages.every((c) => c.status === "PASS"));
  assert.ok(
    manualResult.checks.some(
      (c) => c.status === "UNKNOWN" && c.missing.includes("beta_vmp_pct_c"),
    ),
  );
  results.push(
    "real manual case: 24/24, known cold Voc PASS; missing beta Vmp UNKNOWN exit3",
  );
  for (const language of ["uk", "en"]) {
    r = run(["report", manualFile, "--lang", language]);
    assert.equal(r.status, 3);
    assert.match(r.stdout, /24\/24/);
    assert.match(r.stdout, /TSM-435NEG9R.28/);
    assert.match(
      r.stdout,
      language === "uk" ? /Походження програми/ : /Software provenance/,
    );
    results.push(
      `real manual case: ${language} report with equipment/software provenance`,
    );
  }
  const overflow = JSON.parse(readFileSync(demo));
  overflow.module.pmax_w = 1e308;
  const overflowFile = join(root, "overflow.json");
  writeFileSync(overflowFile, JSON.stringify(overflow));
  for (const command of ["calculate", "report"]) {
    const output = join(root, "protected-output.txt");
    writeFileSync(output, "existing output");
    r = run([command, overflowFile, "--out", output]);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /numeric range.*requested_dc_power_w/);
    assert.equal(r.stdout, "");
    assert.equal(readFileSync(output, "utf8"), "existing output");
    results.push(
      `${command}: numeric overflow exit2, existing output preserved`,
    );
  }
  const bad = join(root, "bad.json");
  writeFileSync(bad, "{");
  r = run(["validate", bad]);
  assert.equal(r.status, 2);
  results.push("invalid JSON: exit 2");
  const fail = JSON.parse(readFileSync(demo));
  fail.planes[0].module_count = 10000;
  const file = join(root, "fail.json");
  writeFileSync(file, JSON.stringify(fail));
  r = run(["calculate", file]);
  assert.equal(r.status, 1);
  results.push("electrical failure: exit 1");
  writeFileSync(
    "docs/cli-smoke-results.json",
    JSON.stringify({ passed: results.length, checks: results }, null, 2) + "\n",
  );
  console.log(`CLI smoke: ${results.length} checks passed`);
} finally {
  rmSync(root, { recursive: true, force: true });
}
