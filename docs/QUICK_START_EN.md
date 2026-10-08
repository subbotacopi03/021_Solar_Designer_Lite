# Solar Designer Lite — quick start

This is preliminary version 0.1 under the MPL-2.0 license. Keep LICENSE, ATTRIBUTION.md and THIRD_PARTY_NOTICES.txt with the application.

## Open and try the example

1. Extract the entire ZIP into a separate directory. Double-click `Solar_Designer_Lite.html` to open it in a browser. Ordinary use needs neither Node nor internet. Automated verification used Chrome on macOS; other browsers and operating systems remain untested.
2. Click “Open JSON” and select `data/examples/trina435-manual24.json`. EN/UA switches language. Student Mode adds teaching explanations; `student-50kw.json` is a separate synthetic teaching example.
3. The real example uses Trina Solar TSM-435NEG9R.28 and SMA STP8.0-3AV-40. “Strings & MPPT” contains two manual strings of 12 modules on MPPT A/B, allocating 24/24 modules. Apply the manual plan after editing. An unapplied draft is not included in saved JSON; the application asks you to apply it first.
4. Inspect individual PASS, FAIL and UNKNOWN findings in “Checks”. Known cold-Voc checks pass in this example; βVmp and individual physical-input ratings remain unknown. Overall UNKNOWN means incomplete verification, not installation approval. Zero automatically allocated modules with missing βVmp means the generator lacks required data.
5. In “What needs clarification”, MISSING means an absent value, PROVIDED means an already supplied dependency, and REVIEW means a scope or evidence question. Expand a field to read its units, affected checks and sources. A related datasheet link does not prove the missing parameter is stated there. Do not substitute typical values from another model.
6. Use “Save JSON” for a portable project. In “Report & BOM”, “Download report” exports Markdown; printing can produce PDF. Reports/PDF do not replace JSON for restoring a project. Autosave depends on browser storage availability; export JSON if a warning appears. Keep a separate JSON copy even when autosave works.

## Limits and reporting a problem

This is a preliminary electrical checking tool for conventional string inverters and one equipment type per project. Cables, protection, SPD and DC disconnects retain unresolved installation/coordination conditions. Verified UA/CZ compliance, parallel cables and optimizers are not available. Actual installation requires primary evidence and independent engineering review.

“About this project” shows software origin and third-party notices. There is no hidden usage tracking. When describing a problem, include the version, browser/OS, steps, expected and actual behavior, and optionally a minimal JSON without private or customer information.

`PACK_MANIFEST.json` records the version, file list and sizes; `SHA256SUMS.txt` records file checksums. These detect corruption, not authenticity, engineering correctness or public redistribution rights. Keep the original package unchanged when verifying checksums; save your own projects separately.
