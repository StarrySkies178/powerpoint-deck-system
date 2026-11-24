# C06 exec summary (Mindcraft): open-book mimic report

(Written by the builder; saved by the run's chat because the builder's file tool refused report files.)

## Objects placed

The slide's store holds one object: `case19-mindcraft-003`. It has 2 top-level shapes:
- a group of 3 pictures that are pictures in the original deck: the photo, the opaque red-to-grey gradient on top of it (it hides the photo completely), and the MindCraft logo, which also sits under the gradient;
- the native body text box: Verdana (theme minor font), 14 pt italic white, 150% line spacing.

Both builds place it once, at its own size (full slide, scale 1), with `objstore.place(..., colours="original")`.
- **A:** placed as is, text untouched.
- **B:** refilled with `set_texts` (one text box, 5 paragraphs instead of 4).

One small change in both builds: the stored line spacing of 150% is written as its exact PowerPoint value, 25 pt. That is the original's 50 px pitch at 144 dpi. Without it, LibreOffice, which has no Verdana and falls back to DejaVu Sans, set the lines about 8% too tight.

## Redrawn instead

**Title.** The stored object has no title: it was the deck's title placeholder, and the store does not keep placeholders. The builds use the harness frame's title placeholder (`L.start({ ref: "Case-2019-Mindcraft" })`). `build.py` moves it above the picture group and sets it as on the original slide: white, bold, 26 pt (the profile's title size).

**Removed frame parts.** The frame's empty source placeholder and its slide number sat invisible under the opaque background, and the original shows neither. `build.py` removes them.

Nothing else was redrawn. There are no generators and no other objects.

## B: what changed and what broke

**New content.** An invented ready-to-drink coffee case ("BrewCo"), with new numbers throughout (18%, 2030, 9%, 60%, 21%, RMB 340 million). It has **5 paragraphs** instead of 4. The title "Executive Summary" is kept because it labels the form.

**What broke.** `set_texts` copies the *first* paragraph as the template for every new paragraph. That paragraph has 1.05 pt space-before; paragraphs 2 to 4 have 12 pt. So all five paragraphs ran together. `fix_paragraphs()` in B/build.py gives paragraphs 2 to 5 the stored 12 pt space-before and right margin. This is a real limitation of `set_texts` for multi-paragraph text with different paragraph spacing, not a bug in the object.

**Manual fix.** After the first render, two words of B were reworded so that no paragraph ended in a one-word line. Nothing else needed fixing.

## Remaining differences from original.png (A)

**Fonts.** The renderer has no Verdana, so text is drawn in DejaVu Sans, which is about 6% narrower. Some lines therefore break one or two words later than in the original, though each paragraph keeps the same number of lines. Position, size, colour, line pitch and paragraph gaps match.

**Left-edge line.** The original's thin dark line at the left edge is not reproduced. It is a PDF render artefact.

## deck_lint (`--profile Style/refs/Case-2019-Mindcraft.profile.json`)

- A: 2 errors, 3 warnings
- B: 2 errors, 3 warnings

Every finding comes from the original slide's own design and is kept on purpose:
- **E title colour / E title bold:** the original's title is white and bold on the dark gradient, while the profile's standard title is black and regular.
- **W low-res image:** the deck's own 642 x 359 px photo, which is fully hidden under the gradient.
- **W topic title:** the original title "Executive Summary".
- **W empty:** the original layout leaves the right side of the slide to the gradient (A: 41% of the body has content; B: 31%).
