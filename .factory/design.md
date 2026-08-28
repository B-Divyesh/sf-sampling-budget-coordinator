# Visual thesis: the fleet ledger

Sampling Budget Coordinator uses a dithered, two-ink print system: an operator's capacity worksheet translated into a crisp web utility. Halftone dots are not decoration. They make the central idea visible: many discrete collector decisions accumulate into one bounded fleet volume.

## Palette

The light treatment is explicit and paper-like. `paper` #F3EBD8 and `sheet` #FFF9EB evoke an annotated runbook; `ink` #17201D is the primary type and rule color; `ink-muted` #4F5B55 supports secondary copy; `signal` #B83B28 is the vermilion budget marker; `signal-dark` #812619 is its accessible interactive state; `teal` #086E66 communicates an in-budget state; `amber` #8B5500 and `danger` #A22323 communicate caution and failure. Dark treatment uses `press-black` #111815, `press-sheet` #19231F, `chalk` #F6EFD9, `chalk-muted` #C1C9BD, `signal` #FF765F, and `teal` #63D5C4. Text and state pairs meet 4.5:1; state always includes a label or symbol.

## Type and spacing

The display face is the self-hosted variable cut of **IBM Plex Mono**, used for headings, commands, and figures because the work is a numerical deployment audit. Body copy uses the system sans stack for faster reading and zero extra font weight. Type steps are 14, 16, 20, 28, 44, and 68 px. All numeric outputs use tabular figures. Layout follows an 8 px grid with 4 px micro-spacing; the content measure tops out at 1184 px and prose at 68 characters.

## Composition and interaction grammar

Thick registration rules, small uppercase folio labels, square corners, and offset shadows make sections feel like stacked print proofs rather than generic cards. The primary action is a solid vermilion block with a 44 px minimum target. Input/output are paired like a press proof: controls on the left, the fleet ledger on the right. On phones the proof stacks, drops ornamental crop marks, and keeps the result immediately below the action. Keyboard focus uses a 3 px teal outline with an offset paper gap.

## Motion policy

Only state changes move. Results enter with a 180 ms upward press-sheet motion; the budget bar eases to its new width over 240 ms. There are no looping animations. Under `prefers-reduced-motion: reduce`, transforms and scrolling are removed and results swap instantly with a short opacity change.

## Asset plan and provenance

The hero illustration is an original 3:2 ink-and-halftone image of seven collector nodes converging through a sampling gate into a bounded ledger. It was generated on 2026-08-28 with `/opt/fleet/lib/gen-image.sh`, deployment `factory-image`, at 1536×1024 and converted to 960 px/114 KB and 640 px/45 KB responsive WebP files. The prompt specified a 1960s two-ink letterpress technical illustration in near-black, vermilion, teal, and warm cream, with no text, logos, gradients, UI, photorealism, or watermark. The exact prompt and deployment response live at `.factory/assets/fleet-ledger-source.png.json`; the retained source is `.factory/assets/fleet-ledger-source.png`. No third-party imagery was used. The small registration/crop marks and favicon are original CSS/SVG shapes.

## Why this fits

Sampling is a probabilistic, aggregate act; halftone printing is the physical analogue. Individual dots appear noisy, but at fleet distance they resolve into a controlled tone. The budget line, ledger figures, and registration marks turn the abstract cost failure into something operators can inspect and sign off before deployment.
