# build.py: runs after build.js (cwd = this folder). The deck's titles sit in a full-width band with the text indented
# from the left edge (paragraph indent ~0.35 in, single line spacing), which the profile's title box does not carry;
# and the box at the band's top; set them on this slide's title so the text starts where the deck's titles start.
from pptx import Presentation
from pptx.util import Emu
from lxml import etree
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
p = Presentation("candidate.pptx")
for s in p.slides:
    for sh in s.shapes:
        if sh.is_placeholder and sh.placeholder_format.type is not None and "TITLE" in str(sh.placeholder_format.type):
            # the deck's title box sits at the top of the band (0.45 in), its glyphs start ~0.12 in lower
            sh.left, sh.top, sh.width, sh.height = Emu(0), Emu(int(0.446 * 914400)), Emu(int(13.333 * 914400)), Emu(int(0.858 * 914400))
            for para in sh.text_frame.paragraphs:
                pPr = para._p.get_or_add_pPr()
                pPr.set("marL", "318135"); pPr.set("marR", "425450")
                for old in pPr.findall(A + "lnSpc"): pPr.remove(old)
                ln = etree.SubElement(pPr, A + "lnSpc"); etree.SubElement(ln, A + "spcPct").set("val", "100000")
                pPr.insert(0, ln)
p.save("candidate.pptx")
