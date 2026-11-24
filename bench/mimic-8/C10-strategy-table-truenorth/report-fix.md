# C10 strategy table (TrueNorth): store fix 6 re-run (objstore.element / place media)

## Hand code removed

None. Neither build had a work-around for the unused media: both lift the logo with `O.element(O.get(STORE,
"case-truenorth-pola-004"), 0)` and place it with `O.place(...)`, unchanged. Lines: A/build.py 85 -> 85,
B/build.py 91 -> 91, A/build.js 36, B/build.js 14 (no edits). Hand code for the other faults stays as before.

## Hand code still needed for this fault

None.

## What the fixed tool did

- Rebuilt A and B (build.js then build.py). `unzip -l` now shows one media part in each candidate,
  `ppt/media/obj_bb793eb28421bcf5.jpg` (5156 bytes, the TrueNorth logo); before, each held 6 (the logo plus 5 unused
  pictures from object 004: obj_0acc7eba11f85059.png, obj_655ac6c7ecc03ba4.png, obj_818780ad1bec6453.png,
  obj_c4f5586f6f2903a6.png, obj_f07895ab9c18424c.png).
- slide1.xml.rels now has one image relationship (rIdO1 -> the logo) instead of six; the logo's blip changed from
  rIdO4 to rIdO1. That is the only change in slide1.xml. [Content_Types].xml unchanged. File size A 53286 -> 47534 bytes,
  B 51770 -> 46018 bytes.
- Nothing wrong seen.

## Look against v2.74 (renders in /tmp/C10-strategy-table-truenorth-fix6/)

- A and B render pixel-identical to the previous (fix 5) build, so the look is unchanged: A matches the original as
  v2.74 (with the fix-1 text differences in the four columns noted in report-fix1.md), B as v2.74.
- Lint not re-run: slide XML differs only in the logo's relationship id.
