# Powerpoint House Style

Consulting-grade 16:9 slides: one message per slide, an action title that states it, grey doing the work and one green accent marking the point. Navy and cyan carry the structure; Arial (with Microsoft YaHei for Chinese) carries everything else.

**Source of truth.** This design system mirrors the rules and generators in `~/Documents/Claude/Projects/Powerpoint` (private mirror: `StarrySkies178/powerpoint-deck-system`): `Style/style-rules.md`, `master/house-master-16x9.potx`, `Generators/house.js` and `Generators/patterns.js`. Every component here is drawn with the same geometry and colour choices as its generator, and the **Real output** asset group shows slides rendered from the actual PowerPoint generator, so you can compare. If the folder and this system ever disagree, the folder wins and this system is updated.

**One system, two ways out.** The storyline, slide plan and checks always come from the Powerpoint folder (`DECK-SYSTEM.md`, via the `deck-system` skill). Only the last step differs:

| You want | Route | Built with |
|---|---|---|
| A PowerPoint file (default; the full system: every pattern, stored template shapes, reference matching, maps, native charts) | Folder generators | `master/house-master-16x9.potx`, `Generators/` |
| A deck inside Claude (Slides: a link to share, edit and present; exports to .pptx or PDF) | This design system | `project/slides-kit/deck.css` + `project/slides-kit/patterns.md` |
| A one-page visual inside Claude (Design: poster, one-pager, mock slide) | This design system | The React components below |

**In step with folder version 2.24** (kept in step automatically by the folder's `scripts/sync_design_system.py`; the folder wins if they ever differ).

## Consuming this system

| Output | What to copy or read |
|---|---|
| Slides deck | Read `project/slides-kit/patterns.md` first and follow it; copy `project/slides-kit/deck.css` whole into the deck's `project/deck.css`. Fonts: nothing to copy (Arial is a basic face; Chinese falls back to Microsoft YaHei / PingFang SC) |
| Design canvas | `project/components/bundle.js` + `bundle.css` (`window.HouseStyle`), tokens from `project/tokens.json` |
| PowerPoint file | Not from here: use the folder (`deck-system` skill) |

**A reference overrides the look.** If a deck comes with a reference slide or template, match its colours, fonts and layout instead (the folder's `scripts/study_reference.py` measures it). The content rules below never change.

---

## Content fundamentals

**Every title is an action title**: a full sentence stating the conclusion, at most 2 lines, `t-title` (24 pt bold) in `title`.

| Do | Don't |
|---|---|
| "Price, not volume, explains most of the margin decline" | "Margin bridge" |
| "A joint venture beats building alone or acquiring on four of five criteria" | "Entry options" |
| "We rank fourth of eight on cost per unit" | "Cost benchmark" |

- **Title test:** reading only the titles tells the whole story. Answer first (pyramid principle); open with Situation → Complication → Question → Answer; the executive summary (`ExecSummary`) is the storyline in five lines.
- **One message per slide.** The body proves the title and nothing else; a slide that needs two titles is two slides.
- **Length:** an analysis slide carries about 120 to 200 words of body text (110 to 160 in a Slides deck, where nothing goes under 24 px; 240 to 400 characters in Chinese): a unit line and 2 to 4 reading bullets for each exhibit, key words bold in the main colour. Under 90 words the figures stand without their reading; over 260 it is a document page. Detail beyond that goes to the appendix.
- **Numbers:** units in the unit line over each exhibit ("US$ m, 2020–24"; no subtitle line under the title), source bottom-left on every data slide, at most 1 decimal on percentages, true minus signs (−29).
- **Chinese decks:** full-width punctuation in Chinese sentences (，。：；「」), half-width numbers and units (增长32%, 1.2亿元); YaHei runs larger, so leave ~10% spare room; bold for emphasis, never fake italics.
- **Tone:** plain, specific, declarative. No exclamation marks, no hype, no italics or underlines in body text.

## Visual foundations

### Colour: grey does the work, the accent marks the point

| Role | Token | Where it goes (as the generators draw it) |
|---|---|---|
| Main | `main` #002776 | Titles, totals in a bridge, the bar or column that matters, root of a tree, hub, header bars, takeaway bar, dark slides |
| Secondary | `secondary` #00A1DE | Increases in a bridge; its tint `secondary-tint` bands the recommended option, the main branch's sub-points, the "to" side of a before/after |
| **Accent** | `accent` #81BC00 | **The one item in focus** in a shape pattern: matrix cell, current process step, milestone, issue-tree branch, pyramid level, satellite, column header, current section in the tracker, the KPI edge, section numbers on dividers |
| Greys | `grey-1` … `grey-4` | Context: other bars and columns (`grey-3`), decreases and done steps (`grey-2`), secondary text and axes (`grey-1`), fills and inactive items (`grey-4`) |
| Semantic | `surface`, `title`, `ink`, `muted`, `panel`, `rule` | What components read; they switch automatically between light content slides and dark navy slides (two themes) |

- **Charts** highlight in navy (bars, columns, lines, stacked shares); **shape patterns** highlight in green. Either way: one highlight per slide, at most two.
- `secondary` and `accent` are fills on white, never text there (2.9:1 and 2.3:1). **Green text** on light backgrounds is `accent-text` #4D7100, the accent at 60% luminance (5.7:1 on white); on navy slides green text stays the bright accent. The generators apply this automatically (folder v2.2).
- Small text (source, footnotes, page numbers) is `muted` = `grey-1` (7.2:1). The master and the generator frame were changed to this in folder v2.1; they used `grey-2` (3.4:1) before.
- In PowerPoint every brand role is a theme slot (Accent 1–6, Dark 1, Light 1–2), so Design → Variants → Colors restyles a whole deck.

### Type

One family: Arial for Latin, Microsoft YaHei for Chinese (the theme's East Asian font in every deck). Scale: `t-cover` / `t-divider` 36 pt · `t-kpi` 66 pt · `t-title` 24 pt bold · `t-subtitle` 14 pt · `t-body` 14 pt · `t-label` 11 pt · `t-small` 10 pt · `t-foot` 9 pt. Bold for emphasis only.

### Grid and slide anatomy

16:9, 13.33 × 7.5 in (`slide-w` × `slide-h`; components draw at 96 px per inch). Every content slide (`Slide`) has the same frame:

| Zone | Position | Tokens |
|---|---|---|
| Section tracker (optional) | top-right squares | `Tracker` |
| Action title | top-left, bottom-anchored | `margin-x`, `title-top`, `title-h` |
| Subtitle / unit line | under the title | `subtitle-top` |
| Body | one area, 12 columns | `body-top`, `body-h`, `gutter` |
| Takeaway bar (optional) | bottom of the body | `TakeawayBox` |
| Footer | source left, page number right | `footer-top`, `t-foot` |

Boxes in a row are the same size with equal gaps. Flat 2D only: square corners (`radius-none`; circles only for Harvey balls, hubs, timeline dots and avatars), no shadows, no gradients, no 3D, no borders on boxes.

### Picking the component (from the message)

| Message | Component |
|---|---|
| One to four headline numbers | `KPIRow` (never chart 1–2 numbers) |
| Change over time, ≤ 12 periods | `ColumnChart`; more periods or several series → `LineChart` |
| Ranking (always if > 7 items) | `BarRanking` |
| Parts of a whole across groups or years | `StackedBar100`; one split of 2–5 parts → `Pie`; segment sizes matter → `Marimekko` |
| Shares from a survey | `DonutKPI` |
| Where (by province) | `ChinaMap` |
| How A became B (drivers that add up) | `Waterfall`, usually inside `ChartCommentary` |
| Does X relate to Y (many points) | `Scatter` |
| Where things sit, what to prioritise | `Matrix` (both axes low → high) |
| Options against qualitative criteria | `HarveyBallTable` |
| Today vs target, pros vs cons | `BeforeAfter` |
| Steps (dates don't matter) / milestones (they do) / workstreams over time | `ChevronProcess` / `Timeline` / `Gantt` |
| Narrowing selection | `Funnel` |
| Where sets overlap | `Venn` |
| Segment × need values | `Heatmap` |
| Team or governance | `OrgChart` |
| Strategy on a page | `Temple` |
| Why / how logic | `IssueTree` |
| Hierarchy, repeating process, parts of one thing | `Pyramid`, `Cycle`, `HubSpoke` |
| Parallel ideas | `TextColumns` |
| One statement, a quote, a decision | `KeyStatement` |

Rhythm: never the same component twice in a row; mix light and dark, data and visual, dense and spacious; a `SectionDivider` every 4–8 slides in decks over 12.

## Imagery and iconography

- **Photos:** your own, or free-licensed generic scenes (CC0 first), credited in the folder's `Objects/credits.md`; `ImageText` places them half-bleed. Crop, never stretch; text on a photo sits on a dark overlay.
- **No photos of real people from the web.** Headshots come only from you; otherwise an initials circle.
- **Logos:** only official files you supply (folder `Objects/Brand/logos/`), same height in a row, grey on comparison slides, never redrawn. No firm's logo, wordmark or name is part of this style.
- **Icons:** one style per deck (line or filled), in `main` or `grey-1`.

## Components

**Slides:** `Slide`, `TitleSlide`, `SectionDivider`, `Agenda`, `ExecSummary`, `KeyStatement`, `EndSlide`, `ImageText`. **Data:** `KPIRow`, `DonutKPI`, `ColumnChart`, `LineChart`, `BarRanking`, `StackedBar100`, `Pie`, `Marimekko`, `Waterfall`, `Scatter`, `ChinaMap`, `ChartCommentary`. **Compare & position:** `Matrix`, `HarveyBallTable`, `BeforeAfter`, `Venn`, `Heatmap`. **Sequence & structure:** `ChevronProcess`, `Timeline`, `Gantt`, `IssueTree`, `Pyramid`, `Funnel`, `Cycle`, `HubSpoke`, `TextColumns`, `OrgChart`, `Temple`. **Elements:** `TakeawayBox`, `Tracker`.

They are React components (`window.HouseStyle`); body components go inside `Slide` and fill its 1203 × 500 px body. `ChinaMap` uses the real province outlines from the folder's object store (also in the **Maps** asset group as an SVG with every province named). Still generator-only: world, US and city maps, swimlanes, persona cards, customer journeys and the rarer story patterns in `Style/pattern-catalogue.md`.
