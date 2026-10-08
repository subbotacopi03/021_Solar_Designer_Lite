# Оновлення · етап 2 · 2026-10-08

Реалізовано bounded recovery у `packages/core/src/strings.ts`, tests у `tests/differential/allocation.test.ts`. Контрприклади E10/W19 та E20/W38 (2 інвертори, max16965 W кожен) тепер без залишку. Primary objective — більше розміщених модулів; ties — менше стрінгів серед розглянутих. 24 slots/8 planes/2000 modules/30000 nodes; перевищення дає WARN ALLOCATION_SEARCH_LIMIT. Глобальна оптимальність не заявляється. Повні greedy плани збережено.

Ручний план має ті самі voltage/current/input/power/plane checks. Виправлено coupled missing-data diagnostic: βVmp UNKNOWN не приховує обчислений Voc; 20×56.3=1126 V дає FAIL при1100 V. Спочатку додано spec і незалежні тести, відтворено RED, потім реалізацію. Manifest навмисно спершу FAIL після зміни strings.ts; оновлено тільки STRING-RANGE source hash після перевірки тестів. Формули температури/кабелів/струму не змінено.

PASS `pnpm check`: 94 tests, 14 CLI, 7 manifest entries, typecheck/build/schema. `equipment-browser-smoke.mjs`: 10 checks, включно 58/58 у UI. Одна рання browser assertion випередила async file import; додано очікування фактичного DOM result, повторний запуск PASS. Форматування змінених файлів перевіряється перед commit. Наступний етап — source-limited manufacturer cable records та structured derating provenance; нормативні таблиці без первинних джерел UNKNOWN.

---

# Оновлення 2026-10-08 · етап 1

Корінь: `/Users/subbota/_ПРОЕКТИ/021_Solar_Designer_Lite`. Резерв: `_previous_workspace_20261008_160124`; вихідний ZIP у ньому. CRC PASS; 98/98 manifest hashes/sizes PASS (`STARTER_INTEGRITY.json`). Git ініціалізовано локально; push/release/license change не виконано.

Каталог exact SKU: Trina TSM-435NEG9R.28, TSM-440NEG9R.28; SMA STP8.0-3AV-40, STP10.0-3AV-40. `data/equipment/verified/`, `EQUIPMENT_CATALOG.md`, schema metadata, UI selectors, датовані джерела в UI/report; 2 examples. SYNTHETIC data збережено окремо. UNKNOWN βVmp/reverse withstand/physical connector currents не підмінено. Ручне UI редагування знімає VERIFIED.

PASS: frozen install (Node 24.19.0/pnpm 11.25.0); baseline 84 tests/5 CLI/11 browser. Після каталогу `pnpm check`: 89 tests, 13 CLI, manifest 7, typecheck/build/schema. Browser: 11 baseline + 9 equipment checks, desktop 1440 та mobile 390px, без runtime/console errors. Prettier check змінених TS/JS/JSON PASS. Окремого lint script немає: NOT RUN. Спочатку Vitest помилково читав backup (13 failed suites); `vitest.config.ts` обмежує tests/, повторний baseline PASS. Equipment browser спочатку виявив favicon 404; додано explicit data favicon, повторний запуск PASS. Повні журнали baseline/equipment у docs; screenshots у .qa (ignored). Browser plugin відсутній; використано repository Playwright і локальний Chrome.

Наступний етап: bounded search для string allocation. Уже відтворено контрприклад: E10 займає MPPT A 6..19, W19 не вміщається в B6..10; допустимий witness E10→B, W19→A дає всі 29. Потрібні spec-first tests, детермінований objective, power/input/plane limits, чесний search-limit finding. Формули каталожного етапу не змінено; manifest не оновлювався.

Нижче — попередній звіт стартового комплекту; його заяви про відсутність manufacturer data замінено оновленням вище.

---

# Звіт реалізації · OpenPV Starter v0.1.0

Створено окремий виконуваний стартовий комплект: schema, pure electrical core, CLI, Designer Lite, synthetic data, regression tests, formula manifest, CI configuration та документація для продовження в Codex.

## Виконана перевірка

| Перевірка | Фактичний результат |
|---|---|
| TypeScript typecheck | PASS |
| Vitest | 84/84 PASS у 3 test files |
| Formula manifest | 7 entries match |
| Node/CLI + Vite production build | PASS |
| Project JSON Schema export | PASS; cross-field validation залишається в Zod |
| CLI smoke | 5/5 PASS: validate, calculate, report, invalid JSON, electrical FAIL |
| Browser smoke | 11/11 PASS; 0 JavaScript runtime errors |
| Автономний HTML через file:// | PASS у Chromium; UI/load/save/report сценарії пройдено |
| Mobile 390 px | Без горизонтального overflow документа |
| Print/PDF | 2 сторінки A4, відрендеровано й перевірено візуально |

Докази: check-output.txt, cli-smoke-results.json, browser-smoke-results.json, screenshots та example-report.pdf у docs. Chromium для QA отримано через npm-bundled binary після невдалого standard browser download у цьому середовищі; це не runtime dependency UI.

## Відтворюваний приклад

120 × 585 W = 70 200 W = 70.2 kWp. AC = 50 kW. DC/AC = 70.2/50 = 1.404.

Voc cold = 50 × [1 + (−0.28/100) × (−20 − 25)] = 56.3 V. Nmax = floor(1100/56.3) = 19; Nmin = 6. Автоматичний план: 7 стрінгів, балансування 18 + 6 × 17 = 120 модулів.

AC current = 50 000/(√3 × 400 × 0.95) = 75.96714 A. Номінальний breaker candidate 80 A. На synthetic cable catalog та заданому derating 0.87/довжині 80 m обрано AC candidate 50 mm² з ΔU близько 1.223 %. Цей synthetic candidate не є рекомендацією для будівництва.

Дві площини 60 + 60 дають 8 окремих MPPT/string groups по 15 модулів. Повний проєкт має UNKNOWN, оскільки SPD та повна перевірка захисту не реалізовані; конкретні voltage/current checks мають власні PASS/FAIL.

## Що написано

Увесь deliverable code написано як новий starter за SPEC та selected arithmetic cases. Структуру findings і formula change barrier адаптовано концептуально. Production modules не копіювалися дослівно; raw source recovery не включено. Production Suite repositories не змінено. Попередні логи 286/286 TEO і 221/221 Construct не є результатами нового запуску в цьому комплекті.

## Істотні обмеження

Derating вводиться явно; automatic normative tables не затверджені. Обладнання навчальне, не manufacturer catalog. Generator heuristic, single equipment type/fleet, one string/physical input, no parallel cable autoselection. Optimizer topology, complete fuse/backfeed, full protection/SPD/earthing та UA/CZ compliance не завершені. Немає desktop installer, cloud sync, commercial reports або public release.

License лишається UNLICENSED до рішення власника. Public GitHub/npm не створено і не опубліковано. Це завершений стартовий комплект для подальшої розробки, а не фінальна сертифікована інженерна програма.
