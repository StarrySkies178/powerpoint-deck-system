import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../lib"))
from place_named import place_named
C = os.path.join(os.path.dirname(__file__), "candidate.pptx")
place_named(C, "del-062", chart=(["华东", "华西", "华北"], [("2023 年", [41.1, 34.3, 32.2]), ("2024 年", [40.3, 33.6, 30.4])]))
