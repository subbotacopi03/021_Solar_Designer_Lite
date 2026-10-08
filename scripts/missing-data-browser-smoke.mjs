import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const target = process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.OPENPV_CHROMIUM_EXECUTABLE,
});
const context = await browser.newContext({
  acceptDownloads: true,
  viewport: { width: 1440, height: 1000 },
});
context.setDefaultTimeout(5000);
const page = await context.newPage(),
  checks = [],
  errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const real = JSON.parse(
  readFileSync("data/examples/trina435-manual24.json", "utf8"),
);
const importProject = async (p) => {
  await page.locator("#file").setInputFiles({
    name: "project.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(p)),
  });
  await page.waitForFunction(
    (n) => document.querySelector(".eyebrow")?.textContent?.includes(n),
    p.name,
  );
};
const navigate = async () => {
  await page.locator('nav [data-tab="checks"]').click();
  await page.waitForSelector("#missingData");
};
const downloadProject = async () => {
  const pending = page.waitForEvent("download");
  await page.locator("#save").click();
  const stream = await (await pending).createReadStream(),
    chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
};
try {
  await page.goto(target);
  await page.waitForSelector(".metric-strip");
  assert.equal(await page.title(), "Solar Designer Lite · OpenPV");
  assert.equal(await page.locator("vite-error-overlay").count(), 0);
  await importProject(real);
  await navigate();
  const beta = page.locator('[data-missing-field="beta_vmp_pct_c"]');
  assert.equal(await beta.count(), 1);
  assert.equal(await beta.getAttribute("data-missing-state"), "MISSING");
  await beta.locator(":scope > summary").click();
  assert.ok((await beta.innerText()).includes("%/°C"));
  assert.ok((await beta.innerText()).includes("UNKNOWN"));
  assert.ok((await beta.innerText()).includes("γPmax − αIsc"));
  checks.push(
    "Real exact-SKU manual case exposes beta gap, units and no-substitution guidance",
  );
  assert.equal(
    await page
      .locator(
        '[data-missing-field="t_max_cell_c"][data-missing-state="MISSING"]',
      )
      .count(),
    0,
  );
  assert.equal(
    await page
      .locator(
        '[data-missing-field="t_max_cell_c"][data-missing-state="PROVIDED"]',
      )
      .count(),
    1,
  );
  assert.equal(
    await page
      .locator('[data-missing-field="max_current_per_input_a"]')
      .count(),
    2,
  );
  checks.push(
    "Known temperature dependencies are provided; MPPT physical-input gaps stay separate",
  );
  await beta.locator("details").last().locator(":scope > summary").click();
  const text = await beta.innerText();
  assert.ok(text.includes(real.module.sources[0].document_revision));
  assert.ok(text.includes(real.module.sources[0].locator));
  assert.ok(text.includes(real.module.sources[0].reviewed_on));
  const link = beta.locator("a").first();
  assert.match(await link.getAttribute("href"), /^https?:/);
  assert.equal(await link.getAttribute("rel"), "noopener noreferrer");
  checks.push(
    "Actual source revision, locator, review date and safe manual link are shown",
  );
  mkdirSync(".qa/missing-data", { recursive: true });
  await page.screenshot({
    path: ".qa/missing-data/desktop.png",
    fullPage: false,
  });
  await beta.locator("button").click();
  assert.equal(
    await page
      .locator('nav [data-tab="equipment"]')
      .getAttribute("aria-current"),
    "page",
  );
  await navigate();
  await page.locator("#lang").click();
  assert.equal(
    await page.locator("#missingDataTitle").innerText(),
    "What needs clarification",
  );
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  checks.push(
    "Guidance links to inputs and switches to English without changing the project",
  );
  const saved = await downloadProject();
  assert.deepEqual(saved, real);
  await page.reload();
  await page.waitForSelector(".metric-strip");
  await navigate();
  assert.equal(
    await page
      .locator('[data-missing-field="beta_vmp_pct_c"]')
      .getAttribute("data-missing-state"),
    "MISSING",
  );
  checks.push(
    "Reading guidance leaves portable JSON untouched and survives autosaved reload",
  );
  const fail = structuredClone(real);
  fail.name = "Known FAIL with missing data";
  fail.manual_strings[0].modules = 25;
  await importProject(fail);
  await navigate();
  assert.equal(await page.locator(".title-row .status").innerText(), "FAIL");
  assert.ok((await page.locator("#missingData").innerText()).includes("FAIL"));
  assert.equal(
    await page
      .locator('[data-missing-field="beta_vmp_pct_c"]')
      .getAttribute("data-missing-state"),
    "MISSING",
  );
  checks.push(
    "Known overvoltage FAIL remains visible alongside UNKNOWN dependencies",
  );
  const cable = JSON.parse(
    readFileSync("data/examples/student-50kw.json", "utf8"),
  );
  cable.name = "Per-feeder missing route";
  cable.ac.length_m = null;
  await importProject(cable);
  await navigate();
  const missingLength = page.locator(
    '[data-missing-scope="ac:0"][data-missing-field="length_m"][data-missing-state="MISSING"]',
  );
  assert.equal(await missingLength.count(), 1);
  await missingLength.locator(":scope > summary").click();
  assert.ok((await missingLength.innerText()).includes("AC INV1"));
  checks.push("Unselected cable candidate gaps are visible per feeder");
  const summary = missingLength.locator(":scope > summary");
  await summary.focus();
  await summary.press("Enter");
  assert.equal(await missingLength.getAttribute("open"), null);
  await summary.press("Enter");
  assert.notEqual(await missingLength.getAttribute("open"), null);
  await page.setViewportSize({ width: 320, height: 740 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.locator("#missingData").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: ".qa/missing-data/mobile.png",
    fullPage: false,
  });
  assert.deepEqual(errors, []);
  checks.push(
    "Mobile 320/390px reflows, details respond to keyboard Enter, no runtime/console errors",
  );
  const hostile = structuredClone(real);
  hostile.name = "Source rendering probe";
  hostile.module.sources[0].url = "javascript:window.__missingInjected=true";
  hostile.module.sources[0].locator =
    '<img src=x onerror="window.__missingInjected=true">';
  await importProject(hostile);
  await navigate();
  const sourceCard = page.locator('[data-missing-field="beta_vmp_pct_c"]');
  await sourceCard.locator(":scope > summary").click();
  await sourceCard
    .locator("details")
    .last()
    .locator(":scope > summary")
    .click();
  assert.equal(await page.locator("#missingData img").count(), 0);
  assert.equal(
    await page.locator('#missingData a[href^="javascript:"]').count(),
    0,
  );
  assert.equal(await page.evaluate(() => window.__missingInjected), undefined);
  assert.ok((await sourceCard.innerText()).includes("<img src=x"));
  assert.deepEqual(errors, []);
  checks.push(
    "Imported HTML-like locators are literal text and unsafe URLs never become active links",
  );
  writeFileSync(
    ".qa/missing-data/browser-results.json",
    JSON.stringify({ target, checks, errors }, null, 2) + "\n",
  );
  console.log(JSON.stringify({ checks, errors }, null, 2));
} finally {
  await browser.close();
}
