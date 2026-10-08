import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import {
  createReviewPack,
  verifyReviewPack,
  REVIEW_FILES,
} from "./review-pack.mjs";

// Test only the newly created local archive; never open a personal browser profile.
const checks = [],
  errors = [],
  requests = [];
const root = process.cwd();
mkdirSync(".qa/review-pack", { recursive: true });
function command(name, args) {
  const result = spawnSync(name, args, { encoding: "utf8" });
  assert.equal(
    result.status,
    0,
    `${name}: ${result.error?.message ?? result.stderr}`,
  );
  return result.stdout;
}
const pack = createReviewPack();
const archiveBytes = readFileSync(pack.archive);
assert.equal(
  createHash("sha256").update(archiveBytes).digest("hex"),
  pack.archive_sha256,
);
assert.equal(
  readFileSync(pack.archive + ".sha256", "utf8").split("  ")[0],
  pack.archive_sha256,
);
checks.push("Archive SHA-256 and sidecar agree");
command("unzip", ["-t", pack.archive]);
checks.push("ZIP CRC integrity passes");
const names = command("unzip", ["-Z1", pack.archive]).trim().split("\n");
assert.deepEqual(
  names.sort(),
  [
    ...REVIEW_FILES,
    "REVIEW_ONLY.txt",
    "PACK_MANIFEST.json",
    "SHA256SUMS.txt",
  ].sort(),
);
checks.push(
  "ZIP contains exactly 12 allowlisted files and no backups/history/QA",
);
const extracted = resolve(".qa/review-packs", `extracted-${randomUUID()}`);
mkdirSync(extracted);
command("unzip", ["-q", "-n", pack.archive, "-d", extracted]);
assert.equal(verifyReviewPack(extracted).status, "PASS");
for (const path of REVIEW_FILES)
  assert.deepEqual(
    readFileSync(join(extracted, path)),
    readFileSync(join(root, path)),
  );
checks.push(
  "Extracted file sizes/checksums pass and originals match byte-for-byte",
);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.OPENPV_CHROMIUM_EXECUTABLE,
});
try {
  const context = await browser.newContext({
    acceptDownloads: true,
    offline: true,
  });
  context.setDefaultTimeout(5000);
  await context.route(/^https?:/, (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(
    pathToFileURL(join(extracted, "Solar_Designer_Lite.html")).href,
  );
  await page.waitForSelector(".metric-strip");
  assert.equal(await page.title(), "Solar Designer Lite · OpenPV");
  checks.push("Extracted standalone starts offline in a fresh Chrome context");
  const real = JSON.parse(
    readFileSync(
      join(extracted, "data/examples/trina435-manual24.json"),
      "utf8",
    ),
  );
  await page
    .locator("#file")
    .setInputFiles(join(extracted, "data/examples/trina435-manual24.json"));
  await page.waitForFunction(
    (name) => document.querySelector(".eyebrow")?.textContent?.includes(name),
    real.name,
  );
  assert.match(
    await page.locator(".metric").last().innerText(),
    /24\s*\/\s*24/,
  );
  assert.equal(await page.locator(".title-row .status").innerText(), "UNKNOWN");
  await page.locator('nav [data-tab="checks"]').click();
  assert.equal(
    await page
      .locator('[data-missing-field="beta_vmp_pct_c"]')
      .getAttribute("data-missing-state"),
    "MISSING",
  );
  checks.push(
    "Packaged real manual case allocates 24/24 while UNKNOWN and beta gap remain explicit",
  );
  async function download(selector) {
    const pending = page.waitForEvent("download");
    await page.locator(selector).click();
    const stream = await (await pending).createReadStream(),
      chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks).toString("utf8");
  }
  assert.deepEqual(JSON.parse(await download("#save")), real);
  await page.locator('nav [data-tab="report"]').click();
  const report = await download("#reportDownload");
  assert.ok(report.includes("TSM-435NEG9R.28"));
  assert.ok(report.includes("STP8.0-3AV-40"));
  assert.ok(report.includes("UNKNOWN"));
  checks.push(
    "Offline JSON round-trip and equipment/UNKNOWN report export pass",
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  checks.push("No page/console errors or external HTTP requests");
} finally {
  await browser.close();
}
const result = {
  status: "PASS",
  checks,
  pack,
  extracted,
  browser: "Chrome/macOS, fresh offline context",
  clean_machine: "NOT_RUN",
  public_release: "NOT_RUN",
};
writeFileSync(
  ".qa/review-pack/latest-smoke.json",
  JSON.stringify(result, null, 2) + "\n",
);
console.log(JSON.stringify(result, null, 2));
