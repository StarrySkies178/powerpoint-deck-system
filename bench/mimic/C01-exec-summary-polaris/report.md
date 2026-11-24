# C01 exec summary (Polaris): open-book mimic report

(Written by the builder; saved by the run's chat because the builder's file tool refused report files.)

## Stored objects placed
- **case19-polaris-002** (the slide's only stored object: 18 shapes, the whole exhibit). Placed in both builds with `objstore.place(..., colours="original", scale_text=False)` at its original position (1:1).
  - **A:** placed as is, after a clean-up in `A/build.py` (`tidy()`, applied to a copy, store untouched):
    - the two grey row-label panels lose `spAutoFit`, their empty spacer paragraphs and `spcBef`, and centre their text (otherwise LibreOffice shrinks each panel to its text);
    - the one-line bullet lists get `wrap="none"`;
    - the two paragraphs the PDF import made `algn="r"` with a large `marR` get the same indents as their siblings;
    - double spaces left at the original line breaks are collapsed;
    - the dash bullets get `buFont` Arial;
    - each header arrow's outline is opened on the left (the original hides that edge under a white line, which the store dropped).
  - **B:** same clean-up, then re-laid out from 3 to 4 stage columns and refilled.

## Redrawn, and why
- **Lines (native line shapes, at the original's EMU positions):** the 2 dashed column dividers, the 3 grey rules under the double chevrons, the footer rule and the short rule between the logos. The store holds none of them. `objstore.extract` skips every shape with a zero width or height (`if bb is None or bb[2] <= 0 or bb[3] <= 0: continue`), and every straight line in this PDF-imported slide is a 0-width or 0-height custGeom, including the 3 white lines that hide the arrows' left edges. This is a store bug: every horizontal or vertical line in any reference is lost.
- **Logos:** pictures taken from `Templates/Case-2019-Polaris.pptx` (pictures on the original slide), at their original sizes.
- **Page number:** fixed "2" (LibreOffice ignores `firstSlideNum`).
- Title, red rule and source line come from the harness frame, unchanged.

## Build A result
The render matches original.png within about 1 to 2 px at 1280 px. The only visible difference is LibreOffice's bullet glyph, which sits slightly higher.

## Build B: what changed
- **New content throughout:** a skincare brand ("Lumière", Southeast Asia) with a new title, heads, bullets, row label, both implications, bar text and source.
- **One item more:** 4 stage columns (Market | Customer | Strategy Design | Roll-out) instead of 3.
- **Implications:** each one spans two columns.
- **Logos:** the Pandora client logo is dropped because the content is not Pandora's; the Polaris team logo stays.
- **Re-laying out the object:** `objstore.extend(obj, 4)` refuses: `NeedsGenerator: exec-summary-tree: layout not a regular row/column -> use generator 'issueTree'`. `issueTree` is the wrong form (a stage grid, not a tree), so build.py re-spaces the object's own column units (arrow + head + list) to equal widths and clones the last one. Each arrow path keeps its tip depth.
- **Refilling:** `set_texts` could not be used. It applies the first paragraph's format to every line (bold level-0 / regular level-1 lost) and keeps only the first run (the bold phrase in an implication lost). The object has 0 slots. A `para()` helper clones the object's own paragraphs instead.

## What broke, or needed manual fixing
1. The first element selection in B grabbed the wrong shapes (red bar as a 4th arrow, the "Implications" panel as an implication box). Fixed with stricter selectors.
2. `wrap="none"` from the A clean-up shifted short lists right in LibreOffice; in B the lists are column-wide, so they are `wrap="square"` again.
3. Each implication's chevron lands right under the short dashed divider, which differs from the original. Left as is.

## Lint
`deck_lint` with the Polaris profile: A 0 errors, 0 warnings; B 0 errors, 0 warnings.

## Other notes
- With the default `scale_text=True`, `place()` autofit shrank the 16 pt heads, because the import's text boxes hug their text. That is why `scale_text=False` was used.
- The harness frame for this profile draws no footer rule and no logos.
