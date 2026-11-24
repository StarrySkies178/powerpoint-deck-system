# Runs after build.js: the reference deck numbers its pages from the first analysis slide,
# so the front-matter slides (cover, agenda, summary) carry no page number. Remove it here.
from pptx import Presentation
p = Presentation("candidate.pptx")
for s in p.slides:
    for sh in list(s.shapes):
        if sh.is_placeholder and sh.placeholder_format.type is not None and "SLIDE_NUMBER" in str(sh.placeholder_format.type):
            sh._element.getparent().remove(sh._element)
p.save("candidate.pptx")
