# Benchmark results: v2.51 Run 2 not kept: restored v2.49 files, stored builds (2026-11-24 04:25)

**Regression 7 / 7** (must stay all-pass) · **Capability 1 / 13** · **Total 8 / 20 pass**

Bar for every case: all standards, layout ≥ 0.6, visual ≥ 0.5. One run of the stored builds; a case counts as passing for good only after 3 of 3 fresh rebuilds pass (README, "Noise band").

Environment: LibreOffice 26.2.6.3, poppler 22.02.0, pptxgenjs 4.0.1, aarch64, Python 3.10.12 (the official one)

## Regression suite: 7 / 7

| Case | Result | Standards | Layout | Visual | Failed checks |
|---|---|---|---|---|---|
| D01-data-table | **pass** | 10/10 | 0.82 | 0.91 |  |
| D03-chevrons-text | **pass** | 10/10 | 0.65 | 0.72 |  |
| D04-issue-tree | **pass** | 10/10 | 0.70 | 0.66 |  |
| D05-org-chart | **pass** | 10/10 | 0.85 | 0.92 |  |
| D06-paired-columns | **pass** | 11/11 | 0.77 | 0.82 |  |
| D07-waterfall | **pass** | 11/11 | 0.79 | 0.87 |  |
| D08-text-and-chart | **pass** | 11/11 | 0.62 | 0.68 |  |

## Capability suite: 1 / 13

| Case | Result | Standards | Layout | Visual | Failed checks |
|---|---|---|---|---|---|
| D02-numbered-columns | fail | 9/10 | 0.76 | 0.82 | colours (off-palette #B4E4FC) |
| C01-exec-summary-polaris | fail | 10/11 | 0.00 | 0.24 | body text size (ref median 16.0 / min 14.0 pt; got 15.5 / 12.5 pt) |
| C02-gantt-risks-polaris | fail | 10/11 | 0.04 | 0.19 | body text size (ref median 14.0 / min 12.0 pt; got 13.0 / 9.5 pt) |
| C03-assumptions-table-polaris | fail | 10/10 | 0.03 | 0.32 |  |
| C04-two-charts-ecluster | fail | 11/11 | 0.24 | 0.25 |  |
| C05-timeline-ecluster | fail | 7/10 | 0.00 | 0.01 | body text size (ref median 14.0 / min 14.0 pt; got 10.0 / 9.5 pt); body margins (ref L 0.84 R 1.10; got L 0.27 R 0.26 in); colours (off-palette #9CCCE4) |
| C06-exec-summary-mindcraft | fail | 5/10 | 0.27 | 0.16 | title bold (ref True, got False); title colour (ref #FFFFFF, got #000000 (ΔE 100)); body text size (ref median 14.0 / min 14.0 pt; got 18.0 / 18.0 pt); body margins (ref L 0.39 R 5.05; got L 0.37 R 2.82 in); colours (off-palette #E48484) |
| C07-scenario-lines-mindcraft | fail | 9/11 | 0.14 | 0.29 | colours (off-palette #E48484); source line (ref 10.0 pt at 6.87 in; got 10.0 pt at 7.24 in) |
| C08-risk-matrix-mindcraft | fail | 10/11 | 0.32 | 0.28 | body margins (ref L 0.29 R 0.55; got L 0.38 R 0.28 in) |
| C09-sensitivity-truenorth | fail | 8/10 | 0.25 | 0.30 | body text size (ref median 18.0 / min 18.0 pt; got 14.0 / 11.0 pt); body margins (ref L 0.48 R 0.87; got L 0.60 R 0.62 in) |
| C10-strategy-table-truenorth | fail | 9/11 | 0.00 | 0.03 | body text size (ref median 12.0 / min 12.0 pt; got 9.0 / 9.0 pt); colours (off-palette #3C3C3C) |
| Z01-columns-chinese | **pass** | 12/12 | 0.69 | – |  |
| Z02-chevrons-chinese | fail | 11/11 | 0.30 | – |  |
