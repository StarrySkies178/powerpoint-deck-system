"""C06 variant c: refill the four numbered items of Mindcraft slide 2 (stored object case19-mindcraft-002)
with the four executive-summary paragraphs. See build.js for why slide 2 is the closest other slide.
Runs after build.js with this folder as working directory."""
import copy, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
from lxml import etree

STORE = os.path.join(ROOT, "Objects/store")
CAND = os.path.join(HERE, "candidate.pptx")
EMU = 914400
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
RED = "C00000"

# (text, bold key phrase?) runs per paragraph; key words bold in the deck's main red
PARAS = [
    [("Fine jewelry market expects ", 0), ("attractive growth in next five years", 1),
     (", mainly driven by the strong demands from ", 0), ("millennials in tier 1 and 2 cities", 1),
     (" and ", 0), ("emerging middle class from tier 3 and 4 cities", 1),
     (". These two primary customer groups have different key purchasing criteria: individuality and youthful "
      "image for high-tier millennials and brand recognition for low-tier middle class.", 0)],
    [("However, CSS faces challenges in seizing growth in the two primary customer groups: ", 0),
     ("low penetration of the youth brands in high tiers", 1), (" and ", 0),
     ("limited access and brand awareness in low tiers", 1),
     (". Therefore, CSS's five-year growth strategy should address ", 0),
     ("branding, offline expansion and omni-channel development", 1),
     (" with differentiations accommodating to two primary customers.", 0)],
    [("Moreover, the proposed top-line growth strategy is expected to deliver ", 0), ("12% annual growth", 1),
     (", largely driven by ", 0), ("offline expansion strategy", 1), (".", 0)],
    [("Finally, the strategy will impose ", 0), ("affordable financial pressure", 1),
     (" and the implementation risks including internal resistance, talent and supply chain management and "
      "IT system have been ", 0), ("preliminarily identified", 1), (".", 0)],
]
LINES = [4, 4, 2, 2]          # lines each paragraph takes at 14 pt across the bar (checked on the render)
PT = 14
LEFT, RIGHT = 0.39, 13.05     # title left edge; deck right margin
TOP, BOTTOM = 1.55, 7.0
CHIP, GAP_X = 0.59, 0.20      # slide 2's square and its gap to the bar
PAD = 0.2
SPC = 115                     # line spacing, %
LINE_H = PT * 1.2 * SPC / 100 / 72

o = O.get(STORE, "case19-mindcraft-002")
frag = etree.fromstring(o["xml"])
els = list(frag)
for el in els[8:]:            # drop the abbreviations / note box (right half of the agenda)
    frag.remove(el)
chips, bars = els[0:8:2], els[1:8:2]

hs = [2 * PAD + n * LINE_H for n in LINES]
gap = (BOTTOM - TOP - sum(hs)) / (len(hs) - 1)
y = TOP
def set_box(el, x, y, w, h):
    off = el.find(f"{P}spPr/{A}xfrm/{A}off"); ext = el.find(f"{P}spPr/{A}xfrm/{A}ext")
    off.set("x", str(int(x * EMU))); off.set("y", str(int(y * EMU)))
    ext.set("cx", str(int(w * EMU))); ext.set("cy", str(int(h * EMU)))
def fixed_body(el, anchor, lr):
    bp = el.find(f"{P}txBody/{A}bodyPr")
    for c in list(bp): bp.remove(c)                       # no spAutoFit: the row keeps its height
    bp.set("anchor", anchor); bp.set("tIns", "0"); bp.set("bIns", "0")
    bp.set("lIns", str(int(lr * EMU))); bp.set("rIns", str(int(lr * EMU)))
    for pp in el.iter(f"{A}pPr"):
        for sb in pp.findall(f"{A}spcBef"): pp.remove(sb)
for chip, bar, h, runs in zip(chips, bars, hs, PARAS):
    set_box(chip, LEFT, y, CHIP, CHIP)
    set_box(bar, LEFT + CHIP + GAP_X, y, RIGHT - LEFT - CHIP - GAP_X, h)
    fixed_body(chip, "ctr", 0)
    fixed_body(bar, "ctr", 0.12)
    p = bar.find(f"{P}txBody/{A}p")
    proto = p.find(f"{A}r/{A}rPr")
    for r in p.findall(f"{A}r"): p.remove(r)
    ppr = p.find(f"{A}pPr"); ppr.set("marL", "0")
    ls = ppr.find(f"{A}lnSpc/{A}spcPct"); ls.set("val", str(SPC * 1000))
    end = p.find(f"{A}endParaRPr")
    for text, key in runs:
        r = etree.Element(f"{A}r"); rp = copy.deepcopy(proto)
        rp.set("sz", str(PT * 100))
        for k in ("spc",):
            if k in rp.attrib: del rp.attrib[k]
        if key:
            rp.set("b", "1")
            sf = etree.SubElement(rp, f"{A}solidFill"); etree.SubElement(sf, f"{A}srgbClr", val=RED)
            rp.insert(0, sf)
        r.append(rp); t = etree.SubElement(r, f"{A}t"); t.text = text
        end.addprevious(r)
    end.set("sz", str(PT * 100))
    y += h + gap

O._store(o, frag)
box = [v / EMU for v in o["bbox"]]
res = O.place(CAND, 1, o, box, STORE, out_path=CAND, colours="original", scale_text=False)
print("placed", [round(v, 2) for v in res["box"]], res["warnings"])
