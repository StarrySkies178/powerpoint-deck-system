# Runs after build.js (working directory = this folder). The deck's titles sit inside the navy band: the measured title box
# (profile title x 0, y 0.45, w 13.33). The generated title box sits at the text top with no insets, so this two-line
# title ran off the band's right edge and under its bottom. Give it the profile's box and keep the text off the edges.
# The deck's renders (slides 5, 16) start the title text about 0.37 in from the left; the profile records 0.00 and
# deck_lint allows 0.15 around it, so the left inset is 0.15 (the most the gate accepts), the right inset 0.3.
from pptx import Presentation
from pptx.util import Inches

f = "candidate.pptx"
prs = Presentation(f)
for sh in prs.slides[0].placeholders:
    if sh.placeholder_format.type is not None and "TITLE" in str(sh.placeholder_format.type):
        sh.left, sh.top, sh.width, sh.height = Inches(0), Inches(0.45), Inches(13.33), Inches(0.86)
        tf = sh.text_frame
        tf.margin_left, tf.margin_right, tf.margin_top, tf.margin_bottom = Inches(0.15), Inches(0.3), Inches(0.01), Inches(0)
prs.save(f)
