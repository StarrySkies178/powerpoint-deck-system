# Fresh blind rebuilds: run2a-final

Written by `bench/scripts/bench_rebuilds.py` (2026-11-24 06:45); official environment; unchanged scorer. Three builds per C case, each by its own fresh blind builder. A build that did not run counts 0. Since v2.62 the C cases carry no pass mark: the measure is the overlap with the original before the floor (layout_raw); a case whose mean falls by more than 0.05 against the run before is flagged. The old bar (all standards, layout ≥ 0.6, visual ≥ 0.5) is shown for comparison only.

| Case | r1 | r2 | r3 | Mean layout_raw | Old: mean layout / visual |
|---|---|---|---|---|---|
| C03-assumptions-table-polaris | 0.408 (old: fail 10/10 · 0.00 / 0.25) | 0.402 (old: fail 10/10 · 0.00 / 0.24) | 0.428 (old: fail 10/10 · 0.00 / 0.26) | 0.413 | 0.00 / 0.25 |
| C08-risk-matrix-mindcraft | 0.750 (old: fail 10/11 · 0.43 / 0.37) | 0.752 (old: fail 9/11 · 0.43 / 0.40) | 0.748 (old: fail 9/11 · 0.42 / 0.40) | 0.750 | 0.43 / 0.39 |
| C10-strategy-table-truenorth | 0.837 (old: fail 10/10 · 0.24 / 0.43) | 0.842 (old: fail 11/11 · 0.27 / 0.31) | 0.887 (old: fail 11/11 · 0.48 / 0.36) | 0.855 | 0.33 / 0.37 |

**Builds that ran:** 9 of 9. **Mean over the cases of the per-case mean layout_raw:** 0.673. Old bar: 0 passing builds, mean layout 0.252, visual 0.336.

**Failed standards (number of builds, for information):** colours 3, body margins 2, leave-one-out 1

## Against run2a

| Case | Mean layout_raw run2a → run2a-final | Flag | Old: layout run2a → run2a-final | Old: visual run2a → run2a-final |
|---|---|---|---|---|
| C03-assumptions-table-polaris | 0.402 → 0.413 (+0.011) |  | 0.00 → 0.00 (+0.00) | 0.24 → 0.25 (+0.01) |
| C08-risk-matrix-mindcraft | 0.739 → 0.750 (+0.011) |  | 0.41 → 0.43 (+0.02) | 0.36 → 0.39 (+0.03) |
| C10-strategy-table-truenorth | 0.852 → 0.855 (+0.003) |  | 0.31 → 0.33 (+0.02) | 0.37 → 0.37 (+0.00) |

Mean layout_raw over the 3 cases in both runs: 0.664 → 0.673. **Cases that moved back by more than 0.05 in layout_raw: none.** Old rule, for comparison: cases worse by 0.14 or more on layout or visual: none.
