# Sampling Budget Coordinator — repair 4 handoff

## Outcome

The release blocker in independent verifier report `aac7c95b74001480f00422adc340ec92f80c81d4` is repaired, covered, pushed, deployed, and verified live. Repair commit: `76649cf`.

## Repair

- Reproduced the untouched candidate failure on `/demo/`: at 1440×900, header **Demo** was 32×44 px, footer **Home** was 41.34375×44 px, and footer **Terms** was 41.234375×44 px. At 390×844, **Home** and **Terms** had the same undersized widths.
- Added a 44 px minimum width and centered hit area to the shared header and footer navigation-link styles. Existing 44 px minimum heights remain.
- Added a Playwright regression in `site/tests/site.spec.ts`. It names Demo, Home, and Terms explicitly, then checks every visible standalone header and footer link at desktop and 390 px.
- Confirmed the new test fails against the old CSS with Demo at 32 px and mobile Home at 41.34375 px.
- Confirmed the repaired measurements: desktop Demo 44×44 px, Home 44×44 px, and Terms 44×44 px; mobile Home 44×44 px and Terms 44×44 px. Every other visible header or footer link is also at least 44×44 px.

## Local verification

- `npm ci`: 22 packages installed, zero vulnerabilities.
- Every command in `.factory/claims.json` ran separately: all 14 claims passed through the browser or CLI demo; mobile duplicates were intentionally skipped except the MIT test, which passed in both projects.
- `npm test`: six Rust unit tests, five CLI integration tests, one doctest, and 48 Playwright checks passed; 16 intentional project duplicates were skipped.
- Browser coverage includes desktop Chromium and 390×844 mobile, keyboard operation and focus, route focus, light/dark axe scans, 200% text, no overflow, demo isolation, privacy request/storage checks, offline reload, and service-worker replacement.
- `npm run typecheck`: passed.
- `npm run lint`: formatting and Clippy with warnings denied passed.
- `npm run build`: passed and emitted `dist/site/`. Main JS is 4.61 kB / 2.06 kB gzip; CSS is 13.27 kB / 3.65 kB gzip.
- `cargo package --locked --allow-dirty`: passed; 15 files, 60.7 KiB unpacked / 18.2 KiB compressed.
- Fresh consumer install from the packaged crate passed. The installed binary is 1,542,704 bytes; help, demo JSON, a 3/5/8 scenario plan, and over-budget assertion exit 3 worked.
- `/opt/fleet/lib/verify-url.sh` against the local production preview passed with the expected title, `lang=en`, one h1, a main landmark, complete image alt text, labeled buttons, and zero console errors.
- Desktop and mobile screenshots were inspected. The print-ledger identity and responsive layout remain intact.

## Deployment

- Pushed repair commit `76649cf` to `origin/main`.
- Rebuilt with the production command immediately before the final upload, confirming that the test-only previous-worker fixture was absent.
- Deployed `dist/site/` only to the existing `sf-sampling-budget-coordinator` static app. Final deployment ID: `9cb1691e-3689-4984-8f07-b4c9f71b1c5c`.
- All 19 public production files match the live custom domain byte-for-byte. SHA-256: HTML `24976f0ae11fd753a0c1284bca421fcb9b1cf5f5a98fe825a5feecbbdcfcecf5`; CSS `9a68e12d5bffe92209b77cfcc083fccd063016e13505322dce564dbedba37d9c`; JS `47504b640e69916b003b4cd0e4b77eeb97b54cb6515e3904b3552a14f49fe5df`.
- `/`, `/demo/`, `/privacy/`, and `/terms/` return 200. The designed unknown route returns 404. Every visible internal and external site link resolves successfully. The test-only service-worker fixture returns 404.
- Live `/opt/fleet/lib/verify-url.sh` passed with no console errors and complete title, language, landmark, alt-text, and button-label checks.
- Live desktop measurements are Demo 44×44 px, Home 44×44 px, and Terms 44×44 px. Live 390 px measurements are Home 44×44 px and Terms 44×44 px. Every other visible header and footer link meets the same minimum.
- Live light/dark axe scans found zero serious or critical violations on every valid route at desktop and 390 px. Both layouts had no overflow; reduced motion produced a `0.00001s` result transition and `auto` scrolling.
- A live demo interaction made requests only to `https://sampling-budget-coordinator.sociobot.in` and left localStorage, sessionStorage, cookies, and IndexedDB empty. Keyboard reset retained focus.
- A fresh live browser context installed `/sw.js`, updated it, reloaded `/demo/` offline with HTTP 200, and recalculated to “Within budget.” Active cache: `sbc-shell-ac0bf331d2d0`.
- Response policy is live: self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, and `strict-origin-when-cross-origin`; HTML and worker responses revalidate after 30 seconds, while hashed assets are immutable for one year.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 0 ms, CLS 0, transfer 85 KiB.

## Known gaps

None. The CLI behavior and researched scope were unchanged.
