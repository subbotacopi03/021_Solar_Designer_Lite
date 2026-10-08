# Навчальна СЕС · 120 модулів
Попередній електричний розрахунок · OpenPV 0.1.0
Status: UNKNOWN
Modules: 120/120
DC: 70.200 kWp · AC: 50.000 kW · DC/AC: 1.4040
Tmin cell: -20 °C · Tmax cell: 70 °C

## Стрінги
| ID | Inverter | MPPT | Plane | Modules |
|---|---:|---|---|---:|
| INV1-MPPT1-S1 | 1 | MPPT1 | south | 18 |
| INV1-MPPT2-S1 | 1 | MPPT2 | south | 17 |
| INV1-MPPT3-S1 | 1 | MPPT3 | south | 17 |
| INV1-MPPT4-S1 | 1 | MPPT4 | south | 17 |
| INV1-MPPT5-S1 | 1 | MPPT5 | south | 17 |
| INV1-MPPT6-S1 | 1 | MPPT6 | south | 17 |
| INV1-MPPT7-S1 | 1 | MPPT7 | south | 17 |

## Перевірки
- PASS · MODULE_ALLOCATION: 0 / 0 modules — Deterministic heuristic; a failed allocation is not proof that no other configuration exists
- PASS · COUNT:south: 120 / 120 modules — Requested plane count
- PASS · INV1:DC_POWER: 70200 / 75000 W — Manufacturer max DC power
- PASS · INV1-MPPT1-S1:VOC_DC: 1013.4000000000001 / 1100 V — Voc(Tmin) × N
- PASS · INV1-MPPT1-S1:VOC_MODULE: 1013.4000000000001 / 1100 V — Module system voltage
- PASS · INV1-MPPT1-S1:VMP_MIN: 653.9399999999999 / 200 V — Vmp(Tmax cell) × N
- PASS · INV1-MPPT1-S1:VMP_MAX: 858.0600000000001 / 1000 V — Vmp(Tmin cell) × N
- PASS · INV1:MPPT1:IMP: 13.2 / 30 A — Imp × parallel strings
- PASS · INV1:MPPT1:ISC: 17.5 / 30 A — Isc × explicit policy factor × parallel strings
- PASS · INV1:MPPT1:INPUTS: 1 / 2 strings — One string per physical input; Y connectors unsupported
- PASS · INV1:MPPT1:STRINGS: 1 / 2 strings — Manufacturer string limit
- PASS · INV1:MPPT1:INPUT_IMP: 13.2 / 15 A — Imp per input
- PASS · INV1:MPPT1:INPUT_ISC: 17.5 / 20 A — Isc factor per input
- PASS · INV1-MPPT2-S1:VOC_DC: 957.1 / 1100 V — Voc(Tmin) × N
- PASS · INV1-MPPT2-S1:VOC_MODULE: 957.1 / 1100 V — Module system voltage
- PASS · INV1-MPPT2-S1:VMP_MIN: 617.61 / 200 V — Vmp(Tmax cell) × N
- PASS · INV1-MPPT2-S1:VMP_MAX: 810.39 / 1000 V — Vmp(Tmin cell) × N
- PASS · INV1:MPPT2:IMP: 13.2 / 30 A — Imp × parallel strings
- PASS · INV1:MPPT2:ISC: 17.5 / 30 A — Isc × explicit policy factor × parallel strings
- PASS · INV1:MPPT2:INPUTS: 1 / 2 strings — One string per physical input; Y connectors unsupported
- PASS · INV1:MPPT2:STRINGS: 1 / 2 strings — Manufacturer string limit
- PASS · INV1:MPPT2:INPUT_IMP: 13.2 / 15 A — Imp per input
- PASS · INV1:MPPT2:INPUT_ISC: 17.5 / 20 A — Isc factor per input
- PASS · INV1-MPPT3-S1:VOC_DC: 957.1 / 1100 V — Voc(Tmin) × N
- PASS · INV1-MPPT3-S1:VOC_MODULE: 957.1 / 1100 V — Module system voltage
- PASS · INV1-MPPT3-S1:VMP_MIN: 617.61 / 200 V — Vmp(Tmax cell) × N
- PASS · INV1-MPPT3-S1:VMP_MAX: 810.39 / 1000 V — Vmp(Tmin cell) × N
- PASS · INV1:MPPT3:IMP: 13.2 / 30 A — Imp × parallel strings
- PASS · INV1:MPPT3:ISC: 17.5 / 30 A — Isc × explicit policy factor × parallel strings
- PASS · INV1:MPPT3:INPUTS: 1 / 2 strings — One string per physical input; Y connectors unsupported
- PASS · INV1:MPPT3:STRINGS: 1 / 2 strings — Manufacturer string limit
- PASS · INV1:MPPT3:INPUT_IMP: 13.2 / 15 A — Imp per input
- PASS · INV1:MPPT3:INPUT_ISC: 17.5 / 20 A — Isc factor per input
- PASS · INV1-MPPT4-S1:VOC_DC: 957.1 / 1100 V — Voc(Tmin) × N
- PASS · INV1-MPPT4-S1:VOC_MODULE: 957.1 / 1100 V — Module system voltage
- PASS · INV1-MPPT4-S1:VMP_MIN: 617.61 / 200 V — Vmp(Tmax cell) × N
- PASS · INV1-MPPT4-S1:VMP_MAX: 810.39 / 1000 V — Vmp(Tmin cell) × N
- PASS · INV1:MPPT4:IMP: 13.2 / 30 A — Imp × parallel strings
- PASS · INV1:MPPT4:ISC: 17.5 / 30 A — Isc × explicit policy factor × parallel strings
- PASS · INV1:MPPT4:INPUTS: 1 / 2 strings — One string per physical input; Y connectors unsupported
- PASS · INV1:MPPT4:STRINGS: 1 / 2 strings — Manufacturer string limit
- PASS · INV1:MPPT4:INPUT_IMP: 13.2 / 15 A — Imp per input
- PASS · INV1:MPPT4:INPUT_ISC: 17.5 / 20 A — Isc factor per input
- PASS · INV1-MPPT5-S1:VOC_DC: 957.1 / 1100 V — Voc(Tmin) × N
- PASS · INV1-MPPT5-S1:VOC_MODULE: 957.1 / 1100 V — Module system voltage
- PASS · INV1-MPPT5-S1:VMP_MIN: 617.61 / 200 V — Vmp(Tmax cell) × N
- PASS · INV1-MPPT5-S1:VMP_MAX: 810.39 / 1000 V — Vmp(Tmin cell) × N
- PASS · INV1:MPPT5:IMP: 13.2 / 30 A — Imp × parallel strings
- PASS · INV1:MPPT5:ISC: 17.5 / 30 A — Isc × explicit policy factor × parallel strings
- PASS · INV1:MPPT5:INPUTS: 1 / 2 strings — One string per physical input; Y connectors unsupported
- PASS · INV1:MPPT5:STRINGS: 1 / 2 strings — Manufacturer string limit
- PASS · INV1:MPPT5:INPUT_IMP: 13.2 / 15 A — Imp per input
- PASS · INV1:MPPT5:INPUT_ISC: 17.5 / 20 A — Isc factor per input
- PASS · INV1-MPPT6-S1:VOC_DC: 957.1 / 1100 V — Voc(Tmin) × N
- PASS · INV1-MPPT6-S1:VOC_MODULE: 957.1 / 1100 V — Module system voltage
- PASS · INV1-MPPT6-S1:VMP_MIN: 617.61 / 200 V — Vmp(Tmax cell) × N
- PASS · INV1-MPPT6-S1:VMP_MAX: 810.39 / 1000 V — Vmp(Tmin cell) × N
- PASS · INV1:MPPT6:IMP: 13.2 / 30 A — Imp × parallel strings
- PASS · INV1:MPPT6:ISC: 17.5 / 30 A — Isc × explicit policy factor × parallel strings
- PASS · INV1:MPPT6:INPUTS: 1 / 2 strings — One string per physical input; Y connectors unsupported
- PASS · INV1:MPPT6:STRINGS: 1 / 2 strings — Manufacturer string limit
- PASS · INV1:MPPT6:INPUT_IMP: 13.2 / 15 A — Imp per input
- PASS · INV1:MPPT6:INPUT_ISC: 17.5 / 20 A — Isc factor per input
- PASS · INV1-MPPT7-S1:VOC_DC: 957.1 / 1100 V — Voc(Tmin) × N
- PASS · INV1-MPPT7-S1:VOC_MODULE: 957.1 / 1100 V — Module system voltage
- PASS · INV1-MPPT7-S1:VMP_MIN: 617.61 / 200 V — Vmp(Tmax cell) × N
- PASS · INV1-MPPT7-S1:VMP_MAX: 810.39 / 1000 V — Vmp(Tmin cell) × N
- PASS · INV1:MPPT7:IMP: 13.2 / 30 A — Imp × parallel strings
- PASS · INV1:MPPT7:ISC: 17.5 / 30 A — Isc × explicit policy factor × parallel strings
- PASS · INV1:MPPT7:INPUTS: 1 / 2 strings — One string per physical input; Y connectors unsupported
- PASS · INV1:MPPT7:STRINGS: 1 / 2 strings — Manufacturer string limit
- PASS · INV1:MPPT7:INPUT_IMP: 13.2 / 15 A — Imp per input
- PASS · INV1:MPPT7:INPUT_ISC: 17.5 / 20 A — Isc factor per input
- PASS · ALLOCATION: 120 / 120 modules — All requested modules must be allocated
- PASS · RATIO_MAX: 1.404 / 1.5  — Explicit project policy
- PASS · RATIO_MIN: 1.404 / 0.9  — Explicit project policy
- PASS · ac-demo-50:IB_IN: 75.9671406828455 / 80 A — Ib ≤ In
- PASS · ac-demo-50:IN_IZ: 80 / 146.16 A — In ≤ Iz × kT × kg
- PASS · ac-demo-50:DROP: 1.2233505710357724 / 1.5 % — One-way route; R at design conductor temperature
- PASS · ac-demo-50:VOLTAGE: 400 / 1000 V — Rated voltage; confirm conductor-to-earth arrangement
- PASS · ac-demo-50:TEMPERATURE: 70 / 70 °C — Cable temperature rating
- WARN · ac-demo-50:PROVENANCE: ? / ?  — Catalog ampacity is preliminary; verify datasheet and installation method
- PASS · AC_BREAKING_CAPACITY: 6 / 10 kA — Prospective fault current ≤ device Icu at actual system voltage
- NOT_APPLICABLE · INV1-MPPT1-S1:FUSE_REQUIREMENT: ? / ?  — Single string; only array backfeed considered, inverter backfeed must be checked separately
- PASS · INV1-MPPT1-S1:dc-demo-4:IB_IN: 17.5 / 17.5 A — Ib ≤ In
- PASS · INV1-MPPT1-S1:dc-demo-4:IN_IZ: 17.5 / 35.2 A — In ≤ Iz × kT × kg
- PASS · INV1-MPPT1-S1:dc-demo-4:DROP: 0.9438360629415545 / 1 % — One-way route; R at design conductor temperature
- PASS · INV1-MPPT1-S1:dc-demo-4:VOLTAGE: 1013.4000000000001 / 1500 V — Rated voltage; confirm conductor-to-earth arrangement
- PASS · INV1-MPPT1-S1:dc-demo-4:TEMPERATURE: 90 / 90 °C — Cable temperature rating
- WARN · INV1-MPPT1-S1:dc-demo-4:PROVENANCE: ? / ?  — Catalog ampacity is preliminary; verify datasheet and installation method
- NOT_APPLICABLE · INV1-MPPT2-S1:FUSE_REQUIREMENT: ? / ?  — Single string; only array backfeed considered, inverter backfeed must be checked separately
- PASS · INV1-MPPT2-S1:dc-demo-4:IB_IN: 17.5 / 17.5 A — Ib ≤ In
- PASS · INV1-MPPT2-S1:dc-demo-4:IN_IZ: 17.5 / 35.2 A — In ≤ Iz × kT × kg
- PASS · INV1-MPPT2-S1:dc-demo-4:DROP: 0.9993558313498814 / 1 % — One-way route; R at design conductor temperature
- PASS · INV1-MPPT2-S1:dc-demo-4:VOLTAGE: 957.1 / 1500 V — Rated voltage; confirm conductor-to-earth arrangement
- PASS · INV1-MPPT2-S1:dc-demo-4:TEMPERATURE: 90 / 90 °C — Cable temperature rating
- WARN · INV1-MPPT2-S1:dc-demo-4:PROVENANCE: ? / ?  — Catalog ampacity is preliminary; verify datasheet and installation method
- NOT_APPLICABLE · INV1-MPPT3-S1:FUSE_REQUIREMENT: ? / ?  — Single string; only array backfeed considered, inverter backfeed must be checked separately
- PASS · INV1-MPPT3-S1:dc-demo-4:IB_IN: 17.5 / 17.5 A — Ib ≤ In
- PASS · INV1-MPPT3-S1:dc-demo-4:IN_IZ: 17.5 / 35.2 A — In ≤ Iz × kT × kg
- PASS · INV1-MPPT3-S1:dc-demo-4:DROP: 0.9993558313498814 / 1 % — One-way route; R at design conductor temperature
- PASS · INV1-MPPT3-S1:dc-demo-4:VOLTAGE: 957.1 / 1500 V — Rated voltage; confirm conductor-to-earth arrangement
- PASS · INV1-MPPT3-S1:dc-demo-4:TEMPERATURE: 90 / 90 °C — Cable temperature rating
- WARN · INV1-MPPT3-S1:dc-demo-4:PROVENANCE: ? / ?  — Catalog ampacity is preliminary; verify datasheet and installation method
- NOT_APPLICABLE · INV1-MPPT4-S1:FUSE_REQUIREMENT: ? / ?  — Single string; only array backfeed considered, inverter backfeed must be checked separately
- PASS · INV1-MPPT4-S1:dc-demo-4:IB_IN: 17.5 / 17.5 A — Ib ≤ In
- PASS · INV1-MPPT4-S1:dc-demo-4:IN_IZ: 17.5 / 35.2 A — In ≤ Iz × kT × kg
- PASS · INV1-MPPT4-S1:dc-demo-4:DROP: 0.9993558313498814 / 1 % — One-way route; R at design conductor temperature
- PASS · INV1-MPPT4-S1:dc-demo-4:VOLTAGE: 957.1 / 1500 V — Rated voltage; confirm conductor-to-earth arrangement
- PASS · INV1-MPPT4-S1:dc-demo-4:TEMPERATURE: 90 / 90 °C — Cable temperature rating
- WARN · INV1-MPPT4-S1:dc-demo-4:PROVENANCE: ? / ?  — Catalog ampacity is preliminary; verify datasheet and installation method
- NOT_APPLICABLE · INV1-MPPT5-S1:FUSE_REQUIREMENT: ? / ?  — Single string; only array backfeed considered, inverter backfeed must be checked separately
- PASS · INV1-MPPT5-S1:dc-demo-4:IB_IN: 17.5 / 17.5 A — Ib ≤ In
- PASS · INV1-MPPT5-S1:dc-demo-4:IN_IZ: 17.5 / 35.2 A — In ≤ Iz × kT × kg
- PASS · INV1-MPPT5-S1:dc-demo-4:DROP: 0.9993558313498814 / 1 % — One-way route; R at design conductor temperature
- PASS · INV1-MPPT5-S1:dc-demo-4:VOLTAGE: 957.1 / 1500 V — Rated voltage; confirm conductor-to-earth arrangement
- PASS · INV1-MPPT5-S1:dc-demo-4:TEMPERATURE: 90 / 90 °C — Cable temperature rating
- WARN · INV1-MPPT5-S1:dc-demo-4:PROVENANCE: ? / ?  — Catalog ampacity is preliminary; verify datasheet and installation method
- NOT_APPLICABLE · INV1-MPPT6-S1:FUSE_REQUIREMENT: ? / ?  — Single string; only array backfeed considered, inverter backfeed must be checked separately
- PASS · INV1-MPPT6-S1:dc-demo-4:IB_IN: 17.5 / 17.5 A — Ib ≤ In
- PASS · INV1-MPPT6-S1:dc-demo-4:IN_IZ: 17.5 / 35.2 A — In ≤ Iz × kT × kg
- PASS · INV1-MPPT6-S1:dc-demo-4:DROP: 0.9993558313498814 / 1 % — One-way route; R at design conductor temperature
- PASS · INV1-MPPT6-S1:dc-demo-4:VOLTAGE: 957.1 / 1500 V — Rated voltage; confirm conductor-to-earth arrangement
- PASS · INV1-MPPT6-S1:dc-demo-4:TEMPERATURE: 90 / 90 °C — Cable temperature rating
- WARN · INV1-MPPT6-S1:dc-demo-4:PROVENANCE: ? / ?  — Catalog ampacity is preliminary; verify datasheet and installation method
- NOT_APPLICABLE · INV1-MPPT7-S1:FUSE_REQUIREMENT: ? / ?  — Single string; only array backfeed considered, inverter backfeed must be checked separately
- PASS · INV1-MPPT7-S1:dc-demo-4:IB_IN: 17.5 / 17.5 A — Ib ≤ In
- PASS · INV1-MPPT7-S1:dc-demo-4:IN_IZ: 17.5 / 35.2 A — In ≤ Iz × kT × kg
- PASS · INV1-MPPT7-S1:dc-demo-4:DROP: 0.9993558313498814 / 1 % — One-way route; R at design conductor temperature
- PASS · INV1-MPPT7-S1:dc-demo-4:VOLTAGE: 957.1 / 1500 V — Rated voltage; confirm conductor-to-earth arrangement
- PASS · INV1-MPPT7-S1:dc-demo-4:TEMPERATURE: 90 / 90 °C — Cable temperature rating
- WARN · INV1-MPPT7-S1:dc-demo-4:PROVENANCE: ? / ?  — Catalog ampacity is preliminary; verify datasheet and installation method
- UNKNOWN · SPD: ? / ?  — SPD topology requires earthing system, LPS separation, routing, impulse current and manufacturer coordination. No automatic T1/T2 verdict. · missing: earthing_system, lps_separation, spd_coordination
- UNKNOWN · PROTECTION_SCOPE: ? / ?  — Full protection design remains outside v0.1: I2 ≤ 1.45 Iz, disconnection time, adiabatic withstand, RCD, DC switch utilization category and inverter backfeed · missing: device_curves, fault_loop, earthing_system, backfeed
- WARN · SOURCE:synthetic-demo: ? / ?  — Synthetic teaching example, not a manufacturer datasheet
- WARN · SOURCE:synthetic-demo: ? / ?  — Synthetic teaching example, not a manufacturer datasheet
- WARN · SOURCE:teaching-policy: ? / ?  — Explicit teaching policy; not a UA/CZ normative profile

## BOM
| Item | Quantity | Unit | Basis |
|---|---:|---|---|
| Навчальний модуль 585 W | 120 | pcs | Installed modules |
| Навчальний інвертор 50 kW | 1 | pcs | Declared inverter fleet |
| dc-demo-4 | 420 | m | Two separate conductors per DC string; no reserve |
| ac-demo-50 | 80 | m | One multicore feeder per inverter; no reserve |
| DC isolator candidate 20 A | 7 | pcs | Per-string candidate topology; manufacturer utilization category and voltage remain unverified |
| AC breaker candidate 80 A | 1 | pcs | Rating candidate; fault and curve checks required |

## Scope
AC — окремий однаковий фідер кожного інвертора. DC — окремий кабель кожного стрінгу. Приклади синтетичні; дані ampacity не підтверджені. Повна нормативна перевірка захисту, SPD, заземлення та проєктне погодження не виконані.
