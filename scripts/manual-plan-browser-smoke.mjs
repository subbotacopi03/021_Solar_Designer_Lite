import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { calculateProject } from "../build/packages/core/src/index.js";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.OPENPV_CHROMIUM_EXECUTABLE,
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  acceptDownloads: true,
});
const checks = [],
  errors = [];
const original = JSON.parse(
  readFileSync("data/examples/trina-435-sma-8.json", "utf8"),
);
const current = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("openpv-project-v1")));
const rows = page.locator("[data-manual-row]");
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
try {
  await page.goto(process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/");
  await page.waitForSelector(".metric-strip");
  await page.locator("#file").setInputFiles({
    name: "real-project.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(original)),
  });
  await page.waitForFunction(() =>
    document.querySelector(".eyebrow")?.textContent?.includes("TSM-435"),
  );
  await page.locator('nav [data-tab="strings"]').click();
  await page.locator("#manualPlan").waitFor({ timeout: 3000 });
  assert.equal(await rows.count(), 0);
  checks.push(
    "Real source-limited catalog case can enter a manual plan with no automatic allocation",
  );
  await page.locator("#manualPlanAdd").click();
  assert.equal(
    await rows.first().locator('[data-manual-field="modules"]').inputValue(),
    "",
  );
  await page.locator("#manualPlanApply").click();
  assert.equal((await current()).manual_strings, undefined);
  assert.ok((await page.locator(".toast").innerText()).includes("Заповніть"));
  checks.push("Empty module count is explicit and cannot be applied");
  await rows.first().locator('[data-manual-field="modules"]').fill("12");
  await page.locator("#manualPlanAdd").click();
  await rows.nth(1).locator('[data-manual-field="modules"]').fill("12");
  await rows.nth(1).locator('[data-manual-field="mppt_id"]').selectOption("B");
  await page.locator("#manualPlanApply").click();
  assert.equal((await current()).manual_strings.length, 2);
  let calculated = calculateProject(await current());
  assert.equal(calculated.installed_modules, 24);
  assert.equal(calculated.status, "UNKNOWN");
  const vocChecks = calculated.checks.filter((c) => c.id.endsWith(":VOC_DC"));
  assert.equal(vocChecks.length, 2);
  assert.equal(
    vocChecks.every((c) => c.status === "PASS"),
    true,
  );
  assert.ok(
    calculated.checks.some(
      (c) => c.status === "UNKNOWN" && c.missing.includes("beta_vmp_pct_c"),
    ),
  );
  checks.push(
    "24 real modules across two MPPTs: shared known voltage checks and honest missing-data UNKNOWN",
  );
  assert.equal(await page.locator(".title-row .status").innerText(), "UNKNOWN");
  await page.locator('nav [data-tab="report"]').click();
  mkdirSync(".qa/manual-plan", { recursive: true });
  const waiting = page.waitForEvent("download");
  await page.locator("#resultDownload").click();
  const download = await waiting;
  await download.saveAs(".qa/manual-plan/result.json");
  assert.deepEqual(
    JSON.parse(readFileSync(".qa/manual-plan/result.json", "utf8")),
    calculated,
  );
  await page.locator('nav [data-tab="strings"]').click();
  const firstId = await rows
    .first()
    .locator('[data-manual-field="id"]')
    .inputValue();
  await rows.nth(1).locator('[data-manual-field="id"]').fill(firstId);
  await page.locator("#manualPlanApply").click();
  assert.ok((await page.locator(".toast").innerText()).includes("унікальними"));
  assert.notEqual((await current()).manual_strings[1].id, firstId);
  checks.push("Duplicate IDs rejected without replacing saved project");
  await rows.nth(1).locator('[data-manual-field="id"]').fill("s2");
  await rows.first().locator('[data-manual-field="modules"]').fill("25");
  await page.locator("#manualPlanApply").click();
  calculated = calculateProject(await current());
  assert.equal(calculated.status, "FAIL");
  assert.equal(await page.locator(".title-row .status").innerText(), "FAIL");
  assert.ok(
    calculated.checks.some(
      (c) => c.id.endsWith(":VOC_DC") && c.status === "FAIL",
    ),
  );
  await page.locator('nav [data-tab="checks"]').click();
  assert.ok((await page.locator("#content").innerText()).includes("VOC"));
  checks.push(
    "Manual overvoltage remains known FAIL in core and rendered checks",
  );
  await page.reload();
  await page.waitForSelector(".metric-strip");
  await page.locator('nav [data-tab="strings"]').click();
  assert.equal(
    await rows.first().locator('[data-manual-field="modules"]').inputValue(),
    "25",
  );
  await page.locator("#lang").click();
  assert.ok(
    (await page.locator("#manualPlan").innerText()).includes(
      "Apply manual plan",
    ),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  mkdirSync(".qa/manual-plan", { recursive: true });
  await page.locator("#manualPlan").scrollIntoViewIfNeeded();
  await page.screenshot({ path: ".qa/manual-plan/mobile.png" });
  checks.push("Autosave/reload, English controls and mobile table scrolling");
  await page.locator("#manualPlanAuto").click();
  assert.equal((await current()).manual_strings, undefined);
  checks.push("Return to automatic plan removes manual override");
  await page.locator("#manualPlanAdd").click();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.locator('nav [data-tab="overview"]').click();
  assert.equal(
    await page.locator("#manualPlan").isVisible(),
    true,
    "cancel navigation retains unapplied draft",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator('nav [data-tab="overview"]').click();
  assert.equal(await page.locator("#manualPlan").count(), 0);
  await page.locator('nav [data-tab="strings"]').click();
  assert.equal(await rows.count(), 0);
  checks.push("Navigation asks before discarding an unapplied manual draft");
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ checks, errors }, null, 2));
} finally {
  await browser.close();
}
