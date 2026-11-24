# Runs after build.js (working directory = this folder): moves the grey footer band to the back of the slide,
# so the source line (a placeholder written before it) sits on top of it, as on the deck's other slides.
from pptx import Presentation

prs = Presentation("candidate.pptx")
for slide in prs.slides:
    tree = slide.shapes._spTree
    for sh in list(slide.shapes):
        if sh.name == "footer band":
            el = sh._element
            tree.remove(el)
            tree.insert(2, el)   # after nvGrpSpPr and grpSpPr
prs.save("candidate.pptx")
