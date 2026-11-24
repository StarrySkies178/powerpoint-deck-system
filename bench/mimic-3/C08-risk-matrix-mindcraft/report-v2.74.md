# C08 risk matrix (Mindcraft): open-book mimic report

## Objects placed

One stored object makes up the whole slide body: `case19-mindcraft-015` (53 shapes). It goes in through `objstore.place(..., colours="original", scale_text=False)` at its own bounding box, at scale 1. Both builds run the same `build.py`. Only `content.json` differs between them.

- **Placed as is:** axes, arrows and axis labels; the panel chips and rules; the 25-cell heat-map group; the dashed priority box; the native table (2 columns); the ">>" picture; the two crumb triangles.
- **Refilled:** the panel heads, the "Top priority" label, the table header and every table cell. Each cell is filled paragraph by paragraph in the stored run formats. Text that is the same as the stored text keeps its stored runs, so A keeps the original spacing.
- **Rebuilt from the object's own shapes:** every risk marker is a clone of the stored circle with its number put inside it, so the number moves with the circle. Every risk name is one clone of the stored italic label box, with one paragraph per line. The table markers are clones of the stored table circle in the same way.
- **Extended (B):** `objstore.table_size(obj, rows=6)` adds the fifth table row.
- **Recoloured:** the heat-map cells get the original's 9 greys, set by hand (see below). Marker colours are set through the object's roles (accent1 red, accent2 blue-grey, accent5 near-black), and `colours="original"` then maps them to C00000 / 46637A / 252525.

## What was redrawn instead, and why

- **Breadcrumb text:** three pptxgenjs text boxes, 14 pt bold italic, at the original's x positions. The frame's own crumb puts "▶" characters inline, but the original spaces its sections out around the two stored triangles. No other part of the frame was redrawn: the title, source and page come from the bench frame (`L.start`).
- **Logo:** the deck's master picture (`Templates/Case-2019-Mindcraft.pptx`, `ppt/media/image1.png`), placed as a picture at its master position. It is a picture in the original deck, and the store does not have it because frame logos are removed at ingest.
- **Page number:** the frame writes a slide-number field. LibreOffice ignores `firstSlideNum`, so the field became plain text "12" (B: "14"). The source line was set to italic, as the deck has it.

## Failures in the stored object (worked around in build.py; nothing in the store or framework was changed)

1. **Heat-map greys collapse.** The original has 9 shades (FFFFFF to 252525, measured on original-1920.png). The store keeps only 4 grey roles (bg2, accent6, accent4, accent5), so `colours="original"` gives a blotchy map with whole columns in 252525. Fix: each cell is set to srgb by its level, severity + likelihood.
2. **Text split by the PDF import.** "Comp" + "etitor's response" are two overlapping boxes. "Cannibaliza" / "-" / "tion" are three boxes. Every label is cut into one box per line. Marker numbers are separate boxes positioned with paragraph `marL` offsets: "1" uses `marL=861060` in a 1.48 in box, so its number lands outside circle 1 in LibreOffice. Fix: numbers go inside their circles, and each label becomes one box.
3. **Default `place()` shrinks text.** With `scale_text=True`, `_autofit` shrinks the narrow number and vertical axis boxes (0.14 to 0.23 in wide) from 16 pt or 14 pt down to about 8 pt, and "Likelihood" and "Low" land in the wrong places. Fix: `scale_text=False`, which is safe here because the scale is 1.
4. **Panel 2 head rule missing.** The object keeps the rule under "Risk mapping" only. Fix: a clone of it was added under panel 2.
5. **Panel heads grow both ways.** A head with an `spAutoFit` box and changed text grows to both sides in LibreOffice and overlaps its chip. Fix: autofit removed, and the box runs to the end of its rule.

## B: what changed

- **Content:** new title, crumb, panel heads, column head ("Responses"), source and page.
- **Map:** 9 risks instead of 8 (one more). Five are in the zone, and four are named outside it, each with a new position and name.
- **Table:** 5 rows instead of 4 (one more), all with new text.

Manual fixes when the content changed:

- **Row formats and banding:** `table_size` copies the last row, so rows 4 and 5 came out both grey. In B every row is reset to the stored row 1 / row 2 formats in turn: banding white / grey, one top rule, a uniform top margin, and the PDF's per-paragraph right margins and justification removed. Row heights are set (0.84 in), and the table markers are placed from the row tops.
- **Label positions:** label positions in the map are given by hand in `content.json`. Nothing places them automatically.
- **Arrow (not fixed):** the ">>" picture stays at its stored position. In B it now touches the row-3 marker.

## Lint (`scripts/deck_lint.py --profile Style/refs/Case-2019-Mindcraft.profile.json`)

- A: 0 errors, 2 warnings
- B: 0 errors, 2 warnings

Both warnings are the same in A and B, and both come from the original itself:

- **margins:** the vertical "Likelihood" label sits at x 0.29 in, as in the original.
- **accent:** 6 red-filled shapes: the 2 chips, 2 map markers and 2 table markers, as in the original.
