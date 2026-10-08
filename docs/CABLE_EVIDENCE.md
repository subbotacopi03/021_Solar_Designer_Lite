# Manufacturer cable evidence and applicability

2026-10-08. [Nexans C.4 mm2 H1Z2Z2-K, ID540479078](https://www.nexans.co/en/products/Sistemas-Solares/Granjas-Solares/Cable-solar-premium-H1Z2Z2-K/H1Z2Z2-K/product~ID540479078~.html); [manufacturer PDF](https://www.nexans.co/.rest/catalog/v1/product/pdf/ID540479078), electrical characteristics / operating temperature / ampacity conditions.

Transcribed: tinned Cu,4 mm², maximum R20=5.09 Ω/km, Iz55 A for single cable outdoors60°C ambient,1500 V DC U0/U. Continuous temperature90°C;120°C limited20000 h is not an unlimited continuous rating. This is a catalog identity, not an inferred distributor order code.

UNKNOWN: α and X not stated; reference conductor temperature for55 A not explicitly linked; ambient/grouping/installation factors not available from the reviewed product record. Referenced EN50618 tables are not reproduced or assumed. Suitable for conduits does not mean outdoor Iz applies in conduits. No UA/CZ normative approval.

`data/equipment/verified/cables.json` keeps unknowns null. Schema accepts missing R20/α. Core preserves R(Tconductor), cosφ/X; absent α gives UNKNOWN R(T) and voltage drop. UI site tab can load source-limited Nexans or return to separate teaching cables; site/method/ambient/grouped count are explicit. Structured factor/source editing is in Project JSON.

`ampacity_reference` describes the reference installation. `derating_evidence` has temperature/grouping/installation factor+basis+sources. The product is used only when every factor is present; an inconsistent explicit aggregate factor FAILs. Missing applicability, unverified evidence or a different supported method makes selection UNKNOWN. Actual conductor temperature must match the supported reference profile; adjusting ampacity to a different conductor temperature needs a separately implemented source-grounded profile. No automatic parallel runs.

Independent tests use α0.00393 only as an explicitly synthetic test fixture:55×.8×.7×1=30.8 A;5.09×[1+.00393×50]=6.090185 Ω/km;2×.02×20×6.090185=4.872148 V. No such α is inserted into the manufacturer record. `source-limited-cable.json` demonstrates valid schema → core/CLI/UI/report with UNKNOWN and null selection.

Further engineering cable selection is BLOCKED on applicable manufacturer resistance temperature data and installation/derating evidence. Existing synthetic candidates remain teaching aids.

Review fix: `derating_evidence.applies_to` містить cable_id, reference_iz_a, reference profile (або null для навчального), exact actual method/ambient/conductor/grouping. Missing snapshot або будь-яка зміна цих умов →DERATING_APPLICABILITY UNKNOWN, selection null. Старі JSON без snapshot залишаються schema-valid, але їхні structured factors не доводять застосовність.
