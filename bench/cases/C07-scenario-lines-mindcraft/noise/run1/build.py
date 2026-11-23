# Per-series label positions for the two scenario line charts (pptxgenjs sets one position per chart):
# Optimistic above its line, Base and Crush below theirs; the shared 2018 start value is labelled once;
# Base 2019E on the top-line chart sits right of its point (the three cases are closest there).
import copy
from pptx import Presentation
from pptx.oxml.ns import qn
from lxml import etree

C_NS = "http://schemas.openxmlformats.org/drawingml/2006/chart"
POS = ["t", "b", "b"]
OVERRIDE = {0: {1: {1: "r"}}}  # chart index -> series -> point idx -> position


def el(tag, val=None):
    e = etree.SubElement(etree.Element("x"), qn("c:" + tag))
    if val is not None:
        e.set("val", str(val))
    return e


prs = Presentation("candidate.pptx")
charts = [sh.chart for sh in prs.slides[0].shapes if sh.has_chart]
for ci, ch in enumerate(charts):
    sers = ch._chartSpace.findall(".//" + qn("c:ser"))
    for si, ser in enumerate(sers):
        d = ser.find(qn("c:dLbls"))
        d.find(qn("c:dLblPos")).set("val", POS[si])
        new = []
        if si > 0:  # 2018: same value in every case, keep only the Optimistic label
            p = etree.Element(qn("c:dLbl")); p.append(el("idx", 0)); p.append(el("delete", 1)); new.append(p)
        for idx, pos in OVERRIDE.get(ci, {}).get(si, {}).items():
            p = etree.Element(qn("c:dLbl")); p.append(el("idx", idx))
            for tag in ("numFmt", "txPr"):
                p.append(copy.deepcopy(d.find(qn("c:" + tag))))
            p.append(el("dLblPos", pos))
            for tag, v in (("showLegendKey", 0), ("showVal", 1), ("showCatName", 0), ("showSerName", 0), ("showPercent", 0), ("showBubbleSize", 0)):
                p.append(el(tag, v))
            new.append(p)
        for k, p in enumerate(new):
            d.insert(k, p)
prs.save("candidate.pptx")
