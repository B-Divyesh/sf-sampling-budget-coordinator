# Independent verification 7 — PASS

Verified 2026-09-01 against candidate commit `4a9e064545297fbd23c9f430582b575407c02955` on `main` and `https://sampling-budget-coordinator.sociobot.in/`.

## Decision

**PASS.** This candidate delivers the researched job: a local Rust CLI and companion browser planner that let platform engineers calculate a fleet-wide OpenTelemetry sampling budget as collector replica counts change, recommend safe local goals, and assert the result in CI. No product code was changed during verification.

## Required claim contract

From the clean checkout, after `npm ci`, I ran every exact command listed in `.factory/claims.json` separately through the bundled demo entry points. All passed:

| Claims | Result |
| --- | --- |
| `demo-sandbox`, `local-privacy`, `offline-reload`, `sample-budget` | PASS |
| `deploy-assertion`, `unsupported-policy`, `supported-sampler-models`, `configuration-errors` | PASS |
| `scenario-assertion`, `assumption-reporting`, `default-tolerance`, `upper-bound-without-input` | PASS |
| `plan-report`, `mit-license` | PASS |

The manifest has 14 claims, each maps to exactly one tagged observable test. Landing, demo, README, and legal-page promises match those declared claims; no unlisted reliance claim was found.

## Cold first read and demo

The cold live first screen passes the plain-words and demo requirements on desktop and 390 px mobile:

- **What it does:** “Keep collector sampling within budget.”
- **For whom:** platform engineers managing OpenTelemetry fleets.
- **First action:** “Try it with sample data,” with the explicit outcome “Loads an isolated eight-replica fleet.”
- **Facts:** no planner data saved/sent, offline after first visit, MIT licensed.

One click opens `/demo/` directly in a populated, usable sample. It displays the persistent Demo / nothing-saved banner, Reset demo, and Start for real. Reset returns the local goal to 600. The sample accurately reports 1,800, 3,000, and 4,800 spans/s at 3/5/8 replicas and recommends 75 spans/s per instance.

## Local and package quality gates

- `npm ci`: PASS — 22 packages installed; npm reported 0 vulnerabilities.
- `npm test`: PASS — 10 Rust unit tests, 8 CLI integration tests, 1 doctest, and 52 Playwright checks passed; 16 project/engine duplicate tests were intentionally skipped.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS — Rust format check plus Clippy with warnings denied.
- `npm run build`: PASS — production site emitted to `dist/site/`; main JS is 4.61 kB (2.06 kB gzip) and CSS is 13.52 kB (3.68 kB gzip).
- `cargo package --locked --allow-dirty`: PASS — 15 files, 75.9 KiB unpacked / 20.8 KiB compressed.
- Clean packaged CLI consumer: PASS — installed from the unpacked crate, `sbc --version`, helpful `--help`, and `sbc demo --json` worked.
- Clean external Rust consumer: PASS — compiled against the unpacked packaged crate, called the public `plan(config, &PlanRequest)` API, received schema `sbc.report/v1` and the expected `75` recommendation.

Representative boundary, invalid-input, recovery, sampler-schema, scenario, no-input, assumption, and exit-code cases are covered by the full suite and all 14 claim runs. In the live planner, changing the local goal to 60 produces Within budget; invalid peak/current relationships show an actionable correction and work again once corrected.

## Live deployment, privacy, and security

- Final production build was compared file-for-file to the public deployment: all 19 served files are byte-identical. This confirms the deployed site matches candidate `4a9e064`.
- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` return 200 with route-specific titles, one h1, and a main landmark. An unknown route returns 404.
- `/opt/fleet/lib/verify-url.sh` passed: cold load 853 ms, no console/page errors, `lang=en`, title, one h1, main landmark, and no images without alt text.
- A fresh live demo Playwright request log contained only five same-origin requests (document, two self-hosted fonts, JS, CSS). It contained no analytics, advertising, account, payment, or third-party requests. `localStorage`, `sessionStorage`, cookies, and IndexedDB were empty after the demo flow.
- Live response headers have self-only CSP including response-header `frame-ancestors 'none'`, HSTS, `nosniff`, and `strict-origin-when-cross-origin`. HTML/service worker use a short revalidation cache; hashed JS/CSS use one-year immutable caching.
- After an online visit controlled by `/sw.js`, `/demo/` reloaded offline with status 200 and recalculated to Within budget.

This is a static site plus a local CLI: it has no server-side API, sign-in, payment, product-unlock call, database, or remote persistence. Rate-limit, identity-provider, server concurrency, and backend persistence checks are therefore not applicable.

## Accessibility, responsive behavior, and visual QA

- Live Axe found zero serious or critical findings across `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` at desktop and 390×844 mobile.
- Keyboard checks passed: first Tab reaches Skip to main content, Enter moves focus to `main`, and Space activates Reset demo. The focused reset control has a solid visible outline.
- At 390 px, landing and demo have no horizontal overflow. Reduced-motion result transition is `0.00001s`.
- Desktop and mobile screenshots were visually inspected. The fleet-ledger illustration, print-like palette, type hierarchy, calculator, and terminal output remain legible and product-specific at both sizes.

## Defects by severity

- P0: none.
- P1: none.
- P2: none.
- P3: none.

## Reproduce

```sh
npm ci
# Run every exact test command in .factory/claims.json separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked --allow-dirty
```
