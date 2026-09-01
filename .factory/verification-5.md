# Independent verification 5 — FAIL

Verified 2026-09-01 against candidate commit `cd98653054a3168af8e08dea762f6d9cdd8febf4` and `https://sampling-budget-coordinator.sociobot.in/`.

## Decision

**FAIL.** The build, declared claim commands, package installation, static deployment, browser demo, privacy behavior, offline reload, accessibility checks, and performance checks pass. Two P1 product defects block release: the shipped collector sample is not valid for the documented upstream sampler schema, and the CLI can label a local goal as recommended even when that goal remains over budget under the same report model.

No product code was changed during this verification.

## Release-blocking defects

### P1 — The shipped adaptive sampler examples omit a required field

The bundled sample in `examples/collector.yaml` and the README usage example define `adaptive_throughput` rules without `fingerprint_attributes`. The claim fixtures for `adaptive_throughput` and `adaptive_percentage` omit it too.

The cited OpenTelemetry Collector component required at least one `fingerprint_attributes` entry for both adaptive sampler types by commit `8bf679ce36bb` on 2026-08-25. Its validator returns `fingerprint_attributes must contain at least one entry`. Its documented `adaptive_throughput` examples include that field. This predates the README statement that version 0.1 follows the documented development schema on 2026-08-28.

Fresh evidence:

- `examples/collector.yaml:10-15` contains two adaptive-throughput samplers with goals but no fingerprints.
- `README.md:38-41` presents the same incomplete configuration as the main usage example.
- `site/tests/claims.spec.ts:118-127` labels adaptive fixtures as documented sampler configurations while omitting the required field.
- `sbc demo --json` accepts the bundled file and exits 0, so the one-click CLI demo does not reveal that the shown collector configuration is rejected by the documented collector schema.
- Upstream reference at the relevant date: `https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/8bf679ce36bb/processor/adaptivetailsamplingprocessor/config.go` and its README.

Impact: the primary sample and copy-paste usage do not represent a deployable collector configuration. The `supported-sampler-models` claim test passes against locally invented incomplete fixtures, so it does not confirm the stated compatibility claim.

Required correction: make every adaptive sample a valid documented configuration, add fingerprints that reflect realistic fleet traffic, and check fixtures with the upstream configuration validator or equivalent schema coverage.

### P1 — A recommended local goal can remain over budget

The CLI calculates `recommended_local_throughput_goal` as `budget / peak replicas` without reserving budget for supported percentage or always-sample rules in the same adaptive processor.

Fresh packaged-binary reproduction used a valid adaptive-tail shape with a conditional 10% probabilistic rule, a default adaptive-throughput rule with `goal_throughput: 75`, and a required service-name fingerprint. Inputs were budget 600, tolerance 10%, input 12,000 spans/s, and peak 8 replicas.

Observed JSON:

- `recommended_local_throughput_goal`: `75.0`
- configured local goal: `75.0`
- peak estimated export: `1800.0`
- maximum allowed: `660.0`
- overall status: `over_budget`
- process exit: `0` for `plan`

The reported recommendation therefore does not satisfy the tool's own estimate. This conflicts with the landing-page and brief promise to set safe per-instance goals for supported collector policies.

Required correction: calculate a conservative residual budget after non-throughput rules, or omit the recommendation with a clear reason when the available traffic-share data cannot establish a safe value. Add a claim test that applies the recommendation to supported mixed policies and confirms every requested scale scenario falls within the allowance.

## Other defect

### P2 — Large finite inputs produce null numeric fields

`sbc plan --config examples/collector.yaml --budget 1e308 --replicas 1 --input 12000 --tolerance 100 --json` exits 0, but derived floating-point values overflow. The JSON contains `maximum_allowed_spans_per_second: null` and `recommended_goal_throughput: null` entries.

The input passes current finite-value validation, but the resulting report no longer preserves its numeric field contract. Checked arithmetic should return the documented invalid-input exit 2 with a correction message.

## Mandatory claim contract

`.factory/claims.json` exists and lists 14 claims. In the untouched dependency state, every command reached the site build and stopped because the local Vite executable was not yet installed. After the required locked install with `npm ci`, every listed command was rerun exactly as declared:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS — 1 passed, 1 intentional project skip |
| `local-privacy` | PASS — 1 passed, 1 intentional project skip |
| `offline-reload` | PASS — 1 passed, 1 intentional project skip |
| `sample-budget` | PASS — 1 passed, 1 intentional project skip |
| `deploy-assertion` | PASS — 1 passed, 1 intentional project skip |
| `unsupported-policy` | PASS — 1 passed, 1 intentional project skip |
| `supported-sampler-models` | PASS mechanically, but its adaptive fixtures are not valid upstream configurations; see P1 |
| `configuration-errors` | PASS — 1 passed, 1 intentional project skip |
| `scenario-assertion` | PASS — 1 passed, 1 intentional project skip |
| `assumption-reporting` | PASS — 1 passed, 1 intentional project skip |
| `default-tolerance` | PASS — 1 passed, 1 intentional project skip |
| `upper-bound-without-input` | PASS — 1 passed, 1 intentional project skip |
| `plan-report` | PASS — 1 passed, 1 intentional project skip |
| `mit-license` | PASS — 2 passed |

The claim command result alone is not sufficient for `supported-sampler-models`: its fixtures do not meet the schema it says they represent. The mixed-policy safe-goal outcome is also not covered by a claim test.

## Cold first-read and demo check

The first screen passes at desktop and 390 px without scrolling:

- What it does: “Keep collector sampling within budget.”
- Who it is for: platform engineers managing OpenTelemetry fleets.
- First action: “Try it with sample data,” paired with “Loads an isolated eight-replica fleet.”
- Three facts state local privacy, offline behavior, and MIT licensing.

One click opens `/demo/` with populated values, an over-budget result, the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, and **Start for real**. Reset restores the sample and retains focus. Leaving demo mode opens `/` with the regular default state.

## Clean-clone quality gates and package check

- `npm ci`: PASS — 22 packages installed; zero reported vulnerabilities.
- `npm test`: PASS — 6 Rust unit tests, 5 CLI integration tests, 1 doctest, and 48 Playwright checks passed; 16 intentional project-specific duplicates skipped.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS — formatting and Clippy with warnings denied.
- `npm run build`: PASS — exact production build emitted `dist/site/`; the test-only prior-worker fixture was absent.
- `cargo package --locked`: PASS — 15 files, 60.7 KiB unpacked and 18.2 KiB compressed.
- Clean consumer installation from `target/package/sampling-budget-coordinator-0.1.0`: PASS. Installed binary size: 1,542,704 bytes.

The installed binary confirms useful help, version 0.1.0, sample JSON, 3/5/8 scenario results, exact-budget exit 0, over-budget exit 3, invalid-input exit 2, missing-file guidance, and a valid follow-up command after errors. The demo creates only `collector.yaml` and `report.json` in its disclosed temporary directory.

## Browser planner checks

Fresh live checks confirmed:

- Exact boundary: 75 spans/s × 8 replicas at zero tolerance is within a 600 spans/s budget.
- Just above boundary: 75.01 × 8 reports 600.1 and “Over budget.”
- Zero incoming volume reports zero export.
- Equal current and peak replicas produce one scenario row.
- Peak below current, fractional replicas, and tolerance above 100 show specific announced errors.
- A valid follow-up submission clears the error and recalculates.

## Live identity, privacy, headers, and offline behavior

- All 19 public files in the production build match the live custom domain byte-for-byte. Landing SHA-256: `24976f0ae11fd753a0c1284bca421fcb9b1cf5f5a98fe825a5feecbbdcfcecf5`; main JS SHA-256: `47504b640e69916b003b4cd0e4b77eeb97b54cb6515e3904b3552a14f49fe5df`.
- `/`, `/demo/`, `/privacy/`, and `/terms/` return 200. An unknown route returns the designed page with HTTP 404. All visible internal links, fragment targets, and the source link resolve.
- `/opt/fleet/lib/verify-url.sh` passes: HTTP 200, expected title, `lang=en`, one h1, main landmark, complete image alt text, labeled buttons, and no console errors. Evidence: `/tmp/sbc-verify-url-E6g35h/`.
- A complete live demo interaction makes requests only to `https://sampling-budget-coordinator.sociobot.in`. Local storage, session storage, cookies, and IndexedDB remain empty. No analytics, ads, account, payment, or remote planner request is present.
- Response headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, and `strict-origin-when-cross-origin` referrer policy.
- HTML and `/sw.js` revalidate after 30 seconds. Hashed assets use a one-year immutable cache policy.
- The active worker is `/sw.js` with cache `sbc-shell-ac0bf331d2d0`. `registration.update()` completes; `/demo/` reloads offline with status 200 and recalculates. The test-only worker path returns 404.

This product has no server-side product endpoint, product-unlock request, sign-in, payment flow, database, or remote persistence. Request-allowance, identity-provider, backend concurrency, and SQLite checks are not applicable.

## Accessibility, responsive behavior, and performance

- Live axe checks find zero serious or critical findings on `/`, `/demo/`, `/privacy/`, `/terms/`, and the true 404 at desktop and 390 px in both light and dark treatments.
- Every valid route has one h1, a main landmark, `lang=en`, route-specific title, complete image alternatives, and no console or page errors.
- Keyboard checks confirm skip-link focus, main focus, form entry, Enter submission, Space reset, route-change focus, and browser-Back focus. The focused reset control has a 3 px teal outline.
- Standalone links, buttons, inputs, and text areas meet the 44 by 44 CSS-pixel target check. Both widths have zero horizontal overflow; 200% text also has zero overflow.
- Reduced motion produces `0.00001s` transition and animation durations with automatic scrolling.
- Desktop and mobile screenshots were inspected. The fleet-ledger visual system is distinct and remains readable at both sizes.
- Production main JS is 4.61 kB / 2.06 kB gzip; CSS is 13.27 kB / 3.65 kB gzip; fonts total 30.33 kB; the mobile illustration is 46.06 kB.
- Fresh mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 10 ms, CLS 0, transfer 85 KiB.

## Scope checks

The product uses deterministic local calculations; an AI feature would not improve the core job. Import is the selected collector YAML, and JSON output supports CI use. No obvious AI, import, export, or synchronization step is missing from the brief.

## Defects by severity

- P0: none.
- P1: two — invalid shipped collector examples; recommended mixed-policy goal remains over budget.
- P2: one — large finite values serialize derived numeric fields as null.
- P3: none.

## Reproduce

```sh
npm ci
# Run every command in .factory/claims.json separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked
```
