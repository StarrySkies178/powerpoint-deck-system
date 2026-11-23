import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../lib"))
from place_named import place_named
C = os.path.join(os.path.dirname(__file__), "candidate.pptx")
import objstore as O
from place_named import STORE
hints = [h for _, h in O.slots(O.get(STORE, "del-047"))]
place_named(C, "del-047", texts=[["Name Surname"] * max(1, h.count("Name Surname")) if "Name" in h else h for h in hints])
