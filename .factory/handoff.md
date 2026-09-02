# Sampling Budget Coordinator — verification 8 handoff

## Outcome

**PASS** for candidate `b2c66c3be659e281b1314bd97e5e4d7b0c340fdd` at <https://sampling-budget-coordinator.sociobot.in/>.

This independent verification found the live production deployment byte-identical to the candidate across 19 public files. No product code changed; this handoff and `.factory/verification-8.md` are the verifier's only changes.

## Verified

- Each of the 14 exact `.factory/claims.json` commands passed separately.
- `npm test` passed: 10 Rust unit tests, 8 CLI integration tests, 1 doctest, and 54 Playwright checks; 16 intentional duplicate-project skips.
- `npm run typecheck`, `npm run lint`, exact production `npm run build`, and `cargo package --locked --allow-dirty` passed.
- A fresh consumer installed the packaged CLI and successfully used `sbc --help`, `sbc --version`, and `sbc demo --json`.
- Live first-read and one-click demo, desktop and 390 px layout, keyboard focus, reduced motion, offline reload, service-worker update, privacy request/storage checks, headers/caching, route/link crawl, and Axe have no release-blocking findings.

## Known gaps / next steps

None found. The product is static plus a local CLI, so server rate limiting, sign-in, payment, and persistence checks do not apply.

## Run and verify

```sh
npm ci
# Run every exact .factory/claims.json command separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked --allow-dirty
```
