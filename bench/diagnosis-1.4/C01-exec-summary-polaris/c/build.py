"""C01 variant c, step 2: place and refill the stored shapes of Case-2019-Polaris slide 5 (case19-polaris-005).
Runs after build.js, with this folder as working directory. See the comment at the top of build.js for the choice.
Pieces of slide 5 reused (element numbers of the ungrouped stored object):
  1 + 3   dark grey row bar with its white rotated label   -> "Analysis Dimensions"
  23 + 24 red row bar with its white rotated label          -> "Implications"
  4 + 5   flat grey cell with its text box                  -> every analysis cell and both implication cells
  16      grey double-chevron pointing down                 -> rows converge (row 1 -> row 2 -> goal bar)
  18 + 20 + 21  red bar (shadow, bar, white bold label)     -> goal bar
"""
import copy, json, os, sys, zipfile
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
from lxml import etree

STORE = os.path.join(ROOT, "Objects/store")
CAND = os.path.join(HERE, "candidate.pptx")
G = json.load(open(os.path.join(HERE, "geometry.json")))
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P_ = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
EMU = 914400
RED, BLACK, WHITE = "CC0000", "000000", "FFFFFF"

SRC = O.ungroup(O.get(STORE, "case19-polaris-005"))
SRC = O.original_colours(SRC)          # the deck's own colours (red, greys), as on its slide


def sub(idxs):
    """A new object made of some elements of slide 5, in their original order."""
    o = copy.deepcopy(SRC); f = O._frag(o)
    for j, el in reversed(list(enumerate(list(f)))):
        if j not in idxs: f.remove(el)
    return O._store(o, f)


def para(runs, size, bullet=None, align="l", before=0):
    """runs: [(text, bold, colour)]; returns an <a:p> element."""
    p = etree.Element(A + "p")
    ppr = etree.SubElement(p, A + "pPr", algn=align)
    if bullet:
        ppr.set("marL", "177800"); ppr.set("indent", "-177800")
    else:
        ppr.set("marL", "0"); ppr.set("indent", "0")
    if before:
        sb = etree.SubElement(ppr, A + "spcBef"); etree.SubElement(sb, A + "spcPts", val=str(int(before * 100)))
    if bullet:
        etree.SubElement(ppr, A + "buFont", typeface="Arial"); etree.SubElement(ppr, A + "buChar", char=bullet)
    else:
        etree.SubElement(ppr, A + "buNone")
    for text, bold, col in runs:
        r = etree.SubElement(p, A + "r")
        rp = etree.SubElement(r, A + "rPr", lang="en-US", sz=str(int(size * 100)), b="1" if bold else "0", dirty="0")
        sf = etree.SubElement(rp, A + "solidFill"); etree.SubElement(sf, A + "srgbClr", val=col)
        etree.SubElement(rp, A + "latin", typeface="+mn-lt"); etree.SubElement(rp, A + "cs", typeface="+mn-cs")
        etree.SubElement(r, A + "t").text = text
    return p


def refill(tb_el, paras, anchor="ctr", frame=None, inset=(0.1, 0.04), box_scale=(1, 1)):
    """Replace the text of a stored text box; optionally stretch the box over `frame` (another element) with an inset
    given in slide inches (box_scale = slide inches per object unit / EMU, so the inset survives placing)."""
    tx = tb_el.find(P_ + "txBody"); bp = tx.find(A + "bodyPr")
    for ch in list(bp): bp.remove(ch)             # no autofit: the box keeps the size given here
    bp.set("anchor", anchor); bp.set("wrap", "square")
    for p in tx.findall(A + "p"): tx.remove(p)
    for p in paras: tx.append(p)
    if frame is not None:
        fx, fy, fw, fh = O._xfrm(frame)
        ix, iy = inset[0] * EMU / box_scale[0], inset[1] * EMU / box_scale[1]
        if bp.get("vert") in (None, "horz"):
            O._set_xfrm(tb_el, fx + ix, fy + iy, fw - 2 * ix, fh - 2 * iy)


def put(o, box):
    O.place(CAND, 1, o, box, STORE, keep_aspect=False, scale_text=False, out_path=CAND, colours="theme")


def cell(box, paras, anchor="ctr"):
    o = sub({4, 5}); f = O._frag(o); fr, tb = list(f)
    W, H = O._xfrm(fr)[2], O._xfrm(fr)[3]
    refill(tb, paras, anchor=anchor, frame=fr, box_scale=(box[2] * EMU / W, box[3] * EMU / H))
    put(O._store(o, f), box)


def row_label(bar_i, text_i, text, box):
    o = sub({bar_i, text_i}); f = O._frag(o); bar, tb = list(f)
    bx, by, bw, bh = O._xfrm(bar)
    tx = tb.find(P_ + "txBody"); bp = tx.find(A + "bodyPr")
    for ch in list(bp): bp.remove(ch)
    bp.set("anchor", "ctr"); bp.set("wrap", "none")
    for p in tx.findall(A + "p"): tx.remove(p)
    tx.append(para([(text, True, WHITE)], 14, align="ctr"))
    O._set_xfrm(tb, bx, by, bw, bh)               # rotated text centred on the whole bar
    put(O._store(o, f), box)


def chevron(cx, y, h):
    o = sub({16}); w = h * 0.38 / 0.23 * 1.0
    put(o, (cx - w / 2, y, w, h))


def goal_bar(text, box):
    o = sub({18, 20, 21}); f = O._frag(o); shadow, bar, tb = list(f)
    tx = tb.find(P_ + "txBody"); bp = tx.find(A + "bodyPr")
    for ch in list(bp): bp.remove(ch)
    bp.set("anchor", "ctr"); bp.set("wrap", "square")
    for p in tx.findall(A + "p"): tx.remove(p)
    tx.append(para([(text, True, WHITE)], 18, align="ctr"))
    bx, by, bw, bh = O._xfrm(bar)
    O._set_xfrm(tb, bx, by, bw, bh)
    o = O._store(o, f)
    # map the red bar itself (not bar + shadow) onto `box`; the shadow keeps its offset outside it
    X, Y, W, H = o["bbox"]; kx, ky = box[2] * EMU / bw, box[3] * EMU / bh
    put(o, (box[0] - (bx - X) * kx / EMU, box[1] - (by - Y) * ky / EMU, W * kx / EMU, H * ky / EMU))


cols = G["cols"]
r1 = G["row1"]; ys = []; y = r1["y"]
for h in r1["hs"]: ys.append((y, h)); y += h + r1["gap"]
r1_bottom = ys[-1][0] + ys[-1][1]

# --- row labels (vertical bars on the left, as on slide 5)
row_label(1, 3, "Analysis Dimensions", (G["left"], r1["y"], G["labelW"], r1_bottom - r1["y"]))
row_label(23, 24, "Implications", (G["left"], G["row2"]["y"], G["labelW"], G["row2"]["h"]))

# --- analysis dimensions: three cells per column, rows aligned across columns
def item(head, subs=()):
    ps = [para([(head, True, BLACK)], 14, align="l")]
    ps += [para([(s, False, BLACK)], 12, bullet="–", before=2) for s in subs]
    return ps

grid = [
    [item("Market Overview", ["Industry Trends", "Key Drivers"]), item("Customer Analysis"), item("Competitive Analysis")],
    [item("Offline Strategy", ["Store Expansion", "Sales Per Store Improvement"]),
     item("Online Strategy", ["Enter new platforms", "Optimize operations"]), item("Omni-channel Strategy")],
    [item("Implementation Timeline"), item("Risk & Mitigation"), item("Financial Forecast")],
]
for c, col in enumerate(grid):
    for r, ps in enumerate(col):
        cell((cols[c]["x"], ys[r][0], cols[c]["w"], ys[r][1]), ps)

# --- converge: row 1 -> row 2 under each implication, row 2 -> goal bar
mkt_c = cols[0]["x"] + cols[0]["w"] / 2
str_x0, str_x1 = cols[1]["x"], cols[2]["x"] + cols[2]["w"]
str_c = (str_x0 + str_x1) / 2
for cc in (mkt_c, cols[1]["x"] + cols[1]["w"] / 2, cols[2]["x"] + cols[2]["w"] / 2):
    chevron(cc, G["chev1"]["y"], G["chev1"]["h"])

# --- implications (row 2): Market under Market; the strategy implication spans Strategy Design and Implementation
R2 = G["row2"]
cell((cols[0]["x"], R2["y"], cols[0]["w"], R2["h"]), [para([
    ("Pandora should follow ", True, BLACK), ("market trends and customer needs", True, RED),
    (" to find growth opportunities", True, BLACK)], 14, align="ctr")])
cell((str_x0, R2["y"], str_x1 - str_x0, R2["h"]), [para([
    ("Based on position of ", True, BLACK), ("“a warm jewelry brand”", True, RED),
    (", Pandora should implement strategies to ", True, BLACK), ("regain healthy growth", True, RED),
    (" in Mainland China", True, BLACK)], 14, align="ctr")])

for cc in (mkt_c, str_c):
    chevron(cc, G["chev2"]["y"], G["chev2"]["h"])

# --- goal bar: everything converges into one red bar (slide 5's KPC bar, stretched across the body)
goal_bar("Achieve healthy revenue growth in Mainland China jewelry market",
         (G["left"], G["bar"]["y"], G["X1"] - G["left"], G["bar"]["h"]))

# --- page number asked for in the prompt (first page number of this one-page file)
z = zipfile.ZipFile(CAND); files = {n: z.read(n) for n in z.namelist()}; z.close()
pres = etree.fromstring(files["ppt/presentation.xml"]); pres.set("firstSlideNum", "2")
files["ppt/presentation.xml"] = etree.tostring(pres, xml_declaration=True, encoding="UTF-8", standalone=True)
with zipfile.ZipFile(CAND, "w", zipfile.ZIP_DEFLATED) as zo:
    for n, d in files.items(): zo.writestr(n, d)
print("ok")
