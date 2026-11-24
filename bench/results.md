# Benchmark results: Store fix 7 (table_size: even column indents, banded rows, clean id): regression after (2026-11-24 12:08)

**Regression 7 / 7** (must stay all-pass) · **Named-slide capability 0 / 0** · **Deck-as-reference: 0 cases, no pass mark, 0 moved back by more than 0.05**

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
