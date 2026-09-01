# Sampling Budget Coordinator — review 3 handoff

## Outcome

**FAIL.** No product code was changed. The independent review is in `.factory/review-3.md`.

The live product passed cold-read, demo isolation/reset, same-origin privacy, offline reload, CLI demo, accessibility, routing, metadata, link-crawl, and all 14 individual claim tests. The repository still has one blocking verification issue: `npm test` failed twice in a clean clone when the Playwright Chromium process crashed with `SIGSEGV` mid-suite.

## Verified

- All 14 commands in `.factory/claims.json` pass separately after `npm ci`.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --locked` pass.
- Live mobile and desktop checks confirm the demo banner, reset, no browser persistence, same-origin requests, route focus, offline reload, route metadata, and zero serious/critical Axe findings.

## Required next step

Stabilize the full Playwright suite so `npm test` passes twice from a clean checkout. See finding F-3-1 for the observed browser crash and acceptance criterion.

## Run and verify

```sh
npm ci
# Run each exact .factory/claims.json command separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked
```
