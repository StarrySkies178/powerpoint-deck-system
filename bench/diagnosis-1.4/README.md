# Roadmap step 1.4: diagnosis builds (2026-11-24)

**Question:** why do the 10 deck-as-reference (C) cases score 0 of 10? One part at a time (roadmap 1.4): give the builder one missing piece and see what moves.

**Per case, three builds, each written by its own fresh subagent** (same model, Claude Opus 5.5; none saw another build, a score or the original, except the describer for b):

| Folder | Builder got |
|---|---|
| `<case>/a/` | the case brief as today (`brief/brief.md`, prompt, slide map without the target's row) |
| `<case>/b/` | the same, plus `b/brief/layout-description.md`: the original's layout in plain words (zones, kind of figure in each, counts of columns, rows and items, header and footer bands; no positions, sizes, fonts or colours), written beforehand by a separate subagent that looked at `original.png` |
| `<case>/c/` | the same brief, told to take the closest OTHER slide of the same deck from the object store and edit it to carry this content; the target's own objects off limits |

- **Blind:** every build passed `bench/scripts/heldout.py` except C08 c, which the check fails (its build.js says "risk heat map (likelihood x severity)", five words that also stand in the target's slide-map row). It is counted as a fail; its scores are shown anyway.
- **Where:** builders wrote and previewed in a cloud working copy; `bench/scripts/bench_diag.py` then built every folder again and scored it in the official environment (Mac VM, `bench/environment.json`) with the unchanged scorer. The cases' own builds in `bench/cases/` were not touched.
- **Renders of the other slides** the builders used (cloud LibreOffice, 96 dpi, the target left out) are not kept here: they are copies of the reference decks and can be made again from `Templates/`.
- Results: `results.md` (per build: result, standards, layout / visual, failed standards; summary). Per case: `<case>/diagnosis.json`; each build folder keeps its candidate, render, compare and result.

## What the numbers say

| | a (brief) | b (+ layout in words) | c (edit closest other slide) |
|---|---|---|---|
| Passing cases | 0 of 10 | 0 of 10 | 0 of 10 |
| Mean layout | 0.29 | 0.44 | 0.24 |
| Mean visual | 0.31 | 0.40 | 0.28 |
| Change against a, layout: mean / median | | +0.15 / +0.06 | −0.04 / −0.04 |
| Cases up / down by 0.14 or more on layout | | 4 up (C01, C03, C05, C06), 1 down (C09) | 0 up, 2 down (C09, C10) |

**Reading for roadmap 1.4.**
1. **Not knowing the layout is a real part of the cause, but only for some slides.** Given the layout in words, layout rose beyond the noise band in 4 of 10 cases, all slides whose arrangement the prompt does not reveal (three stacked tables, a text-only page on a fade, a grid with a callout, a two-row framework). Where the prompt already implies the arrangement (charts, risk matrix, table), b moved nothing. The mean (+0.15) is pulled up by one case (C06, +0.87); the median is +0.06.
2. **Editing the closest other slide (c) does not help** with today's object store and tools: no case rose, two fell. Builders spent their effort on stored shapes with PDF-import text set-up, logos and rules stripped as frame, pictures instead of data, and private helpers.
3. **Even with the layout given, nothing passes.** A standard fails in 7 of 10 cases in at least one variant, and in 6 of 10 under b (C05 to C10): body text size in 5 cases (C01, C07, C08, C09, C10; builders shrink type to fit), body margins (C05, C07, C09), and C06's white bold title on a dark background, which the words did not carry. Layout reaches the 0.60 bar in only C06 b and C09 a; visual stays under 0.50 in 8 of 10 even under b.

4. **Part of the gap is how high the layout bar sits for these decks.** Layout is scored above the deck's own other slides (below, "What the layout score measures here"). Builds that look close to the original by eye (C03, C09, C10) sit near that floor, and passing needs a raw overlap of 0.78 to 0.91. That is a question about the bar, not something these builds can settle.

So the numbers support this reading: **the 0 of 10 has three parts, in this order: (1) standards the builder can meet mechanically (body text size from the profile, which is roadmap 4.1), (2) missing layout knowledge for slides whose arrangement the prompt does not reveal, (3) visual distance that neither the layout words nor sibling editing closes.** They do not support sibling-slide editing as the route (roadmap 4.2's first option). They fit the roadmap's "1.3 and 1.4 show the test asks for more than the prompt holds" branch for part (2): that choice (a one-line layout hint in the prompt, or a lower layout bar for that group) is the user's.

**Limits:** one build per variant and case (the noise band says a single case can move 0.14 by chance); C10 a was built twice (see below); C06 a and c and C09 b report that a study note showed them a line about their target (below), so those three are not fully blind.

## What the layout score measures here

The scorer normalises layout by a floor: how alike the target is to the deck's own other slides (`case.json` → `floor`, raw ink-grid overlap). A build that is no closer to the target than an average sibling slide scores 0; reaching the 0.60 bar needs a raw overlap of floor + 0.6 x (1 − floor). For decks with a heavy frame (title band, footer band) the floor is high, so the bar asks for a near-copy. By eye several builds are close to the original (C03, C09, C10 in all three variants) and still score low. The table gives the raw overlaps (official environment) so the two can be told apart. Nothing here changes the scorer.

| Case | Floor (raw) | Raw needed for 0.60 | a raw | b raw | c raw |
|---|---|---|---|---|---|
| C01-exec-summary-polaris | 0.51 | 0.80 | 0.69 | 0.77 | 0.65 |
| C02-gantt-risks-polaris | 0.61 | 0.84 | 0.71 | 0.71 | 0.76 |
| C03-assumptions-table-polaris | 0.47 | 0.79 | 0.43 | 0.67 | 0.47 |
| C04-two-charts-ecluster | 0.67 | 0.87 | 0.82 | 0.84 | 0.85 |
| C05-timeline-ecluster | 0.76 | 0.91 | 0.79 | 0.84 | 0.75 |
| C06-exec-summary-mindcraft | 0.46 | 0.78 | 0.44 | 0.93 | 0.46 |
| C07-scenario-lines-mindcraft | 0.51 | 0.80 | 0.71 | 0.71 | 0.72 |
| C08-risk-matrix-mindcraft | 0.56 | 0.82 | 0.74 | 0.77 | 0.70 |
| C09-sensitivity-truenorth | 0.58 | 0.83 | 0.85 | 0.79 | 0.77 |
| C10-strategy-table-truenorth | 0.77 | 0.91 | 0.81 | 0.80 | 0.75 |

## Leaks found while building (all reported by the builders)

- **TrueNorth slide 18 repeats slide 8 (C10's target) almost pixel for pixel.** The first C10 a builder saw it; that build is kept in `C10-strategy-table-truenorth/a-withdrawn-saw-slide-18/` and not scored. Slide 18's render was taken out of the builders' inputs, its row out of their slide maps, and `heldout.py` now treats slide 18 and `case-truenorth-pola-018` as the target (`TWINS`). C10 a was then built again by a new builder.
- **`Style/refs/case-competitions-2019-2020.md` line 46** describes Mindcraft 3 (C06's target) as a form to avoid; C06 a and C06 c came across it in a search. **`Style/refs/case-competitions.md` §5** names "Pola 22–23" (C09's target) as the scenario example; C09 b read past it. **`Generators/patterns_story.js`**, a comment in `soWhat()`, names "Polaris 2" (C01's target). Style/ and Generators/ are frozen: proposals logged.
