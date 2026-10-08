import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.OPENPV_CHROMIUM_EXECUTABLE,
});
const page = await browser.newPage();
const checks = [],
  errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
const original = JSON.parse(
  readFileSync("data/examples/student-50kw.json", "utf8"),
);
original.name = "My work to preserve";
try {
  await page.addInitScript((p) => {
    if (!localStorage.getItem("openpv-project-v1"))
      localStorage.setItem("openpv-project-v1", JSON.stringify(p));
  }, original);
  await page.goto(process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/");
  await page.waitForSelector(".metric-strip");
  let prompts = 0;
  page.once("dialog", async (dialog) => {
    prompts++;
    await dialog.dismiss();
  });
  await page.locator("#reset").first().click();
  assert.equal(prompts, 1, "reset must ask before replacing work");
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("openpv-project-v1")).name,
    ),
    original.name,
  );
  checks.push("Cancel replacement preserves UI and autosaved project");
  page.once("dialog", async (dialog) => dialog.accept());
  await page.locator("#reset").first().click();
  assert.notEqual(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("openpv-project-v1")).name,
    ),
    original.name,
  );
  await page.reload();
  await page.waitForSelector(".metric-strip");
  await page.locator("#restorePrevious").click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("openpv-project-v1")).name,
    ),
    original.name,
  );
  checks.push(
    "Accepted replacement retains recoverable previous project across reload",
  );
  await page.locator('nav [data-tab="learn"]').click();
  await page.locator('[data-exercise="missing"]').click();
  await page.locator("#restorePrevious").click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("openpv-project-v1")).name,
    ),
    original.name,
  );
  checks.push("Teaching exercise retains previous project for recovery");
  await page.locator("#file").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"name":"invalid"}'),
  });
  await page.waitForSelector(".toast");
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("openpv-project-v1")).name,
    ),
    original.name,
  );
  checks.push("Invalid import preserves current project");
  await page.locator('nav [data-tab="strings"]').click();
  await page.locator('[data-manual-field="modules"]').first().fill("16");
  let notice = "";
  page.once("dialog", async (dialog) => {
    notice = dialog.message();
    await dialog.accept();
  });
  await page.locator("#reset").first().click();
  assert.ok(notice.includes("Останній застосований"));
  assert.ok(notice.includes("Незастосовані зміни редактора буде відкинуто"));
  await page.locator("#restorePrevious").click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("openpv-project-v1")).name,
    ),
    original.name,
  );
  checks.push(
    "Reset warning distinguishes applied recovery from discarded manual draft",
  );
  assert.deepEqual(errors, []);
  mkdirSync(".qa/project-safety", { recursive: true });
  await page.screenshot({ path: ".qa/project-safety/desktop.png" });
  console.log(JSON.stringify({ checks, errors }, null, 2));
} finally {
  await browser.close();
}
