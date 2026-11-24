# Store fix 2: extract keeps straight lines (Next block of roadmap 4.2, v2.84)

**What changed** (`Generators/objstore.py`, before: `archive/objstore_before-fix2-extract-lines_v2.83_2026-11-24.py`): `extract` dropped every shape with a zero width or zero height, so every straight line and divider of a PDF-imported reference was lost. It now keeps them; only a shape with no size at all is dropped.

**Store re-extracted** for the four C-case decks with the new `scripts/reextract_store.py` (whole-slide objects only, each keeping its pattern, title and note; old files in `archive/<key>_before-reextract_2026-11-24_<time>.jsonl.gz`, old index in `archive/store-index_before-fix2_v2.83_2026-11-24.json`):

| Deck | Whole-slide objects | Changed | Shapes added |
|---|---|---|---|
| case19-polaris | 22 | 12 | 150 |
| case19-ecluster | 24 | 15 | 42 |
| case19-mindcraft | 33 (+1 new: 033) | 14 | 41 |
| case-truenorth-pola | 23 | 10 | 8 |

No shape lost; no new picture (the 4 the extraction met were already in media.zip). The single-diagram parts and vectorised pictures were kept as they were (they were reviewed by eye; a new split would need that review again), so the parts do not get the new lines yet: proposal row. `audit_reference.py` ALL PASS on the four. The Mac's store matches the cloud copy object by object. **Regression** 7 of 7 before and after.

## Mimic re-runs (element indices shifted where lines were added; builders re-mapped them)

| Case | A now | v2.74 | Hand code removed |
|---|---|---|---|
| C01 | 0.997 | 0.977 | the 2 dividers, 2 chevron rules and bar rule (A, B) and the arrow-edge opening |
| C02 | 0.917 | 0.915 | the red rule, dashed divider, grey rules, dotted sub-group rule, dashed column pieces |
| C04 | 0.990 | 0.990 | the panel heading rules and the panel-2 divider |
| C06 | 0.981 | 0.981 | none (no work-around): the object now has the original's thin line at the left edge, which v2.74 took for a render artefact |
| C08 | 0.947 | 0.947 | the cloned panel-2 head rule |

No A worse; C01 better by 0.02. Lines in the footer zone stay drawn (the store leaves the footer to the frame). The other cases build unchanged with the new store. Builders' notes: `<case>/report-fix.md`.
