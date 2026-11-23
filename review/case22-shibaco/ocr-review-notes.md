# OCR review notes: case22-shibaco

How the rebuilt deck in Templates/ was made (v2.38, 2026-11-24):

1. Rebuilt from `pages/` with `Generators/rebuild_slides.py` (OCR cached in `ocr-cache/`, so the line ids stay the same). The first pass is `rebuild-info-before-review.json`.
2. Round 1 review, by eye on the review sheets (every number line, every suspect line, every missed-number and missed-word candidate): `ocr-corrections.json`, ids from `rebuild-info-before-review.json`: 81 lines corrected or removed, 41 numbers and words added.
3. Round 2: the corrected rebuild was compared line by line with the reviewed text; `ocr-corrections-round2.json` (ids from `rebuild-info-round1.json`) fixes what the new pass read differently. Rebuilt with all rounds together.
4. Round 3: the corrected rebuild was compared line by line with the reviewed text; `ocr-corrections-round3.json` (ids from `rebuild-info-round2.json`) fixes what the new pass read differently. Rebuilt with all rounds together.
5. Final rebuild: `rebuild-info.json` and `rebuild-review.jpg`. Note: edit boxes were snapped to the OCR line they came from (within 4 px), because `rebuild-info` keeps rounded boxes and 1–2 px wide lines (dashed rules read as "1") otherwise miss; see `logs/proposals.md`.

## Still not perfect

- 15: faded photo collage behind the contents traced into blobs
