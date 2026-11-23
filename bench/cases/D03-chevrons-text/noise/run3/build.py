# D03 run 3: place Deloitte slide 14's own chevron object at its original box, original colours, refilled.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../lib"))
from place_named import place_named
from pptx import Presentation

here = os.path.dirname(os.path.abspath(__file__))
cand = os.path.join(here, "candidate.pptx")

# the first chevron keeps its own text ("Text, Arial / 14-pt bold", highlighted); the three empty slots get "Text"
place_named(cand, "del-014", texts=["Text", "Text", "Text"], colours="original")

# page number 14, as on the reference: the deck's numbering starts at 14
# (PowerPoint honours firstSlideNum; LibreOffice does not, so the slide's own number field also gets the fixed text 14)
from lxml import etree
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
p = Presentation(cand)
p.part._element.set("firstSlideNum", "14")
for fld in list(p.slides[0]._element.iter(A + "fld")):
    if fld.get("type") == "slidenum":
        r = etree.SubElement(fld.getparent(), A + "r")
        for ch in fld:
            if ch.tag in (A + "rPr", A + "t"): r.append(ch)
        fld.addprevious(r); fld.getparent().remove(fld)
        r.find(A + "t").text = "14"
p.save(cand)
