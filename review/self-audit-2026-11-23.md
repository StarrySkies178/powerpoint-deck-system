# Self-audit: sample deck v0.4 against the reference decks (2026-11-23)

Asked by the user: "look at everything you do; I see more, I'm just not telling you; I want you to find it."
Method: 14 reference content slides looked at one by one (Baincraft 1/5/8/13, DoubleClick 4/7/12, TNT 5/8/13, Vaccine 6/9,
E-Cluster 1, Mindcraft, TrueNorth, Polaris 16) plus numbers measured with python-pptx on 7 reference decks and on
`samples/sample-deck-v0.4.pptx`. Status of every item: **open** unless marked fixed.

## Measured (median per content slide)

| | Sample v0.4 | 7 reference decks |
|---|---|---|
| Body words | 78 | 140 to 211 |
| Shapes | 32 | 51 to 82 |
| Slides with at least one picture (icon, logo, photo, pasted figure) | 0% | 85 to 100% in 6 of 7 decks |
| Native tables in the deck | 0 | 2 to 15 |
| Title words | 11 | 11 to 18 |

## Findings

1. **Too little text, and my own rule causes it.** `DECK-SYSTEM.md` says "at most ~40 words of body text per slide" and
   `deck_lint.py` warns above 80. The references carry 140 to 211. Every exhibit in them sits with 2 to 4 bullets of
   reading (key words bold or in the main colour); mine show the figure and one line.
2. **No pictures at all.** No icons beside headings, no company logos in comparisons, no photo on the cover or agenda.
   `Objects/Visual/icons/` is empty, so the system cannot place an icon even if the plan asks for one.
3. **Bare charts.** One series, value labels only. The references' charts carry a unit line, a legend, a CAGR column or
   a growth bubble on a trend arrow, a circled or dash-boxed highlight, often several series. The builders for exactly
   this exist (`stackedCagr`, `growthPairs`, `growthBars`); the sample used the plain `chartIn`.
4. **Bar chart after bar chart.** 16 charts on 12 slides, no table. The references mix tables with row-label boxes,
   ticks and Harvey balls, flows with boxes and arrows, formula trees, quotes, personas, maps and matrices.
5. **Half as many elements per slide** (32 against 51 to 82): the pages are filled, but still thin.
6. **No section breadcrumb or letter chip.** Baincraft, E-Cluster and Mindcraft run a breadcrumb above the title with
   the current section highlighted; DoubleClick and TNT put a letter chip before it. The sample types "A1:" into the
   title. `tracker` and `crumbLine` exist and were not used.
7. **A grey subtitle line under every title; titles cut to one line.** None of the 14 reference slides has a subtitle.
   Their titles are full two-line sentences with a rule under them. I shortened mine so they would not wrap.
8. **Boxes with an accent bar on the left edge** (takeaway under a panel, so-what box): the same invented idiom as the
   KPI tiles removed in v2.12. The references use a grey filled box with bullets, an outlined box, or a full-colour bar.
9. **Flat cover, no agenda.** Reference covers are a full-bleed photo with a colour panel and the client logo; agendas
   repeat the photo and box the current section.
10. **Evaluation marks.** References: Harvey balls, ticks and crosses, plus / on-par / minus circles with a legend.
    The Slides version of the sample shows digits in tinted cells, which no reference does.
11. **Key words in text** are often in the main colour in the references, not only bold (weaker evidence: 2 of 7 decks
    measurably, more by eye).

## What already matches

Numbered square chip + sentence sub-headline with a rule; Z order with the conclusion last; the risk slide (matrix with
a priority zone, lettered risks, mitigation list: DoubleClick 12); the summary's Projection column (Baincraft 2).

## Fix plan

- Rules: replace the 40-word cap with the measured range (about 120 to 200 words on an analysis slide, 10 to 12 pt
  inside panels); lint warns under 90 and over 260. No subtitle line; two-line action titles; breadcrumb or letter chip.
- Library: an icon set (one style, free licence, user approves the download); takeaway and so-what as grey filled
  boxes; charts through the annotated builders.
- Sample v0.5: same story, each exhibit with its reading bullets, icons on panel heads, at least four table or
  diagram slides, breadcrumb, photo cover and agenda (photos per `Objects/images.md`, after approval).
