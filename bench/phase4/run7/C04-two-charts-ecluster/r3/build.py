# Runs after build.js (working directory = this folder). Finishes candidate.pptx the way the E-Cluster deck's
# other content slides draw their frame: title text inset inside the navy band (single line spacing, so two lines
# fit the band), italic source line, the deck's logo top right, and no stray rule under the title (the profile's
# "rule" is a panel rule of one slide, not part of the deck's master).
import io, copy
from pptx import Presentation
from pptx.util import Emu, Inches
from lxml import etree

A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
REF = "../../../../../Templates/Case-2019-E-Cluster.pptx"
OUT = "candidate.pptx"

prs = Presentation(OUT)
s = prs.slides[0]

# 1. title: box where the deck keeps it, text inset from the left edge, single line spacing
for sh in s.placeholders:
    if sh.placeholder_format.type == 1 or "itle" in sh.name:
        sh.left, sh.top, sh.width, sh.height = 0, Inches(0.446), prs.slide_width, Inches(0.858)
        bp = sh.text_frame._txBody.find(A + "bodyPr")
        for k, v in (("lIns", "0"), ("tIns", "12700"), ("rIns", "0"), ("bIns", "0")):
            bp.set(k, v)
        for p in sh.text_frame.paragraphs:
            pPr = p._p.get_or_add_pPr()
            pPr.set("marL", "318135"); pPr.set("marR", "569595")
            ln = etree.SubElement(pPr, A + "lnSpc"); etree.SubElement(ln, A + "spcPct").set("val", "100000")
            pPr.insert(0, ln)
    elif sh.has_text_frame and sh.text_frame.text.startswith("Sources"):
        for p in sh.text_frame.paragraphs:
            for r in p.runs:
                r.font.italic = True

# 2. remove the profile's panel rule from the layout (y = 1.74 in): it would cut across the two panel rules
lay = s.slide_layout
for sp in list(lay.shapes):
    if sp.top is not None and abs(Emu(sp.top).inches - 1.74) < 0.03 and Emu(sp.height or 0).inches < 0.02 and Emu(sp.left).inches > 4:
        sp._element.getparent().remove(sp._element)

# 3. the deck's logo (wordmark + mark) top right, taken from another slide of the reference deck
ref = Presentation(REF)
def pics(shapes):
    for sh in shapes:
        if sh.shape_type == 6:
            yield from pics(sh.shapes)
        elif sh.shape_type == 13:
            yield sh
for sh in pics(ref.slides[4].shapes):          # the deck's market slide (slide 5) carries the logo
    if Emu(sh.top).inches < 0.3 and Emu(sh.left).inches > 11:
        s.shapes.add_picture(io.BytesIO(sh.image.blob), sh.left, sh.top, sh.width, sh.height)

prs.save(OUT)
