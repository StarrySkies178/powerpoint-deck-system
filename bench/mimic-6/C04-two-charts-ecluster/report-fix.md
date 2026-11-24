# C04 two charts (E-Cluster): store fix 3 re-run (each stored colour keeps its own original)

## Hand code removed

- **A/build.py: `paint(obj, idx, hexcol)`** deleted (7 lines incl. spacing): it replaced every schemeClr of 004p2's
  element 6 (the hand-drawn ring) with srgbClr CC0000, because the ring is stored as accent1 and the old
  `colours="original"` mapped accent1 to the slot's most used original (navy 10366C). The call
  `place_1to1(paint(p2, 6, "CC0000"))` is now `place_1to1(p2)`.
- **B/build.py: `paint(el, hexcol)`** deleted (5 lines) and its call `paint(els[6], "CC0000")` in the `f2` edit callback
  (1 line). `f2` keeps only the two label widenings.
- The re-extracted 004p2 element 6 now carries `accent1` with the private original `CC0000`; place(..., colours="original")
  turns it into srgbClr CC0000 and strips the private attribute (no foreign namespace left in slide1.xml).
- No other hand recolouring of stored objects existed. The remaining colour code is not this fault and stays: the
  layout band 202C4F (profile says 08163B), page number and breadcrumb arrow colours in `fix_package`, and the native
  shapes/text drawn in build.js.

Lines (`wc -l`): A/build.py 99 -> 91, B/build.py 143 -> 137; A/build.js 33 and B/build.js 74 unchanged.

## Hand code still needed for this fault

None.

## What the fixed tool did wrong

Nothing found. Colour histograms of slide1.xml (srgbClr values and counts) are identical to v2.74 in both A and B
(A: 49 x 10366C, 1 x CC0000, greys 7E7E7E / A6A6A6 / BEBEBE / 585858 / 595959 kept apart; B the same plus 63A4CC).
The ring shape in B is byte-identical to v2.74's except the cNvPr id. Through set_texts, keep_only and edit/_store
(B's path) the private colour survived as well.

## Look against v2.74 (LibreOffice, pdftoppm -r 96, in /tmp/C04-two-charts-ecluster-fix/s3/)

- **A:** differs from v2.74 only at the two heading rules and the panel-2 divider (the fix-2 change); 0 pixels differ
  elsewhere, so the ring is red exactly as before. Mean abs difference to original.png 11.46 (v2.74: 11.66). As good as
  the previous fix build, slightly better than v2.74.
- **B:** differences from v2.74 only from fixes 1 and 2 (dropped letter spacing on refilled labels, card 1 body wrap,
  rules/divider); the ring is red as before. As good as before.
- Lint (`--profile Style/refs/Case-2019-E-Cluster.profile.json`): A and B each 1 error, 1 warning, the same as v2.74.
