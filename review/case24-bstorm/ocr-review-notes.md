# OCR review notes: case24-bstorm

How the rebuilt deck in Templates/ was made (v2.38, 2026-11-24):

1. Rebuilt from `pages/` with `Generators/rebuild_slides.py` (OCR cached in `ocr-cache/`, so the line ids stay the same). The first pass is `rebuild-info-before-review.json`.
2. Round 1 review, by eye on the review sheets (every number line, every suspect line, every missed-number and missed-word candidate): `ocr-corrections.json`, ids from `rebuild-info-before-review.json`: 69 lines corrected or removed, 85 numbers and words added.
3. Final rebuild: `rebuild-info.json` and `rebuild-review.jpg`. Note: edit boxes were snapped to the OCR line they came from (within 4 px), because `rebuild-info` keeps rounded boxes and 1–2 px wide lines (dashed rules read as "1") otherwise miss; see `logs/proposals.md`.
4. `ocr-corrections-final.json` (4 entries) applied to the finished deck with `ocr_review.py apply` (ids from `rebuild-info.json`).

## Still not perfect

- Nothing beyond the general limits: traced charts are shapes, not native charts (redraw with a builder when numbers change); real photos stay pictures.
