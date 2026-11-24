# Table forms (since v2.57, roadmap 4.2 Run 2a)

**Why this file exists.** The user rated 60 slides blind (`bench/rating-1.7/results-round-1b.md`). All 10 house-style slides that carried a table failed, and 8 of the 10 house-style slides without one passed. His words: "the tables looks so bad and i know its ai right away because if u look at examples none of them uses tables like that". Every one of those tables was the same object: a solid navy header band with white bold text, hairline rows, one light-blue row, 11 pt text, often a low strip across the whole slide. That object is gone. Tables are now drawn in one of the five forms below, all taken from the reference decks' own tables.

**How it was studied:** the 19 tables named below (10 decks: Polaris 2019, Mindcraft, E-Cluster, TrueNorth, SSSR, InnoVision, LittleBoat, Harvester, OnTheNeptune, Sparkle) and 2 table objects of `Objects/store/` (`rb-229`, `bp-163`) were opened on their rendered slides (PowerPoint PDFs for the four decks in `bench/originals-powerpoint/`, LibreOffice renders for the rest), and every native table of the case decks was measured.

**What the references do** (python-pptx count over the 13 native case decks in `Templates/`, 2026-11-24): 134 native tables on 105 slides. 61 (46%) have no fill in the header row at all; when a header is filled, it is usually a box per column with white gaps, a grey band, or a pale tint, rarely a dark band across a hairline grid. Only 34 (25%) run across at least 85% of the slide width, and only 5 of those are under 2 in high (appendix screening lists, a 2-row tab header). Median table text: **14 pt**; 89% of tables are at 12 pt or more. 47 tables (35%) put the row labels in filled blocks. Many carry things in the cells: Harvey balls, dots, ticks and crosses, tinted value chips, a circled number, bars.

## The forms, with the reference slides they come from

Slide numbers are the slide's place in the .pptx (= the page of the PowerPoint PDF in `bench/originals-powerpoint/` for Polaris, Mindcraft, E-Cluster and TrueNorth; the number printed on the slide can differ). Slides used as benchmark targets are left out on purpose.

### 1. `ruled`: ruled table, no header band

- **Looks like:** header text bold in the main colour, sitting on one heavier rule (1 to 1.5 pt, text colour); thin grey rules between rows (0.75 pt); no fills; the first column bold; number columns centred.
- **From:** Polaris 2019 slide 19 (prioritised cities: red bold header text, black rule, grey row rules, a dot column), Mindcraft slide 20 (tier-3 city list, 1.5 pt header rule, no fills), InnoVision slide 11 (criteria table, 3 pt navy top rule, thin rows, icons in the first column), Roland Berger module 229 in `Objects/store/` (`rb-229`, ruled table with header).
- **Use for:** facts about a handful of items (cities, funds, products) with short values; the default when nothing else fits.

### 2. `rowblocks`: coloured row-label blocks

- **Looks like:** each row label sits in its own filled block (light grey, or the main colour with white text for the one that matters), white gaps between blocks; values plain beside them on grey row rules. With `groups`, one merged block names a group of rows.
- **From:** Sparkle (Shiseido 2016) slide 8 (grey italic label chips beside plain values, a circled "High"), E-Cluster slide 23 (merged "Prioritized / Secondary / Tertiary" category blocks, a dark total row), Mindcraft slide 27 (scenario blocks "CSS", "Minty Green", "Emphasis" in their own colours).
- **Use for:** rows that are things with a name worth reading first (risks, segments, workstreams), or rows that fall into groups.

### 3. `panels`: column panels under header boxes

- **Looks like:** each option is its own column panel (light grey cells) under its own header box (main colour, white bold text), with white gaps between panels; row labels plain on the left with grey rules. The option that wins takes the accent on its header box and bold text.
- **From:** TrueNorth (Pola 2016) slide 15 (red header boxes "Initial Cost / Profitability / Control …", grey cells with white gaps, Harvey balls, the chosen row outlined in red), OnTheNeptune slide 7 (the client's column a separate tinted panel with logos), Mindcraft slide 12 (lettered option headers A to D over grey and white blocks), E-Cluster slide 24 (city-tier definitions in two columns under dark header boxes, rows in alternating pale tints).
- **Use for:** comparing 2 to 4 options or partners on the same criteria, especially when the cells hold words.

### 4. `marks`: cells that carry things

- **Looks like:** a ruled table whose cells hold a mark instead of (or beside) text: Harvey balls, filled/half/empty dots, ✓ and ✗, a tinted value chip, a circled value, a short bar with its number.
- **From:** Polaris 2019 slide 10 (Harvey balls for "Pandora owned / Franchised", the chosen row outlined) and slide 19 (a dot column), InnoVision slide 11 (dot ratings per criterion with ✓ and ✗ beside them) and slide 16 (sensitivity grid, the base case in the darkest tint), SSSR slide 19 (ROI table with the result circled), Harvester slide 7 (CAGR values in tinted chips, two outlined in red), LittleBoat slide 8 (age bands with bars in the cells), BearingPoint module 163 (`bp-163`, traffic-light grid with a legend).
- **Use for:** ratings, yes/no against a standard, one value that is the point, shares that read better as length.

### 5. `statement`: plain ruled statement for financials

- **Looks like:** a unit line above ("US$ m"); period columns (2026, 2027E …) with numbers right-aligned; a rule under the period header; section rows in bold italic; line items indented; total rows bold with a rule above them; no fills, no grid.
- **From:** Mindcraft slide 25 (financial key assumptions: numbered italic sections, plain rows, no rules inside), Mindcraft slide 27 (store roadmap by year: totals bold italic over a short rule), SSSR slide 19 (ROI analysis, net income and synergy by year).
- **Use for:** any table of money or volumes by period (P&L, cash flow, projections, budget).

## How the builder picks one (`Generators/patterns.js` `table()`; `dataTable()` now calls it)

1. `spec.form` if given.
2. Any cell is a mark object (`{harvey}`, `{dot}`, `{tick}`, `{chip}`, `{circle}`, `{bar}`) → `marks`.
3. `spec.groups` → `rowblocks`.
4. Most header cells after the first are periods and most cells are numbers → `statement`.
5. 2 to 4 value columns, up to 7 rows, cells of 18 or more characters on average → `panels`.
6. Otherwise → `ruled`.

Common to every form: text at the deck's body size (`HOUSE.TYPE.body`, which is the reference's body size under a style profile), never smaller, whatever `fontSize` a build passes. Rows are sized to their text, then grown to fill the box (up to 0.75 in a row). A highlighted row is outlined and bold, never a tinted band. `deck_lint.py` fails a native table of 3 or more rows that runs across 85% of the slide width but is under 1.6 in high ("table strip"); 2 of the references' 126 tables would trip it (Mindcraft slide 22, an appendix screening list; InnoVision slide 8).

## Not changed in this run (proposal rows instead)

Chart styling, the type-size rules for text outside tables, and the colour rules (the house uses the main colour on 9% of slides where the references use it on 45%) are each their own run.
