/** OpenPV / Solar Designer Lite. Project origin and reuse: see ATTRIBUTION.md. */
export type SoftwareAttribution = {
  project_name: string;
  copyright_holder: string | null;
  author_url: string | null;
  source_url: string | null;
  version: string;
};

// Pure presentation helper: metadata is supplied by CLI/UI, no IO or tracking.
export function softwareCredit(
  data: SoftwareAttribution,
  language: "uk" | "en",
) {
  const uk = language === "uk";
  const text = (value: string) =>
    value
      .replace(/[\r\n]+/g, " ")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/[\\`*_[\]{}()#!|]/g, "\\$&");
  const link = (value: string | null) => {
    try {
      const url = new URL(value ?? "");
      return ["https:", "http:"].includes(url.protocol)
        ? `<${url.href.replace(/</g, "%3C").replace(/>/g, "%3E")}>`
        : "UNKNOWN";
    } catch {
      return "UNKNOWN";
    }
  };
  return [
    `\n## ${uk ? "Походження програми" : "Software provenance"}`,
    `${text(data.project_name)} · ${text(data.version)}`,
    `${uk ? "Авторство" : "Authorship"}: ${data.copyright_holder ? text(data.copyright_holder) : uk ? "Авторство уточнюється" : "Authorship pending confirmation"}`,
    ...(data.author_url
      ? [`${uk ? "Автор" : "Author"}: ${link(data.author_url)}`]
      : []),
    `${uk ? "Джерело" : "Source"}: ${link(data.source_url)}`,
    uk
      ? "Це походження програмного забезпечення; авторство вихідних даних та джерел обладнання зазначено окремо."
      : "This credits the software; ownership of project inputs and equipment sources is separate.",
  ];
}
