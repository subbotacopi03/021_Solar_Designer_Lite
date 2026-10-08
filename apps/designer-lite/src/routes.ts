import type {
  Project,
  CircuitInput,
  StringConfiguration,
} from "../../../packages/schema/src/index.js";
import type { ProjectResult } from "../../../packages/core/src/index.js";
import { formatInputError } from "./input-errors.js";

type Lang = "uk" | "en";

const esc = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
const fields: Array<keyof CircuitInput> = [
  "length_m",
  "conductor_temp_c",
  "derating_factor",
  "derating_basis",
  "installation_method",
  "ambient_temp_c",
  "grouped_circuits",
];

const labels = (lang: Lang) =>
  lang === "uk"
    ? {
        title: "Окремі кабельні траси",
        note: "Перевизначення повністю замінює спільні параметри траси. Порожні поля залишаються UNKNOWN; автоматичного запасного значення немає.",
        target: "Ціль",
        length: "Довжина, m",
        origin: "Джерело",
        common: "Спільні параметри",
        override: "Повне перевизначення",
        add: "Створити знімок спільних параметрів",
        remove: "Видалити перевизначення → спільні",
        rebind: "Прив’язати до поточного стрінга",
        orphan: "Осиротілі перевизначення",
        removeOrphan: "Видалити",
        stale:
          "Ціль стрінга змінилася. Перевизначення не застосовується, доки його явно не прив’язано заново.",
        ambiguous:
          "ID стрінга повторюється. Виправте ручний план; збережена траса не застосовується.",
        empty: "Немає поточних ліній.",
        ac: "AC фідер",
        dc: "DC стрінг",
        temperature: "Температура провідника, °C",
        derating: "Коефіцієнт derating",
        basis: "Підстава derating",
        method: "Спосіб прокладання",
        ambient: "Температура повітря, °C",
        grouping: "Згруповані кола",
        noEvidence:
          "Неповний або застарілий ввід може залишити результат UNKNOWN.",
      }
    : {
        title: "Individual cable routes",
        note: "An override replaces the complete common route input. Empty fields remain UNKNOWN; no fallback value is applied.",
        target: "Target",
        length: "Length, m",
        origin: "Source",
        common: "Common input",
        override: "Full override",
        add: "Create snapshot of common input",
        remove: "Remove override → common",
        rebind: "Bind to current string",
        orphan: "Orphaned overrides",
        removeOrphan: "Remove",
        stale:
          "The string target changed. This override is not applied until explicitly rebound.",
        ambiguous:
          "String ID is duplicated. Fix the manual plan; the saved route is not applied.",
        empty: "No current lines.",
        ac: "AC feeder",
        dc: "DC string",
        temperature: "Conductor temperature, °C",
        derating: "Derating factor",
        basis: "Derating basis",
        method: "Installation method",
        ambient: "Ambient temperature, °C",
        grouping: "Grouped circuits",
        noEvidence: "Incomplete or stale input may leave the result UNKNOWN.",
      };

function fieldLabel(key: keyof CircuitInput, text: ReturnType<typeof labels>) {
  const names: Record<string, string> = {
    length_m: text.length,
    conductor_temp_c: text.temperature,
    derating_factor: text.derating,
    derating_basis: text.basis,
    installation_method: text.method,
    ambient_temp_c: text.ambient,
    grouped_circuits: text.grouping,
  };
  return names[key];
}

function inputField(
  side: "dc" | "ac",
  index: number,
  key: keyof CircuitInput,
  circuit: CircuitInput,
  text: ReturnType<typeof labels>,
) {
  const numeric = key !== "derating_basis" && key !== "installation_method";
  return `<label class="field"><span>${esc(fieldLabel(key, text))}</span><input data-route-field="${side}" data-route-index="${index}" data-route-key="${key}" type="${numeric ? "number" : "text"}" ${numeric ? 'step="any"' : ""} value="${esc(circuit[key])}"></label>`;
}

function editForm(
  side: "dc" | "ac",
  index: number,
  circuit: CircuitInput,
  text: ReturnType<typeof labels>,
) {
  return `<div class="form-grid">${fields.map((key) => inputField(side, index, key, circuit, text)).join("")}</div><p class="small">${esc(text.noEvidence)}</p>`;
}

function targetName(target: StringConfiguration) {
  return `${target.id} · INV ${target.inverter} · ${target.mppt_id} · ${target.plane_id} · ${target.modules} PV`;
}

export function renderRoutes(
  project: Project,
  result: ProjectResult,
  lang: Lang,
): string {
  const p = project;
  const r = result;
  const text = labels(lang);
  const dcOverrides = p.dc_routes ?? [];
  const acOverrides = p.ac_routes ?? [];
  const dcRows = r.dc_lines
    .map((line, lineIndex) => {
      const current = r.strings[lineIndex];
      const routeIndex = current
        ? dcOverrides.findIndex((route) => route.target.id === current.id)
        : -1;
      const hasOverride = routeIndex >= 0;
      const isStale = line.input_origin === "STALE_OVERRIDE";
      const isAmbiguous = line.input_origin === "AMBIGUOUS_OVERRIDE";
      const circuit = dcOverrides[routeIndex]?.circuit ?? line.circuit_input;
      const targetIndex = current ? lineIndex : -1;
      return `<tr><td>${esc(text.dc)} · ${esc(current ? targetName(current) : line.string_id)}</td><td>${esc(circuit.length_m ?? "—")}</td><td>${esc(hasOverride ? text.override : text.common)}${isAmbiguous ? `<div class="small">${esc(text.ambiguous)}</div>` : ""}${isStale ? `<div class="small">${esc(text.stale)}</div>` : ""}</td><td><button data-route-action="${hasOverride ? "remove-dc" : "add-dc"}" data-route-index="${hasOverride ? routeIndex : targetIndex}" ${current && (hasOverride || !isAmbiguous) ? "" : "disabled"}>${esc(hasOverride ? text.remove : text.add)}</button>${hasOverride && isStale && current ? ` <button data-route-action="rebind-dc" data-route-index="${routeIndex}" data-route-target="${targetIndex}">${esc(text.rebind)}</button>` : ""}</td></tr>${hasOverride ? `<tr><td colspan="4">${editForm("dc", routeIndex, circuit, text)}</td></tr>` : ""}`;
    })
    .join("");
  const acRows = r.ac_lines
    .map((line) => {
      const routeIndex = acOverrides.findIndex(
        (route) => route.inverter === line.inverter,
      );
      const hasOverride = routeIndex >= 0;
      const circuit = acOverrides[routeIndex]?.circuit ?? line.circuit_input;
      return `<tr><td>${esc(text.ac)} · ${line.inverter}</td><td>${esc(circuit.length_m ?? "—")}</td><td>${esc(hasOverride ? text.override : text.common)}</td><td><button data-route-action="${hasOverride ? "remove-ac" : "add-ac"}" data-route-index="${hasOverride ? routeIndex : line.inverter}">${esc(hasOverride ? text.remove : text.add)}</button></td></tr>${hasOverride ? `<tr><td colspan="4">${editForm("ac", routeIndex, circuit, text)}</td></tr>` : ""}`;
    })
    .join("");
  const liveIds = new Set(r.strings.map((row) => row.id));
  const liveInverters = new Set(r.ac_lines.map((line) => line.inverter));
  const orphanDc = dcOverrides
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => !liveIds.has(route.target.id));
  const orphanAc = acOverrides
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => !liveInverters.has(route.inverter));
  const orphans = [
    ...orphanDc.map(
      ({ route, index }) =>
        `<li>${esc(text.dc)} · ${esc(targetName(route.target))} <button data-route-action="remove-orphan-dc" data-route-index="${index}">${esc(text.removeOrphan)}</button></li>`,
    ),
    ...orphanAc.map(
      ({ route, index }) =>
        `<li>${esc(text.ac)} · ${route.inverter} <button data-route-action="remove-orphan-ac" data-route-index="${index}">${esc(text.removeOrphan)}</button></li>`,
    ),
  ].join("");

  return `<section class="panel" id="cableRoutes"><h2>${esc(text.title)}</h2><p class="small">${esc(text.note)}</p><div class="table-wrap"><table><thead><tr><th>${esc(text.target)}</th><th>${esc(text.length)}</th><th>${esc(text.origin)}</th><th></th></tr></thead><tbody>${dcRows}${acRows}</tbody></table></div>${!dcRows && !acRows ? `<p class="empty">${esc(text.empty)}</p>` : ""}${orphans ? `<h3>${esc(text.orphan)}</h3><ul>${orphans}</ul>` : ""}</section>`;
}

export function bindRoutes(
  project: Project,
  result: ProjectResult,
  lang: Lang,
  commit: (next: unknown) => void,
  toast: (message: string) => void,
): void {
  const root = document.getElementById("cableRoutes");
  if (!root) return;
  const p = project;
  const clone = () => structuredClone(p);
  const error = (reason: unknown) => toast(formatInputError(reason, lang));

  root.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.dataset.routeField)
      return;
    const side = target.dataset.routeField as "dc" | "ac";
    const index = Number(target.dataset.routeIndex);
    const rawKey = target.dataset.routeKey;
    if (!rawKey || !fields.some((field) => field === rawKey)) return;
    const key = fields.find((field) => field === rawKey)!;
    const collection =
      side === "dc" ? (p.dc_routes ?? []) : (p.ac_routes ?? []);
    const route = collection[index];
    if (!route || !fields.includes(key)) return;
    const restoreInput = () => {
      const previous = route.circuit[key];
      target.value = previous == null ? "" : String(previous);
    };
    const value = target.value.trim();
    let parsed: number | string | null = value || null;
    if (value && key !== "derating_basis" && key !== "installation_method") {
      parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        restoreInput();
        toast(
          lang === "uk"
            ? "Введіть коректне числове значення."
            : "Invalid route value",
        );
        return;
      }
    }
    const next = clone();
    const nextRoute =
      side === "dc" ? next.dc_routes?.[index] : next.ac_routes?.[index];
    if (!nextRoute) return;
    nextRoute.circuit = { ...nextRoute.circuit, [key]: parsed };
    try {
      commit(next);
    } catch (reason) {
      restoreInput();
      error(reason);
    }
  });

  root.addEventListener("click", (event) => {
    const element = event.target;
    if (!(element instanceof Element)) return;
    const button = element.closest<HTMLButtonElement>(
      "button[data-route-action]",
    );
    if (!button) return;
    const action = button.dataset.routeAction;
    const index = Number(button.dataset.routeIndex);
    const next = clone();
    const currentResult = result;
    try {
      if (action === "add-dc") {
        const targetString = currentResult.strings[index];
        if (!targetString)
          throw new Error(
            lang === "uk"
              ? "Цільовий стрінг більше недоступний."
              : "String target is no longer available",
          );
        next.dc_routes ??= [];
        next.dc_routes.push({
          target: structuredClone(targetString),
          circuit: structuredClone(p.dc),
        });
      } else if (action === "add-ac") {
        const inverter = index;
        if (!currentResult.ac_lines.some((line) => line.inverter === inverter))
          throw new Error(
            lang === "uk"
              ? "Цільовий інвертор більше недоступний."
              : "Inverter target is no longer available",
          );
        next.ac_routes ??= [];
        next.ac_routes.push({ inverter, circuit: structuredClone(p.ac) });
      } else if (action === "remove-dc" || action === "remove-orphan-dc") {
        next.dc_routes?.splice(index, 1);
      } else if (action === "remove-ac" || action === "remove-orphan-ac") {
        next.ac_routes?.splice(index, 1);
      } else if (action === "rebind-dc") {
        const oldRoute = next.dc_routes?.[index];
        const targetString =
          currentResult.strings[Number(button.dataset.routeTarget)];
        if (!oldRoute || !targetString)
          throw new Error(
            lang === "uk"
              ? "Поточний стрінг більше недоступний."
              : "Current string target is no longer available",
          );
        oldRoute.target = structuredClone(targetString);
      } else {
        return;
      }
      commit(next);
    } catch (reason) {
      error(reason);
    }
  });
}
