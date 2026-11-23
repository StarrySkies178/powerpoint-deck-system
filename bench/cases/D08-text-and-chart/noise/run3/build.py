"""D08 text and chart, noise run 3: place Deloitte slide 59's own stored chart object (del-059), original colours,
at its own box, refilled with the prompt's data; set the level-two bullet indent and page number 59 as the reference."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../lib"))
from place_named import place_named
from pptx import Presentation
from lxml import etree

CAND = "candidate.pptx"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"

# Right: chart title + stacked column chart (the stored object carries both), refilled with the prompt's data.
place_named(CAND, "del-059",
            chart=(["2009", "2010", "2011", "2012"],
                   [("Label 1", [4.3, 2.5, 3.5, 4.5]),
                    ("Label 2", [2.4, 4.4, 1.8, 2.8]),
                    ("Label 3", [2.0, 2.0, 3.0, 5.0])]),
            colours="original")

p = Presentation(CAND)
s = p.slides[0]
for sh in s.shapes:
    if sh.name == "Body bullets":                 # reference list style: level two marL 0.59 in, hanging 0.29 in (as its paragraphs)
        for para in sh.text_frame.paragraphs:
            pPr = para._p.pPr
            if pPr is None: continue
            bu = pPr.find(A + "buChar")
            if bu is not None:                    # bullets drawn in Arial, as the reference's list style
                f = etree.Element(A + "buFont"); f.set("typeface", "Arial"); bu.addprevious(f)
            if pPr.get("lvl") == "1":
                pPr.set("marL", "539496"); pPr.set("indent", "-265176")
    if sh.is_placeholder and "SLIDE_NUMBER" in str(sh.placeholder_format.type):
        # page number 59 (the reference's place in its deck): the field becomes a plain run reading 59
        for fld in list(sh._element.iter(A + "fld")):
            r = etree.Element(A + "r")
            for ch in list(fld):
                r.append(ch)
            fld.addprevious(r); fld.getparent().remove(fld)
        for t in sh._element.iter(A + "t"): t.text = "59"
p.save(CAND)
