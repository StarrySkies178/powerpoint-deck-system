# Roadmap 4.2 Run 2c, step 1 and 2: does the score agree with Mike's eye? (analysis only)

Made 2026-11-24 (v2.60) by the deck building chat. **Nothing in the scorer or the pass bar was changed.** `bench/scripts/bench_score.py` is untouched; this file is for Mike to look at before anything replaces the old score (roadmap 4.2 Run 2c, step 3).

## The labels

- **20 labelled comparisons** (original drawn by PowerPoint on the left, build on the right):
  - step 1.3, `bench/review-1.3-powerpoint/`: the 10 stored builds of the C cases as they were at v2.41/v2.42 (taken from git commit 59062fe). His verdict: **all 10 not ok**.
  - `bench/review-run2/`: the first fresh blind rebuild (r1) of each C case in run 2. His verdict: **9 ok**, C08 "could be better", counted here as **not ok**.
  - So 9 ok and 11 not ok.
- **His 60 blind ratings** (`bench/rating-1.7/`): only 5 of the 50 different slides can be scored against an original, the 1.4 diagnosis builds of C04, C07, C08, C09 and C10 (`009`, `011`, `014`, `018`, `049`), and he passed all 5. They are used below as a small check set. The 25 reference slides cannot be scored (they are the originals); what they give is a ceiling: he passed 22 of 25 real competition slides, and gave the same answer twice on 9 of 10 repeated slides, so even his own labels carry some noise.

## How weak this is, said plainly

- **20 labels is very few.** With 9 ok against 11 not ok, a measure needs an AUC of about 0.73 or more before it is distinguishable from chance at the usual 5% level (one-sided Mann-Whitney). Every threshold below was also picked on the same 20 labels, so its error count flatters it; the leave-one-out column shows the honest version.
- **The two sets differ in more than quality.** Almost the whole label is "which set": all 10 stored builds are not ok, 9 of 10 fresh builds are ok. The sets differ in:
  - who built them and when: stored builds from v2.41 rules, fresh run 2 builds after Run 1 (body size from the reference) and with the Run 2 numbers rule;
  - how they were scored at the time: the stored builds were first scored against LibreOffice pictures of the originals, the fresh builds against PowerPoint pictures. Here **both sets are re-scored against the same PowerPoint pictures and floors** (case files of v2.46), so this table does not carry that difference, but his 1.3 verdict was given right after the originals were redrawn, when "the originals look far better" was the frame;
  - the question: step 1.3 was the first side-by-side he ever saw; run 2 came after he had seen improvement.
- **C08 is a single "not ok"** among the fresh builds, and his reason is about the drawing (a plain 3 by 3 grid where the original has a shaded heat map), which no overlap measure is built to see.

## Every measure, one by one (the 20 comparisons)

All measures computed in the official environment (Mac Linux VM, LibreOffice render of the build, the case's PowerPoint `original.png`). "Raw" is before the floor; the floor is the case's own (from the deck's other slides). `iou16` is the same ink-grid overlap on a coarser 16 x 9 grid; `edges` and `colour` are the two halves of the visual score; `hist` is a colour-histogram overlap.

| Measure | AUC (ok above not ok) | Best threshold on the 20 | Errors (ok scored fail / not ok scored pass) | Leave-one-out errors | Fresh build higher than stored build, same case |
|---|---|---|---|---|---|
| layout_raw (overlap before floor) | 0.64 | ≥ 0.70 | 6 (2 / 4) | 7 | 8 of 10 |
| layout (current, after floor) | 0.61 | ≥ 0.33 | 5 (4 / 1) | 6 | 7 of 10 |
| floor_layout (the floor itself) | 0.49 | – | – | – | (same case) |
| visual_raw | 0.59 | ≥ 0.78 | 6 (6 / 0) | 9 | 7 of 10 |
| visual (current, after floor) | 0.61 | ≥ 0.32 | 6 (5 / 1) | 7 | 7 of 10 |
| floor_visual | 0.45 | – | – | – | (same case) |
| colour half of visual | 0.49 | ≥ 0.86 | 7 (5 / 2) | – | 6 of 10 |
| edges half of visual | 0.59 | ≥ 0.74 | 6 (6 / 0) | 7 | 7 of 10 |
| iou16 (coarse overlap) | 0.60 | ≥ 0.82 | 6 (2 / 4) | 7 | 8 of 10 |
| iou8 (very coarse) | 0.56 | ≥ 0.94 | 7 (3 / 4) | – | 7 of 10 |
| hist (colour histogram) | 0.57 | ≥ 0.98 | 7 (6 / 1) | – | 6 of 10 |
| number of failed standards | 0.61 | ≤ 0 | 7 (5 / 2) | 7 | fewer in 4 of 10 |
| **current pass bar** (all standards, layout ≥ 0.60, visual ≥ 0.50) | – | – | **9 (9 / 0)**: passes none | – | – |

The standards one at a time (builds passing the check):

| Standard | His ok builds (9) | His not ok builds (11) |
|---|---|---|
| body text size | 6 | 5 |
| body margins | 6 | 7 |
| colours | 7 | 6 |
| source line | 8 | 10 |
| title bold, title colour | 8 | 10 |
| slide size, fonts, title font, title position, title size | 9 | 11 |

**Reading.** No single measure reaches an AUC of 0.73; the best is 0.64. No standard separates his ok from his not ok (none is failed more often by the builds he rejected than by the ones he accepted, beyond one or two builds). The pattern that does show is **within the same case**: the fresh build overlaps the original more than the stored build did in 8 of 10 cases (layout_raw and iou16; one-sided sign test p = 0.055), C08 included. So the overlap moves in the direction of his verdicts when the same slide is rebuilt, but its absolute level does not say whether he will accept a slide. The floor is the main reason the current score disagrees with him: C03, C05 and C06, which he passed, overlap their originals as much as the deck's own other slides do (layout_raw 0.39 against a floor of 0.44; 0.71 against 0.76; 0.45 against 0.47), so the floor sends them to 0.00. C06 also shows the limit of pixel measures: he passed it although its colour score is 0.03 (the original's dark background is missing).

## Proposal (for Mike to look at; nothing changed)

**Measure: overlap before the floor (`layout_raw`); threshold 0.70; standards and visual reported but not part of the pass for deck-as-reference cases.** Agreement both ways:

| Set | His ok scored fail | His not ok scored pass | Agreement |
|---|---|---|---|
| 20 comparisons | 2 (C03 r1 0.39, C06 r1 0.45) | 4 (stored C04 0.76, C08 0.70, C10 0.76; run 2 C08 0.77) | 14 of 20 |
| fresh builds only (run 2 + 1.4 diagnosis, 15) | 2 (C03, C06) | 1 (C08) | 12 of 15 |
| 1.4 diagnosis builds he passed blind (5) | 0 | – | 5 of 5 |
| current pass bar, same 20 | 9 | 0 | 11 of 20 |

The alternative, keeping today's floored layout with a threshold of 0.33, agrees on 15 of 20 but fails 4 of the 9 slides he accepted (C02, C03, C05, C06) and 1 of the 5 diagnosis builds he passed (C10, 0.10), which is the very disagreement that started this run. `layout_raw ≥ 0.70` fails only 2 of his accepted slides, and its 4 wrong passes are builds he rejected for things it is blind to (C08's grid) or in the stricter step 1.3 frame.

**What it would mean, said plainly:** this threshold is picked on the same 20 labels it is checked on, and its leave-one-out error is 7 of 20, so expect about one wrong call in three. It is a better match to his eye than today's bar (which agrees on 11 of 20 by failing everything), not a good one. Two things would do more than any threshold: (1) use the score for **change within a case across runs** (where it does follow his verdicts, 8 of 10), not as a pass mark; (2) the AI judge of roadmap step 1.8, trained on his labels, for the pass mark itself. Nothing here should be read as quality until he has seen this table.

## The 25 builds measured

| Case | Set | His label | layout_raw | floor | layout | visual_raw | visual | iou16 | Failed standards |
|---|---|---|---|---|---|---|---|---|---|
| C01 | 1.3 stored | no | 0.50 | 0.51 | 0.00 | 0.71 | 0.24 | 0.63 | body text size |
| C02 | 1.3 stored | no | 0.66 | 0.65 | 0.04 | 0.69 | 0.19 | 0.78 | body text size |
| C03 | 1.3 stored | no | 0.45 | 0.44 | 0.03 | 0.72 | 0.32 | 0.69 | – |
| C04 | 1.3 stored | no | 0.76 | 0.68 | 0.24 | 0.78 | 0.25 | 0.86 | – |
| C05 | 1.3 stored | no | 0.65 | 0.76 | 0.00 | 0.67 | 0.01 | 0.67 | body text size, body margins, colours |
| C06 | 1.3 stored | no | 0.61 | 0.47 | 0.27 | 0.34 | 0.16 | 0.66 | title bold, title colour, body text size, body margins, colours |
| C07 | 1.3 stored | no | 0.58 | 0.51 | 0.14 | 0.75 | 0.29 | 0.75 | colours, source line |
| C08 | 1.3 stored | no | 0.70 | 0.56 | 0.32 | 0.72 | 0.28 | 0.85 | body margins |
| C09 | 1.3 stored | no | 0.69 | 0.58 | 0.25 | 0.75 | 0.30 | 0.81 | body text size, body margins |
| C10 | 1.3 stored | no | 0.76 | 0.79 | 0.00 | 0.64 | 0.03 | 0.90 | body text size, colours |
| C01 | run2 r1 | ok | 0.73 | 0.51 | 0.44 | 0.70 | 0.22 | 0.86 | body text size |
| C02 | run2 r1 | ok | 0.71 | 0.65 | 0.17 | 0.71 | 0.22 | 0.82 | – |
| C03 | run2 r1 | ok | 0.39 | 0.44 | 0.00 | 0.69 | 0.26 | 0.60 | – |
| C04 | run2 r1 | ok | 0.78 | 0.68 | 0.33 | 0.84 | 0.47 | 0.89 | – |
| C05 | run2 r1 | ok | 0.71 | 0.76 | 0.00 | 0.71 | 0.14 | 0.85 | body margins |
| C06 | run2 r1 | ok | 0.45 | 0.47 | 0.00 | 0.30 | 0.11 | 0.63 | title bold, title colour, body margins, colours |
| C07 | run2 r1 | ok | 0.70 | 0.51 | 0.39 | 0.83 | 0.51 | 0.84 | body text size, colours, source line |
| C08 | run2 r1 | no | 0.77 | 0.56 | 0.48 | 0.77 | 0.40 | 0.91 | colours |
| C09 | run2 r1 | ok | 0.77 | 0.58 | 0.45 | 0.75 | 0.32 | 0.82 | body text size, body margins |
| C10 | run2 r1 | ok | 0.86 | 0.79 | 0.34 | 0.78 | 0.40 | 0.99 | – |
| C04 | 1.4 diagnosis | ok | 0.84 | 0.68 | 0.50 | 0.86 | 0.54 | 0.85 | – |
| C07 | 1.4 diagnosis | ok | 0.75 | 0.51 | 0.49 | 0.86 | 0.60 | 0.83 | body text size, body margins, colours, source line |
| C08 | 1.4 diagnosis | ok | 0.74 | 0.56 | 0.40 | 0.74 | 0.33 | 0.87 | body text size, colours |
| C09 | 1.4 diagnosis | ok | 0.85 | 0.58 | 0.66 | 0.83 | 0.54 | 0.87 | body text size |
| C10 | 1.4 diagnosis | ok | 0.81 | 0.79 | 0.10 | 0.79 | 0.45 | 0.98 | body text size |

Data: `bench/calibration-2c/measures.json` (every measure for the 25 builds), made by `bench/calibration-2c/calib.py` (reads the scorer's own functions; changes nothing) and `analyse.py`.
