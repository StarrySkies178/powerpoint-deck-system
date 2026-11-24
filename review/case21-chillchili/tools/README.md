# Rebuild polish tools (references lane)

Second pass over decks rebuilt from pictures (`Generators/rebuild_slides.py`). They work on a rebuilt deck,
its page images and its OCR info, and write a new deck. Kept here (review/case21-chillchili/tools) because the reference tools
take bug fixes only; folding them into `rebuild_slides.py` is a row in `logs/proposals.md`.

Inputs (paths are the cloud working paths used when they were written; change the constants at the top
of each script, or pass the files, to run them elsewhere):
- page images `img/<key>/pg-NNN.png` (the source pages at full resolution)
- OCR info `out/<key>.info<N>.json` (lines per text block, page pixels) and `final/final_tags.json` (which N)
- the rebuilt deck `Templates/<name>-rebuilt.pptx`

## polish2.py  key deck.pptx out.pptx [--slides 3,5] [--report r.json]
Text and drawing fixes measured on the page, every slide:
- word by word: true ink colour (rebuild colours were washed), bold (ink mass against Arial regular/bold at the
  measured size), italic (lean of vertical strokes), size where the stored size is far off and the new one
  explains the line's width better, native bullets for bullet dots
- guards: white text stays white, black stays black, no colour taken from a bubble/badge under the word,
  no colour that fades against its ground, no change from a polluted measure
- text pieces split over two boxes on one line are joined (never number labels)
- traced photos (many flat patches) become the original photo crop at page resolution, text painted out
- light regions with holes punched by text become clean rectangles
- dashed/dotted boxes and lines found on the page become native dashed shapes
- traced glyph pieces under text in the text's colour are removed (doubled text)

## nativize.py  deck.pptx key spec.json out.pptx
Per-slide spec (see specs/): replaces traced charts with native PowerPoint charts (column, stacked,
clustered, waterfall via an invisible base series, line with markers, bubble, scatter, pie, doughnut,
bar), native tables (tables.py: merged cells, chips drawn as cell fill with gap borders, borders), and
native overlay shapes (lines with arrow/oval ends, ellipses, badges, region rectangles, text boxes),
removing the traced pieces and picture crops they replace. Values come from the original's labels; any
measured value is said in the chart's alt text.

## draft.py / autochart.py
Measuring helpers for writing a chart spec (bar edges, colour runs, labels). autochart.py is an experiment:
it finds few charts by itself; specs are written by hand from draft.py and grid views.

## pair1.py / tri.py / sheets.py
Review sheets: original | before | after, rendered with LibreOffice.
