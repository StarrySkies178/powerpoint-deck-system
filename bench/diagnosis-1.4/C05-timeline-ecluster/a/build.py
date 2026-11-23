# C05 variant a, after build.js (working directory = this folder).
# Puts back what the E-Cluster deck has on every content slide but the style profile does not carry:
#  - the deck's logo (gear + wordmark pictures of the reference's slide MASTER, not of any slide), top right;
#  - the thin navy rule across the foot at 7.25 in (master);
#  - the title text indented 0.35 in inside the full-width band, a one-line title centred in the band
#    (as the deck's one-line titles, e.g. E-Cluster 19, 22-24);
#  - the page number given by the prompt (12) instead of the layout's own number field.
# It also removes the stray rule the profile adds under the title (x 4.6, y 1.74 in), which no slide of the deck has
# across its body.
import zipfile, io, os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import MSO_ANCHOR
from pptx.oxml.ns import qn

HERE = os.getcwd()
REF = os.path.join(HERE, "../../../../Templates/Case-2019-E-Cluster.pptx")
OUT = os.path.join(HERE, "candidate.pptx")

prs = Presentation(OUT)
slide = prs.slides[0]
layout = slide.slide_layout

# stray profile rule + layout page-number field
for shp in list(layout.shapes):
    el = shp._element
    if shp.shape_type is not None and el.tag.endswith("}sp") and el.find(".//" + qn("a:prstGeom")) is not None \
            and el.find(".//" + qn("a:prstGeom")).get("prst") == "line" and abs(shp.top - Inches(1.74)) < Inches(0.1):
        el.getparent().remove(el)
    elif el.find(".//" + qn("p:ph")) is not None and el.find(".//" + qn("p:ph")).get("type") == "sldNum":
        el.getparent().remove(el)

# title band: the deck's band is 08163B at 90% opacity (renders as 202C4E); the profile keeps only the hex
for shp in layout.shapes:
    el = shp._element
    if el.tag.endswith("}sp") and abs(shp.top - Inches(0.43)) < Inches(0.05) and shp.width > Inches(13):
        clr = el.find(qn("p:spPr") + "/" + qn("a:solidFill"))
        if clr is not None and len(clr):
            a = clr[0].makeelement(qn("a:alpha"), {"val": "90194"}); clr[0].append(a)

# the slide's own number field (pptxgenjs copies it from the layout)
for shp in list(slide.shapes):
    if shp.has_text_frame and shp._element.find(".//" + qn("a:fld")) is not None:
        shp._element.getparent().remove(shp._element)

# logo from the reference master (gear at 11.56 in, wordmark at 11.92 in)
z = zipfile.ZipFile(REF)
slide.shapes.add_picture(io.BytesIO(z.read("ppt/media/image3.jpg")), Emu(10568190), Emu(24383), Emu(308596), Emu(339293))
slide.shapes.add_picture(io.BytesIO(z.read("ppt/media/image2.jpg")), Emu(10895075), Emu(98977), Emu(1022603), Emu(208005))

# foot rule (master: full width at 7.25 in, 0.75 pt, 202C4F)
ln = slide.shapes.add_connector(1, Emu(0), Emu(6630923), prs.slide_width, Emu(6630923))
ln.line.color.rgb = RGBColor(0x20, 0x2C, 0x4F); ln.line.width = Pt(0.75)

# title: full-width band, text indented 0.35 in, centred vertically
t = slide.shapes.title or next(s for s in slide.placeholders if s.text_frame.text.strip() == "Implementation Timeline")
t.left, t.top, t.width, t.height = Emu(0), Inches(0.43), prs.slide_width, Inches(0.89)
tf = t.text_frame
tf.vertical_anchor = MSO_ANCHOR.MIDDLE
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
for p in tf.paragraphs:
    p._p.get_or_add_pPr().set("marL", "318135")

# page number 12 (bold navy, 10 pt, right-aligned at the deck's page position)
tb = slide.shapes.add_textbox(Inches(12.22), Inches(7.29), Inches(0.8), Inches(0.19))
tf = tb.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
p = tf.paragraphs[0]; p.alignment = 3  # right
r = p.add_run(); r.text = "12"; r.font.size = Pt(10); r.font.bold = True; r.font.name = "Arial"
r.font.color.rgb = RGBColor(0x20, 0x2C, 0x4F)

prs.save(OUT)
print("post-processed", OUT)
