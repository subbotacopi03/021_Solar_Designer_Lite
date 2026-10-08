import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.OPENPV_CHROMIUM_EXECUTABLE,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [],
  checks = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (e) => {
  if (e.type() === "error") errors.push(e.text());
});
try {
  await page.goto(process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/");
  await page.locator('nav [data-tab="equipment"]').click();
  await page.locator("#moduleCatalog").selectOption("trina-tsm-440neg9r28");
  await page.locator("#inverterCatalog").selectOption("sma-stp10-3av40");
  assert.equal(
    await page.locator('[data-path="module.beta_vmp_pct_c"]').inputValue(),
    "",
  );
  assert.equal(
    await page.locator('[data-path="module.voc_v"]').inputValue(),
    "52.2",
  );
  assert.match(await page.locator("#content").innerText(), /2026-10-08/);
  assert.match(await page.locator("#content").innerText(), /UNKNOWN/);
  checks.push(
    "Exact SKU selection, dated provenance and missing beta remain visible",
  );
  await page.screenshot({ path: ".qa/equipment-desktop.png", fullPage: true });
  await page.locator('nav [data-tab="report"]').click();
  assert.match(await page.locator("#content").innerText(), /TSM-440NEG9R.28/);
  assert.match(await page.locator("#content").innerText(), /STP10.0-3AV-40/);
  const dlEvent = page.waitForEvent("download");
  await page.locator("#reportDownload").click();
  const dl = await dlEvent;
  await dl.saveAs(".qa/sku-report.md");
  assert.match(
    readFileSync(".qa/sku-report.md", "utf8"),
    /static.trinasolar.com/,
  );
  checks.push("Rendered and downloaded report retain SKU and source URL");
  await page.reload();
  await page.locator('nav [data-tab="equipment"]').click();
  assert.equal(
    await page.locator("#moduleCatalog").inputValue(),
    "trina-tsm-440neg9r28",
  );
  checks.push("SKU survives autosave/reload");
  await page.locator('[data-path="module.voc_v"]').fill("52.3");
  await page.locator('[data-path="module.voc_v"]').press("Tab");
  await page.locator('nav [data-tab="json"]').click();
  let p = JSON.parse(await page.locator("#json").inputValue());
  assert.ok(p.module.sources.every((s) => s.verification !== "VERIFIED"));
  checks.push("Manual equipment edit invalidates verified attribution");
  for (const name of ["trina-435-sma-8", "trina-440-sma-10"]) {
    await page.locator("#file").setInputFiles(`data/examples/${name}.json`);
    await page.locator('nav [data-tab="json"]').click();
    p = JSON.parse(await page.locator("#json").inputValue());
    assert.equal(p.module.beta_vmp_pct_c, null);
    assert.match(
      await page.locator(".title-row .status").innerText(),
      /UNKNOWN/,
    );
    checks.push(`${name} schema/core/UI import retains UNKNOWN`);
  }
  await page.locator("#lang").click();
  await page.locator('nav [data-tab="equipment"]').click();
  assert.match(
    await page.locator("#content").innerText(),
    /Manufacturer catalog/,
  );
  checks.push("English catalog and provenance UI");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({ path: ".qa/equipment-mobile.png", fullPage: true });
  checks.push("390px equipment selection has no horizontal document overflow");
  assert.deepEqual(errors, []);
  checks.push("No page or console errors");
  writeFileSync(
    "docs/equipment-browser-results.json",
    JSON.stringify({ passed: checks.length, checks, errors }, null, 2) + "\n",
  );
  console.log(JSON.stringify({ passed: checks.length, errors }));
} finally {
  await browser.close();
}
