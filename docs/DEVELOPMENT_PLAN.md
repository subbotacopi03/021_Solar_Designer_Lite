# Актуальний план розвитку OpenPV / Solar Designer Lite

Оновлено 2026-10-08 для передачі Antigravity. Цей план замінює старі «наступні кроки». Хронологічний попередній план збережено в `history/DEVELOPMENT_PLAN_before_antigravity_20261008.md`, а не видалено. Детальна інструкція виконавцю — [ANTIGRAVITY_HANDOFF.md](ANTIGRAVITY_HANDOFF.md).

## Мета й межа готовності

Довести наявну автономну програму до корисної **попередньої електричної перевірки** для форумних користувачів: реальний ручний string-проєкт, зрозумілі результати й прогалини, збереження роботи, переносний JSON і звіт. Не переписувати starter й не розширювати задачу до повного CAD/сертифікованої інженерної системи.

Три різні критерії: локальний робочий сценарій уже є; bounded public alpha потребує пілоту й оформлення публічного комплекту; підтверджений підбір реальної установки потребує відсутніх первинних engineering inputs. Software PASS не закриває engineering UNKNOWN. Загальний відсоток і строк останнього критерію зараз не визначені.

## Фактичний стан

| Статус | Результат | Файл / доказ |
|---|---|---|
| IMPLEMENTED | Schema → pure core → CLI/UI/report, SPEC-01…10 | `packages/schema/src/index.ts`, `packages/core/src/index.ts`, `packages/cli/src/index.ts`; golden/differential tests |
| IMPLEMENTED | 2 exact-SKU PV + 2 string inverter records, sources/units/date, окремі synthetic | `data/equipment/verified/{modules,inverters}.json`, `tests/integration/equipment.test.ts` |
| IMPLEMENTED | Ручна форма стрінгів, UA/EN, Student Mode, JSON save/load, попередній snapshot | `manual-strings.ts`, `main.ts`, `project-safety-browser-smoke.mjs` |
| IMPLEMENTED | Захист чернеток/порядку async import, відхилення nonfinite results | `drafts.ts`, `numerical-safety.ts`, `adversarial-browser-smoke.mjs` |
| IMPLEMENTED | Per-feeder DC/AC траси/BOM й cable candidate inspector | `packages/core/src/routes.ts`, UI `routes.ts`, `cable-inspector.ts`; routes tests |
| IMPLEMENTED | UA/EN MISSING/PROVIDED/REVIEW без заповнення параметрів | `missing-data-model.ts`, `missing-data-fields.ts`, `missing-data.ts`; 8 unit/18 browser checks |
| IMPLEMENTED | Visible origin/About/report notices та local review pack | `data/attribution.json`, `about.ts`, `review-pack.mjs`; 6 unit/8 pack checks |
| PARTIAL | Генератор з bounded recovery, без доказу оптимальності | `packages/core/src/strings.ts`, `tests/differential/allocation.test.ts` |
| PARTIAL | Manufacturer cables, nominal protection/SPD/DC switch | `cables.ts`, `protection.ts`, `spd.ts`, `dc-switch.ts`; evidence docs, incomplete installation/coordination |
| BLOCKED | Public author identity/LICENSE та public distribution | `data/attribution.json` null; LICENSE UNLICENSED; рішення власника pending |
| NOT IMPLEMENTED | Пілот новачка/інженера та підтверджений cross-browser/OS acceptance | Chrome/macOS автоматизовано; інші середовища й human pilot NOT_RUN |
| BLOCKED | Повний engineering verdict за відсутніх первинних inputs | EQUIPMENT_CATALOG/CABLE_EVIDENCE/PROTECTION_EVIDENCE/SPD_EVIDENCE/DC_SWITCH_EVIDENCE |

Остання перевірена code revision: `fafd5ec`; попередні `5a424fb` (missing data), `30754b1` (adversarial fixes), `aed581e` (manual/attribution). Documentation-only handoff commit іде після них. `pnpm check` PASS178 unit/17files,30CLI,10formula hashes, legal/typecheck/build/standalone/schema; UI matrix103 combined checks дев/file, окремо pack8checks. Це різні suites і повторення середовищ, не111 унікальних користувацьких сценаріїв. Lint NOT_RUN — script/config відсутній.

## P0 — прийняти проєкт і відтворити baseline

Відкрити всю source-папку, прочитати AGENTS/цей план/handoff/spec, перевірити pwd/Git/node/pnpm, `pnpm install --frozen-lockfile`, `pnpm check`. Не розпаковувати starter знову й не пересувати поточний код. Запустити UI та доступні browser suites. Результат — новий запис команд, середовища й PASS/FAIL/NOT_RUN, без підміни історичними logs. Acceptance: core працює, real24module JSON проходить schema, CLI calculate/report зберігають UNKNOWN/exit3, UI має24/24, save/load/report збігаються.

## P1 — користувацький пілот і виправлення підтверджених дефектів

Спочатку прогнати quick start як новачок без JSON editing: відкрити offline HTML, імпортувати real case, змінити й застосувати ручний план, прочитати FAIL/UNKNOWN/missing guidance, зберегти/відкрити JSON, завантажити звіт. Перевірити наявні браузери/ОС, мобільну ширину, клавіатуру, storage unavailable, draft/import/error/recovery. Додати журнал відтворення й human pilot checklist. Недоступні платформи та відсутність реальних людей позначати NOT_RUN; AI-тестер не є незалежним інженером/новачком.

Порядок fixes: втрата роботи/неправильний розрахунок → блокуючі import/apply/save → незрозумілий FAIL/UNKNOWN → responsive/keyboard/report. Кожний дефект: мінімальне відтворення, regression appropriate to risk, точковий fix, checks, UA/EN, документація, локальний commit. Не робити редизайн/перехід на React заради цього етапу.

Acceptance: записані ОС/browser/version/steps/results, немає відтворених блокуючих дефектів у підтриманих середовищах; новачок сам проходить guide й розрізняє UNKNOWN та дозвіл на монтаж; інженер окремо перевіряє висновки. Незалежну доступну роботу завершити, pending human acceptance зберегти чесно.

## P2 — підготувати public alpha, зберігаючи контроль власника

Локальний INTERNAL OWNER REVIEW ONLY pack уже готовий: HTML,2examples,UA/EN guides,LICENSE/ATTRIBUTION/notices/metadata,manifest/checksums;12файлів. Не переписувати generator. Перевірити source-history/privacy allowlist, документацію меж, instructions та issue-report template; не видаляти історію, резерви або QA. Окремо погодити з власником публічне ім’я, author/source URLs і повний LICENSE. Не виводити ім’я з account/Git і не додавати telemetry.

Після явного рішення власника застосувати metadata/LICENSE, перевірити legal generation/About/footer/CLI+UI reports/standalone й підготувати конкретний public candidate. Не вважати internal pack автоматично public-ready й не знімати його marker просто редагуванням рядка. Перед public artifact потрібні завершені gates RELEASE_CHECKLIST і окреме дозволене завдання. Push/release/зміна ліцензії не дозволені поточним handoff.

Acceptance: право/авторство узгоджені, повні notices збережено, source/history review записаний, чиста інша машина перевірена, SHA/версія й scope задокументовані, жодних приватних materials у дистрибутиві. Неможливо технічно гарантувати незнімний кредит або сповіщення про кожне копіювання; не обіцяти цього.

## P3 — окремий manufacturer installation/coordination етап

Не блокує всю bounded alpha, але блокує підтвердження повної реальної установки. Для кожного нового поля спочатку знайти офіційне exact-SKU джерело, revision/page/table/units/date/applicability та обмеження. Прогалину без джерела лишити null/UNKNOWN. Далі spec → незалежний розрахунковий RED → implementation → review → deliberate manifest → check/CLI/UI/report.

Порядок: PV βVmp/reverse withstand і physical inverter inputs; cable α/reference temperature/installation/temperature/grouping; fault/backfeed/holder/curves/total-clearing coordination; SPD topology/earthing/separation/routing/upstream coordination; DC-switch mounting/thermal/terminal/fault/category applicability. Точні gaps наведено в handoff/evidence docs. Не обирати SPD лише за LPS, не прирівнювати fuse maximum до reverse withstand, не ділити MPPT totals на конектори. Нормативні UA/CZ висновки тільки після перевірки первинних застосовних текстів.

Acceptance кожного завершеного підетапу: field-level official evidence, перевірена застосовність, незалежні boundary/missing/known-FAIL tests, спільний CLI/UI report, save/load й explicit UNKNOWN для решти. Якщо source недоступний — записати BLOCKED і виконати незалежні задачі, не вигадувати defaults.

## Поза поточним планом

Parallel cables, optimizer topology, BESS, installers/PWA/npm publishing — окремі майбутні задачі з власними contracts, не привід зараз розширювати scope. Ціни/тарифи/економіка/клієнти/CAD/GIS/private Solar Suite workflows заборонено переносити сюди. Інші Solar repositories не змінювати.

## Завершення кожного етапу

Виконати repository checks і релевантні browser/CLI flows; оновити IMPLEMENTATION_REPORT/NEXT_AI_HANDOFF/цей план; зберегти невдалі run evidence в ignored `.qa`, sanitized summary у docs. Формат статусів PASS/FAIL/NOT_RUN; UNKNOWN описує engineering data, BLOCKED — залежність. Локальний змістовний commit лише project files, без push. Не витрачати ресурс на повторний аудит вже виконаних етапів або запуск десяти агентів заради кількості.
