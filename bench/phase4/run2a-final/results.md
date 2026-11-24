# Fresh blind rebuilds: run2a-final

Written by `bench/scripts/bench_rebuilds.py` (2026-11-24 06:20); official environment; unchanged scorer. Bar: all standards, layout ≥ 0.6, visual ≥ 0.5. Three builds per C case, each by its own fresh blind builder. A build that did not run counts 0.

| Case | r1 | r2 | r3 | Mean layout / visual |
|---|---|---|---|---|
| C03-assumptions-table-polaris | fail 10/10 · 0.00 / 0.25 | fail 10/10 · 0.00 / 0.24 | fail 10/10 · 0.00 / 0.26 | 0.00 / 0.25 |
| C08-risk-matrix-mindcraft | fail 10/11 · 0.43 / 0.37 | fail 9/11 · 0.43 / 0.40 | fail 9/11 · 0.42 / 0.40 | 0.43 / 0.39 |
| C10-strategy-table-truenorth | fail 10/10 · 0.24 / 0.43 | fail 11/11 · 0.27 / 0.31 | fail 11/11 · 0.48 / 0.36 | 0.33 / 0.37 |

**Builds that ran:** 9 of 9. **Passing builds:** 0. **Cases passing 3 of 3:** 0 of 3. **Mean over the cases of the per-case mean:** layout 0.252, visual 0.336.

**Failed standards (number of builds):** colours 3, body margins 2, leave-one-out 1

## Against run1

| Case | Layout run1 → run2a-final | Visual run1 → run2a-final | Passing builds |
|---|---|---|---|
| C03-assumptions-table-polaris | 0.00 → 0.00 (+0.00) | 0.26 → 0.25 (-0.01) | 0 → 0 |
| C08-risk-matrix-mindcraft | 0.41 → 0.43 (+0.02) | 0.37 → 0.39 (+0.02) | 0 → 0 |
| C10-strategy-table-truenorth | 0.32 → 0.33 (+0.01) | 0.43 → 0.37 (-0.06) | 0 → 0 |

Mean layout 0.281 → 0.252, visual 0.316 → 0.336. Cases worse by 0.14 or more on the per-case mean layout or visual: none.
Failed standards before: body margins 10, colours 9, body text size 7, title bold 3, title colour 3, source line 3, leave-one-out 2
