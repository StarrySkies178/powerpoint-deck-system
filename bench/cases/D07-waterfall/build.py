import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../lib"))
from place_named import place_named
C = os.path.join(os.path.dirname(__file__), "candidate.pptx")
place_named(C, "del-083", chart=(["A", "+ B", "+ C", "= Subtotal", "- E", "- F", "- G", "= Total"], [("Invisible", [0, 10, 25, 0, 30, 20, 15, 0]), ("Visible", [10, 15, 10, 35, 5, 10, 5, 15])]))
