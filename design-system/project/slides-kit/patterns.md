# Slides kit: building a Claude Slides deck in the Powerpoint House Style

Use with `project/slides-kit/deck.css`. Both files belong to the design system **Powerpoint House Style**; the look comes from the user's Powerpoint folder (`Generators/house.js`) and is re-written here by `scripts/sync_design_system.py`.

## Before any slide

1. **Storyline first.** If the user's Powerpoint folder is reachable (the `deck-system` skill), read its `DECK-SYSTEM.md` and do Stages 1–3 there: brief, storyline, slide plan. The Slides deck is only a different last step. If the folder is not reachable, follow the content rules in this design system's README.
2. **Copy `deck.css` whole** into the deck's `project/deck.css`. It declares every token, the slide frame and all the classes below. Add deck-specific rules after it; never change the token block.
3. **Fonts:** Arial (a basic face) with Microsoft YaHei / PingFang SC for Chinese. Nothing to upload, no `faces` entry.

## Fill the page: several exhibits per slide (the rule that matters most)

Measured on the user's reference decks: **78% of content slides carry 2–4 exhibits**, and the median slide fills **93–98%** of its body. One chart alone in a sea of white is not their style, and a deck built that way is wrong even if every slide passes the other checks.

- **Every analysis slide is a `compose` slide:** 2–4 panels, each with a numbered sentence sub-headline, read in Z order, the conclusion (Insights + so-what, or a takeaway under the panel) in the last position. All panels prove the one title.
- **A single exhibit is the exception** (at most one content slide in four): a full-width table, roadmap or framework that needs the room. It still gets its reading (takeaway bar or insight column).
- **Fill with proof, never with size or decoration.** If a slide looks empty, it is missing evidence: the numbers behind the claim, the comparison, the driver, the consequence. Add that. Don't enlarge the chart, add white-space padding or stock pictures.
- **Executive summary:** lettered conclusions on the left, "the numbers behind the answer" (4–5 KPI tiles) on the right; the letters come back at the start of every later title (A1, A2, B1…).
- Panels are separated by gutters, not boxes; same palette, same highlight colour for the same thing in every panel; one `key` per panel.

Layouts (from the folder's `Style/refs/case-competitions.md` §4b), all built from `.hs-row.fill` and `.hs-p`:

| Layout | Build | Use |
|---|---|---|
| HALF2 | one `.hs-row.fill` with two `.hs-p`, a `.hs-ptake` under each | two facts that together prove the title |
| GRID4I | two `.hs-row.fill`; the last cell is the insights panel | market and customer analysis |
| T2B1 | row of two `.hs-p`, then a row with one wide `.hs-p` | two drivers, then the combined effect |
| T1B2 | row with one wide `.hs-p`, then exhibit + insights | one big picture, then its detail and reading |
| EXI | `.hs-p.w2` holding two stacked panels + an insights panel on the right | evidence left, conclusion right |
| L2R1 | left `.hs-p` holding two stacked panels + one tall panel on the right | a tall table explained by two small charts |
| BAND2 | two rows, each one full-width panel (the second may end in an insights panel) | a process on top, its numbers below |

## Rules that differ from a PowerPoint deck

- Canvas 1920 × 1080; 1 in = 144 px, 1 pt = 2 px. Title 48 px, body 28 px, labels 24 px.
- **Nothing under 24 px** (Slides' floor): labels, sources and page numbers that are 9–11 pt in PowerPoint are 24 px here. Use fewer words, not smaller type.
- Margins are the house 58 px, not Slides' default 128 px: consulting slides are dense (see "Fill the page"). Everything flows inside `.hs-body`; only the source line and the page number are pinned.
- Charts are **boxes, not pictures**: every bar is a `<div>` with a height in px, every label a `<p>`, so people can edit them. Scale: tallest bar 440 px in a 560 px chart; bar px = value ÷ max × 440. Line and pie charts: one `<svg>` (no `<text>`), labels as `<p>` after it.
- Colour roles are the same: grey does the work, `key` marks the one point (green edge or fill; green text only as `.hs-key`, which is the dark text-safe green). At most one or two `key` uses per slide.
- Tables cannot hold shapes or fills per cell: for scores use `.hs-grid` (rows of boxes); for plain numbers use `table.hs-table`.
- Not available on this route (PowerPoint route only): maps other than a picture, stored template objects, reference-deck matching, native Excel-linked charts. Say so and offer the PowerPoint route when a slide needs one.

## Every content slide (frame)

```html
<section id="ID">
<div class="hs-head"><h2>Action title: the point of the slide as one sentence, at most two lines</h2></div>
<p class="hs-sub">What the exhibit shows, unit</p>
<div class="hs-body">
  …one recipe below…
</div>
<p class="hs-src">Source: …</p>
</section>
```

The title sits bottom-anchored in a two-line box, so one- and two-line titles end on the same line. Keep `<p class="hs-sub">` on every content slide (it holds the body's top edge). The page number is automatic. `hs-grow` is an empty spacer that pushes what follows to the bottom, e.g. the takeaway bar.

## Recipes

### cover, divider, statement (dark slides)

```html
<section id="cover" class="hs-dark hs-nonum">
<h1>Entering SE Asia through a JV can double growth by 2030</h1>
<div class="hs-rule"></div>
<p>Board discussion · market entry options</p>
<p>November 2026 · Draft for discussion</p>
</section>
```

Divider: `<section class="hs-dark"><p class="no">02</p><h1>Where to play in SE Asia</h1></section>`. Key statement or decision: an `<h1>` with the number or verb in `<span>` (accent), the rule, one supporting line.

### exec (executive summary, agenda, labelled rows)

```html
<section id="summary">
<div class="hs-head"><h2>Executive summary: enter SE Asia via a JV, starting with Vietnam</h2></div>
<p class="hs-sub">The argument in five lines</p>
<div class="hs-body">
<div class="hs-exec">
<div class="r"><p class="l">Home market</p><p class="t">Margins fell 3 points in two years, mostly from price; growth headroom is limited</p></div>
<div class="r"><p class="l">Opportunity</p><p class="t">SE Asia snacks grow 9% a year; premium chilled grows 14%</p></div>
<div class="r"><p class="l">Where</p><p class="t">Vietnam and Indonesia score highest on attractiveness and our ability to win</p></div>
<div class="r"><p class="l">How</p><p class="t">A JV with a local distributor gives reach to 40k outlets from day one</p></div>
<div class="r key"><p class="l">Decision</p><p class="t">Approve US$ 25 m and start partner talks in Q1 2027</p></div>
</div>
</div>
</section>
```

### kpi-row + takeaway

```html
<section id="kpis">
<div class="hs-head"><h2>Home-market profit is under pressure on every key measure</h2></div>
<p class="hs-sub">Home market, FY25 vs FY23</p>
<div class="hs-body">
<div class="hs-row" style="margin-top:60px">
<div class="hs-kpi key"><p class="num">−3 pts</p><p class="lab">EBIT margin</p><p class="note">from 14% to 11%</p></div>
<div class="hs-kpi"><p class="num">+1.2%</p><p class="lab">Volume growth p.a.</p><p class="note">below inflation</p></div>
<div class="hs-kpi"><p class="num">34%</p><p class="lab">Online share</p><p class="note">doubled since 2022</p></div>
<div class="hs-kpi"><p class="num">4th</p><p class="lab">Cost per unit rank</p><p class="note">of 8 peers</p></div>
</div>
<div class="hs-grow"></div>
<div class="hs-takeaway"><p>Cost cuts alone cannot close the gap: we need a new growth engine</p></div>
</div>
<p class="hs-src">Source: illustrative data for layout review</p>
</section>
```

### waterfall + commentary panel (compose)

Each floating bar is the bar plus an empty spacer `<div>` under it: spacer px = the level the bar starts from ÷ max × 440. Totals `b total`, increases `b up`, decreases `b down`.

```html
<section id="bridge">
<div class="hs-head"><h2>Price, not volume, explains most of the margin decline</h2></div>
<p class="hs-sub">EBIT bridge FY23 → FY25, US$ m</p>
<div class="hs-body">
<div class="hs-row hs-grow">
<div class="hs-col" style="flex:1.7; gap:0">
<div class="hs-bars" style="height:560px">
<div class="hs-bar"><p class="v">168</p><div class="b total" style="height:440px"></div></div>
<div class="hs-bar key"><p class="v">−29</p><div class="b down" style="height:76px"></div><div style="height:364px"></div></div>
<div class="hs-bar"><p class="v">−3</p><div class="b down" style="height:8px"></div><div style="height:356px"></div></div>
<div class="hs-bar"><p class="v">−16</p><div class="b down" style="height:42px"></div><div style="height:314px"></div></div>
<div class="hs-bar"><p class="v">+12</p><div class="b up" style="height:32px"></div><div style="height:314px"></div></div>
<div class="hs-bar"><p class="v">132</p><div class="b total" style="height:346px"></div></div>
</div>
<div class="hs-cats"><p>FY23</p><p>Price / mix</p><p>Volume</p><p>Input costs</p><p>Savings</p><p>FY25</p></div>
</div>
<div class="hs-panel" style="flex:1">
<h3 style="color:#002776">So what</h3>
<p>Promotions got deeper and longer: price / mix cost US$ 29 m.</p>
<p>Savings offset less than half of input-cost inflation.</p>
</div>
</div>
</div>
<p class="hs-src">Source: illustrative data for layout review</p>
</section>
```

### bars (columns with one highlighted) + numbered sub-headline

```html
<section id="market">
<div class="hs-head"><h2>SE Asia snacks will grow 9% a year to US$ 38 bn by 2030</h2></div>
<p class="hs-sub">SE Asia packaged snacks market, US$ bn</p>
<div class="hs-body">
<div class="hs-row hs-grow">
<div class="hs-col" style="flex:1.9; gap:0">
<div class="hs-bars" style="height:560px">
<div class="hs-bar"><p class="v">20</p><div class="b" style="height:232px"></div></div>
<div class="hs-bar"><p class="v">24</p><div class="b" style="height:278px"></div></div>
<div class="hs-bar"><p class="v">28</p><div class="b" style="height:324px"></div></div>
<div class="hs-bar"><p class="v">33</p><div class="b" style="height:382px"></div></div>
<div class="hs-bar key"><p class="v">38</p><div class="b" style="height:440px"></div></div>
</div>
<div class="hs-cats"><p>2022</p><p>2024</p><p>2026</p><p>2028F</p><p>2030F</p></div>
</div>
<div class="hs-col" style="flex:1">
<div class="hs-subhead"><div class="hs-chip"><p>1</p></div><h3>What drives the growth</h3></div>
<ul>
<li>Rising middle class: 60 m new households by 2030</li>
<li>Modern trade doubles its share of grocery</li>
<li>Premium chilled grows fastest, at 14% a year</li>
</ul>
</div>
</div>
</div>
<p class="hs-src">Source: illustrative data for layout review</p>
</section>
```

Stacked columns: several `.b` in one `.hs-bar`, the series that matters `style="background:#002776"`, plus a `.hs-legend`. Ranking: `.hs-hbars` with `.hs-hbar` rows (`.c` label, `.t` track holding `.b` at `width:NN%`, `.v` value).

### table: scoring grid

```html
<section id="options">
<div class="hs-head"><h2>A joint venture beats building alone or acquiring on four of five criteria</h2></div>
<p class="hs-sub">Entry options scored against board criteria (4 = best)</p>
<div class="hs-body">
<div class="hs-grid">
<div class="r th"><p class="c0">Option</p><div class="c"><p>Speed to market</p></div><div class="c"><p>Capital needed</p></div><div class="c"><p>Control</p></div><div class="c"><p>Risk</p></div><div class="c"><p>Local know-how</p></div></div>
<div class="r"><p class="c0">Build alone</p><div class="c"><div class="hs-dot on"></div><div class="hs-dot"></div><div class="hs-dot"></div><div class="hs-dot"></div><p>1 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot"></div><p>3 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><p>4 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot"></div><div class="hs-dot"></div><p>2 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot"></div><div class="hs-dot"></div><div class="hs-dot"></div><p>1 of 4</p></div></div>
<div class="r key"><p class="c0">Joint venture</p><div class="c"><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><p>4 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot"></div><p>3 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot"></div><p>3 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot"></div><p>3 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><p>4 of 4</p></div></div>
<div class="r"><p class="c0">Acquire</p><div class="c"><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><p>4 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot"></div><div class="hs-dot"></div><div class="hs-dot"></div><p>1 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><p>4 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot"></div><div class="hs-dot"></div><div class="hs-dot"></div><p>1 of 4</p></div><div class="c"><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot on"></div><div class="hs-dot"></div><p>3 of 4</p></div></div>
</div>
<div class="hs-grow"></div>
<div class="hs-takeaway"><p>Recommend the joint venture: fast, capital-light and with local know-how</p></div>
</div>
<p class="hs-src">Source: illustrative data for layout review</p>
</section>
```

Plain data table: `<table class="hs-table"><tr class="th"><th>…</th></tr><tr><td>…</td></tr><tr class="band">…</tr><tr class="key">…</tr></table>`; numbers `style="text-align:right"` on the first-row cell of their column.

### pairs (before / after)

```html
<section id="model">
<div class="hs-head"><h2>The JV model shifts us from exporting to building a local business</h2></div>
<p class="hs-sub">Today vs JV operating model</p>
<div class="hs-body">
<div class="hs-pairs">
<div class="hs-pair"><div class="hs-card old"><div class="hd"><p>Today: export</p></div></div><div style="width:56px"></div><div class="hs-card"><div class="hd"><p>Target: JV</p></div></div></div>
<div class="hs-pair key"><div class="from"><p>Products shipped from home plants, 6-week lead time</p></div><x-shape kind="arrow-right" class="hs-arrow"></x-shape><div class="to"><p><b>Local co-packing, 1-week lead time</b></p></div></div>
<div class="hs-pair"><div class="from"><p>Sold through one importer</p></div><x-shape kind="arrow-right" class="hs-arrow"></x-shape><div class="to"><p>Partner network of 40k outlets</p></div></div>
<div class="hs-pair"><div class="from"><p>Home-market range, English packs</p></div><x-shape kind="arrow-right" class="hs-arrow"></x-shape><div class="to"><p>Adapted range and local-language packs</p></div></div>
<div class="hs-pair"><div class="from"><p>No local team</p></div><x-shape kind="arrow-right" class="hs-arrow"></x-shape><div class="to"><p>JV team of 60, our GM and finance lead</p></div></div>
</div>
</div>
</section>
```

### steps (process, phases, timeline)

`done` = past, `key` = now, plain = later. For a timeline put the date in the header (`Q1 2027`).

```html
<section id="plan">
<div class="hs-head"><h2>A five-phase programme gets us to first revenue in 14 months</h2></div>
<p class="hs-sub">Entry programme, phases and key activities</p>
<div class="hs-body">
<div class="hs-steps" style="height:480px; margin-top:20px">
<div class="hs-step done"><div class="hd"><p>1 Select</p></div><div class="bd"><p>Confirm Vietnam; deep-dive Indonesia</p></div></div>
<div class="hs-step key"><div class="hd"><p>2 Partner (now)</p></div><div class="bd"><p>Shortlist 3, sign term sheet</p></div></div>
<div class="hs-step"><div class="hd"><p>3 Set up</p></div><div class="bd"><p>JV legal entity, team of 60, licences</p></div></div>
<div class="hs-step"><div class="hd"><p>4 Pilot</p></div><div class="bd"><p>Two cities, 2k outlets, chilled range</p></div></div>
<div class="hs-step"><div class="hd"><p>5 Scale</p></div><div class="bd"><p>National roll-out to 40k outlets</p></div></div>
</div>
<div class="hs-grow"></div>
<div class="hs-takeaway"><p>Stage-gates after partner selection and after the pilot cap the downside</p></div>
</div>
</section>
```

### cards (text columns, personas, pillars)

```html
<div class="hs-row hs-grow">
<div class="hs-card"><div class="hd"><p>Reach</p></div><div class="bd"><p>≥ 30k outlets incl. modern trade</p></div></div>
<div class="hs-card key"><div class="hd"><p>Cold chain</p></div><div class="bd"><p>Chilled logistics in 5 cities</p></div></div>
<div class="hs-card"><div class="hd"><p>Licences</p></div><div class="bd"><p>Food import and distribution</p></div></div>
</div>
```

### matrix (2 × 2)

```html
<div class="hs-row hs-grow">
<div class="hs-matrix">
<div class="hs-cell"><h3>High attractiveness, hard to win</h3><p>Thailand</p></div>
<div class="hs-cell key"><h3>High attractiveness, can win</h3><p>Vietnam, Indonesia</p></div>
<div class="hs-cell"><h3>Low attractiveness, hard to win</h3><p>Myanmar</p></div>
<div class="hs-cell"><h3>Low attractiveness, can win</h3><p>Philippines</p></div>
</div>
</div>
<p class="hs-label hs-muted">Left to right: ability to win. Bottom to top: market attractiveness.</p>
```

### compose (several exhibits on one slide): the default for analysis slides

```html
<div class="hs-row fill">
<div class="hs-p">
  <div class="hs-subhead"><div class="hs-chip"><p>1</p></div><p>The panel's point as a sentence</p></div>
  <div class="hs-x bottom"> …columns: .hs-bars + .hs-cats… </div>
</div>
<div class="hs-p">
  <div class="hs-subhead"><div class="hs-chip"><p>2</p></div><p>…</p></div>
  <div class="hs-x"> …ranking: .hs-hbars, or a heat grid: .hs-heat… </div>
  <div class="hs-ptake"><p>What this panel means, in one line</p></div>
</div>
</div>
<div class="hs-row fill">
<div class="hs-p"> …third exhibit… </div>
<div class="hs-p">
  <div class="hs-ins"><p class="t">Insights</p><ul><li>One finding with its <b>key words</b> in bold</li><li>…</li></ul></div>
  <div class="hs-grow"></div>
  <div class="hs-sowhat"><p>So what: the recommendation this slide leads to</p></div>
</div>
</div>
```

- `.hs-p` = one panel (sub-headline, exhibit, optional takeaway). `.hs-p.w2` is twice as wide; `.hs-p.side` is a 520 px insight column. A `.hs-p` can hold two stacked `.hs-p` (give the outer one `style="gap:24px"`).
- `.hs-x` is the exhibit's room: it centres its content; `.hs-x.bottom` sits columns on the baseline.
- **Bar heights in panels:** two rows of panels: tallest bar 200 px; one row of panels: 400 px. Waterfall spacer = level before the step ÷ max × that height.
- `.hs-hbars` and `.hs-heat` stretch over the panel's height by themselves. Set a ranking's label width with `style="width:…px"` on `.c` when labels are long.
- **Heat grid** (scores, risks, shortlists): `.hs-heat` > `.r` > `.c0` (row label) + `.c` cells with the score as text; `.c.s4` best (main colour), `.c.s3` good (tint), plain = weak; `.r.th` header row; `.c.own` marks the chosen column. One box per cell keeps the slide light (a 5 × 5 grid of dots is 100+ elements; this is 30).
- **Lettered summary:** `.hs-let` (`.k` letter box, `.t` with `<h3>` conclusion + `<p>` points; `.hs-let.key` for the decision) in a `.hs-p.w2`, and `.hs-kc` KPI tiles (`.num`, `.lab`) in the `.hs-p` beside it.

## Before handing over

**Fill first:** every analysis slide has 2–4 panels and no large empty block; at most one content slide in four carries a single exhibit; the summary has its numbers column. Then, every slide: title is a sentence and fits two lines; nothing runs past the body (bottom edge 960 px); no text under 24 px; one `key` at most twice; a source line on every slide with numbers. Then check the same list as the PowerPoint route (`DECK-SYSTEM.md` §7) for the storyline.
