# Matrix

A positioning grid (2×2 or 3×3): grey cells, the focus cell in green with white text, axis labels low → high, optional comment to the right.

- **Props:** `rows` (top = high), `cols` (left = low), `cells[r][c]`, `highlight` `[r, c]`, `xTitle`, `yTitle`, `comment`.
- **Rules:** only when both axes run clearly low → high; a few named items for a decision. Generator: `matrix`.
