# Title indent as on the deck's other slides (E-Cluster 5-7: marL 318135, marR 569595 on the title paragraph):
# pptxgenjs cannot set paragraph indents on a placeholder, so this step adds them to candidate.pptx.
from pptx import Presentation
from pptx.oxml.ns import qn
p = Presentation("candidate.pptx")
for sl in p.slides:
    for sh in sl.placeholders:
        if sh.placeholder_format.type == 1:   # TITLE
            for para in sh.text_frame.paragraphs:
                pPr = para._p.get_or_add_pPr()
                pPr.set("marL", "318135"); pPr.set("marR", "569595")
p.save("candidate.pptx")
