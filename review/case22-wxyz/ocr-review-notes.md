# OCR review notes: case22-wxyz

How the rebuilt deck in Templates/ was made (v2.38, 2026-11-24):

1. Rebuilt from `pages/` with `Generators/rebuild_slides.py` (OCR cached in `ocr-cache/`, so the line ids stay the same). The first pass is `rebuild-info-before-review.json`.
2. Round 1 review, by eye on the review sheets (every number line, every suspect line, every missed-number and missed-word candidate): `ocr-corrections.json`, ids from `rebuild-info-before-review.json`: 69 lines corrected or removed, 61 numbers and words added.
3. Round 2: the corrected rebuild was compared line by line with the reviewed text; `ocr-corrections-round2.json` (ids from `rebuild-info-round1.json`) fixes what the new pass read differently. Rebuilt with all rounds together.
4. Round 3: the corrected rebuild was compared line by line with the reviewed text; `ocr-corrections-round3.json` (ids from `rebuild-info-round2.json`) fixes what the new pass read differently. Rebuilt with all rounds together.
5. Round 4: the corrected rebuild was compared line by line with the reviewed text; `ocr-corrections-round4.json` (ids from `rebuild-info-round3.json`) fixes what the new pass read differently. Rebuilt with all rounds together.
6. Final rebuild: `rebuild-info.json` and `rebuild-review.jpg`. Note: edit boxes were snapped to the OCR line they came from (within 4 px), because `rebuild-info` keeps rounded boxes and 1–2 px wide lines (dashed rules read as "1") otherwise miss; see `logs/proposals.md`.
7. `ocr-corrections-final.json` (3 entries) applied to the finished deck with `ocr_review.py apply` (ids from `rebuild-info.json`).

## Still not perfect

- Nothing beyond the general limits: traced charts are shapes, not native charts (redraw with a builder when numbers change); real photos stay pictures.
