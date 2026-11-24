"""Build B: the same stored object case-truenorth-pola-022 with other content and a tenth year.
Bars re-laid from the data, dashed connectors and white outlines redrawn, axis lines kept and relabelled.
Run after build.js with B/ as working directory."""
import os, sys
sys.path.insert(0, os.path.abspath(".."))
import c09lib

YEARS = ["2014", "2015", "2016", "2017e", "2018e", "2019e", "2020e", "2021e", "2022e", "2023e"]
def cagr(a, b, n): return "%d%%" % round(((b / a) ** (1 / n) - 1) * 100)
def chart(heading, ticks, tmax, totals, grey, legend, ly, cagr_y, grey_hex=None):
    i0 = YEARS.index("2016"); n = len(YEARS) - 1 - i0
    red = [t - g for t, g in zip(totals, grey)]
    c = {"heading": heading, "ticks": ticks, "ticks_max": tmax, "years": YEARS,
         "totals": totals, "pola": grey, "total_labels": ["%.1f" % t for t in totals],
         "legend": legend, "legend_y": ly, "cagr_period": "2016-2023", "cagr_y": cagr_y,
         "cagr": [cagr(grey[i0], grey[-1], n), cagr(red[i0], red[-1], n)]}
    if grey_hex: c["grey"] = grey_hex
    return c

spec = {"mode": "relay", "title_dy": -0.06, "label_pt": 13, "charts": [
    chart("Conservative Scenario", ["0.0", "0.4", "0.8", "1.2", "¥1.6M"], 1.6,
          [0.4, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2], [0.08, 0.09, 0.1, 0.12, 0.15, 0.18, 0.21, 0.24, 0.27, 0.3],
          [("Lumina", 1.902), ("Verdea", 2.640)], 2.202, 1.79),
    chart("Optimistic Scenario", ["0", "2", "4", "¥6M"], 6.0,
          [0.4, 0.4, 0.5, 0.8, 1.2, 1.7, 2.4, 3.2, 4.2, 5.4], [0.08, 0.09, 0.1, 0.18, 0.28, 0.4, 0.58, 0.8, 1.05, 1.35],
          [("Lumina", 1.936), ("Verdea", 2.674)], 4.912, 4.49, "B1B1B1"),
]}
print([c["cagr"] for c in spec["charts"]])
print(c09lib.build("candidate.pptx", spec))
