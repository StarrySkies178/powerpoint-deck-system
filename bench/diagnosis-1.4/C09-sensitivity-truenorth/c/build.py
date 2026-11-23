"""C09 variant c, step 2 (runs after build.js, in this folder).
Places the stored object of the closest other slide, case-truenorth-pola-023 (Pola deck slide 23, pessimistic scenario
chart), once per scenario, and edits it to carry this prompt's data:
  - its heading text box is refilled ("Normal Scenario" / "Optimistic Scenario") and moved;
  - its own pola (grey) and Jurlique (red) bar shapes are resized to the new values on the scale build.js drew;
  - its legend (swatches + "pola" / "Jurlique" outlines) moves with the chart;
  - what holds the old numbers is dropped (label pictures, axis drawn with "¥1.5M" outlines, old dashed connectors,
    white segment masks, CAGR pictures); build.js redrew those with the generators.
Placed at scale 1 with the object's original colours (red CC0000, grey A3A3A3)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
from lxml import etree

STORE = os.path.join(ROOT, "Objects/store")
OID = "case-truenorth-pola-023"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P_ = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
CAND = os.path.join(HERE, "candidate.pptx")
G = json.load(open(os.path.join(HERE, "geom.json")))
EMU = G["EMU"]
LEGEND_Y = 2110107          # legend row of the stored chart (swatch pictures and word outlines)
TOP_TICK = 2113050          # its top axis tick (¥1.5M), the legend sits level with it


def xf(el):
    x = el.find(".//" + A + "xfrm")
    return x.find(A + "off"), x.find(A + "ext")


def colour(el):
    sf = el.find(P_ + "spPr/" + A + "solidFill/" + A + "schemeClr")
    return sf.get("val") if sf is not None else None


def scenario_object(c):
    o = O.get(STORE, OID)
    f = O._frag(o)
    for g in [e for e in f if etree.QName(e).localname == "grpSp"]:     # the chart group maps 1:1 (chOff = off,
        i = list(f).index(g)                                            # chExt = ext): lift its parts out as they are
        for k, ch in enumerate([e for e in g if etree.QName(e).localname in ("sp", "pic", "grpSp", "cxnSp")]):
            f.insert(i + k, ch)
        f.remove(g)
    u = c["unit"] * EMU                       # EMU per ¥M
    base = c["baseY"] * EMU
    dy_legend = c["topY"] * EMU - TOP_TICK
    bars = {"accent6": [], "accent1": []}
    for el in list(f):
        kind = etree.QName(el).localname
        off, ext = xf(el)
        x, y, w, h = (int(off.get("x")), int(off.get("y")), int(ext.get("cx")), int(ext.get("cy")))
        text = "".join(t.text or "" for t in el.iter(A + "t"))
        if kind == "sp" and "Pessimistic" in text:                       # heading: refill, move
            runs = [r for r in el.iter(A + "t")]
            runs[0].text = c["name"].split()[0]
            runs[-1].text = c["name"].split()[1]
            off.set("y", str(int(c["headY"] * EMU)))
            ext.set("cx", str(int(4.0 * EMU)))                            # room for the longer name at 18 pt
            continue
        if kind == "sp" and colour(el) in bars and abs(w - 463550) < 2000:  # bar segments
            bars[colour(el)].append(el)
            continue
        if abs(y - LEGEND_Y) < 20000 and x < 3000000 and h < 140000:      # legend swatches + words
            off.set("y", str(int(y + dy_legend)))
            continue
        f.remove(el)                                                      # old numbers, axis, connectors, masks
    for col, vals in (("accent6", c["pola"]), ("accent1", None)):
        segs = sorted(bars[col], key=lambda e: int(xf(e)[0].get("x")))
        assert len(segs) == 9, (col, len(segs))
        for i, el in enumerate(segs):
            off, ext = xf(el)
            if col == "accent6":
                top, h = base - c["pola"][i] * u, c["pola"][i] * u
            else:
                top, h = base - c["total"][i] * u, (c["total"][i] - c["pola"][i]) * u
            off.set("y", str(int(top)))
            ext.set("cy", str(int(h)))
            sp = el.find(P_ + "spPr")                                     # thin white edge between the segments
            ln = etree.SubElement(sp, A + "ln", w="9525")
            etree.SubElement(etree.SubElement(ln, A + "solidFill"), A + "srgbClr", val="FFFFFF")
    return O._store(o, f)


def trim_media(o):
    o["media"] = [m for m in o.get("media", []) if "MEDIA:" + m in o["xml"]]
    return o


for c in G["charts"]:
    o = trim_media(scenario_object(c))
    box = [v / EMU for v in o["bbox"]]
    r = O.place(CAND, 1, o, box, STORE, out_path=CAND, colours="original")
    print(c["name"], "placed at", [round(v, 3) for v in r["box"]], r["warnings"] or "")

# place() sets wrap="none" on short labels, which makes the widened heading box centre its text; keep it left-aligned
from pptx import Presentation
pr = Presentation(CAND)
for sh in pr.slides[0].shapes:
    for el in sh._element.iter(P_ + "sp"):
        tx = "".join(t.text or "" for t in el.iter(A + "t"))
        if tx.endswith("Scenario"):
            el.find(P_ + "txBody/" + A + "bodyPr").set("wrap", "square")
pr.save(CAND)

# The deck's TrueNorth logo (top right of every content slide) is a frame element the 023 object was saved without;
# take it from another slide's stored object (slide 13, element 0) and put it at its own place.
logo = trim_media(O.element(O.get(STORE, "case-truenorth-pola-013"), 0))
O.place(CAND, 1, logo, [v / EMU for v in logo["bbox"]], STORE, out_path=CAND, colours="original")
print("logo placed")
