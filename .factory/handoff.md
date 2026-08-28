# Sampling Budget Coordinator — handoff

## Independent verifier gate — FAIL (2026-08-28)

Candidate `ecf34142eb1424a791d74f11b2108aa66784fddf` was independently tested at `https://sampling-budget-coordinator.sociobot.in/`. The live generated deployment matches the candidate byte-for-byte and the CLI/build/test/package gates passed, but this handoff is **FAIL** until the following are fixed:

- **P2 accessibility:** the skip link leaves focus on `BODY`, not `#main`, after Enter.
- **P2 PWA updates:** the fixed `sbc-shell-v1` cache name can keep the old cached shell across a new worker deployment.
- **P3 privacy contract:** the implementation deserializes the complete selected YAML, contradicting the unqualified claim that it never reads credentials/customer identifiers (no transmission, persistence, or logging was observed).

See `.factory/verification.md` for exact commands, browser evidence, packaging test, deployment hashes/headers, and reproduction/fix guidance. The prior self-verification notes below are retained as builder context and do not override this independent FAIL gate.

## What shipped

- `sbc` 0.1.0, a Rust/clap single binary with `plan` and `assert` commands, human and stable `sbc.report/v1` JSON output, actionable config errors, and exit codes 0/2/3.
- Collector YAML discovery through the configured traces pipeline. Supported samplers are the documented `adaptive_tail_sampling` types (`adaptive_throughput`, `adaptive_percentage`, `probabilistic`, `always_sample`) and top-level `probabilistic_sampler`. Multiple local throughput rules are conservatively summed.
- Replica scenarios, fleet ceiling/export estimates, per-rule proportional recommendations, configurable 10% default tolerance, and explicit calculation assumptions/warnings.
- A Vite static landing/docs site with a real local planner, generated CI command, copy feedback, dark/light treatments, offline state/service worker, privacy and terms pages, keyboard focus, and responsive 390 px layout.
- Original two-ink halftone hero generated with the factory image service. The retained source/prompt metadata are in `.factory/assets/`; optimized 45 KB and 114 KB WebP variants ship on the site.
- MIT license, changelog, README usage contract, CI workflow, and self-hosted IBM Plex Mono fonts with their license.

## Run and release

```sh
npm ci
npm test
npm run build          # deployable static output: dist/site/
cargo package --locked # publishable crate: target/package/*.crate
```

The factory owns publishing and deployment. Deploy `dist/site/`; publish the crate/package after normal release review. No product ID, billing integration, analytics, secrets, or runtime service is needed.

## Verification on 2026-08-28

- `npm test`: passed 6 Rust unit tests, 3 CLI integration tests, 1 compiling doctest, and 14 Playwright desktop/mobile checks (1 desktop-only mobile-layout case skipped by design).
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `cargo package --locked --allow-dirty`: verified; package is 17 KB compressed (55 KB unpacked).
- `npm audit`: 0 vulnerabilities.
- `npm run build`: passed; `dist/site/index.html` exists. Total static output is 284 KB; initial application JS is 3.2 KB uncompressed, CSS is 10.9 KB, fonts total 31 KB, and mobile hero is 45 KB.
- Playwright + axe-core: no serious/critical violations in light or dark mode; desktop and 390 px mobile planner, errors, offline behavior, legal pages, and no-horizontal-overflow checks passed.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200; title/lang/main/one h1/alt/button-label checks passed; 608 ms local load; zero console errors.
- Lighthouse 13 mobile profile against the production build: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.54 s, CLS 0, TBT 0 ms (lab proxy for INP).

## Known boundaries

- Replica counts and input rates are supplied explicitly; v1 does not query Kubernetes or collector telemetry.
- Estimates are steady-state. They do not simulate adjustment lag, bursts, uneven load balancing, cross-instance trace assembly, or vendor accounting.
- Conditional rules lack traffic-share data, so throughput rules are summed and `always_sample` may conservatively allow all input. The report makes those assumptions visible.
- Schema 0.1 rejects unknown sampling processors and multiple traces pipelines instead of guessing. Audit each pipeline separately until multi-pipeline allocation is added.
- The upstream adaptive tail sampler is development-stage; validate config compatibility when upgrading the collector.

## Suggested next steps

Add Kubernetes replica discovery as an opt-in adapter, per-rule traffic-share inputs for tighter mixed-policy bounds, and saved JSON baselines for budget-diff pull request checks.
