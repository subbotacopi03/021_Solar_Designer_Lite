import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

const INCLUDE_PREFIXES = [
  ".github/",
  "apps/",
  "data/",
  "docs/spec/",
  "packages/",
  "scripts/",
  "tests/",
];
const INCLUDE_FILES = [
  ".gitignore",
  ".ignore",
  ".prettierignore",
  "AGENTS.md",
  "ATTRIBUTION.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "README.md",
  "README_EN.md",
  "START_DEVELOPMENT.cmd",
  "START_DEVELOPMENT.sh",
  "Solar_Designer_Lite.html",
  "THIRD_PARTY_NOTICES.txt",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.build.json",
  "tsconfig.json",
  "vitest.config.ts",
  "docs/ARCHITECTURE.md",
  "docs/CABLE_EVIDENCE.md",
  "docs/DC_SWITCH_EVIDENCE.md",
  "docs/EQUIPMENT_CATALOG.md",
  "docs/FEATURE_MATRIX.md",
  "docs/OPEN_SOURCE_BOUNDARY.md",
  "docs/PROTECTION_EVIDENCE.md",
  "docs/QUICK_START_EN.md",
  "docs/QUICK_START_UA.md",
  "docs/SOURCE_PROVENANCE.md",
  "docs/SPD_EVIDENCE.md",
  "docs/START_HERE_UA.md",
  "docs/STUDENT_EXERCISES.md",
  "docs/designer-lite-mobile.png",
  "docs/designer-lite-overview.png",
  "docs/designer-lite-strings.png",
  "docs/handbook-desktop.png",
  "docs/handbook-mobile.png",
  "docs/example-report.md",
  "docs/example-report.pdf",
  "docs/example-result.json",
];
const PRIVATE_PATTERNS = [
  /\/Users\/[A-Za-z]/,
  /[A-Za-z0-9._%+-]+@(outlook|gmail|hotmail|icloud|ukr)\.[a-z]+/i,
  /Antigravity|NEXT_AI_HANDOFF|IMPLEMENTATION_REPORT|DEVELOPMENT_PLAN/,
];
const BINARY = /\.(png|pdf|zip)$/i;

const target = process.argv[2];
if (!target) {
  console.error("Usage: node scripts/public-export.mjs <empty-target-dir>");
  process.exit(2);
}
const out = resolve(target);
const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const files = tracked.filter(
  (path) =>
    existsSync(path) &&
    (INCLUDE_FILES.includes(path) ||
      INCLUDE_PREFIXES.some((prefix) => path.startsWith(prefix))),
);
const missing = INCLUDE_FILES.filter((path) => !files.includes(path));
if (missing.length) {
  console.error(`Allowlisted files are not tracked: ${missing.join(", ")}`);
  process.exit(1);
}

const leaks = [];
for (const path of files) {
  if (BINARY.test(path)) continue;
  const text = readFileSync(path, "utf8");
  for (const pattern of PRIVATE_PATTERNS)
    if (pattern.test(text) && path !== "scripts/public-export.mjs")
      leaks.push(`${path}: ${pattern}`);
}
if (leaks.length) {
  console.error(`Private content found:\n${leaks.join("\n")}`);
  process.exit(1);
}

for (const path of files) {
  mkdirSync(dirname(join(out, path)), { recursive: true });
  copyFileSync(path, join(out, path));
}
const gitignore = join(out, ".gitignore");
writeFileSync(
  gitignore,
  `${readFileSync(gitignore, "utf8").trimEnd()}\nbuild/\n`,
);
console.log(`Public export: ${files.length} files → ${out}`);
