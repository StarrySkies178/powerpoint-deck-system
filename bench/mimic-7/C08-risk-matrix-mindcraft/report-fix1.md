# C08 risk matrix (Mindcraft): store fix 1 re-run (objstore.set_texts / place(texts=...) / slots())

## Hand code removed

`A/build.py` and `B/build.py` (same file): 191 lines before, 171 after.

- `norm()`, `same()` and `one_run_text()` are gone. These three rewrote a paragraph's runs by hand in the first run's format and kept the stored runs when the text was unchanged.
- All their call sites now hand the text to `objstore.place(..., texts=fill)`, which calls `set_texts`. Each text is addressed through `objstore.slots()` (shape name, or "cell r,c"). The call sites were:
  - the panel heads and "Top priority"
  - the marker numbers (map and table)
  - the risk labels (one paragraph per line)
  - the table header
  - every table cell: the risk name and bullet; the solutions as runs `[tag, " ", text]`
- Paragraph handling in the table is gone too:
  - the loop that copied the last paragraph when a cell needed more
  - the removal of extra paragraphs
  - the removal of empty paragraphs (B)
  - the per-paragraph rebuilding of the bold tag and plain-text runs
- The removal of `spcBef` on label lines 2 and later is gone too.
- Added (small, not work-arounds):
  - `uniq_name()` gives each cloned circle and label its own shape name, so `slots()` can tell them apart.
  - `number_in_circle()` moves the stored number box's paragraph into the circle, centred, so `set_texts` has a run to fill. The old code built that run by hand inside `one_run_text`. The centring belongs to fault 2 of report-v2.74.md (PDF-split numbers), not to this fix.
  - About 8 lines map hints to slot indices.
- Hand code for the other faults (9 greys, PDF-split rebuild, `scale_text=False`, second head rule, head autofit, B row banding and margins, page field, source italics) is unchanged. In B the margin and justification edits now go on the template paragraphs before filling.

Still needed hand code for this fault: nothing.

## What the fixed tool still gets wrong

1. **A paragraph given as a list of runs is always rebuilt, even when its text is unchanged.** The docstring says "a paragraph whose text is unchanged keeps its runs exactly", but `set_texts` only checks that for string entries (`not isinstance(runs, (list, tuple))`). In A, cell 1,1 was passed `[["[Avoid]", " ", "Strengthen internal ..."], ["[Mitigate]", " ", "Adjust KPI system accordingly; introduce experienced  management talent from outside when necessary"]]`. That is the stored text exactly, but the result has 3 runs per paragraph and the stored per-word `spc` is gone. The justified "[Mitigate]" paragraph now breaks one word earlier, so "introduce   experienced   management" is stretched across the cell with wide gaps. v2.74 and the original keep "talent" on that line with normal gaps. The other A solution cells also lose their spacing, but nothing visible changes there.
2. **Empty paragraphs are dropped.** Only paragraphs with text serve as templates, and every paragraph is removed before filling. Stored cell 4,1 starts with an empty paragraph (spcBef 4.15 pt, from the PDF import) before "[Avoid] Make upgrade plan...". That paragraph is lost, so in A row 4's solutions sit about 0.1 in (about 9 px at 96 dpi) higher than in v2.74 and the original. B was not affected, because its rows are reset to stored rows 1 and 2.
3. Minor, as specified: further paragraphs repeat the last one with its spcBef (1 pt), so label lines 2 and 3 move down about 1 pt each. An empty shape (the stored circle has `<a:p/>`) is not a slot until it has text.

## Look against v2.74 (rendered in /tmp/C08-fix/r, side-A.png / side-B.png)

- **A:** slightly worse, and only in the Solutions column, through faults 1 and 2: the stretched row-1 "[Mitigate]" line and row-4 text about 0.1 in higher. The map, markers, labels, heads, header and risk cells are the same as v2.74 to within a pixel or two.
- **B:** as good as v2.74. All text, wraps and positions match. The only pixel differences are the 1 pt label line shifts.
- **Lint:** A and B both have 0 errors and 2 warnings (margins, accent), the same as v2.74.

## Revision 2 (set_texts revised: format groups, unchanged list text kept, spacer paragraphs kept, marR dropped in text boxes)

- **Changed call (one line in A and B `build.py`, still 171 lines).** Runs of one format now count as one run, so the stored solution paragraphs have 2 runs, "bold tag" and "plain text". The solution entries are now `[tag + " ", text]` instead of `[tag, " ", text]`. No other call needed to change, and no hand code was added.
- **Fault 2 above is fixed.** Cell 4,1 keeps its leading empty paragraph, so A row 4's solutions sit where they do in v2.74 and the original.
- **Fault 1 is fixed in the tool, but one A paragraph still differs.** A's cell 1,1 "[Mitigate]" is still rebuilt and still stretched ("introduce   experienced   management"). The cause is not the tool:
  - content.json (kept unchanged as the rules require) has "experienced  management" with two spaces.
  - The stored text has one space, carried in a run with spc 345.
  - set_texts compares text exactly, so it treats this as new text. v2.74's `same()` ignored whitespace differences.
- **Other paragraphs:** every other unchanged A paragraph keeps its stored runs.
- **Minor, as specified:** label lines 2 and later still repeat spcBef 1 pt.
- **Look (renders in /tmp/C08-fix/r/r2):**
  - A matches v2.74 and the original everywhere except that one justified line in row 1. That is better than revision 1.
  - B renders the same as in revision 1, so it is as good as v2.74.
- **Lint:** unchanged (0 errors, 2 warnings each).

## Revision 3 (set_texts: unchanged-text match ignores repeated spaces; paragraphs with runs preferred over run-less spacers as templates)

- **What was done:** A and B rebuilt with no change to the calls or content.json. `build.py` is still 171 lines, and no hand code was added.
- **Row 1 is fixed.** A's cell 1,1 "[Mitigate]" now keeps its stored runs, so the justified line reads "introduce experienced  management talent" as in v2.74 and the original. Every table cell in A now renders the same as in v2.74.
- **Only remaining difference from v2.74 (A and B):** the multi-line map labels. Lines 2 and later repeat the template's spcBef of 1 pt, which v2.74 removed by hand. That is a shift of about 1 pt per line, as the tool specifies.
- **Look (renders in /tmp/C08-fix/r/r3):** A and B are as good as v2.74. A matches the original as closely as v2.74 did.
- **Lint:** unchanged (0 errors, 2 warnings each).
