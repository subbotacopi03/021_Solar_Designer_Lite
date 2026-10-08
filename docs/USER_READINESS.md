# Готовність до простого користувацького кейсу

Перевірено 2026-10-08. Поточний корінь — `021_Solar_Designer_Lite`; резерв — `_previous_workspace_20261008_160124`, він та вихідний ZIP збережені й виключені з Git. Це локальна попередня електрична перевірка, а не повний проєкт електроустановки.

## Уже робочий обмежений кейс

Відкрити автономний `Solar_Designer_Lite.html`, завантажити `data/examples/trina435-manual24.json`, переглянути обладнання й джерела, редагувати два стрінги по 12 модулів на MPPT A/B у «Стрінги та MPPT», застосувати план, переглянути окремі PASS/FAIL/UNKNOWN, зберегти JSON і Markdown. Node та інтернет звичайному користувачу не потрібні. Файл можна відкривати через `file://`; актуальні браузерні перевірки виконані Chrome/macOS.

Приклад використовує exact Trina TSM-435NEG9R.28 і SMA STP8.0-3AV-40. Розміщено24/24, відомі cold-Voc перевірки проходять. βVmp та окремі physical-input ratings лишаються невідомими; підсумок UNKNOWN. Це корисно для перевірки частини ручної конфігурації та виявлення відомих перевищень. Це не дозвіл на монтаж. Нуль автоматично розміщених модулів за missing βVmp означає блокування генератора даними, а не нульову потужність запланованої СЕС.

| Статус | Можливість | Доказ у коді / перевірці |
|---|---|---|
| IMPLEMENTED | Ручний план формою, додавання/видалення, вибір MPPT/площини/інвертора, ті самі checks | `apps/designer-lite/src/manual-strings.ts`; `scripts/manual-plan-browser-smoke.mjs` |
| IMPLEMENTED | Відхилення порожніх модулів/duplicate ID, збереження невідомих targets без silent remap | `tests/integration/manual-strings.test.ts`; browser scenario |
| IMPLEMENTED | JSON save/load/autosave, підтвердження reset, відновлення попереднього проєкту після reload | `apps/designer-lite/src/main.ts`; `scripts/project-safety-browser-smoke.mjs` |
| IMPLEMENTED | Зрозумілі UA/EN помилки основних полів замість raw Zod JSON | `input-errors.ts`; `tests/integration/input-errors.test.ts` |
| IMPLEMENTED | Захист структури Markdown від підроблених заголовків/таблиць/HTML у введених значеннях | `packages/core/src/markdown-text.ts`; `tests/integration/report-text.test.ts` |
| IMPLEMENTED | Авторство/джерело з єдиних metadata, About, offline legal notices, provenance у звітах | `data/attribution.json`, `about.ts`, `software-credit.ts`; attribution tests/browser |
| PARTIAL | Реальне обладнання й автогенерація | exact-SKU catalogs є; missing βVmp/connectors не дозволяють підтверджений повний автоматичний план |
| PARTIAL | Кабелі та nominal protection/SPD | `cables.ts`, `protection.ts`, `spd.ts`, `dc-switch.ts`; installation/coordination UNKNOWN |
| BLOCKED | Повне персональне авторство й дозвіл на public redistribution | ім’я/канонічний URL не надані, LICENSE UNLICENSED; див. `ATTRIBUTION.md` |
| NOT IMPLEMENTED | Готовий перевірений public download pack та його release checklist | standalone уже є; дистрибутив з очищеним allowlist, guide/examples/checksums ще потрібен |

## Скільки залишилося

До обмеженої публічної альфи залишаються **три завершувальні етапи**, а не переписування програми. Відсоток або строк без пілоту й закриття джерел не оцінюємо.

1. Допомога з missing data: зрозумілі назви/одиниці й пояснення, які перевірки доступні, де взяти кожне потрібне поле та що блокує остаточний висновок. Acceptance: новачок проходить реальний ручний кейс без JSON-редагування й розрізняє відомий FAIL та відсутній параметр; Перехід між розділами вже захищено підтвердженням відкидання draft; незастосований draft живе у поточній вкладці, збереження JSON вимагає спершу застосувати зміни.
2. Користувацький пілот і браузери: independent engineer + кілька форумних користувачів, Windows Chrome/Edge і macOS Safari/Firefox, import/save/reload/report/mobile. Acceptance: немає відтворених втрат роботи, нерозбірливих таблиць або розходжень CLI/UI; результати зафіксовані. Поточні Chrome/macOS automated checks не замінюють ці перевірки.
3. Публічний комплект: ім’я/канонічний URL власника, повний узгоджений LICENSE, clean allowlist-архів HTML+коротка інструкція+приклади+notices+checksums, перевірка відкриття на чистій машині. Історичні QA `.txt` містять локальні шляхи та уривки старих diagnostic stacktraces: не включати їх або резерви в public pack; перед публічним push окремо перевірити історію. Нічого з історії/резервів автоматично не видаляємо. GitHub release/push потребує окремого завдання.

Для **підтвердженого автоматичного підбору реальної установки** потрібен окремий engineering етап: manufacturer coefficients/connectors/ampacity references/derating/coordination та первинні нормативні джерела. Терміни невідомі до отримання даних. UNKNOWN не закривається позитивним software test. Full UA/CZ, parallel cables, optimizers, BESS, CAD/GIS та економіка не входять у цю просту альфу.

## Перевірки та зауваження економних агентів

Три незалежні bounded review виконували агенти gpt-6-luna, доступні через Codex, над локальними файлами. Це не локально встановлені мовні моделі. Знайдено й виправлено reset без захисту та Markdown injection; окремий review атрибуції уточнив надмірну тестову assertion, яка помилково забороняла навіть безпечний plain text. Під час інтеграції ручного редактора також усунуто silent remap відсутніх targets. Деталі й свіжі PASS/FAIL/NOT_RUN — `IMPLEMENTATION_REPORT.md`.
