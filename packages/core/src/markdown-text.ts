/** Escape imported values, preserving the report's own Markdown structure. */
export function reportText(value: unknown): string {
  return String(value ?? "")
    .replace(/[\r\n\u2028\u2029]+/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/[\\`*\[\]#!|]/g, "\\$&");
}
export function reportLine(parts: TemplateStringsArray, ...values: unknown[]) {
  return parts.reduce(
    (line, part, index) =>
      line + part + (index < values.length ? reportText(values[index]) : ""),
    "",
  );
}
