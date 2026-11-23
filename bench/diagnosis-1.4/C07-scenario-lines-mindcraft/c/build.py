"""C07 variant c, step 2 (runs after build.js, in this folder).
Takes the stored objects of Mindcraft slide 4 (case19-mindcraft-004: panel heads, italic chart title,
CAGR column, red hand-drawn ring, grey takeaway box) and slide 8 (case19-mindcraft-008: red bold-italic
"Pull-up ratio" row), moves and refills them for this slide's two panels, and places them with their
original colours around the two native line charts drawn by build.js. Also sets per-series data-label
positions on those charts (python-pptx), so the three scenario labels do not collide."""
import copy, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
from lxml import etree
from pptx import Presentation
from pptx.enum.chart import XL_LABEL_POSITION
from pptx.util import Pt

STORE = os.path.join(ROOT, "Objects/store")
CAND = os.path.join(HERE, "candidate.pptx")
EMU = 914400
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
G = json.load(open(os.path.join(HERE, "geometry.json")))

# ---------------------------------------------------------------- 1. chart labels
C_ = "{http://schemas.openxmlformats.org/drawingml/2006/chart}"
prs = Presentation(CAND)
s = prs.slides[0]
charts = [sh.chart for sh in s.shapes if sh.has_chart]
POS = {"top": [XL_LABEL_POSITION.ABOVE, XL_LABEL_POSITION.RIGHT, XL_LABEL_POSITION.BELOW],
       "capex": [XL_LABEL_POSITION.ABOVE, XL_LABEL_POSITION.BELOW, XL_LABEL_POSITION.BELOW]}
for key, ch in zip(["top", "capex"], charts):
    for i, ser in enumerate(ch.plots[0].series):
        dl = ser.data_labels
        dl.show_value = True
        dl.position = POS[key][i]
        # the shared 2018 start value is labelled once (optimistic series, to its left)
        pt = ser.points[0].data_label
        if i == 0:
            pt.position = XL_LABEL_POSITION.LEFT
            pt.font.size = Pt(11)
        else:
            d = pt._get_or_add_dLbl()
            for c in list(d):
                if c.tag != C_ + "idx": d.remove(c)
            etree.SubElement(d, C_ + "delete").set("val", "1")
        # base 2019E in the top-line chart sits between the other two lines: label to its right
prs.save(CAND)

# ---------------------------------------------------------------- 2. stored objects, moved and refilled
o4 = O.ungroup(O.get(STORE, "case19-mindcraft-004"))
o8 = O.ungroup(O.get(STORE, "case19-mindcraft-008"))
e4 = list(O._frag(o4)); e8 = list(O._frag(o8))

def retext(el, paras, same=False):
    """Replace the text of one shape, keeping the formatting of its paragraphs (para i keeps template i,
    extra paragraphs copy the last one) and of their first run."""
    el = copy.deepcopy(el)
    tb = el.find(".//{http://schemas.openxmlformats.org/presentationml/2006/main}txBody")
    ps = tb.findall(A + "p")
    tmpl = [p for p in ps if p.find(".//" + A + "t") is not None] or ps
    for p in ps: tb.remove(p)
    for i, line in enumerate(paras):
        np_ = copy.deepcopy(tmpl[0 if same else min(i, len(tmpl) - 1)])
        runs = np_.findall(A + "r")
        for r in runs[1:]: np_.remove(r)
        runs[0].find(A + "t").text = line
        tb.append(np_)
    return el

def move(el, x=None, y=None, w=None, h=None):
    el = copy.deepcopy(el)
    b = O._xfrm(el)
    nb = [b[0] if x is None else x * EMU, b[1] if y is None else y * EMU, b[2] if w is None else w * EMU, b[3] if h is None else h * EMU]
    O._set_xfrm(el, *nb)
    return el

def setsize(el, pt):
    for rp in list(el.iter(A + "rPr")) + list(el.iter(A + "endParaRPr")): rp.set("sz", str(int(pt * 100)))
    return el

def left(el):
    for pp in el.iter(A + "pPr"): pp.set("algn", "l")
    return el

def nowrap(el):
    bp = el.find(".//" + A + "bodyPr"); bp.set("wrap", "none"); return el

def ypt(c, v):                      # slide y (in) of value v in chart c (inner plot layout from build.js)
    b, PL = c["box"], G["PL"]
    return b["y"] + b["h"] * (PL["y"] + PL["h"] * (1 - (v - c["min"]) / (c["max"] - c["min"])))
def xcat(c, i, n=6):
    b, PL = c["box"], G["PL"]
    return b["x"] + b["w"] * (PL["x"] + PL["w"] * (i + 0.5) / n)

parts = []
top, cap = G["charts"]["top"], G["charts"]["capex"]

# section tracker arrows (slide 4's red triangles; the tracker text is drawn by build.js)
parts += [e4[21], e4[22]]
# panel heads (slide 4's own: red numbered square, bold sub-headline, grey rule)
parts += [e4[23], e4[24], retext(e4[25], ["Resilient growth under scenario analysis"])]
parts += [e4[26], e4[27], left(retext(e4[28], ["Guaranteed financial feasibility"]))]
# italic chart titles with unit
parts.append(retext(e4[20], ["CSS Top Line Scenario Analysis (¥ Bn)"]))
parts.append(move(retext(e4[20], ["Required Annual Capex Scenario Analysis (¥ Mn)"]), x=6.78, y=1.85, w=5.6))

# series names at the line ends + CAGR column (slide 4: values beside the series, CAGR header underlined)
names = ["Optimistic", "Base", "Crush"]
lab_x = 4.86
cagr_x = 6.0
parts.append(move(retext(e4[0], ["CAGR", "18-23E"]), x=cagr_x - 0.08, y=1.83, w=0.75))
for i, (nm, cg) in enumerate(zip(names, ["17%", "12%", "8%"])):
    y = ypt(top, top["series"][i][1][-1]) - 0.12
    parts.append(nowrap(move(retext(e4[1], [nm]), x=lab_x, y=y, w=1.0)))
    parts.append(nowrap(move(retext(e4[1], [cg]), x=cagr_x, y=y, w=0.45)))
# red hand-drawn ring round the optimistic CAGR (slide 4 rings its key CAGR the same way)
y17 = ypt(top, 18.2)
parts.append(move(e4[8], x=cagr_x - 0.22, y=y17 - 0.26, w=0.85, h=0.5))

lab_x2 = cap["box"]["x"] + cap["box"]["w"] + 0.02
for i, nm in enumerate(names):
    y = ypt(cap, cap["series"][i][1][-1]) - 0.12
    parts.append(nowrap(move(retext(e4[1], [nm]), x=lab_x2, y=y, w=1.0)))

# capex burden row: slide 8's red bold-italic "Pull-up ratio" row, one value under each forecast year
row_y = cap["box"]["y"] + cap["box"]["h"] + 0.08
lab = setsize(retext(e8[39], ["Capex", "burden¹"], same=True), 12)
for rp in lab.iter(A + "rPr"): rp.attrib.pop("baseline", None)
parts.append(move(lab, x=6.72, y=row_y, w=0.9, h=0.42))
for i, v in enumerate(["26%", "22%", "20%", "19%", "17%"]):
    el = setsize(retext(e8[39], [v]), 12)
    for rp in el.iter(A + "rPr"): rp.attrib.pop("baseline", None)
    el.find(".//" + A + "pPr").set("algn", "ctr")
    parts.append(move(el, x=xcat(cap, i + 1) - 0.3, y=row_y + 0.1, w=0.6))
ret = setsize(retext(e8[39], ["Return on Capex under base case²: ~1.6 years"]), 12)
for rp in ret.iter(A + "rPr"): rp.attrib.pop("baseline", None)
parts.append(nowrap(move(ret, x=6.72, y=row_y + 0.46, w=5.8)))

# grey takeaway boxes (slide 4's bullet box)
box_y = 5.78
parts.append(move(retext(e4[18], ["Three cases all indicate above-market growth (7%)",
    "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers"], same=True),
    x=0.37, y=box_y, w=6.08, h=1.05))
parts.append(move(retext(e4[18], ["Increasing capital expenditure is required to support the offline expansion strategy",
    "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility"], same=True),
    x=6.67, y=box_y, w=6.08, h=1.05))

# assemble one object in slide coordinates (bbox = whole slide, so place() keeps scale 1)
obj = copy.deepcopy(o4)
f = O._frag(obj)
for el in list(f): f.remove(el)
for el in parts:
    el = copy.deepcopy(el)
    for af in list(el.iter(A + "spAutoFit")): af.getparent().remove(af)   # fixed boxes: LibreOffice centres auto-grown no-wrap boxes
    f.append(el)
obj = O._store(obj, f)
obj["bbox"] = [0, 0, 12192000, 6858000]
obj["role_src"] = {**o8.get("role_src", {}), **o4.get("role_src", {})}
r = O.place(CAND, 1, obj, (0, 0, 13.333, 7.5), STORE, colours="original", scale_text=False, move_labels=False)
print("placed", r)

# the deck's source line is italic
prs = Presentation(CAND)
for sh in prs.slides[0].shapes:
    if sh.has_text_frame and sh.text_frame.text.startswith("Source:"):
        for p_ in sh.text_frame.paragraphs:
            for r_ in p_.runs: r_.font.italic = True
prs.save(CAND)
