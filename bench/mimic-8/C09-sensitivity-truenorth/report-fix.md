# C09 sensitivity (TrueNorth): store fix 3 (colour roles) re-run

## Hand code removed
- `c09lib.py`, `chart_object()`: the 3-line block `if ch.get("grey"): ... schemeClr accent6 -> srgbClr ch["grey"]` that recoloured
  the lower chart back to B1B1B1 is deleted. `place(..., colours="original")` now gives each stored colour its own original:
  upper chart grey A3A3A3, lower chart grey B1B1B1, red CC0000.
- B (re-laid bars): `_rect_sp()` no longer takes a role name ("accent6"/"accent1"); it takes a copy of the stored bar's own
  `solidFill` of the same chart (role plus its private original colour), taken just before the stored bars are removed.
  So the re-laid bars keep the colours v2.74 gave them (upper A3A3A3, lower B1B1B1) through the tool, with no recolouring.
- The spec key `grey` ("B1B1B1" in A/build.py and B/build.py) now only colours the lower legend square, which is a native
  rectangle redrawn because the stored one is a picture (a different fault, kept).
- Line counts: c09lib.py 203 -> 206 (3 removed, 6 added for the fill copy and comments); A/build.py 20 -> 20; B/build.py 29 -> 29;
  build.js files unchanged.

## Hand code still needed for this fault
None.

## What the fixed tool got wrong
Nothing for this case. The re-extracted store keeps the element names the lib selects by ("object 43/108" axes, glyph shapes,
headings); the only index-based pick, `O.element(case-truenorth-pola-004, 0)` (the logo), is still the picture at index 0.
Placed decks carry no leftover private colour attribute.

## Look against v2.74
Renders in /tmp/C09-sensitivity-truenorth-fix/{A,B,v274A,v274B}/r.png (1280 px). A and B are pixel-identical to the v2.74
renders (0 pixels differ), and the slide XML has the same colour counts (A: A3A3A3 x10, B1B1B1 x10; B: x11 each).
A against original.png: mean absolute difference 5.80 / 255, same as v2.74. deck_lint: A 0 errors, 2 warnings (accent, thin);
B 0 errors, 1 warning (accent), as before. Other work-arounds (pictures of text redrawn, headings, extend() for B, dashes,
outlines, page number) kept unchanged.
