# Roadmap 4.2 Run 5: comparison pictures after Run 5

Made 2026-11-24 for Mike, in the same form as `bench/review-run2/` (`make.py` here rebuilds them: `python3 bench/review-run5/make.py run5 bench/review-run5`).

- **Left:** the original slide, from `bench/originals-powerpoint/<deck>-ppt.pdf`, exported by Microsoft PowerPoint on the Mac and rendered 1920 px wide. The TrueNorth slides (C09, C10) are 4:3, so their left half is taller.
- **Right:** the first fresh blind build of each case made under the Run 5 rules (`phase4/run5/<case>/r1/candidate.pptx`), rendered 1920 px wide by LibreOffice in the official environment.
- Only the case id is on each image. No scores are shown.

**Run 5 (no blank gaps and no blank cells) was measured and not kept.** C05's mean overlap before the floor fell from 0.803 to 0.726 against run1, more than the 0.05 band allows, so the v2.67 files were restored. These builds were still made under the Run 5 rules: a lint error for an empty panel and for a blank cell, `table()` writing "–" in an empty value cell, and a sentence in DECK-SYSTEM.md. The tried files are in `archive/*_tried-not-kept-run5_2026-11-24.*`.

**The comparison judge answered first.** Its ten answers are in `bench/judge-compare/predictions-run5.csv`, written at 2026-11-24 07:52:57 UTC, before these pictures went to Mike: 9 OK, and NOT OK on C08. Its agreement with him is counted when he answers (`bench/judge-compare/tools/agree.py`).
