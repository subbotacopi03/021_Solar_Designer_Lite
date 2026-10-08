import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.OPENPV_CHROMIUM_EXECUTABLE,
});
const url = process.env.OPENPV_TEST_URL ?? "http://127.0.0.1:5173/";
const attempts = [];
async function probe(name, fn, stored) {
  const context = await browser.newContext({ acceptDownloads: true });
  context.setDefaultTimeout(5000);
  context.setDefaultNavigationTimeout(10000);
  const page = await context.newPage();
  try {
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    if (stored)
      await page.addInitScript(
        (p) => localStorage.setItem("openpv-project-v1", JSON.stringify(p)),
        stored,
      );
    await page.goto(url);
    await page.waitForSelector(".metric-strip");
    await fn(page);
    assert(errors.length === 0, "Uncaught browser errors: " + errors.join(";"));
    attempts.push({ name, status: "PASS" });
  } catch (error) {
    attempts.push({ name, status: "FAIL", actual: String(error) });
  } finally {
    await context.close();
  }
}
const assert = (ok, message) => {
  if (!ok) throw Error(message);
};
async function manual(page) {
  await page.locator('nav [data-tab="strings"]').click();
  await page
    .locator("details")
    .filter({ has: page.locator("#manual") })
    .locator("summary")
    .click();
  const rows = JSON.parse(await page.locator("#manual").inputValue());
  rows[0].modules += 1;
  await page.locator("#manual").fill(JSON.stringify(rows));
  return rows;
}
for (const editor of ["manual", "json"]) {
  await probe(editor + " Save refuses unapplied draft", async (page) => {
    if (editor === "manual") await manual(page);
    else {
      await page.locator('nav [data-tab="json"]').click();
      const p = JSON.parse(await page.locator("#json").inputValue());
      p.name = "Draft only";
      await page.locator("#json").fill(JSON.stringify(p));
    }
    let downloaded = false;
    page.on("download", () => (downloaded = true));
    await page.locator("#save").click();
    await page.waitForTimeout(150);
    assert(
      !downloaded,
      "Save downloaded the previous applied project without a draft warning",
    );
    assert(
      await page.locator(".toast").count(),
      "No explanation for blocked Save",
    );
  });
  await probe(
    editor + " cancelled navigation preserves draft",
    async (page) => {
      let value;
      if (editor === "manual") {
        await manual(page);
        value = await page.locator("#manual").inputValue();
      } else {
        await page.locator('nav [data-tab="json"]').click();
        value = await page.locator("#json").inputValue();
        await page.locator("#json").fill(value + " ");
        value += " ";
      }
      let prompts = 0;
      page.on("dialog", async (dialog) => {
        prompts++;
        await dialog.dismiss();
      });
      await page.locator('nav [data-tab="overview"]').click();
      assert(prompts === 1, "No discard confirmation");
      assert(
        (await page.locator("#" + editor).inputValue()) === value,
        "Draft changed on cancelled navigation",
      );
    },
  );
}
await probe("Invalid advanced plan retains draft", async (page) => {
  const rows = await manual(page);
  rows[0].modules = -1;
  const value = JSON.stringify(rows);
  await page.locator("#manual").fill(value);
  await page.locator("#manualApply").click();
  assert(
    (await page.locator("#manual").inputValue()) === value,
    "Invalid plan was silently replaced after validation failure",
  );
});
await probe(
  "Applying native plan guards competing advanced draft",
  async (page) => {
    await manual(page);
    await page.locator('[data-manual-field="modules"]').first().fill("10");
    let prompts = 0;
    page.on("dialog", async (dialog) => {
      prompts++;
      await dialog.dismiss();
    });
    await page.locator("#manualPlanApply").click();
    assert(prompts === 1, "Competing advanced draft silently discarded");
    assert(
      (await page
        .locator('[data-manual-field="modules"]')
        .first()
        .inputValue()) === "10",
      "Native draft lost",
    );
  },
);
for (const editor of ["manual", "json"]) {
  await probe(
    editor + " Apply commits own draft without discard prompt",
    async (page) => {
      let expected;
      if (editor === "manual") {
        expected = await manual(page);
      } else {
        await page.locator('nav [data-tab="json"]').click();
        expected = JSON.parse(await page.locator("#json").inputValue());
        expected.name = "Applied JSON draft";
        await page.locator("#json").fill(JSON.stringify(expected));
      }
      let prompts = 0;
      page.on("dialog", async (d) => {
        prompts++;
        await d.dismiss();
      });
      await page
        .locator(editor === "manual" ? "#manualApply" : "#apply")
        .click();
      assert(prompts === 0, "Applying own draft asked to discard it");
      const download = page.waitForEvent("download");
      await page.locator("#save").click();
      const saved = await download;
      const stream = await saved.createReadStream();
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const actual = JSON.parse(Buffer.concat(chunks).toString());
      assert(
        editor === "manual"
          ? actual.manual_strings[0].modules === expected[0].modules
          : actual.name === expected.name,
        "Applied edit missing from download",
      );
    },
  );
}
await probe(
  "Applying advanced plan guards competing native draft",
  async (page) => {
    await manual(page);
    await page.locator('[data-manual-field="modules"]').first().fill("10");
    let prompts = 0;
    page.on("dialog", async (d) => {
      prompts++;
      await d.dismiss();
    });
    await page.locator("#manualApply").click();
    assert(prompts === 1, "Competing native draft lost");
    assert(
      (await page
        .locator('[data-manual-field="modules"]')
        .first()
        .inputValue()) === "10",
      "Native draft changed",
    );
  },
);
// Deterministic async scheduling: release stale read only after newer action.
const demo = JSON.parse(
  readFileSync("data/examples/student-50kw.json", "utf8"),
);
for (const action of ["edit", "reset", "exercise", "second-import"]) {
  await probe("Pending import cannot overwrite " + action, async (page) => {
    await page.evaluate(() => {
      const original = File.prototype.text;
      window.releaseRead = {};
      File.prototype.text = function () {
        const file = this;
        return new Promise((resolve) => {
          window.releaseRead[file.name] = () =>
            original.call(file).then(resolve);
        });
      };
    });
    const load = async (name, project) => {
      await page.locator("#file").setInputFiles({
        name,
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(project)),
      });
      await page.waitForFunction(
        (n) => typeof window.releaseRead[n] === "function",
        name,
      );
    };
    const release = async (name) => {
      await page.evaluate((n) => window.releaseRead[n](), name);
      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 50)),
      );
    };
    await load("older.json", { ...demo, name: "Stale import" });
    let expectedName = demo.name;
    if (action === "edit") {
      expectedName = "Newer edit";
      await page.locator('[data-path="name"]').fill(expectedName);
      await page.locator('[data-path="name"]').press("Tab");
    }
    if (action === "reset") {
      page.once("dialog", (d) => d.accept());
      await page.locator("#reset").click();
    }
    if (action === "exercise") {
      await page.locator('nav [data-tab="learn"]').click();
      await page.locator('[data-exercise="cold"]').click();
    }
    if (action === "second-import") {
      expectedName = "Newer import";
      await load("newer.json", { ...demo, name: expectedName });
      await release("newer.json");
    }
    await release("older.json");
    const current = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("openpv-project-v1")),
    );
    assert(
      current.name === expectedName,
      "Older read replaced " + action + ": " + current.name,
    );
    if (action === "exercise")
      assert(current.site.t_min_cell_c === -35, "Exercise value replaced");
  });
}
for (const kind of ["power", "ratio"]) {
  await probe(
    "Unrepresentable " + kind + " edit rejected without losing draft",
    async (page) => {
      await page.locator('nav [data-tab="json"]').click();
      const bad = structuredClone(demo);
      if (kind === "power") bad.module.pmax_w = 1e308;
      else bad.inverter.ac_power_w = 1e-308;
      const draft = JSON.stringify(bad);
      await page.locator("#json").fill(draft);
      await page.locator("#apply").click();
      assert(
        (await page.locator(".toast").innerText()).includes(
          "числовий діапазон",
        ),
        "No localized arithmetic error",
      );
      assert(
        (await page.locator("#json").inputValue()) === draft,
        "Rejected arithmetic edit lost",
      );
      assert(
        (await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("openpv-project-v1")).module.pmax_w,
        )) === 585,
        "Applied state corrupted",
      );
    },
    demo,
  );
}
await probe(
  "Unrepresentable import preserves applied state",
  async (page) => {
    const bad = { ...demo, module: { ...demo.module, pmax_w: 1e308 } };
    await page.locator("#file").setInputFiles({
      name: "overflow.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(bad)),
    });
    await page.waitForSelector(".toast");
    assert(
      (await page.locator(".toast").innerText()).includes("числовий діапазон"),
      "No import range error",
    );
    assert(
      (await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("openpv-project-v1")).module.pmax_w,
      )) === 585,
      "Import replaced saved state",
    );
  },
  demo,
);
const impossible = { ...demo, module: { ...demo.module, pmax_w: 1e308 } };
await probe(
  "Unrepresentable stored project warns and preserves original JSON",
  async (page) => {
    assert(
      (await page.locator(".toast").innerText()).includes(
        "Збережений JSON не змінено",
      ),
      "No startup fallback explanation",
    );
    assert(
      (await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("openpv-project-v1")).module.pmax_w,
      )) === 1e308,
      "Startup overwrote original",
    );
    assert(
      !(await page.locator(".metric-strip").innerText()).includes("∞"),
      "Fallback result is not representable",
    );
  },
  impossible,
);
await browser.close();
console.log(JSON.stringify(attempts, null, 2));
mkdirSync(".qa/adversarial-regression", { recursive: true });
writeFileSync(
  ".qa/adversarial-regression/results.json",
  JSON.stringify({ target: url, attempts }, null, 2) + "\n",
);
process.exitCode = attempts.some((a) => a.status === "FAIL") ? 1 : 0;
