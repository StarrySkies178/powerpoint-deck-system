# Benchmark results: v2.32 suites: Z01 moved to capability (2026-11-23 18:51)

**Regression 8 / 8** (must stay all-pass) · **Capability 0 / 12** · **Total 8 / 20 pass**

Bar for every case: all standards, layout ≥ 0.6, visual ≥ 0.5. One run of the stored builds; a case counts as passing for good only after 3 of 3 fresh rebuilds pass (README, "Noise band").

Environment: LibreOffice 26.2.6.3, poppler 22.02.0, pptxgenjs 4.0.1, aarch64, Python 3.10.12 (the official one)

## Regression suite: 8 / 8

| Case | Result | Standards | Layout | Visual | Failed checks |
|---|---|---|---|---|---|
| D01-data-table | **pass** | 10/10 | 0.89 | 0.95 |  |
| D02-numbered-columns | **pass** | 10/10 | 0.76 | 0.82 |  |
| D03-chevrons-text | **pass** | 10/10 | 0.66 | 0.73 |  |
| D04-issue-tree | **pass** | 10/10 | 0.70 | 0.68 |  |
| D05-org-chart | **pass** | 10/10 | 0.85 | 0.94 |  |
| D06-paired-columns | **pass** | 11/11 | 0.89 | 0.90 |  |
| D07-waterfall | **pass** | 11/11 | 0.85 | 0.91 |  |
| D08-text-and-chart | **pass** | 11/11 | 0.64 | 0.70 |  |

## Capability suite: 0 / 12

| Case | Result | Standards | Layout | Visual | Failed checks |
|---|---|---|---|---|---|
| C01-exec-summary-polaris | fail | 10/11 | 0.00 | 0.27 | body text size (ref median 16.0 / min 14.0 pt; got 15.5 / 12.5 pt) |
| C02-gantt-risks-polaris | fail | 10/11 | 0.10 | 0.21 | body text size (ref median 14.0 / min 12.0 pt; got 13.0 / 9.5 pt) |
| C03-assumptions-table-polaris | fail | 10/10 | 0.05 | 0.27 |  |
| C04-two-charts-ecluster | fail | 11/11 | 0.28 | 0.26 |  |
| C05-timeline-ecluster | fail | 7/10 | 0.00 | 0.00 | body text size (ref median 14.0 / min 14.0 pt; got 10.0 / 9.5 pt); body margins (ref L 0.84 R 1.10; got L 0.27 R 0.26 in); colours (off-palette #9CCCE4) |
| C06-exec-summary-mindcraft | fail | 5/10 | 0.28 | 0.15 | title bold (ref True, got False); title colour (ref #FFFFFF, got #000000 (ΔE 100)); body text size (ref median 14.0 / min 14.0 pt; got 18.0 / 18.0 pt); body margins (ref L 0.39 R 5.05; got L 0.37 R 2.82 in); colours (off-palette #FCCCCC) |
| C07-scenario-lines-mindcraft | fail | 9/11 | 0.17 | 0.24 | colours (off-palette #FCCCCC); source line (ref 10.0 pt at 6.87 in; got 10.0 pt at 7.24 in) |
| C08-risk-matrix-mindcraft | fail | 10/11 | 0.30 | 0.25 | body margins (ref L 0.29 R 0.55; got L 0.38 R 0.28 in) |
| C09-sensitivity-truenorth | fail | 8/10 | 0.26 | 0.34 | body text size (ref median 18.0 / min 18.0 pt; got 14.0 / 11.0 pt); body margins (ref L 0.48 R 0.87; got L 0.60 R 0.62 in) |
| C10-strategy-table-truenorth | fail | 9/11 | 0.00 | 0.04 | body text size (ref median 12.0 / min 12.0 pt; got 9.0 / 9.0 pt); colours (off-palette #3C3C3C) |
| Z01-columns-chinese | fail | 11/12 | 0.78 | – | colours (off-palette #CCE484) |
| Z02-chevrons-chinese | fail | 11/11 | 0.29 | – |  |
