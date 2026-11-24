# Post-step (runs after build.js, cwd = this folder): the title placeholder comes out at x 0 with zero insets and no
# paragraph margins, so its text touched the slide edge and its second line ran past the navy band. The deck's own titles
# (seen on its other slides) keep the box at x 0 with lIns 0 and indent the text with paragraph margins (marL 318135,
# marR 569595 EMU) at single line spacing, first line high in the band. Apply that, and lift the box 0.1 in. Nothing else.
from pptx import Presentation
from pptx.util import Inches
from pptx.oxml.ns import qn
from lxml import etree

p = Presentation("candidate.pptx")
for sh in p.slides[0].shapes:
    if sh.is_placeholder and "TITLE" in str(sh.placeholder_format.type):
        for para in sh.text_frame.paragraphs:
            pPr = para._p.get_or_add_pPr()
            pPr.set("marL", "318135"); pPr.set("marR", "569595")
            ln = pPr.find(qn("a:lnSpc"))
            if ln is None:
                ln = etree.SubElement(pPr, qn("a:lnSpc")); pPr.insert(0, ln)
            for c in list(ln): ln.remove(c)
            etree.SubElement(ln, qn("a:spcPct")).set("val", "100000")
        sh.top = Inches(0.47)
p.save("candidate.pptx")
