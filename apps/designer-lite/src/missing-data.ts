import type { Project } from "../../../packages/schema/src/index.js";
import type { ProjectResult } from "../../../packages/core/src/index.js";
import {
  collectMissingData,
  type MissingDataGroup,
  type Source,
} from "./missing-data-model.js";
import { descriptions, circuitFields } from "./missing-data-fields.js";
export { collectMissingData } from "./missing-data-model.js";
type Lang = "uk" | "en";
const esc = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
function guidance(group: MissingDataGroup, lang: Lang): string {
  const uk = lang === "uk";
  if (group.state === "PROVIDED")
    return uk
      ? "Цю залежність уже задано. UNKNOWN перевірки може бути спричинений іншим параметром або непідтвердженими умовами."
      : "This dependency is already provided. Another parameter or unverified conditions may keep the check UNKNOWN.";
  if (group.field === "beta_vmp_pct_c")
    return uk
      ? "Потрібне підтвердження виробника саме цього SKU. Якщо datasheet не наводить βVmp, залиште UNKNOWN; γPmax − αIsc не підставляється в основний розрахунок."
      : "Obtain manufacturer evidence for this exact SKU. If βVmp is not stated, keep UNKNOWN; γPmax − αIsc is not substituted in the main calculation.";
  if (["max_current_per_input_a", "max_isc_per_input_a"].includes(group.field))
    return uk
      ? "Шукайте окремий рейтинг фізичного входу в manual виробника. Не діліть сумарний ліміт MPPT між конекторами; Imp та Isc перевіряються окремо."
      : "Find the physical input rating in the manufacturer manual. Do not divide MPPT totals between connectors; Imp and Isc are checked separately.";
  if (
    ["reverse_current_withstand_a", "max_series_fuse_a"].includes(group.field)
  )
    return uk
      ? "Перевірте відповідний рейтинг модуля в документації виробника. Maximum series fuse не є maximum reverse-current withstand."
      : "Check the corresponding module rating in manufacturer documentation. Maximum series fuse is not maximum reverse-current withstand.";
  if (group.state === "REVIEW")
    return uk
      ? "Цей код позначає залежність або межу реалізованої перевірки. Перегляньте підставу нижче; потрібні окремі джерела й інженерне підтвердження. Це не автоматичне поле вводу."
      : "This code identifies a dependency or a limit of the implemented assessment. Review its basis below; separate evidence and engineering verification are required. It is not an automatic input field.";
  if (group.tab === "equipment")
    return uk
      ? "Знайдіть значення та одиниці в офіційному datasheet/manual саме цього SKU. Наявність пов’язаного джерела не доводить, що воно містить цей параметр."
      : "Find the value and units in the official datasheet/manual for this exact SKU. A related source does not prove that this parameter is stated there.";
  if (group.scope === "site" || circuitFields.includes(group.field))
    return uk
      ? "Уточніть фактичні умови проєкту або цієї лінії. Температура комірки, провідника й середовища — різні величини. Для прокладання та derating потрібні застосовні джерела; типові значення не підставляються."
      : "Confirm actual project or feeder conditions. Cell, conductor and ambient temperatures are different quantities. Installation and derating require applicable evidence; no typical values are inserted.";
  if (group.scope.includes("/cable:"))
    return uk
      ? "Перевірте manufacturer cable data та умови допустимого струму: спосіб прокладання, температуру й групування. Не підставляйте R, X або коефіцієнти без джерела."
      : "Check manufacturer cable data and ampacity conditions: installation, temperature and grouping. Do not insert R, X or factors without evidence.";
  return uk
    ? "Уточніть параметр, його одиниці та підставу для цього проєкту. Збереження значення не означає підтвердженої придатності; UNKNOWN не заповнюється автоматично."
    : "Confirm the parameter, units and basis for this project. Saving a value does not establish suitability; UNKNOWN is not filled automatically.";
}
function sourceHtml(source: Source, uk: boolean): string {
  let url = "";
  if (source.url) {
    try {
      const parsed = new URL(source.url);
      if (["http:", "https:"].includes(parsed.protocol))
        url = `<a href="${esc(parsed.href)}" target="_blank" rel="noopener noreferrer">${esc(source.url)}</a>`;
    } catch {
      /* plain text only */
    }
    if (!url) url = esc(source.url);
  }
  return `<li>${esc(source.label)} · ${esc(source.verification)} · ${esc(uk ? "Перевірено" : "Reviewed")}: ${esc(source.reviewed_on ?? "UNKNOWN")}<br>${esc(uk ? "Редакція" : "Revision")}: ${esc(source.document_revision ?? "UNKNOWN")} · ${esc(uk ? "Місце в документі" : "Locator")}: ${esc(source.locator ?? "UNKNOWN")}${url ? `<br>${url}` : ""}${source.notes ? `<p>${esc(source.notes)}</p>` : ""}</li>`;
}
export function renderMissingData(
  project: Project,
  result: ProjectResult,
  lang: Lang,
): string {
  const uk = lang === "uk",
    groups = collectMissingData(project, result);
  const card = (g: MissingDataGroup) => {
    const description = descriptions.get(g.field);
    const title = description?.[lang] ?? g.field;
    const location = uk
      ? (new Map([
          ["site", "Умови проєкту"],
          ["policy", "Розрахункова політика"],
          ["project", "Проєкт"],
          ["installation", "Умови монтажу"],
        ]).get(g.scope) ?? g.location)
      : g.location;
    const state = uk
      ? {
          MISSING: "Не задано",
          PROVIDED: "Задано",
          REVIEW: "Потрібна перевірка",
        }[g.state]
      : { MISSING: "Missing", PROVIDED: "Provided", REVIEW: "Review required" }[
          g.state
        ];
    const value =
      g.value == null
        ? "UNKNOWN"
        : Array.isArray(g.value)
          ? `${g.value.length} ${uk ? "записів" : "records"}`
          : typeof g.value === "object"
            ? uk
              ? "Структуровані дані задано; перевірте застосовність."
              : "Structured data provided; verify applicability."
            : String(g.value);
    return `<details class="missing-item" data-missing-field="${esc(g.field)}" data-missing-state="${g.state}" data-missing-scope="${esc(g.scope)}"><summary><span>${esc(title)}${description ? ` · ${esc(description.unit)}` : ""}</span><span class="small">${esc(location)} · ${esc(state)}</span></summary><p>${esc(guidance(g, lang))}</p><p class="small code">${esc(g.path)} · ${esc(uk ? "Значення" : "Value")}: ${esc(value)}</p><button type="button" data-tab="${g.tab}">${esc(uk ? "Перейти до даних" : "Open inputs")}</button><details><summary>${esc(uk ? "Пов’язані перевірки" : "Affected checks")} · ${g.checks.length}</summary><ul>${g.checks
      .slice(0, 100)
      .map(
        (c) =>
          `<li><strong>${esc(c.id)} · ${esc(c.status)}</strong><p>${esc(c.basis)}</p></li>`,
      )
      .join(
        "",
      )} </ul>${g.checks.length > 100 ? `<p>${uk ? "Показано перші 100 перевірок; повний список є в JSON результату." : "Showing the first 100 checks; result JSON contains the full list."}</p>` : ""}</details><details><summary>${esc(uk ? "Пов’язані джерела — не підтвердження відсутнього параметра" : "Related sources — not proof of the missing parameter")}</summary>${g.sources.length ? `<ul>${g.sources.map((s) => sourceHtml(s, uk)).join("")}</ul>` : `<p>${esc(uk ? "Джерело не вказано. Підтвердження не вигадується." : "No source supplied. Evidence is not inferred.")}</p>`}</details></details>`;
  };
  const section = (state: MissingDataGroup["state"], title: string) => {
    const rows = groups.filter((g) => g.state === state);
    return `<details ${state === "MISSING" ? "open" : ""}><summary>${esc(title)} · ${rows.length}</summary>${rows.slice(0, 100).map(card).join("")}${rows.length > 100 ? `<p>${esc(uk ? "Показано перші 100 груп. Повні missing records містяться в JSON результату та інспекторі кабелів." : "Showing the first 100 groups. Full missing records remain in result JSON and the cable inspector.")}</p>` : ""}</details>`;
  };
  return `<section class="panel missing-data" id="missingData" aria-labelledby="missingDataTitle"><h2 id="missingDataTitle">${uk ? "Що потрібно уточнити" : "What needs clarification"}</h2><p>${uk ? "Панель пояснює залежності наявних перевірок і не змінює розрахунок. Відомі FAIL залишаються FAIL; заповнення всіх полів не означає дозволу на монтаж." : "This panel explains existing check dependencies and does not change the calculation. Known FAIL remains FAIL; completing fields does not authorize installation."}</p><p class="small">FAIL: ${result.checks.filter((c) => c.status === "FAIL").length} · UNKNOWN: ${result.checks.filter((c) => c.status === "UNKNOWN").length}</p>${groups.length ? section("MISSING", uk ? "Відсутні значення" : "Missing values") + section("REVIEW", uk ? "Потрібні підтвердження або окремий модуль" : "Evidence or a separate module required") + section("PROVIDED", uk ? "Залежності, які вже задано" : "Dependencies already provided") : `<p>${uk ? "Перевірки не назвали відсутніх залежностей. Це не підтвердження повноти або відповідності." : "Checks named no missing dependencies. This does not establish completeness or compliance."}</p>`}</section>`;
}
