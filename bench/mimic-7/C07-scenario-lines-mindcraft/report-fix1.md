# C07 scenario lines (Mindcraft): store fix 1 re-run (set_texts keeps paragraph and run formats)

## Hand code removed

- `common.py`, inside `run()` / `put()`: the block after `O.set_texts()` that parsed the element XML and deleted `a:spcBef`
  from every paragraph after the first (work-around for fault 3 of report-v2.74: set_texts copied paragraph 1's format, with
  its 9.9 pt space-before, to every bullet of the takeaway boxes e27 and e36). Now one line: `el = O.set_texts(el, text)`.
  Bullet 2 now takes the stored box's own paragraph 2 (no space-before, its own marL), so nothing needs stripping.
- `B/build.py`: the return label (e37) is now passed as one paragraph of runs instead of one string, so "2" and ")" land on
  the stored superscript runs 12 and 13:
  `[["Store", " ", "payback", " ", "under", " ", "base", " ", "case", " ", "", "", "2", ")", " :"]]`.
  In v2.74 the whole string went into run 1 and the "2)" lost its superscript (the second half of fault 3).
- Line counts before / after: `common.py` 69 / 61, `A/build.py` 14 / 14, `B/build.py` 14 / 15 (one comment line),
  `common.js`, `A/build.js`, `B/build.js` unchanged (70, 29, 31).

## Hand code still needed for this fault

None. Hand code for the other faults stays: media pruning after `element()` (fault 1), the bg2 recolour of the takeaway
fill (2), widening refilled headings to the panel rule (4); the native-chart `midCat` patch is not a store fault.

## What the fixed tool still does badly

- Not wrong, but awkward: "run k takes the format of original run k" counts runs by index, and this PDF-imported label stores
  one run per word and per space (15 runs, superscript at 12 and 13). B's label has one word fewer, so two empty runs had to be
  passed as padding to reach index 12. The empty runs end up in the XML as empty `a:r` elements.
- Side effect in the lint: B now gets `E body size: body text 12 pt (median), the reference's body is 14 pt` (v2.74: 0 errors).
  The body-size median counts every run at least once, so the label's 15 short 12 pt runs (it was 1 run in v2.74) tip the
  median from 14 to 12. Nothing on the slide changed size. A is unchanged: 0 errors, 1 warning (10 pt footnotes).
- The stored ")" run (e37 run 13) is a full-width "）" at 12.75 pt, upright; the new ")" takes that format, so it is upright
  while the "2" is italic. This is the stored format, as in A and the original.

## Look against v2.74 (renders in /tmp/C07-scenario-lines-mindcraft-fix/, new/ and old/)

- A: the same as v2.74 and as close to original.png. Pixel differences are only inside the left takeaway box (bullet 2's own
  marL is 0.6 px different from bullet 1's); spacing between bullets is the same as v2.74's stripped version.
- B: better. The same everywhere except the return label, whose "2)" is now superscript like A and the original
  (v2.74 B drew it as plain "2) :"). Takeaway bullets unchanged.

## Revision 2 (set_texts revised: runs grouped by format, unchanged text kept, spacer paragraphs kept, marR dropped)

- Calls changed: only B's return label. The stored label's 15 per-word runs now count as 4 formats (text, superscript "2",
  superscript "）", ":"), so the two empty padding runs are gone: `[["Store payback under base case ", "2", ")", " :"]]`.
  The output has 4 runs, "2" and ")" superscript. `common.py` and `A/build.py` unchanged (61, 14, 15 lines as above).
  No `{"lvl": n}` entries and no spacer paragraphs in this case, so points (1) and (4) do not apply.
- A: pixel-identical to Revision 1 (the only refilled text that changed is the chart titles and bullet 2 of each
  takeaway; their stored paragraphs had no marR). Same as v2.74 and the original apart from the sub-pixel indent noted above.
- B: right takeaway changed. Its stored paragraph 1 had marR 283845 (0.3 in, a PDF line-break margin); with marR now dropped
  the text runs to the box's right edge, as in the left box. Bullet 1 now wraps after "in the" (was after "in"), and
  bullet 2 breaks as "~2.1-" / "year payback" (LibreOffice breaks at the hyphen). Not worse in fill, but the
  hyphen break reads slightly worse than Revision 1; the return label superscript stays as fixed in Revision 1.
- Lint: A 0 errors, 1 warning (10 pt footnotes), as v2.74. B still 1 error `body size: body text 12 pt (median), 14 pt
  reference`. Measured with bench_score.measure: v2.74 B has 103 size samples (12 at 10 pt, 39 at 12 pt, 52 at 14 pt), so its
  median sat exactly on the first 14 pt sample; the label's 3 extra runs ("2", ")", " :", each counted at least once) give
  42 at 12 pt and tip the median to 12. Nothing on the slide shrank: this is the lint weighting short runs, on a slide that
  was already at the edge.
