# C01 exec summary (Polaris): store fix 5 re-run (objstore.place() at scale 1)

## Hand code removed
- **A and B:** `scale_text=False` in the one `O.place(...)` call of each build (A/build.py line 58, B/build.py line 143). v2.74 passed it only to stop place()'s autofit shrinking the 16 pt heads at scale 1 (the object is placed at its own bbox, so scale is exactly 1). Both calls now use the defaults: `O.place(OUT, 1, obj, bbox, STORE, colours="original")` (B adds `texts=texts`).
- No hand code undid place()'s `wrap="none"` at scale 1, so nothing else came out. B's `wrap="square"` on the bullet lists (B/build.py line 112) undoes A's own `tidy()` (import clean-up, lists of more than 3 words that place() never touched), so it stays, as do `tidy()` and every other work-around for other faults (zero-width lines, logos, page number, extend() refusal).
- Line counts unchanged (one argument removed within a line): A/build.py 67 before and after, B/build.py 151 before and after, build.js and layout.json untouched. Content of A and B is unchanged.

## Still needing hand code for this fault
None.

## What the fixed tool did
Correct per its contract. With the default `scale_text=True` at scale 1, place() no longer shrinks text (all sizes as stored) and no longer sets `wrap="none"` on short labels. The only XML change in slide1 against before: the head boxes ("Market", "Strategy Design" in A, all four heads in B) keep their stored `wrap="square"` (was `none`), 5 bodyPr lines in A, 8 in B. No tool fault seen.

## Look against v2.74 (LibreOffice, 96 dpi, /tmp/C01-exec-summary-polaris-fix/)
- **A:** better, slightly. The only pixel change is the head row (y 134 to 155 px): "Market" and "Strategy Design" move 1 px left (0.65 and 1.02 pt in the PDF), now at the original's exact pixel columns (Market 336 to 402/403, Strategy Design 656 to 814; v2.74 was 337/657). Head-row difference from original.png halves (245027 to 120113, sum of grey-level differences); whole-slide difference 8145969 to 8021055. Everything else is pixel-identical to v2.74.
- **B:** same as before. The head row is the only change: the four column-wide centred heads move by under 0.1 pt, invisible. Against v2.74's B the differences are only the ones report-fix1.md already lists.
- deck_lint (Style/refs/Case-2019-Polaris.profile.json): A and B 0 errors, 0 warnings.
