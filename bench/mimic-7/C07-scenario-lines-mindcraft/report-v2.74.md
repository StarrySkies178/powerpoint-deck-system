# C07 scenario lines (Mindcraft): open-book mimic report

(Written by the builder; saved by the run's chat because the builder's file tool refused report files.)

Files: `common.js` (frame, native charts, drawn text) and `common.py` (stored objects) are shared; `A/` and `B/` hold only content. Run build.js, then build.py.

## Stored objects placed (all from `case19-mindcraft-014`, `colours="original"`, own positions)

Placed one element at a time with `objstore.element()`:
- e0, e1 red breadcrumb arrows: as is in A and B.
- e2, e5 panel chips "1", "2": as is.
- e3, e6 grey panel rules: as is.
- e4, e7 panel headings: as is in A; refilled in B, box widened to the rule's end.
- e23, e28 italic chart titles: refilled in A (same words, clean ¥) and B.
- e27, e36 grey takeaway boxes with bullets: refilled (clean text) and fill recoloured, A and B.
- e37 "Return on Capex under base case 2) :" label: as is in A; refilled in B.

`014p1` and `014p2` were not placed: they are the same shapes as `014` split into two panels.

## Redrawn instead, and why

- **Both line charts: native PowerPoint line charts** (pptxgenjs LINE, editable data). In the store the lines are freeform paths and every marker is a small PNG picture, left over from the PDF rebuild. Pictures of a chart are not allowed, and paths cannot take new data. Plot boxes measured on original-1920.png. Value axis with tick marks, round markers, no gridlines, points on the ticks (`crossBetween` = `midCat`). The profile says `value_axis: false`, but this slide has axes, so the slide wins.
- **Axis labels, legend, CAGR column, capex burden row, "~1.6 years", note, source, foot rule and "MindCraft" wordmark: text boxes and shapes.** The stored text boxes merge axis labels with other text (e33 = "160 / 2018 2019E / Capex burden 1) 26%"), so they cannot be refilled cleanly.
- **Breadcrumb text:** drawn by hand (bold italic, grey and red) instead of `frame({crumb})`, which is upright and uses its own ▶ separators.
- **Logo:** not in the store (frame elements stripped), so a red bold "MindCraft" text stands in. The master's page number stays; the original has none.

## B: what changed

New title, crumb, headings, chart titles, takeaways, note and source. Years 2019 to 2024E, all numbers changed. **A fourth scenario line in both charts** (Bull / Base / Bear / Stress); the new line is mid grey A6A6A6. Legend 4 items, CAGR column 4 values. Axis ranges 4 to 14 and 80 to 260.

## What broke or needed fixing

1. **`element()` keeps the whole slide's media list.** `place()` copied all 27 marker PNGs into the deck, linked but never drawn. common.py keeps only the media an element references. objstore's `element()` should prune `media` itself.
2. **The takeaway fill comes back in the wrong grey.** `role_src` maps bg2 to D5D5D5, but the original box is EFEFEF. Recoloured to the profile panel grey F1F1F1.
3. **`set_texts()` copies the first paragraph's format to every paragraph,** including a 9.9 pt space-before, so common.py strips `spcBef` from later paragraphs. It also puts the whole string into the first run, so the "2)" in B's return label lost its superscript.
4. **Rebuilt heading boxes are only as wide as the original words.** A longer B heading wrapped, so a refilled heading is widened to the end of its panel rule.
5. **LibreOffice centres short labels.** `place()` sets wrap="none" on labels of 3 words or fewer, and LibreOffice then centres them. B uses a 4-word heading.
6. **B's second takeaway ran past its fixed-height box** at 3 lines, so the text was shortened.

## deck_lint (`--profile Style/refs/Case-2019-Mindcraft.profile.json`)

- A: 0 errors, 1 warning
- B: 0 errors, 1 warning

The warning in both is `body size`: the note and source lines are 10 pt, as in the original's footnotes.
