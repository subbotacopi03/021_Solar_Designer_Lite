import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  calculateProject,
  projectReport,
} from "../../packages/core/src/index.js";
import { example } from "../helpers.js";

describe("software attribution without changing engineering inputs", () => {
  const credit = {
    project_name: "OpenPV / Solar Designer Lite",
    copyright_holder: "Example Author",
    author_url: "https://example.org/author",
    source_url: "https://example.org/openpv",
    version: "0.1.0",
  };
  it("includes supplied author and original source in the exported report", () => {
    const p = example();
    const before = calculateProject(p);
    const report = projectReport(p, before, "uk", credit);
    expect(report).toContain("Походження програми");
    expect(report).toContain("Example Author");
    expect(report).toContain("https://example.org/openpv");
    expect(report).toContain("https://example.org/author");
    expect(calculateProject(p)).toEqual(before);
    expect(p).not.toHaveProperty("copyright_holder");
  });
  it("keeps unconfirmed identity explicit and supports English", () => {
    const p = example();
    const report = projectReport(p, calculateProject(p), "en", {
      ...credit,
      copyright_holder: null,
      author_url: null,
      source_url: null,
    });
    expect(report).toContain("Software provenance");
    expect(report).toContain("Authorship pending confirmation");
    expect(report).not.toContain("Example Author");
    expect(report).toContain("Source: UNKNOWN");
  });
  it("escapes Markdown in identity and does not emit active unsafe links", () => {
    const p = example();
    const report = projectReport(p, calculateProject(p), "en", {
      ...credit,
      copyright_holder: "<script>bad()</script>\n# title [x](javascript:evil)",
      author_url: "javascript:evil",
      source_url: "data:text/html,bad",
    });
    expect(report).toContain("&lt;script&gt;");
    expect(report).not.toContain("](javascript:evil)");
    expect(report).not.toContain("<javascript:evil>");
    expect(report).not.toContain("data:text/html");
    expect(report).not.toContain("\n# title");
  });
  it("checks embedded legal notices against the installed runtime dependency", () => {
    const checked = spawnSync(
      process.execPath,
      ["scripts/legal-notices.mjs", "--check"],
      { encoding: "utf8" },
    );
    expect(checked.status, checked.stderr || checked.stdout).toBe(0);
    const legal = JSON.parse(readFileSync("data/legal-notices.json", "utf8"));
    const packageInfo = JSON.parse(readFileSync("package.json", "utf8"));
    expect(legal.project_license).toBe(packageInfo.license);
    expect(legal.project_license_text).toBe(readFileSync("LICENSE", "utf8"));
    expect(legal.third_party[0].text).toBe(
      readFileSync("node_modules/zod/LICENSE", "utf8"),
    );
    expect(legal.third_party[0].text).toContain(
      "Copyright (c) 2025 Colin McDonnell",
    );
    expect(legal.third_party[0].version).toBe(packageInfo.dependencies.zod);
    expect(
      legal.third_party.some(
        (item: { name: string; text: string }) =>
          item.name === "vite modulepreload helper" &&
          item.text.includes("VoidZero Inc. and Vite contributors"),
      ),
    ).toBe(true);
  });
});
