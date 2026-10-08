import type { ProjectResult } from "../../../packages/core/src/index.js";

type Lang = "uk" | "en";
type CableLine =
  ProjectResult["dc_lines"][number] | ProjectResult["ac_lines"][number];
type CableCandidate =
  ProjectResult["dc_lines"][number]["cable"]["candidates"][number];
type CableCheck = CableCandidate["checks"][number];
type CableSource = CableCandidate["cable"]["sources"][number];

const esc = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );

const copy = (lang: Lang) =>
  lang === "uk"
    ? {
        title: "Інспектор кабельних кандидатів",
        choose: "Кабельна лінія",
        noLines: "Немає кабельних ліній для перегляду.",
        dc: "DC стрінг",
        ac: "AC інвертор",
        origin: "Походження вводу",
        resolved: "Фактичний CircuitInput",
        selected: "Вибраний кандидат",
        rejected: "Не обраний",
        noProven: "Немає доведеного кандидата кабелю для цієї лінії.",
        noCandidates:
          "У проєкті не вибрано кабелів для цієї лінії. Оберіть набір даних у «Каталог кабелів» вище або задайте кабелі в JSON.",
        candidates: "Кандидати кабелю",
        checks: "Перевірки",
        section: "Переріз, mm²",
        resistance: "R(T), Ω/km",
        ampacity: "Iz з derating, A",
        dropV: "Падіння напруги, V",
        dropPct: "Падіння напруги, %",
        id: "ID",
        status: "Статус",
        demand: "Попит",
        capacity: "Межа",
        unit: "Од.",
        basis: "Підстава",
        missing: "Бракує даних",
        sources: "Джерела",
        verification: "Перевірка",
        reviewed: "Дата перегляду",
        emptySources: "Джерела не вказані.",
        selectionChecks: "Перевірки вибору",
        unknown: "UNKNOWN",
      }
    : {
        title: "Cable candidate inspector",
        choose: "Cable route",
        noLines: "There are no cable routes to inspect.",
        dc: "DC string",
        ac: "AC inverter",
        origin: "Input origin",
        resolved: "Resolved CircuitInput",
        selected: "Selected candidate",
        rejected: "Not selected",
        noProven: "No proven cable candidate is available for this route.",
        noCandidates:
          "No cables selected for this circuit. Choose a data pack in 'Cable catalog' above or supply cables in JSON.",
        candidates: "Cable candidates",
        checks: "Checks",
        section: "Section, mm²",
        resistance: "R(T), Ω/km",
        ampacity: "Derated Iz, A",
        dropV: "Voltage drop, V",
        dropPct: "Voltage drop, %",
        id: "ID",
        status: "Status",
        demand: "Demand",
        capacity: "Capacity",
        unit: "Unit",
        basis: "Basis",
        missing: "Missing data",
        sources: "Sources",
        verification: "Verification",
        reviewed: "Reviewed on",
        emptySources: "No sources provided.",
        selectionChecks: "Selection checks",
        unknown: "UNKNOWN",
      };

function value(value: number | null | undefined, lang: Lang, digits = 3) {
  return value == null
    ? copy(lang).unknown
    : new Intl.NumberFormat(lang === "uk" ? "uk-UA" : "en-US", {
        maximumFractionDigits: digits,
      }).format(value);
}

function statusBadge(status: string) {
  return `<span class="status ${esc(status)}">${esc(status)}</span>`;
}

function checksTable(checks: CableCheck[], lang: Lang) {
  const text = copy(lang);
  if (!checks.length) return `<p class="small">${esc(text.unknown)}</p>`;
  return `<div class="table-wrap"><table><thead><tr><th>${esc(text.status)}</th><th>${esc(text.id)}</th><th>${esc(text.demand)}</th><th>${esc(text.capacity)}</th><th>${esc(text.unit)}</th><th>${esc(text.basis)}</th><th>${esc(text.missing)}</th></tr></thead><tbody>${checks
    .map(
      (check) =>
        `<tr><td>${statusBadge(check.status)}</td><td>${esc(check.id)}</td><td>${esc(value(check.demand, lang))}</td><td>${esc(value(check.capacity, lang))}</td><td>${esc(check.unit || "—")}</td><td>${esc(check.basis)}</td><td>${esc(check.missing.length ? check.missing.join(", ") : "—")}</td></tr>`,
    )
    .join("")}</tbody></table></div>`;
}

function sourceList(candidate: CableCandidate, line: CableLine, lang: Lang) {
  const text = copy(lang);
  const sources: CableSource[] = [
    ...candidate.cable.sources,
    ...(candidate.cable.ampacity_reference?.sources ?? []),
    ...(line.circuit_input.derating_evidence
      ? [
          ...line.circuit_input.derating_evidence.temperature.sources,
          ...line.circuit_input.derating_evidence.grouping.sources,
          ...line.circuit_input.derating_evidence.installation.sources,
        ]
      : []),
  ];
  // Preserve different revisions/locators even when their IDs or URLs coincide.
  const seenRecords = new Set<string>();
  const uniqueSources = sources.filter((source) => {
    const signature = JSON.stringify(source);
    if (seenRecords.has(signature)) return false;
    seenRecords.add(signature);
    return true;
  });
  if (!uniqueSources.length)
    return `<p class="small">${esc(text.emptySources)}</p>`;
  return `<ul>${uniqueSources
    .map((source) => {
      let label = esc(source.label);
      if (source.url) {
        let safeUrl: string | undefined;
        try {
          const parsed = new URL(source.url);
          if (parsed.protocol === "http:" || parsed.protocol === "https:")
            safeUrl = parsed.href;
        } catch {
          // Unparseable URLs stay visible as plain text.
        }
        const displayUrl = safeUrl
          ? `<a href="${esc(safeUrl)}" target="_blank" rel="noopener noreferrer">${esc(source.url)}</a>`
          : esc(source.url);
        label += ` · ${displayUrl}`;
      }
      return `<li>${label} · ${esc(text.verification)}: ${esc(source.verification)} · ${esc(text.reviewed)}: ${esc(source.reviewed_on ?? text.unknown)}${source.document_revision ? ` · ${esc(source.document_revision)}` : ""}${source.locator ? ` · ${esc(source.locator)}` : ""}${source.notes ? ` · ${esc(source.notes)}` : ""}</li>`;
    })
    .join("")}</ul>`;
}

function candidateDetails(
  candidate: CableCandidate,
  line: CableLine,
  selectedId: string | undefined,
  lang: Lang,
) {
  const text = copy(lang);
  const isSelected = selectedId === candidate.cable.id;
  const heading = `${candidate.cable.id} · ${candidate.cable.name} · ${candidate.cable.section_mm2} mm² · ${isSelected ? text.selected : text.rejected} · ${candidate.status}`;
  return `<details class="cable-candidate"><summary>${esc(heading)}</summary><div class="form-grid"><div><span class="small">${esc(text.id)}</span><p>${esc(candidate.cable.id)}</p></div><div><span class="small">${esc(text.section)}</span><p>${esc(value(candidate.cable.section_mm2, lang))}</p></div><div><span class="small">${esc(text.resistance)}</span><p>${esc(value(candidate.r_ohm_km, lang))}</p></div><div><span class="small">${esc(text.ampacity)}</span><p>${esc(value(candidate.iz_derated_a, lang))}</p></div><div><span class="small">${esc(text.dropV)}</span><p>${esc(value(candidate.drop_v, lang))}</p></div><div><span class="small">${esc(text.dropPct)}</span><p>${esc(value(candidate.drop_pct, lang))}</p></div></div><h4>${esc(text.sources)}</h4>${sourceList(candidate, line, lang)}<details><summary>${esc(text.checks)} · ${candidate.checks.length}</summary>${checksTable(candidate.checks, lang)}</details></details>`;
}

function selectedLine(
  result: ProjectResult,
  selection: string,
  lang: Lang,
): {
  title: string;
  line: CableLine | undefined;
} {
  if (selection.startsWith("dc:")) {
    const index = Number(selection.slice(3));
    const line = Number.isInteger(index) ? result.dc_lines[index] : undefined;
    return {
      title: line ? `${copy(lang).dc} · ${line.string_id} · #${index + 1}` : "",
      line,
    };
  }
  if (selection.startsWith("ac:")) {
    const inverter = Number(selection.slice(3));
    const line = result.ac_lines.find((row) => row.inverter === inverter);
    return { title: `${copy(lang).ac} · ${inverter}`, line };
  }
  return { title: "", line: undefined };
}

function selectedContent(result: ProjectResult, selection: string, lang: Lang) {
  const text = copy(lang);
  const { title, line } = selectedLine(result, selection, lang);
  if (!line) return `<p class="empty">${esc(text.noLines)}</p>`;
  const selectedId = line.cable.selected?.cable.id;
  const hasCandidate = selectedId != null;
  return `<h3>${esc(title)}</h3><p>${esc(text.origin)}: ${statusBadge(line.input_origin)}</p><details><summary>${esc(text.resolved)}</summary><div class="table-wrap"><pre>${esc(JSON.stringify(line.circuit_input, null, 2))}</pre></div></details>${hasCandidate ? "" : `<p class="banner info" role="status">${esc(text.noProven)}</p>`}<h4>${esc(text.candidates)} · ${line.cable.candidates.length}</h4>${
    line.cable.candidates
      .map((candidate) => candidateDetails(candidate, line, selectedId, lang))
      .join("") || `<p class="empty">${esc(text.noCandidates)}</p>`
  }<details><summary>${esc(text.selectionChecks)} · ${line.cable.checks.length}</summary>${checksTable(line.cable.checks, lang)}</details>`;
}

function options(result: ProjectResult, lang: Lang, selected: string) {
  const text = copy(lang);
  return [
    ...result.dc_lines.map((line, index) => {
      const optionValue = `dc:${index}`;
      return `<option value="${esc(optionValue)}"${optionValue === selected ? " selected" : ""}>${esc(text.dc)} · ${esc(line.string_id)} · #${index + 1}</option>`;
    }),
    ...result.ac_lines.map((line) => {
      const optionValue = `ac:${line.inverter}`;
      return `<option value="${esc(optionValue)}"${optionValue === selected ? " selected" : ""}>${esc(text.ac)} · ${line.inverter}</option>`;
    }),
  ];
}

export function renderCableInspector(
  result: ProjectResult,
  lang: Lang,
): string {
  const text = copy(lang);
  const initialSelection =
    result.dc_lines[0] != null
      ? "dc:0"
      : result.ac_lines[0] != null
        ? `ac:${result.ac_lines[0].inverter}`
        : "";
  const available = options(result, lang, initialSelection);
  return `<section class="panel" id="cableInspector"><h2>${esc(text.title)}</h2><label class="field"><span>${esc(text.choose)}</span><select id="cableCircuit" aria-label="${esc(text.choose)}">${
    available.join("") || `<option value="">${esc(text.noLines)}</option>`
  }</select></label><div id="cableCandidates" aria-live="polite">${selectedContent(result, initialSelection, lang)}</div></section>`;
}

export function bindCableInspector(result: ProjectResult, lang: Lang): void {
  const select = document.getElementById("cableCircuit");
  const body = document.getElementById("cableCandidates");
  if (!(select instanceof HTMLSelectElement) || !body) return;
  select.onchange = () => {
    body.innerHTML = selectedContent(result, select.value, lang);
  };
}
