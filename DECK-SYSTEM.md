# DECK SYSTEM

This is the procedure for every deck task. Read this whole file at the start of every deck task, then read other files only when Section 2 says to. If anything in a chat conflicts with this file, ask before overriding it.

Current version: see `logs/changelog.md`. Keep this file under ~200 lines: detail belongs in the catalogue, style or maintenance files.

---

## 0. Purpose

Decks should be:
- **Consistent**: one house style (fonts, colours, spacing) on every slide.
- **Varied**: each slide's layout fits *its* message, so the deck never feels repetitive.
- **Clear**: the slide titles alone tell the whole story.

The style is fixed and the layout is chosen per slide, like a magazine: every page looks different, yet every page clearly belongs to the same magazine.

---

## 1. Principles

1. **Files are the memory.** Each chat starts fresh, and only what is written in this folder carries over. Never rely on remembering a past chat.
2. **Read only what's needed.** Open detail files only when the current step needs them, so important rules don't get lost in noise.
3. **Plan before building, then keep moving.** Write the storyline and the slide plan before designing anything (most bad decks come from bad plans), show them to the user at the top of the reply, and carry on building. Don't wait for approval unless the user asks to review the plan first; they redirect, you adapt.
4. **Code draws, Claude decides.** Claude chooses the story, message, archetype and content. Code templates handle positions, sizes, colours and fonts. Don't redraw an archetype freehand when a template exists.
5. **Scripts check what can be measured; rendered images show the rest.** A script checks fonts, colours, overflow, word counts and repetition. Composition, clarity and story are judged on rendered images.
6. **Don't grade your own work leniently.** Never assume a slide looks right without seeing it rendered.
7. **Work in batches.** Build 5–8 slides per batch and re-read the style rules before each one, so early rules don't fade by slide 25.
8. **Use defaults, not guesses** (Section 8). State every assumption you make.
9. **Missing pieces don't block work.** If a file in Section 2 doesn't exist yet, use its fallback and say so in the reply.
10. **Look comes from the user's reference, or else the house default.** If the user gives a reference slide or template, match its look. If not, use the house default in `Style/style-rules.md`. The libraries in `Templates/` teach structure only. They are 4:3: re-proportion their layouts for 16:9, never stretch them. **Match with tools, not by eye:** build with the reference's style profile (`P.useStyle(profile)`, profile from `scripts/make_style_profile.py`, saved as `Style/refs/<deck>.profile.json`); when the user names a slide, reuse that slide's stored object with its original colours (`objstore.place(..., colours="original")`) and refill it. When the user gives only a deck as the style, take the layout from the closest *other* slide of that deck (same layout code in `Style/slide-map.csv`): `scripts/layout_skeleton.py` gives its panel boxes for `composeSlide({ regions })`. How close this gets is measured by `bench/` (reproduction benchmark).
11. **One source of truth.** Claude and Hermes both read this folder. Never keep copies of the rules anywhere else (Project docs, chat memory, the skill, Hermes config).

---

> **Learning rule (never skip, never shortcut).** When the user gives any reference, it is learned in full and its lessons apply to **every presentation**, never only to the deck type it came from. "Learned in full" means all of: the original kept; every slide as an editable object; every slide split into its single diagrams, each checked by eye; **every picture chart, pasted diagram and embedded (think-cell / MS Graph / Excel) chart turned into editable shapes** (`Generators/vectorize.py`) so it can be reused, resized, recoloured, transformed and transmuted; every slide's story role and message → figure mapped; formatting measured; charts inventoried (editable vs picture, and the builder that redraws each picture chart); builders made for any new pattern; rules written into `Style/storytelling.md` for all decks **and applied straight away** (not left as proposals waiting for approval), then wired into the workflow and checklists in §3 and §7 so every deck uses them. Before saying a reference is learned or done, run `python3 scripts/audit_reference.py`. If anything fails, say exactly what is missing; never describe partial work as complete. When the user approves proposals, apply them everywhere they fit, then look for what else the reference teaches.

## 2. What to read, and when

| When | Read | If it doesn't exist yet |
|---|---|---|
| Start of every deck task | This file | n/a |
| **The user gives a new reference** (deck, template, library, PDF, screenshot), now or in any future chat | `maintenance/new-reference.md`. Do it **before** using the reference: ingest, look at every slide, map patterns, save objects and single diagrams, measure formatting, inventory charts, apply lessons to every deck; finish with `scripts/audit_reference.py` (must be ALL PASS) | n/a: this step is never skipped |
| Stage 1, and before every batch | `Style/style-rules.md` (Section 1 says reference vs house default). When matching a reference, read its card in `Style/refs/` before every batch | Use the "shared rules" in `Style/style-findings.md`. Anything marked *proposed* or *open* there: use it, but say so |
| Stage 2–3 of **every** deck: storyline and choosing figures | `Style/storytelling.md` (§8 = case-study rules), then `Style/refs/case-competitions.md` §2 (exec-summary forms), §5 (message → figure), §6b (formatting), and `Style/refs/case-competitions-2019-2020.md` §2 and §5 (more forms and figures) | Section 4 of this file |
| Stage 3: choosing archetypes | Sections 4–5 of this file, then `catalogue/<message-type>.md` for each type used | Use Sections 4–5 only, and mark the slide "no spec yet" in the plan |
| Stage 4: building a slide | `master/README.md` (layouts, colour slots), `Generators/patterns.js` (one function per pattern), `Style/pattern-catalogue.md` for the pattern's story and scaling rule. To reuse a template drawing: `Objects/README.md` + `Generators/objstore.py` | Build by hand in the house style on the master, and note it in the usage log |
| Stage 3–4: any photo, logo, headshot or icon | `Objects/images.md` (sources, licences and image rules) | n/a |
| Stage 4: chart slides | The `dataviz` skill for chart craft (labels, axes, marks). Colours and fonts always come from the active style, never from the skill's palette | Section 5 + style rules only |
| Finding a reference slide | Search `Style/slide-index.md`. Don't read the whole file | n/a |
| Stage 5: checking | `scripts/check.py`, then Section 7 | Run the automatic checks by inspection and say which ones were skipped |
| Stage 6: after the deck | `maintenance/learning-loop.md` | n/a |
| Changing rules, setup, studying the libraries | `maintenance/*` | n/a |

Don't open `maintenance/` files during a normal build. They are for changing the system, not using it. The one exception is `maintenance/new-reference.md`, which runs whenever a new reference arrives.

---

## 3. Workflow

**Stage 1. Brief.** Restate the brief in 3 lines: **audience**, **goal** (what they should think or do afterwards), **key message**. Then add a 4th line: **style source**, either "matching your reference: [file]" or "house default". If a reference is given, study it first (`Style/style-rules.md` Section 1: measure with `scripts/study_reference.py`, look at rendered slides, write the style card) and list its key standards in the brief: font, size scale, margins, colour roles. Fill any gap from Section 8 and say so.

**Stage 2. Storyline (titles only).** Write a numbered list of slide titles.
- Pyramid principle: the answer first, then the supporting points.
- Open with SCQA: Situation → Complication → Question → Answer.
- Every title is an **action title**: a full sentence of at most 2 lines that states the point ("Margin fell 3 pts, driven by freight costs"), not a topic ("Margin").
- **Title test:** the titles alone must tell the full story.
- **Always apply the storyline rules in `Style/storytelling.md` §8** (every deck, no exceptions):
  - Executive summary in one of the forms: lettered conclusions, decision framework, story diagram, pyramid, or situation → pillars → outcome (`T3B1`) (`patterns_story.js`).
  - Title chain: connectives (*therefore, hence, meanwhile, furthermore, in the long term*) where a slide follows from the one before.
  - Each block of evidence ends in a "Therefore…" decision slide that shows the choice as a table or matrix.
  - In a recommendation, a problem slide comes before each strategy pillar.
  - Decks over 12 slides: role tags in titles ("Analysis n:", "Strategy n:", "S-term:", "L-term:", value-chain stage) or exec-summary letters (A, B, C1…) reused in section titles.
  - A deck with financials includes a value bridge: waterfall from today to the target, by initiative.
  - Personas and competitors are named once and reused with the same name, picture and colour.
  - A key-questions slide sits between the analysis and the strategy; the strategy answers the questions by number.
  - The strategy has a short name; its pillars are lettered (A/B/C, A1…) and the letter chip leads every title of that pillar.
  - Risks are a numbered heat map with the same numbers in the mitigation list (`riskMatrix`).
  - A headline target is shown as a value tree tied to the initiatives (`valueTree`); the roadmap is a Gantt under named phases (`gantt`).
  - Under the title list, write one line per rule: how it is met, or why it doesn't apply to this deck.

➡ **Show the storyline and carry on.** This is the cheapest point for the user to redirect, so make it easy to read; don't wait unless they asked to review first.

**Stage 3. Slide plan.** Fill this in for every slide:

| # | Action title | Message type | Data shape | Slide layout (§4b) | Archetype per panel | Variant | Why |
|---|---|---|---|---|---|---|---|

- *Data shape* means the number of items, periods and dimensions, and whether the parts sum to a whole.
- *Variant* means orientation, light or dark, number of items, and which side the image goes on.
- Below the table, add an **assets needed** list: every photo, logo and headshot, each marked "in Objects/" or "missing, please supply".

Also check the **slide rules** from `Style/storytelling.md` §8:
- Analysis slides: at most 3 numbered panels, each with a sentence sub-headline; together they prove the title (`evidencePanels`).
- The so-what sits in the same fixed place on every analysis slide (`soWhat()` box or takeaway bar).
- Choose each figure from the message → figure table (`Style/refs/case-competitions.md` §5); one highlight makes the point.
- **Slide layout:** analysis slides normally combine 2–4 figures using a layout from `Style/refs/case-competitions.md` §4b (HALF2, GRID4I, BAND2, T2B1, T1B2, T3B1, GRID4, EXI, L2R1, R2L1, COL3, COL4/COLN, FLOW with 2–4 blocks, CHAIN, EXB), built with `composeSlide()`; add `takeaway` to a panel when each panel has its own so-what; a panel can be a native chart, any generator, or a reused store object (`object:` + `Generators/fill_objects.py`). One-figure slides are for the exec summary, frameworks, roadmaps and big single charts. Vary layouts across the deck (never the same layout three slides running).
- **Places (where?):** break the place down level by level with `Generators/patterns_place.js` — country map (`mapRegions`), regional panels (`regionMultiples`), zoom chain country → province → city → sites (`geoZoom`, `siteCallouts`), building and floors (`buildingExplode`, `floorPlan`). A map can also be a `composeSlide` panel (`map:`). Every region is an editable shape; data in `Objects/maps/` (fetch more with `scripts/get_map.py`); name the map source; a full China map always carries the South China Sea inset (storytelling rule 16).

Then check the **rhythm rules**:
- The same archetype never appears twice in a row.
- No more than 3 text-heavy slides in a row.
- The deck mixes light and dark, data and visual, dense and spacious slides.
- Decks over 12 slides get a section divider every 4–8 slides.

➡ **Show the plan and carry on.** Put it at the top of the reply and keep building. Stop and wait only if the user asked to review the plan, or the brief is genuinely ambiguous in a way that would waste the whole build.

**Stage 4. Build.**
- Build in batches of 5–8 slides. Before each batch, re-read the style rules and the relevant catalogue files.
- Start from the master (`master/house-master-16x9.potx`) and use the generator for each pattern, supplying only the data, text, count and highlight. All colours must be theme slots, so the deck recolours with Design → Variants → Colors.
- If no archetype fits, design the slide in the house style, flag it **NEW**, and propose adding it to the catalogue.

**Stage 5. Check.**
1. Run `scripts/check.py` and fix everything it flags.
2. Render every slide to an image and review it against Section 7.
3. For important decks, the visual review is done by a separate pass that didn't build the deck.

**Stage 6. Learn.** Follow `maintenance/learning-loop.md`: log the deck, turn the user's corrections into rules, apply them and tell the user what changed (they can undo any of it). This includes `Style/style-rules.md` (fonts, colours, sizes): archive the old version, apply, re-render the test briefs, and report. Never change a rule without telling the user.

---

## 4. Message types → archetypes

Every slide carries one message. Classify the message first, then choose the visual.

| Message type | Question it answers | Typical action title | Archetypes |
|---|---|---|---|
| **Component** | What is it made of? | "Asia is 40% of revenue" | 100% stacked bar; pie (2–5 parts); Marimekko (2 dimensions) |
| **Item** | How do things rank? | "Brand A leads on NPS" | Horizontal bar (sorted); dot plot |
| **Time series** | How did it change? | "Margin fell 3 years running" | Column; line |
| **Bridge** | How did A become B? | "Profit fell due to price & FX" | Waterfall |
| **Distribution** | How is it spread? | "Most deals are under $5M" | Histogram; box plot |
| **Correlation** | Does X relate to Y? | "Bigger stores earn more" | Scatter; bubble |
| **Qualitative** | How do options compare on criteria? | "Option B scores best overall" | Harvey-ball table; scorecard; comparison table |
| **Positioning** | Where do things sit / what to prioritise? | "Focus on 3 high-value segments" | 2×2 matrix; BCG matrix |
| **Breakdown** | What drives it? | "3 drivers explain the gap" | Issue tree; driver tree; pyramid |
| **Process** | What are the steps? | "Rollout in 4 phases" | Chevron flow; timeline; roadmap; Gantt |
| **Structure** | How is it organised? | "Value chain has 5 stages" | Value chain; org chart; layered stack |
| **Geography** | Where? | "East China leads growth" | Choropleth map; point map |
| **Headline** | One key number or statement | "Revenue up 32%" | KPI hero; KPI row; big statement; quote |
| **Framework** | Apply a known model | "Supplier power is the main threat" | Five Forces, 7S, SWOT, BCG matrix, etc. |

Non-content slides: title, agenda, section divider, appendix divider, end slide.

---

## 5. Choosing the visual

Each rule has its reason, so it can be applied sensibly at the edges.

- **More than 7 categories → horizontal bar, sorted largest first.** *Long labels fit, and the ranking reads instantly.*
- **Time series: 12 periods or fewer and one series → column. More periods or several series → line.** *Columns get too thin, and several column series get cluttered.*
- **Pie only for a single split into 2–5 parts that sum to 100%.** To compare shares across groups or years, use a 100% stacked bar. *People can't compare many angles, or angles across pies.*
- **Waterfall only for 3–8 steps, and only when start + changes = end exactly.** Group extra steps into "Other". If the drivers don't sum, use a horizontal bar. *Beyond that the chart becomes unreadable, and a waterfall that doesn't add up misleads.*
- **Stacked bar vs Marimekko:** if column widths carry meaning (e.g. segment size), use a Marimekko.
- **2×2 only when both axes run clearly from low to high.** A few named items for a decision → 2×2. A pattern across many points → scatter. *Otherwise the quadrants mean nothing.*
- **Table vs Harvey balls:** if the values are qualitative ratings, use Harvey balls.
- **Process vs timeline:** if dates or durations matter, use a timeline or roadmap.
- **Never chart 1–2 numbers. Use a KPI hero or KPI row.** *A chart adds nothing to a single comparison.*
- **One message per slide.** If a slide needs two titles, split it.
- **Accent colour only on the one thing that matters; everything else stays neutral or grey.** *Grey gives context, and colour marks the point.*

---

## 6. Archetype specs

Each archetype has a spec in `catalogue/`, in the format set out in `catalogue/README.md`. The most important parts of a spec are **use when**, **don't use when**, and the good and bad examples.

---

## 7. Checklists

**Automatic (`scripts/check.py`)**
- Only fonts, sizes and colours from the active style (the user's reference, or the house default)
- No text overflowing its box, and nothing outside the margins
- Body text per slide within the word limit
- The same archetype never twice in a row
- Every content slide has an action title (a full sentence, not a 1–2 word label)

**Visual (on rendered images)**
- Can the main point be understood in **5 seconds**?
- Does the visual match the message type in the plan? Would a simpler visual work as well?
- Is the accent colour used only for the key point?
- Is there enough white space, and are elements aligned to the grid?
- Does the slide feel like part of the same deck as its neighbours?
- Do the titles alone still tell the story?
- Storyline rules (§8 of storytelling.md): exec-summary form used; connectives in the title chain; every evidence block ends in a "Therefore…" decision; problem before each strategy; role tags in long decks; value bridge if there are financials; personas/competitors consistent; key-questions slide; named strategy with lettered pillars; numbered risk heat map; value tree + phased roadmap
- Slide rules: ≤ 4 numbered panels with sentence sub-headlines in a §4b layout; Z reading order with the conclusion in the last cell; same palette and categories across panels; so-what in the same place on every analysis slide; one highlight per figure

---

## 8. Defaults (when not specified)

- **Audience:** senior executives. Action titles, one message per slide, detail in the appendix.
- **Format:** 16:9.
- **Length:** about 1 slide per 2 minutes of talk time; 10–15 slides for a typical update.
- **Structure:** title → executive summary → 2–4 sections → next steps → appendix.
- **Language:** match the brief and keep terminology consistent. Chinese decks follow the Chinese rules in `Style/style-rules.md` (Microsoft YaHei, full-width punctuation, ~80 characters of body text).
- **Numbers:** round sensibly (at most 1 decimal on percentages), and always state units and the source.
- **Text:** at most ~40 words (English) or ~80 characters (Chinese) of body text per slide.
- **Motion:** none, or a subtle Morph between related slides only.

---

## 9. Folder map

```
Powerpoint/
├── DECK-SYSTEM.md        ← this file (always read)
├── Style/                ← style-rules.md (house style), refs/ (style cards of studied references), style-findings.md, slide-index.md
├── catalogue/            ← README.md (spec format + status), one file per message type, examples/
├── Generators/           ← house.js (master + theme-link), patterns.js (pattern functions, any n), patterns_story.js (exec-summary forms, evidence panels, personas, journey, story charts), patterns_place.js (maps, zoom chains, sites, buildings, floor plans), objstore.py, components.py (slides → single diagrams), rebuild_slides.py (PDF/image → editable slides), vectorize.py (pictures + embedded charts → shapes), build_*.js
├── bench/                ← reproduction benchmark: 20 reference slides rebuilt from prompts and scored (README, results-log)
├── scripts/              ← make_style_profile.py (a reference's measured look for the generators); layout_skeleton.py (panel boxes of a reference slide); audit_reference.py (full-treatment check, must pass before 'learned'); ingest_reference.py (adds any new reference; PDFs/screenshots are turned into editable slides first); study_reference.py (measures its look); check.py (not built yet)
├── review/               ← contact sheets of ingested references (for the visual pass)
├── master/               ← house-master-16x9.potx (14 layouts, theme colours) + README.md
├── samples/              ← sample decks for review
├── maintenance/          ← learning-loop, setup, library-study, test-briefs (system changes only)
├── logs/                 ← lessons-log, usage-log, changelog
├── archive/              ← previous versions of changed files
├── Templates/            ← reference decks (structure only)
└── Objects/              ← Text / Data / Flow / Visual / Brand
```
