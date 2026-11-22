# DECK SYSTEM — Instructions for Building PowerPoint Decks

Read this file at the start of every deck task. It is the source of truth for how decks are planned, built, checked and improved. If anything in a chat conflicts with this file, ask before overriding it.

---

## 0. Purpose

Build decks that are:
- **Consistent**: one house style (fonts, colours, spacing) on every slide.
- **Varied**: every slide's layout fits *its* message, so the deck never feels repetitive.
- **Clear**: reading only the slide titles tells the whole story.

Style is fixed. Layout is chosen per slide. Think of a magazine: every page looks different, and every page clearly belongs to the same magazine.

---

## 1. How to work (principles)

These exist because of how Claude behaves. Follow them every time.

1. **Files are the memory.** Each chat starts fresh. Only what is written in this folder carries over. Never rely on "remembering" a past chat.
2. **Read only what's needed.** Keep this file as the procedure. Open detail files (catalogue entries, style rules) only when the current slide needs them, so important rules don't get lost in noise.
3. **Plan before building.** Always write the storyline and the slide plan as a visible output before designing anything. Most bad decks come from bad plans, not bad design.
4. **Code draws, Claude decides.** Claude chooses the storyline, message, archetype and content. Code templates handle positions, sizes, colours and fonts. Don't redraw an archetype freehand when a template exists.
5. **Scripts check what's measurable.** Fonts, colours, overflow, word counts and layout repetition are checked by script. Composition, clarity and story are judged by looking at rendered images.
6. **Don't grade your own work leniently.** Review against the checklist in Section 7, using rendered slide images. Never assume a slide looks right without seeing it.
7. **Work in stages on long decks.** Build in batches of 5–8 slides. Re-read the style rules before each batch so early rules don't fade by slide 25.
8. **Use defaults instead of guessing.** If something isn't specified, use Section 9. State any assumption made.
9. **Every rule has a reason.** When adding a rule, include *why*, so it can be applied sensibly to edge cases.

---

## 2. Folder structure

```
Powerpoint/
├── DECK-SYSTEM.md          ← this file (the procedure)
├── style-rules.md          ← exact fonts, sizes, colours, margins (one house style)
├── master/                 ← the master .potx/.pptx template (16:9)
├── catalogue/              ← one file per message type, archetype specs
│   ├── component.md  item.md  time-series.md  bridge.md
│   ├── distribution.md  correlation.md  qualitative.md
│   ├── positioning.md  breakdown.md  process.md
│   └── structure.md  geography.md  headline.md
├── tiebreakers.md          ← how to choose between look-alike archetypes
├── templates-code/         ← one code function per archetype (python-pptx)
├── scripts/check.py        ← automatic checker
├── tests/briefs.md         ← test briefs with expected answers
├── lessons-log.md          ← corrections turned into rules
├── Templates/              ← reference decks (consulting libraries etc.)
└── Objects/                ← Text / Data / Flow / Visual / Brand
```

**Reference libraries** (McKinsey, BCG, Bain, Deloitte, EY, Accenture, Kearney, Roland Berger, etc.) are used to learn **structures** (what a good waterfall, 2×2 or issue tree looks like). They are **not** the source of style. Style comes only from `style-rules.md`. Those libraries are 4:3, and all output is 16:9 unless stated otherwise.

---

## 3. The workflow

### Stage 1: Brief
Restate in 3 lines: **audience**, **goal** (what should they think/do after), **key message**.
If any of these is missing, use the defaults in Section 9 and say so.

### Stage 2: Storyline (titles only)
Write the slide titles only, as a numbered list.
- Use the **pyramid principle**: the answer first, then supporting points.
- Use **SCQA** for the opening: Situation → Complication → Question → Answer.
- Every title is an **action title**: a full sentence stating the point ("Margin fell 3 pts, driven by freight costs"), not a topic ("Margin").
- **Title test:** reading only the titles must tell the full story.

➡ **Stop for approval.** This is the cheapest point to fix the deck.

### Stage 3: Slide plan
For every slide, fill in this table:

| # | Action title | Message type | Data shape | Archetype | Variant | Why this archetype |
|---|---|---|---|---|---|---|

- **Message type:** from Section 4.
- **Data shape:** number of items / periods / dimensions, and whether parts sum to a whole.
- **Archetype:** pick from the catalogue file for that message type, filtered by data shape. Use `tiebreakers.md` when two fit.
- **Variant:** orientation, light/dark, number of items, image left/right.

Then check the **rhythm rules**:
- No same archetype twice in a row.
- No more than 3 text-heavy slides in a row.
- Mix light and dark, data and visual, dense and spacious across the deck.
- Section dividers every 4–8 slides in decks longer than 12 slides.

➡ **Stop for approval.**

### Stage 4: Build
- Build in batches of 5–8 slides.
- Re-read `style-rules.md` and the relevant catalogue files before each batch.
- Use the code template for each archetype. Supply only data, text and variant.
- If no archetype fits, design a new slide in the house style, flag it as **NEW**, and propose adding it to the catalogue.

### Stage 5: Check
1. Run `scripts/check.py`. Fix everything it flags.
2. Render every slide to an image and review against the checklist in Section 7.
3. For important decks, do the visual review as a separate pass that didn't build the deck.

### Stage 6: Learn
See Section 8.

---

## 4. Message types → archetypes

Every slide carries one message. Classify it first, then choose the visual.

| Message type | Question it answers | Typical action title | Archetypes |
|---|---|---|---|
| **Component** | What is it made of? | "Asia is 40% of revenue" | 100% stacked bar; pie (2–5 parts only); Marimekko (2 dimensions) |
| **Item** | How do things rank? | "Brand A leads on NPS" | Horizontal bar (sorted); dot plot |
| **Time series** | How did it change over time? | "Margin fell 3 years running" | Column (≤12 periods); line (>12 periods or several series) |
| **Bridge** | How did A become B? | "Profit fell due to price & FX" | Waterfall |
| **Distribution** | How is it spread? | "Most deals are under $5M" | Histogram; box plot |
| **Correlation** | Does X relate to Y? | "Bigger stores earn more" | Scatter; bubble |
| **Qualitative** | How do options compare on criteria? | "Option B scores best overall" | Harvey-ball table; scorecard; comparison table |
| **Positioning** | Where do things sit / what to prioritise? | "Focus on 3 high-value segments" | 2×2 matrix; BCG matrix |
| **Breakdown** | What drives it / what are the parts of the logic? | "3 drivers explain the gap" | Issue tree; driver tree; pyramid |
| **Process** | What are the steps / phases? | "Rollout in 4 phases" | Chevron flow; timeline; roadmap; Gantt |
| **Structure** | How is it organised? | "Value chain has 5 stages" | Value chain; org chart; layered stack |
| **Geography** | Where? | "East China leads growth" | Choropleth map; point map |
| **Headline** | One key number or statement | "Revenue up 32%" | KPI hero; big statement; quote |

Non-content slides: title, agenda, section divider, appendix divider, end slide.

---

## 5. Starter archetypes (build these first)

Build and test these ~18 before adding more. They cover most real decks.

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
12. KPI hero (1 big number) and KPI row (3–4 numbers)
13. Icon grid (3–6 ideas)
14. Split comparison (A vs B)
15. Image + text (image left/right)
16. Big statement / quote
17. Map
18. Section divider

Add an archetype only when a real deck needs one that doesn't exist.

---

## 6. Archetype spec format (every catalogue entry)

Every archetype in `catalogue/` uses this format. **Use when / don't use when / good and bad examples** are the most important parts.

```
## [ARCHETYPE NAME]
Source references: [deck + slide numbers from Templates/]
Message type: [from Section 4]
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
Code template: templates-code/[file]
```

### Example: Waterfall

```
## WATERFALL
Source references: McKinsey lib slide 34; Bain lib slide 112
Message type: Bridge
Action title pattern: "[Metric] [rose/fell] from X to Y, driven mainly by [biggest driver]"
Use when:
  - There is a start value, an end value, and 3–8 drivers in between
  - Start + all changes = end exactly
Don't use when:
  - Drivers don't sum to the change → use horizontal bar of drivers
  - More than 8 drivers → group the smallest into "Other"
  - Showing change over time → use column or line
Data shape: 1 start, 3–8 deltas (+/−), 1 end; optional subtotals
Anatomy:
  - Start/end bars: dark neutral
  - Increases: main colour; decreases: accent
  - Value label on every bar; no y-axis; thin connector lines
  - Source footnote bottom-left at caption size
Variants: vertical / horizontal; with or without subtotal bars
Good examples:
  - "EBIT fell from $120M to $95M, mainly due to FX (−$18M)"
  - "Headcount grows to 410 by 2027, led by the new Shanghai hub"
Bad example:
  - Monthly revenue Jan–Dec as a waterfall. That is a time series, so use columns.
Code template: templates-code/waterfall.py
```

### Rules with numbers (apply everywhere)
- More than 7 categories → horizontal bar, sorted largest first. *Why: long labels fit and ranking is instantly readable.*
- More than 12 time points → line, not columns. *Why: columns become too thin to read.*
- Pie only for 2–5 parts summing to 100%. *Why: people can't compare many angle sizes.*
- Waterfall only for 3–8 steps. *Why: more steps become unreadable.*
- 2×2 only when both axes run clearly low → high. *Why: otherwise the quadrants mean nothing.*
- Never chart 1–2 numbers. Use a KPI hero. *Why: a chart adds nothing to a single comparison.*
- One message per slide. If a slide needs two titles, split it.
- Highlight the one thing that matters in the accent colour. Everything else stays neutral.

---

## 7. Checklists

### Automatic (scripts/check.py)
- Only fonts and sizes from `style-rules.md`
- Only colours from the palette
- No text overflowing its box; nothing outside margins
- Word count per slide ≤ the limit in `style-rules.md`
- No same archetype twice in a row
- Every slide has an action title (a full sentence, not a 1–2 word label)

### Visual (on rendered images)
- Can the main point be understood in **5 seconds**?
- Does the visual match the message type in the plan?
- Is there a simpler visual that would work as well?
- Is the accent colour used only for the key point?
- Is there enough white space? Does anything feel crowded or cramped?
- Are elements aligned to the grid?
- Does the slide feel like the same deck as the slides around it?
- Do the titles alone still tell the story?

---

## 8. Learning loop (how the system improves)

1. When the user corrects something, write it to `lessons-log.md` as a proposed rule:
   ```
   Date | Situation | Correction | Proposed rule | Why | File to update
   ```
2. Ask the user to approve the rule.
3. Before adding it, run the test briefs (Section 10). The rule is accepted only if all tests still pass. If a test now fails, flag the conflict instead of adding the rule.
4. Add the approved rule to the correct file (catalogue entry, tiebreakers or style rules), not just the log.
5. **Consolidate** every ~10 new lessons: merge duplicates, resolve contradictions, delete stale rules, and keep files short.
6. One source of truth: Claude and Hermes both read this folder. Never keep separate copies of the rules.

---

## 9. Defaults (when not specified)

- **Audience:** senior executives. Action titles, one message per slide, detail in the appendix.
- **Format:** 16:9.
- **Length:** ~1 slide per 2 minutes of talk time. 10–15 slides for a typical update.
- **Structure:** title → executive summary → 2–4 sections → next steps → appendix.
- **Language:** match the language of the brief. Use consistent terminology throughout.
- **Numbers:** round sensibly (1 decimal max on percentages), always state units and source.
- **Text:** max ~40 words of body text per slide.
- **Motion:** none, or subtle Morph between related slides only.

---

## 10. Test briefs (expected answers)

Run these after any change to the system. The archetype chosen must match.

| # | Brief | Expected archetype |
|---|---|---|
| 1 | Revenue 2019–2025, 7 points, steady growth | Column |
| 2 | Daily active users over 18 months | Line |
| 3 | Cost bridge from budget to actual, 5 drivers that sum | Waterfall |
| 4 | Market share of 4 competitors, sums to 100% | 100% stacked bar or pie |
| 5 | NPS for 11 brands | Horizontal bar, sorted |
| 6 | 4 vendors rated on 6 qualitative criteria | Harvey-ball table |
| 7 | 12 product lines placed by growth vs margin, to decide focus | 2×2 matrix |
| 8 | 200 stores: size vs revenue | Scatter |
| 9 | Deal sizes for 300 deals | Histogram |
| 10 | Why profit is below target: 3 drivers, each with 2–3 sub-drivers | Driver / issue tree |
| 11 | 4-phase implementation plan with dates over 18 months | Timeline / roadmap |
| 12 | 5-step customer onboarding, dates not important | Chevron process |
| 13 | Revenue grew 32% this year (one number) | KPI hero |
| 14 | 3 headline metrics for the quarter | KPI row |
| 15 | Sales by province across China | Map |
| 16 | Market size by segment × share by competitor | Marimekko |
| 17 | Option A vs Option B, pros and cons | Split comparison |
| 18 | 5 strategic priorities, short descriptions | Icon grid |
| 19 | The value chain from sourcing to after-sales | Value chain |
| 20 | Customer quote that captures the problem | Big statement / quote |
| 21 | Revenue split by region for 2023 and 2025 side by side | 100% stacked bar (2 bars) |
| 22 | Headcount change from 300 to 410 via hires, leavers, transfers | Waterfall |

Also test **rhythm**: a 15-slide plan must have no repeated archetype back-to-back and must pass the title test.

---

## 11. What to do first (setup order)

1. Choose **one** house style → write `style-rules.md` (exact fonts, size scale, palette with hex codes, margins, grid). Get approval.
2. Build the 16:9 **master template** from it.
3. Write catalogue entries for the 18 starter archetypes, using the reference libraries for structure.
4. Write `tiebreakers.md` (see below).
5. Build a **code template** for each starter archetype.
6. Write `scripts/check.py`.
7. Run all test briefs. Fix failures.
8. Build one real sample deck end to end. Collect feedback, then start the learning loop.

---

## 12. Learning from the reference libraries (~2,500 slides)

Claude does not get smarter just by looking at slides. Nothing carries over to the next chat unless it is written into a file. Every pass over the libraries must produce saved outputs.

**Pass 1: Inventory (fast, low resolution)**
- Render each deck as contact sheets (~24–36 thumbnails per image).
- Work one deck at a time. After each deck, append to `catalogue/index.md`:
  `deck | slide | archetype (or NEW) | message type | quality 1–3 | notes`
- Mark duplicates as duplicates. Most slides repeat across firms.
- Never hold more than one deck's findings only in the chat. Write them down before moving on.

**Pass 2: Cluster**
- From `index.md`, group slides into archetypes. Expect ~80–150 distinct ones plus frameworks.
- Rank archetypes by how often they appear and how useful they are. Start with the 18 starter archetypes.
- Frameworks from the "管理咨询经典模型工具图集" deck (e.g. Five Forces, value chain, SWOT, BCG matrix, McKinsey 7S) go in `catalogue/frameworks.md` as their own message type: "apply a known model".

**Pass 3: Study the best examples (high resolution)**
- For each archetype, pick the 2–3 best examples from different firms.
- Save them as images in `catalogue/examples/[archetype]/`.
- Write the full spec (Section 6), describing **structure** only: layout, proportions, label placement, how emphasis is shown. Ignore each firm's colours and fonts.

**Pass 4: Turn into templates**
- Build a code template for each studied archetype, in the house style.
- Run the test briefs.

**When building a deck later**, open `catalogue/examples/[archetype]/` for the chosen archetype and look at the reference images before building. This is how the libraries keep improving the output.

Do the passes in batches across several chats. Each chat starts by reading `catalogue/index.md` to see where the last one stopped.

---

---

## 13. How the system evolves

The system improves continuously. Claude **proposes** changes, the user **approves** them, and the **tests guard** quality. Claude never changes the rules silently.

**What triggers a change**
1. **User correction:** goes into the learning loop (Section 8).
2. **No archetype fits:** the new slide is flagged NEW. If approved, it gets a catalogue entry, examples and a template.
3. **Repeated pattern:** the same kind of correction happens 2+ times, so Claude proposes a general rule.
4. **Review findings:** see the review below.

**Track usage** in `usage-log.md` after every deck:
`date | deck | slides | archetypes used | slides corrected (which, why) | NEW slides`

**Review every ~5 decks (or monthly)**, and report:
- Most-corrected archetypes → fix their spec or template
- Never-used archetypes → keep, merge or retire
- Overused archetypes → is the deck variety too low?
- Contradictory or stale lessons → consolidate
- Proposed changes, each with its reason. Apply only after approval, and only if all test briefs still pass.

**Version every change** in `changelog.md`:
`version | date | what changed | why | files touched`
Keep the previous version of any file you change in `archive/`, so any change can be rolled back.

**Hard limits**
- Never change `style-rules.md` (fonts, colours, size) without explicit approval.
- Never delete a rule. Retire it to `archive/` with the reason.
- If a change makes any test brief fail, don't apply it. Report the conflict.
- Add a new test brief for every new archetype or important rule, so the test set grows with the system.

---

### Starter tie-breakers (`tiebreakers.md`)
- **Stacked bar vs Marimekko:** do column widths carry meaning (e.g. segment size)? Yes → Marimekko.
- **Bar vs waterfall:** do the parts add up to a start → end change? Yes → waterfall.
- **Table vs Harvey balls:** are values qualitative ratings? Yes → Harvey balls.
- **Process vs timeline:** do dates or durations matter? Yes → timeline.
- **2×2 vs scatter:** a few named items for a decision → 2×2. A pattern across many points → scatter.
- **Column vs line:** ≤12 periods and one series → column. Otherwise → line.
- **Pie vs stacked bar:** comparing shares across groups or years → stacked bar. One split of 2–5 parts → pie is acceptable.
- **KPI hero vs chart:** 1–2 numbers → KPI. A pattern across many numbers → chart.
