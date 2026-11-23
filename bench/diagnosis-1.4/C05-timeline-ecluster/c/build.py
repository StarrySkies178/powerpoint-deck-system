"""C05 variant c, step 2 (runs after build.js, in this folder).
Gantt: the stored table of E-Cluster slide 23 (case19-ecluster-023), its cells cloned and re-laid for
workstream x 2019-2024; the bar of each initiative is its year cells merged and filled.
Risks: header + rule + bullet list of E-Cluster slide 16 ("Key Assumptions", case19-ecluster-016p2 e16-18).
See the comment at the top of build.js for why slide 23 is the closest."""
import copy, os, sys, zipfile, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
GEN = os.path.join(ROOT, "Generators"); STORE = os.path.join(ROOT, "Objects/store")
sys.path.insert(0, GEN)
import objstore as O
from lxml import etree
from pptx import Presentation
from pptx.util import Emu

CAND = os.path.join(HERE, "candidate.pptx")
EMU = 914400
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
NS = {"a": A[1:-1]}

# ------------------------------------------------------------------ content (prompt)
YEARS = ["2019", "2020", "2021", "2022", "2023", "2024"]
# (workstream, initiative or None, first year index, last year index)
ROWS = [
    ("New Product R&D", None, 0, 0),
    ("Marketing & Reshaping Brand", None, 0, 2),
    ("Offline: City Penetration Steps", "Set up 3~5 monobrand stores in prioritized and secondary cities", 0, 2),
    ("Offline: City Penetration Steps", "Further expand into the tertiary cities with ~50 more stores", 2, 5),
    ("Omni Channel Building", "Adjust the product offering and enter key e-commerce platforms", 0, 1),
    ("Omni Channel Building", "Further integrate online and offline channels", 2, 5),
]
RISKS = ["Economy downturn",
         "Suffer from slow ramp up problem when entering the new market",
         "Potential brand image cannibalization, fail to launch new products in the market as expected",
         "Market dynamics: customer behavior change, competitors’ response, etc."]

# ------------------------------------------------------------------ geometry (inches)
X0, Y0 = 0.27, 1.55
COLS = [2.75, 4.25] + [0.965] * 6            # workstream | initiative | 6 years  (= 12.79 in)
HDR_H, ROW_H = 0.45, [0.46, 0.46, 0.57, 0.57, 0.57, 0.57]
BAR = "354B70"                                 # deck's secondary navy (profile roles.secondary)

# ------------------------------------------------------------------ 1. table from slide 23's stored object
tobj = O.get(STORE, "case19-ecluster-023")
frag = O._frag(tobj)
gf = next(g for g in frag if g.find(".//a:tbl", NS) is not None)
tbl = gf.find(".//a:tbl", NS)
trs = tbl.findall("a:tr", NS)
T_HEAD = copy.deepcopy(trs[0].findall("a:tc", NS)[2])     # navy header cell ("Year0")
T_CAT = copy.deepcopy(trs[16].findall("a:tc", NS)[0])     # italic category cell ("Tertiary")
T_BODY = copy.deepcopy(trs[16].findall("a:tc", NS)[1])    # plain body cell ("Other")

def cell(tmpl, text, fill, align="ctr", italic=None, bold=None, colour=None, lines=("L", "R", "T", "B"), sz=1500):
    c = copy.deepcopy(tmpl)
    for k in ("rowSpan", "gridSpan", "hMerge", "vMerge"): c.attrib.pop(k, None)
    tb = c.find("a:txBody", NS)
    ps = tb.findall("a:p", NS); p0 = next((p for p in ps if p.find(".//a:r", NS) is not None), ps[0])
    for p in ps: tb.remove(p)
    p = copy.deepcopy(p0)
    runs = p.findall("a:r", NS)
    for r in runs[1:]: p.remove(r)
    ppr = p.find("a:pPr", NS)
    if ppr is None: ppr = etree.SubElement(p, A + "pPr"); p.insert(0, ppr)
    for k in ("marL", "indent"): ppr.attrib.pop(k, None)
    ppr.set("algn", align)
    for ch in list(ppr):
        if ch.tag in (A + "spcBef", A + "lnSpc"): ppr.remove(ch)
    if runs:
        r = runs[0]; rp = r.find("a:rPr", NS)
        r.find("a:t", NS).text = text
        rp.attrib.pop("spc", None); rp.set("sz", str(sz))
        if italic is not None: rp.set("i", "1" if italic else "0")
        if bold is not None: rp.set("b", "1" if bold else "0")
        sf = rp.find("a:solidFill", NS)
        if colour:
            if sf is None: sf = etree.Element(A + "solidFill"); rp.insert(0, sf)
            for ch in list(sf): sf.remove(ch)
            etree.SubElement(sf, A + "schemeClr", val=colour)
        elif sf is not None and not text: pass
    tb.append(p)
    tc = c.find("a:tcPr", NS)
    for ch in list(tc): tc.remove(ch)
    tc.set("marL", "64008"); tc.set("marR", "64008"); tc.set("marT", "18288"); tc.set("marB", "18288"); tc.set("anchor", "ctr")
    for side in ("L", "R", "T", "B"):                    # white 1.5 pt rules between cells (profile: table rules FFFFFF 1.5)
        ln = etree.SubElement(tc, A + "ln" + side, w="19050")
        etree.SubElement(etree.SubElement(ln, A + "solidFill"), A + "schemeClr", val="bg1")
    f = etree.SubElement(tc, A + "solidFill")
    if fill.startswith("#"): etree.SubElement(f, A + "srgbClr", val=fill[1:])
    else: etree.SubElement(f, A + "schemeClr", val=fill)
    return c

def merged(tmpl, kind):
    c = cell(tmpl, "", "bg2"); c.set(kind, "1"); return c

# grid
grid = tbl.find("a:tblGrid", NS)
for g in list(grid): grid.remove(g)
for w in COLS: etree.SubElement(grid, A + "gridCol", w=str(int(w * EMU)))
for tr in trs: tbl.remove(tr)

def new_tr(h):
    tr = etree.SubElement(tbl, A + "tr", h=str(int(h * EMU))); return tr

# header row: workstream/initiative columns merged and left empty (the prompt names only the years), years in white bold
tr = new_tr(HDR_H)
h0 = cell(T_HEAD, "", "accent2"); h0.set("gridSpan", "2"); tr.append(h0); tr.append(merged(T_HEAD, "hMerge"))
for y in YEARS: tr.append(cell(T_HEAD, y, "accent2", bold=True, colour="bg1", sz=1600))

# body rows: bands alternate per workstream (slide 23: light blue / grey per category)
groups = []
for ws, *_ in ROWS:
    if ws not in groups: groups.append(ws)
band = {ws: ("accent1" if i % 2 == 0 else "bg2") for i, ws in enumerate(groups)}
for i, (ws, item, a, b) in enumerate(ROWS):
    tr = new_tr(ROW_H[i]); fill = band[ws]
    first_of_group = i == 0 or ROWS[i - 1][0] != ws
    span = sum(1 for r in ROWS if r[0] == ws)
    if item is None:                                            # stand-alone workstream: name across both label columns
        c = cell(T_CAT, ws, fill, align="l", italic=False, bold=True); c.set("gridSpan", "2"); tr.append(c)
        tr.append(merged(T_CAT, "hMerge"))
    else:
        if first_of_group:
            c = cell(T_CAT, ws, fill, align="l", italic=False, bold=True)
            if span > 1: c.set("rowSpan", str(span))
            tr.append(c)
        else:
            m = cell(T_CAT, "", fill); m.set("vMerge", "1"); tr.append(m)
        tr.append(cell(T_BODY, item, fill, align="l", italic=False, sz=1400))
    for j in range(len(YEARS)):                                 # the bar: the spanned year cells merged and filled
        if j == a:
            c = cell(T_BODY, "", "#" + BAR)
            if b > a: c.set("gridSpan", str(b - a + 1))
            tr.append(c)
        elif a < j <= b:
            tr.append(merged(T_BODY, "hMerge"))
        else:
            tr.append(cell(T_BODY, "", fill))

W_ = int(sum(COLS) * EMU); H_ = int((HDR_H + sum(ROW_H)) * EMU)
xf = gf.find("p:xfrm", {"p": "http://schemas.openxmlformats.org/presentationml/2006/main"})
xf.find("a:off", NS).set("x", str(int(X0 * EMU))); xf.find("a:off", NS).set("y", str(int(Y0 * EMU)))
xf.find("a:ext", NS).set("cx", str(W_)); xf.find("a:ext", NS).set("cy", str(H_))
for el in list(frag):
    if el is not gf: frag.remove(el)
tobj = O._store(tobj, frag); tobj["bbox"] = [int(X0 * EMU), int(Y0 * EMU), W_, H_]
O.place(CAND, 1, tobj, [X0, Y0, sum(COLS), HDR_H + sum(ROW_H)], STORE, out_path=CAND, colours="original")

# ------------------------------------------------------------------ 2. "Potential Risks" from slide 16's Key Assumptions block
src = O.ungroup(O.get(STORE, "case19-ecluster-016p2"))
rf = O._frag(src)
keep = [el for i, el in enumerate(list(rf)) if 16 <= i <= 18]
for el in list(rf):
    if not any(el is k for k in keep): rf.remove(el)
hdr, rule, bul = keep
RY = Y0 + HDR_H + sum(ROW_H) + 0.16                             # block top under the table
def setbox(el, x, y, w, h):
    O._set_xfrm(el, int(x * EMU), int(y * EMU), int(w * EMU), int(h * EMU))
setbox(hdr, X0, RY, 4.0, 0.3)
setbox(rule, X0, RY + 0.34, sum(COLS), 0.0)
pth = rule.find(".//a:path", NS)                               # keep the rule straight at the new width
pth.set("w", str(int(sum(COLS) * EMU))); pth.set("h", "0")
pts = pth.findall(".//a:pt", NS); pts[1].set("x", str(int(sum(COLS) * EMU))); pts[1].set("y", "0")
setbox(bul, X0 + 0.02, RY + 0.42, sum(COLS) - 0.04, 1.3)
src = O._store(src, rf)
src = O.set_texts(src, ["Potential Risks", RISKS])
rf = O._frag(src)
for tb in rf.iter("{http://schemas.openxmlformats.org/presentationml/2006/main}txBody"):
    for bp in tb.iter(A + "bodyPr"):
        for af in bp.findall(A + "spAutoFit"): bp.remove(af)
    for k, p in enumerate(tb.findall("a:p", NS)):               # even spacing between the four risks
        sb = p.find("a:pPr/a:spcBef/a:spcPts", NS)
        if sb is not None: sb.set("val", "100" if k == 0 else "500")
    for r in list(tb.iter(A + "rPr")) + list(tb.iter(A + "endParaRPr")):
        r.attrib.pop("spc", None)
        if r.get("sz"): r.set("sz", "1600" if tb.getparent() is hdr else "1500")   # deck body 15 pt; heading a step up
src = O._store(src, rf)
src["bbox"] = [int(X0 * EMU), int(RY * EMU), int(sum(COLS) * EMU), int(1.72 * EMU)]
O.place(CAND, 1, src, [X0, RY, sum(COLS), 1.72], STORE, out_path=CAND, colours="original")

# ------------------------------------------------------------------ 3. frame fixes the profile builder does not make
p = Presentation(CAND)
s = p.slides[0]
t = next(sh for sh in s.shapes if sh._element.find('.//{http://schemas.openxmlformats.org/presentationml/2006/main}ph[@type="title"]') is not None)
t.left, t.top, t.width, t.height = Emu(0), Emu(int(0.43 * EMU)), Emu(int(13.32 * EMU)), Emu(int(0.89 * EMU))
bp = t.text_frame._txBody.find(A + "bodyPr")
bp.set("lIns", str(int(0.35 * EMU))); bp.set("anchor", "ctr")   # one-line titles sit centred in the band, text at 0.35 in (slides 19, 23, 24)
lay = s.slide_layout
for sh in list(lay.shapes):                                     # profile "title rule" at y 1.74: a panel rule of some slides, not frame
    if sh.shape_type is not None and sh.name == "Shape 1" and abs(sh.top - int(1.74 * EMU)) < 0.05 * EMU and sh.height == 0:
        sh._element.getparent().remove(sh._element)
p.save(CAND)

# page 12: the slide's number field would print 1 (a one-slide file), so its field becomes the fixed text "12"
for sh in s.shapes:
    for fld in sh._element.iter(A + "fld"):
        if fld.get("type") == "slidenum":
            r = etree.Element(A + "r")
            if fld.find(A + "rPr") is not None: r.append(copy.deepcopy(fld.find(A + "rPr")))
            etree.SubElement(r, A + "t").text = "12"
            fld.addprevious(r); fld.getparent().remove(fld)
p.save(CAND)
print("ok")
