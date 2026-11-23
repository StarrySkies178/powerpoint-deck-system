import os
#!/usr/bin/env python3
"""Writes preview.html, README.md for every component, plus index.d.ts, for the Powerpoint House Style design system."""
import json, os, shutil

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "project", "components")
PHOTO = "/_blob/6c5461cc212b89a94b804f782c413104"
SRC = "Source: Illustrative data for layout review"

# name, group, subtitle, frame (dict for Slide wrapper or None for full-slide components), props, readme, dts
C = []
def comp(name, group, subtitle, frame, props, readme, dts):
    C.append(dict(name=name, group=group, subtitle=subtitle, frame=frame, props=props, readme=readme, dts=dts))

F = lambda title, sub=None, page=5, tracker=None: dict(title=title, subtitle=sub, source=SRC, page=page, tracker=tracker)

# ---------------- Slides
comp("Slide", "Slides", "Layout 04 · the frame every content slide shares", None,
     dict(title="Three moves explain 80% of the margin recovery plan", subtitle="Margin impact by FY27, percentage points", source=SRC, page=7, tracker={"n": 4, "current": 1}),
     """# Slide

The frame every content slide shares: action title, unit line, body area, source bottom-left, page number bottom-right, optional section tracker top-right.

- **Props:** `title` (an action title: a full sentence, ≤ 2 lines), `subtitle` (unit or what the exhibit shows), `source`, `page`, `tracker` `{n, current}`, `dark` (navy slide), `children` (the body: any component below).
- **Fixed geometry:** from the master: title 0.4 in from the left, 0.3 in from the top, bottom-anchored; body 12.53 × 5.21 in from 1.65 in; footer 7.01 in. Body components are drawn for that 1203 × 500 px area.
- **Colours:** reads only the semantic roles (`surface`, `title`, `ink`, `muted`), so `dark` gives correct values automatically.
- **You provide:** the action title, the unit line and the source of every number.
- **Don't:** use a topic as the title ("Margin"), or put two messages on one slide.""",
     "{ title?: string; subtitle?: string; source?: string; page?: number; tracker?: TrackerProps; dark?: boolean; children?: React.ReactNode }")

comp("TitleSlide", "Slides", "Layout 01 · cover", None,
     dict(title="Entering SE Asia through a JV can double growth by 2030", subtitle="Board discussion · market entry options", date="November 2026 · Draft for discussion"),
     """# TitleSlide

The cover: the deck's answer as the title on navy, a short green bar beneath it, the occasion and the date.

- **Props:** `title` (the answer, not the topic), `subtitle` (occasion), `date`.
- **Look:** `t-cover` in `title` on `surface` (dark theme), bar in `accent`, date in `muted`.
- **Don't:** add a photo unless it's your own or CC0, and then only behind a dark overlay.""",
     "{ title: string; subtitle?: string; date?: string }")

comp("SectionDivider", "Slides", "Layout 02 · every 4–8 slides in decks over 12", None,
     dict(number="02", title="Where to play in SE Asia", page=9),
     """# SectionDivider

A navy slide that opens a section: the section number large in green, the section title in white.

- **Props:** `number` ("01"…), `title`, `page`.
- **Use:** every 4–8 slides in decks longer than 12 slides; the tracker on content slides then shows which section the reader is in.""",
     "{ number: string; title: string; page?: number }")

comp("Agenda", "Slides", "Layout 03 · current section marked", None,
     dict(items=["Why we need to grow outside the home market", "Where to play in SE Asia", "How to enter", "Plan and decision"], current=1, page=3),
     """# Agenda

A plain numbered list of the sections; `current` marks the section about to start (green number square, bold navy text).

- **Props:** `items` (section titles, ideally the same words as the dividers), `current` (index, optional), `title` (default "Agenda"), `page`.
- **Don't:** list more than 5–6 sections; group them instead.""",
     "{ items: string[]; current?: number; title?: string; page?: number }")

comp("ExecSummary", "Slides", "Story pattern · numbered key messages", F("Executive summary: enter SE Asia via a JV, starting with Vietnam", None, 2),
     dict(items=[{"label": "Home market", "text": "Margins fell 3 points in two years, mostly from price; growth headroom is limited"},
                 {"label": "Opportunity", "text": "SE Asia snacks grow 9% a year; premium chilled grows 14%"},
                 {"label": "Where", "text": "Vietnam and Indonesia score highest on attractiveness and our ability to win"},
                 {"label": "How", "text": "A JV with a local distributor gives reach to 40k outlets from day one"},
                 {"label": "Decision", "text": "Approve US$ 25 m and start partner talks in Q1 2027"}], highlight=4),
     """# ExecSummary

Numbered key messages, one row each: number square, bold label, the message on a panel. The decision row is the highlight.

- **Props:** `items` `[{label, text}]` (3–6 rows), `highlight` (index; usually the decision).
- **Write:** the messages read top to bottom as the storyline (answer first; SCQA); each message is a full sentence.
- **Generator:** `labelledRows` in `Generators/patterns.js`.""",
     "{ items: { label: string; text: string }[]; highlight?: number }")

comp("KeyStatement", "Slides", "Layout 08 / 09 · one statement or quote", None,
     dict(statement="“We don't lose customers on price. We lose them on the second phone call.”", attribution="Head of customer service, interview 14", source="Source: 32 customer and staff interviews, Oct 2026", page=4),
     """# KeyStatement

One big statement or quote on its own slide, with a short green bar above it; `dark` gives the navy decision version.

- **Props:** `statement` (≤ ~20 words), `attribution` (role, not name, unless agreed), `dark`, `source`, `page`.
- **Don't:** follow one with another; alternate dense and spacious slides.""",
     "{ statement: string; attribution?: string; dark?: boolean; source?: string; page?: number }")

comp("EndSlide", "Slides", "Layout 13 · next steps", None,
     dict(title="Next steps", points=["Approve budget", "Nominate steering committee", "Brief partner shortlist"]),
     """# EndSlide

The closing navy slide: "Next steps" and the actions in one line.

- **Props:** `title` (default "Next steps"), `points` (2–4 short actions).""",
     "{ title?: string; points?: string[] }")

comp("ImageText", "Slides", "Layout 10 / 11 · half-bleed image", None,
     dict(image=PHOTO, alt="Shanghai Pudong skyline from the Bund", title="Shanghai is the gateway: 40% of premium chilled sales in the region", points=["Highest income per head among the target cities", "Our partner already serves 12k outlets here", "Launch city for the pilot in Q2 2027"], source="Photo: DvTor8303, Wikimedia Commons (CC0)"),
     """# ImageText

A half-bleed photo beside an action title and 2–4 points; `side` puts the image left (default) or right.

- **Props:** `image` (URL: an asset in this system, or a file), `alt`, `title`, `points`, `side` ("left" | "right"), `source` (credit line).
- **Images:** your own, or free-licensed generic scenes (CC0 first), credited; never photos of real people from the web. Crop, never stretch.""",
     "{ image: string; alt?: string; title: string; points?: string[]; side?: 'left' | 'right'; source?: string }")

# ---------------- Data
comp("KPIRow", "Data", "1–4 headline numbers · the key one in navy", F("Home-market profit is under pressure on every key measure", "Home market, FY25 vs FY23", 5, {"n": 4, "current": 0}),
     dict(items=[{"value": "−3 pts", "label": "EBIT margin", "note": "from 14% to 11%"}, {"value": "+1.2%", "label": "Volume growth p.a.", "note": "below inflation"}, {"value": "34%", "label": "Online share", "note": "doubled since 2022"}, {"value": "4th", "label": "Cost per unit rank", "note": "of 8 peers"}], highlight=0),
     """# KPIRow

One to four headline numbers on panels; the number that carries the title's point sits on navy with a green edge.

- **Props:** `items` `[{value, label, note}]`, `highlight` (index).
- **Numbers:** units inside the value ("US$ 41 m", "+32%"); value size fits the box (28–60 pt).
- **Use:** never chart 1–2 numbers; use this instead. Generator: `kpiRow`.""",
     "{ items: { value: string; label: string; note?: string }[]; highlight?: number }")

comp("ColumnChart", "Data", "Time series ≤ 12 periods · one column in navy", F("SE Asia snacks will grow 9% a year to US$ 38 bn by 2030", "SE Asia packaged snacks market, US$ bn", 9, {"n": 4, "current": 1}),
     dict(categories=["2022", "2024", "2026", "2028F", "2030F"], values=[20, 24, 28, 33, 38], highlight=4, callout={"value": "+9% a year", "text": "Premium chilled grows fastest at 14% a year, where our range is strongest."}),
     """# ColumnChart

Vertical columns for a time series of up to 12 periods: grey-3 columns, the one that matters in navy, values inside the top in white, an optional big callout to the right.

- **Props:** `categories`, `values`, `highlight` (index; default the last), `callout` `{value, text}`.
- **Rules:** > 12 periods or several series → `LineChart`; ranking → `BarRanking`. Generator: `columnHighlight` (native, editable PowerPoint chart).""",
     "{ categories: string[]; values: number[]; highlight?: number; callout?: { value: string; text: string } }")

comp("LineChart", "Data", "> 12 periods or several series · labelled line ends", F("Online keeps gaining share while every other channel flattens", "Share of snack sales by channel, %, 2015–2026", 10),
     dict(categories=[str(y) for y in range(2015, 2027)], series=[{"name": "Online", "values": [4, 5, 6, 8, 10, 15, 19, 22, 25, 28, 31, 34]}, {"name": "Supermarkets", "values": [46, 46, 45, 45, 44, 41, 40, 39, 38, 37, 36, 35]}, {"name": "Convenience", "values": [30, 30, 30, 29, 29, 27, 26, 25, 24, 23, 22, 21]}, {"name": "Traditional trade", "values": [20, 19, 19, 18, 17, 17, 15, 14, 13, 12, 11, 10]}], highlight=0, min=0),
     """# LineChart

Lines for long time series or several series: the series that matters in navy with a green end dot, the others in grey-3, each labelled at its end instead of a legend.

- **Props:** `categories`, `series` `[{name, values}]`, `highlight` (series index), `min` (axis floor; default the data minimum).
- **Rules:** label line ends directly; no gridlines; ≤ 12 periods and one series → `ColumnChart`.""",
     "{ categories: string[]; series: { name: string; values: number[] }[]; highlight?: number; min?: number }")

comp("BarRanking", "Data", "Ranking · > 7 items always horizontal, sorted", F("We rank fourth of eight on cost per unit", "Cost per unit, US$, 2025", 11),
     dict(data=[{"label": "Comp G", "value": 118}, {"label": "Comp F", "value": 113}, {"label": "Comp E", "value": 104}, {"label": "Comp D", "value": 99}, {"label": "Us", "value": 95}, {"label": "Comp C", "value": 91}, {"label": "Comp B", "value": 88}, {"label": "Comp A", "value": 82}], highlightLabel="Us"),
     """# BarRanking

Horizontal bars sorted largest first, values inside the bar start, the item that matters in navy and the rest in grey-3.

- **Props:** `data` `[{label, value}]`, `highlightLabel`, `sort` (default true).
- **Rules:** > 7 categories are always horizontal bars; long labels fit and the rank reads instantly. Generator: `barRanking`.""",
     "{ data: { label: string; value: number }[]; highlightLabel?: string; sort?: boolean }")

comp("StackedBar100", "Data", "Parts of a whole across groups or years", F("Asia doubled its share of revenue in two years", "Revenue by region, % of total", 12),
     dict(categories=["2023", "2025"], series=[{"name": "Asia", "values": [20, 40]}, {"name": "Europe", "values": [45, 35]}, {"name": "Americas", "values": [35, 25]}], highlight=0),
     """# StackedBar100

100% stacked bars to compare shares across groups or years; the series that matters in navy, the others in greys, a small legend to the right.

- **Props:** `categories` (bars), `series` `[{name, values}]` (absolute values; shares are computed), `highlight` (series index).
- **Rules:** one split of 2–5 parts → a pie is acceptable; column widths that carry meaning → Marimekko (generator only).""",
     "{ categories: string[]; series: { name: string; values: number[] }[]; highlight?: number }")

comp("Waterfall", "Data", "Bridge · totals navy, increases cyan, decreases grey", F("Price, not volume, explains most of the margin decline", "EBIT bridge FY23 → FY25, US$ m", 6, {"n": 4, "current": 0}),
     dict(steps=[{"label": "FY23", "value": 168, "total": True}, {"label": "Price / mix", "value": -29}, {"label": "Volume", "value": -4}, {"label": "Input costs", "value": -16}, {"label": "Savings", "value": 13}, {"label": "FY25", "total": True}]),
     """# Waterfall

A bridge from a start value to an end value: totals in navy, increases in cyan, decreases in grey-2, values on every bar, thin connectors.

- **Props:** `steps` `[{label, value, total?}]`: first and last are totals (the last may omit `value`; it is computed).
- **Rules:** 3–8 steps and start + changes = end exactly; drivers that don't sum → `BarRanking`. Generator: `waterfall` (native chart).""",
     "{ steps: { label: string; value?: number; total?: boolean }[] }")

comp("Scatter", "Data", "Correlation · many points, optional bubble size", F("Bigger stores earn more, but three outliers underperform", "Store size vs annual revenue, 2025", 13),
     dict(points=[{"x": x, "y": y, "size": s, "label": l} for x, y, s, l in [(1.2, 2.1, 3, None), (1.8, 2.9, 4, None), (2.4, 3.6, 5, None), (2.9, 4.1, 4, None), (3.5, 4.9, 6, None), (4.1, 5.6, 6, None), (4.6, 6.4, 7, None), (5.2, 6.9, 8, None), (3.8, 2.6, 5, "Store 14"), (4.4, 3.1, 6, "Store 22"), (5.0, 3.4, 7, "Store 31")]],
          highlightLabel="Store 22", xTitle="Store size, ‘000 sq ft", yTitle="Revenue, US$ m"),
     """# Scatter

Points (or bubbles, with `size`) on two axes; label only the points the story needs, the one that matters in navy.

- **Props:** `points` `[{x, y, size?, label?}]`, `highlightLabel`, `xTitle`, `yTitle`.
- **Rules:** a pattern across many points → scatter; a few named items for a decision → `Matrix`.""",
     "{ points: { x: number; y: number; size?: number; label?: string }[]; highlightLabel?: string; xTitle?: string; yTitle?: string }")

comp("ChartCommentary", "Data", "Layout 07 · chart 62%, 'so what' panel right", F("Price, not volume, explains most of the margin decline", "EBIT bridge FY23 → FY25, US$ m", 6, {"n": 4, "current": 0}),
     "__CHARTCOMMENTARY__",
     """# ChartCommentary

Any chart on the left 62% of the body and a grey "So what" panel on the right with one or two short points.

- **Props:** `chart` (an element, e.g. `Waterfall` with `width` ≈ 746), `heading` (default "So what"), `points`.
- **Use:** the workhorse for data slides that need interpretation; keep the points to what the title claims.""",
     "{ chart: React.ReactNode; heading?: string; points?: string[] }")

# ---------------- Compare & position
comp("Matrix", "Compare & position", "2×2 / 3×3 · the focus cell in green", F("Vietnam and Indonesia are the most attractive markets we can win in", "Market attractiveness vs ability to win", 10, {"n": 4, "current": 1}),
     dict(rows=["High", "Medium", "Low"], cols=["Low", "Medium", "High"], cells=[["Philippines", "Thailand", "Vietnam, Indonesia"], ["", "Malaysia", ""], ["Singapore", "", ""]], highlight=[0, 2], xTitle="Ability to win", yTitle="Market attractiveness", comment="Focus on the top-right cell first. Thailand is a second-wave option once the JV model is proven."),
     """# Matrix

A positioning grid (2×2 or 3×3): grey cells, the focus cell in green with white text, axis labels low → high, optional comment to the right.

- **Props:** `rows` (top = high), `cols` (left = low), `cells[r][c]`, `highlight` `[r, c]`, `xTitle`, `yTitle`, `comment`.
- **Rules:** only when both axes run clearly low → high; a few named items for a decision. Generator: `matrix`.""",
     "{ rows: string[]; cols: string[]; cells?: string[][]; highlight?: [number, number]; xTitle?: string; yTitle?: string; comment?: string }")

comp("HarveyBallTable", "Compare & position", "Qualitative scoring · options × criteria", F("A joint venture beats building alone or acquiring on four of five criteria", "Entry options scored against board criteria", 13, {"n": 4, "current": 2}),
     dict(criteria=["Speed to market", "Capital needed", "Control", "Risk", "Local know-how"], options=[{"name": "Build alone", "scores": [1, 3, 4, 2, 1]}, {"name": "Joint venture", "scores": [4, 3, 3, 3, 4]}, {"name": "Acquire", "scores": [4, 1, 4, 1, 3]}], highlight=1),
     """# HarveyBallTable

Options (rows) scored on criteria (columns) with Harvey balls 0–4; the recommended option sits on a light cyan band; legend below.

- **Props:** `criteria`, `options` `[{name, scores}]` (0–4 each), `highlight` (option index).
- **Rules:** qualitative ratings → Harvey balls; numbers → a table or a chart. Generator: `scoringTable` / `harveyBall`.""",
     "{ criteria: string[]; options: { name: string; scores: (0|1|2|3|4)[] }[]; highlight?: number }")

comp("BeforeAfter", "Compare & position", "From → to · today vs target", F("The JV model shifts us from exporting to building a local business", "Today vs JV operating model", 15, {"n": 4, "current": 2}),
     dict(fromTitle="Today: export", toTitle="Target: JV", rows=[{"from": "Products shipped from home plants, 6-week lead time", "to": "Local co-packing, 1-week lead time"}, {"from": "Sold through one importer", "to": "Partner network of 40k outlets"}, {"from": "Home-market range, English packs", "to": "Adapted range and local-language packs"}, {"from": "No local team", "to": "JV team of 60, our GM and finance lead"}]),
     """# BeforeAfter

Rows of "from" (grey panel, grey text) → "to" (light cyan panel), joined by grey chevrons; the target heading in the accent.

- **Props:** `fromTitle`, `toTitle`, `rows` `[{from, to, bold?}]` (the first "to" is bold by default).
- **Use:** operating-model changes, today vs target; pros and cons work the same way. Generator: `beforeAfter`.""",
     "{ fromTitle: string; toTitle: string; rows: { from: string; to: string; bold?: boolean }[] }")

# ---------------- Sequence & structure
comp("ChevronProcess", "Sequence & structure", "3–6 steps · done grey, current green, next navy", F("A five-phase programme gets us to first revenue in 14 months", "Entry programme, phases and key activities", 17, {"n": 4, "current": 3}),
     dict(steps=[{"label": "Select", "text": "Confirm Vietnam; deep-dive Indonesia"}, {"label": "Partner", "text": "Shortlist 3, sign term sheet"}, {"label": "Set up", "text": "Form JV, hire GM, adapt range"}, {"label": "Pilot", "text": "Launch in Hanoi and HCMC"}, {"label": "Scale", "text": "National roll-out on pilot results"}], current=1, result={"label": "Month 14", "text": "First revenue; break-even by month 30"}, takeaway="Partner selection is on the critical path: start talks in Q1 2027"),
     """# ChevronProcess

Equal chevrons for 3–6 steps: done steps grey-2, the current step green, steps ahead navy; detail under each; optional result panel and takeaway bar.

- **Props:** `steps` `[{label, text}]`, `current` (index), `result` `{label, text}`, `takeaway`.
- **Rules:** dates or durations matter → `Timeline`; > 6 steps → split into phases. Generator: `chevronProcess`.""",
     "{ steps: { label: string; text?: string }[]; current?: number; result?: { label: string; text: string }; takeaway?: string }")

comp("Timeline", "Sequence & structure", "Milestones with dates · alternating above / below", F("Six milestones take us from board approval to break-even", "Key milestones 2027–2029", 18, {"n": 4, "current": 3}),
     dict(milestones=[{"date": "Q1 2027", "label": "Board approval; partner talks start"}, {"date": "Q3 2027", "label": "JV term sheet signed"}, {"date": "Q4 2027", "label": "JV formed, GM hired"}, {"date": "Q1 2028", "label": "Pilot launch in two cities"}, {"date": "Q3 2028", "label": "Pilot review vs margin target"}, {"date": "Q3 2029", "label": "Break-even run-rate"}], highlight=0),
     """# Timeline

Milestones on a grey arrow line, dates bold in navy, labels alternating above and below; the milestone in focus in green.

- **Props:** `milestones` `[{date, label}]` (3–8), `highlight` (index).
- **Use:** when dates matter (otherwise `ChevronProcess`); workstreams over time → Gantt (generator `gantt`).""",
     "{ milestones: { date: string; label: string }[]; highlight?: number }")

comp("IssueTree", "Sequence & structure", "Why / how tree · root → drivers → sub-drivers", F("Margin decline is driven by price, not volume", "Why did home-market EBIT margin fall 3 points?", 14),
     dict(root="EBIT margin −3 pts", branches=[{"label": "Price / mix −2.4 pts", "children": ["Promotions deeper and longer", "Mix shift to value packs"], "comment": "Main driver: focus here"}, {"label": "Volume −0.2 pts", "children": ["Volume broadly flat"], "comment": "Not material"}, {"label": "Cost −0.4 pts", "children": ["Packaging inflation", "Logistics, partly offset by savings"], "comment": "Manageable with current savings"}], highlight=0),
     """# IssueTree

A logic tree: the question or result on navy, drivers on grey-1 boxes (the main one green), sub-drivers on panels (the main branch on light cyan), a comment per branch.

- **Props:** `root`, `branches` `[{label, children, comment}]`, `highlight` (branch index).
- **Rules:** branches are mutually exclusive and add up to the root; quantify them when you can. Generator: `issueTree`.""",
     "{ root: string; branches: { label: string; children?: string[]; comment?: string }[]; highlight?: number }")

comp("Pyramid", "Sequence & structure", "Hierarchy · vision on top, enablers at the base", F("Strategy cascades from one vision to three enablers", "Strategy pyramid", 8),
     dict(levels=[{"label": "Vision", "text": "Leading regional snack player by 2030"}, {"label": "Goals", "text": "3 markets, 15% margin"}, {"label": "Initiatives", "text": "Entry, digital, partnerships"}, {"label": "Enablers", "text": "Talent, data, capital"}], highlight=1),
     """# Pyramid

Levels from the top (navy) through the greys to the base; the level in focus in green; text to the right on dotted leaders.

- **Props:** `levels` `[{label, text}]` (3–5, top first), `highlight`.
- **Use:** hierarchies and cascades; narrowing selection → funnel (generator `funnel`).""",
     "{ levels: { label: string; text?: string }[]; highlight?: number }")

comp("Cycle", "Sequence & structure", "Recurring process · segments at 360°/n", F("A four-step loop turns every pilot into the next launch", "Test-and-learn cycle", 9),
     dict(items=[{"label": "Plan", "text": "pick city and range"}, {"label": "Launch", "text": "8-week pilot"}, {"label": "Measure", "text": "sell-out vs target"}, {"label": "Adjust", "text": "range, price, partner"}], highlight=2, centre="Test and learn"),
     """# Cycle

Segments around a ring for a process that repeats, numbered, alternating grey-1 / grey-2, the step in focus in green; labels outside, centre label in navy.

- **Props:** `items` `[{label, text}]` (3–8), `highlight`, `centre`.
- **Generator:** `cycle` (block arcs at 360°/n, starting at 12 o'clock).""",
     "{ items: { label: string; text?: string }[]; highlight?: number; centre?: string }")

comp("HubSpoke", "Sequence & structure", "One centre, its parts or requirements", F("The JV partner must bring five capabilities we lack", "Partner selection criteria", 14, {"n": 4, "current": 2}),
     dict(centre="Ideal partner", items=[{"label": "Reach", "text": "≥ 30k outlets incl. modern trade"}, {"label": "Cold chain", "text": "chilled logistics in 5 cities"}, {"label": "Licences", "text": "food import & distribution"}, {"label": "Brand fit", "text": "no competing premium range"}, {"label": "Governance", "text": "accepts 51/49 with our control of brand"}], highlight=0),
     """# HubSpoke

A navy hub with satellites at equal angles, joined by grey spokes; the satellite in focus in green; a short note beside each.

- **Props:** `centre`, `items` `[{label, text}]` (3–9), `highlight`.
- **Generator:** `hubSpoke` (satellite size limited so they never touch).""",
     "{ centre: string; items: { label: string; text?: string }[]; highlight?: number }")

comp("TextColumns", "Sequence & structure", "Parallel points · 2–5 columns", F("Three capabilities set the leaders apart", "What top-quartile players do differently", 16),
     dict(items=[{"label": "Sharper pricing", "text": "Price by store cluster, not nationally. Review weekly with live data."}, {"label": "Faster innovation", "text": "12-week concept-to-shelf cycle. Kill rate above 60%."}, {"label": "Leaner supply", "text": "Fewer, larger suppliers. Shared logistics with partners."}], highlight=1, takeaway="We lead on none of the three today: innovation speed is the cheapest gap to close"),
     """# TextColumns

Two to five parallel points: a navy header bar (the one in focus green) over a grey panel; optional takeaway bar.

- **Props:** `items` `[{label, text}]`, `highlight`, `takeaway`.
- **Use:** parallel, equal-weight ideas; numbered or icon versions work the same way. Generator: `textColumns`.""",
     "{ items: { label: string; text: string }[]; highlight?: number; takeaway?: string }")

# ---------------- Elements
comp("TakeawayBox", "Elements", "The 'so what' · navy bar at the bottom of the body", None,
     dict(text="Cost cuts alone cannot close the gap: we need a new growth engine"),
     """# TakeawayBox

A full-width navy bar with the slide's "so what" in bold white, at the bottom of the body area.

- **Props:** `text` (one sentence), `bottom` (pin to the bottom of the body), `width`.
- **Rules:** one per slide at most; it follows from the evidence and doesn't repeat the title. Generator: `takeaway`.""",
     "{ text: string; bottom?: boolean; width?: number }")

comp("Tracker", "Elements", "Section tracker · top-right of content slides", None,
     dict(n=4, current=1),
     """# Tracker

Small numbered squares top-right of content slides: the current section in green, the others grey.

- **Props:** `n` (sections), `current` (index). Pass it to `Slide` as `tracker`.
- **Generator:** `trackerBar`.""",
     "{ n: number; current: number }")


# ---------------- v2.2
comp("ChinaMap", "Data", "Geography · provinces binned in 4 steps of navy", F("Sales concentrate on the east coast; Guangdong alone is a fifth", "Sales by province, RMB m, 2025", 19),
     dict(data={"Guangdong": 412, "Zhejiang": 268, "Jiangsu": 251, "Shanghai": 233, "Beijing": 198, "Shandong": 176, "Fujian": 121, "Sichuan": 118, "Hubei": 96, "Henan": 91, "Hunan": 77, "Anhui": 70, "Tianjin": 64, "Chongqing": 61, "Shaanxi": 52, "Hebei": 50, "Liaoning": 47, "Jiangxi": 38, "Guangxi": 36, "Yunnan": 33, "Shanxi": 27, "Guizhou": 24, "Jilin": 21, "Heilongjiang": 20, "Inner Mongolia": 15, "Hainan": 14, "Xinjiang": 12, "Gansu": 9, "Ningxia": 5, "Qinghai": 3, "Tibet": 2}, highlight=["Guangdong"], unit="RMB m", points=["Top five provinces are 54% of sales.", "Inland provinces are under-served: Sichuan and Hubei grow fastest."]),
     """# ChinaMap

A choropleth of China's 32 provinces drawn from the real outlines in the folder's object store (`Objects/store/map.jsonl.gz`, "中国地图-细分到省级"): values in four steps of navy, provinces with no data in grey-4, the province in focus in green, the top five labelled; optional "So what" panel.

- **Props:** `data` (`{province: value}`, English or Chinese names), `highlight` (province names), `labels` (names to label; default the top 5), `unit`, `legend`, `points`, `heading`.
- **Rules:** one measure per map; label only what the story needs. Province-level detail, city maps and world / US maps are in the object store for the generators.""",
     "{ data: Record<string, number>; highlight?: string[]; labels?: string[]; unit?: string; legend?: string; points?: string[]; heading?: string }")

comp("Gantt", "Sequence & structure", "Workplan · workstreams over periods", F("Stabilise in year one, then scale stores and the community", "Workplan 2026–2028, by quarter", 21),
     dict(periods=["Q1 26", "Q2 26", "Q3 26", "Q4 26", "Q1 27", "Q2 27", "Q3 27", "Q4 27"], rows=[{"label": "A  Store expansion", "group": True}, {"label": "Tier-1 cities", "start": 0, "end": 3}, {"label": "Tier-2 cities", "start": 2, "end": 7, "milestone": 7}, {"label": "B  Service", "group": True}, {"label": "Coach academy", "start": 0, "end": 2}, {"label": "New courses", "start": 3, "end": 6}, {"label": "C  Community", "group": True}, {"label": "CRM and app", "start": 1, "end": 5, "milestone": 5}], highlight=2),
     """# Gantt

Workstreams (rows, optionally grouped) against periods: navy period headers, zebra rows, bars in cyan, the workstream in focus in green, milestones as green diamonds.

- **Props:** `periods`, `rows` `[{label, start, end, milestone, group}]` (0-based period indexes; a `group` row is a bold heading), `highlight` (row index).
- **Use:** when timing and overlap matter; a single sequence of steps → `ChevronProcess`; dated events → `Timeline`. Generator: `gantt`.""",
     "{ periods: string[]; rows: { label: string; start?: number; end?: number; milestone?: number; group?: boolean }[]; highlight?: number }")

comp("Funnel", "Sequence & structure", "Narrowing selection · counts at each stage", F("From 140 ideas, five are funded after four screens", "Innovation pipeline, 2026", 8),
     dict(stages=[{"label": "Ideas collected", "value": 140, "text": "from staff, partners and customers"}, {"label": "Pass strategic fit", "value": 60}, {"label": "Pass business case", "value": 25}, {"label": "Pass risk review", "value": 12}, {"label": "Funded", "value": 5, "text": "US$ 4 m committed"}], highlight=4),
     """# Funnel

Stages narrowing from top to bottom with the count inside each: navy at the top through the greys, the stage in focus in green, labels on dotted leaders.

- **Props:** `stages` `[{label, value, text}]` (3–6), `highlight`.
- **Use:** selection and conversion; hierarchies that don't narrow by count → `Pyramid`. Generator: `funnel`.""",
     "{ stages: { label: string; value: number | string; text?: string }[]; highlight?: number }")

comp("Venn", "Compare & position", "Overlap · where 2–3 sets meet", F("Premium chilled snacks is where our strengths meet local demand", "Where to play inside Vietnam", 12),
     dict(sets=[{"label": "Our strengths"}, {"label": "Unmet demand"}, {"label": "Partner reach"}], intersection={"label": "Premium chilled snacks", "text": "We lead on product quality, demand grows 14% a year, and the partner already serves 40k outlets."}),
     """# Venn

Two or three overlapping sets (navy, grey, green, translucent), the intersection marked with a ring and a dashed leader to its explanation.

- **Props:** `sets` `[{label}]` (2–3), `intersection` `{label, text}`.
- **Use:** "where to play" logic, capability overlaps. Generator: `venn`.""",
     "{ sets: { label: string }[]; intersection?: { label: string; text: string } }")

comp("OrgChart", "Sequence & structure", "Organisation or team structure", F("The JV runs on four functions reporting to one GM", "Proposed JV organisation, 60 FTE", 20),
     dict(root={"label": "General Manager", "sub": "from us"}, children=[{"label": "Commercial", "sub": "partner", "children": ["Key accounts", "Field sales", "Trade marketing"]}, {"label": "Supply chain", "sub": "partner", "children": ["Co-packing", "Cold chain"]}, {"label": "Finance", "sub": "from us", "children": ["Controlling", "Treasury"]}, {"label": "Brand & product", "sub": "from us", "children": ["Range adaptation", "Consumer insight"]}], highlight=3),
     """# OrgChart

A root box in navy, one level of units on grey panels (the one in focus in green) and their sub-units listed beneath with grey connectors.

- **Props:** `root` `{label, sub}`, `children` `[{label, sub, children: string[]}]` (2–6), `highlight`.
- **Use:** team and governance structures; deeper trees → split by unit. Generator: `orgChart`.""",
     "{ root: { label: string; sub?: string }; children: { label: string; sub?: string; children?: string[] }[]; highlight?: number }")

comp("Temple", "Sequence & structure", "Strategy house · vision, pillars, enablers", F("Four pillars carry the regional growth strategy", "Strategy on a page", 16),
     dict(roof="Leading regional snack player by 2030", pillars=[{"label": "Win at home", "text": "Defend share in core.\nCut cost to serve 5%."}, {"label": "Enter SE Asia", "text": "Two markets via JV.\nBreak-even in 30 months."}, {"label": "Go digital", "text": "D2C channel.\nData-driven pricing."}, {"label": "Build brands", "text": "Premium range.\nHealth positioning."}], foundation="Enablers: talent · data · capital discipline", highlight=1),
     """# Temple

The strategy house: the vision as a navy roof, 3–5 pillars with grey headers (the one in focus in green) over panels, and the enablers as the foundation.

- **Props:** `roof`, `pillars` `[{label, text}]`, `foundation`, `highlight`.
- **Generator:** `temple`.""",
     "{ roof: string; pillars: { label: string; text: string }[]; foundation: string; highlight?: number }")

comp("DonutKPI", "Data", "1–4 shares as donuts · the key one in navy", F("Quality worries keep premium buyers offline", "Where premium buyers shop, survey (n = 215)", 9),
     dict(items=[{"value": 72, "label": "Buy premium offline", "note": "quality guaranteed in stores"}, {"value": 53, "label": "Mix online and offline", "note": "mid-tier buyers"}, {"value": 31, "label": "Online only", "note": "mostly under 25"}], highlight=0),
     """# DonutKPI

One to four percentages as donuts on a grey track, the value in the centre; the one that matters in navy, the others grey.

- **Props:** `items` `[{value (0–100), label, note}]`, `highlight`.
- **Use:** survey shares and penetration; plain numbers → `KPIRow`.""",
     "{ items: { value: number; label: string; note?: string }[]; highlight?: number }")

comp("Pie", "Data", "One split of 2–5 parts", F("Offline still sells 70%, but online wins the young", "Channel split of premium skin-care sales, 2025", 14),
     dict(slices=[{"label": "Department stores", "value": 46}, {"label": "Specialty stores", "value": 24}, {"label": "Online", "value": 30}], highlight=2, comment="Online is 30% overall but 58% among buyers aged 15–25, the segment we target first."),
     """# Pie

A single split into 2–5 parts that sum to 100%: the part that matters in navy, the others in greys, shares labelled outside; optional comment.

- **Props:** `slices` `[{label, value}]`, `highlight`, `comment`.
- **Rules:** never more than 5 parts; comparing splits across groups or years → `StackedBar100`.""",
     "{ slices: { label: string; value: number }[]; highlight?: number; comment?: string }")

comp("Marimekko", "Data", "Market size × share · widths carry meaning", F("We lead the small premium segment but are absent from the largest", "Market size by segment (width, US$ bn) and share by player", 13),
     dict(segments=[{"label": "Mass", "size": 9.2, "shares": [8, 31, 27, 34]}, {"label": "Mid-tier", "size": 5.1, "shares": [22, 26, 30, 22]}, {"label": "Premium", "size": 2.4, "shares": [38, 21, 12, 29]}], players=["Us", "Rival A", "Rival B", "Others"], highlight=0, unit="US$ bn"),
     """# Marimekko

Columns whose widths are segment sizes, stacked by player share; the player that matters in navy, the others greys; legend to the right.

- **Props:** `segments` `[{label, size, shares[]}]`, `players`, `highlight` (player index), `unit`.
- **Rules:** use only when the column widths carry meaning; otherwise `StackedBar100`.""",
     "{ segments: { label: string; size: number; shares: number[] }[]; players: string[]; highlight?: number; unit?: string }")

comp("Heatmap", "Compare & position", "Value grid · target cells outlined", F("Young professionals in tier-1 cities are the core segment for group classes", "Share of respondents by segment and need, %", 15),
     dict(rows=["Students", "Young professionals", "Young parents", "Mid-career"], cols=["Shape", "Health", "Social", "Stress relief", "Skill"], values=[[12, 4, 9, 3, 6], [21, 13, 17, 14, 5], [8, 11, 4, 5, 2], [5, 16, 3, 7, 3]], highlight=[[1, 0], [1, 2]], suffix="%"),
     """# Heatmap

A grid of values shaded in steps of navy (white text on dark cells), target cells outlined with a dashed green line.

- **Props:** `rows`, `cols`, `values[r][c]`, `highlight` (`[[r, c], …]`), `suffix`.
- **Use:** segment × need, region × product; a few cells to compare → `Matrix` or a table.""",
     "{ rows: string[]; cols: string[]; values: number[][]; highlight?: [number, number][]; suffix?: string }")

def preview(c):
    marker = '<!-- @dsCard group="%s" height=%d width=%d subtitle="%s" -->' % (c["group"], 720 if c["name"] not in ("TakeawayBox", "Tracker") else 160, 1280, c["subtitle"].replace('"', "'"))
    props = c["props"]
    if props == "__CHARTCOMMENTARY__":
        el = ('h(H.ChartCommentary, {chart: h(H.Waterfall, {width: 746, steps: %s}), points: %s})'
              % (json.dumps([{"label": "FY23", "value": 168, "total": True}, {"label": "Price / mix", "value": -29}, {"label": "Volume", "value": -4}, {"label": "Input costs", "value": -16}, {"label": "Savings", "value": 13}, {"label": "FY25", "total": True}]),
                 json.dumps(["Promotions got deeper and longer: price / mix cost US$ 29 m.", "Savings offset less than half of input-cost inflation."])))
    else:
        el = "h(H.%s, %s)" % (c["name"], json.dumps(props, ensure_ascii=False))
    if c["name"] == "Slide":
        el = el[:-1] + ', h("div", {style: {position: "absolute", inset: 0, border: "1.33px dashed var(--rule)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)", fontSize: "18.67px", color: "var(--muted)"}}, "Body area · 12.53 × 5.21 in · any component below"))'
    if c["frame"]:
        fr = {k: v for k, v in c["frame"].items() if v is not None}
        el = "h(H.Slide, %s, %s)" % (json.dumps(fr, ensure_ascii=False), el)
    if c["name"] == "TakeawayBox":
        el = 'h("div", {style: {padding: "40px 38px"}}, %s)' % el
    if c["name"] == "Tracker":
        el = 'h("div", {style: {position: "relative", width: 1280, height: 160, background: "var(--surface)"}}, %s)' % el
    stage = "hs-stage" if c["name"] not in ("TakeawayBox", "Tracker") else ""
    return marker + "\n" + '<div id="root" class="%s"></div>\n<script>\nvar h = React.createElement, H = window.HouseStyle;\nReactDOM.createRoot(document.getElementById("root")).render(%s);\n</script>\n' % (stage, el)


for c in C:
    d = os.path.join(ROOT, c["name"]); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "preview.html"), "w").write(preview(c))
    open(os.path.join(d, "README.md"), "w").write(c["readme"].strip() + "\n")

# remove v1 component folders that were renamed
for old in ("ContentSlide",):
    p = os.path.join(ROOT, old)
    if os.path.isdir(p): shutil.rmtree(p)

dts = ["// Powerpoint House Style — component props (documentation). All components draw at slide scale: 1 in = 96 px;",
       "// body components fill the Slide body (1203 x 500 px) unless `width`/`height` are given.",
       "import * as React from 'react';", ""]
for c in C:
    t = c["dts"]
    if c["frame"] or c["name"] in ("Waterfall", "ChartCommentary"):
        t = t[: t.rstrip().rfind("}")].rstrip().rstrip(";") + "; width?: number; height?: number }"
    dts.append("export interface %sProps %s" % (c["name"], t))
    dts.append("export declare function %s(props: %sProps): React.ReactElement;" % (c["name"], c["name"]))
    dts.append("")
dts.append("export interface TrackerProps { n: number; current: number }") if False else None
open(os.path.join(ROOT, "index.d.ts"), "w").write("\n".join(dts))
print(len(C), "components")
