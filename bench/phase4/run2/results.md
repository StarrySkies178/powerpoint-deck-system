# Fresh blind rebuilds: run2

Written by `bench/scripts/bench_rebuilds.py` (2026-11-24 04:23); official environment; unchanged scorer. Bar: all standards, layout ≥ 0.6, visual ≥ 0.5. Three builds per C case, each by its own fresh blind builder. A build that did not run counts 0.

| Case | r1 | r2 | r3 | Mean layout / visual |
|---|---|---|---|---|
| C01-exec-summary-polaris | fail 10/11 · 0.44 / 0.22 | fail 10/11 · 0.49 / 0.38 | fail 10/11 · 0.42 / 0.28 | 0.45 / 0.29 |
| C02-gantt-risks-polaris | fail 11/11 · 0.17 / 0.22 | fail 11/11 · 0.26 / 0.27 | fail 11/11 · 0.31 / 0.27 | 0.25 / 0.25 |
| C03-assumptions-table-polaris | fail 10/10 · 0.00 / 0.26 | fail 10/10 · 0.01 / 0.26 | fail 10/10 · 0.00 / 0.23 | 0.00 / 0.25 |
| C04-two-charts-ecluster | fail 11/11 · 0.33 / 0.47 | fail 11/11 · 0.26 / 0.49 | fail 11/11 · 0.46 / 0.56 | 0.35 / 0.51 |
| C05-timeline-ecluster | fail 9/10 · 0.00 / 0.14 | fail 9/10 · 0.00 / 0.09 | fail 9/10 · 0.00 / 0.00 | 0.00 / 0.08 |
| C06-exec-summary-mindcraft | fail 6/10 · 0.00 / 0.11 | fail 6/10 · 0.00 / 0.11 | fail 6/10 · 0.00 / 0.09 | 0.00 / 0.10 |
| C07-scenario-lines-mindcraft | fail 8/11 · 0.39 / 0.51 | fail 8/11 · 0.41 / 0.58 | fail 8/11 · 0.48 / 0.51 | 0.43 / 0.53 |
| C08-risk-matrix-mindcraft | fail 10/11 · 0.48 / 0.40 | fail 10/11 · 0.50 / 0.43 | fail 10/11 · 0.44 / 0.40 | 0.47 / 0.41 |
| C09-sensitivity-truenorth | fail 8/10 · 0.45 / 0.32 | fail 8/10 · 0.58 / 0.44 | fail 8/10 · 0.46 / 0.35 | 0.50 / 0.37 |
| C10-strategy-table-truenorth | fail 11/11 · 0.34 / 0.40 | fail 11/11 · 0.38 / 0.43 | fail 11/11 · 0.06 / 0.36 | 0.26 / 0.40 |

**Builds that ran:** 30 of 30. **Passing builds:** 0. **Cases passing 3 of 3:** 0 of 10. **Mean over the cases of the per-case mean:** layout 0.271, visual 0.319.

**Failed standards (number of builds):** body margins 10, colours 9, body text size 8, title bold 3, title colour 3, source line 3, leave-one-out 3

## Against run1

| Case | Layout run1 → run2 | Visual run1 → run2 | Passing builds |
|---|---|---|---|
| C01-exec-summary-polaris | 0.42 → 0.45 (+0.03) | 0.24 → 0.29 (+0.06) | 0 → 0 |
| C02-gantt-risks-polaris | 0.28 → 0.25 (-0.03) | 0.25 → 0.25 (+0.00) | 0 → 0 |
| C03-assumptions-table-polaris | 0.00 → 0.00 (+0.00) | 0.26 → 0.25 (-0.01) | 0 → 0 |
| C04-two-charts-ecluster | 0.33 → 0.35 (+0.02) | 0.49 → 0.51 (+0.02) | 0 → 0 |
| C05-timeline-ecluster | 0.17 → 0.00 (-0.17) | 0.15 → 0.08 (-0.07) | 0 → 0 |
| C06-exec-summary-mindcraft | 0.00 → 0.00 (+0.00) | 0.08 → 0.10 (+0.02) | 0 → 0 |
| C07-scenario-lines-mindcraft | 0.39 → 0.43 (+0.04) | 0.51 → 0.53 (+0.03) | 0 → 0 |
| C08-risk-matrix-mindcraft | 0.41 → 0.47 (+0.06) | 0.37 → 0.41 (+0.04) | 0 → 0 |
| C09-sensitivity-truenorth | 0.50 → 0.50 (-0.00) | 0.40 → 0.37 (-0.03) | 0 → 0 |
| C10-strategy-table-truenorth | 0.32 → 0.26 (-0.06) | 0.43 → 0.40 (-0.03) | 0 → 0 |

Mean layout 0.281 → 0.271, visual 0.316 → 0.319. Cases worse by 0.14 or more on the per-case mean layout or visual: C05-timeline-ecluster.
Failed standards before: body margins 10, colours 9, body text size 7, title bold 3, title colour 3, source line 3, leave-one-out 2
