import {
  ProjectSchema,
  type Project,
  type StringConfiguration,
} from "../../../packages/schema/src/index.js";
import type { ProjectResult } from "../../../packages/core/src/index.js";
import { ZodError } from "zod";
import { confirmDraftDiscard } from "./drafts.js";

type Lang = "uk" | "en";
type ManualDraft = {
  id: string;
  inverter: string;
  mppt_id: string;
  plane_id: string;
  modules: string;
};

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
        title: "Ручний план стрінгів",
        note: "Ручний план проходить ті самі електричні перевірки. Неповні дані можуть залишити результат UNKNOWN.",
        id: "ID стрінга",
        inverter: "Інвертор",
        mppt: "MPPT",
        plane: "Площина",
        modules: "Модулі",
        add: "Додати стрінг",
        remove: "Видалити",
        apply: "Застосувати ручний план",
        automatic: "Повернути автоматичний план",
        empty:
          "Стрінгів поки немає. Додайте стрінг і вкажіть кількість модулів.",
        required:
          "Заповніть ID, інвертор, MPPT, площину та цілу кількість модулів більше нуля для кожного стрінга.",
        duplicate: "ID стрінгів мають бути унікальними.",
        field: "Поле",
        missingTarget: "Відсутня ціль",
        invalid: "Ручний план не пройшов перевірку схеми.",
      }
    : {
        title: "Manual string plan",
        note: "A manual plan receives the same electrical checks. Incomplete data may leave results UNKNOWN.",
        id: "String ID",
        inverter: "Inverter",
        mppt: "MPPT",
        plane: "Plane",
        modules: "Modules",
        add: "Add string",
        remove: "Remove",
        apply: "Apply manual plan",
        automatic: "Return to automatic plan",
        empty:
          "There are no strings yet. Add a string and enter its module count.",
        required:
          "Enter an ID, inverter, MPPT, plane, and a whole module count above zero for every string.",
        duplicate: "String IDs must be unique.",
        field: "Field",
        missingTarget: "Missing target",
        invalid: "The manual plan failed schema validation.",
      };

export function createBlankManualDraft(
  project: Project,
  existingIds: string[],
): ManualDraft {
  let suffix = 1;
  while (existingIds.includes(`s${suffix}`)) suffix++;
  return {
    id: `s${suffix}`,
    inverter: "1",
    mppt_id: project.inverter.mppts[0]!.id,
    plane_id: project.planes[0]!.id,
    modules: "",
  };
}

function fromConfiguration(row: StringConfiguration): ManualDraft {
  return {
    id: row.id,
    inverter: String(row.inverter),
    mppt_id: row.mppt_id,
    plane_id: row.plane_id,
    modules: String(row.modules),
  };
}

function rowField(
  label: string,
  key: keyof ManualDraft,
  value: string,
  rowIndex: number,
  lang: Lang,
  options?: Array<{ value: string; label: string }>,
) {
  const accessible = `${label} ${rowIndex + 1}`;
  const optionRows = options ?? [];
  const availableOptions =
    options && !options.some((option) => option.value === value)
      ? [
          {
            value,
            label: `${labels(lang).missingTarget}: ${value}`,
          },
          ...optionRows,
        ]
      : optionRows;
  const control = options
    ? `<select data-manual-field="${key}" aria-label="${esc(accessible)}">${availableOptions
        .map(
          (option) =>
            `<option value="${esc(option.value)}"${option.value === value ? " selected" : ""}>${esc(option.label)}</option>`,
        )
        .join("")}</select>`
    : `<input data-manual-field="${key}" aria-label="${esc(accessible)}" type="${key === "modules" ? "number" : "text"}" ${key === "modules" ? 'min="1" step="1"' : ""} value="${esc(value)}">`;
  return `<label class="field"><span>${esc(label)}</span>${control}</label>`;
}

function renderRows(project: Project, rows: ManualDraft[], lang: Lang): string {
  const text = labels(lang);
  const inverters = Array.from(
    { length: project.inverter_quantity },
    (_, index) => ({ value: String(index + 1), label: String(index + 1) }),
  );
  const mppts = project.inverter.mppts.map((mppt) => ({
    value: mppt.id,
    label: mppt.id,
  }));
  const planes = project.planes.map((plane) => ({
    value: plane.id,
    label: plane.name || plane.id,
  }));
  return rows
    .map(
      (row, index) =>
        `<tr data-manual-row><td>${rowField(text.id, "id", row.id, index, lang)}</td><td>${rowField(text.inverter, "inverter", row.inverter, index, lang, inverters)}</td><td>${rowField(text.mppt, "mppt_id", row.mppt_id, index, lang, mppts)}</td><td>${rowField(text.plane, "plane_id", row.plane_id, index, lang, planes)}</td><td>${rowField(text.modules, "modules", row.modules, index, lang)}</td><td><button type="button" data-manual-remove="${index}" aria-label="${esc(text.remove)} ${index + 1}">${esc(text.remove)}</button></td></tr>`,
    )
    .join("");
}

export function renderManualStrings(
  project: Project,
  result: ProjectResult,
  lang: Lang,
): string {
  const text = labels(lang);
  const initialRows = (project.manual_strings ?? result.strings).map(
    fromConfiguration,
  );
  return `<section class="panel" id="manualPlan"><h2>${esc(text.title)}</h2><p class="small">${esc(text.note)}</p><div class="table-wrap"><table><thead><tr><th>${esc(text.id)}</th><th>${esc(text.inverter)}</th><th>${esc(text.mppt)}</th><th>${esc(text.plane)}</th><th>${esc(text.modules)}</th><th></th></tr></thead><tbody id="manualPlanRows">${renderRows(project, initialRows, lang)}</tbody></table></div><p class="empty" id="manualPlanEmpty"${initialRows.length ? " hidden" : ""}>${esc(text.empty)}</p><div class="tools"><button type="button" id="manualPlanAdd">${esc(text.add)}</button><button type="button" class="primary" id="manualPlanApply">${esc(text.apply)}</button><button type="button" id="manualPlanAuto">${esc(text.automatic)}</button></div></section>`;
}

function readDraftRows(root: HTMLElement): ManualDraft[] {
  return Array.from(root.querySelectorAll("[data-manual-row]"), (row) => {
    const fieldValue = (key: keyof ManualDraft) =>
      row.querySelector<HTMLInputElement | HTMLSelectElement>(
        `[data-manual-field="${key}"]`,
      )?.value ?? "";
    return {
      id: fieldValue("id"),
      inverter: fieldValue("inverter"),
      mppt_id: fieldValue("mppt_id"),
      plane_id: fieldValue("plane_id"),
      modules: fieldValue("modules"),
    };
  });
}

export function bindManualStrings(
  project: Project,
  _result: ProjectResult,
  lang: Lang,
  commit: (next: Project) => void,
  toast: (message: string) => void,
): void {
  const root = document.getElementById("manualPlan");
  const body = document.getElementById("manualPlanRows");
  const empty = document.getElementById("manualPlanEmpty");
  if (!root || !body || !empty || root.dataset.manualPlanBound === "true")
    return;
  root.dataset.manualPlanBound = "true";
  const text = labels(lang);
  root.addEventListener("input", () => {
    root.dataset.manualDirty = "true";
  });

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const addButton = target.closest<HTMLButtonElement>("#manualPlanAdd");
    if (addButton) {
      root.dataset.manualDirty = "true";
      const rows = readDraftRows(root);
      rows.push(
        createBlankManualDraft(
          project,
          rows.map((row) => row.id),
        ),
      );
      body.innerHTML = renderRows(project, rows, lang);
      empty.hidden = rows.length > 0;
      return;
    }
    const removeButton = target.closest<HTMLButtonElement>(
      "[data-manual-remove]",
    );
    if (removeButton) {
      const index = Number(removeButton.dataset.manualRemove);
      const rows = readDraftRows(root);
      if (!Number.isInteger(index) || index < 0 || index >= rows.length) return;
      root.dataset.manualDirty = "true";
      rows.splice(index, 1);
      body.innerHTML = renderRows(project, rows, lang);
      empty.hidden = rows.length > 0;
      return;
    }
    if (target.closest("#manualPlanApply")) {
      const draft = readDraftRows(root);
      const rows: StringConfiguration[] = [];
      for (const row of draft) {
        const modules = Number(row.modules);
        const inverter = Number(row.inverter);
        if (
          !row.id.trim() ||
          !Number.isInteger(inverter) ||
          !Number.isInteger(modules) ||
          modules < 1 ||
          !row.mppt_id ||
          !row.plane_id
        ) {
          toast(text.required);
          return;
        }
        rows.push({
          id: row.id.trim(),
          inverter,
          mppt_id: row.mppt_id,
          plane_id: row.plane_id,
          modules,
        });
      }
      if (new Set(rows.map((row) => row.id)).size !== rows.length) {
        toast(text.duplicate);
        return;
      }
      try {
        const validated = ProjectSchema.parse({
          ...project,
          manual_strings: rows,
        });
        if (!confirmDraftDiscard(lang, "manualPlan")) return;
        commit(validated);
      } catch (reason) {
        const path =
          reason instanceof ZodError
            ? reason.issues[0]?.path.map(String).join(".")
            : "";
        toast(path ? `${text.invalid} ${text.field}: ${path}` : text.invalid);
      }
      return;
    }
    if (target.closest("#manualPlanAuto")) {
      if (!confirmDraftDiscard(lang)) return;
      const next = structuredClone(project);
      delete next.manual_strings;
      commit(next);
    }
  });
}
