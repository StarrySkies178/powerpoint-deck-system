# C10 strategy table (TrueNorth): store fix 5 re-run (objstore.place at scale 1)

## Hand code removed

- The only work-around for this fault was `scale_text=False` on the four `O.place()` calls, used to stop text scaling and
  autofit at scale 1: A/build.py `__main__` (table object, logo) and B/build.py `__main__` (table object, logo). All four
  now call `O.place(..., colours="original")`. Both objects are placed at their own bbox, so place() sees scale 1.
- No hand code undid place()'s wrap="none" on short labels; there was none to remove.
- Lines: A/build.py 85 -> 85, B/build.py 91 -> 91 (the argument was dropped within the same lines); build.js unchanged.
  Hand code for the other faults stays: row cloning and re-spacing for `extend()` NeedsGenerator, widened text boxes,
  breadcrumb, source band, header labels, title spacing and z-order (`finish()`), set_texts glue (`fill()`, `name_of()`).

## Hand code still needed for this fault

None.

## What the tool still gets wrong

Nothing seen. Placed boxes: table object [0.10, 1.46, 9.74, 5.64] in A and B, logo [8.54, 0.00, 1.42, 0.41]; no
warnings. The rebuilt slide1.xml is byte-identical to the fix-1 (revision 2) build in both A and B: no wrap="none" added,
font sizes as stored (A: 444 runs at 12 pt, 59 at 14 pt; B: 82 / 40). (B's own "rows over-full by 0.14 in" print is
from its row-sizing estimate, as before, not from place().)

## Look against v2.74 (renders in /tmp/C10-strategy-table-truenorth-fix5/)

- A and B render pixel-identical to the previous (fix 1) build, so the look against v2.74 is unchanged:
  A matches the original as closely as v2.74 or slightly better (unchanged lines keep the original tight letter spacing;
  Mitigation breaks "Prioritize / channel" as the original does); B as v2.74, small spacing differences only.
- Lint not affected (slide XML unchanged).
