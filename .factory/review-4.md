# Adversarial first-read review 4 — Sampling Budget Coordinator

Reviewed 2026-09-02 against repository candidate `b2c66c3be659e281b1314bd97e5e4d7b0c340fdd` and the published site at <https://sampling-budget-coordinator.sociobot.in/>. Product code was not changed. Checks used new Chromium browser contexts at 390 × 844 and 1440 × 900, a clean clone at `/tmp/sbc-review4-clean.2s8hgo`, and the live site.

## Verdict: PASS

There are zero blocking, major, or minor findings. The cold landing screen states the job, audience, and first action; the one-click sample is populated and isolated; every declared claim has passed its exact clean-clone command; no unlisted reliance claim was found on the landing page or README; and the published routes, links, metadata, accessibility, and privacy behavior checked here are correct.

## Cold first screen, before scrolling

| Question | First-read answer | Exact visible text |
| --- | --- | --- |
| What does this do? | Checks whether a collector fleet stays within its span budget as replicas change. | “Keep collector sampling within budget” |
| For whom? | Platform engineers managing OpenTelemetry fleets. | “For platform engineers managing OpenTelemetry fleets, it sets safe per-instance goals before replicas change.” |
| What should I click first? | Try the populated sample. | “Try it with sample data” and “Loads an isolated eight-replica fleet.” |

At 390 px, the action ends at y=611, its explanatory text at y=675, and the three facts at y=778 of an 844 px viewport. At 1440 px, those elements end at y=756, y=755, and y=858 of a 900 px viewport. The visitor can answer all three questions before scrolling. This gate passes.

## Copy audit

Counts split on whitespace. Commands, calculated table cells, and terminal transcript output are product output rather than prose sentences; their observable claims are tested separately. No sentence exceeds 22 words. No banned marketing adjective, empty slogan, jargon-only heading, inconsistent core term, or non-result-naming button was found. Therefore there are no copy flags or proposed rewrites.

### Landing-page sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| You are offline. | 3 | Offline state |
| The planner still works locally; install commands need a connection. | 10 | `offline-reload` |
| For platform engineers managing OpenTelemetry fleets, it sets safe per-instance goals before replicas change. | 14 | Audience and job |
| Loads an isolated eight-replica fleet. | 5 | `demo-sandbox` |
| No planner data is saved or sent. | 7 | `local-privacy` |
| Works offline after the first visit. | 6 | `offline-reload` |
| Free under the MIT License. | 5 | `mit-license` |
| Seven collector nodes send dithered signals through one mechanical gate into a bound ledger. | 14 | Purposeful image alternative |
| Local sampling goals accumulate at fleet scale. | 7 | Figure explanation |
| This browser calculator models one adaptive-throughput goal. | 7 | Scope statement |
| It keeps values in browser memory until you close the page. | 11 | `local-privacy` |
| Before the adaptive tail sampler. | 5 | Input help |
| Assumes steady-state input and an even load balance. | 8 | `assumption-reporting` |
| The CLI reports additional configuration-specific assumptions. | 6 | `assumption-reporting` |
| The CLI needs a collector configuration, not trace data. | 9 | `local-privacy` |
| It models supported sampler policies before estimating volume. | 8 | `supported-sampler-models` |
| The CLI audits referenced processors and rejects unsupported sampling policies rather than making a quiet guess. | 16 | `unsupported-policy`, `configuration-errors` |
| Local adaptive-throughput goals scale with replicas. | 6 | `supported-sampler-models` |
| Percentage policies stay fractions of the load-balanced input. | 8 | `supported-sampler-models` |
| Each scenario is checked against budget plus tolerance. | 8 | `scenario-assertion` |
| Exit code 3 marks an over-budget assertion; JSON feeds CI. | 10 | `deploy-assertion` |
| Build the Rust binary, run the bundled demo, then add the assertion to your deployment. | 15 | Direct instruction |
| DEMO — bundled sample data; your files were not read. | 10 | `demo-sandbox` |
| Sampling budget checks for OpenTelemetry fleets. | 6 | Product descriptor |

Landing headings and controls also pass the plain-words check: “Keep collector sampling within budget” (5), “Try it with sample data” (5), “Test one local goal at scale” (6), “Recalculate budget” (2), “Fleet budget result” (3), “Budget math you can audit” (5), “Follow the traces pipeline” (4), “Account for replicas by sampler type” (7), “Stop an over-budget deploy” (4), “Put the check in CI” (5), and “Copy command” (2). Each names a job, result, section, or action without relying on metaphor.

### README sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| Sampling Budget Coordinator (`sbc`) checks whether OpenTelemetry collectors stay within one fleet-wide span budget before deployment. | 16 | Purpose |
| It is for platform engineers who need one fleet-wide span budget while collector replicas change. | 15 | Audience |
| It parses the collector YAML you select in local process memory. | 11 | `local-privacy` |
| Collector configuration can contain endpoints, headers, identifiers, or credentials outside the traces pipeline. | 13 | Privacy context |
| `sbc` does not transmit, persist, or log configuration contents. | 9 | `local-privacy` |
| It needs no trace payloads or span attributes and includes no telemetry or network client. | 15 | `local-privacy` |
| Run the complete workflow without providing a collector configuration: | 8 | Direct instruction |
| `sbc demo` copies the bundled collector configuration into a new temporary directory. | 12 | `demo-sandbox` |
| It runs the planner, saves `report.json`, and prints both paths. | 9 | `demo-sandbox` |
| It never reads or writes your project data. | 8 | `demo-sandbox` |
| The browser demo is available at `https://sampling-budget-coordinator.sociobot.in/demo/`. | 7 | Demo entry point |
| Its sample values stay in browser memory under an isolated demo mode and are never saved. | 16 | `demo-sandbox` |
| Build the single binary with stable Rust: | 7 | Direct instruction |
| Given a collector configuration with an adaptive-throughput sampler: | 9 | Usage context |
| Plan a 600 spans/second fleet budget for normal scale and an eight-replica peak: | 13 | Direct instruction |
| The report shows each scale's fleet cap and estimated export. | 10 | `plan-report` |
| It reserves budget for percentage and always-sample rules before recommending local `goal_throughput` values. | 13 | `plan-report` |
| If those rules already consume the budget, the report omits the goal and explains why. | 15 | `plan-report` |
| Reports state steady-state, even-load, and rule-overlap assumptions. | 7 | `assumption-reporting` |
| Conditional `always_sample` rules also produce a warning. | 6 | `assumption-reporting` |
| Use the assertion in a deploy pipeline: | 7 | Direct instruction |
| Exit `0` means within budget. | 5 | `deploy-assertion` |
| Exit `2` means the input or collector configuration is invalid or unsupported. | 11 | `deploy-assertion` |
| Exit `3` means estimated export exceeds budget plus tolerance. | 9 | `deploy-assertion` |
| The default tolerance is 10%; set it with `--tolerance 5`. | 10 | `default-tolerance` |
| Both commands accept `--json` for scripting. | 6 | `deploy-assertion` |
| `--input` is the incoming span rate before processors. | 8 | `upper-bound-without-input` |
| Omit it for a throughput-only configured-ceiling audit. | 7 | `upper-bound-without-input` |
| Replica scenarios may be repeated or comma-separated. | 7 | `scenario-assertion` |
| Run `sbc <command> --help` for all options. | 6 | Direct instruction |
| Version 0.1 supports processors referenced by `service.pipelines.traces`: | 8 | `supported-sampler-models` |
| `adaptive_tail_sampling` rules using `adaptive_throughput`, `adaptive_percentage`, `probabilistic`, and `always_sample`, following the documented development schema on 2026-08-28. | 15 | `supported-sampler-models` |
| Both adaptive types require at least one scoped `fingerprint_attributes` selector. | 9 | `supported-sampler-models` |
| Unknown sampling processors and missing trace pipeline wiring return errors. | 10 | `unsupported-policy`, `configuration-errors` |
| Conditional `always_sample` rules need traffic-share data, so their estimate conservatively allows all input. | 13 | `supported-sampler-models` |
| Prerequisites: stable Rust and Node.js 20+. | 6 | Direct setup instruction |
| `npm test` runs Rust unit/integration tests and desktop/mobile browser tests. | 10 | Direct verification instruction |
| The browser calculator models one adaptive-throughput goal. | 7 | Scope statement |
| Start the docs site with `npm run dev`. | 8 | Direct instruction |
| Deploy `dist/site/` as a static site at `https://sampling-budget-coordinator.sociobot.in`. | 8 | Direct deployment instruction |
| No runtime service, analytics, cookies, or external scripts are required. | 10 | `local-privacy` |
| MIT. | 1 | License |
| See `LICENSE`. | 2 | Direct reference |

The README's supported-configuration list contains concise configuration entries rather than unexplained sentences: top-level `probabilistic_sampler` with `sampling_percentage` (5 words) and multiple throughput rules as a conservative sum of configured ceilings (11 words). Core terminology remains stable: **fleet budget**, **local goal**, **replicas**, **peak replicas**, **incoming volume**, **assertion**, **demo**, and **collector configuration**. `--config` is retained only as a literal command-line flag.

Every public reliance claim in the live landing page and README maps to one of the 14 manifest entries above. No unlisted claim was found.

## Demo and sandbox

- One click on **Try it with sample data** opened canonical `/demo/` from the `/?demo=1` entry alias.
- The first demo screen was already in use: budget 600 spans/s, local goal 600, three current replicas, eight peak replicas, incoming volume 12,000 spans/s, **OVER BUDGET**, and a 75 spans/s recommended local goal.
- The persistent banner read “Demo — sample data, nothing is saved.” Changing the local goal to 42 and selecting **Reset demo** restored 600 at both widths.
- **Start for real** returned to `/`. After this complete flow, local storage and session storage were empty, cookies were empty, and IndexedDB had no databases.
- The request log during the landing/demo/reset/exit flow contained only the product origin. No console error or page error occurred.
- The declared offline test used a fresh context, waited for service-worker control, reloaded offline, and recalculated successfully. The CLI demo claim runs in a temporary operating-system directory and confirms output is confined there.

## Claims and quality gates

From the clean clone, every exact command in `.factory/claims.json` passed separately:

| Claim id | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `local-privacy` | PASS |
| `offline-reload` | PASS |
| `sample-budget` | PASS |
| `deploy-assertion` | PASS |
| `unsupported-policy` | PASS |
| `supported-sampler-models` | PASS |
| `configuration-errors` | PASS |
| `scenario-assertion` | PASS |
| `assumption-reporting` | PASS |
| `default-tolerance` | PASS |
| `upper-bound-without-input` | PASS |
| `plan-report` | PASS |
| `mit-license` | PASS |

`npm test` passed from that clone: 10 Rust unit tests, 8 Rust integration tests, 1 doctest, and 70 Playwright entries (54 passed and 16 intended project-duplicate skips). The Playwright last-run status was `passed`. `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --locked --allow-dirty` also passed. The prior F-3-1 full-suite stability failure is not reproduced.

## Earlier-finding confirmation

Every earlier review, polish report, verification report, and handoff was read. The following table confirms each prior finding on the current code and, where applicable, the published site.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | Browser wording remains scoped to one adaptive-throughput goal; the unsupported browser/CLI-parity claim is absent. |
| F-1-2 | `supported-sampler-models` declares every advertised sampler behavior and its exact clean-clone test passed. |
| F-1-3 | `scenario-assertion` declares repeated and comma-separated scenarios and its test passed. |
| F-1-4 | `assumption-reporting` declares both output forms and conditional warnings; its test passed. |
| F-1-5 | `default-tolerance` declares the 10% default and override; its test passed. |
| F-1-6 | `deploy-assertion` declares JSON output for both commands and stable assertion exits; its test passed. |
| F-1-7 | `upper-bound-without-input` declares configured-ceiling audits and its test passed. |
| F-1-8 | `plan-report` declares scenario caps, exports, and safe recommendations and its test passed. |
| F-1-9 | The README report explanation remains split into short sentences. |
| F-1-10 | The README exit-code explanation remains split into short sentences. |
| F-1-11 | The live calculator heading is “Fleet budget result.” |
| F-1-12 | The live sampler heading is “Account for replicas by sampler type,” and visible prose consistently says “OpenTelemetry.” |
| F-1-13 | The live control is “Copy command.” |
| F-1-14 | The README opening states the concrete fleet-budget job. |
| F-1-15 | The README heading is “Supported collector configurations.” |
| F-1-16 | Prose consistently uses “collector configuration”; the abbreviated form remains only in `--config`. |
| F-1-17 | Live landing → demo and browser Back both placed focus on `h1#page-title`. |
| F-1-18 | A new unknown live route returned HTTP 404 with h1 “Page not found.” |
| F-2-1 | The 404 recovery link is `/#planner`; the regression test verifies arrival and heading focus. |
| F-2-2 | The internal package/release-process lines are absent from the README. |
| F-3-1 | A complete clean-clone `npm test` run finished with exit 0 and a passed Playwright run status. |

No prior finding is unfixed, half-fixed, or regressed.

## Structure, accessibility, and visual identity

- Live `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` each returned 200 with one h1, one main landmark, a route-specific title, description, canonical URL, and Open Graph image. A new unknown route returned HTTP 404 with the designed 404 page.
- The tested titles were “Sampling Budget Coordinator — Check Fleet Budgets”, “Demo — Sampling Budget Coordinator”, “Privacy — Sampling Budget Coordinator”, “Terms — Sampling Budget Coordinator”, and “Page not found — Sampling Budget Coordinator”.
- The header/footer are consistent. The skip link, Home, Demo, Planner, Install, Privacy, and Terms targets resolve; the 404 planner recovery resolves to `/#planner`. Forward navigation and Back move focus to the destination h1.
- `robots.txt`, `sitemap.xml`, favicon, 180 px touch icon, metadata, `staticwebapp.config.json`, and the designed 404 are present. The live response sends self-only CSP including response-header `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, and strict-origin referrer policy.
- The clean-clone suite's Axe checks found zero serious or critical issues across all five routes, including dark mode and system-dark preference. The live 390 px and desktop checks found no horizontal overflow, console errors, or page errors.
- The paper/ink/vermilion two-ink ledger, halftone collector image, monospaced figures, registration rules, and print-proof calculator visibly match `.factory/design.md` and are distinct from a generic SaaS template.

## Missed leverage

No finding. The brief calls for deterministic local collector-configuration analysis, safe recommendations, machine-readable output, and deployment assertions. The product already reads the configuration, exports JSON, demonstrates the sample, and provides the deploy check. AI assistance or remote sync would not make this narrowly scoped, privacy-sensitive job more useful.

## What would make this perfect

No outstanding product work was identified in this review. Preserve the isolated demo, explicit assumptions, full-suite repeatability, and the existing claim-to-test mapping in future changes.

## Reproduce

```sh
git clone --no-hardlinks /work/repo /tmp/sbc-review4-clean
cd /tmp/sbc-review4-clean
npm ci --include=dev
# Run every exact command in .factory/claims.json separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked --allow-dirty
```
