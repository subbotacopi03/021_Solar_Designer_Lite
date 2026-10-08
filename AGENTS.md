# OpenPV development rules

Read README.md, CONTRIBUTING.md and docs/spec/electrical-v0.1.md before modifying calculations. Respond in Ukrainian unless the user writes in another language. Use only single-level lists.

Preserve UNKNOWN and missing-input semantics. No silent datasheet/site defaults. No sign repair with abs(). Separate Voc/Vmp, Isc/Imp, MPPT/physical-input limits and maximum series-fuse/reverse-current ratings. Never use legacy expected results as sole proof of engineering correctness.

Core is pure: no filesystem, database, network, pricing or customer records. Suite repositories remain outside this workspace. Do not import commercial economics, tariffs, CAD/GIS workflows, document templates or raw source recovery files.

For formula changes: update spec, add independent regression arithmetic, change code, review resulting findings, then update manifest deliberately. Run pnpm check. Browser smoke is available separately; never claim it ran unless it did.

Do not claim normative UA/CZ compliance, production readiness or verified manufacturer catalog data. License is MPL-2.0 (owner decision 2026-10-08); public release, author identity and URLs remain pending. Do not publish or change project audience without an explicit task.

Current starter supports conventional string inverters, one equipment type per project and single-run feeder cables. Optimizer topology, full protection/SPD and regulatory packs are not implemented. Respect the implemented-vs-planned distinction in all reports.
