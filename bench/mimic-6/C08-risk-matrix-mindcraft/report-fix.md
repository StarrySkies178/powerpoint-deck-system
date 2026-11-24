# C08 risk matrix (Mindcraft): store fix 3 re-run (colour roles: every stored colour keeps its exact original)

## Hand code removed

`A/build.py` and `B/build.py` (same file): 160 lines before, 154 after.

- **Removed:** the `SHADES` list (the 9 greys measured on the original) and step 1 of `main()`. Step 1 cleared each heat-map cell's fill and set `srgbClr` to `SHADES[col + (4 - row)]`, worked out from the cell's offset in the grid. This was fault 1 of report-v2.74.md ("Heat-map greys collapse"). The `cells` list that only step 1 used is gone too.
- **Why it can go:** each stored cell's `schemeClr` now carries its own original (`objstore.DS+"c"`). `place(..., colours="original")` turns that into the cell's exact grey. I checked all 24 filled cells of the stored group against the removed `SHADES` mapping and they agree cell for cell. The bottom-left cell is white and has no shape, as before.
- **Added:** comments only. Step 1 now says the map is placed as stored. A docstring on `set_fill_role` says a marker colour set through a role is recoloured on purpose, and that the stored original is dropped with the old fill. That is intended: the markers still map to C00000 / 46637A / 252525 through `role_src`.
- **B:** B has no re-shading of its own. Its new content (a ninth risk, new positions and names) does not change the heat map, so no cell colour is set by hand in B either.
- **Kept unchanged:** hand code for the other faults: the PDF-split rebuild of numbers and labels, the head autofit and widths, B's row text reset and margins, the page field and the source italics. `content.json` is unchanged in A and B.

Still needed hand code for this fault: nothing.

## What the fixed tool did

- **Heat map:** correct. The slide XML of A is byte-identical to the build before this fix, apart from the logo's `descr` path (the build folder). Each of the 9 greys is in its place (25 25 25 to F1 F1 F1, plus white). No `urn:deck-system` attribute is left in either deck.
- **Fault, from the re-extracted store (B only): `table_size` banding no longer works.**
  - **Call:** `O.table_size(obj, rows=6)` on `case19-mindcraft-015`.
  - **Stored table:** the header row and row 1 have no fill, row 2 is `bg2`, row 3 has no fill, row 4 is `bg2`. Banding is white and grey in turn.
  - **What goes wrong:** each grey `schemeClr` now carries the private `DS+"c"` attribute. lxml serialises each one with its own namespace prefix (`xmlns:ns44` / `ns44:c="EFEFEF"`, `ns45`, `ns46`, `ns47`). So `fills(tr)` in `table_size` compares byte strings that differ, even though both colours are the same bg2 / EFEFEF. `fills(trs[-1]) == fills(trs[-3])` (row 4 against row 2) is False, so the table is not seen as banded.
  - **Result:** the new row 5 copies row 4 (grey) instead of row 3 (white). In B, rows 4 and 5 are now both EFEFEF. Before this fix, and in v2.74, row 5 was white.
  - **Side effect:** the banded path, which takes the last row's top rule, is also skipped. That makes no visible difference here.
  - **Handling:** following the brief, I left it as the tool makes it and added no hand code.
  - **Likely tool fix:** compare fills without the `DS` attributes, or by their resolved colour.
- A is not affected, because it adds no rows.

## Look against v2.74 (renders in /tmp/C08-risk-matrix-mindcraft-fix/: v274/, pre/ = before this fix, new/)

- **A:** pixel-identical to the pre-fix build, so it is as good as v2.74.
  - The heat map matches the original cell for cell.
  - The only differences from v2.74 come from earlier fixes: map label lines 2 and later sit 1 pt lower, and the panel-2 rule is flat.
- **B:** worse than v2.74 in one place: the table's last two rows (4 and 5) are both grey, so the banding breaks.
  - The heat map and everything else match the pre-fix build.
- **Lint:** A and B both have 0 errors and 2 warnings (margins, accent), the same as v2.74.

## Revision 2 (by the run's chat)

The banding fault in B came from the store's private colour attribute: each cell's fill carried it under a different
namespace prefix, so table_size's banding test (which compared the fill XML) saw every row as different. Two changes:
extract now declares one prefix ("ds") on the stored fragment, and table_size compares the fill colours themselves.
The store was extracted again (same objects, same colours). A and B rebuilt: both are pixel-identical to the fix 2 build
(bench/mimic-5), so B's rows band white/grey/white/grey/white again.
