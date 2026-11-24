# Roadmap 4.2 Run 2a: the 10 rated table slides, before and after

Made 2026-11-24 (v2.57) for Mike. In the blind rating of roadmap 1.7 (`bench/rating-1.7/results-round-1b.md`) he failed all 10 house-style slides that carried a table. Run 2a replaced the one house table (solid navy header band, white bold text, hairline rows, one light-blue row, 11 pt) with five table forms taken from the reference decks' own tables (`Style/table-forms.md`). These are the same 10 slides rebuilt with the new forms: same content, same decks, same generators otherwise.

- **Left:** the slide as Mike rated it (`bench/rating-1.7/<id>.png`: drawn from the PDF that Microsoft PowerPoint on the Mac exported, 1920 px wide).
- **Right:** the rebuilt slide, 1920 px wide, from a PDF that **Microsoft PowerPoint on the Mac exported** (File > Export, PDF) for 9 of the 10. **022 is a LibreOffice render** (`build/doisky-new-libreoffice.pdf`): its layout was corrected after the PowerPoint export, and PowerPoint could not be reached again without taking over the screen while someone was using the Mac. LibreOffice uses substitute fonts, so line breaks on 022 can differ slightly from PowerPoint.
- Only the file id is on each image. No scores.

| Id | Deck, slide | Table form used | Other change made so the table is not a low strip or squeezed |
|---|---|---|---|
| 013 | Northwind IC, 2 | `rowblocks` (row labels in grey blocks) | none |
| 015 | 华拓精密, 7 | `rowblocks` with two groups (本月决定 in the main colour, 项目组推进 in grey) | none |
| 017 | Sample v0.6, 13 | `rowblocks` | layout T2B1 → L2R1: the table has the right half at full height instead of a 1.3 in strip |
| 021 | Doi Sky, 6 | `marks` (premium demand as a bar beside its value; the chosen city outlined) | none |
| 022 | Doi Sky, 10 | `ruled` (downside cases) and `rowblocks` (assumptions) | layout T2B1 → L2R1 with custom panel heights: no full-width strip |
| 025 | 华拓精密, 3 | `marks` (the two delays as grey chips; MES row outlined) | the table takes the left half at full height (was a full-width strip) |
| 026 | Sample v0.6, 10 | `panels` (Partner A/B/C as column panels under header boxes, Partner A in the accent) | the table panel is 62% wide instead of half |
| 030 | Northwind IC, 4 | `marks` (the two shortfalls as chips) | none |
| 034 | Northwind IC, 5 | `marks` (likelihood, impact and residual as Harvey balls with a legend) | none |
| 048 | Northwind IC, 3 | `panels` (the table turned: funds as columns, metrics as rows; Fund II highlighted) | the table takes the left half at full height (was a full-width strip) |

Table text is 14 pt everywhere (the house body size; the old tables were 11 pt). Nothing outside the tables was changed on purpose; chart look, other text sizes and colour use are left for their own runs (the waterfalls on 017 and 022 are as cramped as before).

`build/` holds the four rebuilt decks (`.pptx`), their PowerPoint PDFs (`doisky-new-ppt.pdf` was exported before the slide 10 layout fix, so its page 10 shows the earlier layout; the other pages match the .pptx) and the build scripts (copies of the 1.5 deck scripts and `Generators/build_sample.js` with only the table calls and the layouts above changed; they load the generators from the cloud working copy path, so set the paths before running them here).
