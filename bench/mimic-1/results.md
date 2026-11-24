# Store fix 1: set_texts (Next block of roadmap 4.2, v2.79)

**What changed** (`Generators/objstore.py`, before: `archive/objstore_before-fix1-set_texts_v2.77_2026-11-24.py`):
- `set_texts()` keeps each paragraph's own format: paragraph i takes the box's own paragraph i; further paragraphs repeat the last, or the last at a level asked for with `{"lvl": n, "runs": ...}` (from another box of the object when this box has none at that level).
- Runs keep their own format: a paragraph passed as a list of strings becomes runs, run k in the format of the original's k-th run of a new format (PDF imports' one-run-per-word runs of one format count as one). Bold leads, red "Mitigation:" runs and superscripts survive.
- Unchanged text (spaces aside) keeps its runs exactly. Empty spacer paragraphs (no run) before and after the text stay. On new text, letter spacing (`spc`) is dropped, and in text boxes the PDF import's line-break right margin (`marR`) too; table cells keep `marR`.
- It reaches table cells: after all text boxes, table by table, row by row; `slots()` lists them as "cell r,c". Earlier indices do not move.
- The tool went through three revisions inside this run, each from what the re-run builders found (report-fix.md, "Revision 2" and "3").

**Regression** 7 of 7 before (10:57) and after each revision (11:34, final at the last install). Sync to GitHub pending (GITHUB held by the reference rebuild chat).

## Mimic re-runs (builders told to delete their work-around and not to work round the tool)

Official layout_raw of A (Mac), against v2.74:

| Case | A now | v2.74 | Hand code removed |
|---|---|---|---|
| C01 | 0.977 | 0.977 | B `para()`, `refill()`, 5 templates |
| C02 | 0.915 | 0.915 | `_runs_text()` (common.py 156 → 135) |
| C03 | 0.984 | 0.984 | `fill_table()` (86 → 65) |
| C04 | 0.990 | 0.990 | `refill()`; A's blanking loop |
| C06 | 0.981 | 0.981 | `fix_paragraphs()` (B 84 → 71) |
| C07 | 0.943 | 0.943 | spcBef strip (common.py 69 → 61) |
| C08 | 0.947 | 0.947 | `norm()`, `same()`, `one_run_text()` (191 → 171) |
| C10 | 0.996 | 0.998 | `refill()` (A 98 → 85) |

No A is worse by eye or by more than 0.03. Every builder reports no hand code left for this fault.

**B builds:** as good as v2.74 in C01, C02, C03, C04, C06, C08, C10. C07 B is better (its "2)" is superscript again) and in one place slightly worse: with `marR` dropped, a takeaway bullet now breaks at "~2.1-" / "year payback" (wording, not a fault of the tool).

**Left, small:** C08 map labels: lines 2 and later sit about 1 pt lower (each new line repeats the label's 1 pt space-before). C07 B fails lint "body size" by a hair: the lint counts each run once, and the label now has a few short runs (nothing shrank on the slide).

Builders' notes: `<case>/report-fix.md`; their v2.74 notes: `<case>/report-v2.74.md`.
