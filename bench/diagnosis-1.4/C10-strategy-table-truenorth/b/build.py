# Remove the page number the layout puts on the slide: this slide of the deck carries none.
from pptx import Presentation
p = Presentation("candidate.pptx")
for sl in p.slides:
    for sh in list(sl.shapes):
        if sh.is_placeholder and sh.placeholder_format.type is not None and "SLIDE_NUMBER" in str(sh.placeholder_format.type):
            sh._element.getparent().remove(sh._element)
        elif sh.has_text_frame and sh._element.xpath(".//a:fld[@type='slidenum']"):
            sh._element.getparent().remove(sh._element)
p.save("candidate.pptx")
