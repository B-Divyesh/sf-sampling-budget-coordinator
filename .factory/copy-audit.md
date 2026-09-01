# Landing-page copy audit

Audited 2026-09-01 against `site/index.html`. Word counts split on whitespace. All prose sentences and the first-screen headings and actions appear below. Terminal output and generated table values are product output, so claim tests cover them instead of the prose limit.

## First-screen read

“Keep collector sampling within budget. For platform engineers managing OpenTelemetry fleets, it sets safe per-instance goals before replicas change. Try it with sample data.”

This states the job, audience, result, and first action in one breath. The headline has 5 words, the audience sentence has 14, and the action has 5.

## Copy and counts

| Copy | Words |
| --- | ---: |
| Skip to main content | 4 |
| You are offline. | 3 |
| The planner still works locally; install commands need a connection. | 10 |
| OpenTelemetry / pre-deploy audit | 4 |
| Keep collector sampling within budget | 5 |
| For platform engineers managing OpenTelemetry fleets, it sets safe per-instance goals before replicas change. | 14 |
| Try it with sample data | 5 |
| Loads an isolated eight-replica fleet. | 5 |
| No planner data is saved or sent. | 7 |
| Works offline after the first visit. | 6 |
| Free under the MIT License. | 5 |
| Local sampling goals accumulate at fleet scale. | 7 |
| Test one local goal at scale | 6 |
| This browser calculator models one adaptive-throughput goal. | 7 |
| It keeps values in browser memory until you close the page. | 11 |
| Before the adaptive tail sampler. | 5 |
| Recalculate budget | 2 |
| Fleet budget result | 3 |
| Safe per-instance goal at peak | 5 |
| Assumes steady-state input and an even load balance. | 8 |
| The CLI reports additional configuration-specific assumptions. | 6 |
| Budget math you can audit | 5 |
| The CLI needs a collector configuration, not trace data. | 9 |
| It models supported sampler policies before estimating volume. | 8 |
| Follow the traces pipeline | 4 |
| The CLI audits referenced processors and rejects unsupported sampling policies rather than making a quiet guess. | 16 |
| Account for replicas by sampler type | 7 |
| Local adaptive-throughput goals scale with replicas. | 6 |
| Percentage policies stay fractions of the load-balanced input. | 8 |
| Stop an over-budget deploy | 4 |
| Each scenario is checked against budget plus tolerance. | 8 |
| Exit code 3 marks an over-budget assertion; JSON feeds CI. | 10 |
| Put the check in CI | 5 |
| Build the Rust binary, run the bundled demo, then add the assertion to your deployment. | 15 |
| Recorded terminal run with the bundled sample | 7 |
| Sampling budget checks for OpenTelemetry fleets. | 6 |
| Built by Param Factory · v0.1.0 | 6 |

No line exceeds 22 words. No copy uses the banned marketing terms.

## Terminology

| Concept | Term used |
| --- | --- |
| Overall allowed export rate | fleet budget |
| Per-collector throughput setting | local goal |
| Deployed collector count | replicas |
| Expected maximum count | peak replicas |
| Incoming spans before sampling | incoming volume |
| Automated deploy check | assertion |
| Example environment | demo |

## Round 2 README and catalog check

The README installation section now ends after the two install commands. The internal package-version and factory publishing sentences were removed. A repository search finds no remaining “Factory release automation,” “package starts,” “sampling economics,” “Fleet ledger,” or “Multiply where OTel does” copy.

The catalog description is “Keep OpenTelemetry collector fleets within one span budget as replicas change.” It has 11 words, begins with a verb, and is 78 characters before its newline. Its behavior is covered by the `plan-report` and `scenario-assertion` claims.
