# C05 timeline (E-Cluster): store fix 6 re-run (objstore element/place media)

## Hand code removed

The media work-around in `place_risks()` (A/build.py and B/build.py): the comment and the loop that set `o["media"] = []` for
lifted elements without a picture before `place()` (4 lines in each file).

- A/build.py: 90 lines before, 86 after.
- B/build.py: 113 lines before, 109 after.
- build.js (A 85, B 87 lines) unchanged; it never had media code.

No other hand code was needed for this fault. The other work-arounds stay as they were: `fix_frame()` (title band, crumb
arrows, page number, showMasterSp), `keep_box_sizes()` (spAutoFit to noAutofit), `centre_box()` (B only, label box indent).

## What the fixed tool did

- `O.get(case19-ecluster-017)["media"]` = `['d3938da275881aec.jpg']`. `element(obj, 0)` and `element(obj, 1)` (the two text
  boxes) now return `media = []`; `element(obj, 2)` (the Gantt picture) keeps the JPEG. Correct.
- `place()` of the two text boxes copies no picture: `unzip -l` shows no `ppt/media/` part in A/candidate.pptx or
  B/candidate.pptx (48 parts each), and slide1.xml.rels holds only the layout and notes relationships.
- Nothing wrong found in the fixed tool.

## Look against v2.74

Rendered with LibreOffice into /tmp/C05-timeline-ecluster-fix/ (A, B, v274A, v274B).

- **A:** slide1.xml is byte-identical to v2.74 and the render is pixel-identical, so A matches the original exactly as well as before.
- **B:** same as v2.74 except the risk boxes. This difference does not come from fix 6. It comes from the current `set_texts`
  (a different store change): it no longer copies the first bullet's spacing (4.7 pt before) to every refilled bullet. Bullets 2
  and 3 now keep the spacing of the stored bullets in their positions (3.35 and 3.4 pt instead of 4.7 pt; `centre_box()`
  still removes it from bullet 1). It also drops the -0.1 pt letter
  spacing on "Key Risks". As a result the three bullets sit a little closer together and a little higher in the box. This
  looks as good as v2.74; the tighter list is arguably closer to the original's bullet spacing. Text and numbers are unchanged.
