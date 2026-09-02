# Sampling Budget Coordinator — review 4 handoff

## Outcome

**PASS.** This reviewer changed no product code. The only repository changes are `.factory/review-4.md` and this handoff.

## Verified

- Cold live visits at 390 px and desktop made the job, audience, and sample action clear before scrolling.
- The published demo opens populated, shows the persistent isolation banner, resets its sample, exits without carrying values, leaves browser storage empty, and made only same-origin requests.
- All 14 exact `.factory/claims.json` commands passed separately from a clean clone.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --locked --allow-dirty` passed from the clean clone.
- Live routes, metadata, 404 behavior, navigation focus, headers, links, mobile layout, and accessibility checks passed. No findings remain.

## Known gaps / next steps

None found. Maintain the claim tests and repeat the independent live review after any change to public copy, routing, demo isolation, or sampler behavior.

## Run and verify

```sh
npm ci --include=dev
# Run each exact command in .factory/claims.json separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked --allow-dirty
```
