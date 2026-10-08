# Звіт розробки OpenPV · 2026-10-08

Корінь: `/Users/subbota/_ПРОЕКТИ/021_Solar_Designer_Lite`. Вміст верхньої папки ZIP `openpv` перенесено безпосередньо сюди. Резерв `_previous_workspace_20261008_160124` зберігає початкові файли, архів та inventory; порожній staging `_starter_extract_20261008_160124` ізольовано ignores. Інші Solar repositories не змінювалися.

ZIP CRC/path safety PASS, до змін коду перевірено98/98 файлів за розміром/SHA-256: `STARTER_INTEGRITY.json`. SHA-256 архіву: `13f6f3fd698e1ae244a8c72d4a94d2f5982cfdfbad1c51b47dc4421551e01f01`. ARTIFACT_MANIFEST.json лишається історичним manifest стартового комплекту, а не поточного зміненого коду. Git спочатку був відсутній; ініціалізовано локально, зроблено змістовні commits. Push/release/license change не виконано.

## Фактично реалізовано

| Пункт | Результат і доказ |
|---|---|
| Реальне обладнання | 2 exact Trina power-bin SKU +2 SMA conventional inverter SKU, units/date/manual locators/unknowns. `data/equipment/verified/{modules,inverters}.json`, `tests/integration/equipment.test.ts` |
| UI/shared pipeline | Вибір real vs synthetic, source notes, ручне редагування форми/JSON скидає VERIFIED/date/hash; file import зберігає явно надані evidence. Save/load/Student Mode/UA/EN збережено. `main.ts`, `equipment-browser-smoke.mjs` |
| Генератор | Bounded recovery із greedy incumbent; objective більше модулів, потім менше стрінгів серед розглянутих; caps24slots/8planes/2000modules/30000nodes. Контрприклади29/29 та58/58. `strings.ts`, `allocation.test.ts`; глобальна оптимальність не заявляється |
| Known checks | UNKNOWN βVmp не приховує відомий Voc FAIL; manual/auto мають ті самі limits. `allocation.test.ts`, SPEC regressions |
| Кабелі | Nexans ID540479078 source-limited record, R(Tconductor)/cosφ/X збережено, structured factors та точна прив’язка до cable/reference/site snapshot. Зміна умов→UNKNOWN. `cables.ts`, `cable-evidence.test.ts`, CABLE_EVIDENCE.md |
| Захист | Full declared backfeed + factored array reverse; module withstand окремо від maximum series fuse. Eaton PV-15A10F candidate, незалежні current/voltage/breaking checks та supplied In для кабелю. `protection.ts`, `backfeed.test.ts`, PROTECTION_EVIDENCE.md |
| SPD | Phoenix2800628 assembly, окремі Ucpv/UocSTC/Iscpv/Up/impulse/type/context checks. Відомий overcurrent FAIL не губиться за missing backfeed. LPS не обирає тип. `spd.ts`, `spd.test.ts`, SPD_EVIDENCE.md |

Core залишається без IO; CLI/UI використовують calculateProject. Формули змінювалися після spec та незалежних арифметичних regression cases; manifest оновлено після GREEN. SPEC-01…10 збережено. Synthetic catalog/examples лишаються окремими навчальними даними.

## Перевірки в цьому середовищі

Node24.19.0, pnpm11.25.0 відповідають package.json. `pnpm install --frozen-lockfile` PASS. Baseline після ізоляції backup:84 tests,5 CLI,11 browser PASS. Фінальний `pnpm check` PASS:121 tests/8 files, typecheck,8 formula entries, production/CLI build, standalone HTML, JSON schema export,17 CLI scenarios. Журнал `final-check-output.txt`, результати `cli-smoke-results.json`.

Браузер: repository Playwright + системний Chrome (Browser plugin відсутній). Baseline11, expanded15 сценаріїв: exact SKU, UNKNOWN, save/reload/import, form/JSON attribution, report sources,58/58, cable/fuse/SPD, EN, mobile390px. Фінальні журнали/JSON у docs; screenshots у ignored `.qa`. Desktop/mobile та обидві A4 сторінки example-report.pdf переглянуто візуально: читабельні, без обрізаного змісту. Автономний HTML через file://:15/15 PASS,0 console/page errors. Остаточні результати — `browser-smoke-results.json`, `equipment-browser-results.json`, `standalone-browser-results.json`.

Lint: NOT RUN — repository lint script/config відсутній. Prettier PASS — окрема перевірка змінених TS/JS/JSON. Нормативні, coordination та production-readiness checks — NOT RUN/UNKNOWN; вони не входять у позитивний software verdict.

## Невдалі запуски та виправлення

Початковий Vitest читав recovery tests усередині backup:13 failed suites (`baseline-check-output.txt`); test include обмежено tests/, повторний baseline PASS. Browser виявив favicon404 — додано data favicon. Ранній import assertion випереджав async load — очікування фактичного DOM result. Cable missing-α fixture спочатку також мав відомий In>Iz — fixture виправлено без зміни FAIL precedence. Навмисні manifest mismatch після formula edits усунуто лише після spec/test review.

Незалежний review знайшов4 Important: skipped supplied fuse In, stale derating applicability, JSON attribution, missing backfeed masking proved overcurrent. Нові тести відтворили6 FAIL/117 tests, browser JSON assertion також FAIL (`review-regressions-red.txt`, `review-ui-red.txt`). Виправлено;121 tests GREEN (`review-regressions-green.txt`) та browser15 PASS. Це докази виправлень, а не приховані невдалі перевірки.

## UNKNOWN / BLOCKED

Trina βVmp/reverse withstand та SMA per-connector current limits відсутні у звірених sections; real automatic design лишається UNKNOWN. Nexans α/X та reference conductor temperature/applicable derating sources невідомі; manufacturer sizing не доведено. Повні protection curves/I²t/holder/poles/fault model та SPD routing/lead voltage/coordination/national requirements відсутні. Паралельні кабелі й optimizer topology НЕ реалізовано. Відповідність UA/CZ не заявляється.

Наступний конкретний етап — source-grounded installation/coordination pack: отримати missing manufacturer/reference/derating дані, перевірити їхню застосовність, додати незалежні numeric cases, лише потім дозволяти позитивний real-equipment sizing. Послідовність та критерії — DEVELOPMENT_PLAN.md. Поточний результат — розширений робочий стартовий комплект, не завершена інженерна програма.

Follow-up review додатково відтворив2 FAIL/121: known inverter contribution за missing array factor та uncaught form validation. Виправлено lower bound усіх відомих contributions і try/catch із відновленням форми; browser invalid βVoc case тепер PASS. Один SPD fixture спочатку не мав ручного плану, тож missing factor блокував сам generator: додано explicit10-module manual plan для перевірки зайнятого MPPT (`review-followup-first-check.txt`). Manifest command у тому невдалому ланцюжку виконався перед GREEN; після виправлення fixture спершу підтверджено121 PASS, потім manifest повторно оновлено й повний check PASS. Первинні помилки форматування generated JSON усунуто окремо, без зміни обчислень.

Один паралельний dev/file:// browser rerun зіштовхнувся на спільному `.qa/cable-report.md` (порожнє читання під час запису іншого run): `download-collision-browser-output.txt`. QA artifacts рознесено у `.qa/equipment` та `.qa/standalone`; це усуває спільний файловий стан тестів.

## Продовження: DC-роз’єднувач

Після d61ba6d реалізовано окремий nominal DC-switch contract: exact ABB OTDC32F2, strict source/profile/context schemas, explicit Ue/Ie/category/poles/diagram checks, per-string-only scope, CLI/UI/report/BOM та2examples. Пристрій не замінює overcurrent protection і його Ie не підставляється в cable In. DC_SWITCH_SCOPE завжди UNKNOWN до монтажної/fault/normative перевірки. Деталі — DC_SWITCH_EVIDENCE.md.

RED:7 нових тестів FAIL/128 total через відсутній contract (dc-switch-red.txt). GREEN:10нових cases включно schema roundtrip, pole count та ambiguous profiles;131total. Source-limited fixture спочатку успадкував auto18modules, що справді перевищувало Ue1000V (dc-switch-fixture-fail.txt); замінено лише fixture на explicit8×15, а voltageFAIL збережено окремо. Перший browser probe читав порожній title раніше readiness; прямий diagnostic отримав200/правильнийtitle, додано очікування існуючого metric-strip (dc-switch-browser-red.txt не є доказом UI-feature RED). Новий browser flow8checks PASS; виробничий/standalone reruns і повний check у dc-switch-* logs. Lint NOT RUN: script відсутній.

Незалежний review підтвердив ABB поля/джерело й знайшов1Important: topology gating приховував known excess. Spec clarified,3cases RED (dc-switch-review-red.txt), виправлено lower-bound FAIL-only;134tests GREEN. Останній `pnpm check` PASS:134tests/9files,20CLI,9manifest entries,typecheck/build/standalone/schema export (dc-switch-check-output.txt). Browser PASS:11baseline,15existing equipment,8newDCswitch;8newDCswitch scenarios у file:// PASS окремо. Нуль page/console errors у позитивних runs. Prettier PASS окремо; git diff --check PASS; mobile390px переглянуто візуально, без document overflow. Lint NOT RUN (script absent). Старі final-* результати залишено історичними.

## Продовження: окремі кабельні траси

Реалізовано optional dc_routes/ac_routes у strict schema, pure core/routes.ts, незалежний sizing AC кожного інвертора, довжини/температури/derating кожної лінії, UA/EN редактор у Site & cables, save/load та actual-condition CLI/UI/Markdown reports. dc/ac залишаються спільними явно введеними умовами; override замінює весь об’єкт, без hidden merge. DC прив’язаний до exact id/inverter/MPPT/plane/modules snapshot. Застарілий, неоднозначний або відсутній target не переносить параметри на іншу лінію. Legacy result.ac — лише перший фідер, нові consumers використовують ac_lines.

BOM:2×one-way DC conductor length,1×one-way AC multicore length для кожної вибраної траси; missing/unselected routes пропущено й пораховано, незавершена DC розкладка позначається окремо. UI/report показують фактичну повноту кількостей. Це не підтвердження manufacturer suitability. Приклад individual-routes.json: DC10+30m →80m conductors, AC20+80m →100m cable; UNKNOWN scope залишається. Synthetic приклад не стає реальним manufacturer record.

Тести:17 нових cases, independent DC R(20)=4.61/R(70)=5.515865Ω/km та drops1.6135/1.93055275V; AC independent sections/drops; null/no-default, exact target fields, duplicate/orphan/stale, schema/JSON/report, derating evidence applicability/source semantics. Початковий RED:9failed/10cases (routes-red.txt), GREEN144; review RED: ambiguous manual IDs двічі застосовували одну трасу (routes-review-red.txt), виправлено AMBIGUOUS_OVERRIDE/empty input/UNKNOWN і BOM exclusion. Review повторно перевірив15cases PASS. Два пізніші arithmetic/evidence tests дали151total. Synthetic evidence fixture спочатку помилково очікував selected cable за неперевірених sources: збережено routes-evidence-fixture-fail.txt, виправлено лише assertion, VERIFIED не вигадувалося. Browser import спочатку відхилив зайвий id нового example: routes-browser-import-fail.txt; fixture виправлено під strict schema.

Перевірки останнього стану: `pnpm check` PASS — typecheck,151tests/10files,10manifest entries, CLI/production/standalone build, JSON schema export,24CLIchecks (routes-check-output.txt). `pnpm test:browser` PASS11; equipment-browser-smoke PASS15; dc-switch-browser-smoke PASS8; routes-browser-smoke PASS11dev +11file://, без console/page errors. Результати/логи routes-* у docs; screenshots у ignored .qa/routes-*. Lint NOT_RUN: script/config відсутній; Prettier перевірено окремо. Repository Playwright/system Chrome використано через відсутність Browser plugin. Роботу UI й окреме focused review виконано економною gpt-6-luna, інтеграцію та інженерні перевірки — основним агентом.

Незмінні UNKNOWN/BLOCKED: missing manufacturer coefficients/connectors/ampacity references, protection/SPD installation/coordination, UA/CZ requirements. Parallel cables/optimizer не реалізовано. Наступний code stage: per-feeder cable-candidate inspector із повними rejection/UNKNOWN reasons та джерелами. Core formulas SPEC-01…10 збережено, нормативної чи повної інженерної готовності не заявляємо.
