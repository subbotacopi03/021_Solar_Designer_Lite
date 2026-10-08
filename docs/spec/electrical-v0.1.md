# electrical-v0.1 · preliminary implementation specification

Version 0.1.0. Date: 2026-10-08. Це прийнята робоча специфікація для стартового комплекту, а не висновок про відповідність нормам UA/CZ.

| ID | Рішення | Реалізація |
|---|---|---|
| SPEC-01 | βVoc/βVmp < 0; αIsc > 0 | Schema rejects wrong signs; optional absent values remain absent |
| SPEC-02 | Tmin/Tmax без defaults | Nullable cell temperatures; unknown range blocks automatic plan |
| SPEC-03 | Без βVmp основний result UNKNOWN | `moduleVmpAt(..., true)` дає окрему APPROXIMATED_GAMMA_ALPHA; generator не використовує approximation |
| SPEC-04 | Isc та Imp мають окремі limits | MPPT та input limits; one string per physical input |
| SPEC-05 | R(Tconductor) | Explicit r20, alpha and conductor design temperature |
| SPEC-06 | AC ΔU із cosφ і X | Missing X/cosφ → UNKNOWN; no implicit X=0 |
| SPEC-07 | Ib ≤ In ≤ Iz, derating | Candidate coordination; I2 condition and full protection remain outside implemented scope |
| SPEC-08 | Без автоматичних паралельних кабелів | Single candidate per feeder; no automatic parallel-run fallback |
| SPEC-09 | DC/AC band — policy | Value calculated; no band → UNKNOWN acceptance |
| SPEC-10 | Pout AC не містить η | `I=Pout/(kUcosφ)` |

## Формули та одиниці

V(T) = VSTC × [1 + β/100 × (Tcell − 25 °C)]. β: %/°C. Результат: V. Приклад: 50 V × [1 + (−0.28/100)/°C × (−20 − 25) °C] = 56.3 V.

Nmin = ceil(VMPPT,min / Vmphot). Nmax = min(floor(min(VDC,max, Vsys,module)/VocCold), floor(VMPPT,max/VmpCold)). Відношення напруг безрозмірне; округлення дає цілі модулі. Приклад: floor(1100/56.3)=19.

IAC,3φ = PAC,out /(√3 × Uline × cosφ). IAC,1φ = PAC,out /(Uphase × cosφ). W/V=A. Приклад: 50 000 W /(√3 × 400 V × 0.95) = 75.96714 A.

R(T) = R20 × [1 + α × (Tconductor − 20 °C)]. α: 1/°C; R: Ω/km. Значення α є даними cable, не автоматичним припущенням для Al.

ΔUDC = 2 × L/1000 × I × R(T). ΔUAC,3φ = √3 × L/1000 × I × [R(T)cosφ + Xsinφ]. ΔUAC,1φ: той самий вираз із 2 замість √3. L: m в один бік, R/X: Ω/km. km × A × Ω/km = V. ΔU%=100 × ΔU/U.

Iz,derated = Iz,reference × ktotal. ktotal вводиться явно з basis; таблиці температури/групування не зашиті в core.

## Додаткові рішення

- Maximum series fuse rating не є maximum reverse current withstand. Автовисновок про fuse requirement на основі підміни цих полів заборонено. Для паралельних стрінгів потрібне declared reverse current withstand, а inverter backfeed вимагає окремої оцінки.
- Isc design factor застосовується до STC Isc як explicit policy. Температурна, irradiance і bifacial корекції Isc окремо не реалізовані; scope має це показувати.
- SPD не вибирається тільки за boolean «LPS present». Потрібні система заземлення, separation, координація та параметри пристроїв.
- Synthetic каталог з reference Iz використовується виключно як навчальна/тестова основа. Профілі UA/CZ відсутні до перевірки норм і manufacturer datasheets.
- Загальний статус має пріоритет FAIL → UNKNOWN → WARN → PASS. Scope UNKNOWN означає, що комплект не виконує повну перевірку захисту.
- Unknown data і unsupported optimizer topology блокують automatic allocation; manual plan не обходить перевірки.

## Первинні джерела та межі перевірки

Schneider Electric Electrical Installation Guide підтверджує структуру AC voltage drop з Rcosφ + Xsinφ та coordination Ib ≤ In ≤ Iz. Ці сторінки не замінюють текст національного стандарту.

https://www.electrical-installation.org/enwiki/Calculation_of_voltage_drop_in_steady_load_conditions

https://www.electrical-installation.org/enwiki/Practical_values_for_a_protective_scheme

Офіційний каталог IEC містить IEC 62548-1:2023+AMD1:2025 CSV. Повний платний текст не отримано; конкретні пункти та UA/CZ adoption не заявляються як перевірені.

https://webstore.iec.ch/en/publication/110893

Software references: https://zod.dev/packages/zod ; https://vite.dev/guide/ ; https://vitest.dev/guide/index.html . Installed dependency versions are in pnpm-lock.yaml.
