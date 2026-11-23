# D04-issue-tree, attempt 3: place slide 38's stored logic tree (del-038) at its own box, original colours,
# fill its 13 boxes with "Text" (1 top, 3 middle, 9 bottom), and number the page 38 as in the reference.
# Two repairs to the placed object (the framework's place() is not changed):
#  - place() renumbers shape ids but leaves the connectors' start/end links on the old ids, so renderers
#    re-route the elbows to the wrong boxes: the links are remapped to the new ids.
#  - the stored object lacks 3 of the 12 connectors (the straight ones from a parent to its middle child):
#    they are added as straight connectors linked to their boxes, in the tree's own line style.
import os, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../lib"))
from place_named import place_named, O, STORE
from pptx import Presentation
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE_TYPE
from pptx.util import Pt
from pptx.dml.color import RGBColor

A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
cand = "candidate.pptx"
place_named(cand, "del-038", texts=["Text"] * 13, colours="original")

old_ids = re.findall(r'<p:cNvPr id="(\d+)"', O.get(STORE, "del-038")["xml"])
p = Presentation(cand)
s = p.slides[0]
grp = next(sh for sh in s.shapes if sh.shape_type == MSO_SHAPE_TYPE.GROUP)
kids = list(grp.shapes)
idmap = {o: str(k.shape_id) for o, k in zip(old_ids, kids)}
links = set()
for k in kids:
    st, en = k._element.find(".//" + A + "stCxn"), k._element.find(".//" + A + "endCxn")
    for e in (st, en):
        if e is not None and e.get("id") in idmap: e.set("id", idmap[e.get("id")])
    if st is not None and en is not None: links.add(frozenset((st.get("id"), en.get("id"))))

# tree levels from the boxes' positions: 1 root, 3 branches, 9 leaves
boxes = [k for k in kids if k.shape_type == MSO_SHAPE_TYPE.AUTO_SHAPE]
rows = {}
for b in boxes: rows.setdefault(round(b.top / 91440), []).append(b)
levels = [sorted(rows[y], key=lambda b: b.left) for y in sorted(rows)]
cx = lambda b: b.left + b.width // 2
pairs = [(levels[0][0], levels[1][1])] + [(levels[1][i], levels[2][3 * i + 1]) for i in range(3)]
line = next(k for k in kids if k.shape_type == MSO_SHAPE_TYPE.LINE or k._element.tag.endswith("cxnSp"))
lcol = line._element.find(".//" + A + "ln//" + A + "srgbClr")
for par, ch in pairs:
    if frozenset((str(par.shape_id), str(ch.shape_id))) in links: continue
    c = grp.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, cx(par), par.top + par.height, cx(ch), ch.top)
    c.begin_connect(par, 2); c.end_connect(ch, 0)
    c.line.width = Pt(1)
    c.line.color.rgb = RGBColor.from_string(lcol.get("val") if lcol is not None else "B4B4B4")

# the reference's page number is 38: start numbering there, and write 38 in the number box as plain text
# too (LibreOffice ignores firstSlideNum, so the field alone would still render as 1)
p.part._element.set("firstSlideNum", "38")
for sh in s.placeholders:
    for fld in sh._element.iter(A + "fld"):
        if fld.get("type") == "slidenum":
            r = fld.makeelement(A + "r", {})
            rpr = fld.find(A + "rPr")
            if rpr is not None: r.append(rpr)
            t = r.makeelement(A + "t", {}); t.text = "38"; r.append(t)
            fld.getparent().replace(fld, r)
p.save(cand)
