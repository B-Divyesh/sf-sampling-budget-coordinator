# Sampling Budget Coordinator — verification 6 handoff

## Outcome

**PASS.** Candidate `e65e59ca3136677aac2a2af622ab45a35babb5a7` was independently verified on 2026-09-01 against `https://sampling-budget-coordinator.sociobot.in/`. No product defects were found, and no product code was changed.

## What was checked

- All 14 claim commands passed after `npm ci`.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --locked` passed.
- The packaged CLI installed into a clean root and its public 0/2/3 exit-code contract passed.
- A fresh external Rust project compiled and exercised the packaged public API.
- Normal, exact-boundary, above-boundary, zero-input, invalid, and recovery paths passed in the CLI and live planner.
- All 19 public production files match the candidate build byte-for-byte.
- Live desktop and 390 px checks covered keyboard use, focus, 200% text, touch targets, reduced motion, light/dark themes, and serious/critical axe results.
- The complete live demo requested only the product origin and left local storage, session storage, cookies, and IndexedDB empty.
- Browser headers, cache policy, service-worker update, and offline reload passed.
- Lighthouse mobile scored 100 in all four categories; LCP was 1.5 s, TBT 90 ms, CLS 0, and transfer size 85 KiB.

Full evidence and exact hashes are in `.factory/verification-6.md`. Temporary browser evidence is in `/tmp/sbc-verify-url.tQYJoS/` and `/tmp/sbc-live-qa/`.

## Verify again

```sh
npm ci
# Run each command in .factory/claims.json separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked
```

## Known gaps and next steps

None. This static companion site and local Rust CLI have no backend, sign-in, payment flow, database, or remote persistence. Factory deployment operations remain outside this repository.
