# Waterfall

A bridge from a start value to an end value: totals in navy, increases in cyan, decreases in grey-2, values on every bar, thin connectors.

- **Props:** `steps` `[{label, value, total?}]`: first and last are totals (the last may omit `value`; it is computed).
- **Rules:** 3–8 steps and start + changes = end exactly; drivers that don't sum → `BarRanking`. Generator: `waterfall` (native chart).
