# D08 noise run 1: place slide 59's own stored chart object (chart title + stacked column chart) with its
# original colours, refill the chart data from the prompt, set the reference's bullet indents and page number 59.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../lib"))
from place_named import place_named
from pptx import Presentation
from pptx.oxml.ns import qn

cand = "candidate.pptx"
place_named(cand, "del-059",
            chart=(["2009", "2010", "2011", "2012"],
                   [("Label 1", [4.3, 2.5, 3.5, 4.5]),
                    ("Label 2", [2.4, 4.4, 1.8, 2.8]),
                    ("Label 3", [2.0, 2.0, 3.0, 5.0])]),
            replace={"Chart title runs here": "Chart title runs here"})

p = Presentation(cand)
# page number as the reference: the slide-number field counts from 59
p.part._element.set("firstSlideNum", "59")
# LibreOffice ignores firstSlideNum, so the number is also written as plain text "59" in place of the field
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
for sh in p.slides[0].shapes:
    if sh.is_placeholder and sh.placeholder_format.type is not None and "SLIDE_NUMBER" in str(sh.placeholder_format.type):
        for fld in list(sh._element.iter(A + "fld")):
            r = fld.makeelement(A + "r", {})
            for ch in fld:
                if ch.tag == A + "rPr": r.append(ch)
            t = r.makeelement(A + "t", {}); t.text = "59"; r.append(t)
            fld.addprevious(r); fld.getparent().remove(fld)
# bullet indents as the reference slide (level one 0.30 in hanging; level two 0.59 in, 0.29 in hanging)
for sh in p.slides[0].shapes:
    if sh.name == "Body text":
        for para in sh.text_frame.paragraphs:
            pPr = para._p.get_or_add_pPr()
            if para.level >= 1 or pPr.get("lvl") == "1":
                pPr.set("marL", "539496"); pPr.set("indent", "-265176")
            else:
                pPr.set("marL", "274638"); pPr.set("indent", "-274638")
            bc = pPr.find(A + "buChar")
            if bc is not None and pPr.find(A + "buFont") is None:
                bf = pPr.makeelement(A + "buFont", {"typeface": "Arial", "pitchFamily": "34", "charset": "0"})
                bc.addprevious(bf)
p.save(cand)
