# Runs after build.js (working directory = this folder).
# 1. Page 12: the slide stands for page 12 of the deck, so numbering starts at 12 and the page-number field
#    shows 12 as static text (LibreOffice ignores firstSlideNum when it draws the field).
# 2. Title: a one-line title sits in the middle of the dark title band, its text ~0.35 in from the slide edge
#    as on the deck's own one-line titles (its appendix slides).
from pptx import Presentation
from pptx.util import Inches, Emu
from pptx.enum.text import MSO_ANCHOR
from pptx.oxml.ns import qn

p = Presentation("candidate.pptx")
p.part._element.set("firstSlideNum", "12")
s = p.slides[0]
for sh in s.shapes:
    ph = sh.element.find(".//" + qn("p:nvPr") + "/" + qn("p:ph"))
    typ = ph.get("type") if ph is not None else None
    if typ == "title":
        sh.left, sh.top, sh.width, sh.height = Emu(0), Inches(0.43), Inches(13.32), Inches(0.89)
        tf = sh.text_frame
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        # no left inset (the box edge is the profile's title x, 0.0 in); the text starts ~0.35 in in, as the deck's
        # titles do, through a paragraph left margin
        tf.margin_left, tf.margin_right, tf.margin_top, tf.margin_bottom = 0, Inches(0.2), Inches(0.01), 0
        for para in tf.paragraphs:
            para._p.get_or_add_pPr().set("marL", str(Inches(0.35)))
    if typ == "sldNum":
        for fld in sh.element.iter(qn("a:fld")):
            r = fld.getparent()
            run = fld.makeelement(qn("a:r"), {})
            for ch in list(fld):
                if ch.tag == qn("a:rPr"):
                    run.append(ch)
            t = fld.makeelement(qn("a:t"), {}); t.text = "12"; run.append(t)
            r.replace(fld, run)
p.save("candidate.pptx")
