# C10 strategy table (TrueNorth): store fix 1 re-run (objstore.set_texts)

## Hand code removed

- `A/build.py`: `refill(el, lines)` deleted (clone the box's own heading / bullet / plain paragraph per line, collapse the
  PDF-import runs into one, drop `spc` and `marR`). `import copy` dropped. The "# " / "= " paragraph-kind markers in `TEXTS`
  are gone: set_texts takes paragraph i's format from the box's own paragraph i, which here is heading first, then bullets.
  `build_object()` now drops the stored title box and calls `O.set_texts` once. Small glue added: `name_of()` and `fill()`,
  which turn the element-indexed `TEXTS` into set_texts' reading order via `O.slots()` (hint " N" = shape "object N").
- `B/build.py`: the 10 `BA.refill(...)` calls replaced by entries in one `texts` dict filled by `BA.fill()` after the
  re-layout. "# " / "= " markers removed from the content; `lines_needed()` now treats paragraph 0 as the row heading
  (same result). Cloned row shapes get a unique name ("object 16 copy4") so slots() can tell them apart.
- Lines: A/build.py 98 -> 85, B/build.py 90 -> 91 (B gained the dict and clone naming, lost the calls), build.js files
  unchanged (36, 14). Hand code for the other faults stays: row cloning and re-spacing for `extend()` NeedsGenerator,
  widened text boxes, breadcrumb, source band, header labels, title spacing, z-order (`finish()`).

## Hand code still needed for this fault

None. All 16 boxes in A and all 18 in B (incl. the cloned fifth row) got the right text, sub-headings bold 14 pt, bullets
12 pt with their bullet, plain red-box paragraphs plain. Paragraphs whose text was unchanged kept their PDF-import runs.

## What the tool still gets wrong

- It keeps each template paragraph's right margin `marR`. In these PDF-import boxes `marR` is the same kind of fitted hack
  as `spc` (it forces the old line breaks), but only `spc` is dropped. Case: B, element 30 (shape "object 35", Mitigation
  panel), paragraph 0 has `marR="137795"` (0.15 in). Passed "Hold price and compete on taste and quality"; it now wraps on
  4 lines ("Hold price and / compete on / taste and / quality") instead of 3 in v2.74, in a 1.28 in box. Other kept marR
  values are small (5080 to 86360 EMU) and changed no break visibly. In A the same rule helps (text nearly as before).
- Unchanged paragraphs keep their per-word runs with `spc` (by design); they render like the original, but stay fragmented
  for later editing ("Improve penetration by product reposition" is still 5 runs).

## Look against v2.74 (renders in /tmp/C10-strategy-table-truenorth-fix/)

- A: better. The one break v2.74 got wrong now matches the original ("Prioritize / channel / management for / weak
  channels"), and unchanged lines keep the original tight letter spacing. Everything else matches v2.74 to a pixel or so.
- B: same, except the Mitigation first bullet one line longer (above); still fits the panel. Lint unchanged:
  A 1 error / 9 warnings, B 1 error / 11 warnings (12 pt body, margins, accent, as before).

## Revision 2 (set_texts revised: run grouping, spacer paragraphs, marR dropped on new text in text boxes)

- Calls unchanged: A and B pass one plain string per paragraph, no `{"lvl": n}` dicts and no run lists, so none of the
  revisions changes what must be passed. No hand code added; line counts as above (A/build.py 85, B/build.py 91).
- Rebuilt and re-rendered (`/tmp/C10-strategy-table-truenorth-fix/A-r2.png`, `B-r2.png`). Only the Mitigation column
  changed against the first re-run; the other three columns are pixel-identical to it.
- The marR fault above is fixed: B's first Mitigation bullet is back to 3 lines ("Hold price and / compete on / taste and
  quality"), as in v2.74.
- Side effect in A: with marR dropped, "Prioritize channel" again fits on one line, so A is back to v2.74's single
  difference from the original (the original breaks "Prioritize / channel"). That is the expected price of dropping the
  PDF line-break margin on edited text, not a fault.
- Look: A as v2.74 (matches the original except that one break), B as v2.74. Nothing the revised tool got wrong here.
  Lint unchanged: A 1 error / 9 warnings, B 1 error / 11 warnings.
