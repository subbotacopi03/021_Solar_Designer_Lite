#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { ProjectSchema } from "../../schema/src/index.js";
import { calculateProject, projectReport } from "../../core/src/index.js";
import attribution from "../../../data/attribution.json" with { type: "json" };
import legal from "../../../data/legal-notices.json" with { type: "json" };
const args = process.argv.slice(2),
  command = args[0],
  file = args[1];
if (!file || !["validate", "calculate", "report"].includes(command ?? "")) {
  console.error(
    "Usage: openpv <validate|calculate|report> project.json [--out path] [--lang uk|en]",
  );
  process.exitCode = 2;
} else
  try {
    const p = ProjectSchema.parse(JSON.parse(readFileSync(file, "utf8")));
    if (command === "validate") console.log("VALID schema 0.1.0");
    else {
      const result = calculateProject(p),
        lang = args[args.indexOf("--lang") + 1] === "en" ? "en" : "uk";
      const content =
        command === "report"
          ? projectReport(p, result, lang, {
              ...attribution,
              version: legal.version,
            })
          : JSON.stringify(result, null, 2);
      const at = args.indexOf("--out");
      if (at !== -1) {
        if (!args[at + 1]) throw new Error("--out requires a path");
        writeFileSync(args[at + 1]!, content + "\n");
      } else console.log(content);
      process.exitCode =
        result.status === "FAIL" ? 1 : result.status === "UNKNOWN" ? 3 : 0;
    }
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 2;
  }
