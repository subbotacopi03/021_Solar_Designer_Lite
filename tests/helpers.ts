import { readFileSync } from "node:fs";
import { ProjectSchema, type Project } from "../packages/schema/src/index.js";
export function example(): Project {
  return ProjectSchema.parse(
    JSON.parse(
      readFileSync(
        new URL("../data/examples/student-50kw.json", import.meta.url),
        "utf8",
      ),
    ),
  );
}
