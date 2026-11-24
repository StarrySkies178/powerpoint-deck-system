# Roadmap step 1.7: slides for Mike to rate

**For Mike, the rater.** 60 slide pictures, `001.png` to `060.png`, 1920 x 1080 each. Rate each one **pass or fail, with one line of reason**, in `ratings.csv` (one row per file is already there). About an hour. Rate each picture on its own, as a slide you would or would not accept in a deck; do not try to guess where it came from.

**`key.json` must not be shown to the rater and must not be opened before the 60 ratings are in.** It says where each picture came from. Whoever hands the folder to Mike gives him only the PNGs, this README and `ratings.csv`; no chat rates anything.

## How the set was made (for whoever scores the ratings afterwards)

- **50 different slides:** 25 from reference decks and 25 built by the system, then **10 of them shown a second time** (5 reference, 5 system), to measure how consistent the ratings are. 60 files in all.
- **Reference slides:** 25 content slides from 8 decks in `Templates/` (case-competition decks 2017 to 2020), at most 4 per deck, picked at random with a fixed seed among content slides (cover, agenda, divider and appendix-picture slides skipped by eye). None is one of the 10 benchmark targets of the deck-as-reference cases, and TrueNorth (whose slide 18 repeats a target) is not used.
- **System slides:** 6 from the board deck, 4 from the Chinese management deck and 4 from the investment committee deck of roadmap 1.5; 6 from sample deck v0.6; 5 diagnosis builds of roadmap 1.4.
- **Order:** shuffled with a fixed seed (1724); a repeated slide is at least 10 places from its first showing.
- **Pictures (redrawn in v2.45):** each rendered straight to 1920 px wide from a PDF, never scaled down from a larger image. Every slide whose source is a .pptx (50 of the 60 files) is drawn from a PDF that **Microsoft PowerPoint on the Mac** exported (`ppt-pdf/` here and `bench/originals-powerpoint/`); the 10 files from decks that only exist as PDF use that original PDF, unchanged. The first set was drawn by LibreOffice with substitute fonts (the reference decks use Arial MT, Verdana, Tahoma and Calibri, which the Linux machine does not have), so labels on the reference slides were broken and Mike noticed. That set is kept in `old-libreoffice/` and must not be rated. `key.json` has a `renderer` field per file. A reference whose page is not exactly 16:9 was rendered to fit 1920 x 1080 and padded with its own edge colour (18 files; `padded_from` in the key), so the picture size does not give the source away. Nothing was added to any picture.
- **What can still give the source away:** the slides themselves. Reference slides carry their teams' logos and client names; the 1.5 test-deck slides say "fictional" on their source lines; diagnosis builds copy the reference decks' look. Nothing was masked, because masking would change what is being rated.

## Files

| File | What |
|---|---|
| `001.png` … `060.png` | The slides to rate |
| `ratings.csv` | Mike's answers: `file, pass_or_fail, reason` |
| `rate.html` | The easy way to rate (added v2.37): open it in a browser on the Mac. One slide at a time, Pass or Fail, one line of reason. Ratings stay in that browser; when done, "Copy all ratings as text" and paste into the chat. It shows nothing about where a slide came from and does not read `key.json` |
| `key.json` | Source of each file (deck, slide, repeat of which file). **Not for the rater** |
| `ppt-pdf/` | PowerPoint PDF exports the pictures are drawn from (v2.45) |
| `old-libreoffice/` | The first, wrongly drawn pictures. Kept for the record; not to be rated |
