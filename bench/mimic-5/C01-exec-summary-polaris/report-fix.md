# C01 exec summary (Polaris): store fix 2 re-run (objstore.extract keeps zero-width and zero-height lines)

case19-polaris-002 now holds 26 shapes (was 18). New elements (O.elements): 4, 8, 12 the white lines over each arrow's left edge;
16 and 17 the dashed dividers (long, short); 18 and 24 the grey rules under the double chevrons; 20 the rule over the bar.
The footer rule (y 6598919) and the short rule between the logos are in the footer zone, which the store leaves to the frame, so they stay drawn.

## Hand code removed
- **A/build.js** (39 to 33 lines): the five `line()` calls for the 2 dashed dividers, the 2 chevron rules and the bar rule, and the
  `GREY` constant. The footer rule and the logo separator stay.
- **A/build.py** (67 to 61 lines): in `tidy()`, the block that opened each header arrow's outline on the left (removed the last
  `lnTo` and `close` of the 7-point path), and its docstring sentence. The stored white lines now hide that edge, as on the original.
- **B/build.js** (57 to 53 lines): the dividers drawn per column (long/short), the rules drawn per implication, the bar rule, and
  `GREY`. The footer rule stays. layout.json is unchanged (same content and geometry).
- **B/build.py** (151 to 164 lines): the same arrow-opening block in `tidy()` is removed. Lines were added because B re-lays the
  object out for 4 columns (extend() still refuses it: a different fault), and the stored lines now have to be laid out with it:
  - selectors re-mapped: the old ones caught the new lines (dividers and white lines matched the arrow filter, the rules matched
    the chevron filter, the bar rule was taken as the red bar). Lines are now split off first (`lines`, `shapes`), then
    `whites`, `divs`, `rules` picked by position;
  - each column unit is now (arrow, white line, head, list), so the white line moves and clones with its arrow;
  - dividers: the stored long and short ones are moved to the 3 divider positions (long where an implication ends), the short
    one cloned for the extra column;
  - each implication's rule is the stored rule moved and stretched to its span (cloned if more implications, dropped if fewer).
  Net: 4 lines of tidy() and 6 drawn lines out; about 17 lines of layout for stored lines in.

## Still needing hand code for this fault
None. Every line on the exhibit comes from the stored object.

## What the fixed tool did
extract() is correct: all 8 lines kept, with their colour (accent5, resolved to 5C5C5C by colours="original"), width, dash and
z-order (each white line straight after its arrow). One related oddity, not in extract(): `objstore._set_xfrm` sets
`cx`/`cy` to `max(1, w)` / `max(1, h)`. Moving a stored line with it (B: `xf(div, x=...)`, `xf(rule, x=, w=)`) turns its 0 extent
into 1 EMU (e.g. divider `cx="0"` in, `cx="1"` out; rule `cy="0"` in, `cy="1"` out). Invisible in the render (1 EMU), left as the tool makes it.

## Look against v2.74 (LibreOffice, 96 dpi, /tmp/C01-exec-summary-polaris-fix/)
- **A: better, slightly.** Only the lines changed. The dividers and rules are now 1 px wide at the original's pixel columns and
  rows with the original's dash rhythm (v2.74's drawn lines were 2 px in places, and the long divider's dashes partly ran together).
  Arrow left edges are hidden as before. Difference from original.png (sum of grey levels): 8145969 (v2.74) to 7981615;
  exhibit rows 195 to 611: 5032101 to 4871856. Text and everything else unchanged.
- **B: as good as v2.74, lines slightly crisper** in the same way as A. Dividers, rules, chevrons and arrow edges sit where v2.74
  drew them. The other differences are only those report-fix1.md and report-fix-prev.md already list.
- deck_lint (Style/refs/Case-2019-Polaris.profile.json): A and B 0 errors, 0 warnings.
