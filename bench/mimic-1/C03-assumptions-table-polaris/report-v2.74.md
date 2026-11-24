# C03 assumptions table (Polaris): open-book mimic report

(Written by the builder; saved by the run's chat because the builder's file tool refused report files.)

## Stored objects placed
- case19-polaris-022 is the slide's only stored object: one native table of 12 rows x 6 columns, holding all three scenario blocks.
  - A: placed unchanged at its own bbox (0.37, 1.45, 12.61 x 4.60 in) with colours="original" and no scaling. The text and numbers are the original's.
  - B: extended with table_size(cols=7), giving one more year column. The columns were then re-spaced, every cell refilled, and the table placed the same way.
- No other stored object was needed. Neither build contains a picture (0 media files, 0 p:pic).

## Redrawn instead, and why
- Frame: the title, red rule, source line and page number come from the harness (L.start({ ref: "Case-2019-Polaris" })). They are not stored objects.
- Grey footer rule: drawn as a line in build.js, because the profile's master does not include it. Measured on original-1920.png at y 7.205 in, x 0 to 12.96 in, #B4B4B4.
- Logo slot (PANDORA | Polaris): two plain text labels with a thin grey divider. The logos are pictures in the source deck, but frame logos are stripped from stored objects and Brand/logos has no file. Objects/images.md says to write the company name in the logo slot when there is no official file. This is the main visible difference from the original.
- Page number 22: the slide-number field is replaced by the static text "22", and firstSlideNum="22" is also set. LibreOffice ignores firstSlideNum, so the field alone would show 1.

## Fixes done outside objstore (in this folder's mimic_util.py)
1. Stray rule under every "#stores" row in LibreOffice. The stored cells set only lnT on the #stores row and nothing on the rows under it. LibreOffice then draws a black rule between "#stores" and "Organic Growth(%)", which PowerPoint does not. Fix: every cell side left unset gets an explicit `<a:lnX w="0"><a:noFill/></a:lnX>`. PowerPoint looks the same either way.
2. set_texts and slots do not reach table cells. They only walk p:txBody, while table cells use a:txBody. slots(obj) returns [] and set_texts leaves the XML unchanged. The table is refilled by fill_table, a cell-by-cell filler that keeps each cell's run formatting (bold headers, 14 pt, alignment).

## Build B: what changed
- Title: "Backup: Key assumptions behind the revenue model", with a new source line.
- Scenarios: Upside, Central and Downside Case.
- Row labels: #outlets, Like-for-like Growth(%), E-commerce Growth(%).
- Years: 2024 to 2029, so six year columns instead of five.
- All 54 numbers are new.

What broke or needed manual fixing when the column was added:
- table_size(cols=7) spaces the year columns unevenly. It copies the last column and splits the width equally across the number columns. But the source pushes its numbers left with a paragraph right indent (marR about 0.74 in) on columns 2 to 5, and the last column has none. After the split, the old columns keep that indent and the new and last columns do not. The gap between the 4th and 5th number columns would be about 2.34 in, against 1.59 in elsewhere.
- Fix (respace_columns): the label column stays 3.04 in and the first number column ends where it did in the original. The other five number columns are equal at 1.55 in, and marR is 0 on all number cells, so the numbers end on the column edges.
- table_size writes the id suffix ".tNonex7" when rows is not given, because it formats None into the id. Cosmetic.
- Nothing else needed fixing. Only columns changed, so the table keeps its height and the vertical layout is the same.

## Check
- Both builds were rendered with LibreOffice at 96 dpi and compared side by side with original.png.
- In A's overlay, the table rows and columns sit within 1 to 2 px of the original. The only visible difference is the logo slot.
- deck_lint with the Polaris profile: A 0 errors, 1 warning ("thin", 87 words, the original's own text); B 0 errors, 0 warnings.
