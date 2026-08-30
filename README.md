# Sampling Budget Coordinator

Sampling Budget Coordinator (`sbc`) audits OpenTelemetry collector sampling economics before deployment. It is for platform engineers who need one fleet-wide span budget even while collector replica counts change.

It parses the collector YAML you select in local process memory. Collector configuration can contain endpoints, headers, identifiers, or credentials outside the traces pipeline. `sbc` does not transmit, persist, or log configuration contents. It needs no trace payloads or span attributes and includes no telemetry or network client.

## Try the sample

Run the complete workflow without providing a config:

```sh
cargo run -- demo
```

`sbc demo` copies the bundled collector config into a new temporary directory, runs the same planner, saves `report.json`, and prints both paths. It never reads or writes your project data.

The browser demo is available at <https://sampling-budget-coordinator.sociobot.in/demo/>. Its sample values stay in browser memory under an isolated demo mode and are never saved.

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
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run build:site  # static site -> dist/site
cargo package --allow-dirty
```

`npm test` runs Rust unit/integration tests and desktop/mobile browser tests. The browser planner uses the same documented throughput formula as the CLI. Start the docs site with `npm run dev`.

## Deployment

Deploy `dist/site/` as a static site at `https://sampling-budget-coordinator.sociobot.in`. No runtime service, analytics, cookies, or external scripts are required.

## License

MIT. See [LICENSE](LICENSE).
