# Roadmap step 1.4: why do the deck-as-reference cases fail?

Written by `bench/scripts/bench_diag.py --report` (2026-11-23 19:16), scored with the unchanged scorer. Bar: all standards, layout ≥ 0.6, visual ≥ 0.5. Each cell: result, standards passed, layout / visual.

- **a** brief as today · **b** brief + plain-words layout description of the original · **c** closest other slide of the same deck from the object store, edited

| Case | a | b | c |
|---|---|---|---|
| C01-exec-summary-polaris | fail 10/11 · 0.37 / 0.37 | fail 11/11 · 0.53 / 0.46 | fail 10/11 · 0.30 / 0.26 |
| C02-gantt-risks-polaris | fail 11/11 · 0.25 / 0.26 | fail 11/11 · 0.25 / 0.19 | fail 11/11 · 0.38 / 0.22 |
| C03-assumptions-table-polaris | fail 10/10 · 0.00 / 0.18 | fail 10/10 · 0.38 / 0.61 | fail 10/10 · 0.00 / 0.23 |
| C04-two-charts-ecluster | fail 11/11 · 0.46 / 0.53 | fail 11/11 · 0.52 / 0.55 | fail 11/11 · 0.53 / 0.60 |
| C05-timeline-ecluster | fail 9/10 · 0.11 / 0.09 | fail 9/10 · 0.32 / 0.25 | fail 8/10 · 0.00 / 0.01 |
| C06-exec-summary-mindcraft | fail 6/10 · 0.00 / 0.03 | fail 7/10 · 0.87 / 0.27 | fail 7/10 · 0.00 / 0.10 |
| C07-scenario-lines-mindcraft | fail 8/11 · 0.42 / 0.49 | fail 7/11 · 0.42 / 0.46 | fail 7/11 · 0.43 / 0.54 |
| C08-risk-matrix-mindcraft | fail 10/11 · 0.42 / 0.29 | fail 10/11 · 0.47 / 0.32 | fail 10/11 · 0.32 / 0.28 |
| C09-sensitivity-truenorth | fail 9/10 · 0.65 / 0.58 | fail 9/10 · 0.50 / 0.41 | fail 8/10 · 0.45 / 0.34 |
| C10-strategy-table-truenorth | fail 10/11 · 0.17 / 0.28 | fail 10/11 · 0.13 / 0.47 | fail 10/10 · 0.00 / 0.20 |

## Failed standards

| Case | a | b | c |
|---|---|---|---|
| C01-exec-summary-polaris | body text size (ref median 16.0 / min 14.0 pt; got 14.0 / 12.0 pt) |  | body text size (ref median 16.0 / min 14.0 pt; got 14.0 / 12.0 pt) |
| C02-gantt-risks-polaris |  |  |  |
| C03-assumptions-table-polaris |  |  |  |
| C04-two-charts-ecluster |  |  |  |
| C05-timeline-ecluster | body margins (ref L 0.84 R 1.10; got L 0.27 R 0.26 in) | body margins (ref L 0.84 R 1.10; got L 0.27 R 0.26 in) | title position (ref left 0.00 top 0.78; got left 0.35 top 0.76 in); body margins (ref L 0.84 R 1.10; got L 0.27 R 0.27 in) |
| C06-exec-summary-mindcraft | title bold (ref True, got False); title colour (ref #FFFFFF, got #000000 (ΔE 100)); body margins (ref L 0.39 R 5.05; got L 0.37 R 0.28 in); colours (off-palette #FCCCCC) | title bold (ref True, got False); title colour (ref #FFFFFF, got #000000 (ΔE 100)); body margins (ref L 0.39 R 5.05; got L 0.39 R 4.34 in) | title bold (ref True, got False); title colour (ref #FFFFFF, got #000000 (ΔE 100)); body margins (ref L 0.39 R 5.05; got L 0.39 R 0.28 in) |
| C07-scenario-lines-mindcraft | body text size (ref median 14.0 / min 12.0 pt; got 12.0 / 10.0 pt); colours (off-palette #FCCCCC); source line (ref 10.0 pt at 6.87 in; got 10.0 pt at 7.24 in) | body text size (ref median 14.0 / min 12.0 pt; got 12.0 / 10.0 pt); body margins (ref L 0.37 R 0.28; got L 0.06 R 0.57 in); colours (off-palette #FCCCCC); source line (ref 10.0 pt at 6.87 in; got 10.0 pt at 7.24 in) | body text size (ref median 14.0 / min 12.0 pt; got 12.0 / 10.0 pt); body margins (ref L 0.37 R 0.28; got L 0.37 R 0.58 in); colours (off-palette #FCCCCC); source line (ref 10.0 pt at 6.87 in; got 10.0 pt at 7.24 in) |
| C08-risk-matrix-mindcraft | body text size (ref median 14.0 / min 12.0 pt; got 12.0 / 11.0 pt) | body text size (ref median 14.0 / min 12.0 pt; got 12.0 / 10.0 pt) | body text size (ref median 14.0 / min 12.0 pt; got 11.0 / 10.5 pt); leave-one-out (build.js: words from the target's row in Style/slide-map.csv ('heat map likelihood x severity' and more)) |
| C09-sensitivity-truenorth | body text size (ref median 18.0 / min 18.0 pt; got 13.0 / 11.0 pt) | body text size (ref median 18.0 / min 18.0 pt; got 12.0 / 12.0 pt) | body text size (ref median 18.0 / min 18.0 pt; got 12.0 / 12.0 pt); body margins (ref L 0.48 R 0.87; got L 0.30 R 1.48 in) |
| C10-strategy-table-truenorth | body text size (ref median 12.0 / min 12.0 pt; got 10.5 / 10.0 pt) | body text size (ref median 12.0 / min 12.0 pt; got 10.5 / 10.0 pt) |  |

## Summary

| | b minus a | c minus a |
|---|---|---|
| layout | mean +0.154 (cases 10; up by ≥ 0.14: 4, down by ≥ 0.14: 1) | mean -0.044 (cases 10; up by ≥ 0.14: 0, down by ≥ 0.14: 2) |
| visual | mean +0.089 (cases 10) | mean -0.032 (cases 10) |
| passing cases | b: 0 of 10 | c: 0 of 10 (a: 0 of 10) |

A layout difference under 0.14 in a single case is noise (bench/README.md, "Noise band": spreads up to 0.14 between three rebuilds of the same prompt).
