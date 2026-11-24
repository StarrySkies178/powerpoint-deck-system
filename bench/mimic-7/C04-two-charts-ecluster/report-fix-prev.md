# C04 two charts (E-Cluster): store fix 2 re-run (extract keeps zero-width / zero-height lines)

## Hand code removed

- **A/build.js**: the three `slide.addShape("line", ...)` calls with their two comments (5 lines): panel heading rules 1
  and 2 (10366C, 1.5 pt) and the grey divider between the two exhibits of panel 2 (A6A6A6, 0.75 pt).
- **B/build.js**: the same three `line(...)` calls plus a blank line (4 lines).
- Both now take these from the re-extracted `case19-ecluster-004`: element 11 (rule 1, x 0.64 in, w 5.75 in, y 1.76 in),
  element 14 (rule 2, x 7.30 in, w 5.78 in) and element 10 (divider, x 9.86 in, y 2.20 in, h 2.77 in), placed 1:1 with
  `colours="original"` (rules come out 10366C at 1.56 pt, divider A6A6A6 at 0.48 pt).
- Element indices of 004 shifted by the three new lines (old 0-9 unchanged, old i >= 10 now i + 2 or i + 3; checked with
  `O.elements()` and by filling slots with markers). Re-mapped selections:
  - A/build.py keep: {1,3,4,5,10,11,12,13,14,18,23,29,30,32,36-42} -> {1,3,4,5,10,11,12,13,14,15,16,17,21,26,32,33,35,39-45}.
  - B/build.py f1 keep: {1,3,4,5,10,11,12,13,14,23,29,30,32,39,40} -> {1,3,4,5,10,11,12,13,14,15,16,17,26,32,33,35,42,43};
    `els[40]` -> `els[43]` (exhibit title widened), CAGR arrow group `els[39]` -> `els[42]`.
  - Slot numbers for `set_texts` did not change (32 slots, the lines are not slots); only the element comments were updated.
- Footer note and full-width footer rule stay drawn in build.js (footer zone, not in the object).

Lines (`wc -l`): A/build.js 38 -> 33, B/build.js 78 -> 74; A/build.py 98 -> 99, B/build.py 142 -> 143 (one comment line
each for the new indices). The 004p2..p4 parts and all other work-arounds of report-v2.74.md (subset/keep_only, red-ring
paint, label widening and indent removal, native CAGR rows and axis labels, fix_package layout/title/source/page-number/
breadcrumb/square-wrap post-fixes, layout's stray rule removal, arrow ungroup) are unchanged.

## Hand code still needed for this fault

None.

## What the fixed tool did wrong

Nothing found. The three lines are stored as custGeom paths with zero cx or cy, in the right place, size and colour role
(accent1 for the rules, accent6 for the divider), and `colours="original"` resolves them to the original's 10366C / A6A6A6.
Text of both builds is identical to v2.74 (A 206 runs; paragraphs A 87, B 77 plus the three stored lines' empty paragraphs).
Note only: each stored line carries an empty txBody (`<a:p/>`), harmless.

## Look against v2.74 (LibreOffice, pdftoppm -r 96, in /tmp/C04-two-charts-ecluster-fix/s2/)

- **A:** differs from the v2.74 render only at the two heading rules (rows 167-169) and the divider (x 945-946, rows 211-477).
  Both now match original.png pixel for pixel there: rule rows 160-175 differ from the original in 321 px (v2.74: 2539;
  the rest is heading-text antialiasing), divider area 0 px (v2.74: 533, it was a wider, lighter anti-aliased line).
  Mean abs difference to original.png 11.66 -> 11.46. Slightly better.
- **B:** against the previous fix build only the same two changes (rules and divider, now as the original draws them).
  Against v2.74 it also shows the earlier fix-1 changes (dropped letter spacing on refilled labels, card 1 body wrap),
  nothing new. As good as before, rules and divider slightly crisper.
- Lint (`--profile Style/refs/Case-2019-E-Cluster.profile.json`): A and B each 1 error, 1 warning, the same as v2.74.
