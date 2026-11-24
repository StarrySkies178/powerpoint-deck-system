# Store fix 4: pattern tags and extend() (Next block of roadmap 4.2, v2.86), and the twenty pictures after it

## Fix 4

**What changed** (`Generators/objstore.py`, before: `archive/objstore_before-fix4-tags_v2.85_2026-11-24.py`; store before: `archive/<key>_before-retag_2026-11-24_*.jsonl.gz`, `archive/store-index_before-fix4_v2.85_2026-11-24.json`):
- **Tags.** The store's pattern tags had never been synced from the reviewed rows of `Style/slide-map.csv`: most whole-slide objects still carried the automatic guess made at ingest (C04's slide as labelled-rows, C09's as matrix-2x2, C10's as nested-sizes). `scripts/reextract_store.py --tags-only` now sets pattern, title and note of each whole-slide object (store file and index.json) from its reviewed slide-map row. Done for the four C-case decks: 91 tags changed (polaris 19, ecluster 21, mindcraft 28, truenorth 23). Parts keep their own kinds. audit ALL PASS; the Mac's store matches the cloud copy object by object.
- **extend().** When an object cannot be re-counted, `NeedsGenerator` no longer simply names the generator its tag maps to. It checks whether the object looks like that generator's form (2 x 2 grid for matrix, nested rings for targetOnion, branching or connectors for issueTree, rows for labelledRows, items around a centre for cycle and hubSpoke; a mainly-table or native-chart object for any non-table, non-chart generator), says so when it does not ("re-tag it, or build by hand"), says "no generator for this tag" when there is none, and marks tags that were set automatically.
- C01's own tag (exec-summary-tree) was right; what was wrong was pointing it to issueTree. It is now refused with the reason.

**What extend() says now** for the re-counts the mimic B builds needed: `extend-messages.txt`. No hand code could be removed: none of these forms has a generator, so B's re-layouts stay by hand; the builders are no longer sent to a wrong generator. **Regression** 7 of 7 before and after.

## The twenty pictures (after fixes 1, 5, 6, 7, 2, 3, 4)

All ten cases, each carried from its latest run folder (`CARRIED.txt`) and rebuilt with the store tools as they now are.
- `review-mimic-7/` (original left, A right) and `review-mimic-7-b/` (A left, B right) were **rendered on the Mac with LibreOffice after `scripts/setup_render_fonts.sh` (v2.86) installed the decks' real fonts or metric-compatible ones**: Verdana, Arial and Times New Roman (Microsoft's core fonts), Wine's Tahoma and Wingdings, Carlito for Calibri ("ALL FONTS OK"). C07's two panel headings, which wrapped under the substitute font in review-mimic-3, are on one line again.
- Comparison judge first: `judge-compare/predictions-mimic-7.csv` (md5 27221fea…, written 13:40:33 UTC): **10 of 10 OK**. Its one remark: C04's chart-1 subtitle wraps so that "growth" touches "CNY Billion".

layout_raw of A (Mac): with the real fonts / with the usual substitutes (comparable with every earlier number) / v2.74:

| Case | real fonts | usual | v2.74 |
|---|---|---|---|
| C01 | 0.997 | 0.997 | 0.977 |
| C02 | 0.921 | 0.917 | 0.915 |
| C03 | 0.996 | 0.984 | 0.984 |
| C04 | 0.988 | 0.990 | 0.990 |
| C05 | 0.978 | 0.980 | 0.980 |
| C06 | 0.981 | 0.981 | 0.981 |
| C07 | 0.948 | 0.943 | 0.943 |
| C08 | 0.945 | 0.947 | 0.947 |
| C09 | 0.988 | 0.988 | 0.988 |
| C10 | 0.996 | 0.996 | 0.998 |

On the usual renderer no A is worse than v2.74 by more than 0.002 (C10, from fix 1). After the pictures the fonts were switched off again (`~/.config/fontconfig/fonts.conf.realfonts` kept), so the official environment of the benchmark is unchanged; whether it should change is a proposal row.
