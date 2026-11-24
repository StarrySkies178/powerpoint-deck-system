# Runs after build.js with this folder as working directory.
# Adds the deck's footer logos (Pandora wordmark | Polaris), taken from the reference deck's own media at the
# positions its content slides use, and numbers the slide as page 16 of the deck (presentation firstSlideNum).
import io, os, zipfile
from pptx import Presentation
from pptx.util import Inches

ROOT = os.path.abspath(os.path.join(os.getcwd(), "../../../../.."))
REF = os.path.join(ROOT, "Templates", "Case-2019-Polaris.pptx")
OUT = "candidate.pptx"

prs = Presentation(OUT)
slide = prs.slides[0]
with zipfile.ZipFile(REF) as z:
    pandora = z.read("ppt/media/image5.jpg")   # PANDORA wordmark (footer, left of the separator)
    polaris = z.read("ppt/media/image4.png")   # Polaris logo (footer, right)
slide.shapes.add_picture(io.BytesIO(pandora), Inches(10.748), Inches(7.242), Inches(1.070), Inches(0.213))
slide.shapes.add_picture(io.BytesIO(polaris), Inches(11.855), Inches(7.117), Inches(0.958), Inches(0.383))
sep = slide.shapes.add_connector(1, Inches(11.913), Inches(7.257), Inches(11.913), Inches(7.465))
sep.line.color.rgb = __import__("pptx.dml.color", fromlist=["RGBColor"]).RGBColor(0xB4, 0xB4, 0xB4)
sep.line.width = Inches(0.01)
prs.part._element.set("firstSlideNum", "16")
# LibreOffice ignores firstSlideNum, so the page field on this slide also becomes the plain text "16"
from pptx.oxml.ns import qn
for fld in slide.shapes._spTree.iter(qn("a:fld")):
    if fld.get("type") == "slidenum":
        r = fld.makeelement(qn("a:r"), {})
        rpr = fld.find(qn("a:rPr"))
        if rpr is not None: r.append(rpr)
        t = r.makeelement(qn("a:t"), {}); t.text = "16"; r.append(t)
        fld.addprevious(r); fld.getparent().remove(fld)
prs.save(OUT)
