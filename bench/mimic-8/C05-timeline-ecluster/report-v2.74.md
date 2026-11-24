# C05 timeline (E-Cluster): open-book mimic report

(Written by the builder; saved by the run's chat because the builder's file tool refused report files.)

## Stored objects placed

- `case19-ecluster-017` has three elements: the bullet box, the "Potential Risks" label box, and the Gantt **picture**. The two text boxes are lifted with `element(obj, 0)` and `element(obj, 1)` and placed at their stored positions with `place(..., keep_aspect=False, colours="original")`. In A as is; in B both are refilled with `set_texts` (3 risks, "Key Risks") and moved down 0.11 in under the taller grid. The picture element is never placed.
- `case19-ecluster-017v1` (the vectorised Gantt) was test-placed and rejected:
  - the OCR reads "2025" for 2023;
  - the "&" is traced as a freeform, and "Marketing & Reshaping Brand" is split into two text boxes;
  - stray black triangle freeforms sit along the left edge;
  - the bars come out light blue instead of grey;
  - the labels do not line up with their rows;
  - the whole grid is one freeform, so rows cannot be added with `extend`.

## Redrawn instead, and why

- **Gantt (native shapes):** one native table forms the grid (2.25 pt outer frame, 0.75 pt inner rules, 16 pt Arial labels, bold group rows, 4.37 in label column). Five year columns of 1.336 in sit under six year labels centred on the grid lines. Year labels are 24 pt Calibri bold navy with a soft shadow. Bars are BFBFBF rectangles. All geometry measured on original-1920.png. `P.gantt` was not used because it draws navy header cells, zebra rows and cyan bars, which is not this deck's look.
- **Frame:** from `L.start`, plus fixes on the slide itself (no framework file changed): title band in the original's 202C4F (profile has 08163B); title inset 0.33 in and centred in the band; crumb separator "→" in grey (the default "▶" renders as an orange emoji); the layout's band and 1.74 in rule switched off (`showMasterSp=0`); footer rule at 7.25 in; page number bold navy "12" as text.
- **E-Cluster logo:** a picture in the deck, but stripped from the store as a frame element. Redrawn as shapes (eight rotated squares and a donut for the gear, "E▪CLUSTER" text in Times New Roman with an orange square).

## Build B (same code, new content)

A rollout plan for 2025 to 2030 with a new title, crumb, labels and bar spans. The Gantt has **9 rows instead of 8**. The risk box has **3 risks instead of 4**, labelled "Key Risks", and the page number is 9. The risk boxes follow the grid bottom (passed in layout.json).

Manual fixes needed when the content changed:
1. **Label box:** the stored label box centres "Potential Risks" with a PDF-style hanging indent and a 0.17 in top inset. With "Key Risks" the two words were staggered. `centre_box()` (B only) removes the indent and centres. The 3-bullet box is anchored in the middle.
2. **Row heights:** from a character-count rule, checked by rendering. Space is tight: one more two-line row would push the risk boxes past the footer rule.

## Problems found

- **objstore bug:** `element()` keeps the parent object's `media` list. `place()` then copies the Gantt JPEG into the deck as an unused image part, even though the lifted text boxes reference no picture. Workaround: clear `media` for elements without a picture before placing. Both decks contain no media.
- **spAutoFit:** the stored boxes have spAutoFit, and LibreOffice then shrinks the label box to its text. Switched to noAutofit after placing.
- **Lint message:** the title check adds the left inset but prints only the box x, so it reads "left edge 0.00 in, style is 0.00 in". The profile's `title.x = 0.0` does not match where this deck's title text starts (about 0.35 in).

## deck_lint (`--profile Style/refs/Case-2019-E-Cluster.profile.json`)

- **A: 4 errors, 1 warning:** Calibri year labels; Times New Roman and #F88124 in the redrawn logo; title left edge; topic-title warning (the original's own title).
- **B: 4 errors, 2 warnings:** the same, plus "thin: 76 words".

All four errors come from matching the original.
