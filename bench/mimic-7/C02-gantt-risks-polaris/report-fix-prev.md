# C02 gantt and risks (Polaris): store fix 2 re-run (objstore.extract keeps zero-width / zero-height lines)

## Re-mapped element indices (O.elements(obj), case19-polaris-016 now has 48 elements, was 25)
- New line shapes: 0 dashed divider (7E7E7E, 0.96 pt sysDash), 1 red rule under "Implementation Timeline" (CC0000, 1.56 pt),
  2 red rule under the right header (was 0), 4-21 dashed Gantt column pieces (B4B4B4, 0.72 pt sysDash, the parts
  between A's bars), 28/29 grey rules between challenge blocks (B4B4B4, 0.72 pt), 46 dotted sub-group rule (black sysDash).
- Old -> new: header 1->3, years 2->22, circles 3-5->23-25, tags 6,7->26,27, "and Potential" 8->30, challenges 9-11->31-33,
  mitigations 12-14->34-36, bars 15-23->37-45 (templates red 39, red2 45, grey 41), table 47. Slot order for set_texts unchanged.

## Hand code removed
- `common.py` `draw_native()`: the hand-drawn red rule under "Implementation Timeline", the dashed left | right divider,
  the `right_rules` loop (grey rules between challenge blocks), the dotted sub-group rule loop, and the dashed column
  spans (`spans()` no longer returns dashed pieces; the `MSO_LINE_DASH_STYLE` import is gone).
- `A/build.py`: `spans()` returns only the solid pieces; `right_rules` and `dotted` dropped from SPEC. A uses stored 0, 1,
  4-21, 28, 29, 46 as they are.
- `B/build.py`: `spans()` solid only; `right_rules` dropped (stored 28/29 sit at the same y). Because B re-lays the rows,
  the stored dashed pieces (cut to A's bars) and the dotted rule are re-laid from data the same way as the bars: new
  `body_object()` code makes copies of stored piece 4 at B's spans (`col_dashes`, stored column x) and moves the stored
  dotted rule 46 to B's y (`dotted`). No line style is hand-set any more.
- Lines (`wc -l`): common.py 135 -> 145 (+10 for the B re-lay of stored pieces, -9 hand lines); A/build.py 46 -> 44;
  B/build.py 81 -> 82.

## Still drawn by hand (not in the stored object)
- Year rule, solid column pieces and grey block rules: borders of the PDF-converted table (removed and redrawn, the
  v2.74 work-around, kept). Footer rule: footer zone, which extract leaves out by design.
- Other work-arounds untouched: F1F1F1 light boxes, `_label` letters/words, table redraw, bars from data, page-number run.

## What the fixed tool did wrong
- Nothing. All lines that the original draws as shapes came out with their own colour, width and dash. build: place()
  box (0.350, 1.133, 12.617, 5.929) in, no warnings, A and B.

## Look against v2.74 (renders in /tmp/C02-gantt-risks-polaris-fix/: new/, v274/)
- **A:** same as v2.74 except the lines now use the original's own style: the divider stops at 6.95 in (above the
  footer rule, as in original.png; v2.74 ran it down to the footer), the red rule is the stored 1.56 pt (was 2 pt), challenge
  rules B4B4B4 0.72 pt, dashed column pieces only between bars and at the stored x (about 1 px right of the hand x).
  Slightly closer to original.png (mean abs pixel diff 11.25 vs 11.31).
- **B:** same as v2.74 apart from the same line details (shorter divider, stored line styles). As good or slightly better.
- Lint (`--profile Style/refs/Case-2019-Polaris.profile.json`): A 0 errors, 1 warning (accent, 11 shapes); B 0 errors,
  1 warning (accent, 12 shapes). Same as v2.74.
