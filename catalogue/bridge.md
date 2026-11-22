# Bridge: how did A become B?

## WATERFALL
Source references: AT-Kearney-charts (waterfall section, slide numbers TBD in Pass 1); McKinsey-frequently-used (TBD)
Message type: Bridge
Action title pattern: "[Metric] [rose/fell] from X to Y, driven mainly by [biggest driver]"
Use when:
  - There is a start value, an end value, and 3–8 drivers in between
  - Start + all changes = end exactly
Don't use when:
  - Drivers don't sum to the change → use horizontal bar of drivers
  - More than 8 drivers → group the smallest into "Other"
  - Showing change over time → use column or line
Data shape: 1 start, 3–8 deltas (+/−), 1 end; optional subtotals
Anatomy:
  - Start/end bars: dark neutral
  - Increases: main colour; decreases: accent
  - Value label on every bar; no y-axis; thin connector lines
  - Unit line under the title (e.g. "US$ m")
  - Source footnote bottom-left at caption size
Variants: vertical / horizontal; with or without subtotal bars
Good examples:
  - "EBIT fell from $120M to $95M, mainly due to FX (−$18M)"
  - "Headcount grows to 410 by 2027, led by the new Shanghai hub"
Bad example:
  - Monthly revenue Jan–Dec as a waterfall. That is a time series → columns.
Example images: catalogue/examples/waterfall/ (not yet collected)
Code template: templates-code/waterfall.py (not yet built)
