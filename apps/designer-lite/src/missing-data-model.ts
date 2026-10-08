import type {
  Project,
  EngineeringCheck,
} from "../../../packages/schema/src/index.js";
import type { ProjectResult } from "../../../packages/core/src/index.js";
export type Source = Project["module"]["sources"][number];
type Tab = "equipment" | "site" | "json";
type Line =
  ProjectResult["dc_lines"][number] | ProjectResult["ac_lines"][number];
type Context = {
  scope: string;
  label: string;
  path?: string;
  line?: Line;
  cable?: Project["cables"][number];
  cableIndex?: number;
  mpptIndex?: number;
  dc?: boolean;
};
export type MissingDataGroup = {
  field: string;
  path: string;
  scope: string;
  location: string;
  state: "MISSING" | "PROVIDED" | "REVIEW";
  value: unknown;
  sources: Source[];
  checks: EngineeringCheck[];
  tab: Tab;
};
import {
  moduleFields,
  mpptFields,
  circuitFields,
  cableFields,
} from "./missing-data-fields.js";
const uniqueSources = (sources: Source[]) => [
  ...new Map(sources.map((s) => [JSON.stringify(s), s])).values(),
];
const get = (object: unknown, key: string): unknown =>
  object && typeof object === "object" && Object.hasOwn(object, key)
    ? (object as Record<string, unknown>)[key]
    : undefined;

/** A view model only: inspect findings and actual values; no engineering arithmetic. */
export function collectMissingData(
  project: Project,
  result: ProjectResult,
): MissingDataGroup[] {
  const groups = new Map<string, MissingDataGroup>();
  const seenChecks = new Map<string, Set<string>>();
  const cableIndices = new Map(project.cables.map((c, index) => [c.id, index]));
  const allSources: Source[] = [];
  function visit(value: unknown): void {
    if (!value || typeof value !== "object") return;
    if (
      typeof get(value, "verification") === "string" &&
      typeof get(value, "label") === "string" &&
      typeof get(value, "id") === "string"
    )
      allSources.push(value as Source);
    else for (const child of Object.values(value)) visit(child);
  }
  visit(project);
  function record(field: string, check: EngineeringCheck, ctx: Context) {
    const add = (
      owner: unknown,
      key: string,
      path: string,
      scope: string,
      location: string,
      sources: Source[],
      tab: Tab,
      review = false,
    ) => {
      const value = get(owner, key);
      const state = review
        ? "REVIEW"
        : value == null || (Array.isArray(value) && value.length === 0)
          ? "MISSING"
          : "PROVIDED";
      const id = JSON.stringify([scope, path, field]);
      let group = groups.get(id);
      if (!group) {
        group = {
          field,
          path,
          scope,
          location,
          state,
          value,
          sources: uniqueSources(sources),
          checks: [],
          tab,
        };
        groups.set(id, group);
      }
      group.sources = uniqueSources([...group.sources, ...sources]);
      const signature = JSON.stringify(check);
      const seen = seenChecks.get(id) ?? new Set<string>();
      if (!seen.has(signature)) {
        seen.add(signature);
        seenChecks.set(id, seen);
        group.checks.push(check);
      }
    };
    if (moduleFields.includes(field))
      return add(
        project.module,
        field,
        `module.${field}`,
        "module",
        project.module.name,
        project.module.sources,
        "equipment",
      );
    if (["t_min_cell_c", "t_max_cell_c", "cos_phi"].includes(field))
      return add(
        project.site,
        field,
        `site.${field}`,
        "site",
        "Site",
        [],
        "site",
      );
    if (
      [
        "isc_factor",
        "dc_ac_band",
        "fuse_min_factor",
        "fuse_max_factor",
      ].includes(field)
    )
      return add(
        project.policy,
        field,
        `policy.${field}`,
        "policy",
        "Policy",
        project.policy.sources,
        "json",
      );
    if (field === "max_dc_power_w" || field === "inverter_backfeed_a") {
      const key =
        field === "inverter_backfeed_a" ? "max_backfeed_current_a" : field;
      return add(
        project.inverter,
        key,
        `inverter.${key}`,
        "inverter",
        project.inverter.name,
        project.inverter.sources,
        "equipment",
      );
    }
    if (mpptFields.includes(field)) {
      project.inverter.mppts.forEach((mppt, index) => {
        if (ctx.mpptIndex == null || ctx.mpptIndex === index)
          add(
            mppt,
            field,
            `inverter.mppts.${index}.${field}`,
            `mppt:${index}`,
            `MPPT ${mppt.id}`,
            project.inverter.sources,
            "json",
          );
      });
      return;
    }
    if (circuitFields.includes(field) && ctx.line)
      return add(
        ctx.line.circuit_input,
        field,
        `${ctx.path}.circuit_input.${field}`,
        ctx.scope,
        ctx.label,
        contextSources(ctx),
        "site",
      );
    if (cableFields.includes(field) && ctx.cable)
      return add(
        ctx.cable,
        field,
        `cables.${ctx.cableIndex}.${field}`,
        `${ctx.scope}/cable:${ctx.cableIndex}`,
        `${ctx.label} · ${ctx.cable.name}`,
        contextSources(ctx),
        "site",
      );
    if (field.startsWith("reference_") && ctx.cable) {
      const key = field.slice(10);
      return add(
        ctx.cable.ampacity_reference,
        key,
        `cables.${ctx.cableIndex}.ampacity_reference.${key}`,
        `${ctx.scope}/cable:${ctx.cableIndex}`,
        `${ctx.label} · ${ctx.cable.name}`,
        contextSources(ctx),
        "site",
      );
    }
    if (field === "drop_limit_pct" && ctx.line) {
      const key = ctx.dc ? "dc_drop_max_pct" : "ac_drop_max_pct";
      return add(
        project.policy,
        key,
        `policy.${key}`,
        "policy",
        "Policy",
        project.policy.sources,
        "json",
      );
    }
    if (["prospective_short_circuit_ka", "breaker_icu_ka"].includes(field))
      return add(project, field, field, "project", "Project", [], "json");
    if (field === "cable_catalog")
      return add(
        project,
        "cables",
        "cables",
        "project",
        "Project",
        project.cables.flatMap((c) => c.sources),
        "site",
      );
    if (field === "earthing_system")
      return add(
        project.spd_context,
        field,
        `spd_context.${field}`,
        "installation",
        "Installation",
        project.spd_context?.requirement_sources ?? [],
        "json",
      );
    // Unknown/scope keys are engineering review items, not invented editable fields.
    add(
      undefined,
      field,
      field,
      ctx.scope,
      ctx.label,
      allSources.filter((s) => check.source_ids.includes(s.id)),
      "json",
      true,
    );
  }
  function contextSources(ctx: Context): Source[] {
    const evidence = ctx.line?.circuit_input.derating_evidence;
    return uniqueSources([
      ...(ctx.cable?.sources ?? []),
      ...(ctx.cable?.ampacity_reference?.sources ?? []),
      ...(evidence
        ? [
            ...evidence.temperature.sources,
            ...evidence.grouping.sources,
            ...evidence.installation.sources,
          ]
        : []),
    ]);
  }
  function consume(check: EngineeringCheck, ctx: Context) {
    for (const field of new Set(check.missing)) record(field, check, ctx);
  }
  for (const check of result.checks) {
    if (!check.missing.length) continue;
    let ctx: Context = { scope: "project", label: "Project" };
    const rows = result.strings
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => check.id.startsWith(row.id + ":"));
    const mppts = project.inverter.mppts
      .map((mppt, index) => ({ mppt, index }))
      .filter(({ mppt }) =>
        Array.from(
          { length: project.inverter_quantity },
          (_, i) => `INV${i + 1}:${mppt.id}:`,
        ).some((prefix) => check.id.startsWith(prefix)),
      );
    if (rows.length === 1 && !mppts.length) {
      const { row, index } = rows[0]!;
      ctx = {
        scope: `dc:${index}`,
        label: `DC ${row.id} [${index + 1}]`,
        path: `result.dc_lines.${index}`,
        line: result.dc_lines[index],
        dc: true,
        mpptIndex: project.inverter.mppts.findIndex(
          (m) => m.id === row.mppt_id,
        ),
      };
    } else if (mppts.length === 1 && !rows.length)
      ctx = { ...ctx, mpptIndex: mppts[0]!.index };
    consume(check, ctx);
  }
  for (const [dc, lines] of [
    [true, result.dc_lines],
    [false, result.ac_lines],
  ] as const) {
    lines.forEach((line, index) => {
      const ctx: Context = {
        scope: `${dc ? "dc" : "ac"}:${index}`,
        label: dc
          ? `DC ${(line as ProjectResult["dc_lines"][number]).string_id} [${index + 1}]`
          : `AC INV${(line as ProjectResult["ac_lines"][number]).inverter}`,
        path: `result.${dc ? "dc_lines" : "ac_lines"}.${index}`,
        line,
        dc,
      };
      // Selection checks may have no missing array; inspect every unresolved candidate too.
      for (const check of line.cable.checks) consume(check, ctx);
      for (const candidate of line.cable.candidates) {
        const cableIndex = cableIndices.get(candidate.cable.id);
        for (const check of candidate.checks)
          consume(check, { ...ctx, cable: candidate.cable, cableIndex });
      }
    });
  }
  return [...groups.values()];
}
