# Title paragraph as the reference deck sets it (its sibling slides: left/right paragraph margins inside the full-width band,
# single line spacing), so the two-line action title starts where the deck's titles start and stays inside the band.
from pptx import Presentation
from pptx.oxml.ns import qn
from lxml import etree

f = "candidate.pptx"
prs = Presentation(f)
for sl in prs.slides:
    for sh in sl.shapes:
        if sh.is_placeholder and sh.placeholder_format.type is not None and "TITLE" in str(sh.placeholder_format.type):
            sh.top = 411480                     # the reference's title box top (0.45 in, profile title.y), not its text top
            for p in sh.text_frame.paragraphs:
                pPr = p._p.get_or_add_pPr()
                pPr.set("marL", "318135"); pPr.set("marR", "569595"); pPr.set("indent", "0")
                for old in pPr.findall(qn("a:lnSpc")): pPr.remove(old)
                ln = etree.SubElement(pPr, qn("a:lnSpc")); etree.SubElement(ln, qn("a:spcPct")).set("val", "100000")
                pPr.insert(0, ln)
prs.save(f)
