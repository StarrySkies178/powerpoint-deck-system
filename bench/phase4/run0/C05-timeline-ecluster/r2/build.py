# Frame details the generators do not draw for this deck (runs after build.js, cwd = this folder):
# 1. E-Cluster logo top right. The picture is the cover's stored object media (Objects/store, case19-ecluster-001,
#    52d131a7fdcddb22.jpg, copied unchanged); the header form (icon + word mark, no tagline) is made by cropping
#    it twice, no resampling.
# 2. Title text inset: the profile's title box starts at x = 0 with no inset; the deck's title text starts ~0.34 in.
# 3. Thin navy footer rule across the slide above the source line (every content slide of the deck has it).
# 4. Breadcrumb arrows grey like the other sections; source line italic, as on the deck's slides.
# 5. Page number 12 (prompt), via the presentation's first slide number.
# 6. Remove the layout's stray rule at y = 1.74 in (profile title.rule): it would cut through the Gantt header.
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR
import re

NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main", "p": "http://schemas.openxmlformats.org/presentationml/2006/main"}
prs = Presentation("candidate.pptx")
s = prs.slides[0]

# 6. stray layout rule
lay = s.slide_layout
for sh in list(lay.shapes):
    if sh.shape_type is not None and sh.width > Inches(5) and sh.height == 0 and abs(sh.top - Inches(1.74)) < Inches(0.05):
        sh._element.getparent().remove(sh._element)

# 2. title inset
for sh in s.placeholders:
    if sh.placeholder_format.type is not None and "TITLE" in str(sh.placeholder_format.type):
        bp = sh.text_frame._txBody.find("a:bodyPr", NS)
        bp.set("lIns", str(Inches(0.33)))

# 4. crumb separators grey, source italic
for sh in s.shapes:
    if not sh.has_text_frame:
        continue
    for p in sh.text_frame.paragraphs:
        for r in p.runs:
            if r.text.strip() == "→":
                r.font.color.rgb = RGBColor(0xBE, 0xBE, 0xBE)
                r.font.bold = True
            if r.text.startswith("Sources:"):
                r.font.italic = True

# 3. footer rule
ln = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, 0, Inches(7.25), prs.slide_width, Inches(7.25))
ln.line.color.rgb = RGBColor(0x20, 0x2C, 0x4E)
ln.line.width = Pt(0.75)
ln.name = "footer rule"

# 1. logo: icon part and word-mark part of the same picture (source 630 x 212 px)
SRC_W, SRC_H = 630, 212
def crop(x0, y0, x1, y1, left, top, height, name):
    w = height * (x1 - x0) / (y1 - y0)
    pic = s.shapes.add_picture("ecluster-logo-from-store-001.jpg", Inches(left), Inches(top), Inches(w), Inches(height))
    pic.crop_left, pic.crop_right = x0 / SRC_W, 1 - x1 / SRC_W
    pic.crop_top, pic.crop_bottom = y0 / SRC_H, 1 - y1 / SRC_H
    pic.name = name
    return w
icon_h = 0.31
crop(22, 37, 172, 187, 11.56, 0.075, icon_h, "logo icon")
crop(200, 77, 612, 137, 11.93, 0.145, 0.165, "logo word mark")

# 5. page number: first slide number 12 for PowerPoint; LibreOffice ignores it, so the layout's number field is
#    replaced by the literal page number, bold navy as rendered on the deck's slides (profile says 585858 regular).
prs.part._element.set("firstSlideNum", "12")
for sh in list(lay.placeholders) + list(s.placeholders):
    if "SLIDE_NUMBER" in str(sh.placeholder_format.type):
        sh._element.getparent().remove(sh._element)
pg = s.shapes.add_textbox(Inches(12.3), Inches(7.27), Inches(0.72), Inches(0.2))
tf = pg.text_frame
for k in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
    setattr(tf, k, 0)
p = tf.paragraphs[0]; p.alignment = 3  # right
r = p.add_run(); r.text = "12"; r.font.size = Pt(10); r.font.bold = True; r.font.name = "Arial"
r.font.color.rgb = RGBColor(0x20, 0x2C, 0x4E)
pg.name = "page number"

# 7. title band: the profile measures it as 08163B, but the deck renders it (and its navy text) as 202C4E;
#    set the theme's main slot to the rendered colour so the band and every main-colour element follow.
tp = [pt for pt in prs.part.package.iter_parts() if pt.partname.endswith("theme1.xml")][0]
x = tp.blob.decode("utf8")
x = re.sub(r'(<a:accent1><a:srgbClr val=")[0-9A-Fa-f]{6}', r'\g<1>202C4E', x)
tp._blob = x.encode("utf8")

prs.save("candidate.pptx")
