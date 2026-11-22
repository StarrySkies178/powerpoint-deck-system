# Master template: house-master-16x9.potx

16:9 (13.33 × 7.5 in), built from `Style/style-rules.md` by `Generators/build_master.js`. The colours are approved. Type sizes and the grid are in use; they change like any other rule (archive, apply, report).

## Colours are theme slots, so everything recolours

Every object, chart, layout and generator output uses the theme's colour slots, never fixed hex. To restyle a deck, change **Design → Variants → Colors** in PowerPoint (or swap `THEME_COLORS` in `Generators/house.js`). Everything follows.

| Role (style-rules §4) | Theme slot | House default |
|---|---|---|
| Text | Dark 1 (tx1) | `313131` |
| Background | Light 1 (bg1) | `FFFFFF` |
| Main | Accent 1 | `002776` navy |
| Secondary | Accent 2 | `00A1DE` cyan |
| **Accent (the key point only)** | Accent 3 | `81BC00` green |
| Grey 2 ("others", muted) | Accent 4 | `8C8C8C` |
| Grey 1 (secondary text, axes) | Accent 5 | `575757` |
| Grey 3 (connectors, inactive) | Accent 6 | `B4B4B4` |
| Grey 4 (fills, bands) | Light 2 (bg2) | `DCDCDC` |
| Light panel / highlight band | tints of bg2 / Accent 2 | 50% / 20% |

A new colour scheme only needs to fill the roles: a dark main colour, a secondary colour, one accent, text and four greys. The *rule* stays the same: grey does the work, and the accent marks the point.

Fonts: Arial (Latin) plus Microsoft YaHei (East Asian) in the theme, so Chinese text renders in YaHei in every deck.

## Layouts

| # | Layout | Use for |
|---|---|---|
| 01 | Title | Cover: the deck's answer as the title |
| 02 | Section divider | Section number + title (dark) |
| 03 | Agenda | Agenda list |
| 04 | Title only | **Most content slides**: generators draw the body |
| 05 | Title and text | Word slides |
| 06 | Two content | Two-column text or chart + text |
| 07 | Chart and commentary | Chart left (62%), "so what" panel right |
| 08 | Key statement | One big statement or number (light) |
| 09 | Key statement dark | Decision or key message (dark) |
| 10 / 11 | Image left / right | Half-bleed image with text |
| 12 | Appendix divider | Start of the appendix |
| 13 | End | Next steps / close |
| 14 | Blank | Free composition with footer |

Every content layout has the same title position (top-left, bottom-anchored, 24 pt bold, main colour), a subtitle line (14 pt grey), a source line bottom-left (9 pt) and the page number bottom-right.

## Grid (proposed, from the measured Deloitte card)

- Margins: 0.4 in left and right.
- Title top: 0.3 in.
- Body: from 1.65 in to 6.86 in (12.53 × 5.21 in).
- Footer line: 7.01 in.
