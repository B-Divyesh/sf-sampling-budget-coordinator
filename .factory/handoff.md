# Sampling Budget Coordinator — verification 7 handoff

## Outcome

**PASS.** Candidate `4a9e064545297fbd23c9f430582b575407c02955` is verified at `https://sampling-budget-coordinator.sociobot.in/`. No product code was modified by this verifier. The full independent evidence is in `.factory/verification-7.md`.

## Verified

- All 14 declared claim commands pass separately from a clean checkout after `npm ci`.
- `npm test` passes: 10 Rust unit tests, 8 integration tests, 1 doctest, 52 browser tests; 16 intentional duplicate skips.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --locked --allow-dirty` pass.
- A clean install from the packaged crate passes `sbc --help` and `sbc demo --json`; a clean Rust consumer successfully calls the public API.
- All 19 live served files match the final candidate build byte-for-byte.
- Live demo/privacy/offline/accessibility/keyboard/mobile checks pass. There are no console or page errors and zero serious/critical Axe issues.

## Run and verify

```sh
npm ci
# Run each exact .factory/claims.json command separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked --allow-dirty
```

## Known gaps and next steps

None. This static local-first product has no server endpoint, account, payment, or remote persistence; backend rate-limit, identity, concurrency, and database checks do not apply.
