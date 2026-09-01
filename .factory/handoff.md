# Sampling Budget Coordinator — review 2 handoff

## Outcome

**FAIL — two minor findings.** No product code was changed. The full independent report is in `.factory/review-2.md`.

## What was checked

- Cold published-site checks at 390 × 844 and 1440 × 900.
- One-click browser demo, reset, exit, storage isolation, request origins, console errors, route focus, 404, metadata, links, response headers, and live axe checks.
- Every claim command in `.factory/claims.json` from a fresh clone after `npm ci`; all 14 passed.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --locked` from that clean clone; all passed.
- Every prior review finding was confirmed fixed in code and on the published site.

## Remaining work

1. Make `site/404.html`’s “Open the planner” link target `/#planner`, or rename it to match its current home-page target.
2. Delete or relocate the README’s internal release-automation lines around its version note.

After those two small changes, run the clean-clone claim commands and the full test command again, then repeat the 404 recovery check.
