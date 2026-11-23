# OCR review notes: case22-fusion

How the rebuilt deck in Templates/ was made (v2.38, 2026-11-24):

1. Rebuilt from `pages/` with `Generators/rebuild_slides.py` (OCR cached in `ocr-cache/`, so the line ids stay the same). The first pass is `rebuild-info-before-review.json`.
2. Round 1 review, by eye on the review sheets (every number line, every suspect line, every missed-number and missed-word candidate): `ocr-corrections.json`, ids from `rebuild-info-before-review.json`: 79 lines corrected or removed, 97 numbers and words added.
3. Final rebuild: `rebuild-info.json` and `rebuild-review.jpg`. Note: edit boxes were snapped to the OCR line they came from (within 4 px), because `rebuild-info` keeps rounded boxes and 1–2 px wide lines (dashed rules read as "1") otherwise miss; see `logs/proposals.md`.
4. `ocr-corrections-final.json` (3 entries) applied to the finished deck with `ocr_review.py apply` (ids from `rebuild-info.json`).

## Fixed by hand in the finished deck

- Slides 2–6 and 8–11: the title lines were merged with the breadcrumb by the OCR; retyped from the slide map as one title box (lead phrase in the main colour on 8–10).

## Still not perfect

- 2-6, 8-11: titles merged with the breadcrumb by OCR: retyped from the slide map as one text box (lead colour kept on 8-10; faint traces of the old letters remain behind)
