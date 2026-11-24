# C04 two charts (E-Cluster): store fix 5 re-run (place() leaves text as stored at scale 1)

## Hand code removed

- **A/build.py `place_1to1()`** and **B/build.py `place_1to1()`**: `scale_text=False` dropped from the `O.place(...)` call.
  It was passed only to stop the text shrink/autofit when placing each object at its own bbox (scale 1).
- **A/build.py `fix_package()`**, step 3 (6 lines incl. comment) and **B/build.py `fix_package()`** (4 lines): the loop that
  walked every non-placeholder, unfilled text box with 2 or 3 words and set `wrap="square"` again, because place() had set all
  labels of 3 words or fewer to `wrap="none"` ("Fine / jewelry" must wrap as in the original). Gone; place() keeps the stored wrap.

Lines (`wc -l`): A/build.py 98 -> 92, B/build.py 142 -> 138; A/build.js 38 and B/build.js 78 unchanged.
All other work-arounds (subset/keep_only, red-ring paint, label widening and indent removal in B, native CAGR rows,
axis labels, rules and footer, fix_package layout/title/source/page-number/breadcrumb post-fixes, arrow ungroup) are kept.

## Hand code still needed for this fault

None.

## What the fixed tool did wrong

Nothing. Text and font sizes are identical to the previous build (A: 206 runs, B: 65, same text). The slide XML differs
from the previous build only in `wrap`: A had 33 boxes set to `wrap="none"`, B 17; now 0, all keep the stored `wrap="square"`.
These are the one-word labels and numbers (532 / 722 / 998, 4%, 5% / 7%, 11% / 89%, 47 / 48, 2013 / 2018, Total, chips 1-3;
in B Classic, 66%, 1%, 2%, 5%). The old work-around restored square only for 2-3 word labels, so one-word labels stayed
no-wrap; now everything is as stored. None of them wraps mid-word in LibreOffice (stored boxes are wide enough at 14-15 pt).

## Look against v2.74 (LibreOffice, pdftoppm -r 96, in /tmp/C04-two-charts-ecluster-fix/)

- **A:** same as v2.74 apart from one-word labels shifting by 1-2 px (square wrap positions them as PowerPoint does).
  Slightly closer to original.png: mean abs difference 11.93 -> 11.73, 15 of 18 changed label spots closer to the
  original (2013 / 2018 axis labels, 47 / 48, 532 / 722, 4% cells, 89%, chip 2), 3 a hair further (chip 1, 11%, "Total").
  No new wraps or overlaps. Slightly better.
- **B:** same as the fix-1 build except the same 1-2 px label shifts, and the widened right-aligned "Classic" label in
  panel 2b, which now sits flush right against the leader tick, lined up with "Quartz" and "Smart" below it (before,
  with no-wrap, it sat about 17 px further left). As good as v2.74 or slightly better; the card-body wrap from fix 1
  revision 2 is unchanged.

## Revision 2 (fix 5 narrowed: place() again sets labels of 3 words or fewer to wrap="none" at every scale; only the no-shrink at scale 1 stays)

- `scale_text=False` stays removed from both `place_1to1()` calls: at scale 1 place() no longer shrinks or autofits, so it is not needed.
- The square-wrap loop in `fix_package()` is put back as in v2.74 (A: step 3 with its comment, B: the same 4-line loop),
  because place() again sets 2-3 word labels such as "Fine / jewelry" to wrap="none" and that fault is not fixed.
- Lines (`wc -l`): A/build.py 98 (v2.74/fix-1: 98), B/build.py 142 (fix-1: 142); build.js files unchanged.
- Result: slide XML of both builds is byte-identical to the fix-1 build (A 33, B 17 boxes wrap="none" again; one-word
  labels are no-wrap again, so the small label shifts of revision 1 are gone).
- **A:** render pixel-identical to v2.74 (0 pixels differ). Same as before.
- **B:** render pixel-identical to the fix-1 build; against v2.74 it differs only by the fix-1 changes (dropped letter
  spacing on refilled labels, card 1 body wrap). As good as before. The tool did nothing wrong.
