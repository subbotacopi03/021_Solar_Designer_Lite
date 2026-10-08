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
| DC isolator | Explicit Ue/Ie/category/poles/wiring profile | calculate | Candidate/context selector/report | PARTIAL · per-string nominal checks; full installation/coordination UNKNOWN |
| SPD | Separate nominal/context checks; topology UNKNOWN | calculate | Candidate selector/findings/report | PARTIAL · source-limited Phoenix2800628; no normative verdict |
| Optimizer topology | Schema only | validate | JSON | NOT IMPLEMENTED |
| BOM | Actual selected route lengths, partial quantities explicit | report | Table + omitted/layout status | IMPLEMENTED · quantities only, no reserve/prices |
| Save/load | Schema | File input | JSON + autosave | IMPLEMENTED |
| Report | Markdown | report | Markdown / browser print PDF | IMPLEMENTED |
| Student Mode | Same core | Examples | Three exercises | IMPLEMENTED |
| UA/EN | IDs/basis English | Report UA/EN | UI UA/EN | IMPLEMENTED · basis technical English |
| Manufacturer field evidence | 2 PV + 2 string inverter SKUs | 2 source-limited examples | Selector + evidence | IMPLEMENTED · βVmp/connector ratings UNKNOWN |
| UA/CZ compliance packs | Input policy | Input | JSON | NOT IMPLEMENTED |
| Cable candidate audit | Existing candidate metrics/checks/sources | JSON + Markdown rejection reasons | Per-line inspector | IMPLEMENTED · read-only, no extra formulas |
| Окремі DC/AC траси | Full replacements + snapshot/ambiguous/orphan checks | individual-routes example / calculate / report | UA/EN editor + save/load | IMPLEMENTED · per-string / per-inverter, single run only |
| PWA/desktop installers | — | — | — | NOT IMPLEMENTED |
| BESS/economics/CAD/GIS | — | — | — | OUT OF SCOPE / PRIVATE |

## Користувацькі доповнення до поточного стану

| Можливість | Статус | Доказ |
|---|---|---|
| Native manual plan form + shared checks | IMPLEMENTED | manual-strings.ts; manual browser/integration tests |
| Applied-project recovery, draft guards, async import ordering | IMPLEMENTED | main.ts/drafts.ts; safety/adversarial browser suites |
| Nonfinite result rejection, safe report text | IMPLEMENTED | numerical-safety.ts/markdown-text.ts; integration tests |
| MISSING/PROVIDED/REVIEW UA/EN guidance | IMPLEMENTED | missing-data-model/fields/render; 8unit/18browser checks |
| Visible software origin/notices | IMPLEMENTED mechanism; personal identity BLOCKED | software-credit.ts/about.ts/data/attribution.json |
| Internal owner-review ZIP/UAEN guides/checksums | IMPLEMENTED; public release BLOCKED | review-pack.mjs; 6unit/8archive-offline checks |
| Human pilot/other OS-browser acceptance | NOT RUN | PILOT_TEST_MATRIX |

Плани розвитку обговорюються в Issues.
