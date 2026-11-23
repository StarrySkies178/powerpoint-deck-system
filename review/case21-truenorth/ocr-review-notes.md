# OCR review notes: case21-truenorth

How the rebuilt deck in Templates/ was made (v2.38, 2026-11-24):

1. Rebuilt from `pages/` with `Generators/rebuild_slides.py` (OCR cached in `ocr-cache/`, so the line ids stay the same). The first pass is `rebuild-info-before-review.json`.
2. Round 1 review, by eye on the review sheets (every number line, every suspect line, every missed-number and missed-word candidate): `ocr-corrections.json`, ids from `rebuild-info-before-review.json`: 150 lines corrected or removed, 134 numbers and words added.
3. Round 2: the corrected rebuild was compared line by line with the reviewed text; `ocr-corrections-round2.json` (ids from `rebuild-info-round1.json`) fixes what the new pass read differently. Rebuilt with all rounds together.
4. Final rebuild: `rebuild-info.json` and `rebuild-review.jpg`. Note: edit boxes were snapped to the OCR line they came from (within 4 px), because `rebuild-info` keeps rounded boxes and 1–2 px wide lines (dashed rules read as "1") otherwise miss; see `logs/proposals.md`.
5. `ocr-corrections-final.json` (1 entries) applied to the finished deck with `ocr_review.py apply` (ids from `rebuild-info.json`).

## Fixed by hand in the finished deck

- Slide 5: a logo read as "BEXES" deleted.
- Slide 7: agenda lines "trategy Position" and "Strategy impler / tation" retyped.
- Slide 32: serif lines switched to Arial.

## Still not perfect

- 3,7: agenda photo traced into flat colour patches (posterised); 29-31: some row labels lost their '#'; 32 was set in serif: switched to Arial
