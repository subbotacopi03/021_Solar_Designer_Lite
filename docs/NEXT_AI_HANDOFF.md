# Передача OpenPV · 2026-10-08

Працювати лише в `/Users/subbota/_ПРОЕКТИ/021_Solar_Designer_Lite`. Архів/старий workspace збережено в ignored `_previous_workspace_20261008_160124`. Не переносити його правила чи production code. Початкові98 hashes/sizes PASS у STARTER_INTEGRITY.json; ARTIFACT_MANIFEST — історичний, не переписувати під зміни.

Прочитати AGENTS.md, spec, DEVELOPMENT_PLAN.md та IMPLEMENTATION_REPORT.md. Node>=24, pnpm11.25.0. Frozen install виконано. Попередній `pnpm check`:121 tests,17 CLI,8 formula entries, typecheck/build/schema PASS. Browser:11 baseline+15 expanded; file:// перевірка окрема. Final logs/results у docs. Lint NOT RUN — script відсутній; Prettier окремо. Browser plugin відсутній; запуск: `OPENPV_CHROMIUM_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm test:browser`; expanded — `node scripts/equipment-browser-smoke.mjs` з тим самим env.

Реалізовано real Trina435/440 і SMA8/10 catalog/selector/report/examples, bounded string recovery з29/29 і58/58 witnesses, manufacturer cable UNKNOWN/structured derating, full declared backfeed та fuse nominal checks, окремий SPD candidate module. Докладні джерела/межі — EQUIPMENT_CATALOG.md, CABLE_EVIDENCE.md, PROTECTION_EVIDENCE.md, SPD_EVIDENCE.md.

Важливі invariants: core без IO; спільний calculateProject для CLI/UI; SPEC-01…10; βVmp не виводити з γ−α; Voc FAIL не приховувати missing Vmp; physical ratings не отримувати діленням MPPT totals; module max series fuse не є reverse withstand; full inverter backfeed не ділити; known lower bound може довести FAIL, але не PASS. Supplied fuse In перевіряється навіть коли necessity=false/null і використовується для cable check. Derating evidence.applies_to прив’язаний до cable/reference/точних actual conditions. Manual form/JSON equipment edits переводять sources у USER_INPUT і прибирають date/hash; file import зберігає заявлені evidence, які не є цифровим підписом.

Генератор: збережено complete greedy plans; recovery caps24slots/8planes/2000modules/30000nodes, WARN при limit, valid incumbent. Objective: більше assigned modules, потім менше strings серед розглянутих, детермінований порядок. Немає доказу глобальної оптимальності. Manual проходить engineering checks того самого core.

Незалежний review знайшов4 Important, відтворені RED і виправлені; див. report та review logs. Не видаляти логи невдалих перевірок. Formula updates лише spec → незалежні арифметичні тести → code → review findings → deliberate manifest update.

## Наступний етап і блокери

1. Manufacturer installation pack: missing Trina βVmp/reverse withstand, SMA per-connector limits, Nexans α/reference conductor temperature/derating. Отримати офіційне evidence; якщо його немає — null/UNKNOWN. Acceptance: applicability snapshot + independent calculations + software/CLI/browser checks; не вставляти generic defaults.
2. Protection coordination: exact holder/device curves, total clearing I²t, fault magnitude/duration, cable withstand, backfeed model. Acceptance: known failures незалежно від missing fields; sources і unit tests. Не підмінювати pre-arcing I²t total-clearing.
3. SPD installation topology: earthing/separation/routing, lead effects, coordinated stages/upstream protection, застосовні первинні нормативні тексти. Acceptance: numeric cases; LPS alone не визначає тип; current8/20 не замінює10/350; UA/CZ compliance UNKNOWN до підтвердження.

Ці повні engineering етапи BLOCKED на відсутніх manufacturer/site/standard inputs; незалежні nominal contracts уже виконано. Parallel cables/optimizer engine потребують окремої реалізації. Economics/prices/tariffs/customers/CAD/GIS/private templates — поза scope. License UNLICENSED незмінна; тільки локальні commits, без push/public release. Не називати комплект повністю завершеним або certified.

## Продовження: DC-роз’єднувач

Додано dc-switch.ts, DcSwitchDevice/Context schemas та ABB OTDC32F2 /1SCA121456R1001:1000V/Ie20A/DC-21B/2poles/1circuit/diagrams2a,2b. Ui1250V/Ith45A — окремі умовні поля, не capacity checks. Profile/category/diagram/poles/scope обираються явно, жодного автоматичного DC-PV2. PER_STRING only; MPPT/INVERTER UNKNOWN. Cable fuse In незмінний. Reports/BOM — unapproved candidates. Details/source/test evidence: DC_SWITCH_EVIDENCE.md. Приклади dc-switch-source-limited (manual8×15,UNKNOWN) і dc-switch-voltage-fail (19×56.3>1000,FAIL). Нові software results: dc-switch-check-output.txt та dc-switch-browser-*-results.json. Попередні final-* logs стосуються попереднього commit, не останнього коду.

Останній повнийcheck:134tests/9files,20CLI,9formula entries,typecheck/build/schema PASS. NewDCswitch browser8dev +8file://; existing11baseline+15equipment PASS. Review1Important виправлено через3newRED cases: scope null/unsupported не приховує proven excess, lower bound всередині capacity не даєPASS. Lint NOT RUN,formatter окремо. Подальший complete DCswitch stage потребує mounting/thermal/terminal/fault/reverse/category requirement evidence; не прибирати DC_SWITCH_SCOPEUNKNOWN заради зеленого overall.

## Актуальний код: окремі траси

Останній stage: schema dc_routes/ac_routes → core/routes.ts → index.ts per-line circuits/ac_lines/cable_bom → UI/routes.ts і main.ts → CLI/report, individual-routes.json. Overrides — full replacements. DC exact5-field snapshot: STALE_OVERRIDE або AMBIGUOUS_OVERRIDE не застосовується, circuit={}, UNKNOWN; absent IDs/removed inverters — ROUTE_ORPHAN. Existing manual duplicate-ID FAIL зберегти. Legacy ac aliases first inverter only. BOM actual selected lengths, DC×2 / AC×1; omitted_routes та unresolved_dc_layout явно показано. Quantity completeness не означає engineering compliance. Derating sources/applicability не послаблено.

Свіжий check:151tests/10files,24CLI,10manifest entries,typecheck/build/schema PASS; browser11baseline+15equipment+8switch+11routesdev+11routesfile PASS. Логи routes-check-output.txt, routes-browser-*-results.json та routes-*-browser-output.txt. Lint NOT_RUN (немає script/config), formatter окремо. Focused review1defect duplicate IDs відтворено RED й виправлено;151GREEN. Failed evidence fixture/import runs збережено й пояснено у report. Більшість старих final/dc-switch logs — історичні результати попередніх commits.

Наступний незалежний code stage: per-feeder cable candidate inspector, показати вже розраховані candidates/failed and UNKNOWN checks/inputs/sources, без окремих UI формул, без auto-select UNKNOWN. Acceptance і manufacturer BLOCKED paths — DEVELOPMENT_PLAN.md. Економні UI/review subtasks виконувалися gpt-6-luna; критичні core decisions і перевірки залишалися в основному контексті. Працювати лише в поточному PROJECT_ROOT, local commits only.

## Останній завершений stage: cable inspector

Запланований вище inspector уже реалізовано, не починати його повторно. apps/designer-lite/src/cable-inspector.ts використовує existing ProjectResult candidates; selector DC byarrayindex (дубльовані engineeringFAIL IDs не зливаються), AC byinverter; body-only rerender, без project mutation. Усі checks і actual circuit, selected/null, metrics, cable/ampacity/factor sources; dedup лише identical records, safe HTTP(S) anchors та escaped content. main.ts підключає Site & cables, scoped CSS wrapping. core/index.ts додав тільки Markdown formatting non-PASS candidate audit/ampacity reference; engineering formulas незмінні.

Fresh `pnpm check` PASS152tests/10files,24CLI,10manifest entries,typecheck/build/standalone/schema. Browser suites PASS70combinedchecks:11baseline+15equipment+8switch+11routesdev+11routesfile+7inspectordev+7inspectorfile. Результати inspector-*; failures RED збережено й пояснено в report. Lint NOT_RUN (script/config absent), formatter PASS. Focused review source-dedup/wrapping fixes підтверджено. Наступний engineering step — manufacturer installation/coordination pack з missing primary inputs; null/UNKNOWN та existing scope boundaries лишаються. Користувач попросив економний режим: bounded UI/review доручали gpt-6-luna, core decisions/integration — main.
