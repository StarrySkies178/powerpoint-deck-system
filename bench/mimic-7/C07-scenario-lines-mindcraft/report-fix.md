# C07 scenario lines (Mindcraft): store fix 3 re-run (colour roles: exact original colours with colours="original")

## Hand code removed

- `common.py`, `run()` / `put()`: the `recolour` parameter of `put()`, the line `if recolour: el = O.recolour(el, recolour)`,
  and the `recolour={"bg2": "#F1F1F1"}` on both takeaway calls (e27, e36), with its comment (fault 2 of report-v2.74: the
  takeaway fill came back as bg2 = D5D5D5, so it was set to the profile grey F1F1F1). The comment now says the fill comes
  back as its own EFEFEF.
- Line counts before / after: `common.py` 58 / 57. `common.js` 70, `A/build.js` 29, `B/build.js` 31, `A/build.py` 14,
  `B/build.py` 15: unchanged. Content of A and B unchanged.
- Element indices of the re-extracted case19-mindcraft-014 checked with `O.elements()`: e0-e7, e23, e27, e28, e36, e37 are
  still the same shapes (arrows, chips, rules, headings, chart titles, takeaways, return label). No re-mapping needed.

## Hand code still needed for this fault

None. Other work-arounds stay: widening refilled headings to the panel rule (fault 4) and the native-chart `midCat` patch
(not a store fault).

## What the fixed tool did

Right for colours. Both takeaway boxes now have `<a:srgbClr val="EFEFEF"/>` in A and B; the render samples 239,239,239,
the same as original.png (v2.74: 241, the F1F1F1 stand-in). No `urn:deck-system` attribute is left in the slide XML.

Not this fault, but seen after the re-extraction (store fix 2): in A the takeaway texts are the stored words unchanged, so
`set_texts()` keeps the stored runs exactly ("unchanged text keeps its original runs"). Those runs are the PDF import's:
one run per word and a TAB run where the PDF broke the line ("expected, " TAB "offline", "the " TAB "offline", and others).
With the new text wrap the tabs land mid-line: A's left bullet 2 shows "two key ... value creation levers" with a wide gap,
and the right box's wrapped lines jump to the tab stop (indented further than the bullet text). Bullet 2 of the left box
also takes its stored marL 212090 / tab 213360 and the right box's bullet 2 marR 410845. Left as the tool makes it.
B is not affected (its text is new, so the runs are rebuilt).

## Look against v2.74 (renders in /tmp/C07-scenario-lines-mindcraft-fix/: new/, old/ = v2.74)

- A: fill better (EFEFEF, matches the original exactly), but takeaway text worse than v2.74 because of the kept PDF tab runs
  above (uneven gaps and indents in both boxes). Everything else the same (a few px of anti-alias noise in chart title 1 and
  the return label).
- B: fill EFEFEF (v2.74 F1F1F1, hardly visible); return label "2)" superscript as in fix 1 (better than v2.74); right
  takeaway wraps as in fix 1 revision 2 ("~2.1-" / "year payback" hyphen break, slightly worse than v2.74). Overall as good.

## Revision 2 (by the run's chat)

The uneven takeaway text in A came from store fix 1, not from fix 3: set_texts treated a paragraph as "unchanged" when its
words matched with all whitespace ignored, so it kept the PDF's word-by-word runs with TAB characters at the old line
breaks. set_texts now ignores only repeated spaces (a tab is not a space), so these paragraphs are refilled as clean text
again. A and B rebuilt: A's takeaways render as in v2.74 (checked side by side), with the original EFEFEF fill.
