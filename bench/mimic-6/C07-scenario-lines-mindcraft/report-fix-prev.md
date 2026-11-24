# C07 scenario lines (Mindcraft): store fix 6 re-run (element() and place() keep only used media)

## Hand code removed

- `common.py`, inside `run()` / `put()`: the line after `O.element(slide, i)` that filtered `el["media"]` down to the
  names found as `MEDIA:<name>` in the element XML, with its two comment lines (fault 1 of report-v2.74: element() kept
  the whole slide's 27 marker PNGs and place() copied them all into the deck, linked but never drawn).
  Now `el = O.element(slide, i)` alone, with a one-line comment.
- Line counts before / after: `common.py` 61 / 58. `common.js` 70, `A/build.js` 29, `B/build.js` 31, `A/build.py` 14,
  `B/build.py` 15: unchanged. Content of A and B unchanged.

## Hand code still needed for this fault

None. Other work-arounds stay: bg2 recolour of the takeaway fill (fault 2), widening refilled headings to the panel rule
(fault 4), and the native-chart `midCat` patch (not a store fault).

## What the fixed tool did

Right. `O.element()` on case19-mindcraft-014 (slide media list: 27 PNGs) returns `media == []` for every placed element
(e0-e7, e23, e27, e28, e36, e37); none of them draws a picture. `unzip -l` of A/candidate.pptx and B/candidate.pptx shows
no `ppt/media/` part at all, and slide1.xml.rels links only the two charts, the layout and the notes slide.
Nothing wrong found.

## Look against v2.74 (renders in /tmp/C07-scenario-lines-mindcraft-fix/: new/, old/ = v2.74, prev/ = the candidates
## as found in this folder before the rebuild)

- A: the same as v2.74 and as close to original.png. Only difference: about 2,800 px of sub-pixel noise inside the left
  takeaway box (bullet 2 uses its stored paragraph's own marL, as in fix 1).
- B: the same as v2.74 apart from the return label, whose "2)" is superscript (the fix-1 gain, kept). Takeaway wraps
  match v2.74.
- Note: the candidates left in this folder (prev/) had been built with an older objstore and showed broken hanging
  indents in the takeaway bullets of A and B; the rebuild with the current tool no longer has them.
