import { describe, expect, it } from "vitest";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  symlinkSync,
  existsSync,
  renameSync,
} from "node:fs";
import { join, dirname } from "node:path";
import {
  createReviewPack,
  verifyReviewPack,
  REVIEW_FILES,
} from "../../scripts/review-pack.mjs";
function fixture() {
  mkdirSync(join(process.cwd(), ".qa/review-pack"), { recursive: true });
  const root = mkdtempSync(join(process.cwd(), ".qa/review-pack/fixture-"));
  for (const path of REVIEW_FILES) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), path);
  }
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ version: "0.1.0", license: "UNLICENSED" }),
  );
  return root;
}
describe("local owner review distribution", () => {
  it("includes only the explicit runtime/guide/example/legal allowlist", () => {
    const root = fixture();
    writeFileSync(join(root, ".env"), "not for export");
    mkdirSync(join(root, "_previous_workspace_test"));
    writeFileSync(
      join(root, "_previous_workspace_test", "secret.txt"),
      "private",
    );
    const pack = createReviewPack({ projectRoot: root, archive: false });
    expect(verifyReviewPack(pack.directory).status).toBe("PASS");
    const manifest = JSON.parse(
      readFileSync(join(pack.directory, "PACK_MANIFEST.json"), "utf8"),
    );
    expect(manifest.release_status).toBe("INTERNAL_OWNER_REVIEW_ONLY");
    expect(manifest.files.map((f: { path: string }) => f.path).sort()).toEqual(
      [...REVIEW_FILES, "REVIEW_ONLY.txt"].sort(),
    );
    expect(existsSync(join(pack.directory, ".env"))).toBe(false);
    expect(
      readFileSync(join(pack.directory, "SHA256SUMS.txt"), "utf8"),
    ).toContain("PACK_MANIFEST.json");
  });
  it("detects corrupted payload, extra files and manifest path traversal", () => {
    const root = fixture();
    const pack = createReviewPack({ projectRoot: root, archive: false });
    writeFileSync(join(pack.directory, "Solar_Designer_Lite.html"), "tampered");
    expect(() => verifyReviewPack(pack.directory)).toThrow(/checksum/i);
    const second = createReviewPack({ projectRoot: root, archive: false });
    writeFileSync(join(second.directory, "unexpected.txt"), "extra");
    expect(() => verifyReviewPack(second.directory)).toThrow(/file list/i);
    const third = createReviewPack({ projectRoot: root, archive: false });
    const manifest = JSON.parse(
      readFileSync(join(third.directory, "PACK_MANIFEST.json"), "utf8"),
    );
    manifest.files[0].path = "../outside";
    writeFileSync(
      join(third.directory, "PACK_MANIFEST.json"),
      JSON.stringify(manifest),
    );
    expect(() => verifyReviewPack(third.directory)).toThrow(/allowlist/i);
  });
  it("rejects symlinked input rather than packaging its target", () => {
    const root = fixture();
    const source = join(root, "unlisted.txt");
    writeFileSync(source, "private target");
    const html = join(root, "Solar_Designer_Lite.html");
    renameSync(html, html + ".original");
    symlinkSync(source, html);
    expect(() =>
      createReviewPack({ projectRoot: root, archive: false }),
    ).toThrow(/symlink/i);
    const parentRoot = fixture(),
      otherRoot = fixture();
    renameSync(join(parentRoot, "docs"), join(parentRoot, "docs-original"));
    symlinkSync(join(otherRoot, "docs"), join(parentRoot, "docs"), "dir");
    expect(() =>
      createReviewPack({ projectRoot: parentRoot, archive: false }),
    ).toThrow(/outside/i);
    expect(readFileSync(source, "utf8")).toBe("private target");
  });
  it("rejects output paths outside the selected project", () => {
    const root = fixture();
    expect(() =>
      createReviewPack({
        projectRoot: root,
        outputRoot: dirname(root),
        archive: false,
      }),
    ).toThrow(/outside/i);
  });
  it("rejects a symlinked manifest before reading its target", () => {
    const root = fixture(),
      pack = createReviewPack({ projectRoot: root, archive: false });
    const manifest = join(pack.directory, "PACK_MANIFEST.json");
    renameSync(manifest, join(root, "original-manifest.json"));
    const target = join(root, "unlisted-invalid-json.txt");
    writeFileSync(target, "private non-JSON target");
    symlinkSync(target, manifest);
    expect(() => verifyReviewPack(pack.directory)).toThrow(/symlink/i);
  });
  it("creates separate packs without overwriting existing files", () => {
    const root = fixture(),
      a = createReviewPack({ projectRoot: root, archive: false }),
      before = readFileSync(join(a.directory, "PACK_MANIFEST.json"), "utf8"),
      b = createReviewPack({ projectRoot: root, archive: false });
    expect(a.directory).not.toBe(b.directory);
    expect(readFileSync(join(a.directory, "PACK_MANIFEST.json"), "utf8")).toBe(
      before,
    );
  });
});
