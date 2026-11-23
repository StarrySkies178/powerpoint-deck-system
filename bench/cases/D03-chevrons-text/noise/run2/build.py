# Place slide 14's own stored object (four chevrons) with its original colours, then set the page number to 14.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../lib"))
from place_named import place_named
from pptx import Presentation

cand = "candidate.pptx"
# slots in reading order: the first chevron keeps its fixed text "Text, Arial 14-pt bold"; the other three are "Text"
place_named(cand, "del-014", texts=["Text", "Text", "Text"], colours="original")

# footer page number as the reference: 14. This file holds one slide, so the slide-number field would read 1;
# turn the field into a plain run "14" with the field's own formatting.
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
p = Presentation(cand)
for sh in p.slides[0].shapes:
    for fld in sh._element.iter(A + "fld"):
        if fld.get("type") == "slidenum":
            fld.tag = A + "r"
            for k in list(fld.attrib): del fld.attrib[k]
            fld.find(A + "t").text = "14"
            for ppr in fld.findall(A + "pPr"): fld.remove(ppr)
p.save(cand)
