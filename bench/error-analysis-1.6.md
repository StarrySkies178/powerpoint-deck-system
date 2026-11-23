# DRAFT: kinds of failure seen so far (roadmap step 1.6)

**DRAFT for Mike to confirm, change or strike.** Written 2026-11-24 by the deck building chat. Nothing here is a rule yet, and no judge is built from it until Mike has gone through it (roadmap 1.6: error analysis before any judge).

**Looked at:** the three test decks of roadmap 1.5 (`Claude outputs/2026-11-24 roadmap 1.5 decks/`: D1 = Doi Sky Coffee board deck, 12 slides; D2 = 华拓精密 Chinese management deck, 8 slides; D3 = Northwind IC deck, 6 slides), and the 30 diagnosis builds of roadmap 1.4 (`bench/diagnosis-1.4/<case>/a|b|c`). **Seen** = I saw it on the render or in the checker output; **reported** = a builder reported it and I did not check it by eye.

Each kind has one example and the slide it came from. Kinds are grouped by what a reviewer would ask.

## A. Is the content right?

| # | Kind of failure | Example (slide) | Seen / reported |
|---|---|---|---|
| A1 | A number in the summary or a title that no exhibit shows, or that disagrees with the exhibit | First draft of D1 slide 2 claimed a "14% margin" shown on no slide; D1 slide 3's title gave growth rates its chart did not (fixed before delivery) | seen |
| A2 | The builder fills a gap in the brief with its own guess and does not flag it on the slide | C02 a, b and c: the prompt gives no years for the online and omni-channel rows; each builder picked its own (C02 a drew 2019–20 and 2020–23) | reported |
| A3 | The builder follows a second source over the prompt where they disagree | C05 b drew the last two tasks over 2022–2024 because the layout description said three cells; the prompt says 2021–2024 | reported |
| A4 | Words left in the wrong language by a builder | D2 slide 7 printed "Insights" and D2 slide 4 printed an English Gantt legend in a Simplified Chinese deck (fixed by hand) | seen |

## B. Is the slide arranged right?

| # | Kind of failure | Example (slide) | Seen / reported |
|---|---|---|---|
| B1 | Arrangement differs from the reference where the prompt does not say how it is arranged | C06 a: four numbered rows with chips and grey panels; the original is four plain paragraphs on a full-bleed shaded background | seen |
| B2 | The slide's overall look (background, dark or light) is missed | C06 a, b and c: original has a dark background with a white bold title; all three have a white slide and a black title (fails "title colour" and "title bold") | seen |
| B3 | Text runs into the next element | C01 a: the "Omni-channel Strategy" item runs into the implication row below it. D3 slide 2 (first build): a three-line title ran into the breadcrumb | seen |
| B4 | Labels squeezed into a column too narrow, breaking mid-word | C05 a: the "Potential Risks" label box shows "Potenti / al Risks"; C04 a: the CAGR table's row labels wrap one syllable per line | seen |
| B5 | Chart labels clipped, colliding or dropped in small panels | D1 slides 3 to 5 (first builds): clipped value labels, overlapping labels on the positioning map, every second category label dropped on a short bar chart (fixed by hand) | seen |
| B6 | Large empty area: the slide carries too little for its space | D2 slides 2, 4 and 5 (lint: 55% to 70% of the body used); D3 slide 5 before its table rows were made taller | seen |

## C. Does it meet the reference's type and colour standards?

| # | Kind of failure | Example (slide) | Seen / reported |
|---|---|---|---|
| C1 | Body type shrunk below the deck's size to make content fit | C09 b: 12 pt where the deck uses 18 pt; C10 a: 10.5 pt against 12 pt. The most frequent failed standard: 5 of 10 cases | seen (scorer) |
| C2 | Body margins not the deck's | C05 a, b and c: left margin 0.27 in against the deck's 0.84 in | seen (scorer) |
| C3 | Text under 9 pt | D1 slide 3: an 8 pt legend in a narrow panel | seen (lint) |
| C4 | A colour not in the reference's palette | C06 a and C07 a: a light pink #FCCCCC the reference does not use | seen (scorer) |
| C5 | The accent colour used on too many shapes | D1 slide 11 and D2 slide 6 (risk matrices): 6 accent-filled shapes | seen (lint) |

## D. Is the frame of the slide the deck's?

| # | Kind of failure | Example (slide) | Seen / reported |
|---|---|---|---|
| D1 | Logo, footer rule or footer band missing, or drawn by hand as text | C03 a: no Pandora and Polaris logos; C08 b: the MindCraft logo redrawn as red text with an icon | seen (C03 a), reported (C08 b) |
| D2 | Wrong page number on a one-slide build | C01 c shows page "1" in LibreOffice where the deck's slide is page 2 (several builders wrote the number as plain text to get round it) | reported |
| D3 | A stray line or glyph from the style profile | E-Cluster builds (C04, C05): the profile draws a panel underline across every slide; TrueNorth builds: the breadcrumb separator shows as an emoji box. All builders removed or replaced it by hand | reported |

## E. Not slide failures: the measuring tools

Kept apart because they say how far to trust the numbers, not what is wrong with a slide.

| # | What goes wrong | Example |
|---|---|---|
| E1 | The word count reads a run of Chinese characters as one word | D2 measured "2 content slides of 8, 36 body words" |
| E2 | The checker misses a wrapped title and once flags a correct one | D3 slide 2 (three-line title, clean lint); C05 c ("title: left edge 0.00 in, style is 0.00 in" reported as an error) |
| E3 | A build that looks close by eye scores near 0 on layout, because layout is scored above the deck's own other slides | C10 c: raw overlap 0.75 against a floor of 0.77, layout 0.00 (`bench/diagnosis-1.4/README.md`) |

## Questions for Mike

1. Are A1 to D3 the kinds you would fail a slide for? Strike any you would let pass, and add what you see that is missing.
2. Which are pass or fail on their own (A1, A4, B3 look like hard fails), and which only count when several add up?
3. Should D (the frame) count at all when the user names a reference deck, or is the body what matters?
