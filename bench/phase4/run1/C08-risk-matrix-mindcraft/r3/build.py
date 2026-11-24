# Post-process candidate.pptx (runs after build.js, in this folder):
# - page number "12" in the place and size of the deck's page number (profile: right edge 12.95 in, y 7.22 in, 12 pt);
#   the layout's slide-number field would show "1", so it is removed from this one-slide file's layout
# - source line in italic, as on every slide of the reference deck
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
prs = Presentation("candidate.pptx")
s = prs.slides[0]
lay = s.slide_layout
for sh in list(lay.placeholders):
    if sh.placeholder_format.type is not None and "SLIDE_NUMBER" in str(sh.placeholder_format.type):
        sh._element.getparent().remove(sh._element)
for sh in list(s.placeholders):
    if "SLIDE_NUMBER" in str(sh.placeholder_format.type):
        sh._element.getparent().remove(sh._element)
for sh in lay.shapes:
    if sh.has_text_frame and "<a:fld" in sh._element.xml and 'type="slidenum"' in sh._element.xml:
        sh._element.getparent().remove(sh._element)
tb = s.shapes.add_textbox(Inches(12.66), Inches(7.22), Inches(0.32), Inches(0.23))
tf = tb.text_frame; tf.word_wrap = False; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
p = tf.paragraphs[0]; p.alignment = PP_ALIGN.RIGHT
r = p.add_run(); r.text = "12"; r.font.size = Pt(12); r.font.name = "Verdana"
for sh in s.shapes:
    if sh.has_text_frame and sh.text_frame.text.startswith("Source:"):
        for para in sh.text_frame.paragraphs:
            for r in para.runs:
                r.font.italic = True
prs.save("candidate.pptx")
