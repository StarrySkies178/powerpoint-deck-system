# D04-issue-tree, noise run 2: place slide 38's own tree object (del-038) with its original colours,
# refill its 13 boxes (1 + 3 + 9) with "Text", repair its connectors, and number the slide 38.
import os, sys, copy
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../lib"))
from place_named import place_named
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR

here = os.path.dirname(os.path.abspath(__file__))
cand = os.path.join(here, "candidate.pptx")
place_named(cand, "del-038", texts=["Text"] * 13, colours="original")

A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P_ = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
p = Presentation(cand)
sl = p.slides[0]
tree = sl.shapes._spTree

# 1. The stored connectors are glued to their boxes by the source slide's shape ids (stCxn/endCxn), but placing
#    renumbers the shapes, so the links point at nothing and a renderer draws the rotated elbows the wrong way.
#    Re-point each link to the same box's new id (the stored and placed shapes are in the same order).
import re
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../../Generators"))
import objstore as O
STORE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../../Objects/store")
old_ids = re.findall(r'<p:cNvPr id="(\d+)"', O.get(STORE, "del-038")["xml"])
grp = next(g for g in tree.iter(P_ + "grpSp"))
new_ids = [c.get("id") for c in grp.iter(P_ + "cNvPr")][1:]        # [0] is the group itself
idmap = dict(zip(old_ids, new_ids))
for el in list(tree.iter(A + "stCxn", A + "endCxn")):
    if el.get("id") in idmap: el.set("id", idmap[el.get("id")])
    else: el.getparent().remove(el)

# 2. The store dropped the zero-width straight connectors (parent -> middle child). Add a straight line from each
#    parent's bottom centre to its middle child's top centre wherever no stored connector already runs there.
def xf(el):
    x = el.find(f"{P_}spPr/{A}xfrm")
    o, e = x.find(A + "off"), x.find(A + "ext")
    return int(o.get("x")), int(o.get("y")), int(e.get("cx")), int(e.get("cy"))
boxes = [xf(sp) for sp in grp.iter(P_ + "sp") if sp.find(f"{P_}spPr/{A}prstGeom") is not None]
conns = [xf(c) for c in grp.iter(P_ + "cxnSp")]
line_ln = copy.deepcopy(next(grp.iter(P_ + "cxnSp")).find(f"{P_}spPr/{A}ln"))
levels = {}
for b in boxes:
    levels.setdefault(round(b[1] / 91440), []).append(b)
rows = [sorted(levels[k]) for k in sorted(levels)]          # top, middle, bottom rows, left to right
cx = lambda b: b[0] + b[2] // 2
pairs = [(rows[0][0], rows[1][1])]                           # top box -> middle box
for i, par in enumerate(rows[1]):                            # each middle box -> its middle child
    pairs.append((par, rows[2][3 * i + 1]))
tol = 91440 // 2
for par, ch in pairs:
    x = cx(par)
    # skip where a stored connector already runs here (same centre)
    if any(abs(c[0] + c[2] // 2 - x) < tol and abs((c[1] + c[3] // 2) - (par[1] + par[3] + ch[1]) // 2) < 91440 for c in conns):
        continue
    ln = sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Emu(x), Emu(par[1] + par[3]), Emu(x), Emu(ch[1]))
    sp_pr = ln._element.find(f"{P_}spPr")
    old = sp_pr.find(A + "ln")
    if old is not None: sp_pr.remove(old)
    sp_pr.append(copy.deepcopy(line_ln))
    st = ln._element.find(f"{P_}style")
    if st is not None: st.getparent().remove(st)

# 3. Page number 38, as on the reference: PowerPoint numbers from firstSlideNum, and the number is also written
#    as plain text so every renderer shows 38 for this one-slide file.
p.part._element.set("firstSlideNum", "38")
for fld in list(tree.iter(A + "fld")):
    if fld.get("type") == "slidenum":
        r = fld.makeelement(A + "r", {})
        rpr = fld.find(A + "rPr")
        if rpr is not None: r.append(copy.deepcopy(rpr))
        t = r.makeelement(A + "t", {}); t.text = "38"; r.append(t)
        fld.addprevious(r); fld.getparent().remove(fld)
p.save(cand)
