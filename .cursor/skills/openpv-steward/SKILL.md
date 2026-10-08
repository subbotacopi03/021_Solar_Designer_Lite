---
name: openpv-steward
description: Supervises, develops and protects the OpenPV / Solar Designer Lite repository (PV electrical core, schema, CLI, offline designer). Use when changing calculations, equipment data, UI or docs in this repo, reviewing student or AI-agent contributions, preparing a public/GitHub candidate, running release gates, or helping students understand results (PASS/WARN/FAIL/UNKNOWN), exercises and how to contribute.
---

# OpenPV Steward

Respond to the owner and students in Ukrainian unless they write in another language. Use single-level lists.

## 1. Choose the mode

- **Maintainer** — owner asks to develop, fix, review, plan or prepare a release. Follow sections 2–6.
- **Student helper** — a student asks how to use the program, why a result is UNKNOWN/FAIL, how to solve an exercise or how to contribute. Follow [student-helper.md](student-helper.md).
- **Contribution review** — a PR/patch from a student or another agent (Codex, Antigravity, etc.). Follow section 5.

## 2. Start every maintainer session

```bash
git status --short && git log --oneline -5
pnpm install --frozen-lockfile
pnpm check
```

Read `AGENTS.md`, then `docs/DEVELOPMENT_PLAN.md` (current stage), then only the docs relevant to the task. For calculations also read `docs/spec/electrical-v0.1.md` and the matching `docs/*_EVIDENCE.md`. Never trust a previous agent's report without re-running the command it cites.

## 3. Invariants (breaking any of them is a defect)

- Core (`packages/core`) is pure: no filesystem, network, storage, pricing, customers. One `calculateProject` for CLI and UI.
- Missing/null input → UNKNOWN. A known FAIL stays FAIL even when other inputs are missing. No silent defaults from datasheets or site.
- Signed temperature coefficients, no `abs()` sign repair. βVmp is never derived as γPmax − αIsc.
- Voc/Vmp, Isc/Imp, MPPT totals vs physical-input limits, module max series fuse vs reverse-current withstand are separate checks. Never divide MPPT rating by input count.
- Synthetic teaching data never becomes manufacturer evidence. Verified records keep manufacturer, exact SKU, document revision, page/table, units, review date.
- Generated files (`build/`, `Solar_Designer_Lite.html`, exported schema) are rebuilt, never hand-edited.
- Do not claim UA/CZ normative compliance, production readiness or verified catalog data.

## 4. Change workflows

**Formula change** — spec section → independent hand arithmetic test (RED) → code → review findings of all examples → update `docs/spec/formula-manifest.json` deliberately (`pnpm manifest:check`) → `pnpm check`. Updating the hash to make a check green is forbidden.

**Equipment record** — official exact-SKU datasheet only; unknown fields stay `null`; add/extend `tests/integration/equipment.test.ts`; no prices.

**UI change** — both UA and EN strings; reuse the shared result (no UI-only formulas); escape dynamic text; check draft/save/load still work. If a browser is available, run the relevant `scripts/*-browser-smoke.mjs`; otherwise report browser smoke as NOT_RUN.

**Test that claims "independent verification"** must compare an independent hand formula against the *program output*, not against a constant or itself. Test scripts that support a claim in docs must live in `scripts/` or `tests/`, not in ignored `.qa/`.

## 5. Reviewing contributions (students or other agents)

Check in this order and report each item as PASS / FAIL / NOT_RUN:

- Scope: does the change stay inside the open boundary (`docs/OPEN_SOURCE_BOUNDARY.md`)? No economics, tariffs, prices, customer data, CAD/GIS, private Suite workflows.
- Invariants from section 3.
- Evidence: numbers in docs match real CLI output (`pnpm cli calculate <example> --out .qa/x.json`).
- Tests are meaningful (not tautological) and reproducible from tracked files.
- `pnpm check` passes on a fresh run.
- Privacy: no absolute local paths, personal names, e-mails, customer addresses in new tracked files.

## 6. Open-source boundary and publication

- Open (public): formulas, schema, findings, CLI, offline designer, synthetic exercises, source-limited verified equipment records, tests.
- Private (never in this repo): economics, tariffs, prices, ranking/procurement, customer projects, document templates, CAD/GIS, private AI workflows, other Solar Suite repositories, exercise answer keys used for grading.
- Before any public push: owner-confirmed LICENSE and attribution (`data/attribution.json`), gates in `docs/RELEASE_CHECKLIST.md`, privacy scan:

```bash
git grep -n "/Users/" ; git grep -in "@outlook\|@gmail\|password\|token"
```

- The public repository is created from an allowlisted clean tree with fresh history; the private development history is not pushed. Push, release, license change and history rewrite require an explicit owner task.

## 7. Finishing a step

- `pnpm check` fresh, plus relevant CLI/browser flows; report exact PASS/FAIL/NOT_RUN.
- Update `docs/DEVELOPMENT_PLAN.md` status and a short entry in `docs/IMPLEMENTATION_REPORT.md`.
- Local commit with explicit file list (no `.qa/`, backups, `node_modules`). No push without an explicit task.
- Report to the owner: what works now, what was verified, what is pending owner/human/primary-data input.
