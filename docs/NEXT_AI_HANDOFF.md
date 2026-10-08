# Оновлення · етап 4 · 2026-10-08

Захист: full declared inverter backfeed + factored parallel array contribution; missing backfeed→UNKNOWN навіть для single string. SMA0 A підтверджено офіційною таблицею; synthetic examples мають явне навчальне0. Module reverse withstand не підмінено max series fuse. Додано strict fuse device schema, Eaton PV-15A10F source-limited record, UI candidate selector, voltage/current/breaking checks та source-preserving report. `fuse-voltage-fail.json`:1069.7 V>1000 V →FAIL. Details: PROTECTION_EVIDENCE.md.

PASS `pnpm check`:105 tests,16 CLI,7 manifest entries, typecheck/build/schema.12 розширених browser checks PASS. Prettier змінених файлів перевірено перед commit. Spec/tests перед реалізацією, backfeed arithmetic40 A. PROTECTION source hash оновлено після105 PASS; pre-arcing I²t не підмінює total-clearing energy. Full protection coordination UNKNOWN/BLOCKED: curves/fault model/holder/poles/applicable standard sources. Наступний окремий етап — SPD nominal candidate checks з UNKNOWN topology/normative scope.

---

# Оновлення · етап 3 · 2026-10-08

Додано Nexans ID540479078 source-limited cable record; `docs/CABLE_EVIDENCE.md`, `data/examples/source-limited-cable.json`. Schema підтримує UNKNOWN R20/α, ampacity reference та structured derating із джерелами. Core перевіряє метод/температуру/групування й добуток factors; UI має cable pack selector і явні site fields; report зберігає evidence. Не вставлено generic α/X/Iz; parallel cables не реалізовано. Manufacturer candidate лишається UNKNOWN через α, reference conductor temperature та derating data; повний manufacturer sizing BLOCKED до отримання цих джерел.

PASS `pnpm check`:99 tests,15 CLI,7 manifest, typecheck/build/schema.11 equipment/allocation/cable browser checks PASS (окремо baseline11). Test-first spec/arithmetic:30.8 A,6.090185 Ω/km,4.872148 V. На першому GREEN run один fixture мав додаткове відоме In>Iz; fixture Iz задано55 A для ізоляції missing-α case, а FAIL precedence збережено. CABLE-SIZING hash оновлено після99 PASS; thermal/AC formulas unchanged. Наступна незалежна робота — reverse-current/backfeed та номінальні параметри fuse, окремо SPD candidate evidence; full curves/normative coordination UNKNOWN.

---

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

# OpenPV / Solar Designer Lite — handoff

Власник: Oleksandr Subbota. Мета: безкоштовний навчальний калькулятор і майбутнє відкрите PV electrical core, над яким private Solar Suite зберігає комерційні продукти. Спілкування українською. Без вкладених списків.

У цьому комплекті вже є реально виконуваний starter, а не лише architecture proposal. Читайте README, specification, SOURCE_PROVENANCE, FEATURE_MATRIX та IMPLEMENTATION_REPORT. Raw source recovery не входить у комплект.

## Запуск і перевірка

Node 24 + pnpm 11.25.0: `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm dev`. CLI після build: `pnpm cli validate|calculate|report path.json`. UNKNOWN exit code 3 є очікуваним для preliminary project, а не crash.

## Прийнята база

SPEC-01…10 у docs/spec/electrical-v0.1.md. No hidden site/datasheet defaults. Beta signed negative; optional missing→UNKNOWN. Isc та Imp, MPPT та physical input ratings separate. R(T), explicit cosPhi/X and derating. One string/input. No parallel cable autoselection. AC current based on output power excludes efficiency.

Core pure, strict Zod schema, one calculateProject pipeline for CLI/UI. UI vanilla TypeScript/Vite, UA/EN, localStorage, JSON save/load, manual plan, checks, basic BOM/report, learning exercises. New implementation is source-informed and spec-driven; production modules were not copied wholesale. No Suite repositories changed.

## Незавершене — не називати готовим

- Catalog is synthetic and ampacity unverified; manufacturer/equipment packs and national policies must be verified separately.
- Derating uses explicit total factor+basis; no automatic standard-table parser.
- Generator is a greedy heuristic with remainder recovery and balancing; per-inverter max DC power is respected. No global optimality claim; extend heterogeneous fleet constraints separately.
- Fuse does not substitute max series fuse rating for reverse-current withstand; inverter backfeed is not assessed.
- SPD and complete protection coordination remain UNKNOWN. I2, time-current curves, disconnection, fault-loop, adiabatic, RCD and LPS scope not implemented.
- Optimizer topology has data schema but no calculation engine.
- PDF is browser print, no dedicated report service; no installers/PWA/backend/auth/cloud sync.
- License pending UNLICENSED; no GitHub/npm publish. Choose license and verify ownership before publishing.

## Наступні дії

1. Незалежно переглянути engineering spec і test numeric cases; не приймати source recovery results як normative approval.
2. Замінити synthetic data на 2–3 exact manufacturer SKUs із перевіреними sources і unit tests.
3. Затвердити installer/ampacity profile, derating metadata й cable conductor arrangement.
4. Поліпшити генератор до constraint solver: objective, per-inverter power cap, all plane allocation, manual diagnostics.
5. Реалізувати повний protection model з backfeed, device family, rated voltage, curves, I2 і withstand; окремо SPD topology.
6. Додати optimizer equipment packs лише за exact manuals і manufacturer constraints.
7. Винести localization text у dictionaries; локалізувати findings basis і повідомлення валідації.
8. Зробити release packaging для окремих npm packages, exports/declarations і versioning; додати audit/license gate.
9. Додати CI browser smoke через стандартну portable Playwright installation; зберігати artifacts CI.
10. Пілотувати з невеликою групою студентів, зібрати feedback, вибрати ліцензію та тільки потім public release.

Жодних змін Solar TEO/TZ/Construct без окремого завдання. Не додавати ціни, клієнтські дані, economics, private CAD/GIS чи шаблони в public package. Не приховувати UNKNOWN заради «зеленого» екрану.
