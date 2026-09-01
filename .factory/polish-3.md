# Polish round 3 — release repair

Repaired the candidate from review commit `a4cbd1cfa80c5ce435e620e37a65262a02a1767e`. Implementation commits are `0abb6b1586a7516d34941905079891a8f14583fe` (isolated browser lifecycle) and `b2c66c3be659e281b1314bd97e5e4d7b0c340fdd` (query demo entry and its route-focus regression). Production was deployed from `b2c66c3` and checked cold at `https://sampling-budget-coordinator.sociobot.in/` on 2026-09-01.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept browser wording limited to one adaptive-throughput goal; removed the broader browser/CLI parity promise. | `@claim:sample-budget`; cold landing check. |
| F-1-2 | Declared sampler models and test fixtures for every advertised sampler behavior. | `@claim:supported-sampler-models`. |
| F-1-3 | Declared repeated and comma-separated replica scenario assertions. | `@claim:scenario-assertion`. |
| F-1-4 | Declared human and JSON assumption reporting, including conditional-rule warnings. | `@claim:assumption-reporting`. |
| F-1-5 | Declared and tested the 10% default tolerance and override. | `@claim:default-tolerance`. |
| F-1-6 | Declared valid JSON output for both `plan` and `assert`, including exit codes. | `@claim:deploy-assertion`. |
| F-1-7 | Declared configured-ceiling audits without `--input`. | `@claim:upper-bound-without-input`. |
| F-1-8 | Declared non-sample scenario caps, exports, and safe recommendations. | `@claim:plan-report`. |
| F-1-9 | Kept the README plan explanation split into short sentences. | `.factory/copy-audit.md`; clean-clone copy check. |
| F-1-10 | Kept the README exit-code explanation split into short sentences. | `.factory/copy-audit.md`; `@claim:deploy-assertion`. |
| F-1-11 | Kept the result heading as “Fleet budget result.” | Cold live demo check; `live-demo-mobile.png`. |
| F-1-12 | Kept “Account for replicas by sampler type” and consistent OpenTelemetry wording. | Cold landing check; `.factory/copy-audit.md`. |
| F-1-13 | Kept the explicit “Copy command” control name. | `demo controls work with the keyboard and keep focus visible`. |
| F-1-14 | Kept the concrete README opening about fleet-wide span budgets. | `.factory/copy-audit.md`. |
| F-1-15 | Kept “Supported collector configurations” as the README heading. | README clean-clone inspection. |
| F-1-16 | Kept “collector configuration” in prose and the literal `--config` option only for CLI syntax. | `.factory/copy-audit.md`; repository scan. |
| F-1-17 | Preserved focus on destination headings for navigation and Back; additionally treated the `?demo=1` hop as a route change. | `same-origin navigation and Back move focus to the destination heading`; cold live route-focus check. |
| F-1-18 | Kept the literal 404 heading “Page not found.” | Cold live `/not-a-route` check returned 404. |
| F-2-1 | Kept the 404 recovery link at `/#planner` and focused the destination heading. | `404 planner recovery opens and focuses the planner`; cold live 404 recovery check. |
| F-2-2 | Kept internal factory release-process copy out of the public README. | README inspection; `.factory/copy-audit.md`. |
| F-3-1 | Replaced the long-lived Playwright browser fixture with a test-scoped Chromium process, context, and page; enabled two low-concurrency fully parallel workers and one clean-process retry; CI runs `npm test` twice. | `npm test` passed twice from `/tmp/sbc-polish3-final-a.q3JUyE` and `/tmp/sbc-polish3-final-b.b8NJOP`: 70 browser entries, Rust unit/integration tests, and doctest, all with exit 0. |

## Additional work-order check

The first-screen action now points to `/?demo=1`, which immediately enters canonical `/demo/` isolated mode. The demo claim starts at that alias. Cold live evidence verified the banner, Reset demo restoring 600, Start for real returning to `/`, and empty local/session/IndexedDB/cookie storage.

## Clean-clone and live evidence

- `npm ci`, every one of the 14 exact `.factory/claims.json` commands, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --locked` passed from `/tmp/sbc-polish3-final-b.b8NJOP`.
- A second independent clone at `/tmp/sbc-polish3-final-a.q3JUyE` also completed `npm ci && npm test` with exit 0. The full runner now contains 70 entries because the query-demo regression runs in both desktop and mobile projects.
- Production deployment: `https://sampling-budget-coordinator.sociobot.in/` and `https://blue-coast-03129da0f.7.azurestaticapps.net/`.
- `/opt/fleet/lib/verify-url.sh` passed with no console errors; evidence: `/tmp/sbc-polish3-final-live.2nxpp7/verify.json`.
- Cold live Playwright + Axe checks passed at 1440 px and 390 px for `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html`; it also verified the query demo, reset, zero storage, same-origin requests, offline reload, route focus, and 404 recovery. Screenshot evidence: `/tmp/sbc-polish3-final-live.2nxpp7/screenshot-desktop.png`, `/tmp/sbc-polish3-final-live.2nxpp7/screenshot-mobile.png`, and `/tmp/sbc-polish3-final-live.2nxpp7/live-demo-mobile.png`.

No blocking, major, minor, or earlier finding remains unresolved.
