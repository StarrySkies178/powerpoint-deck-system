# Review fixes after review-mimic-7, and store fix 8 (v2.88)

The planner found four faults in review-mimic-7 before it went to Mike. Each is fixed here, and all twenty pictures were made again.

| Fault | Cause | Fix |
|---|---|---|
| C04 B, chart 1: the stacked bars float above the axis, ever higher | the builder's hand layout (B redraws these columns in build.js): the light part was drawn from the column top, not from the axis. No store tool was involved | `C04-two-charts-ecluster/B/build.js`: light part from the axis up, dark part on top; heights follow the values |
| C04 A, chart 1 subtitle wraps and "growth" prints over "CNY Billion" | a tool fault: a label stored as one line kept wrap="square" in a box that hugs its text, and LibreOffice spaces the PDF import's runs a little wider | **store fix 8** below |
| C08 A and B: "Top priority" wraps inside the dashed box | a tool fault: place() sets short labels to wrap="none", but the stored box keeps spAutoFit, and LibreOffice 26 wraps a wrap="none" box that carries spAutoFit (tested on the Mac: without spAutoFit, or in a wider box, it stays on one line) | **store fix 8** below |
| C02 B and C03 B keep the old client's name (PANDORA) in the footer | the builders' hand-drawn logo label | C02: the label follows the content (`client="AURORA"` in B: "AURORA \| Polaris"); C03 B names no client, so only "Polaris" stays. Every other B was checked for left-over client names and logos: only the team names (Polaris, E-Cluster, MindCraft, TrueNorth) remain, which are the authors, not the client |

**Store fix 8** (`Generators/objstore.py`, before: `archive/objstore_before-fix8-one-line-labels_v2.86_2026-11-24.py`): `place()` now (1) sets wrap="none" also on every label stored as one line (one paragraph, box no taller than one line of its largest size), and (2) replaces spAutoFit by noAutofit on every box with wrap="none", because a box that must not wrap must not resize. This closes the wrap part of the store fix 5 proposal row. **Regression** 7 of 7 before and after.

## Mimic numbers (A, on the usual renderer, comparable with v2.74)

C01 0.997, C02 0.917, C03 0.984, C04 0.990, C05 0.980, C06 0.981, **C07 0.955** (was 0.943: its panel headings now stay on one line on the usual renderer too), C08 0.947, C09 0.988, C10 0.996. No A worse than before. With the real fonts (the pictures): see `results-realfonts.json`.

## The twenty pictures

`review-mimic-8/` (original left, A right) and `review-mimic-8-b/` (A left, B right), all ten cases, rendered on the Mac with LibreOffice after `scripts/setup_render_fonts.sh` (the decks' real or metric-compatible fonts), as in v2.86. **Before the judge, the run's chat looked at all twenty pictures** (A and B, whole slide and close-ups of the four faults) for floating, overlapping or wrapped pieces: the four faults are gone, and nothing else was found (C08 B's "Top priority" sits close to risk 1 but does not touch it). Comparison judge on the A set first: `judge-compare/predictions-mimic-8.csv` (md5 b6341ce2…, written 13:52:52 UTC): 10 of 10 OK.
