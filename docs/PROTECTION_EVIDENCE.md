# Protection: reverse-current assessment and nominal fuse checks

2026-10-08. `packages/core/src/protection.ts` computes the combined worst-case reverse current: `(k−1)×IscSTC×policy.isc_factor + full declared inverter backfeed`. No backfeed division across physical inputs. Missing backfeed produces UNKNOWN even with one string; zero is accepted only when explicitly supplied. Synthetic demos declare0 as a teaching assumption. [SMA technical data](https://manuals.sma.de/STP8-10-3AV-40/en-US/4176094859.html) explicitly declares0 A maximum reverse current into PV array for both imported SKUs.

Module reverse-current withstand remains distinct from maximum series-fuse rating. For positive reverse current without withstand, fuse requirement is UNKNOWN. Independent case:2×14×1.25+5=40 A; declared withstand30 A requires protection. Only a known zero reverse contribution gives a limited NOT_APPLICABLE assessment without a withstand rating.

[Eaton PV-15A10F official ratings](https://www.eaton.com/us/en-us/skuPage.PV-15A10F.html): gPV,15 A,1000 V DC,50 kA interrupt. `data/equipment/verified/fuses.json` stores only these checked nominal fields. Total-clearing I²t remains null; the published pre-arcing figure is not reused as total clearing energy. Candidate selection in UI/JSON does not imply necessity or complete coordination.

Checks: family gPV; rated DC voltage≥known cold string voltage; breaking capacity≥computed combined reverse current; current inside explicit policy bounds and module series-fuse maximum. Known voltage failures remain visible independently of unknown coordination. Example `fuse-voltage-fail.json`:19×56.3=1069.7 V>1000 V device rating →FAIL/CLI1, even though the synthetic inverter has zero backfeed.

Scope still UNKNOWN: low-fault/time-current clearing, full I²t/adiabatic coordination, holder/poles, disconnect/device utilization categories, RCD, fault-loop and national requirements. No complete protection design or UA/CZ compliance claim. A device-family catalog and parameter checks are implemented; complete coordination is PARTIAL/BLOCKED on applicable curves, fault model and standard sources.

Review fixes: supplied device current перевіряється проти кожної відомої policy/module межі до early returns, навіть necessity=false/null; DC cable In використовує supplied rating. Будь-яка відома nonnegative array/inverter contribution вже понад breaking capacity доводить FAIL за UNKNOWN total; lower bound усередині capacity не доводить PASS. Тести охоплюють oversized50A vs25A module та missing backfeed/factor.
