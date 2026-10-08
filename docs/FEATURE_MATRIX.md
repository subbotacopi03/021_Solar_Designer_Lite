# Реалізація стартового комплекту

| Функція | Core | CLI | Lite | Статус |
|---|---|---|---|---|
| Voc/Vmp за температурою | Так | calculate | Inputs/results | IMPLEMENTED |
| Window/string allocation | Так | calculate | Auto/manual MPPT plan | IMPLEMENTED · heuristic + bounded recovery; no global optimality claim |
| Isc/Imp на MPPT і входах | Так | calculate | Findings | IMPLEMENTED |
| DC/AC | Так | calculate | KPI/policy | IMPLEMENTED |
| DC/AC кабель, ΔU, R(T) | Так | calculate | Feeder table | IMPLEMENTED · preliminary |
| Derating | Explicit factor | JSON | Editable factor+basis | IMPLEMENTED · sourced structured factors / applicability; no automatic norm tables |
| Breaker In/Icu | Candidate/check | calculate | Findings | IMPLEMENTED · not full protection |
| Fuse requirement/rating | Explicit withstand / policy | calculate | Findings | PARTIAL · explicit inverter backfeed + nominal device checks; curves/coordination UNKNOWN |
| DC isolator | Nominal candidate | calculate | Result JSON | PARTIAL · device type/voltage checks required |
| SPD | UNKNOWN finding | calculate | Findings | NOT IMPLEMENTED |
| Optimizer topology | Schema only | validate | JSON | NOT IMPLEMENTED |
| BOM | Counts/lengths, no prices | report | Table | IMPLEMENTED · basic |
| Save/load | Schema | File input | JSON + autosave | IMPLEMENTED |
| Report | Markdown | report | Markdown / browser print PDF | IMPLEMENTED |
| Student Mode | Same core | Examples | Three exercises | IMPLEMENTED |
| UA/EN | IDs/basis English | Report UA/EN | UI UA/EN | IMPLEMENTED · basis technical English |
| Manufacturer field evidence | 2 PV + 2 string inverter SKUs | 2 source-limited examples | Selector + evidence | IMPLEMENTED · βVmp/connector ratings UNKNOWN |
| UA/CZ compliance packs | Input policy | Input | JSON | NOT IMPLEMENTED |
| PWA/desktop installers | — | — | — | NOT IMPLEMENTED |
| BESS/economics/CAD/GIS | — | — | — | OUT OF SCOPE / PRIVATE |
