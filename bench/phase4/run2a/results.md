# Fresh blind rebuilds: run2a

Written by `bench/scripts/bench_rebuilds.py` (2026-11-24 05:03); official environment; unchanged scorer. Bar: all standards, layout ≥ 0.6, visual ≥ 0.5. Three builds per C case, each by its own fresh blind builder. A build that did not run counts 0.

| Case | r1 | r2 | r3 | Mean layout / visual |
|---|---|---|---|---|
| C03-assumptions-table-polaris | fail 10/10 · 0.00 / 0.25 | fail 10/10 · 0.00 / 0.23 | fail 10/10 · 0.00 / 0.25 | 0.00 / 0.24 |
| C08-risk-matrix-mindcraft | fail 9/11 · 0.39 / 0.36 | fail 10/11 · 0.42 / 0.37 | fail 9/11 · 0.41 / 0.36 | 0.41 / 0.36 |
| C10-strategy-table-truenorth | fail 11/11 · 0.22 / 0.38 | fail 11/11 · 0.34 / 0.42 | fail 11/11 · 0.38 / 0.30 | 0.31 / 0.37 |

**Builds that ran:** 9 of 9. **Passing builds:** 0. **Cases passing 3 of 3:** 0 of 3. **Mean over the cases of the per-case mean:** layout 0.240, visual 0.324.

**Failed standards (number of builds):** colours 3, body margins 2

## Against run1

| Case | Layout run1 → run2a | Visual run1 → run2a | Passing builds |
|---|---|---|---|
| C03-assumptions-table-polaris | 0.00 → 0.00 (+0.00) | 0.26 → 0.24 (-0.01) | 0 → 0 |
| C08-risk-matrix-mindcraft | 0.41 → 0.41 (-0.00) | 0.37 → 0.36 (-0.00) | 0 → 0 |
| C10-strategy-table-truenorth | 0.32 → 0.31 (-0.00) | 0.43 → 0.37 (-0.06) | 0 → 0 |

Mean layout 0.281 → 0.240, visual 0.316 → 0.324. Cases worse by 0.14 or more on the per-case mean layout or visual: none.
Failed standards before: body margins 10, colours 9, body text size 7, title bold 3, title colour 3, source line 3, leave-one-out 2
