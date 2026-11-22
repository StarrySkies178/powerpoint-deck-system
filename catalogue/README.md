# Catalogue

One file per message type (e.g. `bridge.md`, `time-series.md`). Each file holds the specs for that type's archetypes. Reference images live in `examples/<archetype>/`. When choosing an archetype, read only the file for the message type in hand.

## Status

| File | Archetypes | Status |
|---|---|---|
| `bridge.md` | Waterfall | Draft spec. No examples or template yet |
| `component.md` | 100% stacked bar, pie, Marimekko | Not started |
| `item.md` | Horizontal bar, dot plot | Not started |
| `time-series.md` | Column, line | Not started |
| `distribution.md` | Histogram, box plot | Not started |
| `correlation.md` | Scatter, bubble | Not started |
| `qualitative.md` | Harvey-ball table, scorecard, comparison table | Not started |
| `positioning.md` | 2×2, BCG matrix | Not started |
| `breakdown.md` | Issue tree, driver tree, pyramid | Not started |
| `process.md` | Chevron, timeline, roadmap, Gantt | Not started |
| `structure.md` | Value chain, org chart, layered stack | Not started |
| `geography.md` | Choropleth, point map | Not started |
| `headline.md` | KPI hero, KPI row, big statement, quote | Not started |
| `frameworks.md` | Five Forces, 7S, SWOT, etc. | Not started |
| `index.md` | Pass 1 inventory of the reference libraries | Not started |

Create a file only when writing its first real spec. Empty stubs add noise.

## Spec format (every archetype)

```
## [ARCHETYPE NAME]
Source references: [deck + slide numbers from Templates/]
Message type: [from DECK-SYSTEM.md Section 4]
Action title pattern: [sentence pattern]
Use when:
  - [specific, testable condition]
Don't use when:
  - [condition] → use [alternative] instead
Data shape: [items / periods / dimensions; limits]
Anatomy:
  - [colour roles, labels, axes, footnote, max text]
Variants: [list]
Good examples: [2–3, varied]
Bad example: [1, with why it's wrong]
Example images: catalogue/examples/[archetype]/
Code template: templates-code/[file]
```

Describe **structure** only (layout, proportions, label placement, how emphasis is shown). Colours and fonts come from `Style/style-rules.md` and are given as roles ("main colour", "accent", "dark neutral"), never as hex codes.
