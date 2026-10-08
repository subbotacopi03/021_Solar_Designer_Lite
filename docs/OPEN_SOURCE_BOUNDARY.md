# Межа відкритого й комерційного

OpenPV candidate scope: прозорі електричні формули, типи, strict schemas, input validation, findings, synthetic exercises, базовий electrical BOM і простий report. Нова реалізація не містить комерційних розрахунків чи raw production source.

Solar Suite private: економіка, тарифи, ціни, ranking, procurement, клієнтські дані, document templates, CAD/GIS, production workflow, приватні AI workflows, adapters та внутрішні міжпродуктові контракти.

Ліцензія — MPL-2.0 (рішення власника 2026-10-08): змінені файли OpenPV лишаються відкритими, а приватні продукти можуть використовувати ядро як окремий компонент, не відкриваючи власний код. Публічне ім’я правовласника та URL ще потрібні перед public release. Жодна публікація GitHub/npm у цьому проході не виконана.

Контроль: strict schemas reject unknown price/customer properties. Це не DLP-фільтр довільного тексту, тому user-provided name/basis/source fields треба перевіряти перед публікацією прикладів.
