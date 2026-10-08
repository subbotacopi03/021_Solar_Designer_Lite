import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
const url = process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/";
const suffix = url.startsWith("file:") ? "standalone" : "dev";
const qa = `.qa/routes-${suffix}`;
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
const nav = (tab) => page.locator(`nav [data-tab="${tab}"]`).click();
const field = (side, index, key) =>
  page.locator(
    `[data-route-field="${side}"][data-route-index="${index}"][data-route-key="${key}"]`,
  );
const change = async (side, index, key, value) => {
  await field(side, index, key).fill(value);
  await field(side, index, key).press("Tab");
};
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
  await page
    .locator("#file")
    .setInputFiles("data/examples/individual-routes.json");
  await page.waitForFunction(() =>
    document
      .querySelector(".eyebrow")
      ?.textContent?.includes("Individual cable routes"),
  );
  await nav("site");
  assert.equal(await field("dc", 0, "length_m").inputValue(), "10");
  assert.equal(await field("ac", 1, "length_m").inputValue(), "80");
  checks.push("Imported DC/AC route overrides render independently");
  await change("dc", 0, "length_m", "15");
  await change("ac", 1, "length_m", "60");
  let p = await readProject();
  assert.equal(p.dc_routes[0].circuit.length_m, 15);
  assert.equal(p.ac_routes[1].circuit.length_m, 60);
  await nav("report");
  assert.match(await page.locator("#content").innerText(), /INV 2/);
  const download = page.waitForEvent("download");
  await page.locator("#resultDownload").click();
  await (await download).saveAs(`${qa}/result.json`);
  let result = JSON.parse(readFileSync(`${qa}/result.json`, "utf8"));
  assert.equal(result.bom.find((b) => b.item === "dc-demo-4").quantity, 90);
  assert.equal(result.bom.find((b) => b.item === "ac-demo-50").quantity, 80);
  checks.push("UI/core/report export use actual DC90m and AC80m route totals");
  const save = page.waitForEvent("download");
  await page.locator("#save").click();
  await (await save).saveAs(`${qa}/project.json`);
  await nav("site");
  await change("ac", 1, "length_m", "55");
  await page.locator("#file").setInputFiles(`${qa}/project.json`);
  await page.waitForFunction(
    () =>
      document.querySelector(
        '[data-route-field="ac"][data-route-index="1"][data-route-key="length_m"]',
      )?.value === "60",
  );
  await nav("site");
  assert.equal(await field("ac", 1, "length_m").inputValue(), "60");
  checks.push("Save/load preserves independent route conditions");
  await change("dc", 0, "length_m", "");
  p = await readProject();
  assert.equal(p.dc_routes[0].circuit.length_m, null);
  await nav("report");
  const incomplete = page.waitForEvent("download");
  await page.locator("#resultDownload").click();
  await (await incomplete).saveAs(`${qa}/incomplete.json`);
  assert.match(
    await page.locator("[data-cable-bom-scope]").innerText(),
    /UNKNOWN/,
  );
  result = JSON.parse(readFileSync(`${qa}/incomplete.json`, "utf8"));
  assert.equal(result.dc_lines[0].cable.selected, null);
  assert.equal(result.cable_bom.omitted_routes, 1);
  checks.push(
    "Empty override stays null, omits cable quantity, never falls back",
  );
  p.dc_routes[0].circuit.length_m = 15;
  p.manual_strings[0].modules = 11;
  p.planes[0].module_count = 21;
  await apply(p);
  await nav("site");
  assert.equal(
    await page.locator('[data-route-action="rebind-dc"]').count(),
    1,
  );
  await nav("checks");
  assert.match(await page.locator("#content").innerText(), /s1:ROUTE_STALE/);
  await nav("site");
  await page.locator('[data-route-action="rebind-dc"]').click();
  p = await readProject();
  assert.equal(p.dc_routes[0].target.modules, 11);
  checks.push(
    "Allocation change becomes UNKNOWN until explicit snapshot rebind",
  );
  await nav("site");
  await page
    .locator('[data-route-action="remove-dc"][data-route-index="0"]')
    .click();
  await page
    .locator('[data-route-action="add-dc"][data-route-index="0"]')
    .click();
  p = await readProject();
  assert.deepEqual(p.dc_routes.find((r) => r.target.id === "s1").circuit, p.dc);
  checks.push(
    "Remove restores common input; explicit copy creates full snapshot",
  );
  p.ac_routes.push({ inverter: 3, circuit: p.ac });
  await apply(p);
  await nav("site");
  assert.equal(
    await page.locator('[data-route-action="remove-orphan-ac"]').count(),
    1,
  );
  await page.locator('[data-route-action="remove-orphan-ac"]').click();
  p = await readProject();
  assert.deepEqual(
    p.ac_routes.map((r) => r.inverter),
    [1, 2],
  );
  checks.push("Removed inverter route is visible and removable as orphan");
  await nav("site");
  const beforeDuplicate = structuredClone(p);
  const target = p.manual_strings[0];
  p.manual_strings = [target, structuredClone(target)];
  p.dc_routes = [
    { target: structuredClone(target), circuit: { ...p.dc, length_m: 15 } },
  ];
  await apply(p);
  await nav("site");
  assert.match(
    await page.locator("#cableRoutes").innerText(),
    /ID стрінга повторюється/,
  );
  assert.equal(
    await page.locator('[data-route-action="rebind-dc"]').count(),
    0,
  );
  await nav("report");
  assert.match(
    await page.locator("#content").innerText(),
    /AMBIGUOUS_OVERRIDE/,
  );
  assert.match(
    await page.locator("[data-cable-bom-scope]").innerText(),
    /UNKNOWN/,
  );
  await apply(beforeDuplicate);
  await nav("site");
  checks.push(
    "Duplicate manual IDs never reuse saved route; report quantities remain partial",
  );
  await change("ac", 1, "length_m", "-2");
  assert.equal(await field("ac", 1, "length_m").inputValue(), "60");
  p = await readProject();
  assert.equal(p.ac_routes[1].circuit.length_m, 60);
  checks.push("Invalid route value is rejected and form restores saved value");
  await page.locator("#lang").click();
  await nav("site");
  assert.match(
    await page.locator("#cableRoutes").innerText(),
    /Individual cable routes/,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({ path: `${qa}/mobile.png`, fullPage: true });
  checks.push("English route editor/mobile390px have no document overflow");
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
    `docs/routes-browser-${suffix}-results.json`,
    JSON.stringify(output, null, 2) + "\n",
  );
  console.log(JSON.stringify(output));
} finally {
  await browser.close();
}
