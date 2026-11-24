# Build A, step 2: place the stored objects of case19-mindcraft-014 (run from A/ after build.js).
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import common
texts = {
    "heads": [(None, None), (None, None)],          # chips and headings as stored
    "chart_titles": ["CSS Top Line Scenario Analysis (¥ Bn)", "Required Annual Capex Scenario Analysis (¥ Mn)"],
    "take": [["Three cases all indicate above-market growth (7%)",
              "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers"],
             ["Increasing capital expenditure is required to support the offline expansion strategy",
              "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility"]],
    "return_label": None,                             # stored label kept as is
}
common.run(os.path.join(os.path.dirname(os.path.abspath(__file__)), "candidate.pptx"), texts, [])
