# Sampling Budget Coordinator — repair 5 handoff

## Outcome

The two P1 defects and one P2 boundary defect in independent verifier report `c5b00cb7000d08962f32a61bf29ba7be44ec597e` are repaired, covered, pushed, deployed, and verified live. Product commits are `3a6f6f5` and `adf0c2b`.

## Repairs

- Reproduced the exact mixed-policy failure before changing code: a conditional 10% probabilistic rule, local throughput goal 75, input 12,000, budget 600, tolerance 10%, and eight replicas reported a 75 recommendation while estimating 1,800 against a 660 allowance.
- Recommendations now run through the same pipeline estimator as configured goals. The planner reserves modeled percentage and always-sample volume, scales local throughput rules proportionally, and checks every requested replica scenario. The exact 10% case now omits the impossible recommendation and explains that non-throughput rules alone estimate 1,200 spans/s. A 2% mixed-policy regression recommends 45; applying it estimates 375, 465, and 600 spans/s at 3, 5, and 8 replicas, all within the 660 allowance.
- Added required, realistic `fingerprint_attributes` to the bundled sample, README, doctest, integration fixtures, and claim fixtures. Both `adaptive_throughput` and `adaptive_percentage` now reject missing, empty, non-string, or unscoped fingerprint selectors with exit 2. The supported-sampler claim covers valid documented shapes and missing-field rejection.
- Reproduced `--budget 1e308 --tolerance 100` returning JSON `null` values with exit 0. Checked arithmetic and a final report invariant now reject every non-finite derived number. The exact command exits 2, writes no JSON, and tells the operator to use smaller numeric inputs. Coverage also includes utilization overflow from a very small finite budget.
- A live system-dark audit found four vermilion controls at 2.49:1 when dark mode came from the operating system. The dark media treatment now uses dark ink for those controls. A regression scans every route under native dark preference at desktop and 390 px.

## Local verification

- `npm ci`: 22 packages installed; zero reported vulnerabilities.
- Every command in `.factory/claims.json` ran separately: all 14 claims passed. Thirteen CLI/browser claims passed once with one intentional mobile duplicate skip; the MIT claim passed in both projects.
- Final `npm test`: 10 Rust unit tests, 8 CLI integration tests, 1 doctest, and 50 Playwright checks passed; 16 intentional project duplicates were skipped.
- Browser coverage includes desktop Chromium and 390×844 mobile, light, explicit dark, native system dark, keyboard navigation and focus retention, route focus, 200% text, 44 px targets, no overflow, privacy, demo isolation, offline reload, and service-worker replacement.
- `npm run typecheck` and `npm run lint`: passed. Lint includes Rust formatting and Clippy with warnings denied.
- `npm run build`: passed and emitted `dist/site/`. Production main JS is 4.61 kB / 2.06 kB gzip; CSS is 13.52 kB / 3.68 kB gzip; fonts total 30.33 kB; the mobile illustration is 46.06 kB. The test-only worker is absent.
- `cargo package --locked`: passed; 15 files, 76.0 KiB unpacked / 20.9 KiB compressed.
- A fresh consumer installed the packaged crate with `--locked`. Its 1,558,424-byte binary passed help, version, demo JSON, 3/5/8 planning, assertion exit 3, and finite-overflow exit 2 checks.
- `/opt/fleet/lib/verify-url.sh` passed against the local production preview. Desktop and mobile screenshots were inspected at `/tmp/sbc-local-browser.NUNoYp/`.
- Local mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.5 s, TBT 0 ms, CLS 0.

## Deployment and live verification

- Pushed both repair commits to `origin/main` and deployed only `dist/site/` to the existing `sf-sampling-budget-coordinator` static app. Final deployment ID: `7523767a-3e67-4f6c-948a-0fc5a7114484`.
- All 19 public build files match `https://sampling-budget-coordinator.sociobot.in` byte-for-byte. SHA-256: HTML `59a73ab94b37f6a4ab15c8099b0354759dc27782daea37f89c7fb8d0cc161c3d`; CSS `48142b873bcbc3600dfd1df47f495bf13d745c4f2127fa4b45adc23868a2cdd0`; JS `47504b640e69916b003b4cd0e4b77eeb97b54cb6515e3904b3552a14f49fe5df`; worker `088e190dcb5669399be2436ed532426c5f4281bb05cbea2b7f6972791695d489`.
- `/`, `/demo/`, `/privacy/`, and `/terms/` return 200. The designed unknown route and test-only worker return 404.
- Live `/opt/fleet/lib/verify-url.sh` reports the expected title, `lang=en`, one h1, a main landmark, complete image alternatives, labeled buttons, and zero console errors. Evidence is at `/tmp/sbc-live-final.1pP64Q/`.
- Twenty live axe/structure checks passed across five routes, desktop and 390 px, and native light/dark preferences. There were zero serious or critical violations and no horizontal overflow.
- A live demo flow made requests only to the product origin. Local storage, session storage, cookies, and IndexedDB stayed empty. Space activated **Reset demo** and focus remained on the button.
- Reduced motion reports a `0.00001s` result transition and automatic scrolling. The current worker updated, then `/demo/` reloaded offline with HTTP 200 and recalculated to “Within budget.” Active cache: `sbc-shell-9a5eee4e568a`.
- Response policy is live: self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, and `strict-origin-when-cross-origin`; HTML revalidates after 30 seconds and hashed assets are immutable for one year.
- Final live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 0 ms, CLS 0.

## Known gaps

None. The artifact remains a Rust CLI with a static landing/demo site. It uses deterministic local calculations and no AI, backend, analytics, accounts, payments, database, or remote persistence.
