# Story study: 10 case-competition decks (2019–2020)

Second batch of case-competition decks, studied 2026-11-23 the same way as `case-competitions.md` (2016–17). Each file was uploaded twice; duplicates were skipped.

| Key | Deck | Year · case | Source | Slides |
|---|---|---|---|---|
| case19-bainology | Case-2019-Bainology | 2019 · jewellery brand growth in China | .pptx | 28 |
| case19-ecluster | Case-2019-E-Cluster | 2019 · jewellery brand growth in China | .pptx | 24 |
| case19-innovision | Case-2019-InnoVision | 2019 · jewellery brand growth in China | .pptx | 25 |
| case19-mindcraft | Case-2019-Mindcraft | 2019 · jewellery brand growth in China | .pptx | 33 |
| case19-polaris | Case-2019-Polaris | 2019 · jewellery brand growth in China | .pptx | 22 |
| case20-gym-brief | Case-2020-Gym-case-brief | 2020 · the case prompt (fitness chain) | image PDF, rebuilt | 1 |
| case20-vaccine | Case-2020-Vaccine | 2020 · fitness chain growth under COVID-19 | image PDF, rebuilt | 17 |
| case20-tnt | Case-2020-TNT | 2020 · fitness chain growth under COVID-19 | image PDF, rebuilt | 18 |
| case20-baincraft | Case-2020-Baincraft | 2020 · fitness chain growth under COVID-19 | image PDF, rebuilt | 31 |
| case20-doubleclick | Case-2020-DoubleClick | 2020 · fitness chain growth under COVID-19 | image PDF, rebuilt | 39 |

All 238 slides were looked at one by one (contact sheets of every slide) and the slide map (`Style/slide-map.csv`) was written by hand: layout code, story role and how the message is turned into a figure, for every slide.

## 1. The story skeleton they share

Same spine as the 2016–17 decks, with two things added: an explicit **key-questions** step and a **risk heat map** before the plan.

1. Cover → agenda (repeated as a **tracker** before every section in 7 of 9 decks; current section highlighted, its sub-points shown)
2. Executive summary (one page, answer first)
3. Market → customer → competition (each slide: title = finding, 2–4 numbered panels)
4. Diagnosis / **key questions** ("Customer trends pose 2 key questions to our future strategy": trend → capability ✓/✗ → numbered question)
5. Strategy overview (one page: the pillars, lettered A/B/C, usually tied to a revenue driver tree)
6. One section per pillar: problem or rationale slide, then 1–3 "how" slides
7. Financials: scenario forecast + **value bridge** (waterfall by initiative) + unit economics
8. Risks: **numbered risk heat map → same numbers in a risk/mitigation list** (7 of 9 decks)
9. Implementation: Gantt by workstream, often under named phases (Stabilise / Revitalise / Arise; Recovery → Growth → Pilot)
10. Appendix: models, survey results, city lists, personas

## 2. How they write the executive summary

The four forms from the first study (lettered conclusions, decision framework, story diagram, pyramid) all appear again. New forms seen:

| Form | How it looks | Seen in | Generator |
|---|---|---|---|
| **Situation → pillars → outcome** | 3 situation boxes (industry / customer / company) → coloured mission bar → 3 lettered pillars with sub-headed bullets → 2 outcome boxes (more customers / more spend per customer) → one value box ("~500m incremental revenue") | DoubleClick 3, Bainology 2 | `composeSlide({layout:"T3B1"})` with `initiativeMatrix` in the wide cell |
| **Label-block rows** | Coloured label blocks down the left (Market trends / Growth strategy / Road map) with grouped bullets and rules between | TNT 2, E-Cluster 2, Vaccine 2 | `labelledRows` / `ROWS` |
| **Situation · strategy · projection** | Narrow numbered situation column, wide strategy column (each lever with a one-line "external-shock influence" in the accent colour), narrow KPI column with big numbers + risks | Baincraft 2 | `COL3` + `donutKpis`/big numbers |
| **Decision framework** (again) | Stage chevrons × "analysis dimensions / implications" → converging arrows → goal bar | Polaris 2 | `decisionFramework` |
| Agenda as summary | Each agenda section carries its key messages in a shaded box | InnoVision 2 | acceptable for short decks |
| Prose paragraphs (avoid) | Four paragraphs on a dark background | Mindcraft 3 | — reads as narrative, not as an answer |

## 3. How the story is carried

- **Named strategy, repeated.** The strategy gets a name or mission line ("Engage Everyone", "Future Sales", a customer-facing tagline) that appears in the executive summary, the strategy overview and the close.
- **Lettered pillars reused in titles and chips**: "A Store expansion: …", "B2 Content development: …", FS1/FS2/FS3, a1–a3. The letter chip sits before the title on every slide of that pillar.
- **Breadcrumb tracker** above the title on every content slide (section › sub-section, current one bold or coloured), plus the repeated agenda tracker at section starts.
- **Key-questions slide** between the analysis and the strategy: each trend is checked against the client's capability (✓ strength / ✗ gap) and turned into a numbered question; the strategy section answers those numbers.
- **Problem → solution per pillar**: e.g. "Innovation is the criterion we fail to satisfy" → "The element strategy lets us innovate".
- **Short-term vs long-term** split everywhere an external shock matters (COVID-19 decks): columns or row labels "S-term / L-term", phase names on the roadmap.

## 4b. Several figures on one slide (measured on the 122 main-body content slides)

Classified by eye from the rendered slides (covers, agendas, dividers and appendix excluded). **83% carry two or more exhibits** (78% in the 2016–17 decks).

| Layout | Share | Typical use here |
|---|---|---|
| HALF2 | 39% | analysis + recommendation pairs; chart left, cards right |
| COL3 | 12% | three initiatives / three store formats / three steps |
| FULL (framework, matrix, tree, Gantt) | 12% | strategy overview, roadmap, system diagrams |
| T2B1 | 6% | two trend charts + drivers band below |
| BAND2 | 5% | timeline over risk table; long chart over its consequence |
| FLOW (2–3 blocks with chevrons) | 5% | target pool → criteria → result; risk map → mitigations |
| GRID4 | 4% | four facets; 2×2 with row labels and column themes |
| R2L1 | 3% | one tall market chart + two smaller driver charts |
| T1B2, T3B1, TXC, ROWS, TEXT, COL4, CHAIN, EXI | ≤2% each | |

New in this batch, and now in the composer (`Generators/patterns_story.js`):
- **T3B1**: three situation boxes on top, a down-arrow, one wide answer cell below (exec summaries).
- **COL4 / COLN**: four (or n) parallel initiative columns.
- **FLOW with 2–4 blocks** joined by chevrons (target pool → criteria → map).
- **Panel takeaway** (`panel.takeaway`): a framed one-line conclusion under each exhibit (DoubleClick 4 and 13, E-Cluster 6, Mindcraft 14). Use it when each panel has its own so-what; use the insight cell when the panels share one.
- **Vertical row-group labels** (`vlabel`): rotated labels in a coloured band grouping table rows (Demographic / Psychological / Behavioural; Product / Access / Brand).

The rules from §4b of `case-competitions.md` still hold: numbered sentence sub-headlines, Z reading order with the conclusion last, one highlight per panel all pointing to the same answer, at most 4 panels.

## 5. Message → figure (new rows; the first study's table still applies)

| Message | Figure | Highlight | Examples | Generator |
|---|---|---|---|---|
| What could go wrong, and what we do | **Risk heat map**: numbered dots on likelihood × impact, priority zone dashed, then the same numbers in a risk → mitigation list | dots in the zone in the accent colour | Mindcraft 15, Vaccine 14, Baincraft 17, DoubleClick 14, Bainology 18 | `riskMatrix` |
| How the target number is built | **Value tree**: target = a × b × c (stores = cities × stores per city × formats; revenue = users × visits × spend), each leaf tied to a lettered initiative | the leaf the strategy moves | TNT 8 & 10, Baincraft 13, Polaris 8, Bainology 23 | `valueTree` |
| Which segment to target among many | **Segment heat grid** (segment × need, shaded by share) or a persona map with photos as bubbles | target cells / zone dashed | TNT 5, Baincraft 6, DoubleClick 5 | `heatGrid`, `positioningMap` |
| Where we stand vs rivals on the criteria that matter | **Scoring table** with Harvey balls / dots, own column in a dashed box, verdict row | own column | E-Cluster 7, InnoVision 11 & 13, Polaris 13, Vaccine 17 | `scoringTable` |
| What the initiatives are, side by side | **Initiative matrix**: lettered columns × row bands (Overview / Detail / Impact), journey-stage chain at the foot | the pillar being discussed | Bainology 11, Baincraft 11, InnoVision 6, DoubleClick 7 | `initiativeMatrix` |
| Of those who do X, why? | **Exploded bar**: one stacked column, the chosen segment opened with a dashed bracket into a breakdown bar chart | the chosen segment and the top reason | DoubleClick 25–26 | `explodedBar` |
| When, in what order | **Gantt under phase steps** (0–1 / 1–3 / 3–5 years with names), workstreams grouped by pillar, milestones as diamonds | priority bars in the main colour | Vaccine 13, TNT 16, Baincraft 19, Polaris 16 | `gantt` |
| Where we are in the talk | **Agenda tracker** before each section | current section | 7 of 9 decks | `agendaTracker` |
| How uncertain the recovery is | Scenario sketch curves (A/B/C: V, U, W shapes) before the numbers | — | Vaccine 6 | `curve` pattern (not yet a generator) |
| An ecosystem / system | Hub-and-spoke or loop diagram with labelled links | the client at the centre | TNT 14, Vaccine 12 (four-piece puzzle), DoubleClick 12 | `hubSpoke`, `cycle`; puzzle via store objects |

Proof devices seen again: customer quotes in speech marks beside personas, an expert/CEO quote beside a chart, survey "N=" in the chart header, circled CAGR, "+x%" growth bubbles, dashed callout boxes around the deciding rows.

## 6. What not to copy

- Brand wordmarks, product photos, celebrity and team photos on content slides (never copied into house objects; the store keeps none of them).
- Prose executive summaries; text-only "agenda as summary" for long decks.
- Appendix model tables pasted at 5–7 pt (Bainology, InnoVision): put the model in a file, keep 2–3 summary rows on the slide.
- Mixed fonts (Arial MT / Arial / Calibri / Verdana in one deck); serif + red on every slide (Vaccine) reads heavy.
- "Thank you" closing slides.

## 6b. Formatting, measured

Measured with `scripts/measure_type_scale.py` (sizes normalised to a 7.5-inch-tall slide) on the five .pptx decks, and by eye on the five rebuilt image decks. House rules in `Style/style-rules.md` are unchanged: these decks confirm them.

| Deck | Slide | Title | Body / labels | Source line | Fonts | Colour |
|---|---|---|---|---|---|---|
| case19-bainology | 14.0×7.9 in | 24.5 pt, white on a navy band, ~95 chars | 13 / 11 / 9 pt; 11% of text under 9 pt (appendix tables) | 8.5 pt at 96% | Arial (+ Arial MT) | navy + pink accent, greys |
| case19-ecluster | 13.33×7.5 | 24 pt white on navy band, ~90 chars | 14–16 / 12 pt | 10 pt at 97% | Arial | navy + light blue |
| case19-innovision | 10.83×7.5 | 24 pt white on blue band | 14 / 12 pt | 14 pt | Calibri | steel blue + yellow highlight |
| case19-mindcraft | 13.33×7.5 | ~24 pt dark text, red rule under; breadcrumb above | 14 / 12 / 10 pt | 10 pt at 97% | Verdana | red C00000-type + greys + one blue-grey |
| case19-polaris | 13.33×7.5 | 24 pt, ~124 chars (two lines), black | 14–16 / 12 pt | 10 pt at 96% | Arial | red + greys |
| case20 decks (rebuilt) | 16:9 | 20–24 pt, two lines, black (Vaccine serif) with red rule | 11–14 pt | small, bottom-left | sans (Vaccine serif) | red + greys (+ black/navy second series) |

Common: one main hue (navy in 3 decks, red in 6) + greys, one highlight colour; number chips (square or round) before panel sub-headlines; dashed boxes and circles as highlight marks; source line on every data slide.

## 7. Charts: editable or picture, and how they are rebuilt

- **The five .pptx decks have no native chart objects and no embedded OLE charts.** Their charts were exported as drawn shapes (freeforms + text boxes), so they are already editable shapes: stored as objects and parts. Their pictures are photos, logos, product shots and small icons (Polaris: all < 1 in²); vectorising kept maps, word clouds, illustrations, the heat zones of the risk map and scatter plots, and dropped logos and photos.
- **The five 2020 decks are image-only PDFs** (one JPEG per page). They were rebuilt into editable slides with `Generators/rebuild_slides.py` (OCR text + traced shapes); their charts are now shapes too.
- To change numbers, redraw with the builders rather than editing traced bars: stacked/clustered columns → `chartIn`/`stackedCagr`/`growthBars`; scenario lines → `chartIn` line; waterfalls → `waterfall`; scoring tables → `scoringTable`; risk maps → `riskMatrix`; Gantts → `gantt`; heat grids → `heatGrid`; exploded bars → `explodedBar`.

## 8. Rules applied (2026-11-23, for all presentations)

Added to `Style/storytelling.md` §8 as rules 12–15 and wired into DECK-SYSTEM like rules 1–11:
12. **Key questions before the strategy.**
13. **Name the strategy and letter its pillars**, reuse both everywhere.
14. **Risks as a numbered heat map with the same numbers in the mitigation list.**
15. **Show how the target number is built** (value tree, leaves tied to initiatives) and phase the roadmap.

What is in the system now: the 10 decks in `Templates/`, their objects, parts and vectorised drawings in `Objects/store/`, the hand-written slide map, the new generators and layouts above, and the test deck `Generators/cases1920-demo.pptx`.

## 9. Objects, parts and rebuild quality

- **Store:** 238 whole-slide objects (two team pages with private photos left out), 229 single diagrams (parts) and 27 vectorised drawings kept, out of 559 candidates; every one was looked at on contact sheets. Dropped: logos and wordmarks, product, store, team and influencer photos, text-only crumbs, clipped panels, garbled traces of model tables.
- **Splitter fix found here:** the 2019 decks separate panels with full-height divider lines and put axis-label tables across the gutter, so the whitespace cut found nothing (Polaris: 4 parts). `Generators/components.py` now ignores long thin dividers and, when the first cut fails, cuts on the drawn shapes only and gives each straddling text box to the panel it overlaps most (Polaris: 29 parts; all decks: +128 parts).
- **Image decks rebuilt** (`Generators/rebuild_slides.py`), similarity to the original page: Gym brief 0.54, Vaccine 0.58, TNT 0.57, Baincraft 0.60, DoubleClick 0.65 (mean per deck; this is a pixel measure, lower for busy photo pages). Fixes made while checking them by eye: text inside picture regions is now removed from the picture (it was showing twice: once in the image, once as a text box), and a line's font size is capped by its width (a number chip beside a heading made headings far too big). Known limits: soft photos are sometimes traced as flat colour shapes, some white-on-colour labels and small Chinese labels are missed or misread, isometric drawings lose detail. The original pages are kept beside each rebuilt deck (`Templates/<name>-original.pdf`); use them as the visual reference and redraw exhibits with the builders.
