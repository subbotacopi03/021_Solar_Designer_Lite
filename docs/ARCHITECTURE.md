# Архітектура

`schema → core → CLI / Designer Lite` — одна схема та один розрахунок для обох інтерфейсів. Core не читає файли, не викликає мережу й не працює з БД. CLI читає project JSON; браузер редагує його та зберігає локально. `calculateProject` завжди перевіряє project schema, після цього виконує deterministic calculations.

| Рівень | Контракт |
|---|---|
| Schema | Strict Zod input; unknown properties rejected; positive finite electrical values; unique IDs |
| Core | Pure functions; status, missing, basis, source_ids; no costs/finance |
| Data | Separate synthetic teaching data and source-limited exact-SKU records; metadata remains in saved project/report |
| CLI | validate / calculate / report; stable exit codes |
| UI | Local state + runtime validation; save/load of input only; results recalculated |
| QA | Golden numeric cases, SPEC regressions, workflow tests, formula hash barrier |

Package manifests are private/source exports in this starter. `pnpm build` emits Node code and declarations under `build/packages`, and static UI under `apps/designer-lite/dist`. Before npm publishing, produce independently bundled package dist, select license, set public exports, add release/versioning and verify package tarballs. These steps are intentionally not represented as completed.

Project version is 0.1.0. Future schema migration must be explicit; unknown schema versions are rejected. No trust in imported results. All consumer apps use validated inputs and the same result aggregation.

Доменні contracts реалізовано окремими pure modules: strings.ts (bounded allocation), cables.ts (source-bound applicability), protection.ts (reverse/current/nominal devices), spd.ts (необхідні nominal/context checks). Full protection/SPD coordination не виводиться з цих номінальних PASS; UNKNOWN збережено.
