# Sampling Budget Coordinator — polish round 3 handoff

## Outcome

**PASS.** This repair closes every finding in `review-1.md`, `review-2.md`, and `review-3.md`.

The central repair is a test-scoped Playwright fixture. Every browser test now launches and closes its own Chromium process, context, and page. A crash can no longer poison later tests through a shared browser. The configuration uses two low-concurrency workers, one clean-process retry, and CI runs `npm run test:repeat` from its fresh checkout.

The first-screen demo action now enters `/?demo=1`, which replaces into canonical `/demo/` isolated mode. The query path has regression coverage for its banner, reset control, and route-focus behavior on Back.

## Commits and deployment

- `0abb6b1586a7516d34941905079891a8f14583fe` — isolated browser lifecycle and repeated CI gate.
- `b2c66c3be659e281b1314bd97e5e4d7b0c340fdd` — query demo entry and focus preservation.
- Static production deployment completed to `https://sampling-budget-coordinator.sociobot.in/` (Static Web App `sf-sampling-budget-coordinator`; default host `https://blue-coast-03129da0f.7.azurestaticapps.net/`).

## Verification

From clean clone `/tmp/sbc-polish3-final-a.q3JUyE`:

```sh
npm ci
npm test
```

From independent clean clone `/tmp/sbc-polish3-final-b.b8NJOP`:

```sh
npm ci
# Every exact test command in .factory/claims.json, run separately
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked
```

Both full runs passed with 10 Rust unit tests, 8 integration tests, 1 doctest, and 70 Playwright entries. All 14 declared claim commands passed separately in the second clone. `cargo package --locked` packaged and verified 15 files (76.1 KiB unpacked, 20.9 KiB compressed).

Cold production evidence is at `/tmp/sbc-polish3-final-live.2nxpp7/`:

- `verify.json` — expected title, `lang=en`, one h1, main landmark, complete alt text, labeled controls, and no console errors.
- `screenshot-desktop.png`, `screenshot-mobile.png`, `live-demo-mobile.png` — visual checks.
- A fresh live Playwright/Axe check found zero serious or critical violations on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` at 1440 px and 390 px. It also passed `?demo=1` isolation/reset/storage, same-origin request, offline reload, route-focus, and 404 recovery checks.
- `lighthouse-mobile.json` — Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.43 s, CLS 0, TBT 45 ms, 87 KB transfer.

## Run and deploy

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked
```

Deploy `dist/site/` to the owned Static Web App production environment. The CLI package is ready to publish with `cargo package --locked`; do not publish it from this repository.

## Known gaps

None.
