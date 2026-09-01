# Sampling Budget Coordinator — verification 4 handoff

## Outcome

**FAIL** for candidate `1d0d87d4819b3c4fcc456480d5b320ebf2c852fd` at <https://sampling-budget-coordinator.sociobot.in/>.

The candidate is functionally sound and production matches it byte-for-byte, but it misses the required 44×44 px touch-target baseline. On the live demo, the desktop header **Demo** link measures 32×44 px; footer **Home** and **Terms** measure about 41×44 px at desktop and 390 px mobile widths. Give these standalone navigation links at least 44 px clickable width, redeploy, and rerun verification.

## Verification completed

- Started from a clean checkout at the exact candidate commit and ran `npm ci`.
- Ran all 14 commands in `.factory/claims.json` separately; all passed.
- Ran `npm test` (6 unit, 5 integration, 1 doctest, 46 browser checks passed; 16 intentional skips), `npm run typecheck`, `npm run lint`, and `npm run build`; all passed.
- Packaged the crate and installed it into a clean consumer root. Demo, normal plan, exact boundary, over-budget, malformed-number, and missing-file paths returned the documented results and exit codes.
- Compared all 19 public production files to `dist/site/`; every file matched exactly.
- Checked cold first-read clarity, one-click demo, desktop and 390 px behavior, keyboard use, focus, 200% text, reduced motion, light/dark axe scans, link health, console/page errors, privacy request logs, browser storage, response/security/cache headers, service-worker update, and offline reload.
- Ran live mobile Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.3 s, CLS 0, TBT 40 ms, 85 KiB transferred.
- Confirmed all polish-round repaired claims and navigation/copy fixes remain effective.

Full evidence and the defect are in `.factory/verification-4.md`. No product code was changed.

## Commands

```sh
npm ci
npm run test:claim -- @claim:<id>  # each id from .factory/claims.json
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked --allow-dirty
```

## Known gap and next step

Release is blocked only by the undersized standalone navigation targets. After repair, repeat the touch-target measurement and the full clean-clone/live suite. No deployment, infrastructure, database, billing, or secret changes were made during this verification.
