# Runs after build.js (cwd = this folder). The deck's titles sit on the full-width navy band with their text
# starting about 0.35 in from the left edge (renders of the deck's other slides); the master's title box starts at
# x = 0 with no inset, so give this slide's title the reference's left indent and a right inset.
from pptx import Presentation
from pptx.util import Inches

prs = Presentation("candidate.pptx")
for sh in prs.slides[0].shapes:
    if sh.is_placeholder and sh.placeholder_format.type is not None and "TITLE" in str(sh.placeholder_format.type):
        tf = sh.text_frame
        tf.margin_right = Inches(0.3)
        for para in tf.paragraphs:   # the left offset as a paragraph indent (as the box itself stays at the profile's x = 0)
            pPr = para._p.get_or_add_pPr(); pPr.set("marL", str(Inches(0.35))); pPr.set("indent", "0")
        sh.top = Inches(0.47)   # the reference's title glyphs start at 0.57 in (profile text_top); the box sits 0.1 in above that
prs.save("candidate.pptx")
