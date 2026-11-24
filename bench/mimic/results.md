# Open-book mimic test (roadmap 4.2, v2.72): results

Each of the ten C slides went to one fresh builder. It was given the original slide's picture (PowerPoint render), the slide's stored objects in Objects/store and the deck's profile. It built A (same content) and B (same object, changed content, one item more or fewer). The builder's own words are in `<case>/report.md`; its code is in `<case>/A` and `<case>/B`.

No builder, rule or framework file was changed. Every workaround lives in the case folder.

## How scored

- `score.py` scores A with the unchanged scorer (`bench_score.score_case`, `layout_raw` against the case's `original.png`) and makes the review pictures.
- **Official numbers** (Mac, LibreOffice 26.2): `python3 bench/mimic/score.py --official`, in `results-official.json`. `--official` writes numbers only and rewrites no picture.
- The review pictures and the cloud numbers (`results.json`) were made in the cloud working copy (LibreOffice 24.2) while the Mac was offline. The pictures Mike sees are those cloud ones; the judge's picture md5s are in `bench/judge-compare/predictions-mimic.csv`, and every installed file's md5 is in `md5s.txt` (A/candidate.png and the copied case files were re-made by the official run).
- For scale only: the blind-rebuild baseline (`bench/phase4/baseline.md`) is 0.41 to 0.85 per case. The two are not the same test: here the builder sees the original.

## Per case

| Case | layout_raw A (official, Mac) | cloud | standards (official) | pictures in A |
|---|---|---|---|---|
| C01 | 0.977 | 0.977 | 11/11 | 2 logos |
| C02 | 0.914 | 0.913 | 11/11 | none |
| C03 | 0.984 | 0.976 | 10/10 | none |
| C04 | 0.990 | 0.990 | 10/11 | 4 deck icons |
| C05 | 0.980 | 0.980 | 7/10 | none |
| C06 | 0.981 | 0.981 | 10/10 | photo, gradient, logo |
| C07 | 0.943 | 0.948 | 9/12 | none |
| C08 | 0.947 | 0.939 | 11/11 | logo, ">>" mark |
| C09 | 0.988 | 0.988 | 9/10 | logo |
| C10 | 0.998 | 0.996 | 11/11 | logo |

Standards that failed are the original's own design, kept on purpose to match it (title inset, footnote size, the deck's fonts and colours). Each report says which.

**No picture of a slide is embedded.** Every picture in A and B is one the original deck also has as a picture: logos, the deck's icons, C08's ">>" mark, and in C06 the background photo and the full-slide red-to-grey gradient over it (checked: a plain gradient, no text). C10's file also carries 5 unused media parts (see failure 3 below); they are not drawn.

## Objects placed, what was redrawn (short; details in each report.md)

- **C01** `case19-polaris-002` whole. Redrawn: all 7 straight lines (the store drops them), page number. B: 4 stage columns instead of 3.
- **C02** `case19-polaris-016` minus its table. Redrawn: the label column and Gantt grid (a PDF-import table that falls apart in LibreOffice), missing rules, logo label. B: 12 Gantt rows instead of 11.
- **C03** `case19-polaris-022` (native table) whole. Redrawn: footer rule, logo label. B: 6 year columns instead of 5 with `table_size`.
- **C04** `004p2`, `004p3`, `004p4` and a subset of `004`. Redrawn: tab-stop text boxes (CAGR header, axis labels), rules. B: redraws all columns and bars (stored as single freeforms); 4 periods, 3 years, 3 segments.
- **C05** two text boxes of `case19-ecluster-017`. Redrawn: the whole Gantt as a native table (the stored one is a picture; the vectorised `017v1` is unusable), the logo as shapes. B: 9 rows instead of 8, 3 risks instead of 4.
- **C06** `case19-mindcraft-003` whole. Redrawn: title only. B: 5 paragraphs instead of 4.
- **C07** 13 elements of `case19-mindcraft-014`. Redrawn: both line charts as native editable charts (stored lines are paths, markers are PNGs), axis labels, legend. B: a fourth scenario line in both charts.
- **C08** `case19-mindcraft-015` whole, markers and labels rebuilt from its own circles and boxes. Redrawn: crumb text, page number; heat-map greys set by hand. B: 9 risks, 5 table rows.
- **C09** `case-truenorth-pola-022` plus the logo from `004`. Redrawn: every label (the store holds 46 pictures of text), legend squares. B: 10 years instead of 9.
- **C10** `case-truenorth-pola-008` plus the logo. Redrawn: crumb, source band, column header labels. B: 5 journey rows instead of 4.

## What broke in B, and store failures found (real reasons, proposal rows added)

1. **`extend()` names the wrong generator** on C01 (issueTree), C04 (labelledRows), C09 (matrix), C10 (targetOnion): the slides' pattern tags are wrong, so the hint points to a different form. Builders re-laid the objects by hand.
2. **`set_texts()` uses one paragraph's format for all paragraphs and keeps only the first run** (C01, C02, C04, C06, C07, C10): bold heads and plain bullets merge, italic bodies turn bold, red "Mitigation:" runs and superscripts are lost. Every builder wrote its own per-paragraph refill.
3. **`element()` keeps the parent's whole media list**, so `place()` copies unused pictures into the deck (C05, C07; C10 still carries 5).
4. **`extract` drops every zero-width or zero-height shape**, so straight lines and dividers from PDF-imported references are lost (C01, C02, C04).
5. **Colour roles merge different greys** (C02, C07, C08, C09; C08's heat map collapses from 9 greys to 4) and **lose reds stored as accent1** (C04's ring).
6. **`place()` autofit shrinks text even at scale 1** (C01, C02, C08): builders used `scale_text=False`.
7. **Text stored as pictures or glyph paths** (C09 labels, C07 chart markers, C05 Gantt), and PDF-import text split per word with letter spacing and `marR` line breaks (C02, C08, C10).
8. `set_texts` and `slots` do not reach table cells (C03); `table_size` leaves old column indents and writes ".tNonex7" in the id (C03).
9. Harness: the default crumb separator "▶" renders as an orange emoji in LibreOffice (C05, C10); LibreOffice ignores `firstSlideNum`, so page numbers became text in most cases.
