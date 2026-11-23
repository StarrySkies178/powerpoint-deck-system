# House style rules

Claude may change this file when it learns something better (from a reference, a correction or a deck review): archive the old version in `archive/`, apply the change, re-render the master and test briefs, log it in `logs/changelog.md`, and tell the user what changed so they can undo it. (User decision 2026-11-23: the system should be dynamic, not wait for approval.)

**Status:** style source and colours approved 2026-11-22. Chinese font (Microsoft YaHei) approved 2026-11-22. Type sizes and grid are proposed until the master template has been built and reviewed.

---

## 1. Style source: which look to use (decide at Stage 1)

| Situation | Use |
|---|---|
| The user gives a **reference** (slide, deck, template, screenshot) | **Match the reference**: its colours, fonts, title placement, footer and overall look |
| No reference | **House default** (Section 2 onwards): the Deloitte-based palette and Arial |

### Study the reference first (mandatory when one is given)

Before Stage 2, study the reference thoroughly and write down its standards. Never eyeball when you can measure.

1. **Measure it:** `python3 scripts/study_reference.py <file> Style/refs/<name>.md`. This works on .pptx, .potx, .ppt (converted automatically), PDF and images. It records:
   - slide size and ratio
   - theme colours, plus the colours actually used, ranked by frequency
   - heading and body fonts (Latin and East Asian)
   - master text sizes, plus the font sizes actually used for titles and for other text
   - positions of the title, body, footer and page-number placeholders (so the margins)
   - the most common left, right, top and bottom edges (so the grid and alignment lines)
   - line weights, layout names, and how many tables, charts and pictures it uses
2. **Look at it:** render 3–6 representative slides and check what the script can't measure: title style (case, bold, rule under it), bullet style, how emphasis is shown, chart styling, table styling, how source and footnote lines are written, and what the dividers and title slide look like.
3. **Write the style card:** complete `Style/refs/<name>.md` with a short **"Standards to follow"** section of exact values. Include the font, the size scale by role (title, subtitle, body, labels, footnote), the margins, the title box position, the colour roles (main, secondary, accent, text, greys), line weights and the footer layout. Mark each value *measured* or *inferred*.
4. **Show it in the Stage 1 brief:** list the key standards in a few lines so the user can correct a misread before anything is built.
5. **Build to the card:**
   - If the reference is a .pptx or .potx, build on its own master and layouts. *Why: this matches exactly, with no guessing.*
   - Otherwise, set up the deck from the card's values.
   - Before every batch, re-read the card instead of the house-default sections below.
6. **Check against the card:** the automatic check uses the card's fonts, sizes, colours and margins as the allowed set. Anything outside them is flagged.
7. **Gaps:** where the reference doesn't show something (e.g. no chart in it), use the house default and say so.
### Rules while matching a reference

- **What never changes, whatever the reference:** storyline, action titles, one message per slide, archetype choice, rhythm rules, the accent only on the key point, and the checklists. A reference changes how slides *look*, not how they're *thought*.
- The reference applies **to that deck only**. Record the style source in `logs/usage-log.md`. Its card stays in `Style/refs/`, so if the same reference comes back it's reused (re-measure only if the file has changed). If a reference is used for 2+ decks, propose making it a named alternative style.
- **Never copy logos, wordmarks or firm names**, from a reference or from the Deloitte default. Only palette, type and layout conventions are used.

---

## 2. Format and grid

- 16:9, 13.33 × 7.5 in. The reference decks are 4:3: re-proportion their layouts, never stretch them.
- *Proposed, from the measured Deloitte card (`Style/refs/deloitte-timesaver.md`):* margins 0.4 in left and right; title box top 0.3 in; body from ~1.65 in; footer and page number on one line ~0.22 in from the bottom. 12-column grid with 0.2 in gutters. Confirm when the master is built.
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
| Accent as text | `4D7100` dark green (accent at 60% luminance, theme-linked) | Green **text** on white or light panels (labels, highlighted headers). `81BC00` is only for fills, and for text on navy |
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
- **Chinese text: Microsoft YaHei (微软雅黑)**, approved 2026-11-22. Set it as the theme's East Asian font for headings and body in **every** deck, so any Chinese character renders correctly even in an English deck. Latin letters and numbers inside Chinese text stay in Arial. *Why: YaHei is the standard screen font on Chinese corporate Windows machines and pairs cleanly with Arial. 宋体 (SimSun) is thin and serif on screen.*
- **When the deck is in Chinese** (the user says so, or the brief or content is Chinese):
  - Use full-width Chinese punctuation (，。：；「」) in Chinese sentences, and half-width numbers, units and % (e.g. 增长32%, 1.2亿元).
  - Text limits: a body of at most ~80 Chinese characters per slide (instead of ~40 words), and an action title of at most ~40 characters over 2 lines.
  - Same size scale as English. YaHei runs slightly larger than Arial, so leave ~10% spare room in text boxes.
  - Bold for emphasis only. Never fake italics on Chinese text.
- **A reference sets its own Chinese font:** use the font from its card. If the reference has none and the deck is Chinese, use YaHei.
- **Rendering previews:** the Linux render machine doesn't have YaHei or Arial. Run `scripts/setup_render_fonts.sh` once per session so previews substitute Noto Sans CJK SC and Liberation Sans, which are near-identical in width. Do the final check of line breaks in PowerPoint.
- *Measured in Deloitte:* titles 30 pt; content mostly 14 / 11 / 10 / 12 pt; master body 18 pt; lines mostly 1 pt and 0.75 pt.
- *Proposed sizes:* action title 24–28 pt (the Deloitte titles are 30 pt, but they are short topic titles; 2-line action titles need a little less); subtitle or unit line 14 pt; body 12–14 pt; chart and data labels 10–11 pt; footnotes and source 8–9 pt; KPI hero number 60–72 pt. *Why: the Deloitte deck mostly uses 10–14 pt for content. A 24 pt title keeps 2-line action titles from crowding the slide.*
- Bold for emphasis only. No italics in body text, and no underlines.

## 6. Charts

- Data labels on; few or no gridlines; no y-axis when every bar is labelled.
- The series that matters in main or accent; others in grey.
- Flat 2D only. No 3D, shadows or gradients.
