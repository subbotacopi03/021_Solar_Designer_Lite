# OpenPV · Solar Designer Lite

An open tool for preliminary electrical checks of PV plants with string inverters. Runs offline in the browser, no installation, Ukrainian and English UI. [Українська версія](README.md).

> Preliminary engineering calculation for PV designers, not approved design documentation. No UA/CZ normative compliance is claimed. Real installations require primary manufacturer data and an independent engineering review.

## Download and start

1. Download `Solar_Designer_Lite.html` from [Releases](https://github.com/subbotacopi03/021_Solar_Designer_Lite/releases) (or from the repository root).
2. Open it with a double click. No Node, server or internet needed; data stays in your browser.
3. Click "Open JSON" and select `data/examples/trina435-manual24.json`.
4. Step-by-step guide: [docs/QUICK_START_EN.md](docs/QUICK_START_EN.md).

## Features

- Temperature-corrected Voc/Vmp, MPPT window, module and inverter voltage limits.
- Automatic string allocation and a manual plan validated by the same checks.
- Separate Isc/Imp, MPPT total and physical-input checks.
- Per-string DC and per-inverter AC lines: current, R(T), voltage drop, preliminary cable sizing.
- Nominal fuse, reverse-current, SPD and DC switch-disconnector checks.
- Electrical BOM without prices, Markdown/PDF report, Student Mode.
- Sourced exact-SKU equipment records: [docs/EQUIPMENT_CATALOG.md](docs/EQUIPMENT_CATALOG.md).

Missing inputs produce UNKNOWN; the program never fills them with typical values. A known FAIL stays FAIL even when other data is missing.

## Limits of v0.1

One module and inverter type per project, one string per physical input, heuristic (not proven optimal) allocation, no parallel cables, manual derating, no full protection coordination, SPD topology, optimizers, BESS or economics. See [the specification](docs/spec/electrical-v0.1.md) and [architecture](docs/ARCHITECTURE.md).

## Development

```bash
pnpm install --frozen-lockfile   # Node 24, pnpm 11.25.0
pnpm check
pnpm dev
pnpm build && pnpm cli calculate data/examples/student-50kw.json
```

CLI exit codes: 0 PASS/WARN, 1 FAIL, 2 input/JSON error, 3 UNKNOWN.

## License and authorship

**Project author:** Oleksandr V. Subbota (Суббота Олександр Володимирович)  
Licensed under the [Mozilla Public License 2.0](LICENSE). Attribution: [ATTRIBUTION.md](ATTRIBUTION.md). No telemetry.
