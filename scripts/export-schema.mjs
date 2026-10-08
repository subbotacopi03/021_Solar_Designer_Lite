import { z } from "zod";
import { writeFileSync } from "node:fs";
import { ProjectSchema } from "../build/packages/schema/src/index.js";
const schema = z.toJSONSchema(ProjectSchema, {
  target: "draft-2020-12",
  io: "input",
  unrepresentable: "any",
});
schema.$id = "urn:openpv:project:0.1.0";
schema.title = "OpenPV Project 0.1.0";
schema.description =
  "Structural JSON schema. Cross-field refinements require ProjectSchema Zod runtime validation.";
writeFileSync(
  "packages/schema/project.schema.json",
  JSON.stringify(schema, null, 2) + "\n",
);
console.log(
  "Project JSON schema exported (runtime cross-field rules remain in Zod)",
);
