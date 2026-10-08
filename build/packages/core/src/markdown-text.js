/** Escape imported values, preserving the report's own Markdown structure. */
export function reportText(value) {
    return String(value ?? "")
        .replace(/[\r\n\u2028\u2029]+/g, " ")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/[\\`*\[\]#!|]/g, "\\$&");
}
export function reportLine(parts, ...values) {
    return parts.reduce((line, part, index) => line + part + (index < values.length ? reportText(values[index]) : ""), "");
}
//# sourceMappingURL=markdown-text.js.map