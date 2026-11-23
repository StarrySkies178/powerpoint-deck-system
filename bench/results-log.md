# Benchmark history

| When | Run | Pass | Standards OK | Mean layout | Mean visual |
|---|---|---|---|---|---|
| 2026-11-23 15:54 | round 1: framework as it is (20 cases) | 0/20 | 78/208 | 0.09 | 0.06 |
| 2026-11-23 15:59 | round 2: style profiles + treeDown (20 cases) | 0/20 | 153/208 | 0.16 | 0.12 |
| 2026-11-23 16:03 | round 3: title edge pinned, scorer wraps with real font metrics (20 cases) | 0/20 | 161/208 | 0.19 | 0.16 |
| 2026-11-23 16:07 | round 4: named-slide path (object store) for D/Z (10 cases) | 4/10 | 99/106 | 0.70 | 0.70 |
| 2026-11-23 16:08 | round 5: stored objects keep their original colours (named slide) (10 cases) | 9/10 | 106/106 | 0.74 | 0.83 |
| 2026-11-23 16:08 | round 5b: deck-style mode (C cases) (10 cases) | 0/10 | 79/106 | 0.12 | 0.12 |
| 2026-11-23 16:09 | round 6: deck-style mode, type scale + reference tints + title width (10 cases) | 0/10 | 82/106 | 0.12 | 0.15 |
| 2026-11-23 16:11 | round 7: title width from right edge; deck palette for deck references (10 cases) | 0/10 | 87/106 | 0.13 | 0.17 |
| 2026-11-23 16:13 | round 7b: full run (20 cases) | 9/20 | 193/212 | 0.43 | 0.46 |
| 2026-11-23 16:15 | round 7c: title position measured on the render (20 cases) | 9/20 | 195/212 | 0.43 | 0.46 |
| 2026-11-23 16:17 | round 7d: full run (render-measured title) (20 cases) | 9/20 | 196/212 | 0.43 | 0.46 |
| 2026-11-23 16:26 | final: run from the folder layout (generators v2.4, store with original colours) (20 cases) | 9/20 | 196/212 | 0.43 | 0.46 |
| 2026-11-23 08:29 | check on the user's machine (D06, C03) (2 cases) | 1/2 | 21/21 | 0.52 | 0.50 |
| 2026-11-23 20:38 | v2.6 try: sibling layouts + deck panel headers + table rules (C cases) (10 cases) | 0/10 | 89/106 | 0.17 | 0.21 |
| 2026-11-23 20:39 | v2.6: sibling layouts, deck panel headers, table rules (full run) (20 cases) | 9/20 | 195/212 | 0.45 | 0.48 |
| 2026-11-23 20:40 | v2.6: C04 cards at the deck's body size (1 cases) | 0/1 | 10/11 | 0.34 | 0.19 |
| 2026-11-23 20:42 | v2.6: native chart labels measured (scorer), full run (20 cases) | 9/20 | 195/212 | 0.45 | 0.49 |
| 2026-11-23 20:42 | v2.6: chart labels at the deck's body size when it has no native charts (full run) (20 cases) | 9/20 | 195/212 | 0.45 | 0.49 |
| 2026-11-23 20:43 | v2.6: single-series highlight charts follow the reference chart style (full run) (20 cases) | 9/20 | 195/212 | 0.45 | 0.49 |
| 2026-11-23 20:43 | v2.6: C04 CAGR table as in the prompt (1 cases) | 0/1 | 11/11 | 0.33 | 0.26 |
| 2026-11-23 20:44 | v2.6 final: sibling layouts, deck panel headers, table rules, deck chart text (full run) (20 cases) | 9/20 | 196/212 | 0.45 | 0.49 |
| 2026-11-23 12:45 | v2.6 check on the user's machine (C04, C09) (2 cases) | 0/2 | 19/21 | 0.30 | 0.33 |
| 2026-11-23 21:23 | v2.7: source line kept on the slide, venn label contrast (full run) (20 cases) | 9/20 | 196/212 | 0.45 | 0.49 |
| 2026-11-23 21:56 | v2.10: letteredSummary kpis column (full run) (20 cases) | 9/20 | 196/212 | 0.45 | 0.49 |
| 2026-11-24 00:23 | v2.16 reference density: readings, icons, breadcrumb, photo cover (20 cases) | 9/20 | 196/212 | 0.44 | 0.49 |
| 2026-11-24 00:40 | v2.18 form tags, repeat check, positioningMap bubble size (20 cases) | 9/20 | 196/212 | 0.44 | 0.49 |
| 2026-11-24 01:42 | check: fresh copy at v2.24, nothing changed (20 cases) | 9/20 | 196/212 | 0.44 | 0.49 |
| 2026-11-24 01:47 | v2.25 two suites (step 1.1), builds unchanged (20 cases) | 9/20 (regression 9/9, capability 0/11) | 196/212 | 0.44 | 0.49 |
| 2026-11-23 18:08 | official environment: Mac VM, stored builds, current generators (20 cases) | 7/20 (regression 7/9, capability 0/11) | 194/212 | 0.44 | 0.48 |
| 2026-11-23 18:16 | official environment (Mac VM): references re-rendered there, stored builds, current generators (20 cases) | 8/20 (regression 8/9, capability 0/11) | 194/212 | 0.44 | 0.48 |
