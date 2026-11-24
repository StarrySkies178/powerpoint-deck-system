# Build B, step 2: the same stored objects of case19-mindcraft-014, refilled with the new content (run from B/ after build.js).
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import common
texts = {
    "heads": [(None, "Above-market growth in every scenario"), (None, "Expansion stays fully self-funded")],
    "chart_titles": ["Online GMV Scenario Analysis (¥ Bn)", "Annual Capex Need by Scenario (¥ Mn)"],
    "take": [["Three of four cases beat the 7% market; even the stress case still grows ~3% a year",
              "The bull case reaches ¥13.7 Bn by 2024E; new-city openings and faster store ramp-up are the two levers"],
             ["Capex rises with the rollout and peaks at ¥246 Mn in the bull case",
              "Capex falls from 31% to 18% of operating cash flow; ~2.1-year payback, no outside funding"]],
    "return_label": "Store payback under base case 2) :",
}
common.run(os.path.join(os.path.dirname(os.path.abspath(__file__)), "candidate.pptx"), texts, [])
