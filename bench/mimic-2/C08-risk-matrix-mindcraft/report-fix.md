# C08 risk matrix (Mindcraft): store fix 5 re-run (objstore.place() at scale 1)

## Hand code removed

`A/build.py` and `B/build.py` (same file): 171 lines before, 171 after. The work-around was one argument, not a function.

- `main()`, the `O.place(...)` call (line 156): `scale_text=False` is removed. It was there only to stop place() from shrinking the narrow number and axis boxes at scale 1 (fault 3 of report-v2.74.md). The call is now `O.place(out, 1, obj, (X, Y, W, H), STORE, colours="original", texts=fill)`. The placed box is still the object's own bbox, so place() sees scale 1.
- There was no hand code that undid place()'s wrap="none". The two places that set wrap="none" stay, because they belong to fault 2 (PDF-split rebuild) and set their own wrap:
  - `number_in_circle()`: the numbers inside the cloned circles.
  - The label loop in step 5: the rebuilt risk names.
- Hand code for the other faults is unchanged: the 9 greys, the PDF-split rebuild, the second head rule, the head autofit, B's row banding and margins, the page field and the source italics.

Still needed hand code for this fault: nothing.

## What the fixed tool did

- **Font sizes:** every `sz` in the slide XML is the same as before the fix. Nothing is scaled or fitted at scale 1, as the docstring says.
- **Wrap:** the only XML change is in the stored text boxes of 3 words or fewer. They now keep the stored `wrap="square"` instead of getting `wrap="none"`. These are:
  - the axis labels (High, Low, Medium, Likelihood, Severity)
  - the two panel heads and their chip numbers
  - "Top priority"
- **Fault (a result of following the spec, not a bug in the code):** "Top priority" now wraps onto two lines in LibreOffice ("Top" / "priority"). Its stored box is 1.25 in wide (cx 1144270) with `wrap="square"` and `spAutoFit`. It holds 16 pt bold italic `+mn-lt` text (Verdana). Verdana is not installed here, so LibreOffice uses DejaVu Sans Bold Oblique, which is wider, and the text no longer fits on one line. Under the old place(), `wrap="none"` hid this. The original, v2.74 and the pre-fix build all show it on one line. In PowerPoint, with Verdana, the stored box should fit as in the source deck. Following the brief, no hand code was added.
- **Axis labels:** the other changed boxes move by about 1 px at 96 dpi: the bottom "Low", "Medium", "High" and "Severity". The vertical axis labels do not change.

## Look against v2.74 (renders in /tmp/C08-risk-matrix-mindcraft-fix/: v274/, pre/ = before this fix, new/)

- **A:** the same as v2.74, with one exception. The "Top priority" label inside the dashed zone now takes two lines instead of one, so it is slightly worse there. Everything else matches the pre-fix build to within about 1 px: the table, markers, labels, heads and axes. The fix 1 differences remain (map label lines 2 and later are 1 pt lower).
- **B:** the same as A. "Top priority" takes two lines, and everything else is as good as v2.74.
- **Lint:** A and B both have 0 errors and 2 warnings (margins, accent), the same as v2.74.

## Revision 2 (fix 5 narrowed: place() again sets short labels to wrap="none" at every scale; only the no-shrink at scale 1 stays)

- **What was done:** A and B were rebuilt with no other changes. `scale_text=False` stays removed, and `build.py` is still 171 lines. No hand code was added.
- **XML:** every bodyPr and every `sz` in the slide XML is now the same as in the pre-fix build. The short labels, "Top priority" among them, have `wrap="none"` again. The only other XML difference is the logo picture's `descr` path, which is the build folder path.
- **Fault fixed:** "Top priority" is back on one line.
- **Look (renders in /tmp/C08-risk-matrix-mindcraft-fix/r2):** the A and B renders match the pre-fix build pixel for pixel, so they are as good as v2.74. The only differences from v2.74 are the fix 1 shifts (map label lines 2 and later are 1 pt lower).
- **Lint:** A and B both have 0 errors and 2 warnings (margins, accent), the same as v2.74.
