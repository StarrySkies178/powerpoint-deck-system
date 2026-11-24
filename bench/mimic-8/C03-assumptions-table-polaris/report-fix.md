# C03 assumptions table (Polaris): store fix 7 re-run (table_size evens data-column indents)

## Hand code removed
- `respace_columns` (mimic_util.py), written because table_size(cols=7) spaced the year columns unevenly (marR about 0.74 in on source columns 2 to 5 only). Deleted.
- B/build.py: the hand-set widths (first = 2780030, last_edge = 4438650, step) and the respace_columns call are gone. B now calls only `O.table_size(obj, cols=7)`, then set_texts as before. Text and numbers unchanged.
- A never used respace_columns (the table is placed as is); A/build.py is unchanged.
- Lines (wc -l), before -> after: mimic_util.py 65 -> 49; B/build.py 34 -> 30; A/build.py 17 -> 17.
- Kept, as they fix other faults: explicit_borders (LibreOffice stray rule under "#stores" rows) and page_number.

## Hand code still needed for this fault
- None. Nothing was added.

## What the fixed tool did
- Object: case19-polaris-022, table_size(cols=7). Id came out "case19-polaris-022.tc7" (clean, no "None").
- Grid: label column 3.04 in, then six equal data columns of 1.594 in (v2.74 hand code: 1.814 in for the first number column, then 1.55 in).
- Indents: every data-column paragraph now has no marR (the smallest found was 0, on the old last column), so all numbers end on their column edges. Rendered right edges of the numbers in B: 479, 631, 784, 937, 1090, 1239 px, gaps 152 to 153 px (last 149, the same cell-inset effect v2.74 showed). Even spacing achieved.
- Not a fault, but a difference from the original's look: the first number column now ends about 0.21 in (20 px) further left than in the original (479 px against 499 px in original.png and v2.74). The tool divides the data width equally and has no way to keep where the source's first number column ended; v2.74 kept it by hand. Left as the tool makes it, as asked.

## Look against v2.74 (LibreOffice, 96 dpi, /tmp/C03-assumptions-table-polaris-fix/)
- A: identical to v2.74 (0 differing pixels); against original.png the same as before (mean abs diff 6.01 both). Only difference from the original is still the logo slot.
- B: as good as v2.74. Columns evenly spaced (153 px steps against 149 px in v2.74), all rows, rules and header spacer rows in place. The one change: the first year/number column sits 20 px further left, so the gap after the label column is slightly narrower than the original's. Not worse in a way a reader would notice; slightly less faithful to where the original's first number column ended.
- deck_lint (Polaris profile): A 0 errors, 1 warning (thin, the original's own text); B 0 errors, 0 warnings. Same as v2.74.
