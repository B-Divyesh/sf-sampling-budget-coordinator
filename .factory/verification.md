# Independent verification — FAIL

Verified 2026-08-28 against candidate commit `ecf34142eb1424a791d74f11b2108aa66784fddf` on `main` and production URL `https://sampling-budget-coordinator.sociobot.in/`.

## Decision

**FAIL.** The central CLI planning and deploy assertion workflows work, the static deployment matches this candidate, and the automated gates pass. Two companion-PWA acceptance requirements are not met: the keyboard skip link does not place focus in main content, and a future service-worker update can preserve the old app shell. A local-data handling claim is also broader than the implementation.

## Defects

### P2 — Skip link scrolls but leaves keyboard focus outside main

`site/index.html` (and legal pages) link to `#main`, but the target `<main>` is not focusable. Fresh Chromium keyboard evidence: after Tab, the visible `3px` teal ring is on “Skip to main content”; after Enter, `document.activeElement` is `BODY`, not `#main`. Keyboard users must tab through header controls again instead of continuing at the main landmark. Add `tabindex="-1"` to each main target and focus it when the skip link is activated (or otherwise ensure native focus transfer), then add a keyboard regression test.

### P2 — PWA cache does not have a safe update version boundary

`site/public/sw.js` uses the fixed name `sbc-shell-v1` and a cache-first response for `/`. The installed worker was confirmed to control the live app and offline reload passed. However, a changed worker that retains this constant activates without deleting that same cache, so the old cached `index.html` and runtime assets can continue to be served after a deployment. Version the cache from the build/release identity and test an old-worker-to-new-worker upgrade before enabling the next release.

### P3 — “Never reads credentials or customer identifiers” is not literally true

The README/privacy wording says the CLI never reads credentials or customer identifiers, but `src/main.rs` reads the entire selected YAML into a `String` and `src/lib.rs` deserializes the complete document into `serde_yaml::Value`. Collector configs can include exporter headers, endpoint identifiers, or auth settings outside the trace pipeline. Nothing was transmitted, persisted, logged, or returned during testing; this is a local-memory/minimization and documentation-contract issue. Either scope the claim to trace payloads and outbound handling, or parse only the required configuration subtree.

## What passed

### Clean checkout, build, package, and tests

- Checkout was clean and exactly at the candidate hash before verification.
- `npm ci` completed with `npm audit`: 0 vulnerabilities.
- Fresh `npm test`: passed 6 Rust unit tests, 3 CLI integration tests, 1 doctest, and Playwright’s 13 tests on desktop and 390 px mobile (1 desktop project skip for the explicitly mobile-only assertion). `test-results/.last-run.json` is `passed`.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `npm run build`: passed; production files were emitted to `dist/site`.
- `cargo package --locked --allow-dirty`: passed and package verification compiled; 14 files, 55.6 KiB unpacked / 16.6 KiB compressed.
- A clean temporary consumer installed the packaged source with `cargo install --path target/package/sampling-budget-coordinator-0.1.0 --root <temp> --locked`. Its `sbc 0.1.0` binary produced the documented JSON report and returned exit 3 for an over-budget assertion.

### CLI end to end

- Representative `examples/collector.yaml`, budget 600, replicas/scenarios 3/5/8, input 12,000: reports 1,800 / 3,000 / 4,800 spans/s and safe local goal 75; `assert` returns exit 3 with `sbc.report/v1` JSON.
- Exact boundary: a 75 spans/s local goal at 8 replicas, budget 600, tolerance 0 reports 600 spans/s and `assert` exits 0.
- Boundary/recovery: input 0 reports 0 and within budget. Budget 0, replicas 0, tolerance 101, negative input, absent sampling processor, and missing file return the documented invalid/unsupported exit path (2); a subsequent valid invocation succeeds.
- `sbc --help`, `plan`, `assert`, `--json`, and the documented 0/2/3 exit behavior were exercised. The library’s public doctest also compiled and ran.

### Browser, privacy, and deployment

- Fresh Chromium checks on the live deployment: normal calculation, invalid peak-replica error, recovery to within-budget, 390×844 layout, reduced-motion (`transitionDuration` observed as `1e-05s`), offline reload, installed service-worker control, no page/console errors, and no runtime requests outside `sampling-budget-coordinator.sociobot.in` all passed.
- The existing Playwright axe checks passed with no serious or critical findings in light or dark treatment on desktop/mobile.
- Runtime search and request capture found no analytics, cookies, storage, external fonts/scripts, or telemetry. All runtime requests were same-origin. CSP restricts default/image/font/style/script/connect to `'self'`; `object-src 'none'`, `base-uri 'self'`, and `frame-ancestors 'none'` are present. HSTS, `nosniff`, and strict-origin referrer policy are live.
- Production `index.html` is byte-identical to the candidate build: SHA-256 `4ec073388c527b9454c771d9be65757d4f96bd04b46594fcd1667ad6f514f6f7`, 8,286 bytes. All deployable generated files matched byte-for-byte; `staticwebapp.config.json` correctly returns 404 because it is host configuration, not a public artifact.
- Live hashed assets use `cache-control: public, max-age=31536000, immutable`; HTML, legal pages, and `sw.js` use `public, must-revalidate, max-age=30`.

### Budget and quality evidence

- Built JS: 4,324 bytes total (main entry 3,199 bytes); CSS: 10,891 bytes; self-hosted fonts: 30,328 bytes; mobile hero WebP: 46,062 bytes. All are under the stated budgets. `dist/site` totals 284 KiB including the optional larger hero and legal/font-license assets.
- Title, `lang=en`, one h1 per page, main landmarks, label/error announcement behavior, responsive mobile layout, focus ring styling, legal pages, and no horizontal overflow were checked.
- A fresh Lighthouse mobile run was attempted against production but Lighthouse 13 crashed its supplied Chromium target after collecting artifacts, so no score is claimed from this verification. Bundle-budget evidence and Playwright accessibility/performance-adjacent checks above are valid.

## Required follow-up

Fix the two P2 defects, narrow or make true the privacy claim, add regression coverage for keyboard skip-focus and an actual old-cache/new-worker upgrade, then rerun this verification.
