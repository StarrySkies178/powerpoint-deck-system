# New reference: the same treatment every time

**When:** the user gives any new reference: a deck, template, slide library, PDF or screenshot. Do this **before** using it, whether it's for one deck or for the library. *Why: the first 11 libraries were studied slide by slide; a new reference gets the same depth, or the system quietly gets worse.*

## Steps

1. **Ingest** — every kind of reference becomes editable slides:
   `python3 scripts/ingest_reference.py <file-or-folder> <key> "<Readable name>"`
   - *Decks (.pptx / .ppt / .potx):* the original is copied into `Templates/`.
   - *PDF, screenshots, scans or a folder of images:* there are no editable shapes, so they are **first turned into editable slides** (`Generators/rebuild_slides.py`). Vector PDF pages are imported as real shapes and text. Image pages are rebuilt: OCR text (English + Chinese) becomes text boxes with measured size, colour and bold; colour areas are traced into rectangles, rounded rectangles, ovals, lines or freeforms; photos stay as pictures. The result is `Templates/<name>-rebuilt.pptx`, with the original kept beside it (`-original.pdf` or `-source/`). A side-by-side sheet goes to `review/<key>/rebuild-review.jpg` with a similarity score per page.
   - Then every slide (original or rebuilt) is saved as editable vector objects (theme-role colours, theme fonts, pictures kept) in `Objects/store/`, titles go to `Style/slide-index.md`, auto-classified patterns to `Style/slide-map.csv` (marked *auto*), and numbered review sheets to `review/<key>/`.
   - **Check the rebuild:** open `rebuild-review.jpg`. Pages listed under `low_pages` (similarity under 0.8) need a look: fix misread text in the rebuilt deck, and if a drawing came out messy, rebuild it with a generator instead. Tell the user which pages were rebuilt and how close they are. A low score can also come from the comparison render itself (a PDF whose fonts aren't installed renders without its text), so judge by eye, not by the number. Uploads often arrive twice: check file hashes and skip identical copies.

2. **Look at every slide.** Open **every** review sheet, not a sample. For each slide, note what it shows and the story it tells. Use the same format as the first review: `range | pattern | count | what it shows: story intent`.

3. **Correct the pattern map.** Replace *auto* rows in `Style/slide-map.csv` with the right pattern and a note. Mark slides that fit no pattern as **NEW**.

4. **Learn from it:**
   - **Look** (only if the user wants decks to match it): run `scripts/study_reference.py` and write the style card in `Style/refs/<key>.md` (see `Style/style-rules.md` §1).
   - **New patterns:** for each NEW story pattern, propose a catalogue entry (story, use when / avoid, parts, count, scaling rule, emphasis, sources) for `Style/patterns.json` and `pattern-catalogue.md`. If it's needed often, propose a generator too.
   - **New rules:** if the reference states design or storytelling rules (like BCG's guide or Roland Berger's "lean, linear, literal"), propose them for `Style/storytelling.md`.

5. **Test reuse** on 2–3 of its objects: place, resize, recolour and `extend()`, then render and look. If `extend` fails on its repeated objects, note which ones in `Objects/README.md`.

6. **Report and log.** Tell the user in a few lines: slides studied, objects saved, new patterns found, rules proposed. Ask them to approve the proposals. Then add a line to `logs/changelog.md`.

## Never

- Skip step 2 or sample slides instead of looking at all of them.
- Copy logos, wordmarks or firm names into house objects or decks.
- Overwrite an existing key, or change `Style/style-rules.md`, without the user's approval.
