# Sampling Budget Coordinator — repair handoff

## Release decision

**PASS — repair verified on 2026-08-30.** This repair starts from the independent verifier's failing candidate `ecf34142eb1424a791d74f11b2108aa66784fddf` and the prior repair commit `3e04b757b54a6a2dd6969fb5140c907d3d1d0c61`.

## Repairs

- Reproduced the original skip-link defect in an isolated worktree at `ecf34142`: after Tab then Enter, Chromium reported `document.activeElement` as `BODY` and `<main>` had no `tabindex`.
- The shipped repair makes every main target programmatically focusable (`tabindex="-1"`) and explicitly moves focus to it from the skip link. Playwright exercises this with keyboard input on `/`, `/privacy/`, and `/terms/`.
- The worker shell cache is now generated from a deterministic build hash (`sbc-shell-<12 hex>`), and activation removes prior `sbc-shell-*` caches. The regression installs an old worker/cache, installs the generated worker, asserts deletion, reloads, and confirms the fresh shell.
- Public privacy wording now consistently states that configuration is parsed locally and is never transmitted, persisted, or logged. It no longer says the CLI reads only referenced processors; that was broader than the implementation. A CLI integration test checks README, landing, and privacy-page copy against both prohibited statements.

## Verification

Executed from a clean `npm ci` on this worker image:

```sh
npm test
cargo clippy --all-targets --all-features -- -D warnings
npm run build
cargo package --locked --allow-dirty
```

- `npm test` passed: 6 Rust unit tests, 4 CLI integrations, 1 doctest, and 16 Playwright checks on desktop Chromium and 390×844 mobile Chromium (2 expected project skips).
- Browser coverage includes keyboard skip focus, light/dark axe serious/critical checks, form error recovery, 390 px overflow, offline in-page planning, legal routes, console errors, and old-cache/new-worker upgrade.
- `cargo clippy --all-targets --all-features -- -D warnings` passed.
- Production `npm run build` emitted `dist/site`; application JS is 3.49 KB, CSS 10.89 KB, and the mobile hero image is 46,062 bytes. The final production build contains a versioned worker and no test-only previous-worker file.
- `cargo package --locked --allow-dirty` passed: 14 files, 56.3 KiB unpacked and 16.9 KiB compressed.
- A fresh package consumer installed `target/package/sampling-budget-coordinator-0.1.0` with `cargo install --locked`; `sbc plan` returned the documented JSON report (safe goal 75), and `sbc assert` returned exit 3 for the over-budget case.
- `npm audit --omit=dev` found 0 vulnerabilities. The static response policy was checked in `dist/site/staticwebapp.config.json`: self-only CSP/connect policy, `frame-ancestors 'none'`, `nosniff`, and strict-origin referrer policy are present.

## Release

Deploy the static artifact in `dist/site/`. This work order's repository push to `main` is the factory deployment trigger; no service, data store, analytics, secrets, or infrastructure was accessed or changed.

## Known boundaries

- Inputs remain explicit; v1 does not query Kubernetes or live collector telemetry.
- Estimates are steady-state and conservative for conditional throughput rules. They do not simulate burst traffic, adjustment lag, uneven load balancing, cross-instance trace assembly, or vendor accounting.
- The project has no `verify-url.sh` in this checkout; equivalent title, landmark, accessibility, console, mobile, offline, and policy checks run in Playwright and the built static configuration was inspected directly.
