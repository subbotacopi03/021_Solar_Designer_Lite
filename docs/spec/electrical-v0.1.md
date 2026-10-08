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

## Allocation search extension · 2026-10-08

Voltage/current formulas SPEC-01…10 unchanged. Greedy whole-MPPT plan remains the fast incumbent. If it leaves modules and equipment data is complete, search alternative whole-MPPT groups. Each occupied tracker has one plane, one integer string length N and k equal strings; 1≤k≤parallelCapacity, Nmin≤N≤Nmax. Count per plane cannot exceed demand; per-inverter installed STC watts cannot exceed declared max DC watts. Unknown max power still yields UNKNOWN validation, never a fabricated rating.

Objective: maximize assigned modules; tie-break fewer strings among examined alternatives, then deterministic traversal order. This is not a claim of global optimality or minimum-string proof. If all modules are assigned the primary objective meets its known upper bound; search may stop before finding another equal-count plan. Existing complete greedy plans are preserved.

Recovery budget: at most 24 slots, 8 planes, 2000 requested modules and 30000 visited search nodes. Larger cases retain greedy and emit ALLOCATION_SEARCH_LIMIT WARN. Node limit retains best explored valid incumbent and emits the same WARN. Remaining modules are a failed proposed allocation, not proof of infeasibility. No time-based/random decisions. Memoization includes slot index, remaining counts, inverter quotas and best row count; losing a plane or power dimension would be invalid pruning.

Independent witness: site Tmin=Tmax=25°C, Voc=50 V, Vmp=42 V; tracker A 252–798 V → N6..19, tracker B252–420V → N6..10, one physical input each. E10/W19 fits E10→B/W19→A; greedy E10→A/W10→B leaves9. Two inverters with 16965 W cap each, E20/W38 fits the same per-inverter witness (29×585=16965 W). Manual witnesses must pass exactly the same voltage/current/input/power checks.

Manual diagnostic independence: a missing βVmp blocks Vmp-based limits and automatic planning but must not erase computable Voc(Tmin). A manual 20-module synthetic string has 20×56.3=1126 V>1100 V and must FAIL Voc even with βVmp UNKNOWN. Missing inputs attach to the specific check, not all checks indiscriminately.

## Cable evidence extension · 2026-10-08

A manufacturer record may lack r20/α/X/Iz: these fields remain null and must not be replaced by generic copper/aluminium values. Missing r20 or α produces UNKNOWN R(T) and voltage drop. The original explicit aggregate factor/basis remains supported for legacy teaching inputs.

New manufacturer ampacity profiles declare installation method, reference ambient/conductor temperatures, reference grouping count and sources. Actual method, ambient temperature and grouped-circuit count are explicit circuit inputs. A profile does not apply to a different method merely because the cable itself permits that installation.

Structured derating evidence has TEMPERATURE, GROUPING and INSTALLATION factors, each with value, basis and sources. All factors are explicit, including 1. Product k=kt×kg×ki replaces aggregate in this path; if aggregate is also supplied, it must agree within1e-9. Missing/unverified source or applicability inputs means UNKNOWN selection. Reference profile conductor temperature must be known and consistent with the allowed continuous rating; the calculation's conductor design temperature remains the R(T) input, never ambient air temperature.

Independent arithmetic: 55 A×0.8×0.7×1=30.8 A; R20=5.09 Ω/km, explicitly supplied α0.00393/°C at70°C gives6.090185 Ω/km. That α is a synthetic test input, not attributed to Nexans. Manufacturer source does not state α, X or grouping/ambient factors; these remain UNKNOWN. Single-cable outdoors60°C ampacity cannot be applied automatically to conduits or grouped cables. Parallel cable selection remains disabled.
