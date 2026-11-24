# Store fix 5: place() at scale 1 (Next block of roadmap 4.2, v2.80)

**Order changed:** fixes 2, 3 and 4 need the stored objects extracted again (the lines, the original colours and the pattern tags live in Objects/store), and Objects/store is held by the reference rebuild chat (frozen, with GITHUB, since 06:51 UTC). So the pure tool fixes come first: 1 (done, v2.79), 5 (this), 6 and 7; then 4's code part, 2 and 3 once the store can be written (or tried on a copy of the store under bench/).

**What changed** (`Generators/objstore.py`, before: `archive/objstore_before-fix5-place_v2.79_2026-11-24.py`): at scale 1 (the object placed at its own size) place() no longer scales or autofits text. Before, its sizes were rounded down to whole points and `_autofit`'s width estimate (0.52 em per character) shrank 14 to 16 pt text to 8 to 13 pt in boxes that hug their text (PDF imports).

**Tried and withdrawn in the same run:** keeping the stored wrap of short labels at scale 1 (instead of wrap="none"). It made C08's "Top priority" wrap onto two lines under LibreOffice's fallback font (the stored box fits Verdana), so A got worse by eye. place() sets short labels to wrap="none" at every scale again, as before; a proposal row asks for a fit test with the font actually used.

**Regression** 7 of 7 before and after. GitHub sync pending (GITHUB held by the reference rebuild chat).

## Mimic re-runs (`scale_text=False` deleted where it only stopped the shrink at scale 1)

| Case | A now | v2.74 | Hand code removed |
|---|---|---|---|
| C01 | 0.977 | 0.977 | scale_text=False (A, B) |
| C02 | 0.915 | 0.915 | scale_text=False |
| C04 | 0.990 | 0.990 | scale_text=False (A, B); its square-wrap loop stays (wrap part withdrawn) |
| C08 | 0.947 | 0.947 | scale_text=False (A, B) |
| C10 | 0.996 | 0.998 | scale_text=False (4 calls) |

No A worse by eye or by more than 0.03 (C10's -0.002 is from fix 1). B builds as good as before. C09 was tried for the wrap part only (its stored scenario headings); with that part withdrawn its v2.74 redraw stays: `C09-sensitivity-truenorth.tried-wrap/` keeps the attempt (B's longer heading also showed that a refilled box does not widen for longer text).

Builders' notes: `<case>/report-fix.md`.
