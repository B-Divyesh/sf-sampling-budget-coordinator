# Sampling Budget Coordinator — independent verification 5 handoff

## Outcome

**FAIL.** Candidate `cd98653054a3168af8e08dea762f6d9cdd8febf4` was checked against `https://sampling-budget-coordinator.sociobot.in/` on 2026-09-01. The deployed product matches all 19 production build files, but two P1 core-product defects block release.

## Release blockers

1. The bundled and README `adaptive_throughput` examples omit required `fingerprint_attributes`. The cited OpenTelemetry component required that field by 2026-08-25, before the repository's stated 2026-08-28 schema date. `sbc demo` accepts the incomplete configuration and reports success.
2. A supported mixed-policy configuration can receive a recommended local goal that remains over budget under the CLI's own model. With a conditional 10% probabilistic rule, local throughput goal 75, input 12,000, budget 600, tolerance 10%, and 8 replicas, the report recommends 75 while estimating 1,800 against an allowance of 660.

One P2 boundary defect is also recorded: a finite budget of `1e308` with 100% tolerance exits 0 but serializes derived numeric fields as `null`.

Full evidence and reproduction details are in `.factory/verification-5.md`.

## Passing checks

- All 14 claim commands pass after `npm ci`; the supported-sampler fixture quality concern is documented in the report.
- `npm test`: 6 unit, 5 CLI integration, 1 doctest, and 48 browser checks passed; 16 intentional skips.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --locked` pass.
- The packaged crate installs into a clean consumer and its documented exits, JSON, demo, and recovery paths work for the shipped fixtures.
- The first screen passes the cold-read and one-click-demo requirements.
- Live privacy, security headers, cache policy, offline reload, keyboard use, visible focus, reduced motion, 200% text, 44 px targets, and desktop/mobile layouts pass.
- Live axe checks report zero serious or critical findings across every route and both themes.
- Fresh mobile Lighthouse scores 100 in Performance, Accessibility, Best Practices, and SEO; LCP is 1.2 s and transfer is 85 KiB.

## Repository state

Only verification documentation was changed. Product code was not modified. Run the commands under **Reproduce** in `.factory/verification-5.md` after correcting the release blockers.
