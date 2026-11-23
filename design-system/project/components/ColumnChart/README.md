# ColumnChart

Vertical columns for a time series of up to 12 periods: grey-3 columns, the one that matters in navy, values inside the top in white, an optional big callout to the right.

- **Props:** `categories`, `values`, `highlight` (index; default the last), `callout` `{value, text}`.
- **Rules:** > 12 periods or several series → `LineChart`; ranking → `BarRanking`. Generator: `columnHighlight` (native, editable PowerPoint chart).
