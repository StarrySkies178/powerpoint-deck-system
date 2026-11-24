# Store fix 7: table_size (Next block of roadmap 4.2, v2.83)

**What changed** (`Generators/objstore.py`, before: `archive/objstore_before-fix7-table_size_v2.82_2026-11-24.py`):
- When columns are added or removed, the data columns share one width and now also one set of paragraph indents (the smallest right and left indent found among them), so numbers placed with a right indent on some columns only are spaced evenly.
- New rows in a banded table (fills alternating) copy the row two above, so the bands go on alternating; the new row takes the last row's top edge, not the copied row's top rule.
- The id suffix is clean: `.tc7`, `.tr6` (was `.tNonex7`).

**Regression** 7 of 7 before and after. GitHub sync: see the changelog row.

| Case | A now | v2.74 | Hand code removed |
|---|---|---|---|
| C03 | 0.984 | 0.984 | `respace_columns()` (mimic_util.py 65 → 49; B/build.py 34 → 30) |
| C08 | 0.947 | 0.947 | B's banding loop and the extra top rule on added rows (162 lines kept for the PDF import's cell faults) |

A identical to v2.74 in both. B: C03's columns are even, with the first number column ending 0.21 in further left than in the original (table_size divides the width equally; left as the tool makes it). C08's bands white/grey/white/grey/white, as before. The run's folder was first named mimic-7a. Builders' notes: `<case>/report-fix.md`.
