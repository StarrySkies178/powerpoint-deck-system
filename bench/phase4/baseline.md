# Re-baseline of the deck-as-reference rebuilds (measuring tool only)

Written by `bench/phase4/baseline.py` (2026-11-24 09:14), official environment, from the stored scores of each run (`bench_rebuilds.load`). **Nothing in `bench_rebuilds.py` or its rule changed**: today every run is still compared with the run before (run1), with a band of 0.05 on the mean `layout_raw` of 3 fresh builds. This file prepares the alternative the planner put to Mike: each case compared with its mean over all fresh builds made with kept code.

**Builds counted (kept code):** `run0` = v2.46 baseline (Run 0); `run1` = Run 1, body text size (v2.49, kept); `run2a-final` = Run 2a closed, final table code (v2.59, kept; C03, C08, C10 only).

**Left out:** `run2a` (Run 2a's first 9 builds: made while table() still forced 14 pt, so not the code kept (v2.59 rebuilt them as run2a-final)); `run2` (not kept (v2.51)); `run5` (not kept (v2.68)); `run7` (not kept (v2.70)). The 15 noise rebuilds of v2.25 (`cases/<id>/noise/`) are also left out: older code, scored against the LibreOffice originals of that day.

## Baseline per case

| Case | Builds | From | Mean layout_raw | SD | Min to max | run1 mean | run1 minus baseline |
|---|---|---|---|---|---|---|---|
| C01-exec-summary-polaris | 6 | run0 (3), run1 (3) | 0.692 | 0.058 | 0.621 to 0.766 | 0.716 | +0.024 |
| C02-gantt-risks-polaris | 6 | run0 (3), run1 (3) | 0.736 | 0.019 | 0.704 to 0.755 | 0.745 | +0.009 |
| C03-assumptions-table-polaris | 9 | run0 (3), run1 (3), run2a-final (3) | 0.410 | 0.017 | 0.384 to 0.437 | 0.415 | +0.005 |
| C04-two-charts-ecluster | 6 | run0 (3), run1 (3) | 0.801 | 0.038 | 0.747 to 0.859 | 0.784 | -0.017 |
| C05-timeline-ecluster | 6 | run0 (3), run1 (3) | 0.786 | 0.040 | 0.712 to 0.820 | 0.803 | +0.018 |
| C06-exec-summary-mindcraft | 6 | run0 (3), run1 (3) | 0.423 | 0.033 | 0.375 to 0.465 | 0.412 | -0.011 |
| C07-scenario-lines-mindcraft | 6 | run0 (3), run1 (3) | 0.707 | 0.013 | 0.693 to 0.723 | 0.704 | -0.004 |
| C08-risk-matrix-mindcraft | 9 | run0 (3), run1 (3), run2a-final (3) | 0.745 | 0.014 | 0.724 to 0.764 | 0.741 | -0.005 |
| C09-sensitivity-truenorth | 6 | run0 (3), run1 (3) | 0.788 | 0.017 | 0.769 to 0.817 | 0.789 | +0.001 |
| C10-strategy-table-truenorth | 9 | run0 (3), run1 (3), run2a-final (3) | 0.847 | 0.020 | 0.820 to 0.887 | 0.853 | +0.006 |

## The tried runs against this baseline, for information (no verdict changes here)

Mean of the run's 3 builds minus the baseline mean. A fall of more than 0.05 is marked. Today's rule compares with run1 instead.

| Case | run2 vs baseline | run5 vs baseline | run7 vs baseline | run2 vs run1 | run5 vs run1 | run7 vs run1 |
|---|---|---|---|---|---|---|
| C01-exec-summary-polaris | +0.038 | +0.058 | +0.070 | +0.014 | +0.034 | +0.046 |
| C02-gantt-risks-polaris | -0.002 | -0.006 | -0.017 | -0.010 | -0.014 | -0.026 |
| C03-assumptions-table-polaris | -0.005 | -0.027 | -0.008 | -0.010 | -0.032 | -0.013 |
| C04-two-charts-ecluster | -0.010 | -0.028 | -0.052 **back** | +0.007 | -0.011 | -0.035 |
| C05-timeline-ecluster | -0.054 **back** | -0.060 **back** | -0.108 **back** | -0.072 **back** | -0.077 **back** | -0.126 **back** |
| C06-exec-summary-mindcraft | +0.023 | -0.001 | -0.024 | +0.034 | +0.010 | -0.013 |
| C07-scenario-lines-mindcraft | +0.013 | -0.032 | -0.005 | +0.016 | -0.028 | -0.002 |
| C08-risk-matrix-mindcraft | +0.024 | -0.000 | +0.003 | +0.028 | +0.004 | +0.007 |
| C09-sensitivity-truenorth | -0.002 | -0.003 | -0.041 | -0.003 | -0.005 | -0.042 |
| C10-strategy-table-truenorth | -0.007 | -0.009 | -0.050 | -0.012 | -0.015 | -0.056 **back** |

## Reading

- **Spread between builds of the same case, kept code only:** mean SD 0.027 per build, so the mean of 3 builds has an SD of about 0.016, and the difference of two such means about 0.022. The 0.05 band is about 2.3 of these. This spread now includes differences between runs (other builders, other days, the kept changes themselves), which the v2.62 band (0.027 within a run) did not.
- **C05 is not explained by run1 alone.** run1 sits only 0.018 above the baseline, and C05 still falls by more than 0.05 against the baseline in all three tried runs (run2, run5, run7), whose changes did not touch timelines. All three were built after run1, so something that changed between run1 and the later runs and that C05's builders depend on (for example the files they read, or how the builders approach a Gantt) is a better candidate than the changes themselves. A run with no change at all would settle it.
- **Run 7 against the baseline:** C05 −0.108 and C04 −0.052 fall beyond 0.05; C10 is −0.050, on the edge (against run1 it was −0.056). C04 is a case Run 7 touches (the share column), so under the alternative rule C04, not C10, would be the question.
- The rule itself (which cases count against a change, and what it is compared with) is the user's decision; this file only gives the numbers both ways.
