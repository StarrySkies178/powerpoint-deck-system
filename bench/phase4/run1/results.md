# Fresh blind rebuilds: run1

Written by `bench/scripts/bench_rebuilds.py` (2026-11-24 04:01); official environment; unchanged scorer. Bar: all standards, layout ≥ 0.6, visual ≥ 0.5. Three builds per C case, each by its own fresh blind builder. A build that did not run counts 0.

| Case | r1 | r2 | r3 | Mean layout / visual |
|---|---|---|---|---|
| C01-exec-summary-polaris | fail 10/11 · 0.52 / 0.29 | fail 11/11 · 0.40 / 0.19 | fail 10/11 · 0.34 / 0.23 | 0.42 / 0.24 |
| C02-gantt-risks-polaris | fail 11/11 · 0.31 / 0.24 | fail 11/11 · 0.26 / 0.22 | fail 11/11 · 0.27 / 0.30 | 0.28 / 0.25 |
| C03-assumptions-table-polaris | fail 10/10 · 0.00 / 0.26 | fail 10/10 · 0.00 / 0.27 | fail 10/10 · 0.00 / 0.24 | 0.00 / 0.26 |
| C04-two-charts-ecluster | fail 11/11 · 0.32 / 0.47 | fail 11/11 · 0.21 / 0.48 | fail 11/11 · 0.45 / 0.51 | 0.33 / 0.49 |
| C05-timeline-ecluster | fail 9/10 · 0.16 / 0.07 | fail 9/10 · 0.12 / 0.21 | fail 9/10 · 0.23 / 0.17 | 0.17 / 0.15 |
| C06-exec-summary-mindcraft | fail 6/10 · 0.00 / 0.09 | fail 6/10 · 0.00 / 0.07 | fail 6/10 · 0.00 / 0.08 | 0.00 / 0.08 |
| C07-scenario-lines-mindcraft | fail 8/11 · 0.37 / 0.47 | fail 8/11 · 0.37 / 0.54 | fail 9/11 · 0.43 / 0.51 | 0.39 / 0.51 |
| C08-risk-matrix-mindcraft | fail 9/11 · 0.37 / 0.39 | fail 9/11 · 0.45 / 0.39 | fail 10/11 · 0.41 / 0.32 | 0.41 / 0.37 |
| C09-sensitivity-truenorth | fail 9/10 · 0.48 / 0.33 | fail 8/10 · 0.45 / 0.34 | fail 8/10 · 0.57 / 0.52 | 0.50 / 0.40 |
| C10-strategy-table-truenorth | fail 11/11 · 0.28 / 0.44 | fail 11/11 · 0.37 / 0.42 | fail 11/11 · 0.30 / 0.42 | 0.32 / 0.43 |

**Builds that ran:** 30 of 30. **Passing builds:** 0. **Cases passing 3 of 3:** 0 of 10. **Mean over the cases of the per-case mean:** layout 0.281, visual 0.316.

**Failed standards (number of builds):** body margins 10, colours 9, body text size 7, title bold 3, title colour 3, source line 3, leave-one-out 2

## Against run0

| Case | Layout run0 → run1 | Visual run0 → run1 | Passing builds |
|---|---|---|---|
| C01-exec-summary-polaris | 0.32 → 0.42 (+0.10) | 0.24 → 0.24 (-0.00) | 0 → 0 |
| C02-gantt-risks-polaris | 0.23 → 0.28 (+0.05) | 0.24 → 0.25 (+0.02) | 0 → 0 |
| C03-assumptions-table-polaris | 0.00 → 0.00 (+0.00) | 0.24 → 0.26 (+0.02) | 0 → 0 |
| C04-two-charts-ecluster | 0.43 → 0.33 (-0.11) | 0.50 → 0.49 (-0.01) | 0 → 0 |
| C05-timeline-ecluster | 0.09 → 0.17 (+0.08) | 0.04 → 0.15 (+0.11) | 0 → 0 |
| C06-exec-summary-mindcraft | 0.00 → 0.00 (+0.00) | 0.09 → 0.08 (-0.01) | 0 → 0 |
| C07-scenario-lines-mindcraft | 0.41 → 0.39 (-0.02) | 0.46 → 0.51 (+0.04) | 0 → 0 |
| C08-risk-matrix-mindcraft | 0.42 → 0.41 (-0.01) | 0.34 → 0.37 (+0.03) | 0 → 0 |
| C09-sensitivity-truenorth | 0.49 → 0.50 (+0.01) | 0.38 → 0.40 (+0.02) | 0 → 0 |
| C10-strategy-table-truenorth | 0.22 → 0.32 (+0.09) | 0.33 → 0.43 (+0.10) | 0 → 0 |

Mean layout 0.262 → 0.281, visual 0.285 → 0.316. Cases worse by 0.14 or more on the per-case mean layout or visual: none.
Failed standards before: body text size 14, colours 9, body margins 7, title bold 3, title colour 3, source line 3, leave-one-out 2, title position 2
