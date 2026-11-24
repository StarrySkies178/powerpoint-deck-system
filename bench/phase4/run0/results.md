# Fresh blind rebuilds: run0

Written by `bench/scripts/bench_rebuilds.py` (2026-11-24 03:42); official environment; unchanged scorer. Bar: all standards, layout ≥ 0.6, visual ≥ 0.5. Three builds per C case, each by its own fresh blind builder. A build that did not run counts 0.

| Case | r1 | r2 | r3 | Mean layout / visual |
|---|---|---|---|---|
| C01-exec-summary-polaris | fail 10/11 · 0.23 / 0.28 | fail 10/11 · 0.26 / 0.17 | fail 10/11 · 0.48 / 0.26 | 0.32 / 0.24 |
| C02-gantt-risks-polaris | fail 10/11 · 0.23 / 0.23 | fail 11/11 · 0.30 / 0.23 | fail 11/11 · 0.16 / 0.25 | 0.23 / 0.24 |
| C03-assumptions-table-polaris | fail 10/10 · 0.00 / 0.21 | fail 10/10 · 0.00 / 0.25 | fail 10/10 · 0.00 / 0.25 | 0.00 / 0.24 |
| C04-two-charts-ecluster | fail 11/11 · 0.56 / 0.57 | fail 11/11 · 0.39 / 0.50 | fail 11/11 · 0.35 / 0.43 | 0.43 / 0.50 |
| C05-timeline-ecluster | fail 8/10 · 0.00 / 0.12 | fail 8/10 · 0.04 / 0.00 | fail 9/10 · 0.24 / 0.00 | 0.09 / 0.04 |
| C06-exec-summary-mindcraft | fail 6/10 · 0.00 / 0.08 | fail 6/10 · 0.00 / 0.08 | fail 6/10 · 0.00 / 0.11 | 0.00 / 0.09 |
| C07-scenario-lines-mindcraft | fail 8/11 · 0.41 / 0.43 | fail 8/11 · 0.39 / 0.49 | fail 8/11 · 0.43 / 0.47 | 0.41 / 0.46 |
| C08-risk-matrix-mindcraft | fail 9/11 · 0.42 / 0.31 | fail 8/11 · 0.37 / 0.33 | fail 9/11 · 0.46 / 0.38 | 0.42 / 0.34 |
| C09-sensitivity-truenorth | fail 9/10 · 0.52 / 0.38 | fail 9/10 · 0.48 / 0.36 | fail 9/10 · 0.48 / 0.40 | 0.49 / 0.38 |
| C10-strategy-table-truenorth | fail 11/11 · 0.20 / 0.30 | fail 10/11 · 0.16 / 0.33 | fail 11/11 · 0.31 / 0.36 | 0.22 / 0.33 |

**Builds that ran:** 30 of 30. **Passing builds:** 0. **Cases passing 3 of 3:** 0 of 10. **Mean over the cases of the per-case mean:** layout 0.262, visual 0.285.

**Failed standards (number of builds):** body text size 14, colours 9, body margins 7, title bold 3, title colour 3, source line 3, leave-one-out 2, title position 2
