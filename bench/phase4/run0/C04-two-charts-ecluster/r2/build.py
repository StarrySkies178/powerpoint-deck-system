# C04 run0 rebuild 2: corrections to the master that the E-Cluster style profile produces (runs after build.js, cwd = this folder)
# 1. the profile's "title rule" (10366C at y 1.74, x 4.6) is a panel rule of one slide, not part of the deck's frame: removed
# 2. the title band renders 202C4F on every slide of the deck (other-slides/*.png); the profile's 08163B is darker
# 3. the title text starts 0.36 in from the left edge (paragraph margin; the box itself stays at x 0) and its first line's glyphs at 0.53 in (measured on the deck's renders);
#    the profile's title box has x 0 and no inset, so the title ran from the slide edge and was cut by the band
# 4. the source line is italic in the deck
from pptx import Presentation
from pptx.util import Inches
from pptx.dml.color import RGBColor
from pptx.enum.shapes import PP_PLACEHOLDER
from lxml import etree

P = "candidate.pptx"
prs = Presentation(P)
lay = [l for l in prs.slide_layouts if l.name == "04 Title only"][0]
for sp in list(lay.shapes):
    xml = etree.tostring(sp._element).decode()
    if 'prst="line"' in xml and "10366C" in xml:
        sp._element.getparent().remove(sp._element)
    elif not sp.is_placeholder and 'prst="rect"' in xml and sp.top < Inches(0.5) and sp.width > Inches(12):
        sp.fill.solid(); sp.fill.fore_color.rgb = RGBColor(0x20, 0x2C, 0x4F)
s = prs.slides[0]
for ph in s.placeholders:
    if ph.placeholder_format.type == PP_PLACEHOLDER.TITLE:
        # box kept at the profile's x 0 with no inset (the deck's measured box); the text is moved in by the paragraph margin
        ph.left, ph.top, ph.width, ph.height = 0, Inches(0.445), Inches(12.9), Inches(0.86)
        for p in ph.text_frame.paragraphs:
            p._p.get_or_add_pPr().set("marL", str(Inches(0.345))); p._p.get_or_add_pPr().set("indent", "0")
    elif "Sources" in ph.text_frame.text:
        for p in ph.text_frame.paragraphs:
            for r in p.runs: r.font.italic = True
prs.save(P)
print("build.py: master and title fixed")
