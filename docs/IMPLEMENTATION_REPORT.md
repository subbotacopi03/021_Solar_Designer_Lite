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
