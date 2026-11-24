# Store fix 3: colour roles (Next block of roadmap 4.2, v2.85)

**What changed** (`Generators/objstore.py`, before: `archive/objstore_before-fix3-colours_v2.84_2026-11-24.py`):
- `extract` maps each source colour to a theme slot as before (theme mode is unchanged), and now also keeps the exact original colour on every stored colour, as a private attribute (`ds:c`, namespace `urn:deck-system:src`).
- `original_colours()` (used by `place(colours="original")`) gives each colour its own original. Before, it used one original per slot, so different greys stored in one slot came back as one grey (C08's heat map: 9 greys to 4) and a red stored in a slot whose most used colour was navy came back navy (C04's ring).
- `recolour()` drops the original on colours it changes on purpose. `place()` strips the private attribute before anything goes into a deck (checked: none in any built file).
- The single-diagram parts get the same per-colour originals, matched shape by shape with their whole-slide object.
- Also fixed in this run, both found by the re-run builders: `set_texts` treated a tab as a space when deciding that a paragraph's text was unchanged (from fix 1; C07's takeaways kept the PDF's tab-broken runs), and `table_size`'s banding test compared the fill XML, which the new attribute made differ (C08 B lost its bands). It now compares the colours.

**Store re-extracted** for the four C-case decks (every whole-slide object changed only by the attribute; 107 parts given their colours); audit ALL PASS; the Mac's store matches the cloud copy object by object. **Regression** 7 of 7 before and after.

| Case | A now | v2.74 | Hand code removed |
|---|---|---|---|
| C02 | 0.917 | 0.915 | mitigation boxes set back to F1F1F1 (the two grey rules also come out A6A6A6 now, as in the original) |
| C04 | 0.990 | 0.990 | the ring painted red (A and B) |
| C07 | 0.943 | 0.943 | the takeaway fill recoloured (to F1F1F1; the original EFEFEF now comes back by itself) |
| C08 | 0.947 | 0.947 | the 9-grey SHADES list and its loop (A and B) |
| C09 | 0.988 | 0.988 | the lower chart recoloured to B1B1B1 |

No A worse by eye or on layout_raw. B as before (C08's bands white/grey/white/grey/white). Builders' notes: `<case>/report-fix.md`.
