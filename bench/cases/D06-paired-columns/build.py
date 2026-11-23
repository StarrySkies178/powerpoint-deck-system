import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../lib"))
from place_named import place_named
C = os.path.join(os.path.dirname(__file__), "candidate.pptx")
place_named(C, "del-062", chart=(["East", "West", "North"], [("Label 1", [41.1, 34.3, 32.2]), ("Label 2", [40.3, 33.6, 30.4])]))
