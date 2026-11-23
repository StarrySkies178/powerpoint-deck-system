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
| `brief/brief.md`, `brief/slide-map.csv` | `scripts/heldout.py brief` | The fresh builder's instructions; for C cases also the slide map without the target's row |
| `build.js` | The builder, following DECK-SYSTEM from `prompt.md` only | Makes `candidate.pptx` |
| `result.json`, `compare.png` | `scripts/bench_run.py` | Score, and original next to candidate |
| `noise/run1` … `run3/` | Fresh builders, then `scripts/bench_noise.py` | Rebuilds from `prompt.md` for the noise band, each with its own build, candidate and result |

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

## Two suites (since v2.25, roadmap step 1.1)

Each case in `cases.json` carries `"suite"`:

| Suite | Cases (at v2.25) | What a run must show |
|---|---|---|
| **Regression** | D01–D08 (since v2.32; Z01 was in it from v2.25 to v2.31) | Stays 8 of 8. One failing regression case means the change broke something, whatever else improved; `bench_run.py` prints `REGRESSION BROKEN` |
| **Capability** | C01–C10, Z01, Z02 | Measures progress. Expected to start near 0 |

**Z01 moved to capability in v2.32.** In the official environment (below) Z01 fails the colour check: the anti-aliased edges of its green Chinese title leave tints that are on no palette colour (196 px, 0.02% of the 320 x 180 shrink). That is a scorer issue, not a build error, but the scorer is frozen, so the case moved instead and regression is the 8 cases that pass in the official environment. The scorer change waits for Mike in `logs/proposals.md` (2026-11-24, `bench_score.py`, colour check). `cases.json` keeps the reason in Z01's `suite_note`.

`bench_run.py` prints and writes both counts and the 20-case total; `results-log.md` keeps all three on each line. `bench_run.py regression` or `capability` runs one suite. Same bar and same scorer for both. A capability case **graduates** into regression only when it passes 3 of 3 fresh rebuilds (next section), never on one run of its stored build; changing its `suite` is then logged in the changelog.

## Phase 1 working files (2026-11-24)

| Path | Roadmap step | What |
|---|---|---|
| `diagnosis-1.4/` | 1.4 | 30 blind diagnosis builds of the C cases (a brief, b brief + layout in words, c edit of the closest other slide), scored by `scripts/bench_diag.py`; reading in `diagnosis-1.4/README.md` |
| `error-analysis-1.6.md` | 1.6 | DRAFT list of failure kinds with one example each, for Mike to confirm before any judge is built |
| `rating-1.7/` | 1.7 | 60 slide pictures for Mike to rate pass or fail; `key.json` is not for the rater |

`scripts/heldout.py` also treats a slide that repeats a target as the target (`TWINS`: TrueNorth 18 repeats C10's slide 8, since v2.33).

## Noise band (since v2.25, roadmap step 1.2)

**Rule: a case counts as passing only if 3 of 3 rebuilds pass.** A rebuild is a `build.js` written again from `prompt.md` alone by a fresh builder (a new chat or subagent that has not seen the case's own build, its result, the original render or the other rebuilds). Scoring the same stored build twice gives the same numbers (checked 2026-11-24), so the spread comes from the builder, not the scorer.

- Rebuilds live in `cases/<id>/noise/run1` … `run3`; the case's own `build.js`, `candidate.pptx` and `result.json` are not touched. `python3 bench/scripts/bench_noise.py <case ids>` builds and scores them with the unchanged scorer and writes `noise.md`.
- The regular run (`bench_run.py`) still runs the stored builds once: it checks that a change to the builders did not break a known-good build. The 3-of-3 rule applies whenever a claim is made that a case passes or got better (graduation, Phase 4 of the roadmap).
- Why 3 of 3: a case that truly passes 70% of the time passes 3 of 3 only 34% of the time, so the rule accepts few false improvements (roadmap 1.2).

**First measurement (2026-11-24, v2.25; table in `noise.md`).** Five cases, three fresh rebuilds each, every rebuild written by its own fresh subagent from `prompt.md` (same model, Claude Opus 5.5, and the same instruction text for all 15). Stored = the case's own build.

| Case | Suite | Stored (layout / visual) | Rebuilds (layout / visual) | Passes | Spread layout / visual |
|---|---|---|---|---|---|
| D03 chevrons | regression | pass · 0.65 / 0.73 | 0.69 / 0.80, 0.69 / 0.83, 0.69 / 0.80 | 3 of 3 | 0.00 / 0.03 |
| D04 issue tree | regression | pass · 0.71 / 0.69 | 0.87 / 0.85, 0.87 / 0.85, 0.88 / 0.85 | 3 of 3 | 0.01 / 0.00 |
| D08 text + chart | regression | pass · 0.65 / 0.70 | 0.86 / 0.92 three times | 3 of 3 | 0.00 / 0.00 |
| C04 two charts | capability | fail · 0.30 / 0.26 | 0.13 / 0.24, 0.26 / 0.30, 0.27 / 0.27 | 0 of 3 | 0.14 / 0.06 |
| C07 scenario lines | capability | fail · 0.17 / 0.26 | 0.38 / 0.44, 0.38 / 0.44, 0.48 / 0.52 | 0 of 3 | 0.10 / 0.08 |

Those numbers were scored in that day's cloud workspace. **Rescored in the official environment the same day** (`noise.md`, v2.29): same verdicts, every value within 0.04 (largest: C04 rebuild 2, layout 0.26 to 0.22); C07 rebuild 2 also fails the leave-one-out check.

What it shows, and its limits:
- **No verdict changed.** Every rebuild landed on the same side of the bar as the stored build, so the 3-of-3 rule keeps D03, D04 and D08 in regression and C04, C07 in capability.
- **Spread between fresh rebuilds is small:** at most 0.03 on named slides (D), at most 0.14 layout and 0.08 visual on deck-as-reference slides (C). Treat a change in a C case's layout below about 0.15, or visual below about 0.10, as possibly noise; on D cases below about 0.05.
- **The stored builds are not typical draws.** Rebuilds beat the stored build by up to 0.21 layout on D (D04, D08) and 0.24 on C07, and fell below it on C04. The 15 rebuilds shared one model and one instruction text, while the stored builds were written days earlier under other instructions, so the spread above is a lower bound on real builder noise. The D rebuilds also copied bullet indents and spacing from the named reference slide, which they were allowed to look at.
- **Standards can flip between builds:** C04's stored build passes all 11 standards, but all three rebuilds fail body text size (12 to 13 pt against the reference's 15).
- **Leave-one-out leak (not fixed; Style/ is frozen):** `Style/slide-map.csv` has a one-line description of every reference slide, the C target slides included, and the 2019–20 study notes name some of them as examples. All six C rebuilders came across their target's line while looking up the deck's layouts. So the C rebuilds were not fully blind to their target's layout, and the stored C builds may have had the same exposure. Until it is fixed, C builders are told not to look up their target slide there (honesty rules above).

**Self-check:** scoring the original slide against itself gives 1.00 / 1.00 and a pass. Scoring an unrelated slide of the same deck fails.

## Two modes, two honesty rules

| Mode | Cases | What the builder may use |
|---|---|---|
| **Named slide** ("make it like slide 62") | D, Z | The reference's style profile, and that slide's own stored object (`Objects/store`), placed with its original colours and refilled (`bench/lib/place_named.py`) |
| **Deck as reference** ("in the style of this deck") | C | The deck's style profile and the generators. **Leave-one-out:** the target slide's own objects may not be reused (in real use that slide doesn't exist yet), and its descriptions may not be looked up: its row in `Style/slide-map.csv` and any study note that names it (added v2.25, see "Noise band") |

Every build uses only what its `prompt.md` says, plus the framework (`Generators/`, `Style/refs/<deck>.profile.json`, `Objects/store`).

**Builder briefs and the leave-one-out check (since v2.29).** A fresh builder gets its instructions from `cases/<id>/brief/brief.md` (`python3 bench/scripts/heldout.py brief` writes them). For a deck-as-reference case the brief also holds `slide-map.csv`: `Style/slide-map.csv` without the target slide's row, to be used instead of the original, and says to skip study-note examples that name the target. `heldout.py check` reads a C build's own files (`build.js`, `build.py`, notes) and reports a finding when they cite the target slide: one of its stored-object ids, "slide N" or `slides[N-1]` for its number, the short deck name with it ("Mindcraft 14"), or five words in a row from its slide-map row that are not in the prompt. `bench_run.py` and `bench_noise.py` run the check after scoring and fail a case with a finding (check "leave-one-out"); a person reads the finding. It cannot see what a builder only read, so the filtered slide map in the brief is the main safeguard. First check (2026-11-24): every stored C build is clean; C07 noise rebuild 2 is a finding (its comment reuses its target's slide-map words, and its builder had reported seeing the row), so that rebuild now counts as failed. It failed already, so no verdict changed.

## Official environment (since 2026-11-24, roadmap step 1.3)

**All benchmark numbers come from one place: the Linux VM of the Claude desktop app on the user's Mac, working on the folder itself** (`device_bash`, `~/mnt/Powerpoint`). Its fingerprint is in `bench/environment.json`: LibreOffice 26.2.6.3, poppler 22.02.0, pptxgenjs 4.0.1, aarch64, Python 3.10.12, Ubuntu 22.04; Arial renders as Liberation Sans, Microsoft YaHei as Noto Sans CJK SC.

- **Both sides are rendered there.** The reference renders, measured standards and floors (`original.png`, `original.json`, `case.json`) were made again on the Mac with `bench_setup.py` on 2026-11-24, from PDFs of the reference decks exported there. Before that, they came from an earlier cloud workspace, so every Mac run compared two different LibreOffice versions.
- `bench_run.py` prints the environment at the top and writes it into `results.md`. A run anywhere else is marked "NOT the official environment" there and in `results-log.md`: use it to try things, never as a result.
- **Why the Mac:** the folder lives there, every chat linked to the Mac and Hermes can reach it, and results are written in place with nothing copied. Cloud workspaces differ from session to session; the per-case files dated 12:45 came from one, and they disagreed with `results.md`.
- **How much the environment moves the numbers** (2026-11-24, 20 cases, stored builds): the cloud workspace of that day (LibreOffice 24.2.7, x86_64) against the official environment differs by 0.011 layout and 0.008 visual on average, at most 0.05 on one case (C01 layout, C09 visual). That is small against the bar, but it flips cases that sit near a threshold: with the old cloud-made references, D02 and Z01 failed on the Mac by the colour check; with references made on the Mac, Z01 still does (below).
- **Known effect, not fixed (scorer unchanged):** the colour check takes dominant colours from a 320 x 180 shrink of the render. A thin coloured text edge blended with white can pass the 2% share there and count as an off-palette colour (Z01: 196 pixels of light green at the edges of the green Chinese title, 0.02% of the full render; C07: a light red tint). Proposal in `logs/proposals.md`. Until it is decided, Z01 counts as failing in the official environment and the regression suite reads 8 of 9.
- To change the official environment on purpose: update `environment.json`, run `bench_setup.py` and `bench_run.py` there, and log it.

## Running

```
python3 bench/scripts/bench_setup.py Templates <dir of the decks rendered to PDF>   # once, or after adding cases; in the official environment, with PDFs exported there
python3 bench/scripts/bench_run.py --label "what changed" [D|C|Z|case ids|regression|capability]   # build + score, writes results.md
python3 bench/scripts/bench_noise.py <case ids>                                    # score the fresh rebuilds in cases/<id>/noise/, writes noise.md
```

Every run is added to `bench/results-log.md`, which keeps the history. Needs LibreOffice, poppler (`pdftoppm`), Node with pptxgenjs, and Python with python-pptx, Pillow and numpy.

**When to run:** after any change to `Generators/`, the master, `Objects/store` or a style profile. The pass count and the standards count must not drop (`maintenance/learning-loop.md`).

## Scorer corrections (kept honest)

The pass bar never moved. These measuring fixes apply to the original and the candidate alike:
- Round 3: title position from real font metrics and inherited anchors (was a character-count guess).
- Round 6: table text is measured; quarter-turned boxes use their turned bounds; colour palette scope written down (slide for D/Z, deck for C).
- v2.6: labels of native charts count as body text (before, charts drawn as text boxes counted and native charts did not).
- Round 7: title position measured on the render (glyph tops on the title's own background), because wrap estimates disagreed with what LibreOffice draws.
