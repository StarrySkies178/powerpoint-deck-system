"""Finishing step for candidate.pptx (runs after build.js, working directory = this folder).

Three things the style profile does not carry yet, taken from the reference deck's OTHER slides:
1. Title indents: the deck's title placeholder spans the band and indents its text (marL ~0.35 in, marR, tIns 1 pt);
   the profile keeps only the box, so the text started at the band's left edge.
2. The rule the profile records as a title rule (x 4.6, y 1.74) is a panel-headline rule of one slide; the deck's
   own layout has none, so it is removed from this deck's layout (panel rules are drawn on the slide).
3. The team logo top right, copied from the deck's agenda/analysis frame (the reference deck's slide 5 frame group).
"""
import os, copy, io
from pptx import Presentation
from pptx.util import Emu

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", ".."))
REF = os.path.join(ROOT, "Templates", "Case-2019-E-Cluster.pptx")
CAND = os.path.join(HERE, "candidate.pptx")
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"

prs = Presentation(CAND)
s = prs.slides[0]

# 1. title box and indents as the deck's title placeholder has them
for sh in s.placeholders:
    if "TITLE" in str(sh.placeholder_format.type):
        sh.left, sh.top, sh.width, sh.height = 0, Emu(408229), Emu(12192000), Emu(784225)
        bp = sh.text_frame._txBody.find(A + "bodyPr")
        for k, v in (("lIns", "0"), ("tIns", "12700"), ("rIns", "0"), ("bIns", "0")): bp.set(k, v)
        bp.set("anchor", "t")
        for p in sh.text_frame.paragraphs:
            pPr = p._p.get_or_add_pPr(); pPr.set("marL", "318135"); pPr.set("marR", "569595"); pPr.set("indent", "0")

# source line in italics, as on the deck's pages
for sh in s.placeholders:
    if sh.has_text_frame and sh.text_frame.text.startswith("Sources:"):
        for p in sh.text_frame.paragraphs:
            for r in p.runs: r.font.italic = True

# 2. drop the stray rule from the slide's layout
lay = s.slide_layout
for sh in list(lay.shapes):
    g = sh._element.find(".//" + A + "prstGeom")
    if g is not None and g.get("prst") == "line" and abs(sh.top / 914400 - 1.74) < 0.05:
        sh._element.getparent().remove(sh._element)

# 3. logo pictures from the deck frame (top-right group)
ref = Presentation(REF)
src = ref.slides[4]
for grp in src.shapes:
    if grp.shape_type == 6 and grp.top / 914400 < 0.2 and grp.left / 914400 > 11:
        for pic in grp.shapes:
            if pic.shape_type == 13:
                s.shapes.add_picture(io.BytesIO(pic.image.blob), pic.left, pic.top, pic.width, pic.height)
prs.save(CAND)
print("finished", CAND)
