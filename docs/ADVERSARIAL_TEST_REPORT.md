# Спроби зламати локальний OpenPV

2026-10-08. Перевірено десятьма окремими економними агентами `gpt-6-luna`, хвилями до трьох одночасно. Це моделі Codex, які працювали з локальним проєктом, а не встановлені локальні LLM. Основний агент самостійно відтворив підтверджені дефекти, виправив код і виконав інтеграційні перевірки.

Корінь: `021_Solar_Designer_Lite`. Резерв `_previous_workspace_20261008_160124` та вихідний ZIP збережені; повторного розпакування/переміщення не було. Базова версія `aed581eb69fa97a2937bdb1724056c7bdf58c704`; заморожений HTML SHA-256 `624d9a5b205dfd0f31750867d91962765b3e542474c995cdd3ea5dcde4ba7091`. Усі первинні перевірки виконувалися до змін коду. Тестери писали лише у власні ignored `.qa/adversarial/testerNN/`; особистий профіль браузера та інші проєкти не використовувалися.

## Що пробували

| Тестер | Напрямок | Записані спроби | Початково PASS / FAIL |
|---|---|---:|---:|
| 01 | Невалідний/великий JSON, типи, HTML-подібна назва, збереження попередніх даних | 10 | 10 / 0 |
| 02 | Рядки ручного плану, порожні/дробові/від’ємні модулі, duplicate ID, чернетки, Save/Apply/Auto | 22 | 20 / 2 |
| 03 | Reload, reset/restore, пошкоджений або недоступний localStorage, quota errors | 7 | 7 / 0 |
| 04 | Напруга, окремі Imp/Isc та physical inputs, потужність, площини, кількості й невідомі references | 15 | 15 / 0 |
| 05 | Окремі траси, stale/orphan/ambiguous overrides, частковий BOM, cable inspector | 11 | 11 / 0 |
| 06 | HTML/Markdown injection, URL schemes, звіти FAIL/UNKNOWN, notices/provenance | 3 | 3 / 0 |
| 07 | Клавіатура, фокус, діалог, labels, 320/390 px, збільшений текст, toast | 19 | 19 / 0 |
| 08 | Затриманий імпорт проти нового редагування/reset/вправи/пізнішого імпорту | 8 | 4 / 4 |
| 09 | Реальне/навчальне обладнання, ручний план після зміни SKU, зняття VERIFIED після редагування | 9 | 9 / 0 |
| 10 | Finite overflow, NaN/Infinity JSON, числовий рядок, bounded кількість модулів/інверторів | 7 | 5 / 2 |
| Разом | | **111** | **103 / 8** |

Це 111 записаних спроб/перевірок, включно з runtime assertions, а не 111 незалежних користувацьких історій чи оцінка відсотка покриття. Вісім невдалих поведінкових сценаріїв зведено до трьох груп дефектів. У тестера10 успішний probe відтворював дефект; тут його поведінковий результат позначено FAIL окремо від engineering status. Машиночитний журнал «дія → очікування → спостереження → результат»: [adversarial-test-results.json](adversarial-test-results.json). Повні сирі журнали, скрипти й скриншоти залишені локально у `.qa/adversarial/`, не включені в Git/public pack.

## Що виправлено

**A01 — втрата JSON-чернеток.** Advanced manual textarea і full-project textarea не мали dirty tracking: Save завантажував старий проєкт, а перехід стирав введення без запиту. Root також відтворив втрату invalid advanced draft після Apply й конфлікт двох редакторів. `apps/designer-lite/src/drafts.ts` тепер спільно відстежує native/manual/full JSON. Save просить застосувати зміни, navigation/lang/student/import/restore/unload захищають чернетки, Apply власної чернетки не питає про її відкидання. Apply іншого редактора потребує підтвердження; скасування зберігає обидва введення. Schema/calculation errors залишають чернетку на місці. Reset явно попереджає про втрату незастосованих змін. Чернетки не є окремим постійним backup: після явного discard вони зникають.

**A02 — застарілий імпорт перезаписував новішу роботу.** `await File.text()` у `main.ts` не перевіряв зміни між початком і завершенням читання. Додані номер останнього імпорту та ревізія застосованого проєкту. Після новішого commit/read selection старий callback і його помилка ігноруються. Звичайна навігація не скасовує актуальний імпорт. Це захист порядку дій в одній вкладці; координацію незалежних вкладок не реалізовано.

**A03 — переповнення серіалізувалося як відсутні дані.** При finite inputs `70200 / 1e-308` математично дорівнює `7.02e311`, а `2 × 1e308` — `2e308`; обидва перевищують діапазон Number. Базовий UI показував ∞ або JSON містив null. Підсумок при цьому був UNKNOWN/FAIL, тому хибного PASS не встановлено. Pure `packages/core/src/numerical-safety.ts` перевіряє повернений результат і кидає `CalculationRangeError` перед експортом. UI показує UA/EN помилку й зберігає попередній applied state та draft. Нерозраховуваний autosave відкриває навчальний приклад із попередженням, оригінальний JSON лишається у storage. CLI calculate/report повертає exit2 та не перезаписує existing output. Спочатку уточнено software-контракт специфікації й додано незалежні BigInt arithmetic тести; вони були RED. Формули та formula manifest не змінено. Guard не доводить floating-point точність, не ловить усі underflow/precision-loss випадки й не встановлює фізичну правдоподібність finite даних.

Регресійний браузерний suite: `scripts/adversarial-browser-smoke.mjs`, command `pnpm test:adversarial:browser`. Для системного Chrome задайте `OPENPV_CHROMIUM_EXECUTABLE`; `OPENPV_TEST_URL` дозволяє перевірити зібраний автономний HTML. Окремі сценарії використовують свіжі browser contexts.

## Перевірка після виправлень

| Перевірка | Результат |
|---|---|
| `pnpm check` | PASS: legal notices, typecheck, 164 tests/15 files, 10 manifest entries, build/standalone, schema export, 30 CLI scenarios |
| `pnpm test:browser` | PASS: 11 перевірок dev |
| `pnpm test:manual:browser` | PASS: 8 dev + 8 file |
| `pnpm test:safety:browser` | PASS: 5 dev + 5 file |
| `pnpm test:attribution:browser` | PASS: 7 dev + 7 file |
| `pnpm test:adversarial:browser` | PASS: 17 dev + 17 file |
| Незалежні повторні тести 02 / 08 / 10 | PASS: 20 editor + 7 import + 5 numerical browser probes; numerical unit 2/2 |
| Formatter та `git diff --check` | PASS на змінених source/test/JSON файлах; generated build не форматувався вручну |
| Lint | NOT_RUN: немає script/config |
| Windows/Edge/Safari/Firefox, screen reader, touch, справжній browser zoom | NOT_RUN: поточне середовище headless Chrome/macOS; збільшення тексту перевірено окремо |
| Інженерний/форумний пілот та нормативна відповідність | NOT_RUN: software tests цього не підтверджують |

Браузерна матриця містить **85 checks у 9 suite/target runs**, з повтореннями тих самих сценаріїв dev/file. Node24.19.0, pnpm11.25.0. Browser plugin недоступний, використано repository Playwright/system Chrome. Візуально переглянуто post-fix ручний план; відомий 124/120 over-allocation лишається FAIL. Raw RED/GREEN/check/matrix evidence — `.qa/adversarial/root/`; окремі postfix journals — `tester02/postfix`, `tester08/postfix`, `tester10/postfix`.

## Помилки тестових скриптів та межі

Первинне зауваження про duplicate-ID кабельні маршрути спиралося на `every([])`: selector повернув порожній список. Після виправлення вимагали рівно два DOM рядки й порівняли їх із розрахунком. UI показував saved 10 m із явним «не застосовується»; effective inputs були порожні, UNKNOWN та omitted BOM коректні. Це не продуктовий дефект; зауваження знято. У import/catalog probes також виправлено assertions щодо normalized whitespace, заголовка, labels та stale toast. Невдалий harness не зараховано успішною перевіркою продукту; останні відтворені результати збережено окремо від первинних diagnostic traces.

100 інверторів / 10 000 модулів обмежений probe завершився, але створив близько 18 MB результату; його не повторювали. Спостережені локальні часи не є benchmark і не гарантують швидкодію на слабких пристроях. Це bounded adversarial campaign, не вичерпний fuzz/security аудит і не гарантія відсутності помилок.

UNKNOWN/BLOCKED залишаються: βVmp/physical connector limits та installation/coordination data, повна protection/SPD/UA-CZ перевірка; owner identity/канонічний URL і public LICENSE. Немає push/release/зміни ліцензії. Наступний продуктовий етап — UA/EN missing-data panel із зрозумілими полями, одиницями, джерелами й impacted checks на основі existing core results, без автоматичного заповнення невідомих значень.
