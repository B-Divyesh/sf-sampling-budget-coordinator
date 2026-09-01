# Independent verification 6 — PASS

Verified 2026-09-01 against candidate commit `e65e59ca3136677aac2a2af622ab45a35babb5a7` on `main` and `https://sampling-budget-coordinator.sociobot.in/`.

## Decision

**PASS.** The candidate meets the researched brief and builder work order. It provides a working Rust CLI and companion browser planner for checking fleet-wide OpenTelemetry sampling budgets as replica counts change. The package, declared claims, production build, live deployment, accessibility, privacy behavior, offline path, and performance checks pass. No release-blocking or lower-severity product defects were found.

No product code was changed during this verification.

## Required claim contract

Before repository inspection or product QA, every command in `.factory/claims.json` was invoked. The dependency-empty checkout stopped those first invocations at the site build because `vite` was not installed. After the required locked install with `npm ci`, every exact command was repeated through the documented demo entry point:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS — 1 passed, 1 intentional project skip |
| `local-privacy` | PASS — 1 passed, 1 intentional project skip |
| `offline-reload` | PASS — 1 passed, 1 intentional project skip |
| `sample-budget` | PASS — 1 passed, 1 intentional project skip |
| `deploy-assertion` | PASS — 1 passed, 1 intentional project skip |
| `unsupported-policy` | PASS — 1 passed, 1 intentional project skip |
| `supported-sampler-models` | PASS — 1 passed, 1 intentional project skip |
| `configuration-errors` | PASS — 1 passed, 1 intentional project skip |
| `scenario-assertion` | PASS — 1 passed, 1 intentional project skip |
| `assumption-reporting` | PASS — 1 passed, 1 intentional project skip |
| `default-tolerance` | PASS — 1 passed, 1 intentional project skip |
| `upper-bound-without-input` | PASS — 1 passed, 1 intentional project skip |
| `plan-report` | PASS — 1 passed, 1 intentional project skip |
| `mit-license` | PASS — 2 passed |

The landing page, privacy page, terms, and README claims map to these entries. No unlisted product promise was found.

## Cold first read and one-click demo

The first screen passes on desktop and at 390 px without scrolling:

- What it does: “Keep collector sampling within budget.”
- Who it is for: platform engineers managing OpenTelemetry fleets.
- First action: “Try it with sample data,” paired with “Loads an isolated eight-replica fleet.”
- Three visible facts cover local privacy, offline use, and MIT licensing.

At 390×844, the primary action ends at 611 px and all three facts end at 778 px. One click opens `/demo/` with realistic populated values, the over-budget result, the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, and **Start for real**. Reset restores the sample and announces completion.

## Clean-checkout gates and packaged consumers

- Candidate identity: exact `e65e59ca3136677aac2a2af622ab45a35babb5a7`; worktree clean before report edits.
- `npm ci`: PASS — 22 packages installed; zero reported vulnerabilities.
- `npm test`: PASS in an isolated run — 10 Rust unit tests, 8 CLI integration tests, 1 doctest, and 50 Playwright checks passed; 16 intentional project duplicates skipped.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS — Rust formatting and Clippy with warnings denied.
- `npm run build`: PASS — exact production output emitted to `dist/site/`.
- `cargo package --locked`: PASS — 15 files, 76.0 KiB unpacked and 20.9 KiB compressed.
- Fresh packaged CLI install: PASS. The installed binary is 1,558,424 bytes. Help, version, demo JSON, planning, invalid-input guidance, recovery, and assertion outcomes 0, 2, and 3 behaved as documented.
- Fresh external Rust consumer: PASS. It compiled against the packaged crate, called the public `plan` API, received two scenarios, a 50 spans/s recommendation, and serializable `sbc.report/v1` output.

## End-to-end product checks

The installed CLI and live planner were checked with representative, boundary, invalid, and recovery inputs:

- Bundled 3/5/8-replica sample: 1,800 / 3,000 / 4,800 spans/s, with a 75 spans/s local recommendation.
- Exact browser boundary: 75 × 8 with zero tolerance reports 600 and **Within budget**.
- Just above boundary: 75.01 × 8 reports 600.1 and **Over budget**.
- Zero input reports zero export.
- Peak below current and fractional replica inputs return specific correction messages.
- Correcting the values clears the message and recalculates to **Within budget**.
- The packaged CLI returns 3 for an over-budget assertion, 2 for a missing file, and 0 on the next valid command.
- Mixed-policy, sampler-schema, scenario, no-input, assumption, and finite-number boundaries pass the declared regressions and the full suite.

## Live candidate identity, privacy, and response policy

- All 19 publicly served build files match `dist/site/` byte-for-byte. Landing SHA-256: `59a73ab94b37f6a4ab15c8099b0354759dc27782daea37f89c7fb8d0cc161c3d`; main JS: `47504b640e69916b003b4cd0e4b77eeb97b54cb6515e3904b3552a14f49fe5df`; CSS: `48142b873bcbc3600dfd1df47f495bf13d745c4f2127fa4b45adc23868a2cdd0`; worker: `088e190dcb5669399be2436ed532426c5f4281bb05cbea2b7f6972791695d489`.
- `/`, `/demo/`, `/privacy/`, and `/terms/` return 200. The designed missing route returns 404. Every visible link and fragment resolves; the source link returns 200.
- `/opt/fleet/lib/verify-url.sh` passes with the expected title, `lang=en`, one h1, a main landmark, complete image alternatives, labeled buttons, and no console errors. Evidence: `/tmp/sbc-verify-url.tQYJoS/`.
- The full live demo flow requested only `https://sampling-budget-coordinator.sociobot.in`. Local storage, session storage, cookies, and IndexedDB remained empty. No analytics, advertising, account, payment, or remote planner call was present.
- Browser response headers confirm self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, and `strict-origin-when-cross-origin`.
- HTML and `/sw.js` use `public, must-revalidate, max-age=30`. Hashed assets use `public, max-age=31536000, immutable`.
- The active worker at `/sw.js` uses cache `sbc-shell-9a5eee4e568a`. `registration.update()` completes; `/demo/` then reloads offline with status 200 and recalculates to **Within budget**.

This is a static site plus local CLI. It has no server-side product endpoint, product-unlock request, sign-in, payment, database, or remote persistence. Request-allowance, identity-provider, backend concurrency, and SQLite checks are not applicable.

## Accessibility, responsive behavior, and performance

- Twenty live axe route/viewport/theme combinations found zero serious or critical issues across `/`, `/demo/`, `/privacy/`, `/terms/`, and the true 404 at desktop and 390 px in light and dark modes.
- Every route has `lang=en`, a route-specific title, one h1, one main landmark, complete image alternatives, and zero horizontal overflow. Valid routes produced no console or page errors.
- Keyboard checks confirm the first Tab reaches the skip link, Enter moves focus to `main`, and demo controls operate with Space. Keyboard focus uses a visible 3 px teal outline with 4 px offset.
- Visible controls at 390 px meet the 44×44 CSS-pixel target check. A 200% text check has no horizontal overflow.
- Reduced motion changes the result transition and animation to `0.00001s` and scroll behavior to `auto`.
- Production main JS is 4.61 kB / 2.06 kB gzip; CSS is 13.52 kB / 3.68 kB gzip; fonts total 30.33 kB; the mobile illustration is 46.06 kB.
- Fresh Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.3 s, LCP 1.5 s, TBT 90 ms, CLS 0, total transfer 85 KiB.
- Desktop and mobile screenshots were visually checked. The fleet-ledger visual system is distinct, readable, and responsive. Evidence: `/tmp/sbc-verify-url.tQYJoS/` and `/tmp/sbc-live-qa/`.

## Scope and missed-leverage check

The product uses deterministic local calculations, so an AI feature would not improve the brief’s core job. Collector YAML is the required import, JSON is available for CI, and the sample workflow is bundled. No clearly implied AI, import, export, or synchronization feature is missing.

## Defects by severity

- P0: none.
- P1: none.
- P2: none.
- P3: none.

## Reproduce

```sh
npm ci
# Run each command in .factory/claims.json separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked
```
