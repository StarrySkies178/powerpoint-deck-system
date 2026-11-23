"""C02 variant c: refill the shapes of the reference deck's slide 13 (store object case19-polaris-013) with this
slide's content. Every shape below is a copy of one slide-13 shape, moved and resized, with new text:
  el 3  bold section header text        -> "Implementation Timeline" / "Main Challenges and Potential Mitigations"
  el 68 dark-grey header cell (Platform)-> "Strategy" header of the Gantt label column
  el 6  dark-grey header cell (MAU)     -> year header cells 2019 ... 2023
  el 0  grey row band                   -> band behind each strategy group (a / b / c)
  el 61 plain 14 pt text                -> row labels, legend text
  el 82 red bold sub-header text        -> group labels "a. Offline Strategy" ...
  el 10 red cell (Overall Rating)       -> prioritised-period bars and legend key
  el 68 recoloured to light grey        -> implementation-period bars and legend key
  el 59 + 60 shadowed white card        -> one card per challenge block
  el 4 + 5 red number chip              -> challenge numbers 1-3
  el 77 bullet text                     -> challenge bullets
  el 41 grey double chevron             -> challenge -> mitigation arrow
  el 44 grey bar (SKU Selection)        -> mitigation bar
Placed as one object at scale 1 with the slide-13 colours (colours="original").
Geometry must stay in step with the constants in build.js."""
import copy, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
from lxml import etree

STORE = os.path.join(ROOT, "Objects/store")
CAND = os.path.join(HERE, "candidate.pptx")
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
EMU = 914400

src = O.get(STORE, "case19-polaris-013")
SRC = list(O._frag(O.ungroup(src)))
out = etree.fromstring(O.ungroup(src)["xml"])
for el in list(out): out.remove(el)

LEFT_X, LEFT_W = 0.37, 7.63
RIGHT_X, RIGHT_W = 8.33, 4.68


def clone(i, x, y, w, h, fill=None):
    el = copy.deepcopy(SRC[i])
    xf = el.find("p:spPr/a:xfrm", O.NS)
    xf.find("a:off", O.NS).set("x", str(int(x * EMU))); xf.find("a:off", O.NS).set("y", str(int(y * EMU)))
    xf.find("a:ext", O.NS).set("cx", str(int(w * EMU))); xf.find("a:ext", O.NS).set("cy", str(int(h * EMU)))
    if fill:
        sf = el.find("p:spPr/a:solidFill", O.NS)
        for c in list(sf): sf.remove(c)
        etree.SubElement(sf, A + "schemeClr", val=fill)
    out.append(el)
    return el


def text(el, paras, sz=12, anchor="t", algn="l", ins=(0.04, 0.02, 0.04, 0.02), spc_after=0):
    """paras: list of (runs, opts); runs: list of (text, {b, color}); opts: {bullet, marL, indent}."""
    tb = el.find("p:txBody", O.NS)
    tmpl_r = next(iter(tb.iter(A + "rPr")), None)
    for c in list(tb): tb.remove(c)
    bp = etree.SubElement(tb, A + "bodyPr", wrap="square", lIns=str(int(ins[0] * EMU)), tIns=str(int(ins[1] * EMU)),
                          rIns=str(int(ins[2] * EMU)), bIns=str(int(ins[3] * EMU)), anchor=anchor, rtlCol="0")
    etree.SubElement(bp, A + "noAutofit")
    etree.SubElement(tb, A + "lstStyle")
    for runs, opt in paras:
        p = etree.SubElement(tb, A + "p")
        pp = etree.SubElement(p, A + "pPr", algn=algn)
        if opt.get("bullet"):
            pp.set("marL", str(int(opt.get("marL", 0.16) * EMU))); pp.set("indent", str(-int(opt.get("marL", 0.16) * EMU)))
        elif opt.get("marL"):
            pp.set("marL", str(int(opt["marL"] * EMU)))
        ls = etree.SubElement(pp, A + "lnSpc"); etree.SubElement(ls, A + "spcPct", val="100000")
        if spc_after:
            sa = etree.SubElement(pp, A + "spcAft"); etree.SubElement(sa, A + "spcPts", val=str(int(spc_after * 100)))
        if opt.get("bullet"):
            etree.SubElement(pp, A + "buFont", typeface="Arial"); etree.SubElement(pp, A + "buChar", char="•")
        else:
            etree.SubElement(pp, A + "buNone")
        for t, ro in runs:
            r = etree.SubElement(p, A + "r")
            rp = etree.SubElement(r, A + "rPr", lang="en-US", sz=str(int(ro.get("sz", sz) * 100)), b="1" if ro.get("b") else "0", dirty="0")
            if ro.get("color"):
                sf = etree.SubElement(rp, A + "solidFill"); etree.SubElement(sf, A + "schemeClr", val=ro["color"])
            etree.SubElement(rp, A + "latin", typeface="+mn-lt"); etree.SubElement(rp, A + "cs", typeface="+mn-cs")
            etree.SubElement(r, A + "t").text = t
    return el


def blank(el):
    """Shape only: drop the slide-13 text and its auto-grow, so the shape keeps the size it is given."""
    tb = el.find("p:txBody", O.NS)
    if tb is not None:
        for c in list(tb): tb.remove(c)
        bp = etree.SubElement(tb, A + "bodyPr", wrap="square", lIns="0", tIns="0", rIns="0", bIns="0")
        etree.SubElement(bp, A + "noAutofit"); etree.SubElement(tb, A + "lstStyle"); etree.SubElement(tb, A + "p")
    return el


def plain(t, **o): return ([(t, o)], {})


# ---------------- section headers (el 3) ----------------
for x, w, t in [(LEFT_X, LEFT_W, "Implementation Timeline"), (RIGHT_X, RIGHT_W, "Main Challenges and Potential Mitigations")]:
    text(clone(3, x, 1.13, w, 0.32), [plain(t, b=True)], sz=16, anchor="b", algn="ctr", ins=(0, 0, 0, 0.02))

# ---------------- Gantt (left, 60%) ----------------
YEARS = ["2019", "2020", "2021", "2022", "2023"]
LW = 2.93                                  # label column
CW = (LEFT_W - LW) / len(YEARS)            # 0.94 per year
GAP = 0.05
HY, HH = 1.62, 0.40                        # header row
text(clone(68, LEFT_X, HY, LW - GAP, HH), [plain("Strategy", color="bg1")], sz=14, anchor="ctr", algn="l", ins=(0.08, 0, 0, 0))
for j, yr in enumerate(YEARS):
    text(clone(6, LEFT_X + LW + j * CW, HY, CW - GAP, HH), [plain(yr, color="bg1")], sz=14, anchor="ctr", algn="ctr", ins=(0, 0, 0, 0))

PRI, IMP = "accent1", "accent6"            # red = prioritised, light grey = implementation
ROWS = [
    ("G", "a. Offline Strategy", []),
    ("S", "Store Expansion", []),
    ("I", "Open new concept stores", [(0, 5, PRI)]),
    ("I", "Open theme stores", [(1, 3, IMP), (3, 5, PRI)]),
    ("I", "Open digital stores", [(2, 3, PRI)]),
    ("S", "Sales per Store Improvement", []),
    ("I", "Loyal customer AD", [(1, 5, PRI)]),
    ("I", "Charity series", [(0, 5, PRI)]),
    ("I", "Personalized offerings", [(2, 5, IMP)]),
    ("I", "Design competence", [(2, 5, IMP)]),
    ("G", "b. Online Strategy", []),
    ("I", "Enter new platforms", [(0, 2, PRI)]),
    ("I", "Optimize operations", [(1, 5, IMP)]),
    ("G", "c. Omni-channel Strategy", []),
    ("I", "Data synchronization", [(1, 3, PRI)]),
    ("I", "Product mgt. & CRM", [(2, 5, IMP)]),
]
RY0, LEG_H = HY + HH + 0.06, 0.34
RH = (6.93 - LEG_H - RY0) / len(ROWS)
for k, (kind, label, bars) in enumerate(ROWS):
    y = RY0 + k * RH
    if kind == "G":
        clone(0, LEFT_X, y + 0.015, LEFT_W, RH - 0.03)                       # grey band
        text(clone(82, LEFT_X, y, LW, RH), [plain(label, b=True, color="accent1")], sz=13, anchor="ctr", ins=(0.08, 0, 0, 0))
    elif kind == "S":
        text(clone(61, LEFT_X, y, LW, RH), [plain(label, b=True)], sz=13, anchor="ctr", ins=(0.2, 0, 0, 0))
    else:
        text(clone(61, LEFT_X, y, LW, RH), [plain(label)], sz=13, anchor="ctr", ins=(0.36, 0, 0, 0))
    for a, b, col in bars:
        bx = LEFT_X + LW + a * CW
        blank(clone(10 if col == PRI else 68, bx, y + RH * 0.2, (b - a) * CW - GAP, RH * 0.6, fill=col))

# legend (bottom of the Gantt)
ly = 6.93 - LEG_H + 0.08
blank(clone(10, LEFT_X + 0.08, ly + 0.05, 0.32, 0.15, fill=PRI))
text(clone(61, LEFT_X + 0.46, ly - 0.02, 3.1, 0.3), [plain("Period for prioritized strategy")], sz=12, anchor="ctr", ins=(0, 0, 0, 0))
blank(clone(68, LEFT_X + 3.7, ly + 0.05, 0.32, 0.15, fill=IMP))
text(clone(61, LEFT_X + 4.08, ly - 0.02, 3.0, 0.3), [plain("Period for implementation")], sz=12, anchor="ctr", ins=(0, 0, 0, 0))

# ---------------- challenges and mitigations (right, 40%) ----------------
BLOCKS = [
    (["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
     "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers", 0.80),
    (["Competition from emerging players in entry luxury jewelry market"],
     "Keep sustainability of a differentiate in product and positioning", 0.56),
    (["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
     "Negotiate with platforms and outsource market analytics", 0.56),
]
HEIGHTS = [1.98, 1.44, 1.68]
GAPV = 0.11
y = 1.62
for n, ((bul, mit, mh), H) in enumerate(zip(BLOCKS, HEIGHTS), 1):
    x, w = RIGHT_X, RIGHT_W
    clone(59, x - 0.04, y - 0.01, w + 0.08, H + 0.08)                        # shadow picture
    clone(60, x, y, w, H)                                                     # white card
    clone(4, x + 0.1, y + 0.1, 0.3, 0.3)                                      # red chip
    text(clone(5, x + 0.1, y + 0.1, 0.3, 0.3), [plain(str(n), b=True, color="bg1")], sz=14, anchor="ctr", algn="ctr", ins=(0, 0, 0, 0))
    bh = H - mh - 0.36
    text(clone(77, x + 0.5, y + 0.06, w - 0.6, bh), [([(b, {})], {"bullet": True}) for b in bul], sz=14, anchor="ctr", ins=(0, 0, 0, 0), spc_after=2)
    clone(41, x + w / 2 - 0.15, y + 0.08 + bh + 0.03, 0.3, 0.15)              # chevron down
    text(clone(44, x + 0.1, y + H - mh - 0.08, w - 0.2, mh), [([("Mitigation: ", {"b": True, "color": "accent1"}), (mit, {})], {})],
         sz=14, anchor="ctr", ins=(0.08, 0, 0.08, 0))
    y += H + GAPV

# ---------------- place as one object at scale 1 ----------------
obj = copy.deepcopy(src)
obj = O._store(obj, out)
obj["media"] = [m for m in src.get("media", []) if ("MEDIA:" + m) in obj["xml"]]
obj["id"] = "case19-polaris-013-refilled"
bb = [v / EMU for v in obj["bbox"]]
O.place(CAND, 1, obj, bb, STORE, out_path=CAND, colours="original", scale_text=False)

# page number given in the prompt (PowerPoint honours firstSlideNum; LibreOffice 24.2 still shows 1)
import zipfile, shutil
tmp = CAND + ".tmp"
with zipfile.ZipFile(CAND) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            s = data.decode("utf-8")
            if "firstSlideNum" not in s:
                s = s.replace("<p:presentation ", '<p:presentation firstSlideNum="16" ', 1)
            data = s.encode("utf-8")
        zo.writestr(it, data)
shutil.move(tmp, CAND)
print("placed", len(out), "shapes from case19-polaris-013, bbox", [round(v, 2) for v in bb])
