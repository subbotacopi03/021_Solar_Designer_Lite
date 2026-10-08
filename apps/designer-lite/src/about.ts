import attribution from "../../../data/attribution.json" with { type: "json" };
import legal from "../../../data/legal-notices.json" with { type: "json" };

type Lang = "uk" | "en";
type AttributionData = {
  project_name: string;
  copyright_holder: string | null;
  author_url: string | null;
  source_url: string | null;
};
type LegalData = {
  project_license: string;
  project_license_text: string;
  version: string;
  third_party: Array<{
    name: string;
    version: string;
    license: string;
    text: string;
  }>;
};

const projectAttribution: AttributionData = attribution;
const legalNotices: LegalData = legal;

const esc = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );

const labels = (lang: Lang) =>
  lang === "uk"
    ? {
        about: "Про проєкт",
        version: "Версія",
        pending: "Авторство уточнюється",
        author: "Авторство",
        source: "Джерело коду",
        dialogTitle: "Авторство та ліцензії",
        close: "Закрити",
        projectLicense: "Ліцензія проєкту",
        thirdParty: "Сторонні компоненти",
        citation: "Цитування проєкту",
        copy: "Копіювати цитування",
        copied: "Цитування скопійовано.",
        fallback:
          "Не вдалося скопіювати. Текст цитування виділено для ручного копіювання.",
      }
    : {
        about: "About this project",
        version: "Version",
        pending: "Authorship pending confirmation",
        author: "Authorship",
        source: "Source code",
        dialogTitle: "Authorship and licenses",
        close: "Close",
        projectLicense: "Project license",
        thirdParty: "Third-party components",
        citation: "Project citation",
        copy: "Copy citation",
        copied: "Citation copied.",
        fallback:
          "Could not copy. Citation text is selected for manual copying.",
      };

function safeLink(url: string | null, label: string): string {
  if (url == null) return "";
  let href: string | undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:")
      href = parsed.href;
  } catch {
    // Non-URL attribution stays visible as plain text.
  }
  return href
    ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`
    : esc(url);
}

function citationText() {
  const parts = [projectAttribution.project_name];
  if (projectAttribution.copyright_holder)
    parts.push(`by ${projectAttribution.copyright_holder}`);
  if (projectAttribution.source_url)
    parts.push(`source: ${projectAttribution.source_url}`);
  parts.push(`version ${legalNotices.version}`);
  return parts.join(" · ");
}

export function renderAttribution(lang: Lang): string {
  const text = labels(lang);
  const holder = projectAttribution.copyright_holder;
  const author = holder
    ? `<span>${esc(text.author)}: ${esc(holder)}${projectAttribution.author_url ? ` · ${safeLink(projectAttribution.author_url, projectAttribution.author_url)}` : ""}</span>`
    : `<span>${esc(text.pending)}</span>`;
  const source = projectAttribution.source_url
    ? `<span>${esc(text.source)}: ${safeLink(projectAttribution.source_url, projectAttribution.source_url)}</span>`
    : "";
  const citationReady = holder != null && projectAttribution.source_url != null;
  const thirdParty = legalNotices.third_party
    .map(
      (item) =>
        `<details><summary>${esc(item.name)} · ${esc(item.version)} · ${esc(item.license)}</summary><pre class="about-pre">${esc(item.text)}</pre></details>`,
    )
    .join("");

  return `<footer class="about-footer"><div class="about-panel"><strong>${esc(projectAttribution.project_name)}</strong><span>${esc(text.version)} ${esc(legalNotices.version)}</span>${author}${source}</div><button id="aboutOpen" type="button">${esc(text.about)}</button><dialog id="aboutDialog" class="about-dialog" aria-labelledby="aboutTitle"><div class="about-panel"><form method="dialog"><div class="tools"><h2 id="aboutTitle">${esc(text.dialogTitle)}</h2><button type="submit" aria-label="${esc(text.close)}">${esc(text.close)}</button></div></form><details><summary>${esc(text.projectLicense)} · ${esc(legalNotices.project_license)}</summary><pre class="about-pre">${esc(legalNotices.project_license_text)}</pre></details><h3>${esc(text.thirdParty)}</h3>${thirdParty}<section><h3>${esc(text.citation)}</h3><label class="field"><span>${esc(text.citation)}</span><textarea id="attributionCitation" readonly>${esc(citationText())}</textarea></label><button id="copyAttribution" type="button" ${citationReady ? "" : "disabled"}>${esc(text.copy)}</button></section></div></dialog></footer>`;
}

export function bindAttribution(
  lang: Lang,
  toast: (message: string) => void,
): void {
  const text = labels(lang);
  const open = document.getElementById("aboutOpen");
  const dialog = document.getElementById("aboutDialog");
  const copyButton = document.getElementById("copyAttribution");
  const citation = document.getElementById("attributionCitation");
  if (!(open instanceof HTMLButtonElement)) return;
  if (!(dialog instanceof HTMLDialogElement)) return;
  open.onclick = () => {
    try {
      dialog.showModal();
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : String(reason));
    }
  };
  dialog.onclose = () => open.focus();
  if (!(copyButton instanceof HTMLButtonElement)) return;
  if (!(citation instanceof HTMLTextAreaElement)) return;
  copyButton.onclick = async () => {
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(citation.value);
      toast(text.copied);
    } catch {
      citation.focus();
      citation.select();
      toast(text.fallback);
    }
  };
}
