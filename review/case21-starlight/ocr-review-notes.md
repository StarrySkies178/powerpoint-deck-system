# OCR review notes: case21-starlight

How the rebuilt deck in Templates/ was made (v2.38, 2026-11-24):

1. Rebuilt from `pages/` with `Generators/rebuild_slides.py` (OCR cached in `ocr-cache/`, so the line ids stay the same). The first pass is `rebuild-info-before-review.json`.
2. Round 1 review, by eye on the review sheets (every number line, every suspect line, every missed-number and missed-word candidate): `ocr-corrections.json`, ids from `rebuild-info-before-review.json`: 82 lines corrected or removed, 64 numbers and words added.
3. Final rebuild: `rebuild-info.json` and `rebuild-review.jpg`. Note: edit boxes were snapped to the OCR line they came from (within 4 px), because `rebuild-info` keeps rounded boxes and 1–2 px wide lines (dashed rules read as "1") otherwise miss; see `logs/proposals.md`.
4. `ocr-corrections-final.json` (5 entries) applied to the finished deck with `ocr_review.py apply` (ids from `rebuild-info.json`).

## Fixed by hand in the finished deck

- Slide 2: the result-bar labels wrapped; set to 11 pt, no wrap.
- Slides 19–20: unit-economics tables kept as the page picture (type too small to rebuild cleanly).

## Still not perfect

- 19-20: unit-economics tables (tiny type) unreadable after rebuild: kept as page pictures
- 2, 9, 12: white text on red/photo bars partly doubled
