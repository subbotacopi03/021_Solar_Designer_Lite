import type {
  Project,
  Mppt,
  StringConfiguration,
  EngineeringCheck,
} from "../../schema/src/index.js";
import { moduleVoltageAt, moduleVmpAt } from "./fundamentals.js";
import { check, finding } from "./checks.js";
export function stringLengthRange(p: Project, mppt: Mppt) {
  const m = p.module,
    s = p.site,
    missing: string[] = [];
  for (const [key, v] of Object.entries({
    t_min_cell_c: s.t_min_cell_c,
    t_max_cell_c: s.t_max_cell_c,
    beta_voc_pct_c: m.beta_voc_pct_c,
    beta_vmp_pct_c: m.beta_vmp_pct_c,
    max_system_voltage_v: m.max_system_voltage_v,
  }))
    if (v == null) missing.push(key);
  const voc =
    m.beta_voc_pct_c == null || s.t_min_cell_c == null
      ? null
      : moduleVoltageAt(m.voc_v, m.beta_voc_pct_c, s.t_min_cell_c);
  const hot =
    s.t_max_cell_c == null ? null : moduleVmpAt(m, s.t_max_cell_c).value;
  const cold =
    s.t_min_cell_c == null ? null : moduleVmpAt(m, s.t_min_cell_c).value;
  return {
    min: hot == null ? null : Math.max(1, Math.ceil(mppt.min_voltage_v / hot)),
    max:
      voc == null || cold == null || m.max_system_voltage_v == null
        ? null
        : Math.min(
            Math.floor(
              Math.min(p.inverter.max_dc_voltage_v, m.max_system_voltage_v) /
                voc,
            ),
            Math.floor(mppt.max_voltage_v / cold),
          ),
    voc_cold_v: voc,
    vmp_hot_v: hot,
    vmp_cold_v: cold,
    missing,
  };
}
export function parallelCapacity(p: Project, mppt: Mppt) {
  const missing: string[] = [];
  for (const [k, v] of Object.entries({
    max_strings: mppt.max_strings,
    max_current_a: mppt.max_current_a,
    max_isc_a: mppt.max_isc_a,
    isc_factor: p.policy.isc_factor,
    inputs: mppt.inputs,
    max_current_per_input_a: mppt.max_current_per_input_a,
    max_isc_per_input_a: mppt.max_isc_per_input_a,
  }))
    if (v == null) missing.push(k);
  if (missing.length) return { count: null, missing };
  const perInputOk =
    p.module.imp_a <= mppt.max_current_per_input_a! &&
    p.module.isc_a * p.policy.isc_factor! <= mppt.max_isc_per_input_a!;
  return {
    count: perInputOk
      ? Math.max(
          0,
          Math.min(
            mppt.max_strings!,
            mppt.inputs!,
            Math.floor(mppt.max_current_a! / p.module.imp_a),
            Math.floor(
              mppt.max_isc_a! / (p.module.isc_a * p.policy.isc_factor!),
            ),
          ),
        )
      : 0,
    missing,
  };
}
/** Bounded recovery, not a global optimizer. All state stays in this pure call. */
function recoverAllocation(
  p: Project,
  slots: {
    inverter: number;
    mppt: Mppt;
    range: ReturnType<typeof stringLengthRange>;
    capacity: ReturnType<typeof parallelCapacity>;
  }[],
  incumbent: StringConfiguration[],
) {
  const requested = p.planes.reduce(
    (sum, plane) => sum + plane.module_count,
    0,
  );
  if (slots.length > 24 || p.planes.length > 8 || requested > 2000)
    return { strings: incumbent, limited: true, visited: 0 };
  let best = incumbent.map((row) => ({ ...row }));
  let bestCount = best.reduce((sum, row) => sum + row.modules, 0);
  const remaining = p.planes.map((plane) => plane.module_count);
  const quotas = Array.from({ length: p.inverter_quantity }, () =>
    p.inverter.max_dc_power_w == null
      ? requested
      : Math.floor(p.inverter.max_dc_power_w / p.module.pmax_w),
  );
  const memo = new Map<string, number>();
  const rows: StringConfiguration[] = [];
  let visited = 0,
    limited = false;
  function visit(index: number, count: number) {
    if (bestCount === requested || limited) return;
    if (visited >= 30000) {
      limited = true;
      return;
    }
    visited++;
    if (
      count > bestCount ||
      (count === bestCount && rows.length < best.length)
    ) {
      best = rows.map((row) => ({ ...row }));
      bestCount = count;
    }
    if (index === slots.length || bestCount === requested) return;
    const upper = slots
      .slice(index)
      .reduce(
        (sum, slot) =>
          sum + Math.max(0, slot.range.max!) * slot.capacity.count!,
        0,
      );
    if (
      count +
        Math.min(
          upper,
          remaining.reduce((a, b) => a + b, 0),
          quotas.reduce((a, b) => a + b, 0),
        ) <
      bestCount
    )
      return;
    const key = `${index}|${remaining.join(",")}|${quotas.join(",")}`;
    const previous = memo.get(key);
    if (previous !== undefined && previous <= rows.length) return;
    memo.set(key, rows.length);
    const slot = slots[index]!,
      lo = slot.range.min!,
      hi = slot.range.max!;
    const choices = new Map<
      string,
      { plane: number; n: number; k: number; take: number }
    >();
    for (let plane = 0; plane < remaining.length; plane++) {
      const available = Math.min(remaining[plane]!, quotas[slot.inverter - 1]!);
      const cap = Math.min(slot.capacity.count!, Math.floor(available / lo));
      for (let k = 1; k <= cap; k++)
        for (let n = Math.min(hi, Math.floor(available / k)); n >= lo; n--) {
          const take = k * n,
            key = `${plane}:${take}`;
          // Same slot/plane/take with more strings is dominated for all later constraints.
          if (!choices.has(key)) choices.set(key, { plane, n, k, take });
        }
    }
    const options = [...choices.values()].sort(
      (a, b) => b.take - a.take || a.k - b.k || a.plane - b.plane || b.n - a.n,
    );
    for (const option of options) {
      const size = rows.length;
      for (let k = 1; k <= option.k; k++)
        rows.push({
          id: `INV${slot.inverter}-${slot.mppt.id}-S${k}`,
          inverter: slot.inverter,
          mppt_id: slot.mppt.id,
          plane_id: p.planes[option.plane]!.id,
          modules: option.n,
        });
      remaining[option.plane]! -= option.take;
      quotas[slot.inverter - 1]! -= option.take;
      visit(index + 1, count + option.take);
      remaining[option.plane]! += option.take;
      quotas[slot.inverter - 1]! += option.take;
      rows.length = size;
      if (bestCount === requested || limited) break;
    }
    visit(index + 1, count); // An unused tracker is a real search alternative.
  }
  visit(0, 0);
  return { strings: best, limited, visited };
}
/** Greedy deterministic whole-MPPT allocation. Same plane and same length on parallel strings; no Y connectors. */
export function generateStringPlan(p: Project): {
  strings: StringConfiguration[];
  checks: EngineeringCheck[];
  unassigned: number;
} {
  const checks: EngineeringCheck[] = [];
  const strings: StringConfiguration[] = [];
  const requested = p.planes.reduce((a, x) => a + x.module_count, 0);
  if (p.inverter.requires_optimizer)
    return {
      strings,
      checks: [
        finding(
          "OPTIMIZER_TOPOLOGY",
          "UNKNOWN",
          "Optimizer-specific topology is not implemented in v0.1",
          ["optimizer_rules"],
        ),
      ],
      unassigned: requested,
    };
  const slots = [];
  for (let i = 1; i <= p.inverter_quantity; i++)
    for (const mppt of p.inverter.mppts) {
      const range = stringLengthRange(p, mppt),
        capacity = parallelCapacity(p, mppt);
      slots.push({ inverter: i, mppt, range, capacity, used: false });
    }
  if (
    slots.some(
      (s) =>
        s.range.min === null ||
        s.range.max === null ||
        s.capacity.count === null,
    )
  )
    return {
      strings,
      checks: [
        finding(
          "STRING_DATA",
          "UNKNOWN",
          "No implicit equipment or temperature defaults",
          [
            ...new Set(
              slots.flatMap((s) => [...s.range.missing, ...s.capacity.missing]),
            ),
          ],
        ),
      ],
      unassigned: requested,
    };
  let unassigned = 0;
  for (const plane of p.planes) {
    let remaining = plane.module_count;
    while (remaining > 0) {
      let best: {
        slot: (typeof slots)[number];
        n: number;
        k: number;
        take: number;
      } | null = null;
      for (const slot of slots) {
        if (slot.used) continue;
        const lo = slot.range.min!,
          hi = slot.range.max!,
          cap = slot.capacity.count!;
        if (lo > hi) continue;
        const allocated = strings
          .filter((s) => s.inverter === slot.inverter)
          .reduce((a, s) => a + s.modules, 0);
        const available =
          p.inverter.max_dc_power_w == null
            ? remaining
            : Math.max(
                0,
                Math.floor(p.inverter.max_dc_power_w / p.module.pmax_w) -
                  allocated,
              );
        for (let k = 1; k <= cap; k++) {
          const n = Math.min(
            hi,
            Math.floor(Math.min(remaining, available) / k),
          );
          if (n < lo) continue;
          const take = n * k;
          if (!best || take > best.take || (take === best.take && k < best.k))
            best = { slot, n, k, take };
        }
      }
      if (!best) {
        // Recover a too-small remainder by shortening a previously allocated equal-length group.
        let recovered = false;
        for (const free of slots.filter(
          (s) =>
            !s.used &&
            s.range.min !== null &&
            s.range.min! <= s.range.max! &&
            s.capacity.count! > 0,
        )) {
          const usedOnFreeInv = strings
            .filter((s) => s.inverter === free.inverter)
            .reduce((a, s) => a + s.modules, 0);
          const quota =
            p.inverter.max_dc_power_w == null
              ? Infinity
              : Math.floor(p.inverter.max_dc_power_w / p.module.pmax_w) -
                usedOnFreeInv;
          const need = free.range.min! - remaining;
          if (need <= 0) continue;
          for (const old of slots.filter((s) => s.used)) {
            const group = strings.filter(
              (s) =>
                s.plane_id === plane.id &&
                s.inverter === old.inverter &&
                s.mppt_id === old.mppt.id,
            );
            if (!group.length) continue;
            const reduction = Math.ceil(need / group.length);
            const n = group[0]!.modules - reduction;
            if (
              n < old.range.min! ||
              remaining + reduction * group.length > free.range.max! ||
              remaining + reduction * group.length >
                quota +
                  (old.inverter === free.inverter
                    ? reduction * group.length
                    : 0)
            )
              continue;
            for (const row of group) row.modules = n;
            remaining += reduction * group.length;
            recovered = true;
            break;
          }
          if (recovered) break;
        }
        if (recovered) continue;
        break;
      }
      best.slot.used = true;
      for (let k = 1; k <= best.k; k++)
        strings.push({
          id: `INV${best.slot.inverter}-${best.slot.mppt.id}-S${k}`,
          inverter: best.slot.inverter,
          mppt_id: best.slot.mppt.id,
          plane_id: plane.id,
          modules: best.n,
        });
      remaining -= best.take;
    }
    unassigned += remaining;
  }
  // Balance lengths on equivalent occupied MPPT groups, preserving inverter and plane totals.
  for (let inv = 1; inv <= p.inverter_quantity; inv++)
    for (const plane of p.planes) {
      const groups = p.inverter.mppts
        .map((mppt) => ({
          mppt,
          rows: strings.filter(
            (s) =>
              s.inverter === inv &&
              s.plane_id === plane.id &&
              s.mppt_id === mppt.id,
          ),
        }))
        .filter((g) => g.rows.length);
      if (
        !groups.length ||
        new Set(groups.map((g) => g.rows.length)).size !== 1
      )
        continue;
      const k = groups[0]!.rows.length,
        total = groups
          .flatMap((g) => g.rows)
          .reduce((a, s) => a + s.modules, 0),
        base = Math.floor(total / (k * groups.length)),
        extra = (total - base * k * groups.length) / k;
      if (
        !Number.isInteger(extra) ||
        groups.some((g, index) => {
          const range = stringLengthRange(p, g.mppt);
          const n = base + (index < extra ? 1 : 0);
          return n < range.min! || n > range.max!;
        })
      )
        continue;
      groups.forEach((g, index) =>
        g.rows.forEach((row) => (row.modules = base + (index < extra ? 1 : 0))),
      );
    }
  if (unassigned > 0) {
    const recovery = recoverAllocation(p, slots, strings);
    strings.splice(0, strings.length, ...recovery.strings);
    unassigned = requested - strings.reduce((sum, row) => sum + row.modules, 0);
    checks.push(
      finding(
        recovery.limited ? "ALLOCATION_SEARCH_LIMIT" : "ALLOCATION_SEARCH",
        recovery.limited ? "WARN" : "PASS",
        `Bounded recovery visited ${recovery.visited} nodes. Maximize assigned modules, then fewer strings among examined plans. Remaining modules do not prove infeasibility; no global optimality claim.`,
      ),
    );
  }
  checks.push(
    check(
      "MODULE_ALLOCATION",
      unassigned,
      0,
      "modules",
      "Deterministic heuristic with bounded recovery; a failed allocation is not proof that no other configuration exists",
    ),
  );
  return { strings, checks, unassigned };
}
export function validateStringPlan(
  p: Project,
  strings: StringConfiguration[],
): EngineeringCheck[] {
  const out: EngineeringCheck[] = [];
  const ids = new Set<string>();
  for (const row of strings) {
    if (ids.has(row.id))
      out.push(finding("DUPLICATE_STRING_ID", "FAIL", row.id));
    ids.add(row.id);
    if (
      row.inverter < 1 ||
      row.inverter > p.inverter_quantity ||
      !p.inverter.mppts.some((m) => m.id === row.mppt_id) ||
      !p.planes.some((x) => x.id === row.plane_id)
    )
      out.push(finding("STRING_REFERENCE", "FAIL", row.id));
  }
  for (const plane of p.planes)
    out.push(
      check(
        `COUNT:${plane.id}`,
        strings
          .filter((s) => s.plane_id === plane.id)
          .reduce((a, s) => a + s.modules, 0),
        plane.module_count,
        "modules",
        "Requested plane count",
        [],
        "max",
      ),
    );
  for (let i = 1; i <= p.inverter_quantity; i++) {
    const dc = strings
      .filter((s) => s.inverter === i)
      .reduce((a, s) => a + s.modules * p.module.pmax_w, 0);
    out.push(
      check(
        `INV${i}:DC_POWER`,
        dc,
        p.inverter.max_dc_power_w,
        "W",
        "Manufacturer max DC power",
        ["max_dc_power_w"],
      ),
    );
    for (const mppt of p.inverter.mppts) {
      const group = strings.filter(
        (s) => s.inverter === i && s.mppt_id === mppt.id,
      );
      if (!group.length) continue;
      const prefix = `INV${i}:${mppt.id}:`,
        range = stringLengthRange(p, mppt),
        k = group.length;
      if (
        new Set(group.map((s) => s.plane_id)).size > 1 ||
        new Set(group.map((s) => s.modules)).size > 1
      )
        out.push(
          finding(
            prefix + "PARALLEL_MISMATCH",
            "FAIL",
            "Parallel strings must have equal lengths and share a plane",
          ),
        );
      for (const row of group) {
        out.push(
          check(
            row.id + ":VOC_DC",
            range.voc_cold_v == null ? null : row.modules * range.voc_cold_v,
            p.inverter.max_dc_voltage_v,
            "V",
            "Voc(Tmin) × N",
            ["beta_voc_pct_c", "t_min_cell_c"],
          ),
        );
        out.push(
          check(
            row.id + ":VOC_MODULE",
            range.voc_cold_v == null ? null : row.modules * range.voc_cold_v,
            p.module.max_system_voltage_v,
            "V",
            "Module system voltage",
            ["beta_voc_pct_c", "t_min_cell_c", "max_system_voltage_v"],
          ),
        );
        out.push(
          check(
            row.id + ":VMP_MIN",
            range.vmp_hot_v == null ? null : row.modules * range.vmp_hot_v,
            mppt.min_voltage_v,
            "V",
            "Vmp(Tmax cell) × N",
            ["beta_vmp_pct_c", "t_max_cell_c"],
            "min",
          ),
        );
        out.push(
          check(
            row.id + ":VMP_MAX",
            range.vmp_cold_v == null ? null : row.modules * range.vmp_cold_v,
            mppt.max_voltage_v,
            "V",
            "Vmp(Tmin cell) × N",
            ["beta_vmp_pct_c", "t_min_cell_c"],
          ),
        );
      }
      out.push(
        check(
          prefix + "IMP",
          k * p.module.imp_a,
          mppt.max_current_a,
          "A",
          "Imp × parallel strings",
          ["max_current_a"],
        ),
      );
      out.push(
        check(
          prefix + "ISC",
          p.policy.isc_factor == null
            ? null
            : k * p.module.isc_a * p.policy.isc_factor,
          mppt.max_isc_a,
          "A",
          "Isc × explicit policy factor × parallel strings",
          ["isc_factor", "max_isc_a"],
        ),
      );
      out.push(
        check(
          prefix + "INPUTS",
          k,
          mppt.inputs,
          "strings",
          "One string per physical input; Y connectors unsupported",
          ["inputs"],
        ),
      );
      out.push(
        check(
          prefix + "STRINGS",
          k,
          mppt.max_strings,
          "strings",
          "Manufacturer string limit",
          ["max_strings"],
        ),
      );
      out.push(
        check(
          prefix + "INPUT_IMP",
          p.module.imp_a,
          mppt.max_current_per_input_a,
          "A",
          "Imp per input",
          ["max_current_per_input_a"],
        ),
      );
      out.push(
        check(
          prefix + "INPUT_ISC",
          p.policy.isc_factor == null
            ? null
            : p.module.isc_a * p.policy.isc_factor,
          mppt.max_isc_per_input_a,
          "A",
          "Isc factor per input",
          ["isc_factor", "max_isc_per_input_a"],
        ),
      );
    }
  }
  for (const c of out)
    c.source_ids = [
      ...new Set(
        [...p.module.sources, ...p.inverter.sources, ...p.policy.sources].map(
          (s) => s.id,
        ),
      ),
    ];
  return out;
}
