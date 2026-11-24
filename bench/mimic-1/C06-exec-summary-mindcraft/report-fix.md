# C06 exec summary (Mindcraft): store fix 1 re-run (set_texts keeps each paragraph's format)

## Hand code removed

- **B/build.py:** `fix_paragraphs()` deleted (it gave paragraphs 2 to 5 the 12 pt space-before and a 5080 EMU right
  margin, because the old `set_texts` copied paragraph 1 for every paragraph). The `fix` hook in `place_slide_object()`
  and its call are gone; the docstring now says `set_texts` gives paragraph i the format of the stored paragraph i.
  `wc -l`: 84 before, 71 after.
- **A/build.py:** the unused `fix` hook in `place_slide_object()` removed (A refills no text). `wc -l`: 61 before, 60 after.
- Content unchanged: same title, same five B paragraphs, same numbers. Other work-arounds kept as they were:
  `exact_spacing()` (150% written as 25 pt), `finish_title()` (title above the picture group, white bold 26 pt,
  empty body and slide-number placeholders removed).

## Hand code still needed for this fault

None. `O.set_texts(obj, [[p1, ..., p5]])` alone gives the right space-before: paragraph 1 keeps 1.05 pt, paragraphs
2 to 5 get 12 pt (5 repeats 4). Letter spacing (`spc`) is dropped on the new runs (0 left in B), as documented.

## What the fixed tool did (one thing to note)

Each new paragraph now also takes the stored paragraph's own right margin (`marR`): 120014, 5080, 374015, 544195 EMU,
and 544195 again for paragraph 5 (v2.74's hand fix had 5080 for all of 2 to 5). That is what the docstring promises,
but these margins were fitted to the original's words (a PDF import, like `spc`), so on new text they narrow
paragraphs 3 to 5 for no design reason. Result in B: paragraph 3 ends in a one-word line ("chains."), paragraph 5
wraps to three lines ending "sub- / brand uptake.", and the text column is one line longer. Not worked round; a
suggestion for the tool: treat `marR` like `spc` (fitted to the old words) and drop or even it on new paragraphs.

## Look against v2.74 (LibreOffice render, /tmp/C06-exec-summary-mindcraft-fix/)

- **A:** pixel-identical to the v2.74 render (image diff empty); same match to original.png as before (only the
  Verdana to DejaVu Sans line-break differences).
- **B:** slightly worse. Paragraph gaps are right as before, but paragraphs 3 to 5 are narrower (see above), giving a
  one-word last line in paragraph 3 and one extra line overall. Still well inside the slide; nothing overlaps.

## Revision 2 (set_texts revised: run grouping, spacer paragraphs, marR dropped on new text)

- **Calls:** nothing to change. B passes one list of five plain-string paragraphs and A refills nothing, so the new
  level, run and spacer rules do not change what either build must pass. No hand code added; `wc -l` stays A 60, B 71.
- **What the tool did:** on B's new text `marR` is now dropped from all five paragraphs (`marL` 12700 kept); space-before
  is still 1.05 pt then 12 pt, and `spc` still 0. A's unchanged paragraphs keep their runs exactly, including their
  original `marR` and the 158 `spc` runs. Nothing wrong found.
- **A:** pixel-identical to v2.74 and to the first re-run; same match to original.png as before.
- **B:** the first re-run's problem is gone: no one-word lines, paragraph 5 back to two lines, the column again the same
  length as v2.74. Against v2.74 the only change is in paragraph 1, which used to have a 120014 EMU right margin: it is
  now slightly wider, so "value" moves up to line 2. Still 3 lines, so B looks as good as v2.74.
