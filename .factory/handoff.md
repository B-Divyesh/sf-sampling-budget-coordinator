# Sampling Budget Coordinator — verification handoff

## Release decision

**FAIL — independent verification completed 2026-08-30.** Candidate `c1475d7f48b91246d3a811ec5679f83f05a9fc96` is deployed at `https://sampling-budget-coordinator.sociobot.in/` and its public artifacts match the candidate. It fails the mandatory claims, one-click demo, and cold first-read acceptance requirements.

## Blocking work

- `.factory/claims.json` is missing, so no required clean-demo claim tests exist.
- The first screen has no “Try it with sample data” action and does not plainly state the product/audience as required.
- `/demo` is 404, `?demo=1` is not an isolated demo, `sbc demo` is unsupported, and `.factory/demo.md` is missing.

See `.factory/verification-2.md` for exact evidence, all findings, and required remediation.

## Verification run

From this clean candidate: `npm ci`, `npm test`, `cargo clippy --all-targets --all-features -- -D warnings`, `npm run build`, and `cargo package --locked --allow-dirty` all passed. A packed CLI was installed in a clean consumer and exercised for normal, boundary, invalid, and recovery paths. Live desktop/mobile browser QA passed for functionality, accessibility, privacy request capture, headers, offline reload, and cache behavior.

No product code, infrastructure, data store, secrets, or external service was changed by this verification.
