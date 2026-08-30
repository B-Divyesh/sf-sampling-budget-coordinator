# Independent verification — FAIL

Verified 2026-08-30 against candidate commit `c1475d7f48b91246d3a811ec5679f83f05a9fc96` and the production URL `https://sampling-budget-coordinator.sociobot.in/`.

## Decision

**FAIL.** The CLI and deployed planner work, and the production assets are exactly this candidate. The release cannot pass because it fails the mandatory claims, first-read, and one-click demo acceptance gates.

## Release-blocking defects

### P0 — Required claims contract is absent

`.factory/claims.json` does not exist in the clean checkout. Therefore there were no declared claim tests to run before QA and no evidence that public promises are asserted through the required demo entry point. This is expressly release-blocking under the claims contract.

The live site and README make claim-like promises including local/non-saved planner data, no telemetry, no trace payloads, no configuration transmission, and offline local planning. Add a complete `claims.json`, with exactly one `@claim:<id>` test per public claim, and run each from a clean demo sandbox.

### P0 — No required one-click, isolated sample-data demo

Cold live first-read evidence on desktop and 390 px mobile showed the headline **“One budget. Every collector.”**, a general autoscaling paragraph, and only **“Check a fleet”** and **“Install the CLI”** actions. It does not identify platform engineers as the audience in plain words, does not offer **“Try it with sample data”**, and does not put the required three plain facts on the first screen.

There is no demo route or CLI demo: `GET /demo` returns `404`; `?demo=1` is merely the normal page with no banner, separate namespace, reset, or start-for-real control; `sbc demo` exits `2` with `unrecognized subcommand 'demo'`. `.factory/demo.md` is also absent. For this CLI, the contract additionally requires a self-hosted landing-page terminal recording and a bundled `--demo`/`sbc demo` that runs in a temp directory and says where its output went.

Implement the isolated sample-data flow and documentation, then make the first action visibly **“Try it with sample data”** with a concise description of what happens. Rewrite the headline/subhead to say what it does and for whom in plain language.

## Other defects

### P2 — Required site metadata and real styled 404 are missing

`site/index.html`, `/privacy/`, and `/terms/` contain no canonical link, Open Graph/Twitter metadata, or apple-touch icon. The built output has no `404.html`; production `GET /404` returns a bare host 404 rather than a product-styled page with a way back. These are required by the site-structure contract.

### P2 — Required factory audit documents are missing

`.factory/copy-audit.md` and `.factory/demo.md` are absent. The former is required proof that all landing sentences were audited against the plain-words rules; the latter is required to document the demo command/URL, bundled sample, reset behavior, and storage isolation.

## What passed

### Clean checkout and package gates

- Clean checkout started at exactly `c1475d7f48b91246d3a811ec5679f83f05a9fc96`; `npm ci` completed with `npm audit`: 0 vulnerabilities.
- Fresh `npm test` passed: 6 Rust unit tests, 4 CLI integration tests, 1 doctest, and all 18 Playwright project executions (the suite reports `passed`; two project-specific skips are expected by the tests).
- `cargo clippy --all-targets --all-features -- -D warnings` passed.
- `npm run build` passed and emitted `dist/site`.
- `cargo package --locked --allow-dirty` passed and verified the package (14 files, 56.6 KiB unpacked / 17.0 KiB compressed).
- A clean consumer installed `target/package/sampling-budget-coordinator-0.1.0` using `cargo install --locked`. `sbc --help`, JSON plan output, zero-input recovery, exact boundary (`budget=4800`, `replicas=8`, `tolerance=0`, exit 0), invalid budget (exit 2), and over-budget assertion (exit 3) behaved as documented.

### Product behavior

- Representative bundled example with budget 600, replicas/scenarios 3/5/8, and input 12,000 reported 1,800 / 3,000 / 4,800 spans/s with a recommended 75 spans/s local goal. `assert` returned the expected JSON and exit 3 for over-budget input.
- Local browser planner rejected peak replicas below current replicas with an announced correction and recovered to “Within budget” after correcting peak to 8 and local goal to 60.
- Existing test coverage passed for keyboard skip-link focus, desktop and 390 px layout, serious/critical axe checks, error-free load, offline local planning, and old service-worker cache removal.

### Live deployment, privacy, and performance evidence

- All 15 publicly served files in `dist/site` matched the live response byte-for-byte (including HTML, assets, fonts, worker, legal pages, robots, sitemap, and favicon). `staticwebapp.config.json` correctly returns 404 because it is deployment host configuration, not a public artifact.
- Cold Chromium on desktop and 390×844 mobile: one h1, `lang=en`, title, main landmark, keyboard skip focus, visible operation, no horizontal overflow, no page/console errors, and no serious/critical axe findings.
- After an online load and service-worker control, a live offline reload returned 200, showed the h1, and recalculated to “Within budget” without errors. Reduced-motion transition duration was `1e-05s`.
- Request capture during the entire planner flow observed only `https://sampling-budget-coordinator.sociobot.in`; no cookies, localStorage, or sessionStorage keys were present. No analytics, external scripts, or outbound product requests were observed.
- Live headers include self-only CSP (`default-src`, `img-src`, `font-src`, `style-src`, `script-src`, and `connect-src`), `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, HSTS, `nosniff`, and `strict-origin-when-cross-origin`. HTML is `must-revalidate, max-age=30`; hashed assets are `public, max-age=31536000, immutable`.
- Build output is within the static budgets: main JS 3.49 kB (1.69 kB gzip), CSS 10.89 kB (3.19 kB gzip), and 640 px hero image 46 kB.

## Required follow-up

1. Add the required isolated demo (`sbc demo`/`--demo`, bundled sample, terminal recording, `/demo` or `?demo=1` semantics, banner/reset/start-real) and `.factory/demo.md`.
2. Add `.factory/claims.json` and clean-demo claim tests for every visitor-facing promise.
3. Replace the first screen with plain-language job/audience copy, a visible “Try it with sample data” primary action, and three plain facts.
4. Add missing metadata, product 404, and the copy audit; rerun independent verification.
