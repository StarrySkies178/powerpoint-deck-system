# C02 gantt and risks (Polaris): store fix 3 re-run (colour roles: each stored colour keeps its exact original)

## Hand code removed
- `common.py`: the `LIGHT_BOXES = [30, 34, 35, 36]` constant, the `_fill(el, hexv)` helper and the loop in `body_object()`
  that set the "and Potential Mitigations" box and the three mitigation boxes back to F1F1F1. `body_object()` still calls
  `o.original_colours()` once on the stored object; the stored colours now carry their own originals (objstore.DS+"c"),
  so the boxes come out F1F1F1 and the bars D9D9D9 with no hand code. Bar copies are deep copies taken after
  original_colours, so they keep the exact colours too.
- `A/build.py`, `B/build.py`: unchanged (the work-around lived only in common.py).
- Lines (`wc -l`): common.py 145 -> 138; A/build.py 44 -> 44; B/build.py 82 -> 82.

## Hand code still needed for this fault
None. Other work-arounds untouched: `_label` letters/words in circles and tags, table removed and redrawn (year rule,
solid column pieces, block rules), footer rule, bars from data, B's re-laid dashed pieces / dotted rule, page-number run.

## What the fixed tool did wrong
- Nothing found. Element indices unchanged (48 elements). Stored originals: 30, 34-36 bg2 -> F1F1F1; bars 37/38/40/41 bg2
  -> D9D9D9; reds accent1 CC0000 (rules 1, 2; circles; bars 43, 45) and accent2 C00000 kept apart; grey rules 28/29
  accent6 -> A6A6A6 while the dashed pieces 4-21 accent6 -> B4B4B4. No DS attribute left in either slide.
- Rendered pixel samples match original.png exactly: boxes 241,241,241; grey bar 217; red bars 192,0,0 and 204,0,0;
  challenge rule 28 166,166,166.

## Look against v2.74 (renders in /tmp/C02-gantt-risks-polaris-fix/f3/: A, B, v274A, v274B)
- **A:** same as v2.74 apart from the stored line details already noted in report-fix-prev.md (shorter divider, stored
  dashed pieces, 1.56 pt red rule). Against the fix-2 render the only change is the two grey rules between challenge
  blocks: now A6A6A6, as in original.png (fix 2 had merged them with the dashed pieces as B4B4B4). Mean abs pixel diff
  to original.png 11.24 (v2.74 11.31): slightly better.
- **B:** same changes as A (rules A6A6A6, stored line styles); boxes F1F1F1 as before. As good as v2.74 or slightly better.
- Lint (`--profile Style/refs/Case-2019-Polaris.profile.json`): A 0 errors, 1 warning (accent, 11 shapes); B 0 errors,
  1 warning (accent, 12 shapes). Same as v2.74.
