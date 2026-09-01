# Adversarial first-read review 3 — Sampling Budget Coordinator

Reviewed 2026-09-01 against repository commit `10fd81b879c3c0635a2eff78bc47b1620ce18be3` and `https://sampling-budget-coordinator.sociobot.in/`. Product code was not changed. Checks used fresh Chromium contexts at 390 × 844 and 1440 × 900, plus a new clean clone at `/tmp/sbc-review3-clean-hcPZ3y`.

## Verdict: FAIL

One blocking quality-gate finding remains. The live product is clear, tryable, isolated, and honest in the checked flows, and every declared claim test passes separately. However, the required full `npm test` gate did not complete successfully in two clean-clone runs because the Playwright Chromium process crashed. A PASS requires zero findings.

## Cold first screen, before scrolling

At both 390 px and desktop widths, before scrolling:

| Question | First-read answer | Exact visible text |
| --- | --- | --- |
| What does this do? | It keeps a collector fleet within a sampling budget while replicas change. | “Keep collector sampling within budget” |
| For whom? | Platform engineers managing OpenTelemetry fleets. | “For platform engineers managing OpenTelemetry fleets, it sets safe per-instance goals before replicas change.” |
| What should I click first? | Try the working sample. | “Try it with sample data” and “Loads an isolated eight-replica fleet.” |

The headline, audience sentence, primary action, action result, and all three facts were inside the initial viewport at both widths. This gate passes.

## Findings

### BLOCKING

#### F-3-1 — The required full test gate is not reproducibly green

- **Quote/location:** `package.json` defines `npm test` as the quality gate. Two clean-clone runs failed in `site/tests/site.spec.ts:117`, “landing includes a self-hosted terminal transcript,” with `Error: browser.newContext: Target page, context or browser has been closed`. Chromium logged `Received signal 11 SEGV_MAPERR`.
- **Why this matters:** A worker cannot verify the complete browser suite from a clean checkout, so the repository does not meet its stated `npm test` quality gate. The failure is a browser-process crash rather than a failure of the transcript assertion, but it remains an unsuccessful required command.
- **Concrete fix:** Stabilize the Playwright runner so all 68 tests complete in one invocation—for example, isolate tests in fresh browser processes through the Playwright fixture/configuration rather than retaining a crash-prone shared process. Add CI coverage that runs `npm test` twice from a clean checkout. Verify both runs finish with exit 0 before closing this finding.

## Copy audit

Counts split on whitespace. Code samples and calculated table cells are not prose sentences; terminal transcript output is checked as product output. No landing or README sentence exceeds 22 words. No banned marketing term, empty slogan, metaphor heading, inconsistent core term, or non-result-naming button was found. The headings and controls are separately listed after the sentence tables.

### Landing sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| You are offline. | 3 | — |
| The planner still works locally; install commands need a connection. | 10 | `offline-reload` |
| For platform engineers managing OpenTelemetry fleets, it sets safe per-instance goals before replicas change. | 14 | `sample-budget` scope/result |
| Loads an isolated eight-replica fleet. | 5 | `demo-sandbox` |
| No planner data is saved or sent. | 7 | `local-privacy` |
| Works offline after the first visit. | 6 | `offline-reload` |
| Free under the MIT License. | 5 | `mit-license` |
| Seven collector nodes send dithered signals through one mechanical gate into a bound ledger. | 14 | Purposeful image alternative |
| Local sampling goals accumulate at fleet scale. | 7 | Explanation |
| This browser calculator models one adaptive-throughput goal. | 7 | Scope statement |
| It keeps values in browser memory until you close the page. | 11 | `local-privacy` |
| Before the adaptive tail sampler. | 5 | Input label help |
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

Landing headings/actions checked: “Keep collector sampling within budget” (5), “Try it with sample data” (5), “Test one local goal at scale” (6), “Recalculate budget” (2), “Fleet budget result” (3), “Budget math you can audit” (5), “Follow the traces pipeline” (4), “Account for replicas by sampler type” (7), “Stop an over-budget deploy” (4), “Put the check in CI” (5), and “Copy command” (2). Each names an action or section result without relying on product lore.

### README sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| Sampling Budget Coordinator (`sbc`) checks whether OpenTelemetry collectors stay within one fleet-wide span budget before deployment. | 16 | Product purpose |
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
| `adaptive_tail_sampling` rules use `adaptive_throughput`, `adaptive_percentage`, `probabilistic`, and `always_sample`, following the documented development schema on 2026-08-28. | 15 | `supported-sampler-models` |
| Both adaptive types require at least one scoped `fingerprint_attributes` selector. | 9 | `supported-sampler-models` |
| Unknown sampling processors and missing trace pipeline wiring return errors. | 10 | `unsupported-policy`, `configuration-errors` |
| Conditional `always_sample` rules need traffic-share data, so their estimate conservatively allows all input. | 13 | `supported-sampler-models` |
| Prerequisites: stable Rust and Node.js 20+. | 6 | Direct setup instruction |
| `npm test` runs Rust unit/integration tests and desktop/mobile browser tests. | 10 | Direct verification instruction |
| The browser calculator models one adaptive-throughput goal. | 7 | Scope statement |
| Start the docs site with `npm run dev`. | 8 | Direct instruction |
| Deploy `dist/site/` as a static site at `https://sampling-budget-coordinator.sociobot.in`. | 8 | Direct deployment instruction |
| No runtime service, analytics, cookies, or external scripts are required. | 10 | `local-privacy` |
| MIT. | 1 | License statement |
| See `LICENSE`. | 2 | Direct reference |

The supported-configuration list also contains concise noun fragments: “Top-level `probabilistic_sampler` processors with `sampling_percentage`.” (5) and “Multiple throughput rules as a conservative sum of their configured ceilings.” (11). These are configuration entries, not unexplained headings.

All reliance claims found in the live landing and README map to one of the 14 manifest entries listed above. No unlisted landing or README claim was found.

## Demo, privacy, and CLI checks

- One click on **Try it with sample data** opened `/demo/` on the populated calculator. Its first view showed budget 600, local goal 600, three current replicas, eight peak replicas, incoming volume 12,000, an over-budget state, and a 75 spans/s recommendation.
- The persistent banner read “Demo — sample data, nothing is saved.” Changing the goal to 42 and selecting **Reset demo** restored 600. **Start for real** returned to `/` with no carried value.
- Fresh mobile and desktop browser contexts recorded only `https://sampling-budget-coordinator.sociobot.in` requests. After the whole demo flow, local storage and session storage were empty, cookies were empty, and IndexedDB had zero databases.
- After an online first visit installed `/sw.js`, a fresh demo context reloaded while offline with HTTP 200 and recalculated to **Within budget**.
- `sbc demo --json`, run from a fresh temporary working directory, reported a separate `/tmp/sbc-demo-…` output directory and the expected 1,800, 3,000, and 4,800 spans/s scenarios with a 75 spans/s recommendation.

## Claims and clean-clone results

After `npm ci` in the clean clone, each exact command from `.factory/claims.json` completed separately:

| Claim | Result |
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

`npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --locked` also passed. The separate full `npm test` command is the sole failing gate; see F-3-1.

## Earlier-finding confirmation

I read every prior `review-*`, `polish-*`, verification report, and handoff. I then reconfirmed the prior findings in live behavior and current code:

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | Browser wording remains limited to one adaptive-throughput goal; no broader CLI-formula parity promise is present. |
| F-1-2 through F-1-8 | The corresponding sampler, scenario, assumption, tolerance, JSON, no-input, and plan-report claims are declared and their clean-clone tagged tests pass. |
| F-1-9 and F-1-10 | README report and exit-code explanations remain short. |
| F-1-11 through F-1-16 | The live result/control/section names are plain, and prose uses “collector configuration” consistently. |
| F-1-17 | Live landing → demo and Back moved focus to the destination h1. |
| F-1-18 | An unknown live route returned HTTP 404 with h1 “Page not found.” |
| F-2-1 | The 404 “Open the planner” action targets `/#planner`, and the shipped regression asserts that behavior. |
| F-2-2 | The internal release-process lines are absent from the README. |

None of F-1-1 through F-2-2 is unfixed, half-fixed, or regressed.

## Structure, accessibility, and visual checks

- Live `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` returned 200. A new unknown route returned HTTP 404. `robots.txt` and `sitemap.xml` returned 200.
- Route-specific titles, descriptions, canonical URLs, Open Graph/Twitter data, favicon, apple touch icon, one h1, and one main landmark were present on all five routes. The title format is correct for the landing, demo, legal, and 404 routes.
- Every crawled internal link and the source-repository link returned 200. Header/footer navigation is consistent, with a skip link, Privacy, Terms, and a distinct wordmark.
- Live Axe scans across all five routes at desktop and 390 px found zero serious or critical findings. Neither viewport had horizontal overflow. Live console/page-error logging was empty during the normal and demo flows.
- Response headers include self-only CSP with response-header `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, and strict-origin referrer policy.
- The two-ink ledger illustration, paper/ink/vermilion palette, mono figures, registration rules, and print-proof calculator are distinct from a generic SaaS template and match `.factory/design.md`.

## Missed leverage

No finding. The brief calls for deterministic local configuration analysis, safe recommendations, JSON for CI, and a deploy-time assertion. The CLI already imports YAML and exports JSON. An AI feature or remote sync would not make this narrowly scoped job clearer or safer.

## What would make this perfect

Make the complete `npm test` suite stable across repeated clean-clone runs. Once it exits 0 twice in succession, the verified demo, claims, copy, privacy behavior, routing, accessibility, and product-specific interface leave no other finding from this review.

## Reproduce

```sh
git clone --no-hardlinks /work/repo /tmp/sbc-review3-clean
cd /tmp/sbc-review3-clean
npm ci
# Run every exact command listed in .factory/claims.json separately.
npm test
npm run typecheck
npm run lint
npm run build
cargo package --locked
```
