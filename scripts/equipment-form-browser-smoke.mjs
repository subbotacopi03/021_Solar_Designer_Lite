import { chromium } from "playwright";
import assert from "node:assert/strict";

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.OPENPV_CHROMIUM_EXECUTABLE,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
const checks = [];
await page.goto(process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/");
await page.waitForSelector(".metric-strip");
await page.setInputFiles("#file", "data/examples/trina435-manual24.json");
await page.waitForFunction(() =>
  document.querySelector(".eyebrow")?.textContent?.includes("Trina"),
);

const project = async () => {
  await page.locator('nav [data-tab="json"]').click();
  const value = JSON.parse(await page.locator("#json").inputValue());
  await page.locator('nav [data-tab="equipment"]').click();
  return value;
};

await page.locator('nav [data-tab="equipment"]').click();
const content = await page.locator("#content").innerText();
assert.ok(content.includes("βVmp, %/°C (від’ємний)"));
assert.ok(content.includes("Vmax MPPT, V"));
const fieldLabels = await page
  .locator("#content label.field > span")
  .allInnerTexts();
assert.ok(!fieldLabels.some((label) => /_(w|v|a|pct_c)$/.test(label)));
checks.push("Equipment fields show engineering labels with units");

const vmax = page.locator('[data-path="inverter.mppts.0.max_voltage_v"]');
await vmax.fill("750");
await vmax.dispatchEvent("change");
let p = await project();
assert.equal(p.inverter.mppts[0].max_voltage_v, 750);
assert.ok(p.inverter.sources.every((s) => s.verification === "USER_INPUT"));
checks.push("MPPT Vmax edit is applied and inverter sources become USER_INPUT");

const vmin = page.locator('[data-path="inverter.mppts.0.min_voltage_v"]');
await vmin.fill("900");
await vmin.dispatchEvent("change");
assert.ok(await page.locator(".toast").count());
p = await project();
assert.equal(p.inverter.mppts[0].min_voltage_v, 260);
checks.push("Invalid MPPT window is rejected and project stays unchanged");

const before = p.inverter.mppts.length;
await page.locator("#addMppt").click();
p = await project();
assert.equal(p.inverter.mppts.length, before + 1);
assert.equal(new Set(p.inverter.mppts.map((m) => m.id)).size, before + 1);
checks.push("Add MPPT copies the last tracker with a unique ID");

await page.locator(`[data-remove-mppt="${before}"]`).click();
p = await project();
assert.equal(p.inverter.mppts.length, before);
checks.push("Remove MPPT deletes the added tracker");

assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks, errors }, null, 2));
await browser.close();
