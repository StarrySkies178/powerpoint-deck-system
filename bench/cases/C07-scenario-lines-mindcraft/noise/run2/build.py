# C07 run2 post-step: per-series data-label positions on the two scenario line charts, so close lines stay readable.
# Optimistic above, Crush below, Base right (panel 1) or below (panel 2); at 2018 (all cases equal) only one label, left.
import copy
from pptx import Presentation
from pptx.oxml.ns import qn
from lxml import etree

C = "http://schemas.openxmlformats.org/drawingml/2006/chart"
prs = Presentation("candidate.pptx")
charts = [sh.chart for sh in prs.slides[0].shapes if sh.has_chart]
charts.sort(key=lambda ch: 0)  # document order = panel order


def el(tag, **attrs):
    e = etree.Element(qn("c:" + tag))
    for k, v in attrs.items():
        e.set(k, v)
    return e


for ci, chart in enumerate(charts):
    pos = ["t", "r" if ci == 0 else "b", "b"]
    for si, ser in enumerate(chart._chartSpace.findall(".//" + qn("c:ser"))):
        dl = ser.find(qn("c:dLbls"))
        if dl is None:
            continue
        p = dl.find(qn("c:dLblPos"))
        if p is None:
            p = el("dLblPos")
            anchor = dl.find(qn("c:showLegendKey"))
            anchor.addprevious(p)
        p.set("val", pos[si])
        # 2018 point: one label for all three cases
        d = el("dLbl")
        d.append(el("idx", val="0"))
        if si == 1:
            # copy the series' text formatting, place left
            for tag in ("numFmt", "spPr", "txPr"):
                src = dl.find(qn("c:" + tag))
                if src is not None:
                    d.append(copy.deepcopy(src))
            d.append(el("dLblPos", val="l"))
            for tag in ("showLegendKey", "showVal", "showCatName", "showSerName", "showPercent", "showBubbleSize"):
                src = dl.find(qn("c:" + tag))
                d.append(el(tag, val=src.get("val") if src is not None else ("1" if tag == "showVal" else "0")))
        else:
            d.append(el("delete", val="1"))
        dl.insert(0, d)
prs.save("candidate.pptx")
