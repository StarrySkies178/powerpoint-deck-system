# Reproduction benchmark

**Question it answers:** given a correct prompt (the content, plus "match this reference"), does the
framework produce the original slide?

The pass bar was fixed here **before the first run**. Do not loosen it to make a run pass: fix the
framework instead. Only tighten it.

## Cases (`cases.json`, 20)

| Group | Cases | What they test |
|---|---|---|
| D01–D08 | Deloitte timesaver (the house default): table, numbered columns, chevrons, issue tree, org chart, paired columns, waterfall, text + chart | House default matches its own reference |
| C01–C10 | Real case-competition slides in 4 different styles (Polaris, E-Cluster, Mindcraft, TrueNorth) | Matching a user's reference with real content |
| Z01–Z02 | Chinese versions of D06 and D03 (`translated`) | Chinese font and layout; no visual score because the text differs |

Each `cases/<id>/` holds:

| File | Who writes it | What |
|---|---|---|
| `original.png`, `original.json` | `scripts/bench_setup.py` | Render and measured standards of the reference slide |
| `case.json` | `scripts/bench_setup.py` | Deck, slide, and the deck's "unrelated slide" floor for layout and visual |
| `slide-text.txt` | `scripts/bench_setup.py` | The slide's text and chart data; only for writing the prompt |
| `prompt.md` | Person or Claude, once | What a user would type: content, data, and the reference deck. Never positions, sizes or colours |
| `build.js` | The builder, following DECK-SYSTEM from `prompt.md` only | Makes `candidate.pptx` |
| `result.json`, `compare.png` | `scripts/bench_run.py` | Score, and original next to candidate |

## Scoring (`scripts/bench_score.py`)

**Standards** are read from the .pptx, with inherited sizes, theme fonts and theme colours resolved. A case passes only if every check that applies passes:

| Check | Tolerance |
|---|---|
| Slide size | ±0.05 in |
| Title position (text top, left) | ±0.25 in / ±0.15 in |
| Title size | ±1 pt |
| Title bold | Same |
| Title colour | ΔE ≤ 10 |
| Title font | Same |
| Body text | Median ±1.5 pt; smallest no more than 1 pt below the reference's smallest |
| Fonts | Only the reference's Latin fonts. Chinese text uses the reference's East Asian font, else Microsoft YaHei |
| Body margins | Left and right edge ±0.25 in |
| Colours | Every dominant colour in the render within ΔE 15 of the reference palette: theme colours plus render colours. For a named slide (D, Z) the palette is that slide's colours; for a deck given as the reference (C) it is the colours used across the deck (the target slide plus the 8 floor slides). Clarified in round 6; it was ambiguous before |
| Source line | If the reference has one: same size ±1 pt, same height ±0.25 in |

**Layout** is the IoU of the "ink" cells on a 32×18 grid, normalised so that 0 = as alike as unrelated slides of the same deck (the median of 8) and 1 = identical.

**Visual** is half colour similarity (Lab, blurred, 160×90) and half edge overlap (Dice), normalised the same way.

## Pass bar

**All applicable standards checks pass, layout ≥ 0.60, and visual ≥ 0.50.** Translated cases are scored on standards and layout only.

**Self-check:** scoring the original slide against itself gives 1.00 / 1.00 and a pass. Scoring an unrelated slide of the same deck fails.

## Two modes, two honesty rules

| Mode | Cases | What the builder may use |
|---|---|---|
| **Named slide** ("make it like slide 62") | D, Z | The reference's style profile, and that slide's own stored object (`Objects/store`), placed with its original colours and refilled (`bench/lib/place_named.py`) |
| **Deck as reference** ("in the style of this deck") | C | The deck's style profile and the generators. **Leave-one-out:** the target slide's own objects may not be reused (in real use that slide doesn't exist yet) |

Every build uses only what its `prompt.md` says, plus the framework (`Generators/`, `Style/refs/<deck>.profile.json`, `Objects/store`).

## Running

```
python3 bench/scripts/bench_setup.py Templates <dir of the decks rendered to PDF>   # once, or after adding cases
python3 bench/scripts/bench_run.py --label "what changed" [D|C|Z|case ids]          # build + score, writes results.md
```

Every run is added to `bench/results-log.md`, which keeps the history. Needs LibreOffice, poppler (`pdftoppm`), Node with pptxgenjs, and Python with python-pptx, Pillow and numpy.

**When to run:** after any change to `Generators/`, the master, `Objects/store` or a style profile. The pass count and the standards count must not drop (`maintenance/learning-loop.md`).

## Scorer corrections (kept honest)

The pass bar never moved. These measuring fixes apply to the original and the candidate alike:
- Round 3: title position from real font metrics and inherited anchors (was a character-count guess).
- Round 6: table text is measured; quarter-turned boxes use their turned bounds; colour palette scope written down (slide for D/Z, deck for C).
- Round 7: title position measured on the render (glyph tops on the title's own background), because wrap estimates disagreed with what LibreOffice draws.
