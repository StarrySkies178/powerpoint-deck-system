# Adds the deck logo (top right) from a stored object of ANOTHER slide of the reference deck (the "blue sea" slide's frame),
# at the place it has on every content slide of the deck. Runs after build.js, with this folder as working directory.
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O

STORE = os.path.join(ROOT, "Objects/store")
cand = os.path.join(HERE, "candidate.pptx")
logo = O.element(O.get(STORE, "case19-ecluster-005"), 1)          # the E-Cluster logo group (two pictures)
box = tuple(v / 914400 for v in logo["bbox"])
O.place(cand, 1, logo, box, STORE, out_path=cand, colours="original")
print("logo placed", [round(v, 2) for v in box])

# Title: the deck sets its title in from the band's left edge on two lines at a fixed pitch; the master's placeholder sits
# at the very edge (x 0) and its East Asian font makes LibreOffice open the lines far apart. Set the box and the line pitch.
from pptx import Presentation
from pptx.util import Inches
from lxml import etree
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
p = Presentation(cand)
for sh in p.slides[0].shapes:
    if sh.is_placeholder and sh.placeholder_format.type is not None and "TITLE" in str(sh.placeholder_format.type):
        sh.left, sh.top, sh.width, sh.height = Inches(0), Inches(0.47), Inches(13.11), Inches(0.86)
        sh.text_frame.margin_left = 0                     # the box keeps the deck's x 0 and no inset; a paragraph indent puts the text where the deck's starts
        for para in sh.text_frame.paragraphs:
            pPr = para._p.get_or_add_pPr(); pPr.set("marL", str(Inches(0.36))); pPr.set("indent", "0")
            ln = etree.SubElement(pPr, A + "lnSpc"); etree.SubElement(ln, A + "spcPts").set("val", "2770")
            pPr.insert(0, ln)
p.save(cand)
print("title set")
