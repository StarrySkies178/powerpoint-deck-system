# Roadmap 4.2 Run 7: comparison pictures after Run 7

Made 2026-11-24 for Mike, in the same form as `bench/review-run5/`. To rebuild them: `python3 bench/review-run7/make.py run7 bench/review-run7`.

- **Left:** the original slide, exported to PDF by Microsoft PowerPoint on the Mac and rendered 1920 px wide.
- **Right:** the first fresh blind build of each case made under the Run 7 rules (`phase4/run7/<case>/r1/candidate.pptx`), rendered 1920 px wide by LibreOffice in the official environment.
- Only the case id is on each image.

**Run 7 (charts and drawn exhibits in the reference deck's own form) was measured and not kept.** Against run1, two cases moved back by more than 0.05 on overlap before the floor:
- C05: 0.803 to 0.678
- C10: 0.853 to 0.798

Neither case uses the three new exhibit builders, but the rule applies all the same, so the v2.69 files were restored. These builds were still made under the Run 7 rules:
- `S.shareColumn`, `S.riskHeatMap` and `S.lineEnds` in `Generators/patterns_story.js`;
- one DECK-SYSTEM bullet.

The tried files are in `archive/*_tried-not-kept-run7_2026-11-24.*`.

**The comparison judge answered first, with its retuned instructions (v2).** Its ten answers are in `bench/judge-compare/predictions-run7.csv`, written 2026-11-24 08:40:03 UTC before these pictures went to Mike: 9 OK, and NOT OK on C04 ("market-size chart drawn clumsily, break marks dropped"). This is the first set judged with v2, so it is the first that counts toward the two in a row.
