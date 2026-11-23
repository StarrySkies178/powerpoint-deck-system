# LineChart

Lines for long time series or several series: the series that matters in navy with a green end dot, the others in grey-3, each labelled at its end instead of a legend.

- **Props:** `categories`, `series` `[{name, values}]`, `highlight` (series index), `min` (axis floor; default the data minimum).
- **Rules:** label line ends directly; no gridlines; ≤ 12 periods and one series → `ColumnChart`.
