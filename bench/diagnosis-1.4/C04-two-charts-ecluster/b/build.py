# Runs after build.js (working directory = this folder). Three corrections the harness's master cannot make from the
# E-Cluster style profile:
# 1. Title: the profile records the band and the title box (x 0, w 13.33) but not the paragraph indents the deck's title
#    band uses on its content slides (left 0.35 in, right 0.62 in), so the text would start at the slide edge; and the
#    master pins the box top at the measured glyph top (0.57 in), so a two-line title runs past the band (0.43-1.32 in).
#    Put the deck's indents on the paragraph and the box at the deck's own title-box top (0.45 in).
# 2. The profile's "title rule" (x 4.6, y 1.74, w 8.49) is a panel underline measured on one slide, not a frame element;
#    the master draws it on every slide, where it bridges the gap between this slide's two panel rules. Remove it from
#    the layout (the panel rules are drawn by build.js).
# 3. Page number: bold, in the deck's heading blue, as on the deck's content slides.
from pptx import Presentation
from pptx.util import Emu
from pptx.enum.shapes import PP_PLACEHOLDER

EMU = 914400
p = Presentation("candidate.pptx")
s = p.slides[0]
for sh in s.placeholders:
    t = sh.placeholder_format.type
    if t == PP_PLACEHOLDER.TITLE:
        sh.top = Emu(int(0.45 * EMU))
        for para in sh.text_frame.paragraphs:
            pPr = para._p.get_or_add_pPr()
            pPr.set("marL", "318135"); pPr.set("marR", "569595"); pPr.set("indent", "0")
    if t == PP_PLACEHOLDER.SLIDE_NUMBER:
        for para in sh.text_frame.paragraphs:
            for r in para._p.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}rPr"):
                r.set("b", "1")
                for f in list(r):
                    if f.tag.endswith("solidFill"): r.remove(f)
                sf = r.makeelement("{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill", {})
                sf.append(sf.makeelement("{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr", {"val": "10366C"}))
                r.insert(0, sf)
lay = s.slide_layout
for sh in list(lay.shapes):
    if sh.top is not None and abs(sh.top / EMU - 1.74) < 0.02 and (sh.height or 0) < EMU * 0.02 and abs(sh.left / EMU - 4.6) < 0.05:
        sh._element.getparent().remove(sh._element)
p.save("candidate.pptx")
