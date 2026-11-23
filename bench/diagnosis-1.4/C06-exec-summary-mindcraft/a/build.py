# Post-pass on candidate.pptx (runs after build.js, cwd = this folder).
# 1. Row labels black bold, as the deck's panel headings and agenda labels (labelledRows colours them C.navy = red).
# 2. Chip numbers bold italic, as the deck's numbered chips.
# 3. No page number: the deck numbers its pages from the first content slide; the agenda and summary carry none.
from pptx import Presentation
from pptx.dml.color import RGBColor
p = Presentation("candidate.pptx")
s = p.slides[0]
shapes = list(s.shapes)
for i, sh in enumerate(shapes):
    if not sh.has_text_frame or sh.is_placeholder:
        continue
    t = sh.text_frame.text.strip()
    if t in {"1", "2", "3", "4"}:
        for para in sh.text_frame.paragraphs:
            for r in para.runs:
                r.font.italic = True
    elif t in {"Market Analysis", "Growth Strategy", "Financial Impact", "Risks"}:
        for para in sh.text_frame.paragraphs:
            for r in para.runs:
                r.font.color.rgb = RGBColor(0, 0, 0)
for sh in shapes:
    if sh.is_placeholder and sh.placeholder_format.type is not None and int(sh.placeholder_format.type) == 13:
        sh._element.getparent().remove(sh._element)
p.save("candidate.pptx")
