
## Several figures on one slide (composition)
Looked at every library slide that shows how to combine figures or present them (found through the reviewed slide map, then each one viewed): Roland Berger 104–113 and 198–199, Deloitte 19, 53–64, 74, 144, BCG 17 and 31–40, QPT 124–126 and 327, AT Kearney 27–28, 67, 165, McKinsey 167–175. The other libraries (mono, Bain, BearingPoint, EY, maps) hold one diagram per slide and teach no multi-figure layout.

What they teach, and where it now lives:
| Lesson | Source | In the system |
|---|---|---|
| Put the panel's point in a coloured header on top of a framed chart ("you can put your points here in the header of the box") | RB 106–111 | `composeSlide({boxed:true})` |
| Two boxed charts side by side; chart + text box; conclusion box under a chart | RB 105–111, 198–199 | layouts HALF2, TXC, EXB |
| Small multiples: two stacked, four parallel, four on a page, four paired, six with sub-titles; same categories and axis in every panel | Deloitte 53–64, RB 113, ATK 28 | layout MULTI |
| Highlight the same series in every panel ("highlight one series with red") | ATK 67, 28 | one `highlight` index per panel |
| Bullets left + chart right ("text and chart slide") | Deloitte 59, 74 | layout TXC |
| A grid of evidence → arrow → one conclusion block; columns → chevron → conclusion | Deloitte 19, McK 167–169 | layouts FLOW, CHAIN, GRID4I |
| Two charts compared, each with a takeaway bar below | Deloitte 144 | HALF2 + panel notes / EXB |
| Situation / Approach / Impact columns, last column highlighted | ATK 165 | layout COL3 (highlight the last) |
| Combining formats (a graphic + quotes) makes the message stronger, but don't let the slide become confusing; the same data can be shown several ways, choose by message | BCG 17, 35–40 | storytelling.md §3, §8 rule 11 |
| Live presenting: fade-outs and cover-ups grey out what isn't discussed yet | QPT 327 | `fadeOut(slide, box)` |
| Combination pie + column; combined (nested) pies | QPT 124–126 | `chartIn` (pie/donut) + HALF2 |
