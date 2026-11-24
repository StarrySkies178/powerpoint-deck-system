# C04 two charts (E-Cluster): open-book mimic report

(Written by the builder; saved by the run's chat because the builder's file tool refused report files.)

## Build A (same content)

`A/build.js` draws the frame with the harness (`L.start({ ref: "Case-2019-E-Cluster" })`). `A/build.py` then places the stored objects at their source positions (box = stored bbox, not scaled), with `colours="original"` and `scale_text=False`.

**Stored objects placed**
- `case19-ecluster-004p2`, as it is, with one change: element 6 (the hand-drawn ring) is set to red CC0000. It is stored as `accent1` and its `role_src` has no red, so `colours="original"` makes it navy.
- `case19-ecluster-004p3`, as it is.
- `case19-ecluster-004p4`, as it is: cards, icons (pictures and shapes from the deck), dividers, the panel-3 rule and chip 3.
- `case19-ecluster-004`, a subset of elements 1, 3, 4, 5, 10-14, 18, 23, 29, 30, 32 and 36-42: the logo, chips 1 and 2, the panel headings, the exhibit titles, 998 / 5% / 7%, the panel-3 heading and the whole 2013/2018 revenue chart with its CAGR arrow and bubble. The parts alone are incomplete: 004p2 has no 998, 5%, 7%, CAGR header or axis labels, and 004p3 has no "2018" caption.

**Redrawn natively in build.js, and why**
- The CAGR header and the 9% / 13% row. Stored element 26 lays these out with tab stops in one text box, and LibreOffice renders it scrambled.
- The chart-1 axis labels, also on tab stops, which land up to 0.1 in off. The first paragraph of element 30 is blanked; its second paragraph (the panel-3 heading) is kept.
- The panel heading rules 1 and 2, the grey divider in panel 2, the footer note and the full-width footer rule. None of the 004 objects contains them.

**Post-fixes on the candidate file only (no framework file changed)**
- The layout band set to the original's 202C4F (the profile says 08163B).
- The layout's single rule at y 1.74 (x 4.6 to 13.09) removed; it bridges the gap between panels 1 and 2, where the original has two separate rules.
- The title gets a 0.35 in left inset, so it wraps after "customer" as in the original.
- Source line italic, page number bold navy, breadcrumb arrows plain (the second one grey).
- `place()` turns off wrapping for every label of 3 words or fewer. Two-word labels get the source's square wrap back, so "Fine / jewelry" wraps as in the original.

**Result:** overlaid on original.png, A matches almost exactly; only LibreOffice's text widths differ slightly.

## Build B (changed content, same design)

A fictional watch brand. Each chart has one more item than the original: 4 periods instead of 3, 3 years instead of 2, 3 segments instead of 2. All numbers are new and the CAGRs are consistent with them. The cards stay at 3.

**Reused from the stored objects**
- `004p2`: the row labels (Smart / Classic watches), the Total row, 1% and 4%, and the red ring on the same cell. The columns and the 532 / 722 labels are dropped.
- `004p3`: the break mark (its two value ticks dropped) and the Classic / 66% label pair (label widened, right-aligned, moved down 0.12 in, indent removed).
- `004p4`: all three cards with their icons, refilled.
- `004`: the logo, chips, headings, exhibit titles (two widened to 2.5 in), 5% / 2%, the "2018" caption and the panel-3 heading. The CAGR arrow (group 39) is ungrouped: its shaft is stretched over three bars and its head moved.

**Redrawn natively in build.js**
- The 4 stacked columns, the 3 revenue bars and the 3 share-column segments, with ticks and labels, in the original's form: plain rectangles, no value axis, totals above, `//` break marks.
- The CAGR header and smart-watch row, the rules, the divider and the footer.

**What broke or needed fixing by hand**
- `extend()` refuses all three parts and names generator `labelledRows` each time (004p2 to 4: "only the labels repeat"; 004p3 to 3: "no repeated part"; 004p4 to 4 or 2: "layout not a regular row/column"). `labelledRows` is the wrong builder: the slide's pattern tag is `labelled-rows` (marked `auto`), but the parts are a stacked chart with a CAGR table, a 100% column and a card row.
- The right builders would be `stackedCagr` and `shareColumn`, but neither draws this deck's form (`stackedCagr` makes a native chart with grey series, legend squares and an ellipse; `shareColumn` puts the labels as "66% Classic" on one side). So the charts were drawn by hand.
- The vectorised columns of 004p2 and 004p3 are single multi-path freeforms, so new values always mean redrawing them.
- `set_texts()` cannot refill the cards: it gives every paragraph the first paragraph's format (italic card bodies turn bold) and sorts chip "3" first. A per-paragraph refill was used.
- The stored label boxes are only as wide as the old words, so new words broke mid-word ("watche/s", "Clas/sic"). They had to be widened. A leftover first-line indent broke "Classic" even with wrapping off.
- Text boxes laid out with tab stops do not survive LibreOffice; drawn natively in both builds.

## Lint (`--profile Style/refs/Case-2019-E-Cluster.profile.json`)

- **A:** 1 error, 1 warning.
- **B:** 1 error, 1 warning.

**The error** reads "title: left edge 0.00 in, style is 0.00 in". The check adds the box's 0.35 in inset, but the message prints only the box position. The real conflict is with the profile: its title `left` is 0.00, while the original's title text starts at 0.35 in. Left in place to keep the match with the original.

**The warning** is "smallest body text 10 pt": the footnote, 10 pt italic in the original too.
