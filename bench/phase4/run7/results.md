# Fresh blind rebuilds: run7

Written by `bench/scripts/bench_rebuilds.py` (2026-11-24 08:36); official environment; unchanged scorer. Three builds per C case, each by its own fresh blind builder. A build that did not run counts 0. Since v2.62 the C cases carry no pass mark: the measure is the overlap with the original before the floor (layout_raw); a case whose mean falls by more than 0.05 against the run before is flagged. The old bar (all standards, layout ≥ 0.6, visual ≥ 0.5) is shown for comparison only.

| Case | r1 | r2 | r3 | Mean layout_raw | Old: mean layout / visual |
|---|---|---|---|---|---|
| C01-exec-summary-polaris | 0.756 (old: fail 10/11 · 0.50 / 0.30) | 0.791 (old: fail 10/11 · 0.57 / 0.24) | 0.738 (old: fail 10/11 · 0.47 / 0.31) | 0.761 | 0.51 / 0.28 |
| C02-gantt-risks-polaris | 0.746 (old: fail 11/11 · 0.28 / 0.27) | 0.700 (old: fail 11/11 · 0.15 / 0.30) | 0.712 (old: fail 11/11 · 0.18 / 0.31) | 0.719 | 0.20 / 0.29 |
| C03-assumptions-table-polaris | 0.414 (old: fail 10/10 · 0.00 / 0.25) | 0.378 (old: fail 10/10 · 0.00 / 0.22) | 0.413 (old: fail 10/10 · 0.00 / 0.25) | 0.402 | 0.00 / 0.24 |
| C04-two-charts-ecluster | 0.713 (old: fail 11/11 · 0.10 / 0.44) | 0.741 (old: fail 11/11 · 0.19 / 0.47) | 0.795 (old: fail 11/11 · 0.36 / 0.52) | 0.749 | 0.22 / 0.48 |
| C05-timeline-ecluster | 0.643 (old: fail 9/10 · 0.00 / 0.00) | 0.644 (old: fail 9/10 · 0.00 / 0.00) | 0.745 (old: fail 9/10 · 0.00 / 0.00) | 0.678 | 0.00 / 0.00 |
| C06-exec-summary-mindcraft | 0.401 (old: fail 6/10 · 0.00 / 0.07) | 0.413 (old: fail 6/10 · 0.00 / 0.04) | 0.382 (old: fail 6/10 · 0.00 / 0.08) | 0.398 | 0.00 / 0.06 |
| C07-scenario-lines-mindcraft | 0.706 (old: fail 8/11 · 0.40 / 0.44) | 0.687 (old: fail 9/11 · 0.36 / 0.40) | 0.712 (old: fail 9/11 · 0.41 / 0.42) | 0.702 | 0.39 / 0.42 |
| C08-risk-matrix-mindcraft | 0.762 (old: fail 10/11 · 0.46 / 0.38) | 0.753 (old: fail 11/11 · 0.44 / 0.36) | 0.729 (old: fail 10/11 · 0.38 / 0.32) | 0.748 | 0.43 / 0.35 |
| C09-sensitivity-truenorth | 0.758 (old: fail 8/10 · 0.43 / 0.28) | 0.775 (old: fail 8/10 · 0.47 / 0.41) | 0.709 (old: fail 8/10 · 0.31 / 0.41) | 0.747 | 0.40 / 0.37 |
| C10-strategy-table-truenorth | 0.768 (old: fail 10/10 · 0.00 / 0.33) | 0.843 (old: fail 11/11 · 0.27 / 0.36) | 0.782 (old: fail 11/11 · 0.00 / 0.37) | 0.798 | 0.09 / 0.35 |

**Builds that ran:** 30 of 30. **Mean over the cases of the per-case mean layout_raw:** 0.670. Old bar: 0 passing builds, mean layout 0.224, visual 0.285.

**Failed standards (number of builds, for information):** body margins 11, body text size 7, colours 6, title bold 3, title colour 3, source line 3

## Against run1

| Case | Mean layout_raw run1 → run7 | Flag | Old: layout run1 → run7 | Old: visual run1 → run7 |
|---|---|---|---|---|
| C01-exec-summary-polaris | 0.716 → 0.761 (+0.046) |  | 0.42 → 0.51 (+0.09) | 0.24 → 0.28 (+0.05) |
| C02-gantt-risks-polaris | 0.745 → 0.719 (-0.026) |  | 0.28 → 0.20 (-0.08) | 0.25 → 0.29 (+0.04) |
| C03-assumptions-table-polaris | 0.415 → 0.402 (-0.013) |  | 0.00 → 0.00 (+0.00) | 0.26 → 0.24 (-0.02) |
| C04-two-charts-ecluster | 0.784 → 0.749 (-0.035) |  | 0.33 → 0.22 (-0.11) | 0.49 → 0.48 (-0.01) |
| C05-timeline-ecluster | 0.803 → 0.678 (-0.126) | **moved back** | 0.17 → 0.00 (-0.17) | 0.15 → 0.00 (-0.15) |
| C06-exec-summary-mindcraft | 0.412 → 0.398 (-0.013) |  | 0.00 → 0.00 (+0.00) | 0.08 → 0.06 (-0.02) |
| C07-scenario-lines-mindcraft | 0.704 → 0.702 (-0.002) |  | 0.39 → 0.39 (+0.00) | 0.51 → 0.42 (-0.09) |
| C08-risk-matrix-mindcraft | 0.741 → 0.748 (+0.007) |  | 0.41 → 0.43 (+0.02) | 0.37 → 0.35 (-0.01) |
| C09-sensitivity-truenorth | 0.789 → 0.747 (-0.042) |  | 0.50 → 0.40 (-0.10) | 0.40 → 0.37 (-0.03) |
| C10-strategy-table-truenorth | 0.853 → 0.798 (-0.056) | **moved back** | 0.32 → 0.09 (-0.23) | 0.43 → 0.35 (-0.07) |

Mean layout_raw over the 10 cases in both runs: 0.696 → 0.670. **Cases that moved back by more than 0.05 in layout_raw: C05-timeline-ecluster, C10-strategy-table-truenorth.** Old rule, for comparison: cases worse by 0.14 or more on layout or visual: C05-timeline-ecluster, C10-strategy-table-truenorth.
