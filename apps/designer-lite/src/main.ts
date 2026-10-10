import {
  bindJsonDrafts,
  hasUnappliedDraft,
  confirmDraftDiscard,
} from "./drafts.js";
import { renderMissingData } from "./missing-data.js";
import { formatInputError } from "./input-errors.js";
import { renderManualStrings, bindManualStrings } from "./manual-strings.js";
import { renderAttribution, bindAttribution } from "./about.js";
import attribution from "../../../data/attribution.json" with { type: "json" };
import legal from "../../../data/legal-notices.json" with { type: "json" };
import "./style.css";
import { renderRoutes, bindRoutes } from "./routes.js";
import { renderHandbook } from "./handbook.js";
import {
  equipmentLabel,
  inverterFields,
  moduleFields,
  mpptFields,
} from "./equipment-labels.js";
import { renderCableInspector, bindCableInspector } from "./cable-inspector.js";
import realDcSwitches from "../../../data/equipment/verified/dc-switches.json" with { type: "json" };
import realSpds from "../../../data/equipment/verified/spds.json" with { type: "json" };
import realFuses from "../../../data/equipment/verified/fuses.json" with { type: "json" };
import realCables from "../../../data/equipment/verified/cables.json" with { type: "json" };
import teachingCables from "../../../data/equipment/cables.json" with { type: "json" };
import realModules from "../../../data/equipment/verified/modules.json" with { type: "json" };
import realInverters from "../../../data/equipment/verified/inverters.json" with { type: "json" };
import syntheticModules from "../../../data/equipment/modules.json" with { type: "json" };
import syntheticInverters from "../../../data/equipment/inverters.json" with { type: "json" };
import demo from "../../../data/examples/student-50kw.json" with { type: "json" };
import {
  ProjectSchema,
  PvModuleSchema,
  InverterSchema,
  CableSchema,
  StringFuseDeviceSchema,
  SpdDeviceSchema,
  DcSwitchDeviceSchema,
  type Project,
} from "../../../packages/schema/src/index.js";
import {
  calculateProject,
  projectReport,
  type ProjectResult,
} from "../../../packages/core/src/index.js";
const moduleCatalog = [...realModules, ...syntheticModules].map((m) =>
  PvModuleSchema.parse(m),
);
const inverterCatalog = [...realInverters, ...syntheticInverters].map((i) =>
  InverterSchema.parse(i),
);
type Lang = "uk" | "en";
let lang: Lang = "uk";
let tab = "overview";
let filter = "ALL";
let student = true;
const texts = {
  uk: {
    overview: "Огляд",
    equipment: "Обладнання",
    site: "Умови й кабелі",
    strings: "Стрінги та MPPT",
    checks: "Перевірки",
    report: "Звіт і BOM",
    learn: "Навчання",
    handbook: "Довідник",
    json: "Дані проєкту",
    save: "Зберегти JSON",
    load: "Відкрити JSON",
    reset: "Новий приклад",
    title: "Електрична конфігурація СЕС",
    subtitle: "Від параметрів модуля до стрінгів, кабелів і перевірок.",
    project: "Проєкт",
    dc: "Встановлена DC",
    ac: "Потужність AC",
    ratio: "Співвідношення DC/AC",
    allocated: "Розміщено модулів",
    notice:
      "Попередній розрахунок. Походження обладнання наведено в каталозі; навчальні policies та кабелі потребують окремої перевірки. UNKNOWN означає, що даних для висновку недостатньо.",
    module: "PV модуль",
    inverter: "Інвертор",
    name: "Назва",
    count: "Кількість",
    planes: "Площини масиву",
    addPlane: "Додати площину",
    siteTitle: "Температури та мережа",
    dcCable: "DC · кожен стрінг",
    acCable: "AC · фідер кожного інвертора",
    length: "Довжина траси в один бік, m",
    temperature: "Температура провідника, °C",
    derating: "Сумарний коефіцієнт derating",
    basis: "Обґрунтування derating",
    policy: "Явна політика розрахунку",
    apply: "Застосувати JSON",
    edit: "Повний редактор схем, MPPT, обладнання й кабелів",
    print: "Друк / PDF",
    exportReport: "Завантажити звіт",
    exportResult: "Результат JSON",
    student: "Student Mode",
    intro:
      "Кожна перевірка має попит, межу та підставу. Невідомі параметри не підмінюються типовими значеннями.",
    all: "Усі",
    missing: "Бракує даних",
    demand: "Розраховано",
    capacity: "Межа",
    status: "Статус",
    next: "Переглянути стрінги",
    run: "Перераховано локально",
    scope: "Версія 0.1 · електрика · попередній розрахунок",
    manual: "Ручний план стрінгів (JSON)",
    manualApply: "Застосувати план",
    auto: "Автоматичний план",
    reportNote:
      "AC розраховується окремо для фідера кожного інвертора. SPD, повна перевірка захисту й нормативне погодження потребують окремої перевірки.",
    learnTitle: "Вчитися на реальних перевірках",
    blank:
      "Порожнє поле = UNKNOWN. Температури — температури комірки; Tmax не є температурою повітря.",
    cancel: "Скасувати",
  },
  en: {
    overview: "Overview",
    equipment: "Equipment",
    site: "Site & cables",
    strings: "Strings & MPPT",
    checks: "Checks",
    report: "Report & BOM",
    learn: "Learning",
    handbook: "Handbook",
    json: "Project data",
    save: "Save JSON",
    load: "Open JSON",
    reset: "New example",
    title: "PV electrical configuration",
    subtitle: "From module parameters to strings, cables and checks.",
    project: "Project",
    dc: "Installed DC",
    ac: "AC capacity",
    ratio: "DC/AC ratio",
    allocated: "Allocated modules",
    notice:
      "Preliminary calculation. Equipment provenance is shown in the catalog; teaching policies and cable data require separate review. UNKNOWN means the available data does not support a verdict.",
    module: "PV module",
    inverter: "Inverter",
    name: "Name",
    count: "Quantity",
    planes: "Array planes",
    addPlane: "Add plane",
    siteTitle: "Temperatures & grid",
    dcCable: "DC · each string",
    acCable: "AC · each inverter feeder",
    length: "One-way route length, m",
    temperature: "Conductor temperature, °C",
    derating: "Combined derating factor",
    basis: "Derating basis",
    policy: "Explicit calculation policy",
    apply: "Apply JSON",
    edit: "Full schema, MPPT, equipment & cable editor",
    print: "Print / PDF",
    exportReport: "Download report",
    exportResult: "Result JSON",
    student: "Student Mode",
    intro:
      "Each check includes demand, capacity and basis. Missing parameters are never replaced with typical values.",
    all: "All",
    missing: "Missing",
    demand: "Demand",
    capacity: "Capacity",
    status: "Status",
    next: "Inspect strings",
    run: "Recalculated locally",
    scope: "Version 0.1 · electrical · preliminary",
    manual: "Manual string plan (JSON)",
    manualApply: "Apply plan",
    auto: "Automatic plan",
    reportNote:
      "AC is assessed independently for each inverter feeder. SPD, complete protection checks and regulatory review require separate verification.",
    learnTitle: "Learn from engineering checks",
    blank:
      "Empty means UNKNOWN. Temperatures refer to cells; Tmax is not ambient air temperature.",
    cancel: "Cancel",
  },
};
const t = () => texts[lang];
const esc = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const fmt = (n: number | null | undefined, d = 2) =>
  n == null
    ? "—"
    : new Intl.NumberFormat(lang === "uk" ? "uk-UA" : "en-US", {
        maximumFractionDigits: d,
      }).format(n);
let project: Project = ProjectSchema.parse(demo),
  result: ProjectResult;
try {
  const stored = localStorage.getItem("openpv-project-v1");
  if (stored) {
    const parsed = ProjectSchema.safeParse(JSON.parse(stored));
    if (parsed.success) project = parsed.data;
  }
} catch {
  /* unavailable storage or invalid old data retains demo */
}
let startupCalculationError: unknown;
try {
  result = calculateProject(project);
} catch (error) {
  startupCalculationError = error;
  project = ProjectSchema.parse(demo);
  result = calculateProject(project);
}
let projectRevision = 0;
let importSequence = 0;
function toast(message: string) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.textContent = message;
  document.body.append(el);
  setTimeout(() => el.remove(), 4000);
}
let previousProject: Project | null = null;
try {
  const saved = localStorage.getItem("openpv-previous-project-v1");
  if (saved) previousProject = ProjectSchema.parse(JSON.parse(saved));
} catch {
  /* recovery remains unavailable if storage is absent or invalid */
}
function commit(next: unknown, rememberPrevious = false) {
  try {
    const p = ProjectSchema.parse(next);
    const calculated = calculateProject(p);
    if (rememberPrevious) {
      previousProject = structuredClone(project);
      try {
        localStorage.setItem(
          "openpv-previous-project-v1",
          JSON.stringify(previousProject),
        );
      } catch {
        toast(
          lang === "uk"
            ? "Попередній проєкт доступний лише до закриття вкладки — збережіть JSON."
            : "Previous project is available only until this tab closes — save JSON.",
        );
      }
    }
    project = p;
    result = calculated;
    projectRevision++;
    try {
      localStorage.setItem("openpv-project-v1", JSON.stringify(p));
    } catch {
      toast(
        lang === "uk"
          ? "Автозбереження недоступне — збережіть JSON"
          : "Autosave unavailable — save JSON",
      );
    }
    render();
  } catch (e) {
    toast(formatInputError(e, lang));
    if (!hasUnappliedDraft()) render();
  }
}
function field(label: string, path: string, value: unknown, type = "number") {
  return `<label class="field"><span>${esc(label)}</span><input data-path="${esc(path)}" aria-label="${esc(label)}" type="${type}" ${type === "number" ? 'step="any"' : ""} value="${esc(value)}"></label>`;
}
function table(headers: string[], rows: string[][]) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
const badge = (s: string) => `<span class="status ${esc(s)}">${esc(s)}</span>`;
function equipmentSources(
  equipment:
    | Project["module"]
    | Project["inverter"]
    | Project["cables"][number]
    | NonNullable<Project["string_fuse_device"]>
    | NonNullable<Project["spd_device"]>
    | NonNullable<Project["dc_switch_device"]>,
) {
  return `<div class="equipment-evidence"><p>${esc(equipment.manufacturer ?? "SYNTHETIC / USER INPUT")} · ${esc(equipment.model ?? equipment.name)}</p>${(equipment.data_notes ?? []).map((n) => `<p class="small">${esc(n)}</p>`).join("")}${equipment.sources.map((s) => `<p class="small">${esc(s.verification)} · ${s.url && /^https?:/.test(s.url) ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>` : esc(s.label)} · ${esc(s.reviewed_on ?? "UNKNOWN DATE")} · ${esc(s.document_revision ?? "UNKNOWN REVISION")}<br>${esc(s.notes)}</p>`).join("")}</div>`;
}
function dcSwitchSummary() {
  const d = project.dc_switch_device;
  return d
    ? equipmentSources(d) +
        table(
          [
            "Profile",
            "Ue,V DC",
            "Ie,A",
            "Category",
            "Poles",
            "Circuits",
            "Diagram",
          ],
          d.profiles.map((p) => [
            esc(p.id),
            fmt(p.operational_voltage_v),
            fmt(p.operational_current_a),
            esc(p.utilization_category),
            fmt(p.poles),
            fmt(p.circuits),
            esc(p.wiring_diagrams.join(" / ")),
          ]),
        )
    : "";
}
function dcSwitchPanel() {
  const d = project.dc_switch_device,
    c = project.dc_switch_context;
  const options = (
    path: string,
    value: string | null | undefined,
    rows: [string, string][],
  ) =>
    `<select data-path="dc_switch_context.${path}"><option value="">${lang === "uk" ? "Не задано" : "Not specified"}</option>${rows.map(([id, label]) => `<option value="${esc(id)}" ${value === id ? "selected" : ""}>${esc(label)}</option>`).join("")}</select>`;
  return `<section class="panel"><h2>${lang === "uk" ? "Кандидат DC-роз’єднувача" : "DC switch-disconnector candidate"}</h2><label class="field"><span>${lang === "uk" ? "Конкретний пристрій; повна придатність потребує перевірки" : "Exact device; complete suitability requires review"}</span><select id="dcSwitchCatalog"><option value="">${lang === "uk" ? "Не задано" : "Not specified"}</option>${realDcSwitches.map((d) => `<option value="${esc(d.id)}" ${project.dc_switch_device?.id === d.id ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select></label>${dcSwitchSummary()}${
    d && c
      ? `<div class="form-grid"><label class="field"><span>${lang === "uk" ? "Робочий профіль виробника" : "Manufacturer operational profile"}</span>${options(
          "rating_id",
          c.rating_id,
          d.profiles.map((p) => [
            p.id,
            `${p.operational_voltage_v ?? "UNKNOWN"}V / ${p.operational_current_a ?? "UNKNOWN"}A / ${p.utilization_category} / ${p.poles}P`,
          ]),
        )}</label><label class="field"><span>${lang === "uk" ? "Місце встановлення кандидата" : "Candidate installation scope"}</span>${options(
          "scope",
          c.scope,
          [
            [
              "PER_STRING",
              lang === "uk"
                ? "Окремо на кожен стрінг"
                : "Separately per string",
            ],
            ["MPPT", "MPPT — UNKNOWN"],
            [
              "INVERTER",
              lang === "uk" ? "Інвертор — UNKNOWN" : "Inverter — UNKNOWN",
            ],
          ],
        )}</label>${field(lang === "uk" ? "Потрібна категорія (явна вимога)" : "Required category (explicit requirement)", "dc_switch_context.required_category", c.required_category, "text")}${field(lang === "uk" ? "Код схеми виробника" : "Manufacturer wiring diagram code", "dc_switch_context.wiring_diagram", c.wiring_diagram, "text")}${field(lang === "uk" ? "Підключені полюси" : "Connected poles", "dc_switch_context.poles", c.poles)}</div><p class="small">${lang === "uk" ? "Ue/Ie — робочі номінали; Ui/Ith не є їх заміною. Джерела вимог і монтажні умови задайте в JSON. Введений код схеми не підтверджує фізичне підключення; повна координація UNKNOWN." : "Ue/Ie are operational ratings; Ui/Ith cannot substitute. Enter requirement sources and installation conditions in JSON. A diagram code does not verify physical wiring; full coordination remains UNKNOWN."}</p>`
      : ""
  }</section>`;
}
function equipmentSelect(side: "module" | "inverter") {
  const catalog = side === "module" ? moduleCatalog : inverterCatalog;
  const equipment = project[side];
  return `<label class="field"><span>${lang === "uk" ? "Каталог виробників / навчальні дані" : "Manufacturer catalog / teaching data"}</span><select id="${side}Catalog"><option value="">${lang === "uk" ? "Власні / змінені дані" : "Custom / edited data"}</option>${[
    false,
    true,
  ]
    .map(
      (synthetic) =>
        `<optgroup label="${synthetic ? "SYNTHETIC · teaching" : "Manufacturer · source-limited"}">${catalog
          .filter(
            (e) =>
              e.sources.some((s) => s.verification === "SYNTHETIC") ===
              synthetic,
          )
          .map(
            (e) =>
              `<option value="${esc(e.id)}" ${JSON.stringify(e) === JSON.stringify(equipment) ? "selected" : ""}>${esc(e.name)}</option>`,
          )
          .join("")}</optgroup>`,
    )
    .join("")}</select></label>${equipmentSources(equipment)}`;
}
function checksTable() {
  const rows = result.checks.filter(
    (c) => filter === "ALL" || c.status === filter,
  );
  return table(
    [
      "ID",
      t().status,
      t().demand,
      t().capacity,
      lang === "uk" ? "Підстава" : "Basis",
    ],
    rows.map((c) => [
      `<span class="code">${esc(c.id)}</span>`,
      badge(c.status),
      `${fmt(c.demand, 3)} ${esc(c.unit)}`,
      `${fmt(c.capacity, 3)} ${esc(c.unit)}`,
      `${esc(c.basis)}${c.missing.length ? `<div class="small">${t().missing}: ${esc(c.missing.join(", "))}</div>` : ""}`,
    ]),
  );
}
function reportChecksTable() {
  const groups = new Map<
    string,
    { check: ProjectResult["checks"][number]; count: number }
  >();
  for (const c of result.checks.filter(
    (c) => c.status !== "PASS" && c.status !== "NOT_APPLICABLE",
  )) {
    const key = JSON.stringify([
      c.status,
      c.demand,
      c.capacity,
      c.unit,
      c.basis,
      c.missing,
    ]);
    const existing = groups.get(key);
    if (existing) existing.count++;
    else groups.set(key, { check: c, count: 1 });
  }
  return (
    `<p class="small">${["PASS", "WARN", "FAIL", "UNKNOWN", "NOT_APPLICABLE"].map((status) => status + ": " + result.checks.filter((c) => c.status === status).length).join(" · ")}</p>` +
    table(
      [
        "ID",
        t().status,
        t().demand,
        t().capacity,
        lang === "uk" ? "Підстава" : "Basis",
      ],
      [...groups.values()].map(({ check: c, count }) => [
        `<span class="code">${esc(c.id)}${count > 1 ? " (+" + (count - 1) + ")" : ""}</span>`,
        badge(c.status),
        `${fmt(c.demand, 3)} ${esc(c.unit)}`,
        `${fmt(c.capacity, 3)} ${esc(c.unit)}`,
        `${esc(c.basis)}${c.missing.length ? `<div class="small">${t().missing}: ${esc(c.missing.join(", "))}</div>` : ""}`,
      ]),
    )
  );
}
function planTable() {
  return table(
    [
      "ID",
      t().inverter,
      "MPPT",
      lang === "uk" ? "Площина" : "Plane",
      lang === "uk" ? "Модулі" : "Modules",
    ],
    result.strings.map((s) => [
      esc(s.id),
      String(s.inverter),
      esc(s.mppt_id),
      esc(s.plane_id),
      String(s.modules),
    ]),
  );
}
function cableTable() {
  const rows = [
    ...result.ac_lines.map((l) => ({
      name: `${t().acCable} · INV ${l.inverter}`,
      ...l,
    })),
    ...result.dc_lines.map((l) => ({ name: l.string_id, ...l })),
  ];
  const scope = result.cable_bom;
  const summary = `<p data-cable-bom-scope>${badge(scope.checks[0]!.status)} · ${
    lang === "uk"
      ? `Кабелі: лише вибрані траси. Пропущено ліній: ${scope.omitted_routes}; невизначена DC розкладка: ${scope.unresolved_dc_layout ? "так" : "ні"}. Без запасу.`
      : `Cable quantities: selected routes only. Omitted feeders: ${scope.omitted_routes}; unresolved DC layout: ${scope.unresolved_dc_layout ? "yes" : "no"}. No reserve.`
  }</p>`;
  return (
    summary +
    table(
      [
        lang === "uk" ? "Лінія" : "Circuit",
        "L, m",
        lang === "uk" ? "Джерело" : "Source",
        lang === "uk" ? "Кабель" : "Cable",
        "Iz × k, A",
        "ΔU, %",
        t().status,
      ],
      rows.map((l) => [
        esc(l.name),
        fmt(l.circuit_input.length_m),
        esc(l.input_origin),
        esc(l.cable.selected?.cable.name ?? "—"),
        fmt(l.cable.selected?.iz_derated_a),
        fmt(l.cable.selected?.drop_pct, 3),
        badge(l.cable.selected?.status ?? "UNKNOWN"),
      ]),
    )
  );
}
function render() {
  const x = t();
  document.documentElement.lang = lang;
  const nav = [
    "overview",
    "equipment",
    "site",
    "strings",
    "checks",
    "report",
    "learn",
    "handbook",
    "json",
  ];
  document.getElementById("app")!.innerHTML =
    `<header><div class="brand"><div class="mark" aria-hidden="true">PV</div><div><strong>Solar Designer Lite</strong><span class="small">OpenPV · engineering workspace</span></div></div><div class="tools"><button id="reset">${x.reset}</button><button id="load">${x.load}</button><button id="save" class="primary">${x.save}</button>${previousProject ? `<button id="restorePrevious">${lang === "uk" ? "Попередній проєкт" : "Previous project"}</button>` : ""}<button id="lang" aria-label="Change language">${lang === "uk" ? "EN" : "UA"}</button><input id="file" class="hidden" type="file" accept=".json,application/json"></div></header><div class="shell"><aside><nav aria-label="${lang === "uk" ? "Розділи" : "Sections"}">${nav.map((key, i) => `<button data-tab="${key}" class="${tab === key ? "active" : ""}" ${tab === key ? 'aria-current="page"' : ""}>${String(i + 1).padStart(2, "0")} &nbsp; ${esc(x[key as keyof typeof x])}</button>`).join("")}</nav><div class="aside-note"><strong>OpenPV Core v0.1</strong><p>${x.intro}</p><label><input id="student" type="checkbox" ${student ? "checked" : ""}> ${x.student}</label><p>${lang === "uk" ? "Дані й розрахунки залишаються у вашому браузері." : "Data and calculations stay in your browser."}</p></div></aside><main class="main"><div class="title-row"><div><div class="eyebrow">${x.project} / ${esc(project.name)}</div><h1>${esc(tab === "overview" ? x.title : x[tab as keyof typeof x])}</h1><p class="subtitle">${x.subtitle}</p></div>${badge(result.status)}</div><div class="metric-strip"><div class="metric"><label>${x.dc}</label><strong>${fmt(result.dc_power_w / 1000, 2)}</strong> <span>kWp</span></div><div class="metric"><label>${x.ac}</label><strong>${fmt(result.ac_power_w / 1000, 2)}</strong> <span>kW</span></div><div class="metric"><label>${x.ratio}</label><strong>${fmt(result.dc_ac_ratio, 3)}</strong></div><div class="metric"><label>${x.allocated}</label><strong>${result.installed_modules}</strong> <span>/ ${result.requested_modules}</span></div></div><div class="banner">${x.notice}</div><div id="content"></div><footer class="footer"><span>${x.scope}</span><span>${x.run}</span></footer>${renderAttribution(lang)}</main></div>`;
  const content = document.getElementById("content")!;
  if (tab === "overview")
    content.innerHTML = `<section class="panel"><h2>${lang === "uk" ? "Вихідні дані" : "Project inputs"}</h2><div class="form-grid">${field(x.name, "name", project.name, "text")}${field(x.count + " · " + x.inverter, "inverter_quantity", project.inverter_quantity)}<div><span class="small">${x.module}</span><p>${esc(project.module.name)} · ${project.module.pmax_w} W</p></div><div><span class="small">${x.inverter}</span><p>${esc(project.inverter.name)} · ${fmt(project.inverter.ac_power_w / 1000)} kW</p></div></div><h3>${x.planes}</h3>${project.planes.map((p, i) => `<div class="form-grid" style="margin-bottom:16px">${field(x.name, `planes.${i}.name`, p.name, "text")}${field(x.count + " · PV", `planes.${i}.module_count`, p.module_count)}<div class="tools"><button data-remove-plane="${i}" ${project.planes.length === 1 ? "disabled" : ""}>${lang === "uk" ? "Видалити" : "Remove"}</button></div></div>`).join("")}<div class="tools"><button id="addPlane">${x.addPlane}</button><button class="primary" data-tab="strings">${x.next}</button></div></section><section class="panel"><h2>${lang === "uk" ? "Результат ліній" : "Feeder results"}</h2>${cableTable()}</section>${student ? `<div class="banner info">${x.blank}</div>` : ""}`;
  if (tab === "equipment")
    content.innerHTML = `<section class="panel"><h2>${x.module}</h2>${equipmentSelect("module")}<div class="form-grid">${field(x.name, "module.name", project.module.name, "text")}${moduleFields.map((k) => field(equipmentLabel(k, lang), "module." + k, project.module[k])).join("")}</div>${student ? '<p class="small">βVoc, βVmp, γPmax: %/°C (negative). αIsc: %/°C (positive). Vmp &lt; Voc; Imp ≤ Isc.</p>' : ""}</section><section class="panel"><h2>${x.inverter}</h2>${equipmentSelect("inverter")}<div class="form-grid">${field(x.name, "inverter.name", project.inverter.name, "text")}${inverterFields.map((k) => field(equipmentLabel(k, lang), "inverter." + k, project.inverter[k])).join("")}<label class="field"><span>${equipmentLabel("phases", lang)}</span><select data-path="inverter.phases" data-number><option ${project.inverter.phases === 1 ? "selected" : ""}>1</option><option ${project.inverter.phases === 3 ? "selected" : ""}>3</option></select></label></div><h3>MPPT · ${project.inverter.mppts.length}</h3>${project.inverter.mppts
      .map(
        (m, i) =>
          `<div class="form-grid" style="margin-bottom:16px">${field(equipmentLabel("id", lang), `inverter.mppts.${i}.id`, m.id, "text")}${mpptFields.map((k) => field(equipmentLabel(k, lang), `inverter.mppts.${i}.${k}`, m[k])).join("")}<div class="tools"><button data-remove-mppt="${i}" ${project.inverter.mppts.length === 1 ? "disabled" : ""}>${lang === "uk" ? "Видалити MPPT" : "Remove MPPT"}</button></div></div>`,
      )
      .join(
        "",
      )}<div class="tools"><button id="addMppt">${lang === "uk" ? "Додати MPPT (копія останнього)" : "Add MPPT (copy of last)"}</button></div><p class="small">${lang === "uk" ? "Порожнє поле означає невідоме значення (UNKNOWN). Джерела даних — у розділі «Дані проєкту»." : "An empty field means an unknown value (UNKNOWN). Data sources are in Project data."}</p><button data-tab="json">${x.json}</button></section>`;
  if (tab === "equipment")
    content.innerHTML += `<section class="panel"><h2>${lang === "uk" ? "Кандидат запобіжника gPV" : "gPV fuse candidate"}</h2><label class="field"><span>${lang === "uk" ? "Номінальний кандидат; вибір не означає необхідність або узгодження" : "Nominal candidate; selection does not establish requirement or coordination"}</span><select id="fuseCatalog"><option value="">${lang === "uk" ? "Не задано" : "Not specified"}</option>${realFuses.map((f) => `<option value="${esc(f.id)}" ${project.string_fuse_device?.id === f.id ? "selected" : ""}>${esc(f.name)}</option>`).join("")}</select></label>${project.string_fuse_device ? equipmentSources(project.string_fuse_device) : ""}</section>`;
  if (tab === "equipment") content.innerHTML += dcSwitchPanel();
  if (tab === "equipment")
    content.innerHTML += `<section class="panel"><h2>${lang === "uk" ? "Кандидат SPD · окрема перевірка" : "SPD candidate · separate assessment"}</h2><label class="field"><span>${lang === "uk" ? "Тип не визначається лише наявністю LPS" : "LPS presence alone does not determine the type"}</span><select id="spdCatalog"><option value="">${lang === "uk" ? "Не задано" : "Not specified"}</option>${realSpds.map((d) => `<option value="${esc(d.id)}" ${project.spd_device?.id === d.id ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select></label>${project.spd_device ? equipmentSources(project.spd_device) + table(["Ucpv,V", "UocSTC max,V", "Iscpv,A", "Up,kV", "In,kA8/20", "Iimp,kA10/350"], [[fmt(project.spd_device.ucpv_v), fmt(project.spd_device.max_uoc_stc_v), fmt(project.spd_device.iscpv_a), fmt(project.spd_device.up_kv), fmt(project.spd_device.in_8_20_ka), fmt(project.spd_device.iimp_10_350_ka)]]) : ""}<p class="small">${lang === "uk" ? "Параметри заземлення, separation, трасування та джерела вимоги задайте в JSON. UNKNOWN зберігається до повної координації." : "Enter earthing, separation, routing and requirement sources in JSON. UNKNOWN remains pending complete coordination."}</p><button data-tab="json">${t().json}</button></section>`;
  if (tab === "site")
    content.innerHTML = `<section class="panel"><h2>${lang === "uk" ? "Каталог кабелів" : "Cable catalog"}</h2><label class="field"><span>${lang === "uk" ? "Набір даних" : "Data pack"}</span><select id="cableCatalog"><option value="">${lang === "uk" ? "Поточний набір" : "Current data"}</option><option value="nexans">Nexans ID540479078 · UNKNOWN α / derating</option><option value="teaching">SYNTHETIC · teaching cables</option></select></label>${project.cables
      .filter((c) => c.manufacturer)
      .map((c) => equipmentSources(c))
      .join(
        "",
      )}</section><section class="panel"><h2>${x.siteTitle}</h2><div class="form-grid">${field("Tmin cell, °C", "site.t_min_cell_c", project.site.t_min_cell_c)}${field("Tmax cell, °C", "site.t_max_cell_c", project.site.t_max_cell_c)}${field("cos φ", "site.cos_phi", project.site.cos_phi)}${field("Ik, kA", "prospective_short_circuit_ka", project.prospective_short_circuit_ka)}${field("Icu, kA", "breaker_icu_ka", project.breaker_icu_ka)}</div><p class="small">${x.blank}</p></section>${(["dc", "ac"] as const).map((side) => `<section class="panel"><h2>${side === "dc" ? x.dcCable : x.acCable}</h2><div class="form-grid">${field(x.length, side + ".length_m", project[side].length_m)}${field(x.temperature, side + ".conductor_temp_c", project[side].conductor_temp_c)}${field(x.derating, side + ".derating_factor", project[side].derating_factor)}${field(x.basis, side + ".derating_basis", project[side].derating_basis, "text")}${field(lang === "uk" ? "Спосіб прокладання" : "Installation method", side + ".installation_method", project[side].installation_method, "text")}${field(lang === "uk" ? "Температура повітря, °C" : "Ambient temperature, °C", side + ".ambient_temp_c", project[side].ambient_temp_c)}${field(lang === "uk" ? "Кількість згрупованих кіл" : "Grouped circuits", side + ".grouped_circuits", project[side].grouped_circuits)}</div></section>`).join("")}<section class="panel"><h2>${x.policy}</h2><div class="form-grid">${field("Isc factor", "policy.isc_factor", project.policy.isc_factor)}${field("DC ΔU max, %", "policy.dc_drop_max_pct", project.policy.dc_drop_max_pct)}${field("AC ΔU max, %", "policy.ac_drop_max_pct", project.policy.ac_drop_max_pct)}</div><p class="small">${esc(project.policy.sources.map((s) => s.label).join("; "))}</p><button data-tab="json">${x.json}</button></section>`;
  if (tab === "strings")
    content.innerHTML = `<section class="panel"><h2>${lang === "uk" ? "Діапазон модулів у стрінгу" : "String length range"}</h2>${table(
      ["MPPT", "Nmin", "Nmax", "Voc cold, V", "Vmp hot, V"],
      result.ranges.map((m) => [
        esc(m.mppt_id),
        fmt(m.min),
        fmt(m.max),
        fmt(m.voc_cold_v, 3),
        fmt(m.vmp_hot_v, 3),
      ]),
    )}</section><section class="panel"><h2>${lang === "uk" ? "Розподіл стрінгів" : "String allocation"}</h2><div class="mppt-grid">${result.strings.map((s) => `<div class="mppt-box"><strong>${esc(s.id)}</strong><div class="small">${esc(s.plane_id)} · ${s.modules} PV</div><div class="modules" role="img" aria-label="${s.modules} modules">${Array.from({ length: Math.min(s.modules, 60) }, () => "<i></i>").join("")}</div></div>`).join("") || `<div class="empty">UNKNOWN · ${x.missing}</div>`}</div></section>${renderManualStrings(project, result, lang)}<details class="panel"><summary>${lang === "uk" ? "Додатково: ручний план у JSON" : "Advanced: manual plan JSON"}</summary><textarea id="manual" aria-label="${x.manual}">${esc(JSON.stringify(project.manual_strings ?? result.strings, null, 2))}</textarea><div class="tools" style="margin-top:16px"><button id="manualApply" class="primary">${x.manualApply}</button><button id="auto">${x.auto}</button></div></details>`;
  if (tab === "checks")
    content.innerHTML = `${renderMissingData(project, result, lang)}<section class="panel"><div class="check-filters">${["ALL", "FAIL", "UNKNOWN", "WARN", "PASS", "NOT_APPLICABLE"].map((s) => `<button data-filter="${s}" class="${filter === s ? "primary" : ""}">${s === "ALL" ? x.all : s} · ${s === "ALL" ? result.checks.length : result.checks.filter((c) => c.status === s).length}</button>`).join("")}</div>${checksTable()}</section>`;
  if (tab === "report")
    content.innerHTML = `<div class="tools no-print"><button id="print" class="primary">${x.print}</button><button id="reportDownload">${x.exportReport}</button><button id="resultDownload">${x.exportResult}</button></div><article class="report"><h1 class="print-title">Solar Designer Lite · ${esc(project.name)}</h1><section class="panel"><h2>${esc(project.name)}</h2><p>OpenPV ${result.engine_version} · ${badge(result.status)}<br>DC ${fmt(result.dc_power_w / 1000)} kWp / AC ${fmt(result.ac_power_w / 1000)} kW · DC/AC ${fmt(result.dc_ac_ratio, 4)}<br>Tmin ${fmt(project.site.t_min_cell_c)} °C / Tmax cell ${fmt(project.site.t_max_cell_c)} °C</p><p>${x.notice}</p><p>${x.reportNote}</p><h3>${x.equipment}</h3>${equipmentSources(project.module)}${equipmentSources(project.inverter)}${project.string_fuse_device ? equipmentSources(project.string_fuse_device) : ""}${project.spd_device ? equipmentSources(project.spd_device) : ""}${dcSwitchSummary()}<h3>${x.strings}</h3>${planTable()}</section><section class="panel"><h2>${lang === "uk" ? "Кабельні лінії" : "Cable feeders"}</h2>${cableTable()}</section><section class="panel"><h2>BOM</h2>${table(
      [
        lang === "uk" ? "Позиція" : "Item",
        x.count,
        lang === "uk" ? "Од." : "Unit",
        "Basis",
      ],
      result.bom.map((b) => [
        esc(b.item),
        fmt(b.quantity),
        esc(b.unit),
        esc(b.basis),
      ]),
    )}</section><section class="panel"><h2>${x.checks}</h2>${reportChecksTable()}</section></article>`;
  if (tab === "json")
    content.innerHTML = `<section class="panel"><h2>${x.edit}</h2><p class="subtitle">schema_version = 0.1.0 · W, V, A, m, mm², Ω/km, °C, %/°C</p><textarea id="json" aria-label="Project JSON">${esc(JSON.stringify(project, null, 2))}</textarea><div class="tools" style="margin-top:16px"><button id="apply" class="primary">${x.apply}</button><button id="cancel">${x.cancel}</button></div></section>`;
  if (tab === "handbook") content.innerHTML = renderHandbook(lang);
  if (tab === "learn")
    content.innerHTML = `<section class="panel"><h2>${x.learnTitle}</h2><p>${x.intro}</p><div class="exercise"><strong>01 · Voc(Tmin)</strong><p>Voc(T) = VocSTC × [1 + βVoc/100 × (T − 25)]<br>50 × [1 + (−0.28/100) × (−20 − 25)] = 56.3 V.<br>19 PV → 1069.7 V; 20 PV → 1126 V &gt; 1100 V.</p><button data-exercise="cold">${lang === "uk" ? "Порівняти при Tmin −35 °C" : "Compare at Tmin −35 °C"}</button></div><div class="exercise"><strong>02 · UNKNOWN</strong><p>${lang === "uk" ? "Видаліть βVmp. Основний розрахунок стрінгів має стати UNKNOWN. γPmax − αIsc може бути лише окремою апроксимацією." : "Remove βVmp. Main string result must become UNKNOWN. γPmax − αIsc is an approximation only."}</p><button data-exercise="missing">${lang === "uk" ? "Перевірити відсутнє βVmp" : "Test missing βVmp"}</button></div><div class="exercise"><strong>03 · Iac &amp; ΔU</strong><p>Iac = Pout / (√3 × U × cos φ).<br>50 000 / (√3 × 400 × 0.95) = 75.967 A.<br>R(T) = R20 × [1 + α × (T − 20)].<br>${lang === "uk" ? "Збільште AC трасу з 80 до 160 m та перевірте зміну перерізу." : "Increase the AC route from 80 to 160 m and inspect the selected cable."}</p><button data-exercise="length">${lang === "uk" ? "AC траса 160 m" : "AC route 160 m"}</button></div><button data-reset>${x.reset}</button></section>`;
  if (tab === "site")
    content.insertAdjacentHTML(
      "beforeend",
      renderRoutes(project, result, lang) + renderCableInspector(result, lang),
    );
  bind();
}
function download(name: string, content: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function invalidateEquipmentEdit(next: Project, previous: Project): Project {
  type SourcedEquipment = { sources: Project["module"]["sources"] };
  const values = (item: SourcedEquipment) => {
    const { sources, ...data } = item;
    return JSON.stringify(data);
  };
  const invalidate = (
    item: SourcedEquipment,
    before: SourcedEquipment | undefined,
  ) => {
    if (!before || values(item) !== values(before))
      item.sources = item.sources.map((source) => ({
        ...source,
        verification: "USER_INPUT",
        reviewed_on: undefined,
        sha256: undefined,
        notes:
          "Equipment edited by user; published source no longer verifies these values.",
      }));
  };
  invalidate(next.module, previous.module);
  // All catalog equipment has a common source metadata contract.
  for (const key of [
    "inverter",
    "string_fuse_device",
    "spd_device",
    "dc_switch_device",
  ] as const) {
    const item = next[key];
    if (item) invalidate(item, previous[key]);
  }
  for (const cable of next.cables)
    invalidate(
      cable,
      previous.cables.find((c) => c.id === cable.id),
    );
  return next;
}
function bind() {
  bindJsonDrafts();
  bindAttribution(lang, toast);
  bindManualStrings(project, result, lang, (next) => commit(next), toast);
  bindCableInspector(result, lang);
  bindRoutes(
    project,
    result,
    lang,
    (next) => commit(ProjectSchema.parse(next)),
    toast,
  );
  document.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!confirmDraftDiscard(lang)) return;
        tab = b.dataset.tab!;
        render();
      }),
  );
  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        filter = b.dataset.filter!;
        render();
      }),
  );
  document
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-path]")
    .forEach(
      (input) =>
        (input.onchange = () => {
          const clone = structuredClone(project) as any;
          const parts = input.dataset.path!.split(".");
          let target = clone;
          for (const part of parts.slice(0, -1)) target = target[part];
          target[parts.at(-1)!] =
            input.value === ""
              ? null
              : input.type === "number" || input.hasAttribute("data-number")
                ? Number(input.value)
                : input.value;
          try {
            commit(
              invalidateEquipmentEdit(ProjectSchema.parse(clone), project),
            );
          } catch (error) {
            render();
            toast(formatInputError(error, lang));
          }
        }),
    );
  document.querySelectorAll<HTMLButtonElement>("[data-remove-mppt]").forEach(
    (b) =>
      (b.onclick = () => {
        const clone = structuredClone(project);
        clone.inverter.mppts.splice(Number(b.dataset.removeMppt), 1);
        try {
          commit(invalidateEquipmentEdit(ProjectSchema.parse(clone), project));
        } catch (error) {
          toast(formatInputError(error, lang));
        }
      }),
  );
  document.getElementById("addMppt")?.addEventListener("click", () => {
    const clone = structuredClone(project);
    const ids = new Set(clone.inverter.mppts.map((m) => m.id));
    let n = clone.inverter.mppts.length + 1;
    while (ids.has(`MPPT${n}`)) n++;
    const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      .split("")
      .find((c) => !ids.has(c));
    clone.inverter.mppts.push({
      ...structuredClone(clone.inverter.mppts.at(-1)!),
      id: letter ?? `MPPT${n}`,
    });
    try {
      commit(invalidateEquipmentEdit(ProjectSchema.parse(clone), project));
    } catch (error) {
      toast(formatInputError(error, lang));
    }
  });
  document.querySelectorAll<HTMLButtonElement>("[data-remove-plane]").forEach(
    (b) =>
      (b.onclick = () => {
        const p = structuredClone(project);
        p.planes.splice(Number(b.dataset.removePlane), 1);
        delete p.manual_strings;
        commit(p);
      }),
  );
  document
    .getElementById("dcSwitchCatalog")
    ?.addEventListener("change", (e) => {
      const p = structuredClone(project),
        device = realDcSwitches.find(
          (d) => d.id === (e.target as HTMLSelectElement).value,
        );
      if (device) {
        p.dc_switch_device = DcSwitchDeviceSchema.parse(device);
        p.dc_switch_context = {
          rating_id: null,
          required_category: null,
          wiring_diagram: null,
          poles: null,
          scope: null,
          sources: [],
        };
      } else {
        delete p.dc_switch_device;
        delete p.dc_switch_context;
      }
      commit(p);
    });
  document.getElementById("spdCatalog")?.addEventListener("change", (e) => {
    const id = (e.target as HTMLSelectElement).value;
    const p = structuredClone(project);
    const device = realSpds.find((d) => d.id === id);
    if (device) p.spd_device = SpdDeviceSchema.parse(device);
    else delete p.spd_device;
    commit(p);
  });
  document.getElementById("fuseCatalog")?.addEventListener("change", (e) => {
    const id = (e.target as HTMLSelectElement).value;
    const p = structuredClone(project);
    const device = realFuses.find((f) => f.id === id);
    if (device) p.string_fuse_device = StringFuseDeviceSchema.parse(device);
    else delete p.string_fuse_device;
    commit(p);
  });
  document.getElementById("cableCatalog")?.addEventListener("change", (e) => {
    const value = (e.target as HTMLSelectElement).value;
    if (!value) return;
    const p = structuredClone(project);
    p.cables = (value === "nexans" ? realCables : teachingCables).map((c) =>
      CableSchema.parse(c),
    );
    commit(p);
  });
  for (const side of ["module", "inverter"] as const) {
    document
      .getElementById(side + "Catalog")
      ?.addEventListener("change", (e) => {
        const id = (e.target as HTMLSelectElement).value;
        const p = structuredClone(project);
        if (side === "module") {
          const selected = moduleCatalog.find((m) => m.id === id);
          if (!selected) return;
          p.module = structuredClone(selected);
        } else {
          const selected = inverterCatalog.find((i) => i.id === id);
          if (!selected) return;
          p.inverter = structuredClone(selected);
        }
        delete p.manual_strings;
        commit(p);
      });
  }
  const on = (id: string, fn: () => void) => {
    document.getElementById(id)?.addEventListener("click", fn);
  };
  on("addPlane", () => {
    const p = structuredClone(project);
    const id = "plane-" + Date.now();
    p.planes.push({
      id,
      name: lang === "uk" ? "Нова площина" : "New plane",
      module_count: 20,
    });
    delete p.manual_strings;
    commit(p);
  });
  on("lang", () => {
    if (!confirmDraftDiscard(lang)) return;
    lang = lang === "uk" ? "en" : "uk";
    render();
  });
  on("save", () => {
    if (hasUnappliedDraft()) {
      toast(
        lang === "uk"
          ? "Спочатку застосуйте зміни редактора, щоб включити їх до JSON."
          : "Apply editor changes first to include them in JSON.",
      );
      return;
    }
    download("openpv-project.json", JSON.stringify(project, null, 2));
  });
  on("load", () => document.getElementById("file")!.click());
  on("restorePrevious", () => {
    if (!confirmDraftDiscard(lang)) return;
    if (previousProject) commit(previousProject, true);
  });
  document.querySelectorAll("#reset, [data-reset]").forEach((b) =>
    b.addEventListener("click", () => {
      if (
        !window.confirm(
          lang === "uk"
            ? "Замінити поточний проєкт навчальним прикладом? Останній застосований проєкт можна відновити кнопкою «Попередній проєкт». Незастосовані зміни редактора буде відкинуто. Для надійної копії збережіть JSON."
            : "Replace the current project with the teaching example? Previous project restores the last applied project. Unapplied editor changes will be discarded. Save JSON for a reliable backup.",
        )
      )
        return;
      tab = "overview";
      commit(demo, true);
    }),
  );
  on("apply", () => {
    try {
      const edited = ProjectSchema.parse(
        JSON.parse(
          (document.getElementById("json") as HTMLTextAreaElement).value,
        ),
      );
      commit(invalidateEquipmentEdit(edited, project));
    } catch (e) {
      toast(formatInputError(e, lang));
    }
  });
  on("cancel", render);
  on("manualApply", () => {
    try {
      const edited = ProjectSchema.parse({
        ...project,
        manual_strings: JSON.parse(
          (document.getElementById("manual") as HTMLTextAreaElement).value,
        ),
      });
      if (!confirmDraftDiscard(lang, "manual")) return;
      commit(edited);
    } catch (e) {
      toast(formatInputError(e, lang));
    }
  });
  on("auto", () => {
    if (!confirmDraftDiscard(lang)) return;
    const p = structuredClone(project);
    delete p.manual_strings;
    commit(p);
  });
  on("print", () => window.print());
  on("reportDownload", () =>
    download(
      "openpv-report.md",
      projectReport(project, result, lang, {
        ...attribution,
        version: legal.version,
      }),
      "text/markdown",
    ),
  );
  on("resultDownload", () =>
    download("openpv-result.json", JSON.stringify(result, null, 2)),
  );
  document.getElementById("student")?.addEventListener("change", (e) => {
    if (!confirmDraftDiscard(lang)) {
      (e.target as HTMLInputElement).checked = student;
      return;
    }
    student = (e.target as HTMLInputElement).checked;
    render();
  });
  document.querySelectorAll<HTMLButtonElement>("[data-exercise]").forEach(
    (b) =>
      (b.onclick = () => {
        const p = ProjectSchema.parse(demo);
        if (b.dataset.exercise === "cold") p.site.t_min_cell_c = -35;
        if (b.dataset.exercise === "missing") p.module.beta_vmp_pct_c = null;
        if (b.dataset.exercise === "length") p.ac.length_m = 160;
        tab = b.dataset.exercise === "missing" ? "checks" : "strings";
        commit(p, true);
      }),
  );
  document.getElementById("file")?.addEventListener("change", async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const sequence = ++importSequence;
    const revision = projectRevision;
    const isCurrent = () =>
      sequence === importSequence && revision === projectRevision;
    if (file.size > 1024 * 1024) {
      toast(
        lang === "uk"
          ? "Розмір JSON перевищує ліміт 1 МіБ."
          : "JSON size limit: 1 MiB.",
      );
      return;
    }
    try {
      const content = await file.text();
      if (!isCurrent()) return;
      const imported = ProjectSchema.parse(JSON.parse(content));
      if (!confirmDraftDiscard(lang)) {
        (e.target as HTMLInputElement).value = "";
        return;
      }
      commit(imported, true);
    } catch (e) {
      if (isCurrent()) toast(formatInputError(e, lang));
    }
  });
}
window.addEventListener("beforeunload", (event) => {
  if (hasUnappliedDraft()) {
    event.preventDefault();
    event.returnValue = "";
  }
});
render();
if (startupCalculationError) {
  toast(
    lang === "uk"
      ? `Збережений проєкт не вдалося розрахувати; відкрито навчальний приклад. Збережений JSON не змінено. ${formatInputError(startupCalculationError, lang)}`
      : `The saved project could not be calculated; showing the teaching example. Stored JSON was not changed. ${formatInputError(startupCalculationError, lang)}`,
  );
}
