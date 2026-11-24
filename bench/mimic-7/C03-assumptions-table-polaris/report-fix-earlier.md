# C03 assumptions table (Polaris): store fix 1 re-run (set_texts reaches table cells)

## Hand code removed
- `fill_table` (mimic_util.py), the cell-by-cell table filler written because set_texts/slots did not reach a:tbl cells. Deleted.
- B/build.py now calls `O.set_texts(obj, [c for row in rows for c in row])` (one item per cell, row by row; slots() lists 84 "cell r,c" slots on the 12 x 7 table). Text and numbers unchanged.
- A never used fill_table (the table is placed as is), so A/build.py is unchanged.
- Lines (wc -l), before -> after: mimic_util.py 86 -> 65; B/build.py 34 -> 34 (one call swapped); A/build.py 17 -> 17.
- Kept, as they fix other faults: explicit_borders (LibreOffice stray rule), page_number, respace_columns (table_size column spacing).

## Hand code still needed for this fault
- None was added. The fault below is left as the tool makes it.

## What the fixed tool still gets wrong
- Object: case19-polaris-022 after table_size(cols=7). Cells: the header rows of the 2nd and 3rd scenario blocks (rows 4 and 8, all 7 cells: "Central Case"/"Downside Case" and the years).
- In the stored object these cells have TWO paragraphs: an empty spacer paragraph first (no runs, endParaRPr sz=1300, spcBef 20) and then the text paragraph.
- Passed: a single string per cell (e.g. "Central Case", "2024").
- Came out: one paragraph only. set_texts builds its templates from paragraphs that contain text, removes all paragraphs and writes back only the new ones, so the empty spacer paragraph is dropped.
- Effect: in those two header rows the text moves up about 0.5 in to the top of the tall row, leaving a gap above the black rule under it (rendered y about 141 to 574 px differs from v2.74). Row 0 (no spacer) is right.
- Wanted: leading (and trailing) empty paragraphs of a cell or box kept when the new item has fewer paragraphs, or at least kept when the text paragraph is refilled.
- Minor, as documented: spc (letter spacing, -5 etc.) is dropped on the new runs; no visible change.

## Look against v2.74 (LibreOffice, 96 dpi, /tmp/C03-fix/)
- A: identical to v2.74 (0 differing pixels); against original.png the same as before (mean abs diff 6.01 both). Only difference from the original is still the logo slot.
- B: worse than v2.74. Central Case and Downside Case header lines sit at the top of their rows, detached from their rules; the Upside block and all number rows are as before.
- deck_lint (Polaris profile): A 0 errors, 1 warning (thin, the original's own text); B 0 errors, 0 warnings. Same as v2.74.

## Revision 2 (set_texts revised: spacer paragraphs kept, runs grouped by format, marR dropped in text boxes only)
- Calls: unchanged. B still passes one plain string per cell (84 cells); no new hand code. A/build.py and mimic_util.py are as after revision 1 (17 and 65 lines).
- Fixed: the empty spacer paragraphs now stay, so the Central/Downside header rows are back in place.
- A: same as v2.74 (slide XML identical once spc is ignored; 0 differing pixels; mean abs diff with original.png 6.01, as before).
- B: XML identical to v2.74 (spc ignored) except two cells, so it is close to v2.74 but slightly worse:
  - Which cells: the new 7th column (added by table_size(cols=7)), in the header rows of the 2nd and 3rd blocks (rows 4 and 8, col 6), where I passed "2029".
  - What came in: table_size copies the last column and blanks the text, so this cell is [empty spacer paragraph (sz 1300, spcBef 20)] + [text paragraph algn="r", bold 14 pt run whose a:t is empty].
  - What came out: one paragraph only. Because the text paragraph's run is empty, set_texts does not count it as a text paragraph, so it falls back to the spacer as the template. "2029" is written into the spacer paragraph: 13 pt, not bold, left-aligned. The bold right-aligned paragraph is dropped.
  - On the render: "2029" sits small and to the left, at the top of the row above the rule, in both blocks.
  - Wanted: a paragraph that has runs (even with empty text) should count as the text template ahead of an empty spacer. Or table_size should leave the template recognisable.
  - Row 0 col 6 (no spacer) is filled correctly.
- deck_lint: A 0 errors, 1 warning (thin); B 0 errors, 0 warnings.

## Revision 3 (set_texts prefers a paragraph with runs, even an empty run, over a spacer as the template)
- Calls: unchanged (B passes one plain string per cell). No hand code added. Line counts as in revision 1.
- A: same as v2.74 (slide XML identical when spc is ignored; 0 differing pixels; mean abs diff with original.png 6.01).
- B: now matches v2.74. The slide XML is identical once spc is ignored, and the "2029" cells in rows 4 and 8 are bold, right-aligned and keep their spacer.
  - The only remaining difference is the documented spc drop: 69 runs had spc="-5" (-0.05 pt).
  - That moves a few glyphs by a sub-pixel (3264 anti-aliased pixels differ).
  - Every text row starts and ends at the same pixel as v2.74, so there is no visible change.
- The fixed tool now gets nothing wrong in this case. Look: A as good as v2.74; B as good as v2.74.
- deck_lint: A 0 errors, 1 warning (thin, the original's own text); B 0 errors, 0 warnings.
