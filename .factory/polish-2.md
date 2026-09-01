# Polish round 2 — zero-finding repair

Repaired from review commit `4d9541d0286a40f535548ebf5e99b94a4b9ffe68`. Product changes are in `eb7719a7d719a3e47aa7d5080eea2c398127c551`. The production deployment was checked cold at `https://sampling-budget-coordinator.sociobot.in/` on 2026-09-01.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept browser wording scoped to one adaptive-throughput goal; no CLI parity claim remains. | `@claim:sample-budget`; `PUBLIC_COPY_CHECK` repository scan; live landing screenshot. |
| F-1-2 | Retained coverage for every advertised sampler form and required adaptive fingerprints. | `@claim:supported-sampler-models`; 10 Rust unit tests. |
| F-1-3 | Retained repeated and comma-separated scenario coverage. | `@claim:scenario-assertion`. |
| F-1-4 | Retained human and JSON assumption reporting, including conditional rules. | `@claim:assumption-reporting`. |
| F-1-5 | Retained the tested 10% default and override behavior. | `@claim:default-tolerance`. |
| F-1-6 | Retained valid JSON coverage for both commands and assertion exits 0, 2, and 3. | `@claim:deploy-assertion`. |
| F-1-7 | Retained configured-ceiling audits without `--input`. | `@claim:upper-bound-without-input`. |
| F-1-8 | Retained non-sample report coverage, safe residual recommendations, and allowance checks. | `@claim:plan-report`; `mixed_policy_goal_reserves_percentage_volume`. |
| F-1-9 | Kept the report explanation split into short sentences. | `.factory/copy-audit.md`; no sentence over 22 words. |
| F-1-10 | Kept the three exit outcomes in separate short sentences. | `.factory/copy-audit.md`; clean README inspection. |
| F-1-11 | Kept the result heading “Fleet budget result.” | `planner recalculates the fleet and generates an assertion`; live screenshots. |
| F-1-12 | Kept “Account for replicas by sampler type” and consistent “OpenTelemetry” prose. | `PUBLIC_COPY_CHECK`; live landing screenshot. |
| F-1-13 | Kept the explicit “Copy command” control name. | `demo controls work with the keyboard and keep focus visible`; live screenshot. |
| F-1-14 | Kept the concrete README opening about checking a fleet-wide span budget. | `.factory/copy-audit.md`; README inspection. |
| F-1-15 | Kept the README heading “Supported collector configurations.” | README inspection. |
| F-1-16 | Kept “collector configuration” in prose and reserved `--config` for commands. | `PUBLIC_COPY_CHECK`; `.factory/copy-audit.md`. |
| F-1-17 | Kept route-entry h1 focus for forward navigation and Back. | `same-origin navigation and Back move focus to the destination heading`; live recovery focus was `H1#page-title`. |
| F-1-18 | Kept the literal 404 h1 “Page not found.” | `all public pages include route metadata and the product 404`; live missing URL returned HTTP 404. |
| F-2-1 | Changed “Open the planner” from `/` to `/#planner` and added a click-through regression. | `404 planner recovery opens and focuses the planner` passed on desktop and 390 px; live destination `/#planner`, visible planner, focused `H1#page-title`. |
| F-2-2 | Removed both the package-version aside and internal factory publishing instruction from the public README. | `rg` public-copy scan returned no matches; `.factory/copy-audit.md`. |

## Clean-clone evidence

The exact repair commit was cloned without hardlinks to `/tmp/sbc-polish2-clean-CyQfgk`, followed by `npm ci`.

- Every one of the 14 commands in `.factory/claims.json` passed separately. Each claim id still maps to exactly one tagged test.
- `npm test`: 10 Rust unit tests, 8 CLI integration tests, 1 doctest, and 52 Playwright checks passed; 16 duplicate or project-specific checks skipped as designed.
- `npm run typecheck`: passed.
- `npm run lint`: passed with Rust formatting and Clippy warnings denied.
- `npm run build`: passed; output is `dist/site/`.
- `cargo package --locked`: passed; 15 files, 75.9 KiB unpacked and 20.8 KiB compressed.

## Live evidence

- Deployment id: `fbe58730-4643-40a1-bd74-d0aa1a490237`.
- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` return 200. A new unknown route returns 404 with the designed page.
- All 19 deployed public files match `dist/site/` byte-for-byte.
- `/opt/fleet/lib/verify-url.sh` passed with no console errors. Evidence: `/tmp/sbc-polish2-live/verify.json`.
- Screenshots: `/tmp/sbc-polish2-live/screenshot-desktop.png` and `/tmp/sbc-polish2-live/screenshot-mobile.png`.
- Live Playwright axe scans found zero serious or critical findings on all five public pages in a fresh 390 px context.
- The demo reset restored 600; Start for real returned to `/`; local storage, session storage, cookies, and IndexedDB stayed empty.
- The live demo requested only `https://sampling-budget-coordinator.sociobot.in` and recalculated offline after a controlled reload.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1,214 ms, CLS 0, TBT 0 ms. Report: `/tmp/sbc-polish2-lighthouse.json`.
- Production build: main JS 4.61 kB / 2.06 kB gzip; CSS 13.52 kB / 3.68 kB gzip.

Every finding in `review-1.md` and `review-2.md` is resolved. No severity remains open.
