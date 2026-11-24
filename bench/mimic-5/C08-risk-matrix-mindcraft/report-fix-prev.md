# C08 risk matrix (Mindcraft): store fix 7 re-run (objstore.table_size, banded rows)

## Hand code removed

`A/build.py` and `B/build.py` (same file): 171 lines before, 162 after. Everything removed was in `main()` step 6 (the table). It runs only in B (`"normalise": true`); A has 4 rows and does not call table_size.

- **Whole-cell reset removed.** Before, each body cell was replaced by a deep copy of stored row 1 / row 2's `a:tc`, tcPr included. That copy was what made the bands alternate.
- **Banding loop removed.** This loop:
  - removed `solidFill` / `noFill` / `lnT` from every tcPr
  - added `bg2` to the even rows
  - rebuilt a 1 pt `tx1` `lnT` on row 1 only
- **Now:** the rows keep the formats that `O.table_size(obj, rows=6)` gives them:
  - stored rows 1 to 4 as they are: white, grey, white, grey
  - row 5: a copy of row 3, white, with no top rule because row 4 has none
  - the id comes out clean: `case19-mindcraft-015.tr6`

## Hand code kept (other faults, B only), and why

- **Paragraph reset.** Each cell's `a:txBody`, not its tcPr, is still reset to stored row 1 / row 2 in turn. This is fault 2 (PDF import), not table_size. The stored rows each carry their own PDF jitter:
  - risk-name marL from 34290 to 60325
  - a leading empty spacer paragraph in cell 4,1
- **What happens without the reset.** I tried it. Row 4's responses dropped about 0.2 in, row 4's bullet moved up, and the risk names in rows 3 and 5 moved left.
- **Kept unchanged:**
  - the uniform `marT` (0.06 in)
  - the solutions' `algn="l"` and removal of the PDF's `marR`
  - the risk column's `marR=45720`
  - the row heights (0.84 in) and the table markers placed from the row tops
- **Still needed for this fault:** nothing.

## What the fixed tool did

Correct for this table. The new row copies row 3 (the row two above), so the fills go white / grey / white / grey / white. Its tcPr has no `lnT`, the last row's top edge, so there is no extra rule. B's table XML is byte-identical to the pre-fix build. table_size's indent levelling runs only for `cols`, so it does not touch this case. No fault found.

## Look against v2.74 (renders in /tmp/C08-risk-matrix-mindcraft-fix/: v274A, v274B, preA, preB, newA, newB)

- **A:** pixel-identical to the pre-fix build, since A does not use table_size. It differs from v2.74 only in the earlier fix 1 map-label line shifts (about 1 pt per line). It is as good as v2.74 against original.png.
- **B:** pixel-identical to the pre-fix build. Banding, the single top rule, row text and markers are all as in v2.74. Only the same fix 1 label shifts differ. As good as v2.74.
- **Slide XML:** the only difference from the pre-fix build is the logo picture's `descr` path.
- **Lint:** A and B both have 0 errors and 2 warnings (margins, accent), the same as v2.74.
