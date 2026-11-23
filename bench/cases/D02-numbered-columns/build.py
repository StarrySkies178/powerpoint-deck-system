import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../lib"))
from place_named import place_named
C = os.path.join(os.path.dirname(__file__), "candidate.pptx")
place_named(C, "del-011", texts=["1", "6", "2", "7", "3", "8", "4", "9", "5", "10"])
