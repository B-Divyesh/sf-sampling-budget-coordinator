# Independent verification — PASS

Verified 2026-08-30 against candidate commit `81f92cdd2f925a4d63f51efaf9b73e7e6431ef58` and production URL `https://sampling-budget-coordinator.sociobot.in/`.

## Decision

**PASS.** This is a functioning local-first Rust CLI and matching static companion site for platform engineers who need a fleet-wide OpenTelemetry sampling budget while replica counts change. No release-blocking defects were found.

## Required claim contract

Started from a clean worktree at the candidate, ran `npm ci` (22 packages; audit: 0 vulnerabilities), then ran every command declared in `.factory/claims.json` independently through the bundled demo entry point:

| Claim | Command | Result |
| --- | --- | --- |
| Demo isolation | `npm run test:claim -- @claim:demo-sandbox` | PASS (desktop; mobile CLI duplicate skipped) |
| Local privacy | `npm run test:claim -- @claim:local-privacy` | PASS (desktop; mobile duplicate skipped) |
| Offline reload | `npm run test:claim -- @claim:offline-reload` | PASS (desktop; mobile duplicate skipped) |
| Sample budget | `npm run test:claim -- @claim:sample-budget` | PASS (desktop; mobile CLI duplicate skipped) |
| Deploy assertion | `npm run test:claim -- @claim:deploy-assertion` | PASS (desktop; mobile CLI duplicate skipped) |
| Unsupported policy | `npm run test:claim -- @claim:unsupported-policy` | PASS (desktop; mobile CLI duplicate skipped) |
| MIT license | `npm run test:claim -- @claim:mit-license` | PASS (desktop and mobile) |

The intentional skips prevent the same CLI process assertion from being duplicated in the mobile project; every claim has one matching tagged test.

## Cold first read and end-to-end product QA

A fresh Chromium visit to the live landing page answered the required questions in plain words:

- **What:** “Keep collector sampling within budget.”
- **For whom:** “For platform engineers managing OpenTelemetry fleets…”
- **First action:** “Try it with sample data,” explicitly saying it loads an isolated eight-replica fleet.

The first screen also shows the three factual promises: no saved/sent planner data, offline after first visit, and MIT licensing. The action opens `/demo/`, already populated with the realistic 3/8-replica, 600 spans/s fleet scenario. The persistent banner reads “Demo — sample data, nothing is saved”; keyboard operation changed the local goal to 60 and reached **Within budget**, then Space on **Reset demo** restored 600. **Start for real** links to `/`.

CLI QA used a clean consumer installation of the packaged crate (`cargo install --path target/package/sampling-budget-coordinator-0.1.0 --root /tmp/sbc-consumer.LTdDAE --locked`):

- `plan` on `examples/collector.yaml` with budget 600, scenarios 3/5/8, and input 12,000 returned 1,800 / 3,000 / 4,800 estimated spans/s and a 75 spans/s recommended local goal.
- Exact boundary `assert --budget 4800 --replicas 8 --input 12000 --tolerance 0 --json` returned valid JSON and exit 0.
- Over-budget `assert --budget 600 --replicas 8 --input 12000 --json` returned valid JSON and exit 3.
- Invalid `--budget nope` gave an actionable parse error and exit 2. The declared unsupported-processor path also passed its independent claim test with exit 2.

## Local quality gates

- `npm test`: PASS — Rust format/unit/integration/doctest coverage and all 46 configured desktop/mobile Playwright executions completed; the known project-specific duplicate skips are intentional.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS (`cargo fmt --check` and Clippy with warnings denied).
- `npm run build`: PASS; emits `dist/site/`.
- `cargo package --allow-dirty`: PASS and verifies the package; 15 packaged files, 60.7 KiB unpacked / 18.2 KiB compressed.

Build output is comfortably within static budgets: main JS 3.92 kB (1.83 kB gzip), CSS 13.17 kB (3.64 kB gzip), two local fonts total 30.33 kB, and the mobile fleet illustration is 46.06 kB.

## Live deployment, privacy, accessibility, and performance

- Rebuilt candidate public output matched production byte-for-byte for all 19 deployable files (HTML pages, worker, assets, fonts, icons, robots, and sitemap). `staticwebapp.config.json` correctly remains non-public. The landing HTML SHA-256 is `8dda374620decd76639668a1585c92d96e7804ca6b1bde001f29fa97d2d2d731` locally and live.
- Cold live desktop request capture contained only `https://sampling-budget-coordinator.sociobot.in` requests: HTML, self-hosted JS/CSS/fonts/image. The entire demo interaction still had only that origin, no cookies, no local/session-storage keys, and no IndexedDB databases. No analytics, ads, account flow, third-party request, or trace/config upload was observed.
- Live response headers provide a self-only CSP (including `connect-src 'self'` and `frame-ancestors 'none'`), HSTS, `nosniff`, and a strict-origin referrer policy. HTML revalidates at 30 seconds; hashed JS/CSS/images use one-year immutable caching. Unknown routes return the styled 404 with HTTP 404.
- `/opt/fleet/lib/verify-url.sh https://sampling-budget-coordinator.sociobot.in/ <temp evidence dir>` passed: HTTP 200, title, `lang=en`, one h1, main landmark, image alt text, labeled buttons, and no console errors.
- Independent axe-core scans of `/`, `/demo/`, `/privacy/`, `/terms/`, and a true 404 at 390 px found **zero serious or critical findings** (and zero findings overall). The Selenium-based `@axe-core/cli` launcher could not start the supplied Chrome headless shell; the same axe-core version was therefore injected through Playwright before navigation, avoiding that environment-only launcher failure.
- Desktop and 390×844 checks found no page/console errors or horizontal overflow. Skip-link Enter moves focus to `main`; visible outlines are `solid`; demo controls work with Enter/Space. At 200% text size mobile width remains 390 px. With reduced motion the measured transition duration is `1e-05s`.
- A live service-worker-controlled `/demo/` reload offline returned 200, rendered “Test a sample collector fleet,” and recalculated to **Within budget**.
- Fresh live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, CLS 0, total blocking time 0 ms, transfer 84 KiB.

This is a static site and local CLI: there are no server-side product endpoints, sign-in, payments, product-unlock calls, persistence service, or documented request allowance to rate-limit. Rate-limit testing is therefore not applicable.

## Defects by severity

None found.

## Reproduce

```sh
npm ci
npm run test:claim -- @claim:demo-sandbox
npm run test:claim -- @claim:local-privacy
npm run test:claim -- @claim:offline-reload
npm run test:claim -- @claim:sample-budget
npm run test:claim -- @claim:deploy-assertion
npm run test:claim -- @claim:unsupported-policy
npm run test:claim -- @claim:mit-license
npm test
npm run typecheck
npm run lint
npm run build
cargo package --allow-dirty
cargo run -- demo
```
