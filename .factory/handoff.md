# Sampling Budget Coordinator — review 1 handoff

## Outcome

**FAIL** on 2026-08-30 against commit `0109f15588ed951b1c44b3ecfda739109891d7cf` and the live production site.

The cold first screen, one-click browser demo, CLI temp-directory demo, storage/network isolation, offline reload, declared claims, build, accessibility, links, metadata, 404 response, and earlier regression fixes all passed. The review records 18 remaining findings: eight unlisted or under-declared product claims and ten copy/navigation issues. No product code was changed.

See `.factory/review-1.md` for exact quotes, evidence, word counts, rewrites, and fixes.

## Verification performed

- Fresh Chromium at 390 × 844 and 1440 × 900; first screen captured before scrolling.
- Live demo mutation, reset, exit, cookies/localStorage/sessionStorage/IndexedDB inspection, request-origin log, and offline service-worker reload.
- `sbc demo` from an empty temporary working directory.
- All seven `.factory/claims.json` commands, separately, from a clean clone at the reviewed commit: all passed.
- `npm test`: passed 6 unit tests, 5 CLI integration tests, 1 doctest, and 37 Playwright tests; 9 intentional duplicate-project skips.
- `npm run typecheck`, `npm run lint`, and `npm run build`: passed.
- `/opt/fleet/lib/verify-url.sh`: passed against production.
- Live Playwright axe scan on landing, demo, Privacy, Terms, and 404: zero violations.
- Link/status crawl: all intended links returned 200; a made-up route returned the styled 404 with HTTP 404.
- Clean production rebuild compared with live: all 19 public files matched byte-for-byte.

## Remaining work

- Add or narrow the claims in F-1-1 through F-1-8.
- Apply the plain-language and terminology fixes in F-1-9 through F-1-16.
- Move focus to the route h1 after in-site navigation and Back (F-1-17).
- Rename the 404 h1 to “Page not found” (F-1-18).
- Rerun the full review from scratch. PASS requires zero findings.
