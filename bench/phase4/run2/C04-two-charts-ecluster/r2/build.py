# Post-process candidate.pptx (runs after build.js, cwd = this folder): the reference look the frame does not give.
# 1. The "04 Title only" layout carries a long rule at y 1.74 measured from a panel rule of the reference; it would cross
#    panel 1 here, so it is removed (each panel draws its own rule under its headline, as the reference does).
# 2. Title text placed as the reference's titles are (paragraph indent, top of the band).
# 3. Source line italic, as in the reference.
from pptx import Presentation
from pptx.util import Inches, Emu
from pptx.enum.text import MSO_ANCHOR
p = Presentation("candidate.pptx")
s = p.slides[0]
lay = s.slide_layout
for sh in list(lay.shapes):
    if not sh.is_placeholder and abs(sh.top - Inches(1.74)) < Inches(0.03) and sh.height < Inches(0.02):
        sh._element.getparent().remove(sh._element)
for sh in s.shapes:
    if not sh.is_placeholder: continue
    t = sh.placeholder_format.type
    if t == 1:   # title
        # as the reference's titles: no box inset, a paragraph indent (marL 318135 / marR 569595 EMU), top-anchored at the band top
        sh.left, sh.top, sh.width, sh.height = Emu(0), Emu(408222), Inches(13.333), Inches(0.89)
        tf = sh.text_frame
        tf.margin_left, tf.margin_right, tf.margin_top, tf.margin_bottom = 0, 0, Emu(12700), 0
        tf.vertical_anchor = MSO_ANCHOR.TOP
        for para in tf.paragraphs:
            pPr = para._p.get_or_add_pPr(); pPr.set("marL", "318135"); pPr.set("marR", "569595")
    elif sh.has_text_frame and sh.text_frame.text.startswith("Sources"):
        for para in sh.text_frame.paragraphs:
            for r in para.runs: r.font.italic = True
    elif t == 13:   # slide number: bold, in the crumb navy, as on the reference's pages (the number is a field)
        A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
        from lxml import etree
        for fld in sh._element.iter(A + "fld"):
            rPr = fld.find(A + "rPr")
            if rPr is None: rPr = etree.SubElement(fld, A + "rPr"); fld.remove(rPr); fld.insert(0, rPr)
            rPr.set("b", "1")
            for f in rPr.findall(A + "solidFill"): rPr.remove(f)
            sf = etree.SubElement(rPr, A + "solidFill"); etree.SubElement(sf, A + "srgbClr").set("val", "202C4F")
            rPr.remove(sf); rPr.insert(0, sf)
p.save("candidate.pptx")
