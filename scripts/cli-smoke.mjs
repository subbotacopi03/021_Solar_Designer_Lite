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
