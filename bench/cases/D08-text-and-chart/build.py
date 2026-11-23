import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../lib"))
from place_named import place_named
C = os.path.join(os.path.dirname(__file__), "candidate.pptx")
place_named(C, "del-059", texts=["Chart title runs here"], chart=(["2009", "2010", "2011", "2012"], [("Label 1", [4.3, 2.5, 3.5, 4.5]), ("Label 2", [2.4, 4.4, 1.8, 2.8]), ("Label 3", [2.0, 2.0, 3.0, 5.0])]))
