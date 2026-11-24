# Store fix 6: element() and place() carry only the media the shapes use (Next block of roadmap 4.2, v2.81)

**What changed** (`Generators/objstore.py`, before: `archive/objstore_before-fix6-media_v2.80_2026-11-24.py`): `element()` keeps in `obj["media"]` only the pictures the lifted element's XML refers to, and `place()` copies into the deck only the pictures the placed shapes use (so it also holds after a builder deletes shapes by hand). Before, a lifted text box carried the whole slide's pictures: C05 got an unused Gantt JPEG, C07 27 unused marker PNGs, C10 5 unused parts.

**Regression** 7 of 7 before and after. GitHub sync pending (GITHUB held by the reference rebuild chat).

## Mimic re-runs

| Case | A now | v2.74 | Hand code removed | Media parts in the file |
|---|---|---|---|---|
| C05 | 0.980 | 0.980 | the loop that emptied media (A, B: 4 lines each) | none (was cleared by hand) |
| C07 | 0.943 | 0.943 | the media filter in common.py (3 lines) | none (was filtered by hand) |
| C10 | 0.996 | 0.998 | none (no work-around) | 1, the logo (was 6) |

No A worse by eye or by more than 0.03 (C10's -0.002 is from fix 1). Builders' notes: `<case>/report-fix.md`.

## The twenty pictures after the third fix (fixes 1, 5, 6)

All ten cases are here: the three re-run for fix 6, and the other seven carried from their latest folder (`CARRIED.txt` names it) and rebuilt with the current tools. Official layout_raw of every A equals v2.74 (C10 -0.002).

- `review-mimic-3/`: original left, A right. `review-mimic-3-b/`: A left, B right. **Rendered on the Mac (LibreOffice 26.2)**; the v2.74 pictures were rendered in the cloud (24.2) while the Mac was offline.
- Comparison judge first: `judge-compare/predictions-mimic-3.csv` (md5 d6de111f…, written 11:55:42 UTC): 9 of 10 OK, C07 NOT OK ("both numbered section headers wrap onto two lines").
- **C07's wrap is the renderer, not a fix:** the v2.74 build of C07 A, rendered on the Mac today, wraps the same two headers (checked side by side); in the cloud's LibreOffice 24.2 they stay on one line, which is what Mike saw in review-mimic/. The judge's C04 remark (a chart subtitle wrapping into "CNY Billion") is likely the same effect. Proposal row added.
