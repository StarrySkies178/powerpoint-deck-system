# Objects: how they're stored, and what can be done with them

There are two kinds of object. Both are fully editable. (Photos, logos, headshots and icons: see `Objects/images.md`.)

| Kind | Where | Best for |
|---|---|---|
| **Generated** | `Generators/patterns.js` (drawn from rules for any count, 31 patterns) and `objects-library.pptx` (visual index) | Standard patterns, and any change of count the template object can't take safely |
| **Template objects** | `Objects/store/` (2,412 objects from all template slides), handled by `Generators/objstore.py` | Reusing a specific drawing: concept graphics, metaphors, maps, icons, frameworks, native charts |

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
- PDFs, screenshots and scans are first turned into editable slides by `Generators/rebuild_slides.py` (vector PDF import; OCR + traced shapes for images), so their objects go into the store too. Rebuilt objects are approximations: text and simple shapes are reliable; complex drawings (maps, detailed icons) may need a generator or a cleaner source.
