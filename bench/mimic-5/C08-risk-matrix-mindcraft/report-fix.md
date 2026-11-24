# C08 risk matrix (Mindcraft): store fix 2 re-run (objstore.extract keeps zero-width / zero-height shapes)

## Hand code removed

`A/build.py` and `B/build.py` (same file): 162 lines before, 160 after.

- **Removed from `main()` step 3:** the two lines that cloned the left head rule (`els[8]`) as `rule2` and put it under panel 2 at 5.82 in, 6.87 in wide. This was fault 4 of report-v2.74.md ("Panel 2 head rule missing").
- **Why it can go:** the re-extracted `case19-mindcraft-015` has 54 shapes. The new one is top-level element 13 ("object 16"): a straight custGeom line, 5.747 in to 12.696 in, cx 6354445, cy 0, 1.2 pt `accent4`, the same line style as the left rule. It is placed as stored. The step-3 comment now says that both rules are stored.
- **Indices re-mapped.** Every element from 13 up moved by one (listed with `O._frag`; `O.elements(obj)` gives the same 54 in this order):
  - heat map 13 to 14
  - zone group 41 to 42
  - table 21 to 22
  - "Top priority" 47 to 48
  - template circle and number 15/16 to 16/17
  - template label 44 to 45
  - template table circle and number 22/23 to 23/24
  - the `drop` list shifted by one (the triangles at 31/32 and the ">>" picture at 43 are kept)
  - the panel heads (9, 12) and the left rule (8) did not move
- **Kept unchanged:** hand code for the other faults: the 9 greys, the PDF-split rebuild of numbers and labels, the head autofit and widths, B's paragraph reset and margins, the page field and the source italics. content.json is unchanged.

Still needed hand code for this fault: nothing.

## What the fixed tool did

Correct here. The stored rule is a flat line (path from (0,0) to (w,0), h 0). Its extent matches the original render: at 1280 px wide, one row at y 166, x 552 to 1218, grey 126, the same as original.png. No fault found.

## Look against v2.74 (renders in /tmp/C08-risk-matrix-mindcraft-fix/: v274/, new/; the previous fix build is newA/, newB/)

- **Change from the previous build:** the only pixels that change, in both A and B, are the panel-2 rule (rows 165 to 167, x 552 to 1218). Everything else is pixel-identical.
- **A:**
  - v2.74's clone copied the left rule's slight slope (1905 EMU rise over its length). It rendered as an anti-aliased slant across 3 rows, from x 558, ending 1 px short.
  - Now the rule is flat on one row, ending at 1218 as in the original. Slightly better than v2.74.
  - The other differences from v2.74 are unchanged: the fix 1 map-label line shifts of about 1 pt per line.
- **B:** the same change as in A. It is as good as v2.74, slightly better on the rule.
- **Note:** the `candidate.pptx` files that came with this mimic-5 copy rendered as the frame only, with no slide body. So the "before" comparison uses the previous fix run's renders.
- **Lint:** A and B both have 0 errors and 2 warnings (margins, accent), the same as v2.74.
