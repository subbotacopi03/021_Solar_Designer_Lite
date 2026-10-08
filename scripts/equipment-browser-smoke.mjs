import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
const targetUrl = process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/";
const standalone = targetUrl.startsWith("file:");
const qaDir = standalone ? ".qa/standalone" : ".qa/equipment";
mkdirSync(qaDir, { recursive: true });
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
  await page.goto(targetUrl);
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
  await page.screenshot({
    path: `${qaDir}/equipment-desktop.png`,
    fullPage: true,
  });
  await page.locator('nav [data-tab="report"]').click();
  assert.match(await page.locator("#content").innerText(), /TSM-440NEG9R.28/);
  assert.match(await page.locator("#content").innerText(), /STP10.0-3AV-40/);
  const dlEvent = page.waitForEvent("download");
  await page.locator("#reportDownload").click();
  const dl = await dlEvent;
  await dl.saveAs(`${qaDir}/sku-report.md`);
  assert.match(
    readFileSync(`${qaDir}/sku-report.md`, "utf8"),
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
  await page.locator('nav [data-tab="equipment"]').click();
  await page.locator('[data-path="module.beta_voc_pct_c"]').fill("0.28");
  await page.locator('[data-path="module.beta_voc_pct_c"]').press("Tab");
  await page.locator('nav [data-tab="json"]').click();
  p = JSON.parse(await page.locator("#json").inputValue());
  assert.ok(p.module.beta_voc_pct_c < 0);
  assert.deepEqual(errors, []);
  checks.push(
    "Invalid signed coefficient is rejected without uncaught error or corrupting saved project",
  );

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
  await page.locator('nav [data-tab="json"]').click();
  p = JSON.parse(await page.locator("#json").inputValue());
  p.module.voc_v += 0.1;
  p.inverter.mppts[0].max_current_a += 0.1;
  await page.locator("#json").fill(JSON.stringify(p));
  await page.locator("#apply").click();
  p = JSON.parse(await page.locator("#json").inputValue());
  assert.ok(
    p.module.sources.every(
      (s) => s.verification === "USER_INPUT" && !s.reviewed_on && !s.sha256,
    ),
  );
  assert.ok(p.inverter.sources.every((s) => s.verification === "USER_INPUT"));
  checks.push(
    "Manual JSON equipment changes invalidate verified attribution independently of file import",
  );
  await page
    .locator("#file")
    .setInputFiles("data/examples/constrained-planes.json");
  await page.waitForFunction(() =>
    document
      .querySelector(".metric:last-child")
      ?.textContent?.includes("58 / 58"),
  );
  assert.match(await page.locator(".metric").last().innerText(), /58 \/ 58/);
  await page.locator('nav [data-tab="strings"]').click();
  assert.equal(await page.locator(".mppt-box").count(), 4);
  checks.push("Bounded recovery example allocates 58/58 across four trackers");
  await page.locator('nav [data-tab="site"]').click();
  await page.locator("#cableCatalog").selectOption("nexans");
  assert.match(await page.locator("#content").innerText(), /ID540479078/);
  await page.locator('nav [data-tab="json"]').click();
  p = JSON.parse(await page.locator("#json").inputValue());
  assert.equal(p.cables[0].alpha_per_c, null);
  await page.locator('nav [data-tab="report"]').click();
  const cableDownloadEvent = page.waitForEvent("download");
  await page.locator("#reportDownload").click();
  const cableDownload = await cableDownloadEvent;
  await cableDownload.saveAs(`${qaDir}/cable-report.md`);
  assert.match(readFileSync(`${qaDir}/cable-report.md`, "utf8"), /nexans.co/);
  assert.match(readFileSync(`${qaDir}/cable-report.md`, "utf8"), /α=UNKNOWN/);
  checks.push(
    "Manufacturer cable pack retains UNKNOWN alpha and sourced report",
  );
  await page.locator('nav [data-tab="equipment"]').click();
  await page.locator("#fuseCatalog").selectOption("eaton-pv15a10f");
  assert.match(await page.locator("#content").innerText(), /PV-15A10F/);
  await page
    .locator("#file")
    .setInputFiles("data/examples/fuse-voltage-fail.json");
  await page.waitForFunction(() =>
    document
      .querySelector(".eyebrow")
      ?.textContent?.includes("Fuse voltage counterexample"),
  );
  assert.match(await page.locator(".title-row .status").innerText(), /FAIL/);
  await page.locator('nav [data-tab="checks"]').click();
  assert.match(await page.locator("#content").innerText(), /FUSE_DC_VOLTAGE/);
  checks.push("Exact fuse candidate voltage check surfaces FAIL in UI");
  await page.locator('nav [data-tab="equipment"]').click();
  await page.locator("#spdCatalog").selectOption("phoenix-2800628");
  assert.match(await page.locator("#content").innerText(), /2800628/);
  await page
    .locator("#file")
    .setInputFiles("data/examples/spd-source-limited.json");
  await page.waitForFunction(() =>
    document
      .querySelector(".eyebrow")
      ?.textContent?.includes("SPD nominal candidate"),
  );
  assert.match(await page.locator(".title-row .status").innerText(), /UNKNOWN/);
  await page.locator('nav [data-tab="report"]').click();
  assert.match(await page.locator("#content").innerText(), /2800628/);
  assert.match(await page.locator("#content").innerText(), /SPD_TYPE/);
  checks.push(
    "SPD candidate retains UNKNOWN topology with explicit LPS and sourced report",
  );
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
  await page.locator(".toast").waitFor({ state: "detached" });
  await page.screenshot({
    path: `${qaDir}/equipment-mobile.png`,
    fullPage: true,
  });
  checks.push("390px equipment selection has no horizontal document overflow");
  assert.deepEqual(errors, []);
  checks.push("No page or console errors");
  writeFileSync(
    process.env.OPENPV_BROWSER_RESULTS ??
      (standalone
        ? "docs/standalone-browser-results.json"
        : "docs/equipment-browser-results.json"),
    JSON.stringify(
      {
        checked_on: new Date().toISOString(),
        target: targetUrl,
        viewports: [1440, 390],
        passed: checks.length,
        checks,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify({ passed: checks.length, errors }));
} finally {
  await browser.close();
}
