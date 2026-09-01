# Sampling Budget Coordinator — repair 4 handoff

## Outcome

The release blocker in independent verifier report `aac7c95b74001480f00422adc340ec92f80c81d4` is repaired locally. Deployment and live verification are pending.

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

Pending commit, push, slug-scoped static deployment, and live identity/response-policy verification.

## Known gaps

Only the pending deployment and live checks above. The CLI behavior and researched scope were unchanged.
