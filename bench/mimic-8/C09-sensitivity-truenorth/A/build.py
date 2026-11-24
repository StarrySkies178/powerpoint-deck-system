"""Build A: place stored object case-truenorth-pola-022 as drawn (bars, outlines, dashes, axes kept),
replace its pictures of text with native labels, add the logo. Run after build.js with A/ as working directory."""
import os, sys
sys.path.insert(0, os.path.abspath(".."))
import c09lib

YEARS = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"]
spec = {"mode": "keep", "title_dy": -0.06, "label_pt": 13, "charts": [
    {"heading": "Normal Scenario", "heading_xy": (0.607, 1.566),
     "ticks": ["0.0", "0.5", "1.0", "1.5", "¥2.0M"], "years": YEARS,
     "total_labels": ["0.5", "0.6", "0.7", "0.8", "0.9", "1.1", "1.3", "1.5", "1.7"],
     "legend": [("pola", 1.902), ("jurlique", 2.400)], "legend_y": 2.202,
     "cagr_period": "2015-2021", "cagr_y": 1.79, "cagr": ["25%", "15%"]},
    {"heading": "Optimistic Scenario", "heading_xy": (0.483, 4.274),
     "ticks": ["0", "1", "2", "¥3M"], "years": YEARS,
     "total_labels": ["0.5", "0.6", "0.7", "0.8", "1.1", "1.3", "1.5", "1.8", "2.1"],
     "legend": [("pola", 1.936), ("Jurlique", 2.462)], "legend_y": 4.912, "grey": "B1B1B1",
     "cagr_period": "2015-2021", "cagr_y": 4.49, "cagr": ["27%", "19%"]},
]}
print(c09lib.build("candidate.pptx", spec))
