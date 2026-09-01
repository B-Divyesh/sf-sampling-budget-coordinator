# Independent verification 4 — FAIL

Verified 2026-09-01 against candidate commit `1d0d87d4819b3c4fcc456480d5b320ebf2c852fd` and production URL `https://sampling-budget-coordinator.sociobot.in/`.

## Decision

**FAIL.** The CLI, browser planner, demo isolation, privacy behavior, offline path, packaging, and all declared claims work. The live deployment is byte-for-byte identical to the candidate build. Release is blocked by one manual accessibility defect: three standalone navigation links do not meet the contract's 44 by 44 CSS-pixel touch-target minimum.

## Release-blocking defect

### P1 — Standalone navigation targets are narrower than 44 CSS pixels

Fresh Chromium measurement on the live `/demo/` route found:

- Desktop 1440×900: header **Demo** is 32×44 px; footer **Home** is 41.34×44 px; footer **Terms** is 41.23×44 px.
- Mobile 390×844: footer **Home** is 41.34×44 px; footer **Terms** is 41.23×44 px.

These are standalone navigation controls, not links embedded in prose. `site/src/style.css` gives header and footer links a 44 px minimum height but no 44 px minimum width or equivalent horizontal padding. This fails the attached accessibility and design contracts, which require touch targets to be at least 44×44 px. The 20 px gaps avoid crowding, but do not satisfy the stated minimum target dimensions. Axe reports zero serious/critical findings because its automated rules do not enforce this stricter factory requirement.

Required repair: give standalone header/footer links a clickable width of at least 44 px, then rerun mobile/desktop target measurement, the full suite, and live verification.

## Mandatory claim contract

The worktree was clean and exactly at the candidate commit before dependency installation. `.factory/claims.json` exists. After `npm ci` (22 packages, 0 vulnerabilities), every listed command ran separately through the bundled browser/CLI demo path:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `local-privacy` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `offline-reload` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `sample-budget` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `deploy-assertion` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `unsupported-policy` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `supported-sampler-models` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `configuration-errors` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `scenario-assertion` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `assumption-reporting` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `default-tolerance` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `upper-bound-without-input` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `plan-report` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `mit-license` | PASS — 2 passed |

The complete command output was retained during verification at `/tmp/sbc-claim-results.log`. A manual cross-check of landing and README statements found no new unlisted behavioral claim.

## Cold first-read and demo gate

The first screen passes at 1440×900 and 390×844 without scrolling:

- **What:** “Keep collector sampling within budget.”
- **For whom:** “For platform engineers managing OpenTelemetry fleets…”
- **What to click:** “Try it with sample data,” paired with “Loads an isolated eight-replica fleet.”

The three facts say planner data is not saved or sent, the planner works offline after the first visit, and the product is MIT licensed. One click opens `/demo/` already populated with the 3-current/8-peak-replica sample, an over-budget result, and the persistent “Demo — sample data, nothing is saved” banner.

Reset restores the 600 spans/s sample goal and retains keyboard focus. **Start for real** returns to `/` without carrying demo changes. Storage stayed empty: zero localStorage keys, sessionStorage keys, cookies, and IndexedDB databases.

## Repaired-claim regression check

Every finding repaired in polish round 1 remains repaired:

| Prior finding | Fresh evidence |
| --- | --- |
| Browser/CLI formula wording | PASS — browser copy remains scoped to one adaptive-throughput goal. |
| Supported sampler promises | PASS — all five documented sampler forms passed `supported-sampler-models`. |
| Multi-scenario syntax | PASS — repeated and comma-separated scenarios are covered and return exit 3 when any row exceeds the allowance. |
| Assumption reporting | PASS — steady-state, even-load, and conditional-rule assumptions appear in human and JSON reports. |
| Default tolerance | PASS — 10% yields 660 spans/s for a 600 budget; override is tested. |
| JSON and stable exits | PASS — `plan` and `assert` emit valid JSON; assertion exits 0, 2, and 3. |
| No-input ceiling audit | PASS — configured ceilings and the no-input assumption are reported. |
| General report contents | PASS — non-sample fixtures report fleet cap, export, and proportional recommendations. |
| Long or unclear copy | PASS — the current copy audit has no sentence over 22 words and no banned term. |
| Result/section/button terminology | PASS — “Fleet budget result,” “Account for replicas by sampler type,” “Copy command,” and “collector configuration” are present. |
| Route focus | PASS — `/` → `/demo/` focuses the demo h1; browser Back focuses the landing h1. |
| Plain 404 | PASS — an unknown URL returns HTTP 404 with h1 “Page not found.” |

Earlier repairs also remain intact: skip-link activation focuses `main`, the service worker has a content-versioned cache boundary, privacy wording accurately says selected YAML may contain credentials but is parsed locally, both demos exist, required metadata exists, and `.factory/demo.md` plus `.factory/copy-audit.md` are present.

## Clean-clone quality gates and CLI consumer

- `npm test`: PASS — 6 Rust unit tests, 5 CLI integration tests, 1 doctest, and 46 Playwright checks passed; 16 duplicate/project-specific checks were intentionally skipped.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS (`cargo fmt --check` and Clippy with warnings denied).
- `npm run build`: PASS; emitted `dist/site/`.
- `cargo package --locked --allow-dirty`: PASS — 15 files, 60.7 KiB unpacked / 18.2 KiB compressed.
- Fresh consumer install from the packaged crate: PASS; installed binary size was 1,542,704 bytes.

The installed `sbc` binary exposed `plan`, `assert`, and `demo` with useful help. The representative 3/5/8-replica plan reported 1,800/3,000/4,800 spans/s and a 75 spans/s safe local goal. An exact 4,800 boundary at zero tolerance exited 0. An over-budget assertion exited 3 with valid JSON. Invalid numeric input and a missing configuration exited 2 with actionable errors. The demo wrote only `collector.yaml` and `report.json` to its disclosed temporary directory.

## Live identity, privacy, security, and PWA behavior

- All 19 public files in `dist/site/` match production byte-for-byte. The landing HTML SHA-256 is `ccf853d345f765447ffa402416dd69254b77f921efefceb32f5af1b9fe16430a`; the main JS SHA-256 is `47504b640e69916b003b4cd0e4b77eeb97b54cb6515e3904b3552a14f49fe5df`. `staticwebapp.config.json` is host configuration and is not a public artifact.
- `/opt/fleet/lib/verify-url.sh` passed with HTTP 200, the expected title, `lang=en`, one h1, a main landmark, complete image alt text, labeled buttons, and no console errors. Evidence was written to `/tmp/sbc-verify-url-UPkneC/`.
- Fresh live traffic during the full demo interaction used only `https://sampling-budget-coordinator.sociobot.in`. No analytics, advertising, account, payment, third-party script, or configuration upload was observed.
- Live HTML uses `public, must-revalidate, max-age=30`; hashed JS, CSS, fonts, and images use `public, max-age=31536000, immutable`.
- Live headers include a self-only CSP with `connect-src 'self'` and `frame-ancestors 'none'`, HSTS, `nosniff`, and `strict-origin-when-cross-origin` referrer policy.
- Every visible site link resolved successfully. `/`, `/demo/`, `/privacy/`, and `/terms/` return 200. A real unknown route returns the designed page with HTTP 404.
- The active live worker is `/sw.js`, with one content-versioned cache `sbc-shell-beaea489ac72`. `registration.update()` completed. A controlled `/demo/` reloaded offline with HTTP 200 and recalculated to “Within budget.” The local old-worker/new-worker regression test also passed.

This product is a static site plus a local CLI. It has no server-side product or unlock endpoint, login, payment flow, database, or remote persistence. Rate-limit, Entra tenant, backend concurrency, and SQLite boundary checks are therefore not applicable.

## Accessibility, responsive behavior, and performance

- Live axe-core via Playwright found zero serious/critical violations on `/`, `/demo/`, `/privacy/`, `/terms/`, and the true 404 at desktop and 390 px. Local tests also scan every route in the dark treatment.
- Valid live routes produced no console or page errors. The deliberate unknown-route navigation produced only the browser's expected failed-resource message for its HTTP 404.
- Keyboard-only checks passed for the skip link, form editing, recalculation, reset, Enter/Space operation, and route-change/Back focus. The focused reset control has a 3 px solid teal outline.
- The desktop and 390 px layouts have zero horizontal overflow. At 200% root text size, the 390 px layout still has zero horizontal overflow.
- Reduced motion resolves transitions and animations to `0.00001s` and scroll behavior to `auto`.
- Touch target size fails as documented above.
- Production build: main JS 4.61 kB / 2.06 kB gzip; CSS 13.17 kB / 3.64 kB gzip; self-hosted fonts total 30.33 kB; mobile illustration 46.06 kB. All are below the stated budgets.
- Fresh live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.3 s, TBT 40 ms, CLS 0, transfer 85 KiB.

## Defects by severity

- P0: none.
- P1: one — standalone navigation targets below 44×44 px.
- P2/P3: none.

## Reproduce

```sh
npm ci
jq -r '.[] | [.id,.test] | @tsv' .factory/claims.json
# Run every emitted command separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked --allow-dirty
```

No product code was modified during verification.
