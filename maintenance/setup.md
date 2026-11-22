# Setup: build order and status

Read this when building out the system, not during a deck task. Update the status boxes as pieces are finished.

## Build order and status

- [~] **1. House style**: style source, colours (Deloitte-based) and font (Arial) approved 2026-11-22. Chinese font Microsoft YaHei approved. Type sizes and grid in use (change dynamically: archive, apply, report) (was: confirm with the master).
- [~] **2. Master template**: built 2026-11-22 (`master/house-master-16x9.potx`, 14 layouts, theme-linked colours, YaHei as East Asian font). Awaiting user review; type sizes and grid still proposed.
- [ ] **3. Catalogue entries** for the 18 starter archetypes (1/18 drafted: waterfall in `catalogue/bridge.md`). Use the reference libraries for structure.
- [x] **4. Tie-breakers**: now in `DECK-SYSTEM.md` Section 5.
- [~] **5. Code templates**: JS generators in `Generators/patterns.js` (24 patterns incl. 12 of the 18 starters: column, horizontal bar, waterfall, 2×2, Harvey-ball table, chevron, timeline, issue tree, KPI row, split comparison, big statement, section divider). Missing: line, 100% stacked, scatter, icon grid, image+text (layout only), map.
- [ ] **6. Checker**: `scripts/check.py` (checks listed in `DECK-SYSTEM.md` Section 7).
- [ ] **7. Test briefs**: run all of them (`maintenance/test-briefs.md`) and fix any failures.
- [~] **8. Sample deck**: `samples/sample-deck-v0.1.pptx` (20 slides, illustrative brief) built 2026-11-22; awaiting feedback.

Library study runs alongside this list: see `maintenance/library-study.md`.

## The 18 starter archetypes

Build and test these before adding more. They cover most real decks.

1. Column chart
2. Line chart
3. Horizontal bar (sorted)
4. 100% stacked bar
5. Waterfall
6. Scatter / bubble
7. 2×2 matrix
8. Harvey-ball / comparison table
9. Chevron process (3–6 steps)
10. Timeline / roadmap
11. Issue / driver tree
12. KPI hero (1 number) and KPI row (3–4 numbers)
13. Icon grid (3–6 ideas)
14. Split comparison (A vs B)
15. Image + text (image left or right)
16. Big statement / quote
17. Map
18. Section divider

Add an archetype only when a real deck needs one that doesn't exist.
