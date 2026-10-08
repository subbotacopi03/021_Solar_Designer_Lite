# DC switch-disconnector: профіль робочих номіналів

2026-10-08. [Офіційний ABB каталог1SCC301022C0201 Rev23-08](https://library.e.abb.com/public/579fddc18eb04ee49c7f8755470aafbd/Switch-disconnectors%20OTDC_1SCC301022C0201_23-08.pdf), PDF p22 technical data, p24 order code, p27 wiring. Завантажено з manufacturer host та звірено таблицю/схеми візуально. SHA-256 `f96d19251871a22ba99308ea9bcddcce36dd293a12b8dd404660d0e170cd3b70`. Web-reader не отримав PDF, але пряме завантаження пройшло; third-party distributors не використано як evidence.

Exact candidate: ABB OTDC32F2 /1SCA121456R1001, один circuit/два poles, DC-21B при1000V →Ie20A. Circuits2a/2b, two-pole/four-wire/single-circuit diagrams. Ui1250V у таблиці має умови pollutiondegree2/external handle; приdegree3 Ui1000V. Ith45A має умови open air або enclosure40°C із10mm² Cu; enclosure60°C →32A. Ці Ui/Ith не замінюють Ue/Ie. Technical660V та ordering600V entries не змішано: імпортовано лише1000V profile. Icw0.8kA/1s згадано в notes, але fault-specific withstand ще не обчислюється.

`data/equipment/verified/dc-switches.json` зберігає ці номінальні поля, одиниці, source/date/hash і умови в notes. VERIFIED стосується звірки цих полів, не цілого виробу/монтажу. `packages/core/src/dc-switch.ts` — pure necessary-check module. `dc_switch_context` явно визначає profile/category/diagram/poles/scope та джерела вимог. Відсутній вибір не підставляється автоматично.

Тести:19×56.3=1069.7V>Ue1000V →FAIL, навіть Ui1250V.25A>Ie20A →FAIL, навіть Ith45A. Explicit DC-PV2 проти DC-21B →FAIL; category hierarchy не вигадано. Diagram5a або4poles не відповідають вибраному profile. MPPT/INVERTER switching unsupported →UNKNOWN, а не одна-string current як aggregate. Cable protective In не замінюється switch Ie.

Приклади: `dc-switch-source-limited.json` має synthetic module/site/policy і manual8×15 (844.5V cold), nominal checks можуть PASS, але requirements/installation/coordination UNKNOWN. `dc-switch-voltage-fail.json` manual19 має відомий voltage FAIL. UI має explicit profile/scope/category/diagram/poles; save/load/UA/EN та report зберігають source. JSON equipment edit скидає VERIFIED/date/hash.

Завжди DC_SWITCH_SCOPE UNKNOWN: actual ambient/enclosure/terminals/physical wiring, fault Icw/Icm/time, reverse-current switching, upstream coordination та чинні національні вимоги. Потрібну категорію не вибрано як нормативне правило. Пристрій не є overcurrent protection. Цей контракт не затверджує місце/необхідність/кількість роз’єднувачів у реальній СЕС; BOM позначає лише unapproved per-string candidates.

Independent review fix: missing/unsupported scope зберігає UNKNOWN topology, але вже перевищена single-string lower bound Voc/Ib дає FAIL. Within-limit single-string values не дають PASS для невідомої aggregate topology. Три regression cases: scope null/MPPT/INVERTER з1069.7V та25A.
