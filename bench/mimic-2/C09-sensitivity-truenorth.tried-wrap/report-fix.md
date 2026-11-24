# C09 sensitivity (TrueNorth): store fix 5 re-run (objstore.place() at scale 1)

## Hand code removed

- `c09lib.py`: the `HEADINGS` set ("object 70", "object 134") and its removal of the two stored scenario headings in
  `chart_object()`; the redraw of each heading in `build()` (a `_text(...)` 18 pt bold, left-aligned box at `heading_xy`).
  Instead `build()` now passes `texts=[heading of each chart]` to `O.place()`, so the stored text boxes are kept and
  refilled (A: "Normal Scenario", "Optimistic Scenario", unchanged, so the stored runs are kept exactly;
  B: "Conservative Scenario", "Optimistic Scenario").
- `A/build.py`, `B/build.py`: the now unused `heading_xy` entries (and the `xy` argument of B's `chart()`).
- There was no `scale_text=False` to remove: the v2.74 builder never passed it.
- Lines: c09lib.py 203 -> 201, A/build.py 20 -> 20, B/build.py 29 -> 29 (entries shortened, no lines dropped).

Everything else stays: the 46 pictures of text and 4 glyph-outline shapes are still redrawn as native labels
(another fault), and so are the B re-lay (extend() NeedsGenerator), the B1B1B1 lower grey, the page number and title shift.

## What still needed hand code for this fault

Nothing.

## What the fixed tool still got wrong

- At scale 1 the stored headings now keep wrap="square", sz 1800, bold, spAutoFit, as stored: correct.
- B: `place(..., texts=["Conservative Scenario", "Optimistic Scenario"])` refills stored box "object 70"
  (1602105 EMU = 1.75 in wide, wrap="square", spAutoFit). "Conservative Scenario" at 18 pt bold is about 2.2 in wide,
  so it wraps to two lines ("Conservative" / "Scenario"), and the second line runs into the "¥1.6M" axis tick and
  the legend row. Neither set_texts() nor place() widens a text box when the new text is longer than the old one
  at scale 1 (before the fix, wrap="none" hid this). Left as the tool makes it.
- The stored headings sit about 0.02 in (2 px at 1280) lower than in the original (tIns 1 pt + spcBef 1 pt as stored);
  the v2.74 hand-drawn box was level with the original. Minor, not a fault of this fix.

## Look against v2.74 (renders in /tmp/C09-sensitivity-truenorth-fix/)

- A: same as v2.74 to the eye. Headings now come from the store, same text, size and weight, x within 1 px of the
  original, 2 px lower. Mean absolute pixel difference vs original.png at 1280 px: 6.03 (v2.74: 5.90); all of the
  change is in the two heading strips, the rest of the slide is identical (5.62 both).
- B: worse than v2.74 in one place: "Conservative Scenario" wraps onto two lines and overlaps the ¥1.6M tick
  (v2.74 drew it on one line). "Optimistic Scenario" is fine. Everything else is unchanged.
- deck_lint: A 0 errors, 2 warnings (accent, thin); B 0 errors, 1 warning (accent). Same as v2.74.
