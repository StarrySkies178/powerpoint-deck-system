# Drops the slide-number placeholder: in the reference deck the pages before the first content slide carry no number.
from pptx import Presentation
p = Presentation("candidate.pptx")
for sl in p.slides:
    for sh in list(sl.shapes):
        if sh.is_placeholder and sh.placeholder_format.type is not None and "SLIDE_NUMBER" in str(sh.placeholder_format.type):
            sh._element.getparent().remove(sh._element)
p.save("candidate.pptx")
