# SPD: номінальні перевірки окремого кандидата

Перевірено 2026-10-08. [Phoenix Contact VAL-MS 1000DC-PV/2+V, 2800628](https://www.phoenixcontact.com/en-in/products/pv-arrester-val-ms-1000dc-pv2v-2800628): повна збірка T2 за IEC/EN, Ucpv1170 V, UocSTC975 V, Iscpv2000 A, Up3.7 kV, In15 kA8/20 μs, Imax40 kA8/20 μs. Iimp10/350 не наведено →UNKNOWN. Не використано UL50 kA або585 V змінного картриджа замість параметрів цієї збірки.

`data/equipment/verified/spds.json` містить одиниці, дату й locator. `packages/core/src/spd.ts` — чистий контракт перевірок; `calculateProject` застосовує його до кожного зайнятого inverter/MPPT. Спільний pipeline CLI/UI/report зберігає незалежні findings. Приклад `spd-source-limited.json` навмисно UNKNOWN, навіть з LPS=true.

Порівнюються cold Voc з Ucpv, окремо STC Voc з UocSTC, factored array current + повний backfeed з Iscpv, device Up з відомим withstand обладнання, відповідні форми імпульсу та явно заданий required type/DC system. Будь-яка відома nonnegative array/inverter частина струму, яка вже перевищує Iscpv, дає FAIL за невідомого backfeed; нижча частина не доводить PASS. Числовий тест:1100≤1170 V PASS, але1000>975 V FAIL. LPS boolean не вибирає T1/T2, а In/Imax8/20 не підмінюють Iimp10/350.

Потреби installation context передаються через `spd_context`: earthing/DC system, LPS/separation, required type/impulse levels, equipment withstand, connection length, coordination basis та sources. [Manufacturer selection guide](https://www.phoenixcontact.com/en-us/technologies/surge-protection-technology/selection-guide-surge-protection) допомагає визначити потрібні дані, але не замінює чинні нормативні тексти UA/CZ.

Завжди залишається SPD_SCOPE UNKNOWN: lead voltage/індуктивність, routing/зони, координація ступенів та upstream protection, earthing і застосовні національні вимоги. Це завершений модуль необхідних номінальних перевірок кандидата, а повний вибір/розміщення SPD — PARTIAL/BLOCKED. Не заявляється нормативна відповідність або готовий захист.
