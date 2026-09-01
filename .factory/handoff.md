# Sampling Budget Coordinator — polish round 2 handoff

## Outcome

**PASS — no known gaps.** Every finding in `.factory/review-1.md` and `.factory/review-2.md` is fixed, tested, deployed, and rechecked on the public URL. The full finding-to-evidence map is in `.factory/polish-2.md`.

## What changed

- The 404 “Open the planner” action now opens `/#planner` and has a desktop/mobile browser regression for destination, visibility, and route focus.
- The public README no longer includes package-release or factory publishing automation wording.
- The catalog description is now a verb-first 78-character sentence.
- The existing isolated browser/CLI demos, 14-claim manifest, product-specific visual system, route metadata, legal pages, mobile behavior, and CLI behavior remain intact.

## Verification

Clean clone `/tmp/sbc-polish2-clean-CyQfgk` at repair commit `eb7719a7d719a3e47aa7d5080eea2c398127c551`:

- All 14 `.factory/claims.json` commands passed separately.
- `npm test`: 10 unit, 8 integration, 1 doctest, and 52 browser checks passed; 16 intentional skips.
- `npm run typecheck`, `npm run lint`, and `npm run build`: passed.
- `cargo package --locked`: passed; 20.8 KiB compressed package.
- Built JS: 2.06 kB gzip. Built CSS: 3.68 kB gzip.

Production at `https://sampling-budget-coordinator.sociobot.in/`:

- Deployed through the static work-order path; deployment id `fbe58730-4643-40a1-bd74-d0aa1a490237`.
- All 19 served files match the local production build byte-for-byte.
- Cold route checks: all public routes 200; unknown route 404; correct titles, one h1, one main landmark, metadata, CSP, referrer policy, and content-type protection.
- `/opt/fleet/lib/verify-url.sh`: passed, no console errors. Evidence under `/tmp/sbc-polish2-live/`.
- Live axe: zero serious/critical findings on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html`.
- Live demo: banner/reset/exit work; storage stays empty; all requests are same-origin; offline reload and calculation pass.
- Live 404 recovery: `/#planner`, planner visible, focus on `H1#page-title`.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.214 s, CLS 0, TBT 0 ms.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked
```

Run any declared contract exactly as listed in `.factory/claims.json`, for example:

```sh
npm run test:claim -- @claim:demo-sandbox
```

## Known gaps and next steps

None.
