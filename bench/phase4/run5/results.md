# Fresh blind rebuilds: run5

Written by `bench/scripts/bench_rebuilds.py` (2026-11-24 07:49); official environment; unchanged scorer. Three builds per C case, each by its own fresh blind builder. A build that did not run counts 0. Since v2.62 the C cases carry no pass mark: the measure is the overlap with the original before the floor (layout_raw); a case whose mean falls by more than 0.05 against the run before is flagged. The old bar (all standards, layout ≥ 0.6, visual ≥ 0.5) is shown for comparison only.

| Case | r1 | r2 | r3 | Mean layout_raw | Old: mean layout / visual |
|---|---|---|---|---|---|
| C01-exec-summary-polaris | 0.718 (old: fail 10/11 · 0.43 / 0.26) | 0.756 (old: fail 11/11 · 0.50 / 0.21) | 0.775 (old: fail 10/11 · 0.54 / 0.40) | 0.750 | 0.49 / 0.29 |
| C02-gantt-risks-polaris | 0.763 (old: fail 11/11 · 0.33 / 0.30) | 0.725 (old: fail 11/11 · 0.22 / 0.26) | 0.704 (old: fail 11/11 · 0.16 / 0.24) | 0.731 | 0.24 / 0.27 |
| C03-assumptions-table-polaris | 0.378 (old: fail 10/10 · 0.00 / 0.22) | 0.376 (old: fail 10/10 · 0.00 / 0.22) | 0.395 (old: fail 10/10 · 0.00 / 0.23) | 0.383 | 0.00 / 0.22 |
| C04-two-charts-ecluster | 0.792 (old: fail 11/11 · 0.35 / 0.44) | 0.793 (old: fail 11/11 · 0.36 / 0.49) | 0.735 (old: fail 11/11 · 0.17 / 0.40) | 0.774 | 0.29 / 0.44 |
| C05-timeline-ecluster | 0.686 (old: fail 9/10 · 0.00 / 0.00) | 0.702 (old: fail 9/10 · 0.00 / 0.04) | 0.790 (old: fail 9/10 · 0.11 / 0.07) | 0.726 | 0.04 / 0.04 |
| C06-exec-summary-mindcraft | 0.434 (old: fail 6/10 · 0.00 / 0.10) | 0.411 (old: fail 6/10 · 0.00 / 0.06) | 0.419 (old: fail 6/10 · 0.00 / 0.09) | 0.422 | 0.00 / 0.08 |
| C07-scenario-lines-mindcraft | 0.689 (old: fail 8/11 · 0.36 / 0.43) | 0.663 (old: fail 8/11 · 0.31 / 0.42) | 0.674 (old: fail 7/11 · 0.33 / 0.48) | 0.675 | 0.33 / 0.44 |
| C08-risk-matrix-mindcraft | 0.744 (old: fail 9/11 · 0.42 / 0.34) | 0.772 (old: fail 9/11 · 0.48 / 0.43) | 0.719 (old: fail 9/11 · 0.36 / 0.33) | 0.745 | 0.42 / 0.37 |
| C09-sensitivity-truenorth | 0.775 (old: fail 8/10 · 0.47 / 0.35) | 0.787 (old: fail 8/10 · 0.50 / 0.37) | 0.791 (old: fail 8/10 · 0.50 / 0.43) | 0.785 | 0.49 / 0.38 |
| C10-strategy-table-truenorth | 0.781 (old: fail 11/11 · 0.00 / 0.28) | 0.881 (old: fail 11/11 · 0.45 / 0.46) | 0.853 (old: fail 11/11 · 0.32 / 0.41) | 0.838 | 0.26 / 0.38 |

**Builds that ran:** 30 of 30. **Mean over the cases of the per-case mean layout_raw:** 0.683. Old bar: 0 passing builds, mean layout 0.256, visual 0.292.

**Failed standards (number of builds, for information):** body margins 13, colours 9, body text size 8, leave-one-out 3, title bold 3, title colour 3, source line 3

## Against run1

| Case | Mean layout_raw run1 → run5 | Flag | Old: layout run1 → run5 | Old: visual run1 → run5 |
|---|---|---|---|---|
| C01-exec-summary-polaris | 0.716 → 0.750 (+0.034) |  | 0.42 → 0.49 (+0.07) | 0.24 → 0.29 (+0.05) |
| C02-gantt-risks-polaris | 0.745 → 0.731 (-0.014) |  | 0.28 → 0.24 (-0.04) | 0.25 → 0.27 (+0.01) |
| C03-assumptions-table-polaris | 0.415 → 0.383 (-0.032) |  | 0.00 → 0.00 (+0.00) | 0.26 → 0.22 (-0.03) |
| C04-two-charts-ecluster | 0.784 → 0.774 (-0.011) |  | 0.33 → 0.29 (-0.03) | 0.49 → 0.44 (-0.04) |
| C05-timeline-ecluster | 0.803 → 0.726 (-0.077) | **moved back** | 0.17 → 0.04 (-0.13) | 0.15 → 0.04 (-0.11) |
| C06-exec-summary-mindcraft | 0.412 → 0.422 (+0.010) |  | 0.00 → 0.00 (+0.00) | 0.08 → 0.08 (+0.00) |
| C07-scenario-lines-mindcraft | 0.704 → 0.675 (-0.028) |  | 0.39 → 0.33 (-0.06) | 0.51 → 0.44 (-0.06) |
| C08-risk-matrix-mindcraft | 0.741 → 0.745 (+0.004) |  | 0.41 → 0.42 (+0.01) | 0.37 → 0.37 (+0.00) |
| C09-sensitivity-truenorth | 0.789 → 0.785 (-0.005) |  | 0.50 → 0.49 (-0.01) | 0.40 → 0.38 (-0.01) |
| C10-strategy-table-truenorth | 0.853 → 0.838 (-0.015) |  | 0.32 → 0.26 (-0.06) | 0.43 → 0.38 (-0.04) |

Mean layout_raw over the 10 cases in both runs: 0.696 → 0.683. **Cases that moved back by more than 0.05 in layout_raw: C05-timeline-ecluster.** Old rule, for comparison: cases worse by 0.14 or more on layout or visual: none.
