# Adversarial first-read review 1 — Sampling Budget Coordinator

Reviewed 2026-08-30 against repository commit `0109f15588ed951b1c44b3ecfda739109891d7cf` and `https://sampling-budget-coordinator.sociobot.in/` in fresh Chromium contexts at 390 × 844 and 1440 × 900.

## Verdict: FAIL

There are no blocking findings: the cold first screen is clear, the one-click demo is real and isolated, and all seven declared claim tests pass from a clean clone. The product still cannot pass this review because eight public behavior claims are not represented completely in `.factory/claims.json`, and ten smaller copy or navigation findings remain. PASS requires zero findings and no untested claim.

## Cold first screen, before scrolling

My first-read answers were:

- **What does it do?** It calculates a safe per-collector sampling goal so an OpenTelemetry fleet stays within one span budget as replica counts change.
- **For whom?** Platform engineers managing OpenTelemetry collector fleets.
- **What should I click first?** **Try it with sample data**; the adjacent note says it loads an isolated eight-replica fleet.

The exact text that supplied those answers was “Keep collector sampling within budget,” “For platform engineers managing OpenTelemetry fleets, it sets safe per-instance goals before replicas change,” and “Try it with sample data.” All three were visible without scrolling at both widths. The three plain facts were also visible. This gate passes.

## Findings

### Major — unlisted claims

#### F-1-1 — Browser/CLI formula equivalence is claimed but not declared

- **Quote/location:** “This planner uses the CLI throughput formula.” (`site/index.html:56`) and “The browser planner uses the same documented throughput formula as the CLI.” (`README.md:97`).
- **Why this matters:** A visitor may treat a browser result as equivalent to the CLI across inputs. No claim entry states that equivalence, and no tagged claim test compares a matrix of browser results with CLI results. The browser accepts one scalar local goal while the CLI interprets collector policy types, so the current wording is broader than the UI.
- **Concrete fix:** Either replace both sentences with “This browser calculator models one adaptive-throughput goal,” or add a `planner-formula-parity` claim and a tagged test that compares browser and CLI results over boundary, zero-input, tolerance, and scale cases.

#### F-1-2 — Supported sampler behavior is claimed beyond the manifest

- **Quote/location:** “It distinguishes per-replica goals from fleet-safe percentage policies,” the two sentences under “Multiply where OTel does” (`site/index.html:88-91`), and the supported-processor list plus missing-wiring and conditional-`always_sample` behavior (`README.md:75-81`).
- **Why this matters:** `.factory/claims.json` only declares rejection of an unknown sampling processor. It does not declare or tag tests for all four advertised sampler types, percentage behavior, multiple throughput rules, missing trace-pipeline wiring, or conditional-rule warnings.
- **Concrete fix:** Add a `supported-sampler-models` claim with fixtures and observable assertions for every listed processor/rule behavior, plus a `configuration-errors` claim for missing wiring; otherwise remove or narrow the unsupported statements to “Unknown sampling processors return an error.”

#### F-1-3 — Multi-scenario assertion behavior and syntax are unlisted

- **Quote/location:** “Each scenario is checked against budget plus tolerance.” (`site/index.html:92`) and “Replica scenarios may be repeated or comma-separated.” (`README.md:71`).
- **Why this matters:** The declared `deploy-assertion` claim checks exit codes and JSON, but its tagged test does not exercise multiple scenarios or both accepted scenario syntaxes. CI users could rely on an unverified scale case.
- **Concrete fix:** Add a `scenario-assertion` claim and one tagged test that passes repeated and comma-separated values, asserts every scenario row, and confirms that any over-budget row produces exit 3. Remove the sentences if this contract is not intended.

#### F-1-4 — Assumption reporting is unlisted

- **Quote/location:** “The CLI reports additional config-specific assumptions.” (`site/index.html:82`) and “Estimates explicitly state the equal traffic split, steady-state, and rule-overlap assumptions.” (`README.md:60`).
- **Why this matters:** These caveats are part of the tool's honesty boundary, but no manifest claim or tagged test confirms that the relevant assumptions remain in human and JSON output.
- **Concrete fix:** Add an `assumption-reporting` claim whose test asserts the three assumptions and any fixture-specific warning in both output modes, or remove the promise.

#### F-1-5 — The default tolerance is unlisted and untested as a default

- **Quote/location:** “The default tolerance is 10%; set it with `--tolerance 5`.” (`README.md:69`).
- **Why this matters:** A deploy decision can change at this boundary. None of the claim text promises the default, and the tagged assertion test does not assert a 10% maximum when `--tolerance` is omitted.
- **Concrete fix:** Add a `default-tolerance` claim and assert that budget 600 yields an allowed value of 660 without the flag, then assert the override; otherwise remove the default from public copy.

#### F-1-6 — JSON support for both commands is broader than the declared claim

- **Quote/location:** “Both commands accept `--json` for scripting.” (`README.md:71`).
- **Why this matters:** The manifest says only that CLI assertions can emit JSON. The existing tagged test already parses both `plan` and `assert`, so the implementation evidence is present but the public claim is absent from the manifest.
- **Concrete fix:** Change the `deploy-assertion` claim to “`plan` and `assert` emit valid JSON; assertions return exit codes 0, 2, and 3,” or add a separate `plan-json` claim.

#### F-1-7 — Omitted-input behavior is unlisted

- **Quote/location:** “`--input` is the incoming span rate before processors; omit it when only a configured upper-bound audit is needed.” (`README.md:71`).
- **Why this matters:** This promises a distinct calculation mode. A normal CLI user may omit the input because the README explicitly permits it, but no claim entry exposes that contract to the verifier.
- **Concrete fix:** Add an `upper-bound-without-input` claim and tagged CLI test that omits `--input` and checks the ceiling result and stated assumption, or delete the second clause.

#### F-1-8 — General report contents are only tested for the bundled sample

- **Quote/location:** “The report shows the configured fleet cap at each scale, an estimated export volume, and a conservative recommendation…” (`README.md:60`).
- **Why this matters:** The `sample-budget` claim proves one fixed sample. The README makes a general promise about arbitrary user configurations, including a recommendation formula.
- **Concrete fix:** Add a `plan-report` claim with at least two non-sample fixtures and assertions for each fleet cap, estimated export, and proportional recommendation; alternatively scope the sentence to “In the bundled sample…”

### Minor — copy and navigation

#### F-1-9 — A README sentence exceeds the 22-word cap

- **Quote/location:** The 28-word report sentence at `README.md:60`.
- **Why this matters:** It combines output fields and a formula in one long sentence.
- **Concrete rewrite:** “The report shows each scale's fleet cap and estimated export. It recommends `budget / maximum scenario replicas` for each local `goal_throughput`.”

#### F-1-10 — A second README sentence exceeds the 22-word cap

- **Quote/location:** The 28-word exit-code sentence at `README.md:69`.
- **Why this matters:** Three outcomes and the tolerance rule are compressed into one scan-resistant line.
- **Concrete rewrite:** “Exit 0 means within budget. Exit 2 means the input is invalid or unsupported. Exit 3 means estimated export exceeds budget plus tolerance.”

#### F-1-11 — “Fleet ledger” is a metaphorical result heading

- **Quote/location:** “Fleet ledger” (`site/index.html:74` and `site/demo/index.html:61`).
- **Why this matters:** In a screen-reader heading list, it does not say that this is the calculated budget result. It depends on the print-ledger visual metaphor.
- **Concrete rewrite:** “Fleet budget result.”

#### F-1-12 — “Multiply where OTel does” is context-dependent and introduces a second product term

- **Quote/location:** “Multiply where OTel does” (`site/index.html:91`); `OTel` also appears in the landing title while body copy uses `OpenTelemetry`.
- **Why this matters:** The heading does not identify the section's subject out of context, and the abbreviation creates avoidable terminology drift.
- **Concrete rewrite:** “Account for replicas by sampler type.” Use “OpenTelemetry” consistently in the title and body.

#### F-1-13 — “Copy” does not name the result

- **Quote/location:** Button text “Copy” beside the generated assertion (`site/index.html:81`, also the demo).
- **Why this matters:** A visitor tabbing through controls must infer what will be copied.
- **Concrete rewrite:** “Copy command.” Keep the success state “Copied.”

#### F-1-14 — “Sampling economics” is jargon in the README's opening sentence

- **Quote/location:** “audits OpenTelemetry collector sampling economics” (`README.md:3`).
- **Why this matters:** “Economics” does not tell a first-time reader whether the tool checks spans, money, or capacity.
- **Concrete rewrite:** “Sampling Budget Coordinator (`sbc`) checks whether OpenTelemetry collectors stay within one fleet-wide span budget before deployment.”

#### F-1-15 — “Supported configuration surface” is an abstract heading

- **Quote/location:** `README.md:73`.
- **Why this matters:** “Surface” adds no usable meaning and makes the heading harder to scan.
- **Concrete rewrite:** “Supported collector configurations.”

#### F-1-16 — “Config” and “configuration” are used for the same concept

- **Quote/location:** “collector config” and “config-specific” on the landing page (`site/index.html:82,88`); both “config” and “configuration” recur in `README.md:5-81`.
- **Why this matters:** The plain-words terminology rule requires one word per concept. The literal `--config` option can remain unchanged, but prose should not alternate.
- **Concrete fix:** Use “collector configuration” in prose and reserve `--config` for the exact command-line flag.

#### F-1-17 — Full-page route changes do not move focus to the new h1

- **Quote/location:** Live navigation `/` → `/demo/` and browser Back both leave `document.activeElement` on `BODY`; the pages have no route-entry h1 focus logic.
- **Why this matters:** The URLs, deep-link scrolling, and Back history work, but keyboard and screen-reader users receive no focus cue that the page context changed. This misses the route-focus requirement.
- **Concrete fix:** Make each h1 programmatically focusable and focus it after same-origin route navigation/history restoration, without stealing focus on a cold load. Add a browser test for `/` → `/demo/` → Back.

#### F-1-18 — The 404 h1 is metaphor copy

- **Quote/location:** “This page is not in the plan” (`site/404.html:19`).
- **Why this matters:** The heading hides the actual error behind product lore. “Error / 404” is only a smaller eyebrow.
- **Concrete rewrite:** “Page not found.” Keep the existing explanation and recovery actions.

## Demo and sandbox evidence

- One click on **Try it with sample data** opens `/demo/` with a persistent “Demo — sample data, nothing is saved” banner.
- The first demo screen is already in use: budget 600, local goal 600, current replicas 3, peak replicas 8, incoming volume 12,000, tolerance 10%, **Over budget**, and a recommended local goal of 75.
- Changing the local goal to 42 and pressing **Reset demo** restores 600 and the original over-budget result. The reset status becomes “Demo reset — sample data, nothing is saved.”
- Before, during, and after the demo, cookies, localStorage, sessionStorage, and IndexedDB were empty. **Start for real** returned to `/` without carrying the changed demo value.
- Every live request during landing, demo interaction, reset, and exit was same-origin. A fresh service-worker-controlled demo reloaded offline and recalculated to **Within budget**.
- The CLI demo was run from an empty temporary working directory. It created only `collector.yaml` and `report.json` under a separate `/tmp/sbc-demo-…` directory and did not write into the working directory.

The demo gate passes.

## Declared claims — clean-clone results

The clean clone was at `0109f15588ed951b1c44b3ecfda739109891d7cf`. Every command was run separately.

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm run test:claim -- @claim:demo-sandbox` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `local-privacy` | `npm run test:claim -- @claim:local-privacy` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `offline-reload` | `npm run test:claim -- @claim:offline-reload` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `sample-budget` | `npm run test:claim -- @claim:sample-budget` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `deploy-assertion` | `npm run test:claim -- @claim:deploy-assertion` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `unsupported-policy` | `npm run test:claim -- @claim:unsupported-policy` | PASS — 1 passed, 1 intentional mobile duplicate skip |
| `mit-license` | `npm run test:claim -- @claim:mit-license` | PASS — 2 passed |

No declared claim test failed. Findings F-1-1 through F-1-8 are claims present in public copy but absent or materially narrower in the manifest.

## Landing-page copy audit

Counts split on whitespace. Terminal numbers and command syntax are product output rather than sentences. No visible landing sentence exceeds 22 words and no banned marketing word appears.

| Copy | Words | Flag |
| --- | ---: | --- |
| Skip to main content | 4 | — |
| You are offline. | 3 | — |
| The planner still works locally; install commands need a connection. | 10 | — |
| OpenTelemetry / pre-deploy audit | 4 | — |
| Keep collector sampling within budget | 5 | — |
| For platform engineers managing OpenTelemetry fleets, it sets safe per-instance goals before replicas change. | 14 | — |
| Try it with sample data | 5 | — |
| Loads an isolated eight-replica fleet. | 5 | — |
| No planner data is saved or sent. | 7 | — |
| Works offline after the first visit. | 6 | — |
| Free under the MIT License. | 5 | — |
| Seven collector nodes send dithered signals through one mechanical gate into a bound ledger. | 14 | — |
| Local sampling goals accumulate at fleet scale. | 7 | — |
| Test the scale change | 4 | — |
| This planner uses the CLI throughput formula. | 7 | F-1-1 |
| It keeps values in browser memory until you close the page. | 11 | — |
| Before the adaptive tail sampler. | 5 | — |
| Recalculate budget | 2 | — |
| Fleet ledger | 2 | F-1-11 |
| Safe per-instance goal at peak | 5 | — |
| Assumes steady-state input and an even load balance. | 8 | — |
| The CLI reports additional config-specific assumptions. | 6 | F-1-4, F-1-16 |
| Budget math you can audit | 5 | — |
| The CLI needs a collector config, not trace data. | 9 | F-1-16 |
| It distinguishes per-replica goals from fleet-safe percentage policies. | 8 | F-1-2 |
| Follow the traces pipeline | 4 | — |
| The CLI audits referenced processors and rejects unsupported sampling policies rather than making a quiet guess. | 16 | —; covered by `unsupported-policy` |
| Multiply where OTel does | 4 | F-1-12 |
| Local adaptive-throughput goals scale with replicas. | 6 | F-1-2 |
| Probabilistic and adaptive-percentage rates stay fractions of the load-balanced input. | 10 | F-1-2 |
| Stop an over-budget deploy | 4 | — |
| Each scenario is checked against budget plus tolerance. | 8 | F-1-3 |
| Exit code 3 marks an over-budget assertion; JSON feeds CI. | 10 | —; covered by `deploy-assertion` |
| Put the check in CI | 5 | — |
| Build the Rust binary, run the bundled demo, then add the assertion to your deployment. | 15 | — |
| Recorded terminal run with the bundled sample | 7 | — |
| DEMO — bundled sample data; your files were not read | 10 | —; covered by `demo-sandbox` |
| Sampling budget checks for OpenTelemetry fleets. | 6 | — |
| Built by Param Factory · v0.1.0 | 6 | — |

### Landing controls and navigation

| Label or accessible name | Words | Flag |
| --- | ---: | --- |
| Demo | 1 | — |
| Planner | 1 | — |
| Install | 1 | — |
| Privacy | 1 | — |
| Use dark theme | 3 | — |
| Recalculate budget | 2 | — |
| Copy | 1 | F-1-13 |
| Source on GitHub | 3 | — |
| Terms | 1 | — |

## README copy audit

Code blocks are excluded; their surrounding instructions are included. Exactly two sentences exceed 22 words.

| Copy | Words | Flag |
| --- | ---: | --- |
| Sampling Budget Coordinator | 3 | — |
| Sampling Budget Coordinator (`sbc`) audits OpenTelemetry collector sampling economics before deployment. | 11 | F-1-14 |
| It is for platform engineers who need one fleet-wide span budget even while collector replica counts change. | 17 | — |
| It parses the collector YAML you select in local process memory. | 11 | — |
| Collector configuration can contain endpoints, headers, identifiers, or credentials outside the traces pipeline. | 13 | — |
| `sbc` does not transmit, persist, or log configuration contents. | 9 | — |
| It needs no trace payloads or span attributes and includes no telemetry or network client. | 15 | — |
| Try the sample | 3 | — |
| Run the complete workflow without providing a config: | 8 | F-1-16 |
| `sbc demo` copies the bundled collector config into a new temporary directory, runs the same planner, saves `report.json`, and prints both paths. | 22 | F-1-16 |
| It never reads or writes your project data. | 8 | — |
| The browser demo is available at https://sampling-budget-coordinator.sociobot.in/demo/. | 7 | — |
| Its sample values stay in browser memory under an isolated demo mode and are never saved. | 16 | — |
| Install | 1 | — |
| Build the single binary with stable Rust: | 7 | — |
| The package starts at `0.1.0`. | 5 | — |
| Factory release automation owns registry publishing; do not publish from a workstation. | 12 | — |
| Usage | 1 | — |
| Given a collector config with an adaptive throughput sampler: | 9 | F-1-16 |
| Plan a 600 spans/second fleet budget for normal scale and an eight-replica peak: | 13 | — |
| The report shows the configured fleet cap at each scale, an estimated export volume, and a conservative recommendation: set each local `goal_throughput` to `budget / maximum scenario replicas`. | 28 | F-1-8, F-1-9 |
| Estimates explicitly state the equal traffic split, steady-state, and rule-overlap assumptions. | 11 | F-1-4 |
| Use the assertion in a deploy pipeline: | 7 | — |
| Exit codes are stable: `0` means within budget, `2` means the input/config is invalid or unsupported, and `3` means the estimated export exceeds the declared budget plus tolerance. | 28 | F-1-10, F-1-16; behavior covered by `deploy-assertion` |
| The default tolerance is 10%; set it with `--tolerance 5`. | 10 | F-1-5 |
| Both commands accept `--json` for scripting. | 6 | F-1-6 |
| `--input` is the incoming span rate before processors; omit it when only a configured upper-bound audit is needed. | 18 | F-1-7 |
| Replica scenarios may be repeated or comma-separated. | 7 | F-1-3 |
| Run `sbc <command> --help` for all options. | 7 | — |
| Supported configuration surface | 3 | F-1-15 |
| Version 0.1 supports processors referenced by `service.pipelines.traces`: | 7 | F-1-2 |
| `adaptive_tail_sampling` rules using `adaptive_throughput`, `adaptive_percentage`, `probabilistic`, and `always_sample`, following the documented development schema on 2026-08-28. | 15 | F-1-2 |
| Top-level `probabilistic_sampler` processors with `sampling_percentage`. | 5 | F-1-2 |
| Multiple throughput rules as a conservative sum of their configured ceilings. | 11 | F-1-2 |
| Unknown sampling processors and missing trace pipeline wiring are errors, not silent guesses. | 13 | F-1-2; unknown processors covered, missing wiring unlisted |
| Conditional `always_sample` rules are called out because their volume needs traffic-share data and therefore cannot be bounded from config alone. | 20 | F-1-2, F-1-16 |
| Develop and verify | 3 | — |
| Prerequisites: stable Rust and Node.js 20+. | 6 | — |
| `npm test` runs Rust unit/integration tests and desktop/mobile browser tests. | 10 | —; independently verified |
| The browser planner uses the same documented throughput formula as the CLI. | 12 | F-1-1 |
| Start the docs site with `npm run dev`. | 8 | — |
| Deployment | 1 | — |
| Deploy `dist/site/` as a static site at `https://sampling-budget-coordinator.sociobot.in`. | 8 | — |
| No runtime service, analytics, cookies, or external scripts are required. | 10 | —; covered by `local-privacy` |
| License | 1 | — |
| MIT. | 1 | — |
| See `LICENSE`. | 2 | — |

### Terminology check

The product otherwise uses stable terms: **fleet budget**, **local goal**, **replicas**, **peak replicas**, **incoming volume**, **assertion**, and **demo**. F-1-12 covers `OTel`/`OpenTelemetry` drift; F-1-16 covers `config`/`configuration` drift.

## Structure, links, accessibility, and identity

- `/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, and an unknown URL have route-specific titles, one h1, one main landmark, descriptions, canonicals, Open Graph/Twitter metadata, SVG favicon, and 180 px touch icon.
- Titles follow the required route patterns and stay within 60 characters. The social image is 1200 × 630. `robots.txt` and `sitemap.xml` expose all indexable routes.
- Every internal link, asset link, and the GitHub source link returned 200 after redirects. Fragment targets exist. The unknown URL returns HTTP 404 with the designed product page.
- Deep-link scrolling and browser Back work. Route-change focus does not; see F-1-17.
- The header/footer skeleton is consistent. The two-ink fleet-ledger identity is visibly product-specific rather than a generic SaaS template. The dithered collector illustration, square press-proof panels, IBM Plex Mono, vermilion/teal state colors, and print rules match `.factory/design.md`.
- `/opt/fleet/lib/verify-url.sh` passed the live landing page. Independent live Playwright axe scans found zero violations on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` at 390 px.
- The full clean-clone suite passed: 6 Rust unit tests, 5 CLI integration tests, 1 doctest, and 37 Playwright tests; 9 mobile duplicates were intentionally skipped. `npm run typecheck`, `npm run lint`, and `npm run build` also passed.
- Production build sizes were 3.92 kB JS (1.83 kB gzip) and 13.17 kB CSS (3.64 kB gzip). All 19 public build files matched live byte-for-byte.

## History regression check

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files exist. I read `.factory/handoff.md` and, for completeness, the three earlier verification reports. Every earlier recorded defect remains fixed:

| Earlier finding | Live and code confirmation |
| --- | --- |
| Skip link did not move focus to main | PASS — Enter focuses the `main`; every page uses `tabindex="-1"`; the regression test passed. This is distinct from F-1-17's page-route focus. |
| Service-worker cache lacked a release boundary | PASS — the old-cache/new-worker regression test passed and the current worker removes the previous cache. |
| Privacy wording falsely said credentials were never read | PASS — README and Privacy now say the selected YAML is parsed locally and may contain credentials outside the traces pipeline. |
| Required claims contract absent | PASS — seven entries exist, each has exactly one tagged test, and all declared commands passed. |
| Browser and CLI demos absent | PASS — `/demo/`, banner/reset/exit controls, `sbc demo`, temp files, and terminal transcript all work. |
| First screen did not name job, audience, action, and facts | PASS at mobile and desktop widths. |
| Canonical/social/touch metadata and styled 404 absent | PASS on all routes and a true unknown URL. |
| Demo and copy-audit documents absent | PASS — both files exist; this review supersedes the earlier landing-only copy conclusion with the README and stricter flags above. |

No earlier finding regressed.

## Missed leverage

No additional AI, sync, import, or export feature is warranted by the brief. The job is deterministic budget arithmetic over local collector configuration. The CLI already imports YAML and exports JSON, and an AI layer would add privacy/cost risk without improving the core decision. No provider key or decorative AI feature is present.

## What would make this perfect

Resolve F-1-1 through F-1-8 by narrowing public promises or adding exact manifest entries and tagged tests. Apply the concrete copy rewrites in F-1-9 through F-1-16, add route-entry focus coverage for F-1-17, and replace the 404 metaphor for F-1-18. Then rerun every claim command, the complete suite, the live request/offline checks, the link crawl, and this entire first-read review from a fresh context. A perfect result has no remaining finding, including minor copy defects.
