# Adversarial first-read review 2 — Sampling Budget Coordinator

Reviewed 2026-09-01 against repository commit `01404f621bd54ff11401b666ab6120b98365e5ed` and the published site at `https://sampling-budget-coordinator.sociobot.in/`. Checks used fresh Chromium contexts at 390 × 844 and 1440 × 900, plus a clean clone at `/tmp/sbc-review-clean`.

## Verdict: FAIL

The main job is clear and tryable. The demo is isolated, the declared contracts pass, and the site has a distinct product-specific visual system. Two minor copy/recovery findings remain. This review requires zero findings for PASS.

## Cold first screen

Before scrolling, my first-read answers were:

| Question | Answer | Exact text that supplied it |
| --- | --- | --- |
| What does this do? | It checks whether collector sampling stays within a fleet span budget as replicas change. | “Keep collector sampling within budget” |
| For whom? | Platform engineers managing OpenTelemetry fleets. | “For platform engineers managing OpenTelemetry fleets, it sets safe per-instance goals before replicas change.” |
| What should I click first? | **Try it with sample data**. | “Try it with sample data” and “Loads an isolated eight-replica fleet.” |

All three answers and the three product facts were visible before scrolling at 390 px and desktop widths. The 390 px first screen has the action ending at y=675 and the facts ending at y=778 within an 844 px viewport. This gate passes.

## Findings

### Minor

#### F-2-1 — The 404 recovery control does not open the planner it names

- **Quote/location:** “Open the planner” in `site/404.html:22` links to `/`.
- **Check:** Confirm that the landing planner begins below the hero at `/#planner`; following this control opens the landing top instead of that section.
- **Why this matters:** A visitor who selects the recovery action expects the planner to open. They receive a second landing screen and must locate the planner themselves.
- **Concrete fix:** Change the link target to `/#planner`, or rename the control to “Open the home page.” Add a route check that follows the control and confirms `#planner` is the destination.

#### F-2-2 — The README includes an internal release-process sentence with no user action

- **Quote/location:** “Factory release automation owns registry publishing; do not publish from a workstation.” (`README.md:27`, 12 words), following “The package starts at `0.1.0`.” (`README.md:26`, 5 words).
- **Check:** Confirm that these lines do not describe the tool’s job, an install step, a supported configuration, or a user-visible constraint.
- **Why this matters:** A first-time platform engineer receives internal factory process language instead of information needed to install or use the CLI.
- **Concrete fix:** Delete both lines. If contributor policy must remain public, move it to a contributor document and write a direct heading such as “Publishing releases.”

## Earlier-finding confirmation

I reread `review-1.md`, `polish-1.md`, and the prior handoff. Each earlier finding was checked in both the current code and the published site where applicable.

| Earlier finding | Confirmation |
| --- | --- |
| F-1-1 | Landing and README now say the browser calculator models one adaptive-throughput goal; the broader browser/CLI-equivalence statement is absent. |
| F-1-2 | `supported-sampler-models` is declared and its clean-clone tagged test passed. |
| F-1-3 | `scenario-assertion` is declared and its clean-clone tagged test passed. |
| F-1-4 | `assumption-reporting` is declared and its clean-clone tagged test passed. |
| F-1-5 | `default-tolerance` is declared and its clean-clone tagged test passed. |
| F-1-6 | `deploy-assertion` now names both `plan` and `assert` JSON output; its test passed. |
| F-1-7 | `upper-bound-without-input` is declared and its test passed. |
| F-1-8 | `plan-report` is declared and its test passed. |
| F-1-9 | The README report explanation is split into short sentences. |
| F-1-10 | The exit-code explanation is split into three short sentences. |
| F-1-11 | The live result heading is “Fleet budget result.” |
| F-1-12 | The live sampler heading is “Account for replicas by sampler type,” and visible landing prose uses “OpenTelemetry.” |
| F-1-13 | The live control says “Copy command.” |
| F-1-14 | The README opening now says the tool checks a fleet-wide span budget. |
| F-1-15 | The README heading is “Supported collector configurations.” |
| F-1-16 | Prose consistently uses “collector configuration”; `--config` remains only a command flag. |
| F-1-17 | Live `/` → `/demo/` navigation and Back both moved focus to `h1#page-title`. |
| F-1-18 | The live unknown route returned HTTP 404 with the h1 “Page not found.” |

None of the earlier findings is regressed. F-2-1 is a new recovery-path precision finding, not a recurrence of F-1-18.

## Copy audit

Counts split on whitespace. Code examples, numerical table output, and control labels that are not sentences are separately listed after the sentence tables. No landing or README sentence exceeds 22 words. No banned marketing adjective appeared. F-2-2 is the only plain-words finding.

### Landing sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| You are offline. | 3 | — |
| The planner still works locally; install commands need a connection. | 10 | — |
| For platform engineers managing OpenTelemetry fleets, it sets safe per-instance goals before replicas change. | 14 | — |
| Loads an isolated eight-replica fleet. | 5 | — |
| No planner data is saved or sent. | 7 | Declared local-privacy claim |
| Works offline after the first visit. | 6 | Declared offline-reload claim |
| Free under the MIT License. | 5 | Declared mit-license claim |
| Seven collector nodes send dithered signals through one mechanical gate into a bound ledger. | 14 | Image alt text; describes the image purpose |
| Local sampling goals accumulate at fleet scale. | 7 | — |
| This browser calculator models one adaptive-throughput goal. | 7 | Scope statement; sample-budget test verifies the shown model |
| It keeps values in browser memory until you close the page. | 11 | Declared local-privacy claim |
| Before the adaptive tail sampler. | 5 | — |
| Assumes steady-state input and an even load balance. | 8 | Declared assumption-reporting claim |
| The CLI reports additional configuration-specific assumptions. | 6 | Declared assumption-reporting claim |
| The CLI needs a collector configuration, not trace data. | 9 | Declared local-privacy claim |
| It models supported sampler policies before estimating volume. | 8 | Declared supported-sampler-models claim |
| The CLI audits referenced processors and rejects unsupported sampling policies rather than making a quiet guess. | 16 | Declared unsupported-policy and configuration-errors claims |
| Local adaptive-throughput goals scale with replicas. | 6 | Declared supported-sampler-models claim |
| Percentage policies stay fractions of the load-balanced input. | 8 | Declared supported-sampler-models claim |
| Each scenario is checked against budget plus tolerance. | 8 | Declared scenario-assertion claim |
| Exit code 3 marks an over-budget assertion; JSON feeds CI. | 10 | Declared deploy-assertion claim |
| Build the Rust binary, run the bundled demo, then add the assertion to your deployment. | 15 | Direct usage instruction |
| DEMO — bundled sample data; your files were not read. | 10 | Declared demo-sandbox claim |
| Sampling budget checks for OpenTelemetry fleets. | 6 | Product descriptor |

Landing headings and actions checked: “Keep collector sampling within budget” (5), “Try it with sample data” (5), “Test one local goal at scale” (6), “Recalculate budget” (2), “Fleet budget result” (3), “Budget math you can audit” (5), “Follow the traces pipeline” (4), “Account for replicas by sampler type” (7), “Stop an over-budget deploy” (4), “Put the check in CI” (5), and “Copy command” (2). They identify a result or action and make sense in a heading list.

### README sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| Sampling Budget Coordinator (`sbc`) checks whether OpenTelemetry collectors stay within one fleet-wide span budget before deployment. | 16 | Product purpose |
| It is for platform engineers who need one fleet-wide span budget while collector replicas change. | 15 | Audience |
| It parses the collector YAML you select in local process memory. | 11 | Declared local-privacy claim |
| Collector configuration can contain endpoints, headers, identifiers, or credentials outside the traces pipeline. | 13 | Privacy context |
| `sbc` does not transmit, persist, or log configuration contents. | 9 | Declared local-privacy claim |
| It needs no trace payloads or span attributes and includes no telemetry or network client. | 15 | Declared local-privacy claim |
| Run the complete workflow without providing a collector configuration: | 8 | Direct instruction |
| `sbc demo` copies the bundled collector configuration into a new temporary directory. | 12 | Declared demo-sandbox claim |
| It runs the planner, saves `report.json`, and prints both paths. | 9 | Declared demo-sandbox claim |
| It never reads or writes your project data. | 8 | Declared demo-sandbox claim |
| The browser demo is available at `https://sampling-budget-coordinator.sociobot.in/demo/`. | 7 | Demo entry point |
| Its sample values stay in browser memory under an isolated demo mode and are never saved. | 16 | Declared demo-sandbox claim |
| Build the single binary with stable Rust: | 7 | Direct instruction |
| The package starts at `0.1.0`. | 5 | F-2-2 |
| Factory release automation owns registry publishing; do not publish from a workstation. | 12 | F-2-2 |
| Given a collector configuration with an adaptive-throughput sampler: | 9 | Usage context |
| Plan a 600 spans/second fleet budget for normal scale and an eight-replica peak: | 13 | Direct instruction |
| The report shows each scale's fleet cap and estimated export. | 10 | Declared plan-report claim |
| It reserves budget for percentage and always-sample rules before recommending local `goal_throughput` values. | 13 | Declared plan-report claim |
| If those rules already consume the budget, the report omits the goal and explains why. | 15 | Declared plan-report claim |
| Reports state steady-state, even-load, and rule-overlap assumptions. | 7 | Declared assumption-reporting claim |
| Conditional `always_sample` rules also produce a warning. | 6 | Declared assumption-reporting claim |
| Use the assertion in a deploy pipeline: | 7 | Direct instruction |
| Exit `0` means within budget. | 5 | Declared deploy-assertion claim |
| Exit `2` means the input or collector configuration is invalid or unsupported. | 11 | Declared deploy-assertion claim |
| Exit `3` means estimated export exceeds budget plus tolerance. | 9 | Declared deploy-assertion claim |
| The default tolerance is 10%; set it with `--tolerance 5`. | 10 | Declared default-tolerance claim |
| Both commands accept `--json` for scripting. | 6 | Declared deploy-assertion claim |
| `--input` is the incoming span rate before processors. | 8 | Declared upper-bound-without-input claim |
| Omit it for a throughput-only configured-ceiling audit. | 7 | Declared upper-bound-without-input claim |
| Replica scenarios may be repeated or comma-separated. | 7 | Declared scenario-assertion claim |
| Run `sbc <command> --help` for all options. | 6 | Direct instruction |
| Version 0.1 supports processors referenced by `service.pipelines.traces`: | 8 | Declared supported-sampler-models claim |
| `adaptive_tail_sampling` rules use `adaptive_throughput`, `adaptive_percentage`, `probabilistic`, and `always_sample`, following the documented development schema on 2026-08-28. | 15 | Declared supported-sampler-models claim |
| Both adaptive types require at least one scoped `fingerprint_attributes` selector. | 9 | Declared supported-sampler-models claim |
| Unknown sampling processors and missing trace pipeline wiring return errors. | 10 | Declared unsupported-policy and configuration-errors claims |
| Conditional `always_sample` rules need traffic-share data, so their estimate conservatively allows all input. | 13 | Declared supported-sampler-models claim |
| Prerequisites: stable Rust and Node.js 20+. | 6 | Direct setup instruction |
| `npm test` runs Rust unit/integration tests and desktop/mobile browser tests. | 10 | Direct verification instruction |
| The browser calculator models one adaptive-throughput goal. | 7 | Scope statement; sample-budget test verifies the shown model |
| Start the docs site with `npm run dev`. | 8 | Direct instruction |
| Deploy `dist/site/` as a static site at `https://sampling-budget-coordinator.sociobot.in`. | 8 | Direct deployment instruction |
| No runtime service, analytics, cookies, or external scripts are required. | 10 | Declared local-privacy claim |
| MIT. | 1 | License statement |
| See `LICENSE`. | 2 | Direct reference |

The supported-configuration bullets include two sentence fragments and one explanatory sentence: “Top-level `probabilistic_sampler` processors with `sampling_percentage`.” (5), “Multiple throughput rules as a conservative sum of their configured ceilings.” (11), and the conditional-rule sentence listed above. They are concise configuration entries, not unexplained mood headings.

Terminology remains stable: **fleet budget**, **local goal**, **replicas**, **peak replicas**, **incoming volume**, **assertion**, **demo**, and **collector configuration**. The literal CLI flag remains `--config`.

## Demo and sandbox checks

- One click from the landing action opened `/demo/`.
- The first demo screen already showed a worked sample: 600 spans/s budget, local goal 600, three current replicas, eight peak replicas, 12,000 incoming spans/s, an over-budget state, and a safe goal of 75 spans/s.
- The persistent banner read “Demo — sample data, nothing is saved.”
- Changing local goal to 42, selecting **Reset demo**, and checking the field restored 600.
- **Start for real** returned to `/` and did not carry the changed value.
- In a fresh live browser context after the whole demo flow: `localStorage=0`, `sessionStorage=0`, cookies were empty, and IndexedDB had zero databases.
- The live request log contained only `https://sampling-budget-coordinator.sociobot.in` requests and no console errors.
- The declared offline test passed from a fresh browser context after service-worker control. The CLI demo test passed from a temporary directory and checks that output is confined to a fresh operating-system temporary directory.

The demo gate passes.

## Claims and clean-clone checks

After `git clone --no-hardlinks /work/repo /tmp/sbc-review-clean` and `npm ci`, every command listed in `.factory/claims.json` passed separately:

| Claim id | Result |
| --- | --- |
| demo-sandbox | PASS |
| local-privacy | PASS |
| offline-reload | PASS |
| sample-budget | PASS |
| deploy-assertion | PASS |
| unsupported-policy | PASS |
| supported-sampler-models | PASS |
| configuration-errors | PASS |
| scenario-assertion | PASS |
| assumption-reporting | PASS |
| default-tolerance | PASS |
| upper-bound-without-input | PASS |
| plan-report | PASS |
| mit-license | PASS |

`npm test` also passed (18 Rust tests, one doctest, and 66 Playwright checks); `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --locked` passed. The public copy’s visitor-reliance statements map to the listed claims as marked in the copy tables; I found no unlisted public behavior claim.

## Structure, access, and visual checks

- Live `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` returned 200. An unknown route returned the designed 404 with HTTP 404.
- Each public page has a route-specific title, one h1, a main landmark, meta description, canonical URL, Open Graph/Twitter metadata, favicon, and apple touch icon. Titles follow the required product/title pattern.
- `robots.txt`, `sitemap.xml`, CSP, `Referrer-Policy`, `X-Content-Type-Options`, and the static 404 rewrite are present. The live response sends the CSP as an HTTP header.
- The public internal links, assets, sitemap, and the source-repository link returned 200; the intentional unknown route returned 404.
- Live forward navigation and Back moved focus to `h1#page-title` on the destination. The skip link targets main.
- Live axe checks found zero serious or critical violations on all five routes. No console errors occurred during the live demo flow.
- The 390 px layout had no horizontal overflow in the test suite. The phone view preserves the product-specific two-ink ledger system, halftone paper field, registration rules, mono display type, and vermilion action block. It does not present as a generic SaaS template.
- The brief describes a local calculation and deploy assertion. JSON output already supports automation. No additional AI action, remote sync, or import/export feature is implied by the brief; adding one would not improve the stated job.

## What would make this perfect

Make the 404 recovery action open the planner it names, and remove or relocate the internal release-process lines from the README. Then rerun the complete clean-clone claim commands and the route-control check. With no remaining findings, the product can pass this review.
