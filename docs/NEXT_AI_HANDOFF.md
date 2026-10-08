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
