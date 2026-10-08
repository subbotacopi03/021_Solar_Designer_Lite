import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const dir = ".qa/attribution";
mkdirSync(dir, { recursive: true });
const metadata = JSON.parse(readFileSync("data/attribution.json", "utf8"));
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.OPENPV_CHROMIUM_EXECUTABLE,
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [],
  checks = [],
  remote = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (e) => {
  if (e.type() === "error") errors.push(e.text());
});
page.on("request", (request) => {
  if (
    /^https?:/.test(request.url()) &&
    !request.url().startsWith("http://127.0.0.1:5173/")
  )
    remote.push(request.url());
});
try {
  const url = process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/";
  if (url.startsWith("file:")) await context.setOffline(true);
  await page.goto(url);
  await page.waitForSelector(".metric-strip");
  assert.ok((await page.title()).includes("Solar Designer"));
  assert.equal(await page.locator("vite-error-overlay").count(), 0);
  await page.locator("#aboutOpen").click({ timeout: 3000 });
  assert.equal(
    await page.locator("#aboutDialog").evaluate((el) => el.open),
    true,
  );
  checks.push("Visible project credit opens accessible native About dialog");
  const dialog = page.locator("#aboutDialog");
  assert.ok((await dialog.innerText()).includes("MPL-2.0"));
  await dialog.locator("details").nth(1).locator("summary").click();
  assert.ok(
    (await dialog.innerText()).includes("Copyright (c) 2025 Colin McDonnell"),
  );
  assert.ok(
    (await dialog.innerText()).includes("Permission is hereby granted"),
  );
  checks.push("Actual project license and complete bundled Zod MIT notice");
  if (!metadata.copyright_holder || !metadata.source_url) {
    assert.ok(
      (await page.locator(".about-footer").innerText()).includes(
        "Авторство уточнюється",
      ),
    );
    assert.equal(await page.locator("#copyAttribution").isDisabled(), true);
  } else
    assert.ok(
      (await dialog.locator("#attributionCitation").inputValue()).includes(
        metadata.source_url,
      ),
    );
  checks.push(
    "Pending author/source explicit; no invented identity or citation",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page
      .locator("#aboutOpen")
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page.locator("#lang").click();
  await page.locator("#aboutOpen").click();
  assert.ok((await dialog.innerText()).includes("Authorship and licenses"));
  await dialog.locator('button[type="submit"]').click();
  checks.push("Keyboard close restores focus and English translation works");
  await page.locator('nav [data-tab="report"]').click();
  const waiting = page.waitForEvent("download");
  await page.locator("#reportDownload").click();
  const download = await waiting;
  await download.saveAs(`${dir}/report.md`);
  const report = readFileSync(`${dir}/report.md`, "utf8");
  assert.ok(report.includes("Software provenance"));
  assert.ok(report.includes(metadata.project_name));
  checks.push(
    "Markdown download retains software provenance separately from equipment sources",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#aboutOpen").click();
  assert.ok(
    await dialog.evaluate(
      (el) => el.getBoundingClientRect().width <= innerWidth,
    ),
  );
  assert.ok(
    await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  );
  await page.screenshot({ path: `${dir}/mobile.png` });
  await dialog.locator('button[type="submit"]').click();
  checks.push("390px mobile dialog fits and closes");
  assert.deepEqual(errors, []);
  assert.deepEqual(remote, []);
  checks.push(
    "No runtime/console errors or external requests; file target runs offline",
  );
  writeFileSync(
    `${dir}/results.json`,
    JSON.stringify(
      {
        target: url.startsWith("file:")
          ? "standalone file offline"
          : "local dev",
        checks,
        errors,
        remote,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify({ checks, errors, remote }, null, 2));
} finally {
  await browser.close();
}
