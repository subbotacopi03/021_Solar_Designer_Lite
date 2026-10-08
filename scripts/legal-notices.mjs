import { readFileSync, writeFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const pkg = readJson("package.json");
// Review every new runtime dependency before distributing the bundled application.
const reviewed = { zod: "LICENSE" };
const thirdParty = Object.keys(pkg.dependencies ?? {})
  .sort()
  .map((name) => {
    if (!Object.hasOwn(reviewed, name))
      throw new Error(`Runtime dependency needs license review: ${name}`);
    const dependency = readJson(`node_modules/${name}/package.json`);
    return {
      name,
      version: dependency.version,
      license: dependency.license,
      text: readFileSync(`node_modules/${name}/${reviewed[name]}`, "utf8"),
    };
  });
// Vite injects its own modulepreload helper into the browser bundle. Its tooling
// dependencies are not shipped; retain the complete Vite core MIT notice.
const viteLicense = readFileSync("node_modules/vite/LICENSE.md", "utf8");
const marker = "# Licenses of bundled dependencies";
if (!viteLicense.includes(marker))
  throw new Error("Vite license structure needs review");
thirdParty.push({
  name: "vite modulepreload helper",
  version: readJson("node_modules/vite/package.json").version,
  license: "MIT",
  text: viteLicense.slice(0, viteLicense.indexOf(marker)).trimEnd() + "\n",
});
const notices = {
  project_license: pkg.license,
  project_license_text: readFileSync("LICENSE", "utf8"),
  version: pkg.version,
  third_party: thirdParty,
};
const outputs = {
  "data/legal-notices.json": JSON.stringify(notices, null, 2) + "\n",
  "THIRD_PARTY_NOTICES.txt": thirdParty
    .map(
      (item) =>
        `${item.name} ${item.version} · ${item.license}\n\n${item.text}`,
    )
    .join("\n\n"),
};
for (const [path, content] of Object.entries(outputs)) {
  if (process.argv.includes("--check")) {
    if (readFileSync(path, "utf8") !== content)
      throw new Error(`${path} is stale; run pnpm legal:generate`);
  } else writeFileSync(path, content);
}
console.log(
  `Legal notices ${process.argv.includes("--check") ? "checked" : "generated"}: ${thirdParty.length} bundled components`,
);
