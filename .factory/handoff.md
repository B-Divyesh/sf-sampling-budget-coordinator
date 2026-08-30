# Sampling Budget Coordinator — repair handoff

## Release decision

**PASS — repaired and deployed 2026-08-30.** This repair starts from verifier report commit `07835e9d58498a90e8400d19ac0ca636bb208bab`, fixes every finding against candidate `c1475d7f48b91246d3a811ec5679f83f05a9fc96`, and preserves the Rust CLI plus static-site deployment class.

The repaired product code is committed through `619dcfc40d9269d75e913790e2215ea916d45c2c` and is live at `https://sampling-budget-coordinator.sociobot.in/`.

## Repairs

- Added `.factory/claims.json` with seven visitor-facing claims. Each maps to exactly one tagged Playwright test and a clean demo sandbox procedure.
- Added the one-click `/demo/` flow. It opens a working eight-replica sample, keeps state only in page memory, and provides persistent **Reset demo** and **Start for real** controls.
- Added `sbc demo` and `sbc demo --json`. They copy the bundled collector config to a unique operating-system temporary directory, run the production planner, save `report.json`, and print the location.
- Added a self-hosted, selectable terminal transcript captured from the real CLI demo.
- Replaced the first-screen slogan with a five-word job headline, a named platform-engineer audience, the required sample action, and three plain facts.
- Added `.factory/demo.md` and `.factory/copy-audit.md`. Every audited landing sentence is within 22 words and uses no banned marketing terms.
- Added per-route canonical, Open Graph, Twitter, theme, favicon, and 180 px touch-icon metadata. The social card is 1200×630 and derived from the original fleet-ledger art.
- Added a product-styled `404.html` and Static Web Apps 404 rewrite.
- Kept the prior skip-link focus and cache-version fixes. The worker now precaches the exact hashed build files, forces full cache responses, removes older shell caches, and claims clients only after activation cleanup.
- Added bound form help/error relationships, 44 px navigation targets, all-route light/dark axe checks, and 200% mobile text-resize coverage.

## Verification evidence

All checks ran from `/work/repo` on 2026-08-30.

- `npm ci`: 22 packages installed; 0 vulnerabilities.
- `npm test`: 6 Rust unit tests, 5 CLI integration tests, 1 doctest, and 46 desktop/mobile Playwright executions passed (37 passed, 9 intentional project-specific skips).
- Every command in `.factory/claims.json` passed independently.
- `npm run typecheck`: passed.
- `npm run lint`: rustfmt and Clippy with warnings denied passed.
- `npm run build`: passed and emitted `dist/site` without test-only worker assets.
- Production payload: main JS 3.92 kB, CSS 13.17 kB, fonts 30.33 kB total, mobile hero 46.06 kB. These are below the product budgets.
- `cargo package --locked --allow-dirty`: passed; 15 files, 60.7 KiB unpacked and 18.3 KiB compressed.
- A clean temporary consumer installed the packaged source with `cargo install --locked`. The installed `sbc 0.1.0` returned the sample 75 spans/s goal, exit 0 at the exact boundary, exit 2 for invalid input, and exit 3 for over-budget output.
- Local `/opt/fleet/lib/verify-url.sh`: HTTP 200, correct title and language, one h1/main, no missing alt text, no unlabeled buttons, and no console errors.
- Local production Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.509 s, CLS 0, total blocking time 0 ms.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.209 s, CLS 0, total blocking time 0 ms.
- Live browser checks: desktop and 390×844 layout, keyboard skip/reset/form operation, light/dark axe scans, reduced motion (`1e-05s` transition), no console errors, no horizontal overflow, empty cookies/local/session storage, only same-origin requests, and an offline recalculation to **Within budget** all passed.
- Live identity: all 19 public files matched `dist/site` byte for byte. Local/live `index.html` SHA-256 is `8dda374620decd76639668a1585c92d96e7804ca6b1bde001f29fa97d2d2d731`.
- Live response policy: unknown routes return the styled page with HTTP 404; `staticwebapp.config.json` is not public; HTML revalidates; hashed assets are immutable; CSP, HSTS, `nosniff`, and strict-origin referrer headers are present.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked --allow-dirty
cargo run -- demo
```

To run one claim exactly, use its `.factory/claims.json` command, for example:

```sh
npm run test:claim -- @claim:offline-reload
```

## Deployment

`dist/site` was uploaded to the existing `sf-sampling-budget-coordinator` Azure Static Web App using only that resource's deployment token. No other service, database, vault, DNS record, billing resource, or infrastructure was read or changed.

## Known gaps and next steps

No release-blocking gap remains. Registry publishing remains factory-owned; this work order did not publish the crate.
