# C02 gantt and risks (Polaris): store fix 1 re-run (objstore.set_texts)

## Hand code removed
- `common.py`: `_runs_text()` (run-level refill that copied the template's runs, dropped `spc` and `marR`) and its call loop in `body_object()`.
  `body_object()` now calls `o.set_texts(obj, spec["texts"])` once, on the stored object before anything else is changed.
- `B/build.py`: `texts` was a dict keyed by element index; it is now a list in slot order (`objstore.slots`: elements 1, 2, 8, 9, 12, 10, 13, 11, 14). Same text, same runs ("Response:" as run 0, the rest as run 1).
- `A/build.py`: unchanged (A changes no stored text, so it never used the work-around).
- Lines (`wc -l`): common.py 156 -> 135; A/build.py 46 -> 46; B/build.py 81 -> 81.

## Hand code still needed for this fault
None. The other work-arounds from report-v2.74.md (scale_text=False, F1F1F1 fill, letters/words written into the circles and tags with `_label`, table removed and redrawn, bars from data, page-number run) are untouched.

## What the fixed tool still got wrong
- **`marR` (PDF-import right margin) is kept.** set_texts keeps each paragraph's pPr whole, so the line-break margins the PDF import fitted to the OLD words stay on the new text. Element 13 (third "Mitigation"/"Response" box, 4.12 in wide) has `marR="728980"` (0.80 in): B passed `[["Response: ", "Hold a clear edge in design, materials and positioning"]]` and the text now wraps after "in" ("Hold a clear edge in / design, materials and positioning") instead of after "design,". Element 12 keeps `marR="222250"` (0.24 in); it wraps the same as before here. `spc` is dropped on new runs as promised.
- Nothing else: run formats (red bold "Response:", plain rest), per-paragraph spacing and bullets all came out right.

## Look against v2.74 (renders in /tmp/C02-gantt-risks-polaris-fix/)
- **A:** pixel-identical to the v2.74 render (A refills no stored text), so as close to original.png as before.
- **B:** same as v2.74 except the right column: (1) the challenge bullets 2 and 3 of element 9 now use their own paragraph spacing (spcBef 1.7 pt, was 2.7 pt copied from paragraph 1), a little tighter, as in the original: slightly better; (2) the "Response:" box of element 13 breaks one word earlier because of the kept `marR`: slightly worse. Neither overflows its box.
- Lint (`--profile Style/refs/Case-2019-Polaris.profile.json`): A 0 errors, 1 warning (accent, 11 shapes); B 0 errors, 1 warning (accent, 12 shapes). Same as v2.74.

## Revision 2 (set_texts revised: run grouping, marR dropped, spacers kept, lvl from other boxes)
- **Calls changed:** none. B's items were already one run per new format ("Response: " then the rest; title and years as before), so the run grouping gives the same formats; A refills nothing. No hand code added; line counts unchanged (common.py 135, A/build.py 46, B/build.py 81).
- **Fault from the first re-run is fixed:** `marR` is gone from every refilled box (no `marR` left on the slide). Element 13 now wraps "Hold a clear edge in design, / materials and positioning", as in v2.74.
- **Nothing wrong found** in this case with the revised tool.
- **Look (renders in /tmp/C02-gantt-risks-polaris-fix/r2/):** A is pixel-identical to v2.74. B is identical to v2.74 except element 9's challenge bullets 2 and 3, which keep their own paragraph spacing (1.7 pt, as the original's box has) instead of paragraph 1's 2.7 pt: slightly tighter, closer to the original. So B is now as good as v2.74 or slightly better, with zero hand code for this fault.
