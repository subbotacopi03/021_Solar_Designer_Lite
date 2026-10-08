# OpenPV · Solar Designer Lite

Працюючий стартовий комплект v0.1: PV electrical core, runtime schema, CLI та локальний калькулятор українською й англійською. Це попередній розрахунок, а не погоджена проєктна документація.

## Запуск

Потрібні Node 24 та pnpm 11.25.0.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm dev
```

Для швидкого перегляду без інсталяції відкрийте `Solar_Designer_Lite.html` подвійним кліком. Для розробки відкрийте локальну адресу, яку надрукує Vite. Застосунок працює без серверної БД; введення зберігається у localStorage цього браузера. Перенесення між пристроями — через JSON.

## CLI

```bash
pnpm build
pnpm cli validate data/examples/student-50kw.json
pnpm cli calculate data/examples/student-50kw.json --out result.json
pnpm cli report data/examples/student-50kw.json --out report.md --lang uk
```

CLI exit codes: 0 — PASS/WARN або валідна схема; 1 — FAIL; 2 — помилка вводу/JSON; 3 — UNKNOWN. Валідна схема не означає придатну електричну конфігурацію. Демонстраційний проєкт повертає UNKNOWN через незавершену перевірку захисту/SPD.

## Що працює

| Компонент | Реалізація |
|---|---|
| `packages/schema` | Zod-схеми проєкту, PV модуля, інвертора, MPPT, кабелю, політики й findings |
| `packages/core` | Voc/Vmp(T), string window, генератор і ручний план, MPPT/input limits, DC/AC, AC current, R(T), ΔU, попередній cable selection |
| `packages/cli` | validate, calculate, report; детермінований JSON / Markdown |
| `apps/designer-lite` | 8 розділів, UA/EN, save/load, редактор JSON, manual string plan, Student Mode, BOM, звіт і друк/PDF |
| `tests` | Golden arithmetic, SPEC differential regressions, project workflow та allocation invariants |
| `scripts` | Formula manifest change barrier і перевірки браузера |

## Межі v0.1

- Один тип модуля та інвертора на проєкт; інвертори мають однакову конфігурацію MPPT.
- Кожна площина має власні MPPT; паралельні стрінги одного MPPT однакової довжини. Один стрінг на фізичний вхід; Y connectors не підтримуються.
- Генератор — детермінована евристика з відновленням малого залишку й обмеженим пошуком альтернатив. Не доводить оптимальність або неможливість альтернативного плану. Ручний план проходить ті самі перевірки.
- AC — окремий multicore feeder кожного інвертора з власними умовами траси; DC — два одножильні провідники кожного стрінгу. Не загальний feeder станції. Довжина — в один бік.
- Derating вводиться явно з поясненням; автоматичні таблиці UA/CZ не затверджені. Каталог прикладу синтетичний, його Iz не можна використовувати для випуску документації.
- Fuse та isolator — кандидати. Declared inverter backfeed та nominal fuse/SPD checks реалізовано окремо; повний захист, RCD, time-current curves, adiabatic withstand, SPD topology/LPS/заземлення не завершені. BESS та economics поза scope.
- Оптимізатори мають схему даних, але topology engine відсутній: UNKNOWN, а не звичайна string перевірка.
- PDF створюється через друк браузера. Серверний PDF/DOCX, desktop installer, PWA та npm/PyPI publish відсутні.

## Статус публікації

Комплект не опубліковано. `UNLICENSED` — тимчасовий стан до рішення власника про ліцензію та права на reuse. Розрахункові модулі спираються на SPEC та описані арифметичні кейси. До публічного push потрібен окремий перегляд історії та історичних diagnostic logs; див. [готовність для користувача](docs/USER_READINESS.md). Резервні каталоги й журнали не включати до download pack.

## Авторство та простий ручний кейс

Походження програми показується у footer, «Про проєкт» та Markdown-звітах. Публічне ім’я власника й канонічний URL очікують підтвердження у `data/attribution.json`; механізм і межі — [ATTRIBUTION.md](ATTRIBUTION.md). Повні повідомлення сторонніх компонентів доступні в програмі й `THIRD_PARTY_NOTICES.txt`. Відстеження запусків відсутнє.

Завантажте `data/examples/trina435-manual24.json`: два ручні стрінги по12 exact Trina модулів на MPPT A/B SMA. Редактор має звичайні поля й кнопки; JSON лишається додатковим варіантом. 24/24 модулів, відомий cold-Voc PASS, загальний UNKNOWN через відсутні manufacturer inputs. Новий приклад запитує підтвердження, попередній застосований проєкт можна відновити; JSON лишається переносною резервною копією.

Читайте `docs/START_HERE_UA.md`, `docs/spec/electrical-v0.1.md`, `docs/SOURCE_PROVENANCE.md`, `docs/NEXT_AI_HANDOFF.md` і `docs/IMPLEMENTATION_REPORT.md`.

## Розвиток 2026-10-08

Додано source-limited exact-SKU каталог Trina/SMA, Nexans/Eaton/Phoenix candidates, bounded allocation recovery, applicability derating та незалежні nominal protection/SPD checks. Вибір в UI та приклади `trina-435-sma-8.json` / `trina-440-sma-10.json`. Джерела й UNKNOWN: [docs/EQUIPMENT_CATALOG.md](docs/EQUIPMENT_CATALOG.md). Поточний план і докази: [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md), [docs/IMPLEMENTATION_REPORT.md](docs/IMPLEMENTATION_REPORT.md).

DC-роз’єднувач: додано ABB OTDC32F2 із явним1000V/20A/DC-21B профілем, scope/category/wiring controls та незалежними nominal checks. Повна installation/coordination UNKNOWN: [DC_SWITCH_EVIDENCE.md](docs/DC_SWITCH_EVIDENCE.md).

Локальна adversarial перевірка десятьма економними tester agents, знайдені дефекти та виконані виправлення: [журнал перевірок](docs/ADVERSARIAL_TEST_REPORT.md). Регресії втрати чернеток, порядку імпортів і числового overflow: `pnpm test:adversarial:browser` (потребує Playwright browser або `OPENPV_CHROMIUM_EXECUTABLE`; optional `OPENPV_TEST_URL`).

## Локальний комплект для перегляду власником

Короткі інструкції: [українська](docs/QUICK_START_UA.md), [English](docs/QUICK_START_EN.md). `pnpm review:pack` збирає HTML і створює новий allowlist ZIP у ignored `.qa/review-packs/`; для розробника потрібен `zip`. Комплект містить програму, два приклади, UA/EN guides, наявні legal notices, manifest та SHA-256, без резервів/QA/Git. Це **INTERNAL OWNER REVIEW ONLY**, не публічний реліз і не зміна LICENSE.

`pnpm review:verify <розпакована-папка-в-PROJECT_ROOT>` перевіряє склад/розміри/суми. `OPENPV_CHROMIUM_EXECUTABLE=<Chrome> pnpm test:review-pack` додатково перевіряє ZIP через `unzip` та реальний offline import/save/report у fresh browser context. Build/tests не підмінюються checksum-перевіркою; звичайному користувачу Node/zip не потрібні.
