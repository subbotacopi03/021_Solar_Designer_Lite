import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const options = {
  headless: true,
  executablePath: process.env.OPENPV_CHROMIUM_EXECUTABLE,
};
if (process.env.OPENPV_BUNDLED_CHROMIUM === "1") {
  const bundled = (await import("@sparticuz/chromium")).default;
  options.executablePath =
    process.env.OPENPV_CHROMIUM_EXECUTABLE ?? (await bundled.executablePath());
  options.args = bundled.args;
}
const browser = await chromium.launch(options);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
const checks = [];
await page.goto(process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/");
await page.waitForSelector(".metric-strip");
assert.equal(
  await page.locator(".metric").last().innerText(),
  "Розміщено модулів\n120 / 120",
);
checks.push("Initial demo and 120/120 module allocation");
await page.screenshot({
  path: "docs/designer-lite-overview.png",
  fullPage: true,
});
for (const tab of [
  "equipment",
  "site",
  "strings",
  "checks",
  "report",
  "learn",
  "json",
  "overview",
]) {
  await page.locator(`nav [data-tab="${tab}"]`).click();
  assert.ok(await page.locator("#content").innerText());
}
checks.push("All eight navigation sections");
await page.locator('nav [data-tab="equipment"]').click();
await page.locator('[data-path="module.beta_voc_pct_c"]').fill("0.28");
await page.locator('[data-path="module.beta_voc_pct_c"]').press("Tab");
assert.ok(await page.locator(".toast").count());
assert.ok((await page.locator(".toast").innerText()).includes("βVoc (%/°C)"));
assert.ok(!(await page.locator(".toast").innerText()).includes('"code"'));
assert.equal(
  await page.locator('[data-path="module.beta_voc_pct_c"]').inputValue(),
  "-0.28",
);
checks.push("Positive beta rejected without replacing project");
await page.locator("#save").click();
await page.locator('nav [data-tab="json"]').click();
const saved = JSON.parse(await page.locator("#json").inputValue());
assert.equal(saved.module.beta_voc_pct_c, -0.28);
await page.locator('nav [data-tab="learn"]').click();
await page.locator('[data-exercise="missing"]').click();
assert.ok(
  (await page.locator("#content").innerText()).includes("beta_vmp_pct_c"),
);
assert.ok(
  (await page.locator(".title-row .status").innerText()).includes("UNKNOWN"),
);
checks.push("Missing beta Vmp leads to UNKNOWN");
await page.reload();
await page.waitForSelector(".metric-strip");
assert.equal(
  await page.locator(".metric").last().innerText(),
  "Розміщено модулів\n0 / 120",
);
checks.push("Autosave restored and recalculated");
page.once("dialog", (dialog) => dialog.accept());
await page.locator("#reset").click();
await page.locator("#lang").click();
assert.ok((await page.locator("h1").innerText()).includes("PV electrical"));
checks.push("Ukrainian/English UI switch");
await page.locator("#lang").click();
await page.locator("#file").setInputFiles({
  name: "demo.json",
  mimeType: "application/json",
  buffer: readFileSync("data/examples/two-planes.json"),
});
await page.waitForFunction(() =>
  document.querySelector(".eyebrow")?.textContent?.includes("Дві площини"),
);
assert.equal(
  await page.locator(".metric").last().innerText(),
  "Розміщено модулів\n120 / 120",
);
checks.push("JSON import and two-plane allocation");
await page.locator('nav [data-tab="strings"]').click();
await page.screenshot({
  path: "docs/designer-lite-strings.png",
  fullPage: true,
});
await page.locator('nav [data-tab="report"]').click();
const dlPromise = page.waitForEvent("download");
await page.locator("#reportDownload").click();
const download = await dlPromise;
assert.equal(download.suggestedFilename(), "openpv-report.md");
checks.push("Engineering report download");
await page.emulateMedia({ media: "print" });
assert.equal(
  await page.evaluate(
    () => getComputedStyle(document.documentElement).backgroundColor,
  ),
  "rgb(255, 255, 255)",
);
await page.pdf({
  path: "docs/example-report.pdf",
  format: "A4",
  printBackground: true,
});
checks.push("Printable PDF export");
await page.emulateMedia({ media: "screen" });
await page.setViewportSize({ width: 390, height: 844 });
await page.locator('nav [data-tab="overview"]').click();
await page.screenshot({
  path: "docs/designer-lite-mobile.png",
  fullPage: true,
});
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth,
);
assert.equal(overflow, false);
checks.push("390 px mobile viewport without horizontal document overflow");
assert.deepEqual(errors, []);
checks.push("No browser runtime errors");
writeFileSync(
  "docs/browser-smoke-results.json",
  JSON.stringify(
    {
      target: process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/",
      checks,
      passed: checks.length,
      runtime_errors: errors,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify({ passed: checks.length, runtime_errors: errors }));
await browser.close();
