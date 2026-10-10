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
| IMPLEMENTED | Панель MISSING/PROVIDED/REVIEW, UA/EN назви/одиниці/джерела, per-feeder candidates | `missing-data-model.ts`, `missing-data.ts`; 8 unit + 9 dev/9 file browser checks |
| PARTIAL | Реальне обладнання й автогенерація | exact-SKU catalogs є; missing βVmp/connectors не дозволяють підтверджений повний автоматичний план |
| PARTIAL | Кабелі та nominal protection/SPD | `cables.ts`, `protection.ts`, `spd.ts`, `dc-switch.ts`; installation/coordination UNKNOWN |
| DONE | Повне персональне авторство й публічний репозиторій | Автор: Суббота Олександр Володимирович; https://github.com/subbotacopi03/021_Solar_Designer_Lite; MPL-2.0 |
| PARTIAL | Дистрибутив: локальний owner-review ZIP готовий, public release pending | `scripts/review-pack.mjs`, `review-pack-smoke.mjs`; 12 allowlisted files, UA/EN guides, CRC/SHA-256 та offline round-trip PASS |

## Скільки залишилося

Software-частину допомоги з відсутніми даними реалізовано: UA/EN панель «Що потрібно уточнити» розрізняє MISSING, PROVIDED і REVIEW, показує одиниці, actual sources та affected checks. Вона не заповнює UNKNOWN. Acceptance з реальними новачками ще належить перевірити під час пілоту.

До обмеженої публічної альфи залишаються **два завершувальні етапи**. Локальні програмні етапи виконано; загальний відсоток до engineering-ready продукту не оцінюємо без пілоту й закриття джерел.

1. Користувацький пілот і браузери: independent engineer + форумні користувачі, Windows Chrome/Edge і macOS Safari/Firefox, import/save/reload/report/mobile та missing-data guidance. Acceptance: новачок проходить ручний реальний кейс, розрізняє FAIL і UNKNOWN; немає відтворених втрат роботи, нерозбірливих таблиць або розходжень CLI/UI. Поточні Chrome/macOS automated checks не замінюють ці перевірки.
2. Публічний комплект: ім’я/канонічний URL власника, повний узгоджений LICENSE, Перевірений локальний owner-review архів уже містить HTML+UA/EN інструкції+приклади+notices+checksums. Ще потрібні public release review та відкриття на чистій машині. Історичні QA `.txt` містять локальні шляхи й уривки старих stacktraces: не включати їх або резерви в pack; перед public push окремо перевірити історію. Нічого з історії/резервів автоматично не видаляємо. GitHub release/push потребує окремого завдання.

Для **підтвердженого автоматичного підбору реальної установки** потрібен окремий engineering етап: manufacturer coefficients/connectors/ampacity references/derating/coordination та первинні нормативні джерела. Терміни невідомі до отримання даних. UNKNOWN не закривається позитивним software test. Full UA/CZ, parallel cables, optimizers, BESS, CAD/GIS та економіка не входять у цю просту альфу.

## Перевірки та зауваження економних агентів

Три незалежні bounded review виконували агенти gpt-6-luna, доступні через Codex, над локальними файлами. Це не локально встановлені мовні моделі. Знайдено й виправлено reset без захисту та Markdown injection; окремий review атрибуції уточнив надмірну тестову assertion, яка помилково забороняла навіть безпечний plain text. Під час інтеграції ручного редактора також усунуто silent remap відсутніх targets. Деталі й свіжі PASS/FAIL/NOT_RUN — `IMPLEMENTATION_REPORT.md`.

## Додаткова adversarial перевірка

Десять економних tester agents завершили111 recorded observations;8 behavior failures зведено до 3 confirmed groups й виправлено. JSON-чернетки тепер захищені нарівні з native формою; старий asyncimport не перезаписує новішу роботу; числове переповнення відхиляється явно. Fresh check164 unit / 30 CLI / 10 manifest та85 browser checks dev/file PASS. Повний журнал дій, harness corrections, обмеження й NOT_RUN — [ADVERSARIAL_TEST_REPORT.md](ADVERSARIAL_TEST_REPORT.md). Це не замінює пілот/інші браузери/первинні engineering sources і не знімає два finishing stages вище.

## Локальний комплект власника

`pnpm review:pack` збирає автономний HTML і створює новий ZIP у ignored `.qa/review-packs/`. Копіюються лише 9 дозволених вихідних файлів; разом із REVIEW_ONLY, manifest та checksums у ZIP12файлів. Резерви/QA/Git/історія не копіюються. `pnpm review:verify <папка>` перевіряє розпакований комплект; `pnpm test:review-pack` створює й перевіряє новий ZIP, відкриває його offline у fresh Chrome context. Потрібні zip/unzip CLI для розробника; кінцевому користувачу достатньо HTML/браузера.

Fresh full check178unit/17files,30CLI,10manifest PASS; 8archive/offline checks PASS. Чисту іншу машину та зовнішній пілот не перевірено. INTERNAL OWNER REVIEW ONLY — це не public release; LICENSE/identity лишилися pending. Інструкції: QUICK_START_UA.md і QUICK_START_EN.md.
