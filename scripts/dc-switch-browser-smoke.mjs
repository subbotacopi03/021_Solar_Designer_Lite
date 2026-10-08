import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
const url = process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/";
const suffix = url.startsWith("file:") ? "standalone" : "dev";
const qa = `.qa/dc-switch-${suffix}`;
mkdirSync(qa, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.OPENPV_CHROMIUM_EXECUTABLE,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(5000);
const errors = [],
  checks = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (e) => {
  if (e.type() === "error") errors.push(e.text());
});
try {
  await page.goto(url);
  await page.waitForSelector(".metric-strip");
  assert.match(await page.title(), /Solar Designer Lite/);
  await page
    .locator("#file")
    .setInputFiles("data/examples/dc-switch-source-limited.json");
  await page.waitForFunction(() =>
    document
      .querySelector(".eyebrow")
      ?.textContent?.includes("DC switch nominal candidate"),
  );
  await page.locator('nav [data-tab="equipment"]').click();
  await page.locator("#dcSwitchCatalog").selectOption("abb-otdc32f2");
  assert.equal(
    await page
      .locator('[data-path="dc_switch_context.rating_id"]')
      .inputValue(),
    "",
  );
  assert.match(await page.locator("#content").innerText(), /1SCA121456R1001/);
  checks.push(
    "Exact SKU/source shown; no operational profile silently selected",
  );
  await page
    .locator('[data-path="dc_switch_context.rating_id"]')
    .selectOption("dc21b-1000-2p");
  await page
    .locator('[data-path="dc_switch_context.scope"]')
    .selectOption("PER_STRING");
  for (const [path, value] of [
    ["required_category", "DC-PV2"],
    ["wiring_diagram", "2a"],
    ["poles", "2"],
  ]) {
    const input = page.locator(`[data-path="dc_switch_context.${path}"]`);
    await input.fill(value);
    await input.press("Tab");
  }
  assert.match(await page.locator(".title-row .status").innerText(), /FAIL/);
  await page.locator('nav [data-tab="checks"]').click();
  assert.match(
    await page.locator("#content").innerText(),
    /DC_SWITCH_CATEGORY/,
  );
  checks.push("DC-PV2 requirement remains FAIL against DC-21B profile");
  await page.locator('nav [data-tab="report"]').click();
  assert.match(await page.locator("#content").innerText(), /OTDC32F2/);
  const reportEvent = page.waitForEvent("download");
  await page.locator("#reportDownload").click();
  await (await reportEvent).saveAs(`${qa}/report.md`);
  assert.match(readFileSync(`${qa}/report.md`, "utf8"), /1SCC301022C0201/);
  checks.push(
    "Rendered/Markdown report retains source and operational profile",
  );
  const saveEvent = page.waitForEvent("download");
  await page.locator("#save").click();
  await (await saveEvent).saveAs(`${qa}/project.json`);
  await page.locator("#file").setInputFiles(`${qa}/project.json`);
  await page.locator('nav [data-tab="equipment"]').click();
  assert.equal(
    await page
      .locator('[data-path="dc_switch_context.required_category"]')
      .inputValue(),
    "DC-PV2",
  );
  checks.push("Save/load preserves exact candidate/context");
  await page
    .locator('[data-path="dc_switch_context.required_category"]')
    .fill("DC-21B");
  await page
    .locator('[data-path="dc_switch_context.required_category"]')
    .press("Tab");
  assert.match(await page.locator(".title-row .status").innerText(), /UNKNOWN/);
  checks.push(
    "Matching nominal category still leaves full installation UNKNOWN",
  );
  await page.locator('nav [data-tab="json"]').click();
  let p = JSON.parse(await page.locator("#json").inputValue());
  p.dc_switch_device.profiles[0].operational_current_a = 21;
  await page.locator("#json").fill(JSON.stringify(p));
  await page.locator("#apply").click();
  p = JSON.parse(await page.locator("#json").inputValue());
  assert.ok(
    p.dc_switch_device.sources.every(
      (s) => s.verification === "USER_INPUT" && !s.sha256 && !s.reviewed_on,
    ),
  );
  checks.push(
    "Manual operational rating edit invalidates verified attribution",
  );
  await page.locator("#lang").click();
  await page.locator('nav [data-tab="equipment"]').click();
  assert.match(
    await page.locator("#content").innerText(),
    /DC switch-disconnector/,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({ path: `${qa}/mobile.png`, fullPage: true });
  checks.push("English controls and mobile390px have no document overflow");
  assert.deepEqual(errors, []);
  checks.push("No page/console errors");
  const result = {
    checked_on: new Date().toISOString(),
    target: url,
    passed: checks.length,
    checks,
    errors,
  };
  writeFileSync(
    `docs/dc-switch-browser-${suffix}-results.json`,
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
