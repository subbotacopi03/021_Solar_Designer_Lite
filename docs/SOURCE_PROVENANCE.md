# Source provenance та reuse

Матеріалізовано OPENPV_SOURCE_RECOVERY та OPENPV_AUDIT_PACKAGE. Реалізацію побудовано на картах source recovery, differential evidence, golden candidates і релевантних calculation fragments. Доступу до live production repositories у цьому середовищі не було. Попередні 286/286 TEO та 221/221 Construct — результати із наданого пакета; це не новий запуск тестів Suite.

| Source snapshot | Commit | Використання тут |
|---|---|---|
| Solar TEO | fa10fb929175714882c11059170cbcf63cb9d1b2 | Golden arithmetic і перелік legacy differences, не production source copy |
| Solar TZ | 47f55712650446aee5f86621aea7c6662356e4da | Architecture boundary; геометрія/profile engine поза поточним scope |
| Solar Construct | 83dc455f72d0a41cc300d4f200ac10843aa91d47 | Опис string/cable/protection domain, чекова структура, golden inputs |

| Старий компонент | Новий компонент | Статус |
|---|---|---|
| `pvElectricalDesign.ts`, `stringing.ts` | `packages/core/src/strings.ts` | REWRITE FROM SPEC; independent deterministic heuristic, physical input checks |
| `cables.ts` | `packages/core/src/cables.ts`, `fundamentals.ts` | REWRITE FROM SPEC; supplied catalog, explicit derating |
| `protection.ts` | `packages/core/src/protection.ts` | REWRITE FROM SPEC; reverse withstand separated, nominal SPD checks implemented separately; full coordination UNKNOWN |
| `cableAndProtectionSizing.ts` | `calculateAcCurrent`, `checkBreakingCapacity` | REWRITE FROM SPEC; no η for given output AC power; no cost-based ranking |
| `engineeringTrace.ts`, `CalcCheck` shape | `EngineeringCheckSchema` | PORT of result concept, new schema |
| Formula manifest scripts | `scripts/formula-manifest.mjs` | PORT of change-barrier pattern; full-file SHA-256 rather than copied AST machinery |
| Existing golden candidates | `tests/golden`, `tests/differential` | Selected independent numeric cases, no Suite customer fixtures |

Не заявляється бінарна/поведінкова тотожність старим модулям. GT-STR-03 round-robin і legacy fuse requirement не переносилися як обов’язкова правильна відповідь. SPEC-10 змінює legacy AC-current expected values. Усі відмінності мають бути переглянуті перед інтеграцією назад у Suite.

Raw CODE_SAMPLES і вихідні архіви залишаються окремо та не входять у deliverable. Production репозиторії не змінювалися.

## Manufacturer evidence 2026-10-08

Офіційні Trina/SMA джерела, exact columns, дата звірки та прогалини: [EQUIPMENT_CATALOG.md](EQUIPMENT_CATALOG.md). Перевірка окремих полів не означає нормативну відповідність або повноту manufacturer catalog. Raw source recovery лишається лише в ignored backup.

Manufacturer field records продовжено офіційними Nexans/Eaton/Phoenix sources: [CABLE_EVIDENCE.md](CABLE_EVIDENCE.md), [PROTECTION_EVIDENCE.md](PROTECTION_EVIDENCE.md), [SPD_EVIDENCE.md](SPD_EVIDENCE.md). Ці product ratings не встановлюють national installation requirements. Missing parameters не заповнено типовими значеннями.

ABB OTDC32F2 evidence/import scope: [DC_SWITCH_EVIDENCE.md](DC_SWITCH_EVIDENCE.md). Тільки1000V operational profile; не переносити DC-PV2 із маркетингу іншої серії, Ui/Ith не є Ue/Ie.
