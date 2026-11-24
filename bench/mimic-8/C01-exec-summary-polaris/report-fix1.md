# C01 exec summary (Polaris): store fix 1 re-run (set_texts / place(texts=) / slots())

## Hand code removed
- **A:** none. A keeps the original text, so it never refilled anything and had no set_texts work-around. A/build.py 67 lines before and after, A/build.js 39 before and after.
- **B:** the `para()` helper (cloned a paragraph and rebuilt its runs as `[(text, bold)]`) and `refill()` (swapped a box's paragraphs), with the four paragraph templates `T_FIRST`, `T_SUB`, `T_TOP` (Market column), `T_HEAD` and `T_IMPL` and their six call sites. B now names each box it fills (`tag()`), builds the texts in `objstore.slots()` order, and passes them to `place(..., texts=...)`. List items go in as `{"lvl": n, "runs": text}`. The bold phrase in the second implication goes in as a list of runs. The centred heads and bar are set on the box's own `pPr` before filling (`ppr()`, a layout setting that v2.74 passed through `para()`). B/build.py: 157 lines before, 155 after. B/build.js and layout.json are unchanged (same content).
- Added to B's `tidy()`: the 7 lines from A's `tidy()` that give the PDF import's two `algn="r"` paragraphs (large `marR`) their siblings' indents. This was already A's clean-up for a different fault (the import). B never needed it before because `para()` took every template from the Market column. Now the Customer column keeps its own box's paragraphs.

## Still needing hand code for this fault
None.

## What the fixed tool still gets wrong
- **A level the box does not have.** The third column (Strategy Design) is a clone of the Implementation list, which has only level-0 paragraphs. I passed `{"lvl": 1, "runs": "Hero SKUs"}` (and Bundles, Social Commerce, Pharmacy Chains). set_texts falls back to the box's level-0 paragraph and only sets `lvl="1"`. Out came `<a:pPr marL="190500" indent="-178435" lvl="1">` with `buChar "•"` and `sz="1600" b="1"`. So the four sub-items render as bold 16 pt round-bullet top items, not as 14 pt regular dash sub-items. When the box has no paragraph at level n, the tool should take that level's format from the object's other boxes, or from the lstStyle. Left as the tool makes it.
- **A usability note, not a bug.** Run k maps to run k by position. A PDF-imported paragraph's runs are split by letter spacing (`"Based on position of "`, `"“"`, then 3 bold runs, then regular ones). So the caller must cut its text into the same pieces to get the bold in the right place. I passed `["As ", "“", "clean ", "science you can ", "feel", "”, ", "Lumière should ..."]`, and the result is correct.
- Correct per its contract: implication 1 keeps its own box's `algn="just"` (v2.74 used the left-aligned template). Its first line is now justified, as on the original.

## Look against v2.74 (LibreOffice, 96 dpi, /tmp/C01-exec-summary-polaris-fix/)
- **A:** pixel-identical to the v2.74 render (image diff is empty), so it matches original.png exactly as before.
- **B:** worse in one place, the Strategy Design column. Its 4 sub-items show as bold top-level bullets (see above), so the column loses its two-level structure. Otherwise B is the same as v2.74. Implication 1 is now justified, a small change that matches the original box. Text content is identical (only bullet glyphs and line order differ in the PDF text). deck_lint on B: 0 errors, 0 warnings.

## Revision 2 (set_texts revised: level template from another box, runs grouped by format, spacers kept, marR dropped)
- **Calls changed:** only the second implication. Runs of one format now count as one, so the stored box reads as regular | bold | regular. I dropped `IMPL_RUNS` (the 7-piece split cut to match the import's per-word runs) and its assert, and now pass the content's own three runs: `["As “", "clean science you can feel", "”, Lumière should ..."]`. The bold lands on the phrase only. B/build.py: 155 lines to 151. A: no change (67 lines). Nothing else needed changing. The `{"lvl": 1}` items stay as they were. The row-label spacers are removed by `tidy()` before filling (the import fault, as in v2.74), so the spacer change does not touch this object.
- **Fault of revision 1 fixed:** the Strategy Design sub-items (Hero SKUs, Bundles, Social Commerce, Pharmacy Chains) now take level 1 from another box. They come out as 14 pt regular dash sub-items, as in v2.74.
- **Tool faults left:** none seen.
- **Look:** A is still pixel-identical to the v2.74 render, so it matches original.png as before. B now matches v2.74 except for small, correct differences:
  - implication 1 keeps its box's own justification;
  - "Market" (head 1) and "Analysis" (row label) are unchanged text, so they keep the original's tighter letter spacing;
  - "Pain Points" keeps its own box's 6.05 pt space-before instead of the Market column's, which moves it by 1 px.
  B is as good as v2.74, and a little closer to the original's own formats. deck_lint on B: 0 errors, 0 warnings.
