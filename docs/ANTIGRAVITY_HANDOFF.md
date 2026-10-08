# Передача розробки Antigravity

Дата: 2026-10-08. Це інструкція продовження наявного OpenPV / Solar Designer Lite, а не завдання створити іншу програму. Власник просить економити токени, більше працювати з кодом, дійти до корисного простого користувацького кейсу й підготувати майбутнє відкрите поширення з видимим авторством. Зараз передається розробка; публікація та вибір ліцензії не дозволені автоматично.

## 1. Що передати й де працювати

Поточний PROJECT_ROOT: `/Users/subbota/_ПРОЕКТИ/021_Solar_Designer_Lite`. Відкрий **всю source-папку проєкту**, а не лише автономний HTML чи owner-review ZIP: у runtime ZIP немає TypeScript source/tests/цього handoff. Якщо проєкт перенесено на іншу машину, визнач абсолютний шлях відкритої папки через pwd і використовуй її як PROJECT_ROOT. Не працюй у батьківській папці та не змінюй інші Solar repositories.

Starter уже перевірено, зарезервовано й розгорнуто без зайвої вкладеності `openpv/`. Повторно не виконувати стартове переміщення/розпакування! Збережено `_previous_workspace_20261008_160124/OPENPV_STARTER_KIT_v0.1.0.zip`, inventory та `STARTER_INTEGRITY.json` (98 hashes/sizes). Backup і `.qa/` ignored; `.git` з історією лишився в корені. Інструкції старого backup не є правилами нового проєкту. Нічого не видаляти/перезаписувати заради «чистоти».

Репозиторій локальний, branch master на момент передачі. Перевір Git самостійно; не відкидай нові зміни власника. Останній code commit `fafd5ec` — internal review pack; `5a424fb` — missing-data guidance; `30754b1` — adversarial fixes; `aed581e` — manual workflow/attribution/recovery. Пізніший documentation commit передає цей план. Не використовуй старі назви logs як доказ стану поточного HEAD.

## 2. Що прочитати на старті

Послідовність: `AGENTS.md` → `README.md` → `docs/DEVELOPMENT_PLAN.md` → цей handoff → `docs/START_HERE_UA.md` → `docs/USER_READINESS.md` і `docs/QUICK_START_UA.md`. Для розрахункової роботи додатково `docs/spec/electrical-v0.1.md`, `docs/spec/formula-manifest.json`, `docs/ARCHITECTURE.md`, `docs/FEATURE_MATRIX.md`, `docs/SOURCE_PROVENANCE.md`, `docs/OPEN_SOURCE_BOUNDARY.md` та відповідний `*_EVIDENCE.md`.

`docs/NEXT_AI_HANDOFF.md` тепер коротка актуальна точка входу. `IMPLEMENTATION_REPORT.md` містить хронологію; останні розділи актуальні, попередні числа — історичні. Старі plan/handoff збережені в `docs/history/`; не виконувати їхні вже завершені «наступні кроки» повторно. Власник надав автономію на оборотні локальні зміни/перевірки/коміти. Не вимагай повторного підтвердження на них.

## 3. Стек і карта коду

Це TypeScript + Zod + Vite та звичайний DOM UI. React/Next/server DB немає; не вводь їх без необхідності. Package manager pnpm, lockfile зберегти. Node>=24, packageManager pnpm11.25.0; у цьому середовищі перевіряли Node24.19.0. Конкретні installed dependency versions визначай з frozen lockfile, не оновлюй пакети «до останніх» заради передачі.

| Де | Що робить / що берегти |
|---|---|
| `packages/schema/src/index.ts` | Strict input schemas, cross-field rules, optional/null inputs, source/applicability contracts |
| `packages/core/src/index.ts` | Shared calculateProject, aggregation, report generation; основна точка CLI/UI parity |
| `fundamentals.ts`, `strings.ts` | Electrical arithmetic, windows, manual/auto validation, bounded recovery |
| `cables.ts`, `routes.ts` | R(T)/drop/ampacity/candidates, effective per-line inputs, route/BOM quantities |
| `protection.ts`, `spd.ts`, `dc-switch.ts` | Окремі nominal/context modules; не повна installation/coordination |
| `numerical-safety.ts`, `markdown-text.ts`, software-credit module | Returned-result finite guard, safe report formatting, shared credit |
| `packages/cli/src/index.ts` | validate/calculate/report; filesystem IO лише тут, не в core |
| `apps/designer-lite/src/main.ts` | UI state, commit/render, save/load/autosave/recovery/import ordering, shared calculation |
| UI `manual-strings.ts`, `drafts.ts`, `input-errors.ts` | Native manual form, draft lifecycle, зрозумілі schema errors |
| UI `routes.ts`, `cable-inspector.ts` | Individual feeders, actual candidate checks/sources, no separate formulas |
| UI `missing-data-fields.ts`, `missing-data-model.ts`, `missing-data.ts` | UA/EN labels/model/render MISSING/PROVIDED/REVIEW, actual checks/sources |
| UI `about.ts`, `data/attribution.json`, `packages/core/src/software-credit.ts` | Visible origin, About/citation/CLI+UI report metadata |
| `data/equipment/verified/` | Source-limited exact-SKU modules/inverters/cables/fuses/SPDs/DC switches |
| `data/equipment/`, `data/examples/student-*` | Окремі synthetic teaching records, не manufacturer engineering evidence |
| `scripts/legal-notices.mjs`, `standalone.mjs` | Full third-party notices, self-contained HTML build |
| `scripts/review-pack.mjs`, `.d.mts`, `review-pack-smoke.mjs` | Strict allowlist owner-review ZIP/verifier, CRC/SHA/offline browser checks |
| `tests/golden`, `tests/differential`, `tests/integration` | Незалежна арифметика, SPEC/allocation/evidence/route regressions, workflow/report/pack tests |

Шляхи core modules у таблиці відносні до `packages/core/src/`, UI modules — до `apps/designer-lite/src/`. Generated `build/`, `Solar_Designer_Lite.html`, exported schema не редагувати вручну: змінити source і зібрати. Частина generated files tracked — перевір diff після build.

## 4. Уже робочий користувацький сценарій

Відкрити `Solar_Designer_Lite.html` через file:// без Node/мережі, Open/Відкрити JSON → `data/examples/trina435-manual24.json`. Це Trina TSM-435NEG9R.28 + SMA STP8.0-3AV-40, ручні стрінги12+12 на A/B,24/24модулів. Known cold Voc checks PASS; βVmp і per-connector ratings UNKNOWN; overall UNKNOWN є правильним поточним результатом. Manual plan дозволяє перевірити відомі обмеження, хоча auto generator не має потрібного βVmp. Не «виправляти» UNKNOWN підстановкою коефіцієнта.

Користувач може native-form edit/apply, вибирати equipment/planes/MPPT, переглядати checks/missing-data/source metadata/per-feeder candidates, працювати UA/EN і Student Mode, Save JSON, load/reload, export Markdown та browser print/PDF. Попередній застосований проєкт відновлюється після reset/import/exercise, включно після reload; це одна версія, не повна історія. Portable JSON — окремий backup. JSON-result/report не є input для restore.

Visible origin є у footer/About/reports, full Zod/Vite-helper notices embedded offline. `data/attribution.json` має null copyright_holder/author_url/source_url, бо власник не надав остаточні публічні дані. Не вигадуй їх з local username/Git. Citation disabled до достатніх metadata. Hidden usage tracking відсутній і не потрібний.

Local pack готовий:9allowlisted sourcefiles+3generated=12ZIPfiles (HTML,2examples,UA/ENguides,LICENSE,ATTRIBUTION,notices,metadata,REVIEW_ONLY,manifest,SHA256SUMS). `.qa/review-packs/` містить унікальні ZIP/sidecar/extracted copies. Не копіюються `.git`, backup, source recovery, QA, history чи customer data. Це **INTERNAL OWNER REVIEW ONLY**, LICENSE UNLICENSED, не готове public permission. Pack builder сам не заявляє, що тести проходять; окремий smoke це перевіряє.

## 5. Інваріанти, на яких легко зламати програму

- Core pure, без IO/network/storage/database/economics. Один calculateProject для CLI/UI, не створювати окремий UI розрахунок. SPEC-01…10 зберегти.
- Missing/null → UNKNOWN. Відомий FAIL має залишатися FAIL навіть за інших missing inputs. Числова неможливість представити результат — CalculationRangeError, не engineering UNKNOWN і не JSON null.
- Signed β, %/°C і температури комірки; не виправляти abs(). βVmp не виводити як γPmax−αIsc. Voc/Vmp та Isc/Imp — окремі перевірки.
- MPPT totals та physical-input limits різні. Не ділити tracker rating на input count. Один string на physical input, без неімплементованих Y/parallel shortcuts; площини не змішувати.
- Allocation objective: більше assigned modules, потім менше strings серед розглянутих, deterministic order. Recovery caps24slots/8planes/2000modules/30000nodes, explicit WARN at limit, valid incumbent. 29/29 і58/58 witnesses уже є. Не називати глобально оптимальним/complete і не міняти старі valid complete plans без причини.
- Routes — full replacements, не прихований partial merge. DC binding exact allocation snapshot; stale/ambiguous/orphan дає explicit findings/UNKNOWN та effective empty inputs, не старі значення. Одна AC лінія кожного інвертора, DC quantity2L/AC L; omitted/unresolved quantities явно показані.
- Cable R(Tconductor), cosφ/X та застосовність derating зберегти. Evidence snapshot прив’язаний до cable/reference/actual method/ambient/conductor/grouping. Parallel runs не ввімкнені. Synthetic α/Iz з тесту не переносити до real catalog.
- Module maximum series fuse не є maximum reverse-current withstand; inverter backfeed повний, не ділиться. Supplied fuse In перевіряється навіть коли necessity=false/null і впливає на cable checks. Ui/Ith switch не є Ue/Ie; DC-switch PER_STRING scope, інші scopes UNKNOWN.
- SPD не визначається лише LPS;8/20rating не замінює10/350. Nominal PASS не дає full coordination/national compliance.
- Form/JSON equipment edits downgrade sources до USER_INPUT і прибирають review date/hash. File import зберігає заявлені metadata; це не цифровий підпис чи гарантія достовірності JSON.
- Draft guards shared native/manual/full JSON. Save не може мовчки зберігати unapplied draft. Власний Apply не відкидає draft до успіху; competing-editor changes потребують guard. Invalid Apply/calculation зберігає попередній applied project і draft.
- Async File.text використовує import sequence+project revision: stale success/error не перезаписує нові зміни. Navigation сама по собі не скасовує valid import. Multi-tab conflict coordination відсутня — не заявляти її.
- Dynamic UI/report text escaped, active links HTTP(S) only. Same-ID different source records не зливати. Missing arrays core іноді містять provided co-dependencies: UI відрізняє MISSING від PROVIDED. Unknown keys не приховувати — fallback REVIEW. Renderer first100groups/100affected checks має explicit truncation, model/full result лишається повним.

## 6. Відтворення перевірок

Усі команди виконувати з PROJECT_ROOT. `pnpm check` вже містить legal:check, typecheck, unit/integration/differential tests, manifest check, build/standalone, schema export і30CLI smoke checks. Окремого lint script/config немає: **NOT_RUN**, не вигадувати PASS. Prettier — formatter, не заміна lint.

```bash
pwd
git status --short
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm check
pnpm dev
```

Поточний UI використовував localhost5173, але перевір фактичний порт нового процесу; не завершуй чужі процеси. Для browser scripts OPENPV_TEST_URL задає URL, default localhost5173. Окремі давні standalone browser scripts можуть мати інший контракт — прочитай перед запуском.

```bash
# Обери реальний доступний executable; цей шлях існував лише на поточному Mac.
export OPENPV_CHROMIUM_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
pnpm test:browser
pnpm test:manual:browser
pnpm test:safety:browser
pnpm test:attribution:browser
pnpm test:adversarial:browser
pnpm test:missing:browser
# Повтори targeted suites з OPENPV_TEST_URL=file:///абсолютний/шлях/Solar_Designer_Lite.html.
# Для змін equipment/routes/switch/inspector також відповідні scripts/*-browser-smoke.mjs.
pnpm review:pack
pnpm review:verify .qa/review-packs/ІМЯ_РОЗПАКОВАНОЇ_ПАПКИ
pnpm test:review-pack
```

Review pack generator потребує developer zip CLI, archive smoke ще unzip і Playwright browser. Enduser HTML цього не потребує. Відсутній browser/tool познач NOT_RUN з причиною, виконай незалежні checks. У попередній сесії Browser plugin був відсутній, тому використано repository Playwright/system Chrome; personal profile/browser storage не відкривали.

CLI real-case перевірка після build:

```bash
mkdir -p .qa
pnpm cli validate data/examples/trina435-manual24.json
pnpm cli calculate data/examples/trina435-manual24.json --out .qa/real-case-result.json
pnpm cli report data/examples/trina435-manual24.json --out .qa/real-case-report.md --lang uk
```

Створи `.qa/` перед output за потреби. Exit codes: validate0 означає valid schema; calculate/report0PASS/WARN,1FAIL,2input/JSON/range error,3UNKNOWN. Для real case exit3 очікуваний engineering status, не поломка shell/test. Не перезаписуй цінний existing --out заради probe. Use fresh browser contexts; offline smoke не означає іншу чисту машину.

## 7. Зафіксований baseline й межі доказів

| Перевірка | Останній підтверджений результат | Де шукати |
|---|---|---|
| pnpm check | PASS178tests/17files,30CLI,10formula hashes,legal/typecheck/build/schema | `.qa/review-pack/check-final-2.txt`, `docs/review-pack-results.json` |
| UI browser matrix | PASS103combined checks/11suite-target runs, Chrome/macOS dev/file | `docs/missing-data-browser-results.json`, ignored `.qa/missing-data/` |
| Archive+extracted offline | PASS8checks:CRC/SHA/allowlist/byte identity/start/realcase/JSON+report/noerrors-requests | `.qa/review-pack/browser-final-committed.txt`, `latest-smoke.json`, sanitized review-pack-results |
| 10 economical tester agents | 111baseline observations,3confirmed defect groups виправлено | ADVERSARIAL_TEST_REPORT/adversarial-test-results, `.qa/adversarial/` |
| Lint | NOT_RUN — немає script/config | package.json |
| Windows/Edge/Safari/Firefox, real touch/zoom/screenreader | NOT_RUN | USER_READINESS |
| Human novice/independent engineer, інша чиста машина | NOT_RUN | USER_READINESS/RELEASE_CHECKLIST |
| Full manufacturer/normative approval, public license/release | UNKNOWN/BLOCKED або NOT_RUN | evidence docs/LICENSE |

Не сумуй повторні checks як кількість незалежних user stories. Ten testers були доступними через Codex gpt-6-luna над локальним проєктом, не локально встановленими LLM. Журнали містять чесні RED/невдалі harness runs; не стирай їх і не називай кожен старий файл '*green*' успішним без читання. Після своїх змін отримай свіжі результати.

## 8. Що робити далі — конкретні завдання

**P0. Baseline.** Прочитати потрібні файли, перевірити current Git, frozen install/check, відкрити UI/offline й пройти real24case. Відтворений baseline — точка початку, не привід ще раз повністю аудіювати або переписувати програму. Якщо check FAIL, спочатку пояснити/відтворити причину; не регенерувати manifest для замітання diff.

**P1. Довести користувацький кейс.** Створити/вести `docs/PILOT_TEST_MATRIX.md` з середовищем, кроками, expected/actual, PASS/FAIL/NOT_RUN, reproduction artifacts. До появи реальних людей виконати доступну технічну частину і підготувати короткий чеклист для власника. Не зупиняти незалежну роботу через відсутність іншої ОС. Відтворені defects виправляти точково з meaningful regression, UI UA/EN, shared pipeline, save/load/report verification. Acceptance у DEVELOPMENT_PLAN.

| Сценарій пілоту | Що має бути підтверджено |
|---|---|
| Fresh offline start → import real case | Програма без Node/network,24/24, exact models, overall UNKNOWN |
| Manual edit/apply/save/reopen | Застосовані зміни збережені, unapplied/invalid draft не втрачений мовчки |
| Known voltage/input FAIL + missing βVmp | FAIL видимий, UNKNOWN не маскує порушення |
| Checks guidance/source/candidate inspector | Новачок розуміє, що відсутнє, provided не названо missing, джерело/одиниці доступні |
| Перемикання UA/EN/Student та навігація | Project JSON незмінний, drafts guard працює |
| Reload/reset/import/recovery/storage unavailable | Дані не губляться без пояснення, exported JSON переносний |
| Report/print/BOM | Actual equipment, per-feeder quantities, non-PASS й provenance збережені |
| Keyboard/narrow viewport/target browsers | Controls доступні, page не має некерованого horizontal overflow; локальні table scroll допустимі |
| Reviewer engineer | Звірив arithmetic/assumptions/limits, не підмінив manufacturer evidence green software tests |

**P2. Public preparation, без публікації.** Документувати source/history/privacy review і support/issue-report instructions. Реалізований owner-review generator зберегти. Зібрати від власника лише справді необхідні identity/URL/LICENSE рішення (питання вже ставилося; не вигадувати відповідь). До explicit рішення LICENSE/metadata не змінювати. Видиме авторство й вимоги LICENSE можуть оформлятися після вибору власника; технічно незнімне маркування/сповіщення про кожне reuse не гарантується, telemetry не додавати. Публічний push/release/history rewrite — окремий дозвіл після конкретного reviewable candidate. Internal ZIP не передавати як public-ready download.

**P3. Manufacturer installation/coordination.** Працювати підетапами за первинними джерелами, коли є доступні дані. Не потрібно для кожної задачі повторювати весь original source recovery. Для нових ratings зберігати manufacturer/exact SKU/document revision/page/table/unit/review date/applicability/unknown explanation. Зміни формул тільки spec → independent RED arithmetic → implementation → findings review → deliberate manifest. Непідтверджене лишати UNKNOWN й продовжувати незалежні задачі.

| Прогалина | Поточний вплив | Що приймається як наступний результат |
|---|---|---|
| Trina βVmp | Hot Vmp/window/автоплан не можуть бути підтверджені | Exact-SKU official temperature evidence; не γ−α/generic inference |
| Trina reverse withstand | Повний reverse-current/protection verdict UNKNOWN | Окреме manufacturer rating/умови, не max series fuse20A |
| SMA per-connector Imp/Isc limits | Physical-input checks UNKNOWN | Офіційні per-input ratings/applicability, не A/B totals÷count |
| Nexans α/X/reference conductor T/installation derating | R(T)/drop/positive cable selection incomplete | Manufacturer data+reference profile+applicable method/ambient/grouping factors; X лише якщо потрібний моделі/умовам |
| Fuse/holder/fault/backfeed/curves | Nominal checks не доводять coordination | Exact device/holder curves, total-clearing I²t, fault magnitude/time, cable withstand/backfeed model |
| SPD topology | Nominal candidate не підтверджує installation | Earthing/separation/routing/leads/coordinated stages/upstream protection+primary applicable requirements |
| ABB switch installation | Ue/Ie nominal profile не full suitability | Exact mounting/thermal/terminal/fault/reverse/category/wiring evidence, зберегти scope |
| UA/CZ requirements | National compliance не підтверджена | Перевірені первинні тексти/редакції/застосовність; недоступне не підмінювати blog/tutorial |

Parallel cables/optimizers/BESS/CAD/GIS/economics не є shortcuts для закриття цих gaps. Не впроваджувати їх у межах P1/P2. За відсутніх джерел сформувати точний data-request, не «типові значення».

## 9. Робочий режим і завершення

Працюй економно: на старті короткий baseline, далі один завершений scope за раз. Використовуй прості/дешевші моделі для ізольованих UI/docs tasks лише коли це допомагає; критична electrical reasoning та інтеграція потребують належної перевірки. Не запускай10агентів повторно заради числа. Не створюй нових чатів/повідомлень назовні без дозволу. Пиши власнику українською стисло, без повторних permission на оборотні локальні зміни.

Для коду: відтворити проблему, перевірити root cause, додати потрібний regression, точковий fix. Після етапу pnpm check + релевантні CLI/browser flows, exact PASS/FAIL/NOT_RUN і обмеження; оновити IMPLEMENTATION_REPORT/NEXT_AI_HANDOFF/DEVELOPMENT_PLAN, local meaningful commit explicit files. QA/backup/node_modules не комітити. Не видаляти старі failed evidence. Formula manifest update не є способом «зробити green».

Без нових primary data/human input не обіцяй дату повної інженерної готовності або довільний процент. Окремо звітуй: що локально працює, що перевірено технічно, що pending human/owner/primary evidence. Завдання закінчується конкретним реалізованим/перевіреним результатом або точним blocker, а не лише обіцянкою наступного кроку.
