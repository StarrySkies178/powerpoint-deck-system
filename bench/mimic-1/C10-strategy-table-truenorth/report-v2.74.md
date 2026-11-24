# C10 strategy table (TrueNorth): open-book mimic report

(Written by the builder; saved by the run's chat because the builder's file tool refused report files.)

## What was placed

- `case-truenorth-pola-008` (the slide's own object, 32 shapes): placed at its stored position and size, `colours="original"`, `scale_text=False`. Its stored title box (element 1) removed, because the harness frame draws the title. All 16 text boxes refilled with clean text (see below). In B also re-laid out from 4 to 5 journey rows.
- `case-truenorth-pola-004` element 0 (the TrueNorth logo picture): lifted with `element()` and placed as is at its stored position. The only picture on either slide, and it is a picture in the original deck.

## What was drawn instead, and why

- **Frame:** `L.start({ ref })` draws the red title band, the title and the source. `build.py` moves the title up 0.09 in and sets line spacing to 90%, because the deck sets its two title lines closer together than the profile does.
- **Breadcrumb:** drawn by hand: grey items, the current one black, red ► between them. The harness crumb (`crumbLine`) uses the default ▶ separator, which LibreOffice draws as an orange emoji, and colours the separator with the "on" colour (black), not red.
- **Grey source band** (CCCCCC, 7.21 in to the bottom): not in the profile or the stored object, so it is drawn and moved behind the source line.
- **Column header labels** (Current situation / Key strategies & initiatives / Risks / Mitigation): the stored object has the four grey header boxes (one custom shape) but not their text. The labels are drawn as text boxes centred on the boxes' own path coordinates.

## Refilling text: what needed a workaround

- The object comes from the vector-PDF import. Its text is split into one run per word or letter, with letter-spacing (`spc`) tweaks ("P o l it i c a l R is k s"). Line breaks were forced with paragraph right margins (`marR`).
- `objstore.set_texts` clones one template paragraph for every line, which would give the bold 14 pt sub-heading and the 12 pt bullets the same format. So `build.py` has its own `refill()`, which clones the box's own heading, bullet or plain paragraph for each line, collapses the runs into one, and drops `spc` and `marR`.
- No framework file was changed.

## Build A result

The render matches the original almost exactly. The only differences are one line break in Mitigation ("Prioritize channel") and the layout's page number "1", which the original lacks (left alone).

## Build B (changed content, one row more)

- **New content:** a fictional Lumi Tea entry into Southeast Asia, with a new title, crumb, headers, source and all cell text.
- **Five journey rows instead of four:** Discovery, Research, Purchase, Usage and Advocacy, each paired with an initiative.
- **Risk groups:** Market / Supply; the mitigation labels are three short plain paragraphs.

What broke, and the fixes:
- **`objstore.extend(obj, 5)` raises `NeedsGenerator`:** "nested-sizes: layout not a regular row/column -> use generator 'targetOnion'". The refusal itself is right (the rows are not the same height, and the Risks and Mitigation panels span all rows). But the suggested route is wrong: the object is mislabelled `nested-sizes`, so `GEN_FOR` points to `targetOnion` (an onion diagram), not to a table builder. Workaround in `B/build.py`: clone a stored row, then re-space the five rows over the same height (2.93 to 7.08 in).
- **Narrow text boxes:** the PDF-import boxes are only as wide as their original text (for example 2.17 in in a 3.05 in panel), so new text wrapped early. Row text boxes were widened to the panel width.
- **Fixed by checking renders:** a red key-strategies box that overflowed (bullet shortened); Mitigation text running to the panel edge (box narrowed to 1.28 in).

## Lint (`--profile Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json`)

- A: 1 error, 9 warnings
- B: 1 error, 11 warnings

- **Error, both builds: body size 12 pt against the profile's 14 pt.** The original slide itself uses 12 pt bullets and 14 pt sub-headings; the profile's body size is the deck median. Kept at 12 pt to match the slide.
- **Margins warnings (8 in A, 10 in B):** the left column starts at x = 0.10 in, as in the original.
- **Accent warning:** the four red highlight boxes, as in the original.
