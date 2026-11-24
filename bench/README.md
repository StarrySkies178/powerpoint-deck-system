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
| **Regression** | D01, D03–D08 (since v2.46; D02 was in it until v2.43, Z01 from v2.25 to v2.31) | Stays 7 of 7. One failing regression case means the change broke something, whatever else improved; `bench_run.py` prints `REGRESSION BROKEN` |
| **Capability** | C01–C10, D02, Z01, Z02 | Measures progress. D02, Z01, Z02 (named-slide) keep the pass bar. **C01–C10 carry no pass mark since v2.62**: they report the overlap with the original before the floor and its change (next paragraph and "Deck-as-reference cases") |

**D02 moved to capability in v2.46 (Run 0).** Scored against the original as PowerPoint draws it, its stored build fails the colour check (a light blue, #B4E4FC, that the PowerPoint picture of the original does not contain). Z01 passes against the PowerPoint pictures but stays in capability until it passes 3 of 3 fresh rebuilds.

**Z01 moved to capability in v2.32.** In the official environment (below) Z01 fails the colour check: the anti-aliased edges of its green Chinese title leave tints that are on no palette colour (196 px, 0.02% of the 320 x 180 shrink). That is a scorer issue, not a build error, but the scorer is frozen, so the case moved instead and regression is the 8 cases that pass in the official environment. The scorer change waits for Mike in `logs/proposals.md` (2026-11-24, `bench_score.py`, colour check). `cases.json` keeps the reason in Z01's `suite_note`.

`bench_run.py` prints and writes both counts and the 20-case total; `results-log.md` keeps all three on each line. `bench_run.py regression` or `capability` runs one suite. Same bar and same scorer for both. A capability case **graduates** into regression only when it passes 3 of 3 fresh rebuilds (next section), never on one run of its stored build; changing its `suite` is then logged in the changelog.

## Deck-as-reference cases: no pass mark (since v2.62, roadmap 4.2 Run 2c step 4)

Decided with the user on 2026-11-24 14:40, after `calibration-2c.md` showed that no pixel measure predicts his own verdict on these cases (the best, the overlap before the floor, separates his ok from his not ok no better than chance on 20 labels; the floored layout sent three slides he accepted to 0.00). So:

- **C01 to C10 carry no pass mark.** `bench_run.py` and `results.md` show, per case: `layout_raw` (the ink-grid overlap with the original *before* the floor, `bench_score.layout_raw`), the previous run's value (`results-raw.json`, updated only by a run of all ten), the change, and a **moved back** flag when it falls by more than 0.05. Standards are still listed, for information.
- **Regression (D01, D03 to D08) and the named-slide capability cases (D02, Z01, Z02) keep the bar exactly as before.**
- **Fresh rebuilds** (`bench_rebuilds.py <run> --report <previous run>`) compare each case's mean `layout_raw` over its 3 builds with the run before and flag a fall of more than 0.05. That is the change-control rule for these cases now (`maintenance/working-together.md`, rule 3).
- **The noise band, 0.05:** over the 108 fresh builds of run0, run1, run2, run2a and run2a-final (36 case-runs of 3 builds), the pooled standard deviation of `layout_raw` between builds of the same case in the same run is 0.027; the mean of 3 builds then differs between two runs by up to 2 × 0.027 × √(2/3) = 0.045 by chance (about 95%), rounded to 0.05. The largest spread between 3 builds of one case was 0.125 (C01 in run0), median 0.042. Read against history: run1 → run2 moved C05 from 0.803 to 0.731 (−0.072, flagged), which is the run that was not kept; no other case-run move in those runs passes 0.05.
- **Nothing in `bench_score.py` changed**: the same measures, the same floors; only what is reported as pass. The old pass/fail, layout and visual after the floor are still computed and shown beside the new numbers (`results.md` "Old bar, for comparison only", `results-log.md` columns since v2.62, `bench_rebuilds.py` reports). The old scripts are in `archive/*_before-run2c4_v2.61_2026-11-24.*`.
- **Pass or fail for these cases** will come from the AI judge of roadmap step 1.8 (`judge-1.8/`), once the user has seen how often it agrees with him.

**First run under the new reporting** (stored builds, v2.62): regression 7 of 7, named-slide capability 1 of 3 (Z01), C cases mean `layout_raw` 0.634, none moved back (the previous values were seeded from the same v2.57 pictures). Old bar for comparison: 8 of 20.

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

## Reference pictures from PowerPoint (since v2.46, roadmap 4.2 Run 0)

Every case's `original.png` and its floors are now drawn from the reference decks as Microsoft PowerPoint exported them on the Mac (`originals-powerpoint/<deck>-ppt.pdf`, all five decks), rendered by the benchmark's own `pdftoppm` step: `python3 scripts/bench_setup.py ../Templates <dir with the PDFs named <deck>.pdf>`. The pictures used up to v2.43 were LibreOffice renders with substitute fonts (broken labels, overlapping text); they are kept in `archive/bench-originals_before-run0_v2.46_2026-11-24.zip` with the case files of that time. `original.json` (the measured standards) still comes from the .pptx; only its `render_colours` follow the new picture. Scorer and pass bar unchanged.

**Baseline after Run 0** (every later run is compared with it): regression 7 of 7 (D02 moved out, see above), capability 1 of 13 (Z01), total 8 of 20. Fresh blind rebuilds of the C cases for change control live in `phase4/<run>/<case>/r1..r3` (`scripts/rebuild_briefs.py`, `scripts/bench_rebuilds.py`).

**Runs measured against it** (fresh rebuilds: 3 per C case, mean of the per-case means):

- Run 1 (v2.49, body text size from the reference, kept): stored builds unchanged; rebuilds 0 of 30 pass, layout 0.262 to 0.281, visual 0.285 to 0.316.
- Run 2 (v2.51, a check that every number comes from the prompt, not kept): stored builds unchanged and none failed the check; rebuilds 0 of 30 pass, layout 0.281 to 0.271, visual 0.316 to 0.319, none failed the check; C05 fell 0.17 to 0.00 layout, beyond the 0.14 band, so the v2.49 files were restored. The tried code is in `archive/*_tried-not-kept-run2_2026-11-24.*`. Comparison images: `review-run2/`.
- Run 2b (v2.53, measuring tool only): `cases/C04-two-charts-ecluster/prompt.md` corrected to the original slide (column totals 532, 722, 998; CAGR fashion 9% / 13%, fine 4% / 5%, total 4% / 7%; fine 4% circled). It had 53, 72, 99 and 23% / 18%, which no build could match. Old prompt in `archive/C04-prompt_before-run2b_v2.53_2026-11-24.md`. Scores do not read the prompt, so the re-score is unchanged. **Baseline from v2.53:** regression 7 of 7 (mean layout 0.743, visual 0.797), capability 1 of 13 (mean layout 0.234, visual 0.263), total 8 of 20. The stored C04 build (`cases/C04-two-charts-ecluster/build.js`) and its noise rebuilds were made from the old prompt and still show its numbers; fresh rebuilds from now on use the corrected one.
- Run 2a (v2.57, the house table replaced by five table forms from the references, `Style/table-forms.md`; kept): stored builds regression 7 of 7 → 7 of 7, capability 1 of 13 → 1 of 13, capability mean layout 0.234 → 0.232, visual 0.263 → 0.259 (only C03, whose stored build uses `dataTable`, moved: 0.03 / 0.32 → 0.00 / 0.28, inside the 0.14 band). Fresh blind rebuilds of the three table cases (`phase4/run2a/`, run1 → run2a, per-case mean layout / visual): C03 0.00 / 0.257 → 0.00 / 0.243, C08 0.410 / 0.367 → 0.407 / 0.363, C10 0.317 / 0.427 → 0.313 / 0.367; 0 of 9 pass, no case worse by 0.14. The measure barely sees tables; the user's look at `review-run2a/` (the 10 rated table slides rebuilt) is the real test of this run.
- Run 2a closed (v2.59): the 9 rebuilds above were made while `table()` still forced 14 pt under a reference profile, so C03, C08 and C10 were rebuilt again, 3 fresh blind builds each, with the final code (`phase4/run2a-final/`). Against run1 (per-case mean layout / visual): C03 0.00 / 0.257 → 0.00 / 0.250, C08 0.410 / 0.367 → 0.427 / 0.390, C10 0.317 / 0.427 → 0.330 / 0.367; 0 of 9 pass; no case worse by 0.14, so Run 2a stays. One C08 build was flagged by `heldout.py` (target slide-map words) and counts as a fail.

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
