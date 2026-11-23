"""Variant c: place the stored pieces of Mindcraft slide 18 (case19-mindcraft-018) that this slide shares with it,
with their original colours, at their own positions, and refill their text:
  elements 1-6  panel heads (red number chips 1 / 2, sub-headlines, grey rules under them)
  elements 7, 11 italic column headers of panel 2 ("Multi-platforms presence", "Tactics") -> "Risks", "Solutions"
The scatter, its labels, the partner list and the tactics box are dropped: build.js draws the heat map and the table."""
import os, sys, copy
from lxml import etree
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O

STORE = os.path.join(ROOT, "Objects/store")
CAND = os.path.join(HERE, "candidate.pptx")
EMU = 914400
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"

obj = O.ungroup(O.get(STORE, "case19-mindcraft-018"))
f = O._frag(obj)
keep = {1: None, 2: None, 3: "Risk mapping", 4: None, 5: None, 6: "Solutions for important risks", 7: "Risks", 11: "Solutions"}
for i, el in enumerate(list(f)):
    if i not in keep: f.remove(el); continue
    new = keep[i]
    if new is None: continue
    ts = list(el.iter(A + "t"))
    paras = el.findall(".//" + A + "p")
    ts[0].text = new
    for t in ts[1:]: t.text = ""
    if i == 11:                                  # "Solutions" header: left-aligned over the solutions column, as "Risks" is over its own
        x, y, w, h = O._xfrm(el); O._set_xfrm(el, int(9.56 * EMU), y, int(2.4 * EMU), h)
        for p in paras:
            pPr = p.find(A + "pPr")
            if pPr is not None: pPr.set("algn", "l")
    if i == 7:
        x, y, w, h = O._xfrm(el); O._set_xfrm(el, int(6.66 * EMU), y, w, h)
        for p in paras:
            pPr = p.find(A + "pPr")
            if pPr is not None: pPr.set("algn", "l")
obj = O._store(obj, f)
bb = [v / EMU for v in obj["bbox"]]
r = O.place(CAND, 1, obj, bb, STORE, out_path=CAND, colours="original")
print("placed", r)

# place() sets wrap="none" on short labels; LibreOffice then centres them on their box. The deck's headlines and
# headers sit at the left of their boxes, so give the refilled ones their wrapping back.
from pptx import Presentation
p = Presentation(CAND)
refilled = {"Risk mapping", "Solutions for important risks", "Risks", "Solutions"}
for sh in p.slides[0].shapes:
    for el in sh._element.iter("{http://schemas.openxmlformats.org/presentationml/2006/main}sp"):
        t = "".join(x.text or "" for x in el.iter(A + "t")).strip()
        bp = el.find(".//" + A + "bodyPr")
        if t in refilled and bp is not None: bp.set("wrap", "square")
# the prompt's page is 12: the page placeholder carries "12" as plain text (a slide-number field would read 1 in a one-slide file)
for sh in p.slides[0].shapes:
    for fld in list(sh._element.iter(A + "fld")):
        if fld.get("type") == "slidenum":
            r = etree.Element(A + "r")
            for c in fld:
                if c.tag == A + "rPr": r.append(copy.deepcopy(c))
            t = etree.SubElement(r, A + "t"); t.text = "12"
            fld.addprevious(r); fld.getparent().remove(fld)
p.save(CAND)
