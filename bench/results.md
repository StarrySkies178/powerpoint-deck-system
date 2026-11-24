# Benchmark results: v2.62 Run 2c step 4: C cases reported by layout_raw, no pass mark (stored builds) (2026-11-24 06:45)

**Regression 7 / 7** (must stay all-pass) · **Named-slide capability 1 / 3** · **Deck-as-reference: 10 cases, no pass mark, 0 moved back by more than 0.05**

Bar for regression and named-slide cases: all standards, layout ≥ 0.6, visual ≥ 0.5. Deck-as-reference cases (C01 to C10) carry no pass mark since v2.62 (decided with the user 2026-11-24 14:40): they report the overlap with the original before the floor (layout_raw) and its change against the previous run; a fall of more than 0.05 is flagged. One run of the stored builds; claims about progress use 3 fresh rebuilds (README, "Noise band" and "Deck-as-reference cases").

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

## Capability suite, named-slide cases: 1 / 3

| Case | Result | Standards | Layout | Visual | Failed checks |
|---|---|---|---|---|---|
| D02-numbered-columns | fail | 9/10 | 0.76 | 0.82 | colours (off-palette #B4E4FC) |
| Z01-columns-chinese | **pass** | 12/12 | 0.69 | – |  |
| Z02-chevrons-chinese | fail | 11/11 | 0.30 | – |  |

## Capability suite, deck-as-reference cases (no pass mark)

| Case | Overlap before the floor (layout_raw) | Previous run | Change | Flag | Standards (for information) | Failed checks |
|---|---|---|---|---|---|---|
| C01-exec-summary-polaris | 0.504 | 0.504 | +0.000 |  | 10/11 | body text size (ref median 16.0 / min 14.0 pt; got 15.5 / 12.5 pt) |
| C02-gantt-risks-polaris | 0.662 | 0.662 | +0.000 |  | 10/11 | body text size (ref median 14.0 / min 12.0 pt; got 13.0 / 9.5 pt) |
| C03-assumptions-table-polaris | 0.431 | 0.431 | +0.000 |  | 10/10 |  |
| C04-two-charts-ecluster | 0.757 | 0.757 | +0.000 |  | 11/11 |  |
| C05-timeline-ecluster | 0.649 | 0.649 | +0.000 |  | 7/10 | body text size (ref median 14.0 / min 14.0 pt; got 10.0 / 9.5 pt); body margins (ref L 0.84 R 1.10; got L 0.27 R 0.26 in); colours (off-palette #9CCCE4) |
| C06-exec-summary-mindcraft | 0.611 | 0.611 | +0.000 |  | 5/10 | title bold (ref True, got False); title colour (ref #FFFFFF, got #000000 (ΔE 100)); body text size (ref median 14.0 / min 14.0 pt; got 18.0 / 18.0 pt); body margins (ref L 0.39 R 5.05; got L 0.37 R 2.82 in); colours (off-palette #E48484) |
| C07-scenario-lines-mindcraft | 0.577 | 0.577 | +0.000 |  | 9/11 | colours (off-palette #E48484); source line (ref 10.0 pt at 6.87 in; got 10.0 pt at 7.24 in) |
| C08-risk-matrix-mindcraft | 0.703 | 0.703 | +0.000 |  | 10/11 | body margins (ref L 0.29 R 0.55; got L 0.38 R 0.28 in) |
| C09-sensitivity-truenorth | 0.686 | 0.686 | +0.000 |  | 8/10 | body text size (ref median 18.0 / min 18.0 pt; got 14.0 / 11.0 pt); body margins (ref L 0.48 R 0.87; got L 0.60 R 0.62 in) |
| C10-strategy-table-truenorth | 0.756 | 0.756 | +0.000 |  | 9/11 | body text size (ref median 12.0 / min 12.0 pt; got 9.0 / 9.0 pt); colours (off-palette #3C3C3C) |

Old bar, for comparison only: 0 of 10 would pass (layout after the floor: C01 0.00, C02 0.04, C03 0.00, C04 0.24, C05 0.00, C06 0.27, C07 0.14, C08 0.32, C09 0.25, C10 0.00).
