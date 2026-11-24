# The failure list checked against the reference decks (roadmap step 1.6)

Written 2026-11-24 by the planning chat ("Accessing Claude skills across devices") after Mike said: do not ask me, look at the reference slides I gave you. This file answers the three questions at the end of `error-analysis-1.6.md` from the references themselves. It changes no rule, builder, checker or score; what follows from it is in `logs/proposals.md`.

## What was measured

- **Decks:** the 13 case decks in `Templates/` that are real PowerPoint files (2016 to 2019). One (LittleBoat) has no measurable content slide, so the numbers are from 12 decks, 189 content slides (172 with measurable body text). The rebuilt decks (2020 to 2024) are left out because their text sizes are estimates from pictures.
- **How:** `scripts/deck_lint.py` on each deck against its own style profile (the hand-checked one in `Style/refs/` for 4 decks, a fresh automatic one for the other 8, kept outside the folder), plus a count of body text sizes, source lines, page numbers and logos.
- **For comparison:** the same counts on 4 decks the system built (Doi Sky, 华拓精密, Northwind, sample deck v0.6; 33 content slides).
- **Not trusted:** the lint lines "font", "title", "off-palette" and "margins" against the 8 automatic profiles (an unchecked profile disagrees with its own deck too often to mean anything). My page number and source line counts miss some (two decks print the page number inside a footer text), so those are lower bounds.

## What the references do

| Failure kind | In the references | Reading |
|---|---|---|
| B6 large empty area | "empty" on 11 of 189 slides (6%). Median slide fills 93 to 100% of its body in 11 of 12 decks (one deck 79%) | A real failure. The references almost never leave a hole |
| C3 text under 9 pt | Any text under 9 pt on 14 of 172 slides (8%), 8 of them in one deck. A tenth or more of the text under 9 pt on 3 slides (2%). Under 8 pt on 2 slides | A real failure |
| C1 body text shrunk | Body text is 14 pt in 10 of 12 decks (13 and 15 in the others). A slide sits 2 pt or more under its deck on 35 of 172 slides (20%), 3 pt or more under on 10 (6%) | Going to 12 pt on a dense slide is normal. 3 pt or more under the deck is rare: that is the failure |
| C5 accent on too many shapes | Lint warns on 85 of 189 slides (45%), in all 12 decks | Not a failure. The references use their main colour on bands, chips and headers all over the slide |
| B3 text runs into the next element | "overflow" (text bigger than its box) on 0 slides. "covered" (text under another shape) on 15 slides (8%), mostly labels drawn on shapes on purpose | Text spilling out of its box never happens in the references: instant fail |
| D1 logo, footer | Logo on at least 171 of 189 slides (90%), source line on at least 70%, page number on at least 66% (lower bounds, see above) | The frame is on practically every slide. It counts |
| Too few words | "thin" on 30 slides (16%), "wordy" on 2 (1%) | The references are dense, rarely thin |

## The same counts on what the system built

| | References (12 decks) | System (4 decks) |
|---|---|---|
| Body text size (deck median) | 14 pt (range 13 to 15) | 11 pt in 3 decks, 13 pt in 1 |
| Smallest text on the median slide | 10 to 14 pt | 10 pt in all 4 |
| Body filled (median slide) | 93 to 100% (one deck 79%) | 89 to 92%, the Chinese deck 72% |
| Main colour on more than two shapes | 45% of slides | 3 of 33 slides (9%) |

All decks are 7.5 in high, so the point sizes compare directly. Three measurable things separate the system's slides from the references: **the text is about 3 pt smaller, there is more unused space, and colour is used far more sparingly.** That fits Mike's reasons for failing all ten comparisons ("looks more professional", "looks AI", "white blank gaps").

## Answers to the three questions, from the references

1. **Strike or add.** Strike C5 (accent on too many shapes): every reference does it. Keep the rest. Add one kind the draft lacks: **F1, the slide looks machine-made**: the same panel layout slide after slide, small grey text, little colour, where the references vary their exhibits and use colour and size boldly. This one cannot be measured by a script; Mike's 60 ratings and their reasons are what will define it.
2. **Instant fail or not.** Instant fail, because the references never or almost never do it: A1 (a number no exhibit shows), A4 (wrong language), B3 (text spilling out of its box or into the next element), B4 (a label broken mid-word), B6 (a large empty area), C3 (a tenth or more of the text under 9 pt), D1 (no logo or footer where the deck has one). Fail when clearly off: C1 (body text 3 pt or more under the deck), B1, B2, B5, C2, C4. Minor, only counts with others: D2, D3. A2 and A3 are content faults a picture cannot show; they stay with the builder's own check.
3. **Does the frame count?** Yes. At least 90% of reference slides carry the logo and most carry source line and page number.

## What could not be checked from the references

A1 to A3 (is the content right) need the brief, which the references do not come with. B1, B2, B4, B5 and D3 were judged by eye on the 60 rating slides (v2.45), where no reference slide shows them; that is a look at 25 slides, not a count.
