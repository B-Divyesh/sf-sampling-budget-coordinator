# Polish round 1 — adversarial review repairs

Repaired from `da186d44c1acda7b764f1309bd4432d54c6f24fd` in code commit `4d9a90a4afb8201324404c037da1b85402ce8041`. The production deployment was checked cold at `https://sampling-budget-coordinator.sociobot.in/` on 2026-09-01. Screenshots: `/tmp/sbc-live-verify/screenshot-desktop.png` and `/tmp/sbc-live-verify/screenshot-mobile.png`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Narrowed browser wording to one adaptive-throughput goal. Removed formula-parity promise. | `npm test`; live landing text check. |
| F-1-2 | Added `supported-sampler-models` claim/test for all documented sampler types. | `npm run test:claim -- @claim:supported-sampler-models`. |
| F-1-3 | Added `scenario-assertion` claim/test for repeated and comma-separated scenarios. | `npm run test:claim -- @claim:scenario-assertion`. |
| F-1-4 | Added `assumption-reporting` claim/test for human and JSON assumptions plus conditional warning. | `npm run test:claim -- @claim:assumption-reporting`. |
| F-1-5 | Added `default-tolerance` claim/test for 10% and an override. | `npm run test:claim -- @claim:default-tolerance`. |
| F-1-6 | Expanded `deploy-assertion` to promise JSON for both commands; test parses both. | `npm run test:claim -- @claim:deploy-assertion`. |
| F-1-7 | Added `upper-bound-without-input` claim/test for configured ceilings. | `npm run test:claim -- @claim:upper-bound-without-input`. |
| F-1-8 | Added `plan-report` claim/test with two non-sample fixtures. | `npm run test:claim -- @claim:plan-report`. |
| F-1-9 | Split the long README report sentence. | `.factory/copy-audit.md`; `npm test`. |
| F-1-10 | Split the long README exit-code sentence. | `.factory/copy-audit.md`; `npm test`. |
| F-1-11 | Renamed the result heading to “Fleet budget result.” | Live `/demo/` source check; mobile screenshot. |
| F-1-12 | Renamed the sampler section and used OpenTelemetry consistently in visible copy. | `.factory/copy-audit.md`; live landing screenshot. |
| F-1-13 | Renamed the control to “Copy command.” | `npm test`; live landing screenshot. |
| F-1-14 | Rewrote the README opening in plain language. | README audit; `npm test`. |
| F-1-15 | Renamed the README heading to “Supported collector configurations.” | README audit; `npm test`. |
| F-1-16 | Standardized prose on “collector configuration”; retained `--config` only as a flag. | `rg` audit; `npm test`. |
| F-1-17 | Route-entry headings receive focus after in-site navigation and Back without focusing a cold load. | `same-origin navigation and Back move focus to the destination heading`; live Playwright focus check. |
| F-1-18 | Replaced the 404 h1 with “Page not found.” | Live unknown-route HTTP 404 and h1 check. |

## Earlier review history

Every earlier report was reread. Its skip-link focus, versioned service-worker cache, scoped local-configuration privacy copy, claim manifest, browser/CLI demos, first-screen clarity, metadata, and 404 findings remain covered by the full suite. The current live check confirmed title, `lang`, one h1, main landmark, alt text, no console errors, demo reset, route focus, and zero serious/critical live axe findings.

## Live checks

- `https://sampling-budget-coordinator.sociobot.in/` returned 200 with title “Sampling Budget Coordinator — Check Fleet Budgets”.
- `https://sampling-budget-coordinator.sociobot.in/demo/` rendered the persistent demo banner and the renamed result heading.
- `https://sampling-budget-coordinator.sociobot.in/not-a-route` returned HTTP 404 with h1 “Page not found”.
- `/opt/fleet/lib/verify-url.sh` wrote `verify.json` and the two screenshots under `/tmp/sbc-live-verify/` with no console errors.
