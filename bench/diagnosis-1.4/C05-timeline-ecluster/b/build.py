# C05 variant b, post-process of candidate.pptx (runs after build.js, in this folder).
# 1. The profile's title.rule (x 4.6, y 1.74) is drawn on the "04 Title only" layout of every slide; on this slide
#    it runs through the year labels, and the deck's single-line-title slides carry no rule under the band: remove it.
# 2. Title: the deck's one-line titles sit centred in the band with a left inset (~0.35 in); the placeholder from
#    the profile is top-pinned at x 0 with no inset.
# 3. Page number: the prompt gives page 12 -> presentation numbering starts at 12; the deck shows it bold, main colour.
# 4. Risk bullets in the main colour, as the deck's round bullets are.
import copy
from pptx import Presentation
from pptx.util import Inches
from lxml import etree

NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main",
      "p": "http://schemas.openxmlformats.org/presentationml/2006/main"}
MAIN = "08163B"

prs = Presentation("candidate.pptx")
slide = prs.slides[0]

# 1. stray rule on the layout
lay = slide.slide_layout
for sp in list(lay.shapes):
    geom = sp._element.find(".//a:prstGeom", NS)
    if geom is not None and geom.get("prst") == "line" and abs(sp.top - Inches(1.74)) < Inches(0.05):
        sp._element.getparent().remove(sp._element)

# 2. title centred in the band, with the deck's left inset
for sp in slide.placeholders:
    if sp.placeholder_format.type is not None and "TITLE" in str(sp.placeholder_format.type):
        sp.left, sp.top, sp.width, sp.height = Inches(0.0), Inches(0.43), Inches(13.0), Inches(0.89)
        bp = sp.text_frame._txBody.find("a:bodyPr", NS)
        bp.set("anchor", "ctr"); bp.set("lIns", "0"); bp.set("tIns", "0"); bp.set("bIns", "0")
        for p in sp.text_frame.paragraphs:          # the deck indents its titles by paragraph margin (marL ~0.35 in), not by inset
            p._p.get_or_add_pPr().set("marL", str(int(Inches(0.35))))

# 3. page number 12, bold, main colour
pres = prs.part._element
pres.set("firstSlideNum", "12")
for el in slide.shapes._spTree.iter("{%s}fld" % NS["a"]):
    if el.get("type") == "slidenum":
        rpr = el.find("a:rPr", NS)
        rpr.set("b", "1")
        for f in rpr.findall("a:solidFill", NS):
            rpr.remove(f)
        fill = etree.SubElement(rpr, "{%s}solidFill" % NS["a"])
        etree.SubElement(fill, "{%s}srgbClr" % NS["a"]).set("val", MAIN)
        rpr.insert(0, fill)
        t = el.find("a:t", NS)
        if t is not None:
            t.text = "12"
        # LibreOffice ignores firstSlideNum and recomputes the field: keep the number as a plain run
        run = etree.Element("{%s}r" % NS["a"])
        run.append(copy.deepcopy(rpr)); etree.SubElement(run, "{%s}t" % NS["a"]).text = "12"
        el.getparent().replace(el, run)
        break

# 4. bullet colour in the risks box
for sp in slide.shapes:
    if not sp.has_text_frame or "Economy downturn" not in sp.text_frame.text:
        continue
    for ppr in sp._element.iter("{%s}pPr" % NS["a"]):
        bu = ppr.find("a:buChar", NS)
        if bu is None:
            continue
        clr = etree.Element("{%s}buClr" % NS["a"])
        etree.SubElement(clr, "{%s}srgbClr" % NS["a"]).set("val", MAIN)
        first = next(c for c in ppr if etree.QName(c).localname in ("buSzPct", "buSzPts", "buFont", "buChar"))
        ppr.insert(list(ppr).index(first), clr)

prs.save("candidate.pptx")
