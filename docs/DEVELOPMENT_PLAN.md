# План розвитку OpenPV

Дата: 2026-10-08. Корінь: поточний workspace. Виконання в цій сесії, без зміни архітектури та зовнішніх Solar repositories.

Мета: продовжити starter, зберігаючи SPEC-01…10, чисте ядро, спільний pipeline schema → core → CLI/UI/report, UA/EN, Student Mode та save/load. UNKNOWN не підмінювати припущеннями. Залежності й ліцензію не змінювати.

## Початкова карта стану (перевірено код)

| Статус | Пункт | Файл і доказ |
|---|---|---|
| IMPLEMENTED | Strict schema, signed β, missing inputs | packages/schema/src/index.ts; tests/differential/spec-regressions.test.ts |
| IMPLEMENTED | Temperature, AC current, R(T), cosφ/X | packages/core/src/fundamentals.ts; tests/golden/electrical.test.ts |
| IMPLEMENTED | Shared calculation, CLI/report | packages/core/src/index.ts; packages/cli/src/index.ts; 5 CLI smoke cases |
| IMPLEMENTED | UA/EN, JSON import/export, Student Mode | apps/designer-lite/src/main.ts; scripts/browser-smoke.mjs (поточний запуск ще очікується) |
| PARTIAL | String generator, manual engineering checks | packages/core/src/strings.ts; greedy/remainder recovery; no completeness proof |
| PARTIAL | Cable candidates, explicit aggregate derating | packages/core/src/cables.ts; synthetic Iz, no manufacturer installation profile |
| PARTIAL | Fuse/breaker/isolator candidates | packages/core/src/protection.ts; backfeed/curves/device voltage incomplete |
| NOT IMPLEMENTED | Real equipment catalog | data/equipment/modules.json та inverters.json: лише SYNTHETIC |
| NOT IMPLEMENTED | SPD/optimizer topology | protection.ts: spdAssessment UNKNOWN; strings.ts: OPTIMIZER_TOPOLOGY UNKNOWN |
| BLOCKED | Full UA/CZ compliance | docs/spec/electrical-v0.1.md: full standard text/adoption not verified |

## Послідовність і критерії приймання

1. Підготовка: ZIP CRC і path safety; 98 hashes/sizes; резерв з початковим inventory; явні ignores та test scope. Node >=24/pnpm 11.25.0; frozen install; незалежний baseline check та browser smoke. Зберігати журнали невдалих запусків.
2. Реальне обладнання: data/equipment/verified/modules.json та inverters.json, щонайменше 2 exact SKUs кожного типу. Schema metadata manufacturer/model/source revision/date/units/unknown explanations; офіційні джерела. Не називати весь виріб перевіреним через перевірені окремі поля. βVmp та фізичні limits без джерела = null. Каталог у UI, зміна SKU прибирає старий ручний план, ручне редагування скидає атрибуцію verified. 2 JSON examples; schema/core/CLI/report/UI roundtrip з UNKNOWN та джерелами. Тести exact arithmetic й невідомих параметрів; pnpm check + browser smoke; локальний commit.
3. Генератор: задокументувати objective: максимізувати розміщені модулі; tie-break — менше стрінгів, детермінований порядок. Додати незалежні контрприклади greedy (змішані MPPT windows/planes/power quotas); bounded constraint search з чесним search-limit finding і без заяви глобальної оптимальності. Manual і auto використовують ті самі checks. Спочатку специфікація/тести, потім код, manifest лише після аналізу; check/browser/docs/commit.
4. Кабелі: exact manufacturer data й окремі installation/temperature/grouping evidence; жодних generic α/X/Iz. Валідація застосовності derating. R(Tconductor), cosφ/X та один кабель/feeder зберігаються. Незалежна арифметика; unknown provenance блокує доведений вибір. Check/browser/docs/commit.
5. Захист: окремий module contract для array reverse current + inverter backfeed; device rated voltage, curves/coordination/withstand. Maximum series fuse не є reverse withstand. Невідомі source inputs → UNKNOWN. Незалежні числові regression cases перед зміною формул; check/docs/commit.
6. SPD: окремий contract для earthing, separation, routing, coordination та manufacturer ratings. LPS boolean не визначає тип SPD. Первинні manuals; неперевірена нормативна вимога UNKNOWN. Check/docs/commit.

Поточні обмеження: відсутні βVmp не обчислювати як γ−α в основному pipeline; SMA tracker totals не ділити на число фізичних конекторів. Обидва real examples можуть коректно повертати UNKNOWN/exit 3. Це успішна обробка невідомих даних, а не позитивний engineering verdict.

## Виконання 2026-10-08

Пункти1–3 реалізовано й збережено окремими commits. Пункт4: завершено контракт missing manufacturer data та sourced derating applicability, додано Nexans record/UI/example; повний sizing BLOCKED через відсутні α/reference conductor temperature/applicable derating sources. Незалежно продовжено пункти5–6.
