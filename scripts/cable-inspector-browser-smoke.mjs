import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
const url = process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/";
const suffix = url.startsWith("file:") ? "standalone" : "dev",
  qa = `.qa/inspector-${suffix}`;
mkdirSync(qa, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.OPENPV_CHROMIUM_EXECUTABLE,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(5000);
const checks = [],
  errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (e) => {
  if (e.type() === "error") errors.push(e.text());
});
const nav = (tab) => page.locator(`nav [data-tab="${tab}"]`).click();
const readProject = async () => {
  await nav("json");
  return JSON.parse(await page.locator("#json").inputValue());
};
const apply = async (p) => {
  await nav("json");
  await page.locator("#json").fill(JSON.stringify(p));
  await page.locator("#apply").click();
};
try {
  await page.goto(url);
  await page.waitForSelector(".metric-strip");
  await nav("site");
  await page.waitForSelector("#cableInspector");
  await page
    .locator("#file")
    .setInputFiles("data/examples/individual-routes.json");
  await page.waitForFunction(() =>
    document
      .querySelector(".eyebrow")
      ?.textContent?.includes("Individual cable routes"),
  );
  await nav("site");
  const options = await page.locator("#cableCircuit option").count();
  assert.equal(options, 4);
  let labels = await page.locator("#cableCircuit option").allTextContents();
  const dcIndex = labels.findIndex((s) => s.includes("s1")),
    acIndex = labels.findIndex((s) => /AC/.test(s) && /2/.test(s));
  assert.ok(dcIndex >= 0 && acIndex >= 0);
  const values = await page
    .locator("#cableCircuit option")
    .evaluateAll((xs) => xs.map((x) => x.value));
  await page.locator("#cableCircuit").selectOption(values[dcIndex]);
  assert.match(await page.locator("#cableCandidates").innerText(), /dc-demo-4/);
  await page.locator("#cableCircuit").selectOption(values[acIndex]);
  assert.match(
    await page.locator("#cableCandidates").innerText(),
    /ac-demo-50/,
  );
  checks.push("Inspector distinguishes every DC string and AC inverter feeder");
  const before = await readProject();
  await nav("site");
  await page.locator("#cableCircuit").selectOption(values[dcIndex]);
  assert.deepEqual(await readProject(), before);
  checks.push(
    "Inspecting candidates never changes project or equipment selection",
  );
  let p = structuredClone(before);
  p.dc_routes[0].circuit.length_m = null;
  p.cables[0].max_voltage_v = 100;
  p.cables[0].sources.push({
    ...p.cables[0].sources[0],
    label: "Distinct revision record",
    document_revision: "Independent revision note",
  });
  p.cables[0].name = '<img src=x onerror="window.injected=true">';
  p.cables[0].sources.push({
    id: "unsafe-link",
    label: "untrusted link",
    url: "javascript:alert(1)",
    verification: "USER_INPUT",
  });
  await apply(p);
  await nav("site");
  await page.locator("#cableCircuit").selectOption(values[dcIndex]);
  await page.locator(".cable-candidate > summary").first().click();
  await page.locator(".cable-candidate details > summary").first().click();
  let text = await page.locator("#cableCandidates").innerText();
  assert.match(text, /FAIL/);
  assert.match(text, /UNKNOWN/);
  assert.match(text, /dc-demo-4:VOLTAGE/);
  assert.match(text, /length_m/);
  assert.match(text, /Independent revision note/);
  assert.equal(await page.locator("#cableInspector img").count(), 0);
  assert.equal(
    await page.locator('#cableInspector a[href^="javascript:"]').count(),
    0,
  );
  assert.equal(await page.evaluate(() => Boolean(window.injected)), false);
  checks.push(
    "Known voltage failure and missing length remain visible together; content/URL escaped",
  );
  await nav("report");
  const downloaded = page.waitForEvent("download");
  await page.locator("#reportDownload").click();
  await (await downloaded).saveAs(`${qa}/report.md`);
  const report = readFileSync(`${qa}/report.md`, "utf8");
  assert.match(report, /dc-demo-4:VOLTAGE/);
  assert.match(report, /length_m/);
  assert.match(report, /dc-demo-4/);
  checks.push(
    "Markdown export retains rejected candidate and missing-input diagnostics",
  );
  await page
    .locator("#file")
    .setInputFiles("data/examples/source-limited-cable.json");
  await page.waitForFunction(() =>
    document.querySelector(".eyebrow")?.textContent?.includes("Nexans"),
  );
  await nav("site");
  labels = await page.locator("#cableCircuit option").allTextContents();
  const realDc = labels.findIndex((s) => /DC/.test(s));
  const realValues = await page
    .locator("#cableCircuit option")
    .evaluateAll((xs) => xs.map((x) => x.value));
  assert.ok(realDc >= 0);
  await page.locator("#cableCircuit").selectOption(realValues[realDc]);
  await page.locator(".cable-candidate > summary").first().click();
  await page.locator(".cable-candidate details > summary").first().click();
  text = await page.locator("#cableCandidates").innerText();
  assert.match(text, /ID540479078/);
  assert.match(text, /UNKNOWN/);
  assert.match(text, /alpha/);
  assert.match(text, /VERIFIED/);
  assert.ok(
    (await page
      .locator('#cableCandidates a[href^="https://www.nexans.co/"]')
      .count()) > 0,
  );
  checks.push(
    "Manufacturer source shown while missing alpha/applicability remain UNKNOWN",
  );
  await page.locator("#lang").click();
  await nav("site");
  assert.match(
    await page.locator("#cableInspector").innerText(),
    /Cable candidate/,
  );
  await page.locator("#cableCircuit").focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Tab");
  await page.locator("#cableCircuit").selectOption(realValues[realDc]);
  await page.locator(".cable-candidate > summary").first().click();
  await page.locator(".cable-candidate details > summary").first().click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#cableInspector").scrollIntoViewIfNeeded();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  const checksViewport = page.locator(".cable-candidate .table-wrap").first();
  assert.equal(
    await checksViewport.evaluate((el) => el.scrollWidth > el.clientWidth),
    true,
  );
  assert.equal(
    await page
      .locator(".cable-candidate td")
      .nth(1)
      .evaluate((el) => getComputedStyle(el).whiteSpace),
    "nowrap",
  );
  await page
    .locator(".cable-candidate")
    .first()
    .evaluate((el) => el.scrollIntoView({ block: "start" }));
  await page.screenshot({ path: `${qa}/mobile.png` });
  await checksViewport.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${qa}/checks-mobile.png` });
  checks.push(
    "English/keyboard/mobile390px flow remains usable without document overflow",
  );
  assert.deepEqual(errors, []);
  checks.push("No page/console errors");
  const output = {
    checked_on: new Date().toISOString(),
    target: url,
    passed: checks.length,
    checks,
    errors,
  };
  writeFileSync(
    `docs/inspector-browser-${suffix}-results.json`,
    JSON.stringify(output, null, 2) + "\n",
  );
  console.log(JSON.stringify(output));
} finally {
  await browser.close();
}
