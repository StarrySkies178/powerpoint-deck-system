# Story study: 10 case-competition decks (2016–2017)

**What this is:** how 10 strategy-proposal decks tell their story, and how each message is turned into a chart or diagram. Read this when planning a recommendation deck (Stage 1–2), especially market-entry, growth, channel or digital strategy for a client.

**Studied:** 10 decks, 199 slides, every slide looked at. Eight came in as PowerPoint files; two were PDFs (Sparkle, Old Driver) and were rebuilt into editable slides first. Each file was uploaded twice, and the copies were identical, so each deck was counted once.

| Key | Team | Client and question | Slides | Look |
|---|---|---|---|---|
| case-truenorth-pola | TrueNorth | Pola Orbis: 5-year growth in China | 23 | red title band, grey |
| case-harvester-lg | Harvester | LG H&H: China expansion | 20 | red band, photo dividers |
| case-jaguar-amorepacific | Jaguar (ZJU) | Amorepacific: brands, channels, cities | 20 | white, thin red rule |
| case-synergy-kose | Synergy (SJTU) | KOSE: 5-year expansion | 18 | red panels, dense |
| case-littleboat-gree | Little Boat | GREE: digitalisation (first round) | 18 | red band, photo dividers |
| case-neptune-appliance | On the Neptune | "Meling" appliances: digital transformation | 18 | navy/blue, restrained |
| case-polaris-gree | Polaris (Fudan) | GREE: digital transformation | 16 | navy + yellow accent |
| case-sssr-gree | SSSR | GREE: online and digital | 29 | red band, 16:9, big appendix |
| case-sparkle-shiseido | Sparkle (Fudan) | Shiseido: China expansion (PDF) | 16 | navy/light blue |
| case-olddriver-lg | Old Driver (PKU) | LG H&H: launch SU:M 37° (PDF) | 21 | dark photo dividers, light blue/gold |

Per-slide map: `Style/slide-map.csv`, with rows for these decks (pattern + story role + "message → figure"). Objects are in `Objects/store/case-*.jsonl.gz`.

---

## 1. The story skeleton they share

Almost every deck runs the same chain. The strongest decks make each link explicit:

```
Cover
Executive summary          ← the whole answer on one page
Agenda / tracker
1 WHERE TO PLAY  market → segment → customer → geography → channel → competitors
2 WHY THE CLIENT  diagnosis: client vs peers, root causes ("lagging because…")
3 HOW TO WIN  strategy overview (issue → goal → strategy), then one section per pillar
4 WHAT IT'S WORTH  financials: forecast, value bridge, ROI, scenarios
5 HOW TO DO IT  roadmap (Gantt, short vs long term), risks
Recap  (the overview slide again)    Appendix: models, assumptions, extra data
```

- **Evidence comes before each decision, and every block ends in a decision slide.** Jaguar ends brand, channel and geography each with a slide titled "Therefore, we…". Sparkle does the same with "Therefore…" and "Hence…".
- **Problem → strategy for each pillar.** Little Boat gives each strategy its own "problem" slide (GREE neglected online; GREE lags in smart products), then the strategy. Each pillar is a small pyramid of its own.
- **A competitor is used as the model.** Old Driver shows how Amore Pacific filled its brand line-up, which reveals LG's gap. Pola's deck sets SK-II and Shiseido examples beside each recommendation.
- **The close repeats the overview.** TrueNorth's last content slide is its strategy-overview matrix again ("fixes issues one-to-one"). Polaris and Sparkle close on a customer-journey synthesis.

## 2. Four ways they write the executive summary

| Form | How it looks | Best for | Seen in |
|---|---|---|---|
| **Lettered conclusions** | A / B / C bold conclusions, each with 2–4 ➢ supporting points. The letters come back in later slide titles ("A Premium skin care…", "C2 Mid-tier colour…") | Readers who jump to a section; long decks | Harvester |
| **Decision framework** | Columns = decision stages (chevrons). Rows = "analysing dimensions" → "implication / strategic solution". Bottom bar = the goal ("Achieve success in China") | Showing how the analysis leads to the answer; a judging panel | Polaris, Sparkle |
| **Story diagram** | 3 findings on a horizontal arrow (market fact above, client implication below) → target field bar → 3 strategies → "next steps" chevrons | One-glance storyline for a live pitch | On the Neptune |
| **Pyramid diagram** | Governing thought on top → 2 key arguments → 4 supports (boxes + arrows) → second key line (how) → the plan in one sentence → next steps | Recommendation decks; matches the exec-summary tree rule | Old Driver |

Weaker forms, to avoid: a paragraph narrative ("First we analysed… Second… Therefore… Finally…", Synergy) reads as process rather than answer. A brand-by-brand list (Jaguar) is fine content but has no single governing thought.

## 3. How the story is carried from slide to slide

1. **Titles read as one argument.** Read Sparkle's titles alone and you get the whole case: "…growing rapidly, but still far from saturation" → "Skin care and colour cosmetics are the most appealing…" → "**Therefore**, Shiseido and CPB should be prioritized" → "By demographic, female aged 25–44…" → "**Hence**…" → "To enter China, … department stores are the best strategy for CPB" → "**Meanwhile**, Shiseido should…" → "**Furthermore**, …low-tier cities…" → "Among online channels, Tmall is the optimal choice…" → "**…then** Tmall can provide…" → "**In the long term**, …every step of the customer journey". Connective words (*therefore, hence, meanwhile, furthermore, then, in the long term*) show how each slide relates to the one before. An ellipsis can carry a sentence across two slides.
2. **Role tags in titles** tell the reader what kind of slide it is:
   - "Analysis 1:", "Strategy 2:" (Old Driver)
   - "S-term:", "L-term:" (SSSR)
   - "R&D:", "Pre-sales:", "Sales:", "After-sales:" (Polaris, following the value chain)
   - A/B/C1/C2 (Harvester)
3. **A breadcrumb tracker sits top-left on every content slide.**
   - It shows the current section bold or black and the other sections grey.
   - Often it names the sub-topic too: "Market Analysis: Consumer Profile ► Five-year Strategies ► Financial".
   - The decision-framework decks use the same stage names as the executive summary.
4. **Recurring characters.**
   - Jaguar names its personas (Miss Mystery, Office Lady, Madame Gorgeous, Charming Gentleman) and reuses the same photos and names on the brand, channel and journey slides.
   - The client and its 2–3 named competitors also appear in the same order and colour on every comparison.
5. **Section dividers** use a big numeral with the section's sub-list, or the agenda with the current item highlighted.

## 4. Slide anatomy they use (and it works)

```
breadcrumb (section ► sub-topic)                              page no.
TITLE = the conclusion, 1–2 lines
[1] sub-headline = finding 1         [2] sub-headline = finding 2
    chart                                chart
[3] sub-headline = finding 3         INSIGHTS (icon) • 2–3 bullets, key words bold
                                     ┌ recommendation box: "Our recommendation is…" ┐
source line
```

- **2–3 numbered panels per slide.** Each has its own sub-headline sentence (number chip + bold line). The sub-headlines add up to the title. All 10 decks use it, and it's their most common content layout.
- **The so-what sits in the same place on every slide.**
  - On the Neptune uses a grey rounded box at bottom right ("Focusing on refrigerator category is a wise choice").
  - Old Driver uses a narrowing chevron into a light-blue takeaway bar.
  - Jaguar uses chart → grey chevron → bordered takeaway box.
- **Insight box** labelled "Insights", "Key Insights" or "Comment", with a light-bulb icon. The last bullet is usually "We recommend…".
- **Every data slide has a source line.** Survey slides give the base: "Primary research by team, N=215".

## 5. Message → figure: how they turn a point into a picture

This is the core of what the decks teach. The same kind of message gets the same kind of exhibit, and one highlight carries the point.

| Message (what the title says) | Figure they use | The highlight that makes the point | Examples |
|---|---|---|---|
| Market is big / growing / slowing | Column or stacked column by year; history vs forecast in two colours | CAGR for two periods beside the bars; the drop circled (6.1% → 2.9%); "+51%" bubbles over bar pairs | Polaris 3, Sparkle 3, Pola 3 |
| This segment is the one to target | Stacked bars by segment + **CAGR table** to the right | Chosen segment's CAGR circled or red-boxed; chosen bars in the accent colour, the rest grey | Harvester 6–8, Sparkle 4, Jaguar 5 |
| Where the profit is | Price range bars per function; segment × price-tier matrix | Dots on the chosen cells | Jaguar 5 |
| Who the customer is | Age-band table or bar; income × tier table | Target age rows circled; **persona cards** (photo, name, age, income, needs, drivers) | Sparkle 7, Harvester 9, Jaguar 6 |
| Customer needs changed | Stacked purchase criteria then vs now → **past/now table** | "Now" column bold | Pola 6, Little Boat 6 |
| How customers decide | **Customer-journey chevrons** (awareness → evaluation → purchase → after-sales) with actions per channel or persona | Online vs offline lanes; dots on the stages that matter | Jaguar 12, Little Boat 14, Polaris 15, Sparkle 15 |
| Where (geography) | China map (dots or shading) + city-tier stacked bars or table | East coast or tier circled; one strategy box per brand | Harvester 10, Jaguar 16–19, Old Driver 16 |
| Which channel | Channel × criteria **Harvey-ball table** (size, growth, service, brand building) | Red ticks on chosen channels; status → strategy columns | Sparkle 10, Jaguar 11, Pola 12 |
| Client vs competitors | **Positioning map** (two axes, bubble = revenue, logos) | Client in the accent colour or circled; target zone shaded | Polaris 5, Neptune 9, Pola 7 & 9 |
| Client lags (diagnosis) | Client vs peers bars; Harvey scan client × capability | Client column in a dashed red box → list of specific issues per row | SSSR 5, Little Boat 10 |
| Root causes | 3-column problem table (product / marketing / channel) | One benchmark "Example" box | Pola 7 |
| Choosing among options | Options × criteria Harvey matrix | Chosen row boxed; verdict column (✓ ✗, ↑ ↓) | Pola 15, Polaris 10–11, Neptune 18, Old Driver 9 & 11 |
| Strategy overview | Issue (as a question) → goal → strategy, 3 aligned columns; or journey/value-chain rows × situation → strategy → risk | Down-arrows between rows | Neptune 12, Old Driver 13, Pola 8, Polaris 6 |
| A recommended system | Before/after process or organisation diagram | Conflicts in red dashed boxes; "existing" vs "suggested" colours | Polaris 13, SSSR 15 |
| Learn from the best | Status quo / current practice / best demonstrated practice table | Named peer examples (Xiaomi, Midea) | SSSR 14 |
| Maturity path | Generation ladder (1.0 → 2.0 → 3.0) table | Client's current step marked | Little Boat 17 |
| What it's worth | Stacked forecast with CAGR arrow; **waterfall from today's revenue to the target, by initiative**; ROI table | Final bar and ROI circled | SSSR 18, Pola 16 |
| How sure | Scenario small multiples (pessimistic / normal / optimistic) | Same scale; CAGR per scenario | Pola 22–23 |
| When | Gantt by workstream (short vs long term), priority stars | Bars grouped by pillar; "given more time" box | Pola 17, Sparkle 16, Old Driver 20 |
| What could go wrong | 4 risk boxes (regulation, competitors, supply, counterfeit) or risk → mitigation column | — | Old Driver 19, Pola 8 |

**Proof devices** they add beside a chart:
- An expert quote in a grey box or big brackets, with name and title.
- A survey result as one big percentage in a donut (72%).
- Customer speech bubbles.
- A rival's case.
- "Example" tags with a benchmark brand.
- Text-mining of customer reviews (SSSR: topic model of 7,758 JD comments).

## 6. What not to copy

- **Text walls and tiny fonts** (Synergy, parts of SSSR). Long Title Case titles that run to two full lines.
- **Firm logos and branding** on slides (Bain logo end slides, competition marks). Never copied into house objects.
- **Empty "Thank you" slides.** Close on the recap or next steps.
- **3D pies, rainbow stacked bars and many colours in one chart** (Neptune 5, SSSR 3). They break "grey does the work, colour makes the point".
- **Different visual languages in one deck** (photo collage + red panels + logos).

## 7. Proposals (waiting for your approval; not applied yet)

**Storytelling rules** (would be added to `Style/storytelling.md`):
1. **Title chain test.** Before building, read the titles alone. They must read as one argument. Use connectives (*therefore, hence, meanwhile, furthermore, in the long term*) where a slide follows from the one before.
2. **Close every evidence block with a decision slide** that starts "Therefore…" and shows the choice as a table or matrix.
3. **For each strategy pillar, put a problem slide before the strategy slide.**
4. **Use role tags in titles in long decks:** "Analysis n:", "Strategy n:", "S-term:", "L-term:", or the value-chain stage. Or use exec-summary letters (A, B, C1…) that come back in the section titles.
5. **The so-what lives in one fixed place** on every analysis slide (bottom-right box or bottom bar).
6. **Panel rule:** a content slide has at most 3 numbered panels. Each panel's sub-headline is a sentence, and together they prove the title.
7. **Executive summary forms:** pick one of the four in §2 (lettered conclusions, decision framework, story diagram, pyramid diagram).
8. **Value bridge:** a recommendation deck with financials shows a waterfall from today to the target, by initiative.
9. **Recurring characters:** name the personas once and reuse them, with the same photo, name and colour, on every later slide.

**New patterns** (would be added to `Style/patterns.json` + `pattern-catalogue.md`, with generators):
- `persona-cards`: 2–5 customer personas. Each has a photo or icon, a name, age, income, needs and drivers, with an optional "brand option" row. Seen 3×.
- `customer-journey`: 4–6 stage chevrons across the top. Rows are personas, channels (online/offline) or "journey / client / strategy". Each cell holds actions, dots or icons. Seen 4×.
- `evidence-panels`: title + 2–3 numbered sub-headline panels + an insight box + a fixed so-what box. The most common content layout.

**New variants of existing patterns:**
- `exec-summary-tree`: add the decision-framework, story-diagram and lettered-conclusions forms.
- `scoring-table`: add "options × criteria with verdict column" and "client-vs-peers diagnosis with a dashed client column".
- `table`: add "status quo | current practice | best practice".
- `bubble-portfolio`: add "positioning map with client highlighted and target zone".
