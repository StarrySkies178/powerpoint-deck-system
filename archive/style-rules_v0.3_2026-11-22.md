# House style rules

Do not change this file without the user's explicit approval.

**Status:** style source and colours approved 2026-11-22. Type sizes and grid are proposed until the master template has been built and reviewed. Chinese pairing is still open.

---

## 1. Style source: which look to use (decide at Stage 1)

| Situation | Use |
|---|---|
| The user gives a **reference** (slide, deck, template, screenshot) | **Match the reference**: its colours, fonts, title placement, footer and overall look |
| No reference | **House default** (Section 2 onwards): the Deloitte-based palette and Arial |

How to match a reference:
1. **.pptx / .potx given** → build on its own master and layouts, and take colours and fonts from its theme. *Why: this is the most faithful match and needs no guessing.*
2. **Image or PDF given** → read off its main colour, accent, greys, font (the closest available), title position and footer, and state in the reply what was inferred.
3. **The reference shows only part of the look** (e.g. colours but no type) → take what it shows and fill the rest from the house default.
4. **What never changes, whatever the reference:** storyline, action titles, one message per slide, archetype choice, rhythm rules, the accent only on the key point, and the checklists. A reference changes how slides *look*, not how they're *thought*.
5. The reference applies **to that deck only**. Record the style source in `logs/usage-log.md`. If the same reference is used for 2+ decks, propose saving it as a named alternative style in `Style/` (e.g. `Style/alt-<name>.md`).
6. **Never copy logos, wordmarks or firm names**, from a reference or from the Deloitte default. Only palette, type and layout conventions are used.

---

## 2. Format and grid

- 16:9, 13.33 × 7.5 in. The reference decks are 4:3: re-proportion their layouts, never stretch them.
- *Proposed:* margins 0.5 in left and right, title top at 0.4 in, footer baseline at 7.1 in; 12-column grid with 0.2 in gutters. Confirm when the master is built.
- Boxes in a row are the same size, with equal gaps between them.

## 3. Slide anatomy (same position on every slide)

- Title top-left, an action title of at most 2 lines, with clear space or a thin rule below it.
- Optional unit or subtitle line under the title (e.g. "US$ m, 2020–24").
- One body area.
- Optional takeaway box at the bottom for the "so what".
- Footer: source and footnotes bottom-left, page number bottom-right.

## 4. Colour: house default (from Templates/Deloitte-timesaver.pptx)

| Role | Hex | Use |
|---|---|---|
| Main | `002776` navy | Primary shapes, the series that matters, title rule, dark slides |
| Secondary | `00A1DE` cyan | Second series, supporting shapes, links |
| **Accent** | `81BC00` green | **Only the key point** on a slide: a highlighted bar, a callout. At most one or two uses per slide |
| Text | `313131` dark grey | All body text and titles |
| Grey 1 | `575757` | Secondary text, axis labels |
| Grey 2 | `8C8C8C` | "Others" series, muted shapes |
| Grey 3 | `B4B4B4` | Connectors, borders, inactive items |
| Grey 4 | `DCDCDC` | Fills, table bands, backgrounds of boxes |
| White | `FFFFFF` | Background |
| Extended (charts with 4+ series only) | `72C7E7` light blue, `3C8A2E` dark green, `BDD203` lime | Only when the core colours run out |

*Why: grey gives context, and colour marks the point. Navy and cyan carry structure, and the green accent stays rare so it always means "look here".*

## 5. Type: house default

- **Font:** Arial for everything (the Deloitte deck uses Arial for both headings and body).
- **Chinese:** *open*. Candidate pairing: Microsoft YaHei 微软雅黑.
- *Proposed sizes:* action title 24 pt; subtitle or unit line 14 pt; body 12–14 pt; chart and data labels 10–11 pt; footnotes and source 8–9 pt; KPI hero number 60–72 pt. *Why: the Deloitte deck mostly uses 10–14 pt for content. A 24 pt title keeps 2-line action titles from crowding the slide.*
- Bold for emphasis only. No italics in body text, and no underlines.

## 6. Charts

- Data labels on; few or no gridlines; no y-axis when every bar is labelled.
- The series that matters in main or accent; others in grey.
- Flat 2D only. No 3D, shadows or gradients.
