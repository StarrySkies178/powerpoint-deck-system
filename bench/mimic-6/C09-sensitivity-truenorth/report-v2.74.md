# C09 sensitivity (TrueNorth): open-book mimic report

(Written by the builder; saved by the run's chat because the builder's file tool refused report files.)

## Stored objects placed

- `case-truenorth-pola-022` (the slide's own object): placed at its own position with `colours="original"`, after removing parts (see below). **A:** the bars, white bar outlines, dashed connectors and axis lines are kept exactly as stored. **B:** the same object, with the stored bars, outlines and dash pieces swapped for bars re-laid from the new data (10 columns instead of 9), new dashed connectors and white outlines; the stored axis lines are kept and relabelled.
- `case-truenorth-pola-004`, element 0 (TrueNorth logo): lifted with `element()` and placed at its frame position. It is a picture in the original deck too.

The shared step is in `c09lib.py`. `build.js` draws only the frame (`L.start` with the reference profile, plus the grey footer bar from the reference master, CCCCCC).

## What was redrawn, and why

- **All labels are native text boxes** (values on the columns, years, axis ticks, legend names, CAGR heading and values, scenario headings). In the stored object they are **46 pictures of text** plus 4 shapes drawn as glyph outlines. The axis shape also had its tick numbers baked in as glyph paths, so those paths were stripped and only the axis-line path kept. The source deck is a PDF conversion, so the store kept the text as pictures. That breaks the "no picture of text" rule, and it can't be refilled.
- **Legend squares:** native rectangles (they were pictures as well).
- **Scenario headings:** the stored text boxes came out off-centre after `place()` (wrap set to none), so they were redrawn as left-aligned boxes at the same position, 18 pt bold.
- **Lower chart grey:** the original uses B1B1B1 for the lower chart and A3A3A3 for the upper one. The store maps both to one slot (`accent6`), so `colours="original"` makes both A3A3A3. The lower chart was recoloured back to B1B1B1.
- **Page number:** removed (the reference shows none). Title moved 0.06 in up.
- **Label size:** 13 pt. The original's look nearer 11 to 12 pt, but 12 pt failed `deck_lint` (`E body size`). 13 pt is the smallest size that passes.

## B: what changed

New title, scenarios (Conservative and Optimistic), series names (Lumina, Verdea). **10 years (2014 to 2023e, one more than the original)**, new totals and splits, new axis scales (0 to ¥1.6M, 0 to ¥6M). CAGR period 2016-2023, rates calculated from the data.

What broke or needed fixing:
- `objstore.extend(obj, 10)` on 022 raises `NeedsGenerator: matrix-2x2 ... use generator 'matrix'`. The store has the slide classed as a 2x2 matrix, which is wrong, so it suggests the wrong generator. The columns were re-laid in `c09lib.py`, keeping the stored pitch-to-width ratio and first-column offset.
- The stored dashed connectors are many small custom-geometry dash pieces, so they can't follow new heights. Replaced by native dashed lines.
- The stored white outlines (one custom shape for all columns) had the same problem. Replaced by a white outline on each new bar.
- The new bars covered the axis baseline between columns, so the axis shape is re-appended after the bars.
- Legend names at 13 pt overlapped the second square; the second legend item was moved right.

## deck_lint (`--profile Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json`)

- **A:** 0 errors, 2 warnings: `accent` (18 red-filled shapes, the original's own red stacks) and `thin` (84 body words).
- **B:** 0 errors, 1 warning (`accent`).

Both decks contain no pictures except the logo. A's render against original.png at 1280 px: mean absolute pixel difference 5.8 out of 255.
