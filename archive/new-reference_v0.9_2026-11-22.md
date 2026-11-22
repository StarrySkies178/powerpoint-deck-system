# New reference: the same treatment every time

**When:** the user gives any new reference: a deck, template, slide library, PDF or screenshot. Do this **before** using it, whether it's for one deck or for the library. *Why: the first 11 libraries were studied slide by slide; a new reference gets the same depth, or the system quietly gets worse.*

## Steps

1. **Ingest** (decks: .pptx / .ppt / .potx):
   `python3 scripts/ingest_reference.py <file> <key> "<Readable name>"`
   This copies the original into `Templates/` and saves every slide's drawing as editable vector objects (theme-role colours, theme fonts, pictures kept) in `Objects/store/`. It appends titles to `Style/slide-index.md` and auto-classified patterns to `Style/slide-map.csv` (marked *auto*), and renders numbered review sheets to `review/<key>/`.
   *PDF or images:* there are no editable shapes. Skip the object store, render the pages and do steps 2–5 from the images. Rebuild any object worth keeping with the generators.

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
