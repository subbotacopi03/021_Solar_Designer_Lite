// Pure presentation helper: metadata is supplied by CLI/UI, no IO or tracking.
export function softwareCredit(data, language) {
    const uk = language === "uk";
    const text = (value) => value
        .replace(/[\r\n]+/g, " ")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/[\\`*_[\]{}()#!|]/g, "\\$&");
    const link = (value) => {
        try {
            const url = new URL(value ?? "");
            return ["https:", "http:"].includes(url.protocol)
                ? `<${url.href.replace(/</g, "%3C").replace(/>/g, "%3E")}>`
                : "UNKNOWN";
        }
        catch {
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
//# sourceMappingURL=software-credit.js.map