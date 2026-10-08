import { createHash, randomUUID } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import {
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  basename,
} from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
export const REVIEW_FILES = Object.freeze([
  "Solar_Designer_Lite.html",
  "LICENSE",
  "ATTRIBUTION.md",
  "THIRD_PARTY_NOTICES.txt",
  "data/attribution.json",
  "data/examples/trina435-manual24.json",
  "data/examples/student-50kw.json",
  "docs/QUICK_START_UA.md",
  "docs/QUICK_START_EN.md",
]);
const marker = "REVIEW_ONLY.txt",
  manifestName = "PACK_MANIFEST.json",
  sumsName = "SHA256SUMS.txt";
const payload = [...REVIEW_FILES, marker];
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
function contained(root, path) {
  const rel = relative(root, path);
  if (
    rel === ".." ||
    rel.startsWith(".." + (process.platform === "win32" ? "\\" : "/")) ||
    isAbsolute(rel)
  )
    throw Error("Path is outside the selected project");
}
function safeOutput(root, path) {
  contained(root, path);
  let ancestor = path;
  while (!existsSync(ancestor)) ancestor = dirname(ancestor);
  contained(root, realpathSync(ancestor));
}
function sourceBytes(root, path) {
  const absolute = join(root, path);
  if (lstatSync(absolute).isSymbolicLink())
    throw Error(`Symlink input rejected: ${path}`);
  contained(root, realpathSync(absolute));
  if (!lstatSync(absolute).isFile())
    throw Error(`Expected regular input file: ${path}`);
  return readFileSync(absolute);
}
function gitState(root) {
  const top = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: root,
    encoding: "utf8",
  });
  if (top.status !== 0 || resolve(top.stdout.trim()) !== root) return null;
  const revision = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  });
  const status = spawnSync("git", ["status", "--porcelain"], {
    cwd: root,
    encoding: "utf8",
  });
  return {
    commit: revision.status === 0 ? revision.stdout.trim() : null,
    dirty: status.status === 0 ? status.stdout.length > 0 : null,
  };
}
/** Local owner review only. No publication, license choice or directory-wide copying. */
export function createReviewPack({
  projectRoot = process.cwd(),
  outputRoot,
  archive = true,
} = {}) {
  const root = realpathSync(projectRoot),
    output = resolve(root, outputRoot ?? ".qa/review-packs");
  safeOutput(root, output);
  const metadata = JSON.parse(
    sourceBytes(root, "package.json").toString("utf8"),
  );
  assert.match(
    metadata.version,
    /^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/,
    "Unsafe package version",
  );
  const inputs = REVIEW_FILES.map((path) => ({
    path,
    bytes: sourceBytes(root, path),
  }));
  if (archive) {
    const zip = spawnSync("zip", ["-v"], { encoding: "utf8" });
    if (zip.error || zip.status !== 0)
      throw Error(
        "ZIP_TOOL_UNAVAILABLE: install a zip CLI or create a directory with archive:false; no pack created",
      );
  }
  const stamp = new Date().toISOString(),
    name = `openpv-owner-review-${metadata.version}-${stamp.replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`;
  mkdirSync(output, { recursive: true });
  const directory = join(output, name);
  mkdirSync(directory);
  for (const file of inputs) {
    const destination = join(directory, file.path);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, file.bytes, { flag: "wx" });
  }
  writeFileSync(
    join(directory, marker),
    "INTERNAL OWNER REVIEW ONLY\nThis is not a public release or redistribution permission.\nThe existing LICENSE and attribution metadata are copied unchanged.\nEngineering UNKNOWN and incomplete scope remain.\nSHA-256 checks integrity, not authenticity or engineering correctness.\n",
    { flag: "wx" },
  );
  const manifest = {
    format_version: 1,
    product: "OpenPV / Solar Designer Lite",
    version: metadata.version,
    created_utc: stamp,
    release_status: "INTERNAL_OWNER_REVIEW_ONLY",
    project_license: metadata.license ?? "UNKNOWN",
    source_git: gitState(root),
    build_and_tests:
      "NOT_CHECKED_BY_PACK_BUILDER; run pnpm check and browser verification separately",
    files: payload.map((path) => {
      const bytes = readFileSync(join(directory, path));
      return { path, bytes: bytes.length, sha256: digest(bytes) };
    }),
  };
  writeFileSync(
    join(directory, manifestName),
    JSON.stringify(manifest, null, 2) + "\n",
    { flag: "wx" },
  );
  const files = [...payload, manifestName];
  writeFileSync(
    join(directory, sumsName),
    files
      .map((path) => `${digest(readFileSync(join(directory, path)))}  ${path}`)
      .join("\n") + "\n",
    { flag: "wx" },
  );
  verifyReviewPack(directory);
  let archivePath = null,
    archiveSha256 = null;
  if (archive) {
    archivePath = join(output, name + ".zip");
    const zip = spawnSync(
      "zip",
      ["-X", "-q", archivePath, ...files, sumsName],
      { cwd: directory, encoding: "utf8" },
    );
    if (zip.error || zip.status !== 0)
      throw Error(
        `ZIP creation failed; review directory retained: ${directory}`,
      );
    archiveSha256 = digest(readFileSync(archivePath));
    writeFileSync(
      archivePath + ".sha256",
      `${archiveSha256}  ${basename(archivePath)}\n`,
      { flag: "wx" },
    );
  }
  return {
    directory,
    archive: archivePath,
    archive_sha256: archiveSha256,
    release_status: manifest.release_status,
  };
}
export function verifyReviewPack(directory) {
  const root = realpathSync(directory),
    manifest = JSON.parse(sourceBytes(root, manifestName).toString("utf8"));
  assert.equal(
    manifest.release_status,
    "INTERNAL_OWNER_REVIEW_ONLY",
    "Unexpected release status",
  );
  assert.ok(Array.isArray(manifest.files), "Invalid manifest allowlist");
  assert.deepEqual(
    manifest.files.map((f) => f.path).sort(),
    [...payload].sort(),
    "Manifest allowlist mismatch",
  );
  const actual = [];
  function walk(path = "") {
    for (const name of readdirSync(join(root, path))) {
      const child = join(path, name),
        stat = lstatSync(join(root, child));
      assert.ok(!stat.isSymbolicLink(), "Symlink in review pack");
      if (stat.isDirectory()) walk(child);
      else {
        assert.ok(stat.isFile(), "Non-regular file in pack");
        actual.push(child.split("\\").join("/"));
      }
    }
  }
  walk();
  assert.deepEqual(
    actual.sort(),
    [...payload, manifestName, sumsName].sort(),
    "Review pack file list mismatch",
  );
  for (const file of manifest.files) {
    const bytes = readFileSync(join(root, file.path));
    assert.equal(
      bytes.length,
      file.bytes,
      `Size/checksum mismatch: ${file.path}`,
    );
    assert.equal(digest(bytes), file.sha256, `Checksum mismatch: ${file.path}`);
  }
  const checks = readFileSync(join(root, sumsName), "utf8")
    .trim()
    .split("\n")
    .map((line) => {
      const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
      assert.ok(match, "Invalid checksum record");
      return { sha: match[1], path: match[2] };
    });
  assert.deepEqual(
    checks.map((c) => c.path).sort(),
    [...payload, manifestName].sort(),
    "Checksum allowlist mismatch",
  );
  for (const check of checks)
    assert.equal(
      digest(readFileSync(join(root, check.path))),
      check.sha,
      `Checksum mismatch: ${check.path}`,
    );
  return {
    status: "PASS",
    files: actual.length,
    release_status: manifest.release_status,
  };
}
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  try {
    const args = process.argv.slice(2);
    if (args.length === 0)
      console.log(JSON.stringify(createReviewPack(), null, 2));
    else if (args.length === 2 && args[0] === "--verify") {
      const path = resolve(args[1]);
      contained(realpathSync(process.cwd()), realpathSync(path));
      console.log(JSON.stringify(verifyReviewPack(path), null, 2));
    } else
      throw Error(
        "Usage: node scripts/review-pack.mjs [--verify PROJECT_ROOT/review-directory]; public release is not supported",
      );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
