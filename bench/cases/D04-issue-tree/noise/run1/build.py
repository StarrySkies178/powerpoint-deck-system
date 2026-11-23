# D04 issue tree, noise run 1: named slide -> place slide 38's stored object (del-038) with original colours,
# refill its 13 boxes with "Text", and number the page 38 as the reference does.
import os, sys, copy
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../lib"))
from place_named import place_named
from pptx import Presentation
from lxml import etree

A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
PN = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
cand = "candidate.pptx"
obj = place_named(cand, "del-038", texts=["Text"] * 13, colours="original")

p = Presentation(cand)
sl = p.slides[0]
grp = next(sh for sh in sl.shapes if sh.shape_type == 6 and sh.name == "Object")

# 1. The stored connectors are glued (stCxn/endCxn) to the boxes by the source slide's shape ids, but placing
#    renumbers the shapes, so the glue pointed at the wrong boxes and the elbows were drawn wrong. Placing keeps the
#    order, so map each stored id to the new id at the same position.
old_ids = [c.get("id") for c in etree.fromstring(obj["xml"]).iter(PN + "cNvPr")]
new_ids = [c.get("id") for c in grp._element.iter(PN + "cNvPr")][1:]          # [0] is the group itself
remap = dict(zip(old_ids, new_ids))
for el in list(grp._element.iter(A + "stCxn")) + list(grp._element.iter(A + "endCxn")):
    if el.get("id") in remap: el.set("id", remap[el.get("id")])
    else: el.getparent().remove(el)

# 2. The store dropped the three zero-width stems (top box -> centre box, left and centre boxes -> their centre leaf).
#    Redraw them from the object's own boxes, in the object's own connector style.
rects = [sh for sh in grp.shapes if sh.shape_type == 1]
rows = {}
for r in rects: rows.setdefault(round(r.top / 91440), []).append(r)
top, mid, leaf = [sorted(rows[k], key=lambda r: r.left) for k in sorted(rows)]
cx = lambda r: r.left + r.width // 2
proto = next(sh for sh in grp.shapes if sh.shape_type == 9)._element   # a stored connector: copy its line style
def seen(sh):                                   # drawn box of a connector (a quarter turn swaps width and height)
    w, h = sh.width, sh.height
    if round(sh.rotation) % 180 == 90: w, h = h, w
    mx, my = sh.left + sh.width // 2, sh.top + sh.height // 2
    return mx - w // 2, my - h // 2, w, h
def stem(parent, child):
    x = cx(parent); y0 = parent.top + parent.height; y1 = child.top
    for sh in grp.shapes:
        if sh.shape_type != 9: continue
        l, t, w, h = seen(sh)
        if w <= 20000 and abs(l + w // 2 - x) < 20000 and t <= y0 + 20000 and t + h >= y1 - 20000: return
    el = copy.deepcopy(proto)
    for g in list(el.iter(A + "stCxn")) + list(el.iter(A + "endCxn")): g.getparent().remove(g)   # a free line
    nv = el.find(PN + "nvCxnSpPr/" + PN + "cNvPr"); nv.set("id", str(9000 + len(grp.shapes))); nv.set("name", "Stem")
    xf = el.find(PN + "spPr/" + A + "xfrm")
    for k in ("rot", "flipH", "flipV"): xf.attrib.pop(k, None)
    xf.find(A + "off").set("x", str(x)); xf.find(A + "off").set("y", str(y0))
    xf.find(A + "ext").set("cx", "0"); xf.find(A + "ext").set("cy", str(y1 - y0))
    el.find(PN + "spPr/" + A + "prstGeom").set("prst", "straightConnector1")
    el.find(PN + "spPr/" + A + "prstGeom/" + A + "avLst").clear()
    grp._element.append(el)
mid_c = next(m for m in mid if abs(cx(m) - cx(top[0])) < 50000)
stem(top[0], mid_c)
for m in mid:
    kid = min(leaf, key=lambda l: abs(cx(l) - cx(m)))
    stem(m, kid)

# 3. Page number 38, as on the reference: PowerPoint numbers from 38; the field itself shows 38 in any renderer.
p.part._element.set("firstSlideNum", "38")
for fld in sl.shapes._spTree.iter(A + "fld"):
    if fld.get("type") == "slidenum":
        r = etree.SubElement(fld.getparent(), A + "r")
        fld.getparent().replace(fld, r)
        r.append(copy.deepcopy(fld.find(A + "rPr"))); t = etree.SubElement(r, A + "t"); t.text = "38"
p.save(cand)
