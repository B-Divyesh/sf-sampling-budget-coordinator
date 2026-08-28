# Sampling Budget Coordinator

Sampling Budget Coordinator (`sbc`) audits OpenTelemetry collector sampling economics before deployment. It is for platform engineers who need one fleet-wide span budget even while collector replica counts change.

It reads collector YAML only. It never reads traces, span attributes, credentials, or customer identifiers; it has no telemetry and makes no network requests.

## Install

Build the single binary with stable Rust:

```sh
cargo install --path .
sbc --help
```

The package starts at `0.1.0`. Factory release automation owns registry publishing; do not publish from a workstation.

## Usage

Given a collector config with an adaptive throughput sampler:

```yaml
processors:
  adaptive_tail_sampling:
    rules:
      - name: default
        sampler:
          type: adaptive_throughput
          goal_throughput: 600

service:
  pipelines:
    traces:
      processors: [adaptive_tail_sampling]
```

Plan a 600 spans/second fleet budget for normal scale and an eight-replica peak:

```sh
sbc plan \
  --config collector.yaml \
  --budget 600 \
  --replicas 3 \
  --scenario 3,5,8 \
  --input 12000
```

The report shows the configured fleet cap at each scale, an estimated export volume, and a conservative recommendation: set each local `goal_throughput` to `budget / maximum scenario replicas`. Estimates explicitly state the equal traffic split, steady-state, and rule-overlap assumptions.

Use the assertion in a deploy pipeline:

```sh
sbc assert --config collector.yaml --budget 600 --replicas 8 --input 12000
sbc assert --config collector.yaml --budget 600 --replicas 8 --input 12000 --json
```

Exit codes are stable: `0` means within budget, `2` means the input/config is invalid or unsupported, and `3` means the estimated export exceeds the declared budget plus tolerance. The default tolerance is 10%; set it with `--tolerance 5`.

Both commands accept `--json` for scripting. `--input` is the incoming span rate before processors; omit it when only a configured upper-bound audit is needed. Replica scenarios may be repeated or comma-separated. Run `sbc <command> --help` for all options.

### Supported configuration surface

Version 0.1 supports processors referenced by `service.pipelines.traces`:

- `adaptive_tail_sampling` rules using `adaptive_throughput`, `adaptive_percentage`, `probabilistic`, and `always_sample`, following the documented development schema on 2026-08-28.
- Top-level `probabilistic_sampler` processors with `sampling_percentage`.
- Multiple throughput rules as a conservative sum of their configured ceilings.

Unknown sampling processors and missing trace pipeline wiring are errors, not silent guesses. Conditional `always_sample` rules are called out because their volume needs traffic-share data and therefore cannot be bounded from config alone.

## Develop and verify

Prerequisites: stable Rust and Node.js 20+.

```sh
npm install
npm test
npm run build
npm run build:site  # static site -> dist/site
cargo package --allow-dirty
```

`npm test` runs Rust unit/integration tests and site tests. The browser demo is local-only and uses the same documented formulas as the CLI. Start the docs site with `npm run dev`.

## Deployment

Deploy `dist/site/` as a static site at `https://sampling-budget-coordinator.sociobot.in`. No runtime service, analytics, cookies, or external scripts are required.

## License

MIT. See [LICENSE](LICENSE).
