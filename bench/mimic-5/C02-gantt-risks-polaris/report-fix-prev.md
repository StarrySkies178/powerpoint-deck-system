# C02 gantt and risks (Polaris): store fix 5 re-run (objstore.place at scale 1)

## Hand code removed
- `common.py`, `build()`: the `scale_text=False` argument on the `o.place(...)` call. It was there only to stop place()'s
  `_autofit` shrinking 14 pt text to 12-13 pt at 1:1 (report-v2.74.md, fault 1). The body is placed at its own bbox, so
  place() now leaves its text exactly as stored with the default `scale_text=True`.
- No hand code undid place()'s wrap="none" (the `wrap="none"` set in `_label()` is the original's own setting for the
  letter circles and Brand / Design tags, written into labels this build creates, so it stays).
- Lines (`wc -l`): common.py 135 -> 135 (one argument dropped from a line); A/build.py 46 -> 46; B/build.py 81 -> 81.

## Hand code still needed for this fault
None. The other work-arounds (F1F1F1 fill for the light boxes, letters/words written into circles and tags with `_label`,
table removed and redrawn natively, Gantt bars from data, page-number run) are untouched.

## What the fixed tool did
- Nothing wrong. place() returned box (0.350, 1.133, 12.617, 5.929) in, no warnings, in A and B.
- Only XML change on the slide (A and B): element 0, the empty red rule under the right-hand header, keeps its stored
  `wrap="square"`; before, place() set it to `wrap="none"` (0 words counted as a short label). It holds no text, so no
  visible effect. No text size changed (the v2.74 build already passed scale_text=False).

## Look against v2.74 (renders in /tmp/C02-gantt-risks-polaris-fix/: new/, pre/ = before this fix, v274/)
- **A:** pixel-identical to the v2.74 render and to the pre-fix render, so as close to original.png as before.
- **B:** pixel-identical to the pre-fix render. Against v2.74 it differs only in the right column (element 9's bullet
  spacing, from store fix 1 rev. 2, slightly closer to the original), as reported in report-fix1.md.
- Lint (`--profile Style/refs/Case-2019-Polaris.profile.json`): A 0 errors, 1 warning (accent, 11 shapes); B 0 errors,
  1 warning (accent, 12 shapes). Same as v2.74.
