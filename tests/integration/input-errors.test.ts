import { expect, it } from "vitest";
import { ProjectSchema } from "../../packages/schema/src/index.js";
import { example } from "../helpers.js";
import { formatInputError } from "../../apps/designer-lite/src/input-errors.js";

it("explains rejected positive beta in the selected language with units and bound", () => {
  const p = example();
  p.module.beta_voc_pct_c = 0.28;
  const parsed = ProjectSchema.safeParse(p);
  expect(parsed.success).toBe(false);
  if (parsed.success) return;
  const uk = formatInputError(parsed.error, "uk");
  expect(uk).toContain("βVoc (%/°C)");
  expect(uk).toContain("< 0");
  expect(uk).not.toContain('"code"');
  expect(formatInputError(parsed.error, "en")).toContain("must be < 0");
});
it("explains malformed JSON without dumping a stack or a raw parser error", () => {
  expect(formatInputError(new SyntaxError("Unexpected token"), "uk")).toContain(
    "Некоректний JSON",
  );
  expect(formatInputError(new SyntaxError("Unexpected token"), "en")).toContain(
    "Invalid JSON",
  );
});
