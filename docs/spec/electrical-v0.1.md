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

## String protection extension · 2026-10-08

For a worst-case faulted string on one tracker, array reverse contribution=(k−1)×IscSTC×explicit policy isc_factor; add the full explicitly declared maximum inverter backfeed, never divide it across physical inputs without manufacturer proof. With k=1 the array contribution is0 without needing an Isc factor. Missing inverter backfeed makes the combined requirement UNKNOWN even with one string. Zero total reverse current needs no reverse-current fuse for this limited assessment; any positive current needs declared module reverse withstand before deciding. Maximum series fuse remains a separate upper bound for candidate rating.

Independent cases:3 parallel strings,14 A STC, factor1.25, inverter5 A →2×14×1.25+5=40 A; withstand30 A requires a fuse. Single string with unknown backfeed UNKNOWN; same string with verified0 A backfeed has0 A reverse contribution. Datasheet SMA STP8/10-3AV-40 explicitly declares maximum reverse current into array0 A; synthetic examples declare0 only as a teaching assumption.

A supplied gPV fuse candidate is checked independently for rated DC voltage≥VocCold, rated current inside explicit policy/module series-fuse bounds, and breaking capacity≥total prospective reverse fault current. Missing ratings remain UNKNOWN. Source provenance remains attached. These nominal checks do not establish time-current coordination, low-fault clearing, total clearing energy, holder/pole/application compatibility or regulatory compliance; PROTECTION_SCOPE remains UNKNOWN. Pre-arcing I²t must not be presented as total-clearing I²t.

## SPD candidate module · 2026-10-08

Separate pure SPD module performs necessary nominal checks, not topology selection or regulatory approval. Each occupied inverter/MPPT is assessed independently; trackers are never combined. Device Ucpv is compared with known string VocCold, published maximum UocSTC with actual string VocSTC, Iscpv with explicit design short-circuit current plus full declared inverter backfeed, and device Up with declared equipment impulse withstand as a necessary device-only check (lead voltage not modelled). Device In8/20 and Iimp10/350 cannot be substituted for one another.

Required SPD type must be supplied with requirement sources. LPS presence alone never choosesT1/T2; earthing, DC system, separation, lead length and manufacturer coordination remain explicit. Missing context/source yields UNKNOWN. Even with nominal checks PASS, SPD_SCOPE remains UNKNOWN pending complete lead/routing/coordinated installation assessment and applicable standard verification. T1/T2 combination can satisfy an explicitly statedT1 orT2 nominal type, butT2 cannot satisfyT1.

Manufacturer Phoenix Contact VAL-MS1000DC-PV/2+V,2800628: T2 (IEC/EN family, not UL1CA), Ucpv1170 V, UocSTC≤975 V, Iscpv2000 A (IEC, not UL50 kA SCCR), Up≤3.7 kV, In15 kA8/20, Imax40 kA8/20. Iimp10/350 UNKNOWN. Use the complete assembly, not a replacement plug rated585 V. Independent diagnostic: string UocSTC1000 V and VocCold1100 V passes Ucpv1170 but FAILs the distinct975 V STC limit. No name-based1000 V substitution.

Primary product data and installation guide checked2026-10-08; manufacturer guide is not the full national standard. National requirement source not independently verified remains UNKNOWN.

### Review regressions: independence and evidence applicability (2026-10-08)

A supplied fuse's nominal current must be checked independently against each known module maximum and policy bound before requirement-related returns. DC cable In uses that supplied device rating even if protection necessity is false/unknown. Missing total backfeed remains UNKNOWN, but a nonnegative known array contribution already above fuse breaking capacity or SPD Iscpv proves FAIL; a lower bound within capacity cannot prove PASS.

Structured derating must bind factors to a cable ID, declared reference ampacity/profile and exact actual installation method, ambient/conductor temperatures and circuit count. Missing or changed applicability gives UNKNOWN and prevents selection, without inventing replacement factors. Manual JSON edits of equipment invalidate verified attribution just like form edits; file imports retain explicitly supplied evidence.

Lower-bound clarification: sum every known nonnegative array/inverter contribution; an unknown contribution is not assigned zero in the exact total. Either known contribution may independently prove an overcurrent FAIL. Form validation errors must restore the prior project view and display a message without uncaught exceptions.

## DC switch-disconnector candidate extension · 2026-10-08

A DC switch is assessed against one explicitly selected manufacturer operational profile: voltage Ue, Ie, utilization category, pole count, circuit count and permitted wiring diagram identifiers. Ui and Ith are recorded separately and NEVER substitute Ue/Ie. No interpolation, automatic category hierarchy or inference from model name. Missing profile/context →UNKNOWN; a known independent voltage/current/category/wiring mismatch →FAIL.

This first contract supports a separately installed candidate per string only. MPPT/array switching is unsupported (UNKNOWN), with no aggregate current inferred from one-string Ib. Design current is explicit policy Isc factor × module STC Isc, as in the existing preliminary pipeline. Unknown factors are not replaced. Installation/category requirements need sources; choosing a diagram ID does not establish correct physical wiring. Ambient/enclosure/terminal/temperature suitability, short-circuit making/withstand duration, reverse-current switching, upstream coordination and national requirements remain DC_SWITCH_SCOPE UNKNOWN. A switch is not an overcurrent protective device and its Ie must NOT replace fuse In in cable sizing.

ABB catalog1SCC301022C0201 Rev23-08, PDF pp22/24/27: OTDC32F2 /1SCA121456R1001, one circuit/two poles, DC-21B at1000V →20A; wiring2a/2b. Ith45A (open/40°C enclosure) and Ui1250V at pollutiondegree2 are different ratings. Import only this1000V profile; ordering600V versus technical660V references are not combined. Independent cases:19×56.3=1069.7V exceeds1000V;25A exceeds20A even though25<45; explicit DC-PV2 is not covered by this DC-21B profile. These are necessary checks, never a full suitability/compliance verdict.

DC-switch review clarification: unknown/unsupported switch placement must not erase a known single-string demand already above the selected profile's Ue/Ie. Such a single-string contribution is a lower bound for the proposed array/combiner circuit and may prove FAIL only. Within-limit values cannot prove PASS for unknown/unsupported topology. The exact aggregate remains unknown; no interpolation or aggregate-current default is introduced.

## Per-feeder cable route extension · 2026-10-08

Project.dc/ac remain explicitly entered common circuit inputs for backward compatibility. Optional dc_routes is an array of {target: complete StringConfiguration, circuit: CircuitInput}; optional ac_routes is an array of {inverter: integer1-based, circuit: CircuitInput}. Target IDs/inverter indices must be unique within their array. Overrides replace the ENTIRE common circuit input; null or absent override fields remain UNKNOWN, never filled from common inputs. The UI may copy the displayed common input only after an explicit user action.

A DC override applies only when target id/inverter/mppt_id/plane_id/modules matches the current string exactly. Same ID with changed allocation becomes STALE_OVERRIDE, uses an empty/unknown circuit and yields UNKNOWN. Missing target after allocation or reduced inverter count yields ROUTE_ORPHAN UNKNOWN; no orphan data is reused on another feeder. User can explicitly rebind a stale override or remove it to return to common inputs. Installation/derating applicability remains checked against the resolved route conditions.

Each inverter AC feeder is sized independently at the same inverter output current; no aggregate plant feeder or parallel-run design is introduced. Result.ac_lines enumerates inverter/circuit_input/input_origin/cable; result.dc_lines gains circuit_input/input_origin. Legacy result.ac aliases the first inverter feeder ONLY; consumers should use ac_lines for multi-inverter design. Common inputs preserve former electrical results when no overrides exist.

Cable BOM aggregates only selected routes with known lengths: two separate conductors per DC string (2×one-way length) and one multicore cable per inverter (one-way length). Unknown/unselected routes are counted as omitted and produce CABLE_BOM_SCOPE UNKNOWN; totals are explicitly partial, never fallback zero as a complete quantity. Example: DC routes10m and30m =>80m conductors; AC routes20m and80m =>100m feeder cable, potentially different sections. Thermal/voltage-drop equations SPEC-01…10 unchanged.

Review clarification: a DC override also requires its target ID to occur exactly once in the current plan. Duplicate manual IDs retain the existing engineering FAIL, and ambiguous route bindings become AMBIGUOUS_OVERRIDE/ROUTE_AMBIGUOUS UNKNOWN with empty circuit inputs; no cable quantities may be attributed to either duplicate via the saved override. Fix the plan identity before rebind; a rebind cannot resolve duplicate IDs.

## Числова представимість результату

Schema finite inputs не гарантують finite похідні значення: наприклад, 70 200 W / 10⁻³⁰⁸ W = 7.02×10³¹¹, понад діапазон JavaScript Number. `calculateProject` має відхиляти результат з NaN/±Infinity явною `CalculationRangeError` із шляхом поля до повернення/серіалізації. CLI calculate/report: exit2, без часткового запису; UI: зберегти попередній застосований проєкт та чернетку й показати помилку. Невиконуваний autosave показує навчальний приклад із попередженням, не перезаписуючи збережений JSON до нової дії користувача.

Це software range guard, не нові фізичні limits або формули. UNKNOWN/null для відсутніх даних залишаються; Infinity не можна мовчки серіалізувати як такий null. Проміжні sentinel Infinity у bounded search не є exported engineering result. Guard не доводить точності floating-point, не виявляє всі underflow/precision-loss випадки і не підтверджує інженерну придатність великих finite значень.
