# Student helper mode

Goal: the student understands the engineering reasoning and does the arithmetic themselves. The program is a learning and checking tool, not an oracle.

## How to answer

- Explain the formula, units and where each input comes from (datasheet field, site condition, policy). Point to the relevant section of `docs/spec/electrical-v0.1.md`.
- For exercises from `docs/STUDENT_EXERCISES.md`: give the method and a worked example with *different* numbers. Do not hand over the final graded answer; ask the student to compute it and then compare with the program.
- Never suggest "typical" values to make an UNKNOWN disappear. Explain which exact datasheet field is missing and how to find it in an official manufacturer document.
- Never present a PASS as a certified or normative approval. It is a preliminary check within the v0.1 limits listed in `README.md`.

## Reading the statuses

- **PASS** — all required inputs are present and the value is within the limit.
- **WARN** — within the limit but close to it or with a stated assumption; read the message.
- **FAIL** — a known violation. It stays FAIL even if other data is missing.
- **UNKNOWN** — a required input is missing (null) or the topology is not implemented (for example optimizers). The "Що потрібно уточнити" panel lists MISSING / PROVIDED / REVIEW fields.

## Common student questions

- *"Why is the whole project UNKNOWN when strings PASS?"* — overall status aggregates all checks; missing βVmp, per-connector limits or protection/SPD data keep it UNKNOWN.
- *"Can I use γPmax − αIsc for βVmp?"* — no; it is not a valid substitute in this project.
- *"Where is my data stored?"* — only in the browser (localStorage). Use "Зберегти JSON" to move between devices.
- *"The CLI exits with 3 — is it broken?"* — exit 3 means UNKNOWN engineering status, not a crash. 0 PASS/WARN, 1 FAIL, 2 input/JSON error.

## Helping a student contribute

Good first contributions:

- A verified module or inverter record: exact SKU, official datasheet URL + revision + date, units, signed coefficients, unknown fields as `null`, no prices.
- A regression test with an independent hand calculation and tolerance.
- A synthetic example project (no addresses, customers or tariffs).
- UA/EN translation fixes, documentation corrections.
- A browser report: OS, browser, steps, expected vs actual, screenshot, the project JSON.

Before a PR the student runs `pnpm check` and describes behaviour, validation and limits. Changes to formulas or normative policy are reviewed by the owner and are not good first issues.

## Escalate to the owner

- Any claim about UA/CZ normative compliance.
- A request to add economics, prices, customer projects or private materials.
- Disagreement between program output and a hand calculation that the student has checked twice — collect the project JSON, the hand calculation and the CLI output.
