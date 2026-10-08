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
