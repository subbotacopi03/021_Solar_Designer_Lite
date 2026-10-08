# Межа відкритого й комерційного

OpenPV candidate scope: прозорі електричні формули, типи, strict schemas, input validation, findings, synthetic exercises, базовий electrical BOM і простий report. Нова реалізація не містить комерційних розрахунків чи raw production source.

Solar Suite private: економіка, тарифи, ціни, ranking, procurement, клієнтські дані, document templates, CAD/GIS, production workflow, приватні AI workflows, adapters та внутрішні міжпродуктові контракти.

Статус цього комплекту UNLICENSED. Рекомендовані раніше MPL-2.0 та Apache-2.0 лишаються кандидатами. Рішення про ліцензію та права власника потрібне перед public release; воно не заважає внутрішній розробці. Жодна публікація GitHub/npm у цьому проході не виконана.

Контроль: strict schemas reject unknown price/customer properties. Це не DLP-фільтр довільного тексту, тому user-provided name/basis/source fields треба перевіряти перед публікацією прикладів.
