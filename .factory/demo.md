# Demo sandbox

## Browser

- URL: `https://sampling-budget-coordinator.sociobot.in/demo/`.
- Local URL after `npm run dev`: `http://127.0.0.1:5173/demo/`.
- The bundled sample models three current collectors, an eight-replica peak, a 600 spans/s fleet budget, and 12,000 incoming spans/s.
- Demo state exists only in page memory. The demo reads and writes no `localStorage`, `sessionStorage`, IndexedDB, cookies, or real planner data.
- **Reset demo** restores every bundled value. **Start for real** discards the page-memory state and opens the regular planner.
- An online first visit installs the versioned service-worker shell. The same demo then reloads and recalculates offline.

## CLI

Run:

```sh
cargo run -- demo
```

The command creates a fresh `sbc-demo-<process>-<time>` directory under the operating system temporary directory. It writes the bundled `examples/collector.yaml` and the resulting `report.json` there, prints that path, and never reads project configuration. Delete the printed directory after inspection when desired.

Use `cargo run -- demo --json` for a machine-readable report on stdout. The sample directory is reported on stderr so stdout remains valid JSON.
