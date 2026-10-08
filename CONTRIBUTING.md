# Contributions · draft

До відкриття репозиторію внески координує власник. Після вибору ліцензії цей файл можна адаптувати для public contributors.

1. Equipment record: exact SKU, manufacturer datasheet URL/date, одиниці, signed temperature coefficients, MPPT та input limits, verification state; без цін.
2. Tests: незалежний ручний розрахунок з формулою й tolerance. Старий результат сам по собі не є oracle.
3. Examples: synthetic project, no addresses, customers, credentials or tariffs.
4. Localization: українська/англійська, без зміни позначень SI та findings IDs.
5. Core changes: spec → tests → implementation → manifest review. Не оновлювати hash, щоб приховати неперевірену формулу.
6. Run `pnpm check`. Pull request має описувати поведінку, валідацію та обмеження.

Good-first-issue candidates: окремий перевірений module SKU; inverter MPPT record; translation key; regression fixture; навчальна вправа; documentation correction. Не давати новачкам непереглянуті norm policy changes.
