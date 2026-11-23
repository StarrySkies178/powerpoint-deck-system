# Objects: how they're stored, and what can be done with them

There are two kinds of object. Both are fully editable. (Photos, logos, headshots and icons: see `Objects/images.md`.)

| Kind | Where | Best for |
|---|---|---|
| **Generated** | `Generators/patterns.js` (drawn from rules for any count, 31 patterns) and `objects-library.pptx` (visual index) | Standard patterns, and any change of count the template object can't take safely |
| **Template objects** | `Objects/store/` (2,610 objects from all template and reference slides (incl. 10 case-competition decks)), handled by `Generators/objstore.py` | Reusing a specific drawing: concept graphics, metaphors, maps, icons, frameworks, native charts |

## How template objects are saved

- **Vector.** Each object keeps its original outlines (DrawingML), so resizing is lossless.
- **Theme colour roles, not hex.** Objects follow any colour scheme, and so do native charts.
- **Theme fonts.** They follow Arial / YaHei, or a reference deck's fonts.
- **Pictures kept** (`media.zip`).
- **Clean.** Template frame elements repeated on most slides (logos, "Last Modified", company-name boxes) are removed. Instruction boxes ("Graphic title goes here", "Tip:", "Use this template…") are removed. **Filler text** ("Text", "Header", "Label 1", "<label>", "Type text here"…) is emptied into **fillable slots**: 13,224 of them, each with the old filler kept as a hint.
- **Native charts** (74, mainly Deloitte): stored with their chart part and embedded workbook, so they stay **editable charts with new data**. Think-cell and MS Graph objects can't be edited outside their add-ins, so they're kept as their preview picture. For an editable version, use the chart generators.

## Operations (`Generators/objstore.py`)

| What | Call | Notes |
|---|---|---|
| Find | `find(store, ["cycle"])` | Searches pattern, title and text |
| Place / resize | `place(deck, slide_no, obj, (x, y, w, h), store, texts=[…])` | Vector scaling. Text scales with the object, never below 8 pt. A label that won't fit its shape at 8 pt moves just outside it. Tables are placed natively and scaled cell by cell |
| Fill text | `slots(obj)` / `set_texts(obj, [...])` | In reading order. A list item can be several paragraphs |
| Chart data | `set_chart_data(obj, categories, [(name, values), …])` | Updates the chart **and** its workbook, so "Edit Data" in PowerPoint matches |
| Recolour | `recolour(obj, {"accent1": "accent3"})` / `recolour_elements(obj, [i], "accent3")` | Whole object, or one part (a cell, an arrow, a province) |
| Original colours | `place(..., colours="original")` / `original_colours(obj)` | Puts back the colours the object had on its source slide (each object keeps `role_src`: slot → original colour). Use when the user names that exact slide; otherwise objects follow the deck theme. Older objects were back-filled by `Generators/backfill_role_src.py` |
| Change the count | `extend(obj, n)` | See the rules below |
| Table rows / columns | `table_size(obj, rows=, cols=)` | Native tables |
| Transmute | `swap_geom(obj, "roundRect")` | Any PowerPoint preset; position, colour and text stay |
| Flip / rotate | `transform(obj, flipH=True, rot=90)` | |
| Pieces | `element(obj, i)`, `elements(obj)`, `ungroup(obj)`, `explode(obj)` | e.g. a map becomes one shape per province |
| Combine | `combine([obj1, obj2])` | Several objects become one new, resizable object |

## Changing the count: always a correct route

`extend(obj, n)` changes the count **in place only when the layout is regular**, so the result is guaranteed to look right:

- **Rows and columns:** the items are aligned, evenly spaced, the same size, and not overlapping. Each item's own text and boxes move with it.
- **Rings:** the shapes really run around a circle (checked on their outlines). The ring is rebuilt as true circular arrows at 360°/n, in the original's colours.
- **Labels inside one arrow:** the labels are re-spaced.
- **Tables:** rows are added or removed.

Otherwise it raises `NeedsGenerator`, naming the generator to use (`GEN_FOR`). The object is then redrawn by that generator, with its text and the house colours.

Result across all 1,367 repeating template objects: **238 change count in place**, **1,129 are redrawn by their generator**, and **0 have no route**. In a random visual check, 17–18 of 20 in-place results were right and the rest were usable. So after any `extend`, render the slide and look at it (DECK-SYSTEM Stage 5). If it looks wrong, use the generator.

## Rules

- After placing or changing any object, render the slide and check it.
- New objects made by combining or extending can be saved back to the store as `<deck>-new-<name>`.
- New references are added with `scripts/ingest_reference.py` (see `maintenance/new-reference.md`). They get the same cleaning, slots, charts and colour roles automatically.
- PDFs, screenshots and scans are first turned into editable slides by `Generators/rebuild_slides.py` (vector PDF import; OCR + traced shapes for images), so their objects go into the store too. Image pages are checked line by line against the page by eye (`Generators/ocr_review.py`) and rebuilt with the corrections before their objects are used, so their numbers can be trusted; drawings, icons, maps and charts are traced finely into shapes, and only real photos stay pictures. Isometric drawings and textured scans come out as many small shapes: fine to recolour and move, but redraw with a generator (`patterns_place.js` buildingExplode, maps) when they need changing.

## Single diagrams (parts)

Slides are also split into their separate diagrams by `Generators/components.py` (whitespace cuts, then checked by eye). Parts have ids like `case-jaguar-amorepacific-012p1`, with `part_of` and `kind` in `index.json`, and every operation (place, recolour, set_texts, extend, combine) works on them. Done so far for the 10 case-competition decks (142 parts). Picture charts are never reused as charts: `Style/refs/case-competitions-chart-rebuild-map.csv` maps each to a native builder.

## Pictures and embedded charts → shapes

Every reference's pictures and embedded charts are turned into editable shapes by `Generators/vectorize.py` (run automatically by `ingest_reference.py`). Embedded charts (think-cell / MS Graph / Excel) come from the vector render, so they are exact; they get ids `<slide id>c<n>`. Graphic pictures are traced (OCR text + colour regions); ids `<slide id>v<n>`. Photos stay pictures. Every operation works on them: place, resize, recolour, swap_geom, transform (flip/rotate), ungroup/explode, combine, set_texts. A vectorised chart's numbers are shapes, not chart data: to change the data, redraw it with a builder (`chartIn`, `stackedCagr`, `waterfall`…).
