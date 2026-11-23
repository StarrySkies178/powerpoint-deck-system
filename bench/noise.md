# Noise band: the same prompt built again by fresh builders

Written by `bench/scripts/bench_noise.py --report` (2026-11-23 18:24). Bar: all standards, layout ≥ 0.6, visual ≥ 0.5. Stored = the case's own build.js in the last full run; runs 1 to 3 = three builds written again from prompt.md alone, each by a fresh builder.

| Case | Suite | Stored | Run 1 | Run 2 | Run 3 | Passes | Layout range (spread) | Visual range (spread) |
|---|---|---|---|---|---|---|---|---|
| C04-two-charts-ecluster | capability | fail 11/11 · 0.28 / 0.26 | fail 10/11 · 0.12 / 0.25 | fail 10/11 · 0.22 / 0.30 | fail 10/11 · 0.24 / 0.27 | 0 of 3 | 0.12 to 0.24 (0.12) | 0.25 to 0.30 (0.05) |
|  |  |  | run1 failed: body text size (ref median 15.0 / min 10.0 pt; got 13.0 / 10.0 pt) |  |  |  |  |  |
|  |  |  | run2 failed: body text size (ref median 15.0 / min 10.0 pt; got 12.0 / 10.0 pt) |  |  |  |  |  |
|  |  |  | run3 failed: body text size (ref median 15.0 / min 10.0 pt; got 12.0 / 10.0 pt) |  |  |  |  |  |
| C07-scenario-lines-mindcraft | capability | fail 9/11 · 0.17 / 0.24 | fail 8/11 · 0.37 / 0.42 | fail 8/11 · 0.37 / 0.43 | fail 8/11 · 0.47 / 0.51 | 0 of 3 | 0.37 to 0.47 (0.10) | 0.42 to 0.51 (0.09) |
|  |  |  | run1 failed: body text size (ref median 14.0 / min 12.0 pt; got 14.0 / 10.0 pt); colours (off-palette #FCCCCC); source line (ref 10.0 pt at 6.87 in; got 10.0 pt at 7.24 in) |  |  |  |  |  |
|  |  |  | run2 failed: body text size (ref median 14.0 / min 12.0 pt; got 12.0 / 10.0 pt); colours (off-palette #FCCCCC); source line (ref 10.0 pt at 6.87 in; got 10.0 pt at 7.24 in); leave-one-out (build.js: words from the target's row in Style/slide-map.csv ('cagr column capex line chart')) |  |  |  |  |  |
|  |  |  | run3 failed: body text size (ref median 14.0 / min 12.0 pt; got 12.0 / 10.0 pt); colours (off-palette #FCCCCC); source line (ref 10.0 pt at 6.87 in; got 10.0 pt at 7.24 in) |  |  |  |  |  |
| D03-chevrons-text | regression | **pass** 10/10 · 0.66 / 0.73 | **pass** 10/10 · 0.69 / 0.80 | **pass** 10/10 · 0.70 / 0.83 | **pass** 10/10 · 0.70 / 0.80 | 3 of 3 | 0.69 to 0.70 (0.01) | 0.80 to 0.83 (0.03) |
| D04-issue-tree | regression | **pass** 10/10 · 0.70 / 0.68 | **pass** 10/10 · 0.87 / 0.84 | **pass** 10/10 · 0.87 / 0.84 | **pass** 10/10 · 0.87 / 0.85 | 3 of 3 | 0.87 to 0.87 (0.00) | 0.84 to 0.85 (0.01) |
| D08-text-and-chart | regression | **pass** 11/11 · 0.64 / 0.70 | **pass** 11/11 · 0.85 / 0.92 | **pass** 11/11 · 0.85 / 0.92 | **pass** 11/11 · 0.85 / 0.92 | 3 of 3 | 0.85 to 0.85 (0.00) | 0.92 to 0.92 (0.00) |

Cells: result, standards passed, layout / visual.
