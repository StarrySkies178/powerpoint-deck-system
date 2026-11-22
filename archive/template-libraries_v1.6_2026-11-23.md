# The 11 template libraries: formatting, charts and diagram parts

**What this is:** the measured formatting, chart inventory and single-diagram parts of the 11 libraries learned first (2,412 slides). Their story rules are in `Style/storytelling.md` §1–7 and their patterns in `Style/pattern-catalogue.md`; this file completes the same treatment the case decks got. Applies to every presentation.

## Formatting, measured
Sizes normalised to a 7.5-inch-tall slide (`scripts/measure_type_scale.py`). These are libraries, so "title" is often a section label rather than an action title.

| Key | Library | Slides | Size (in) | Title pt (most common) | Body pt (most common) | Text < 9 pt | Fonts |
|---|---|---|---|---|---|---|---|
| atk | AT-Kearney-charts | 234 | 10 × 7.5 | 24 | 12, 8, 14 | 12% | Arial |
| bain | Bain-concept-diagrams | 167 | 10.6 × 8.1 | 13 (labels) | 15, 13, 17 | 11% | Verdana |
| bcg | BCG-writing-clear-slides | 55 | 10.8 × 7.5 | 22 | 16, 9, 13 | 12% | Arial |
| bp | BearingPoint-diagrams | 170 | 10.8 × 7.5 | 28 | 12, 8, 10 | 15% | Arial |
| del | Deloitte-timesaver | 261 | 10 × 7.5 | 30 | 11, 10, 14 | 8% | Arial |
| ey | EY-graphics | 246 | 10 × 7.5 | 24 | 14, 10, 12 | 16% | Calibri, Tahoma |
| map | Maps-world-US-China | 40 | 10 × 7.5 | – | 16, 28 | 0% | Microsoft YaHei |
| mck | McKinsey-frequently-used | 307 | 9.8 × 7.35 | 16.5 | 16, 12, 14 | 0% | Arial |
| mono | Concept-graphics-mono | 201 | 11.7 × 8.3 | – (no titles) | 9, 5, 11 | 31% | Arial, Times |
| qpt | Quick-Presentation-Toolkit | 420 | 10 × 7.5 | 10 / 16 | 12, 10, 14 | 1% | Arial |
| rb | Roland-Berger-modules | 436 | 10.8 × 7.5 | 21 | 12, 17, 13 | 6% | Arial |

What carries over (already in `Style/style-rules.md`, unchanged): one sans font; titles 20–30 pt; body 12–16 pt; labels 10–11 pt; source 8–9 pt; small print appears only in libraries meant for editing (mono, bp, ey), not in finished decks. The case decks (§6b of `case-competitions.md`) confirm the same scale for finished decks.

## Charts
| Key | Editable native charts (stored, `set_chart_data`) | think-cell / MS Graph objects (kept as preview pictures) |
|---|---|---|
| del | 67 | 168 |
| qpt | 7 | 54 |
| mck | 0 | 164 |
| atk | 0 | 80 |
| rb | 0 | 64 |
| bcg | 0 | 26 |
| bain, bp | 0 | 8 each |
| ey | 0 | 2 |
| mono, map | 0 | 0 |

**Rule:** a think-cell / MS Graph preview is a picture, never reused as a chart. Use one of the 74 native charts (`set_chart_data`) or redraw with a builder: `chartIn`, `stackedCagr`, `growthPairs`, `growthBars`, `donutKpis`, `waterfall`, `barRanking`, `columnHighlight`, `positioningMap`.

## Single diagrams (parts)
Most library slides already hold one diagram, so they stay whole objects. Slides holding several were split by `Generators/components.py` and every part was checked by eye: **263 kept** of 373 cut, out of 2,412 slides. Kept: icon sets and large icons (91), status stickers and legends (40), pyramid variants (16), chevrons/phases, stacked and highlighted bar charts, org/governance boxes, calendars, Gantt rows, swimlanes, flags, maps of India and China, call-out styles, thermometers, Harvey/star scoring tables. Dropped: chart fragments (labels separated from their chart), empty frames, screenshots of software, firm-branded covers and publications, a slide with real people's names, and do/don't illustrations (their rules are already in `storytelling.md` §5).
