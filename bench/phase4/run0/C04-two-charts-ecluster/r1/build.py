# build.py: runs after build.js (cwd = this folder). The title text of the reference deck sits inside its band with
# paragraph margins (left 0.35 in, right 0.62 in), single line spacing, box top at 0.45 in; the style profile does not carry
# the margins, so they are set here on the built slide.
from pptx import Presentation
from pptx.util import Emu, Inches
from lxml import etree
NS = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
p = Presentation("candidate.pptx")
for sh in p.slides[0].shapes:
    if sh.is_placeholder and sh.placeholder_format.type == 1:   # TITLE
        sh.top = Inches(0.45)
        for para in sh.text_frame.paragraphs:
            pPr = para._p.get_or_add_pPr()
            pPr.set("marL", str(Emu(Inches(0.348)))); pPr.set("marR", str(Emu(Inches(0.40))))
            ln = pPr.find(NS + "lnSpc")
            if ln is None:
                ln = etree.SubElement(pPr, NS + "lnSpc"); pPr.insert(0, ln)
            for c in list(ln): ln.remove(c)
            etree.SubElement(ln, NS + "spcPct").set("val", "100000")
p.save("candidate.pptx")
