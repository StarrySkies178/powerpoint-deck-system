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

## Several figures on one slide (composition)
Looked at every library slide that shows how to combine figures or present them (found through the reviewed slide map, then each one viewed): Roland Berger 104–113 and 198–199, Deloitte 19, 53–64, 74, 144, BCG 17 and 31–40, QPT 124–126 and 327, AT Kearney 27–28, 67, 165, McKinsey 167–175. The other libraries (mono, Bain, BearingPoint, EY, maps) hold one diagram per slide and teach no multi-figure layout.

What they teach, and where it now lives:
| Lesson | Source | In the system |
|---|---|---|
| Put the panel's point in a coloured header on top of a framed chart ("you can put your points here in the header of the box") | RB 106–111 | `composeSlide({boxed:true})` |
| Two boxed charts side by side; chart + text box; conclusion box under a chart | RB 105–111, 198–199 | layouts HALF2, TXC, EXB |
| Small multiples: two stacked, four parallel, four on a page, four paired, six with sub-titles; same categories and axis in every panel | Deloitte 53–64, RB 113, ATK 28 | layout MULTI |
| Highlight the same series in every panel ("highlight one series with red") | ATK 67, 28 | one `highlight` index per panel |
| Bullets left + chart right ("text and chart slide") | Deloitte 59, 74 | layout TXC |
| A grid of evidence → arrow → one conclusion block; columns → chevron → conclusion | Deloitte 19, McK 167–169 | layouts FLOW, CHAIN, GRID4I |
| Two charts compared, each with a takeaway bar below | Deloitte 144 | HALF2 + panel notes / EXB |
| Situation / Approach / Impact columns, last column highlighted | ATK 165 | layout COL3 (highlight the last) |
| Combining formats (a graphic + quotes) makes the message stronger, but don't let the slide become confusing; the same data can be shown several ways, choose by message | BCG 17, 35–40 | storytelling.md §3, §8 rule 11 |
| Live presenting: fade-outs and cover-ups grey out what isn't discussed yet | QPT 327 | `fadeOut(slide, box)` |
| Combination pie + column; combined (nested) pies | QPT 124–126 | `chartIn` (pie/donut) + HALF2 |
