# C04 two charts (E-Cluster): store fix 1 re-run (set_texts keeps each paragraph's and run's format)

## Hand code removed

- **B/build.py: `refill(el, paras)`** deleted (13 lines: the per-paragraph refill written because the old `set_texts`
  gave every paragraph the first one's format, so the italic card bodies turned bold and chip "3" was filled first).
  Its 15 calls are replaced by `O.set_texts(obj, [...])` with `None` for boxes that stay as they are, slot numbers taken
  from `O.slots()`:
  - 004p2: `["Smart watches", None, None, "Classic watches", "1%", None, None]` (slot 4 is the circled 4%, the Total 4% is slot 6).
  - 004p3: `["Classic", "66%", None, None]`.
  - 004p4: `[None, [title, body], [title, body], [title, body]]` (chip "3" is slot 0, left alone). Passed straight to place().
  - 004 (whole slide): slots 1, 3, 4, 5, 6, 18, 23, 24 (elements 14, 4, 40, 3, 5, 32, 29, 30).
  The edit callbacks `f2`, `f3`, `f1` keep only their non-text work (widening labels, red ring, break-mark ticks,
  arrow ungroup); `f4` is gone.
- **A/build.py:** the loop in `__main__` that walked the fragment and blanked the runs of element 30's first paragraph
  (axis labels on tab stops) by hand, so the panel-3 heading in its second paragraph kept its own format. Now
  `O.set_texts(full, texts)` with slot 24 = `["", "Major constraints limit ..."]`; the unchanged heading keeps its runs exactly.

Lines (`wc -l`): A/build.py 100 -> 98, B/build.py 154 -> 142; A/build.js 38 and B/build.js 78 unchanged.
All other work-arounds of report-v2.74.md (subset/keep_only, red ring paint, label widening and indent removal,
native CAGR rows and axis labels, rules, fix_package post-fixes, arrow ungroup) are left as they were.

## Hand code still needed for this fault

None.

## What the fixed tool did wrong

Nothing found. Text of every paragraph is identical to v2.74 (A: 87 paragraphs, B: 77, compared in the slide XML).
Formats match v2.74 run by run, except as documented: letter spacing (spc -10 to -25) is dropped on the refilled runs,
and element 30's blank first paragraph is now one empty run instead of five. Unchanged paragraphs ("By segment %")
keep their original runs, spc included. Not a fault, but a note: slot order is reading order, not element order,
so the caller needs `slots()` (or the positions) to address a box; two identical "4%" boxes are only told apart that way.

## Look against v2.74 (LibreOffice, pdftoppm -r 96, in /tmp/C04-fix/)

- **A:** pixel-identical to the v2.74 render of A (0 pixels differ); same match with original.png as before.
- **B:** as good as before. Only difference is the dropped letter spacing on refilled labels (row labels, 1% / 66%,
  exhibit titles, card titles and bodies): words a hair wider, no new wraps or overlaps; card titles stay bold, bodies italic.

## Revision 2 (set_texts revised: lvl from another box, runs grouped by format, unchanged list kept, spacers kept, marR dropped)

No call changed: A and B pass plain strings and per-paragraph lists, no `{"lvl": n}` and no run lists, so nothing in
what they must pass is affected. Line counts unchanged (A/build.py 98, B/build.py 142). Rebuilt both.

- **A:** slide XML identical to the revision-1 build; render pixel-identical to v2.74.
- **B:** text identical to v2.74 (77 paragraphs). The only XML change from revision 1 is (5): marR dropped on five
  refilled paragraphs (the two row labels "Smart / Classic watches" and the three card bodies). Render: card 1's body now
  wraps "health / tracking and phone alerts on the / wrist" (v2.74: "... on / the wrist"), using the box's full width;
  other cards and labels look the same. As good as before; the tool did nothing wrong.
