# OpenPV / Solar Designer Lite v0.1

A working local-first TypeScript starter: runtime project schemas, pure PV electrical calculations, CLI, a Ukrainian/English browser UI, synthetic examples, formula manifest and regression tests.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm dev
```

Node 24, pnpm 11.25.0. Run `pnpm build` before CLI use: `pnpm cli calculate data/examples/student-50kw.json`. UNKNOWN returns exit code 3. The UI supports project JSON save/load, manual strings, checks, BOM, Markdown report and browser print/PDF.

Preliminary design only. Synthetic catalog ampacities are unverified. Explicit cell/conductor temperatures, derating and policy are required. No hidden datasheet defaults. Separate Isc/Imp and physical-input limits. One string per physical input. Generator is a deterministic heuristic, not an optimal solver.

Optimizer topology, complete protection/SPD/earthing, national compliance profiles, BESS, commercial finance, installers and public package publishing are not implemented. See the Ukrainian specification and handoff for exact scope. License remains UNLICENSED pending owner's decision; no proprietary Solar Suite code samples are bundled.

Manufacturer field evidence now includes two Trina PV SKUs and two SMA string inverter SKUs, plus source-limited Nexans cable, Eaton fuse and Phoenix SPD candidates. Real/synthetic selectors, dated sources and missing-data explanations survive schema/core/CLI/UI/report. Bounded allocation recovery fixes independent29/29 and58/58 counterexamples without claiming global optimality. Structured derating binds evidence to exact cable/reference/site conditions; nominal fuse/SPD failures remain independent of unknown coordination. See docs/IMPLEMENTATION_REPORT.md for current verification and blockers.
