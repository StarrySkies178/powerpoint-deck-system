import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../lib"))
from place_named import place_named
C = os.path.join(os.path.dirname(__file__), "candidate.pptx")
place_named(C, "del-006", texts=["Text"], table=[[None] + ["Subhead"] * 8] + [["Row description"] + ["xx"] * 8] * 8)
