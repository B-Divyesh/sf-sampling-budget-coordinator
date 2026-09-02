# Independent verification 8 — PASS

Verified 2026-09-02 against candidate commit `b2c66c3be659e281b1314bd97e5e4d7b0c340fdd` and the live deployment at <https://sampling-budget-coordinator.sociobot.in/>.

## Decision

**PASS.** The candidate fulfils the researched job: a local Rust CLI plus a companion browser planner for platform engineers to keep an OpenTelemetry collector fleet inside a declared sampling budget as replicas change. No product code was modified during this verification.

## First read and demo

Cold-loading the live landing page answered all three required questions plainly:

- **What it does:** “Keep collector sampling within budget.”
- **Who it is for:** platform engineers managing OpenTelemetry fleets.
- **What to click first:** **Try it with sample data**, explicitly described as loading an isolated eight-replica fleet.

The action redirects `/?demo=1` to `/demo/` in one click. The populated demo has the persistent “Demo — sample data, nothing is saved” banner, Reset demo, and Start for real controls. It reports the claimed 1,800, 3,000, and 4,800 spans/s scenarios and a 75 spans/s safe local goal.

## Claim contract

After `npm ci` from the candidate checkout, I ran **each of the 14 exact commands** in `.factory/claims.json` separately. Every command passed (one Chromium check passed per claim; the duplicate mobile project is intentionally skipped for Chromium-only CLI/service-worker assertions):

| Claim IDs | Result |
| --- | --- |
| `demo-sandbox`, `local-privacy`, `offline-reload`, `sample-budget` | PASS |
| `deploy-assertion`, `unsupported-policy`, `supported-sampler-models`, `configuration-errors` | PASS |
| `scenario-assertion`, `assumption-reporting`, `default-tolerance`, `upper-bound-without-input` | PASS |
| `plan-report`, `mit-license` | PASS |

The manifest contains 14 claims and the test suite verifies one tagged observable test per claim. Landing, demo, README, and legal-page reliance statements are covered by these claims.

## Local quality and CLI package checks

- `npm ci`: PASS; 22 packages installed, npm reported 0 vulnerabilities.
- `npm test`: PASS; 10 Rust unit tests, 8 Rust CLI integration tests, 1 doctest, and 54 Playwright checks passed; 16 intentional duplicate project skips. The service-worker upgrade check passed.
- `npm run typecheck`, `npm run lint`, and the exact production `npm run build`: PASS.
- Production build output is `dist/site/`; main JS is 4.82 kB (2.14 kB gzip), CSS 13.52 kB (3.68 kB gzip), within the static budget.
- `cargo package --locked --allow-dirty`: PASS; 15 files, 76.1 KiB unpacked / 20.9 KiB compressed.
- Clean packed consumer: PASS. I installed `target/package/sampling-budget-coordinator-0.1.0` into a fresh temporary Cargo root; `sbc --help`, `sbc --version`, and `sbc demo --json` worked. The demo emitted schema `sbc.report/v1`, 1,800/3,000/4,800 spans/s, and a 75 goal.
- Representative CLI checks passed: normal multi-scenario JSON plan returned 0; over-budget assertion returned 3 with JSON; invalid `--replicas 0` returned 2 and “replicas must be at least 1.” Full tests cover unsupported processors, missing trace wiring, sampler models, no-input ceiling audits, tolerance override, and assumptions.

## Live deployment, privacy, and security

- A production build of this candidate was byte-compared with the deployment: all 19 publicly served output files matched exactly. `staticwebapp.config.json` is deploy metadata and correctly not publicly served.
- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` return 200; an unknown path returns 404. The live internal link crawl found no non-200 links.
- `/opt/fleet/lib/verify-url.sh` passed: 633 ms cold load, no console/page errors, `lang=en`, title, one h1, main landmark, labelled controls, and no image missing alt text.
- Fresh desktop and 390 px mobile Playwright request logs during landing-to-demo and recalculation contained only `https://sampling-budget-coordinator.sociobot.in` requests. Browser `localStorage`, `sessionStorage`, and cookies were empty after the demo flow.
- The live document has self-only CSP with response-header `frame-ancestors 'none'`, HSTS, `nosniff`, and `strict-origin-when-cross-origin`. HTML and service worker revalidate in 30 seconds; hashed JS/CSS cache for one year immutable.
- After the live service worker controlled an online visit, `/demo/` reloaded offline and recalculated to Within budget. The local full suite also verified an old service-worker shell cache is discarded on update.

This is a static site and a local CLI: no server-side API, product unlock endpoint, sign-in, payment, database, or remote persistence exists. Rate-limit/429, identity-provider, backend concurrency, and server persistence checks are not applicable.

## Accessibility, responsive, and visual checks

- Axe on live `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html`: **0 serious/critical findings** on desktop and 390×844 mobile.
- Keyboard-only smoke test: first Tab focuses the visible 3 px Skip to main content outline; Enter moves focus to main; Space resets the demo back to local goal 600. Controls tested were at least 44 px high.
- 390 px live demo had no horizontal overflow. At reduced motion, its transition duration is `0.00001s`.
- Visual inspection of live desktop and mobile screenshots found the product-specific fleet-ledger print palette, legible sampling calculator, and usable stacked mobile layout intact.

## Defects by severity

- P0: none.
- P1: none.
- P2: none.
- P3: none.

## Reproduce

```sh
npm ci
# Run every exact command in .factory/claims.json separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked --allow-dirty
```
