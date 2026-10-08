# Каталог exact SKU: перевірені поля, явні прогалини

Перевірено 2026-10-08. `VERIFIED` у source означає звірку наведених полів із конкретним джерелом, не сертифікацію виробу, проєкту або національної відповідності. Обидва модулі — різні power-bin SKU одного виробника; обидва інвертори — різні SKU SMA.

| SKU | Офіційне джерело | Підтверджені поля / одиниці |
|---|---|---|
| Trina TSM-435NEG9R.28 | [TSM_EN_2023_A, p.2](https://static.trinasolar.com/sites/default/files/NEG9R.28_EN.pdf) | STC 435 W; Voc 51.8 V; Vmp 43.6 V; Isc 10.64 A; Imp 9.99 A |
| Trina TSM-440NEG9R.28 | Те саме, окрема колонка 440 W | Voc 52.2 V; Vmp 44.0 V; Isc 10.67 A; Imp 10.01 A |
| SMA STP8.0-3AV-40 | [Operating manual DC/AC table](https://manuals.sma.de/STP8-10-3AV-40/en-US/4176094859.html) | 8000 W AC; 15000 Wp array; 1000 V DC; MPP 260–800 V |
| SMA STP10.0-3AV-40 | Те саме, окрема колонка 10.0 | 10000 W AC; 15000 Wp array; 1000 V DC; MPP 320–800 V |

Trina обох SKU: βVoc −0.24 %/°C; αIsc +0.04 %/°C; γPmax −0.30 %/°C (чисельно тотожно %/K для різниці температур); system voltage 1500 V DC; maximum series fuse 20 A. Datasheet SHA-256: `bb1712d2e3656097085c551b6437cda4071b7e38cd8ba0301bc5824070e8b7fd`. Звірено також візуально по таблиці p.2.

SMA: trackers A/B 20/12 A operating, 30/18 A short-circuit; 2/1 physical input pairs за [DC connection requirements](https://manuals.sma.de/STP8-10-3AV-40/en-US/391157771.html). Застосовується лише normal independent A/B operation. Three-phase 230/400 V — явно вибрана конфігурація прикладів. Не підмінювати MPP minimum значеннями minimum input 125 V або start 175 V.

UNKNOWN: βVmp обох модулів не наведено; генератор блокується за SPEC-03. Reverse-current withstand не наведено; 20 A maximum series fuse не є його заміною. Окремі operating/Isc ratings кожного фізичного конектора SMA в перевірених sections не наведено; A/B tracker ratings не діляться на кількість конекторів. Початкове UNKNOWN збережено в input JSON, UI та report.

`data/equipment/verified/` містить manufacturer records з units, notes, source locators/date/revision. Старі `data/equipment/modules.json`, `inverters.json`, `cables.json` та student examples залишаються SYNTHETIC. Приклади `trina-435-sma-8.json` і `trina-440-sma-10.json` містять real SKU, явно навчальні site/policy та порожній cable catalog; вони валідні за схемою, але engineering UNKNOWN (CLI exit 3), а не придатні до будівництва конфігурації.

Редагування параметрів обладнання через UI переводить sources у USER_INPUT і прибирає дату звірки. JSON є користувацьким введенням; verification не є цифровим підписом і не доводить справжність імпортованого довільного файлу.

Формули на цьому етапі не змінено. Незалежний тест cold Voc: 52.2 × [1 + (−0.24/100) × (−20 − 25)] = 57.8376 V. `tests/integration/equipment.test.ts`, `scripts/cli-smoke.mjs` та `scripts/equipment-browser-smoke.mjs` перевіряють schema → core → CLI/UI → report і save/load.
