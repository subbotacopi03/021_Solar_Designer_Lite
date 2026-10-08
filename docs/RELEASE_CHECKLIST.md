# Перед публічною preliminary alpha

Актуальна оцінка — USER_READINESS.md. Публікація ще не виконувалась; цей перелік не надає дозвіл на push/release.

1. Підтвердити публічне ім’я правовласника, канонічний URL і заповнити `data/attribution.json`. Встановити повний узгоджений LICENSE та copyright/SPDX notices. Поточний UNLICENSED не дозволяє public redistribution.
2. Зберегти author/source credits у UI, standalone та звітах, перевірити citation з реальними metadata. Не обіцяти автоматичного сповіщення про кожне використання або незнімного кредиту.
3. Пройти простий real manual кейс без JSON-редагування; інструкція має пояснювати відомі перевірки, UNKNOWN і непідтверджений монтажний висновок.
4. Пройти `pnpm check`, browser dev/file smoke, cross-browser/OS та novice/independent-engineer pilot. Фіксувати NOT_RUN окремо; lint script зараз відсутній.
5. Локальний owner-review allowlist pack уже реалізовано й перевірено (`review:pack`, `test:review-pack`), UA/EN guides готові. Для публічної версії переглянути права/metadata та clean allowlist download pack: HTML, коротка інструкція, обрані приклади, LICENSE/ATTRIBUTION/third-party notices, версія й SHA-256. Відкрити pack на чистій машині без Node/інтернету.
6. Перевірити Git-історію й historical QA logs перед public push. Не поширювати резерви, `.qa`, stacktrace excerpts старого workspace, абсолютні локальні шляхи чи неперевірені файли. Резерви зберегти локально; не переписувати історію без окремого рішення.
7. Описати підтримуваний scope, source gaps та канал issue reports, підготувати changelog. Лише за окремим завданням власника виконувати public push/release.

Повний manufacturer installation/coordination pack та підтвердження UA/CZ залишаються окремими engineering етапами. Heterogeneous topology, optimizers, паралельні кабелі та npm package publishing не є обов’язковими для чітко обмеженої автономної alpha; не заявляти їх підтримку.
