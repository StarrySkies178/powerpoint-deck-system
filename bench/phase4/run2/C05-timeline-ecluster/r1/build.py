# Post-process candidate.pptx (runs after build.js, working directory = this folder):
# 1. the deck's E-CLUSTER logo (gear + wordmark) top right, taken from the reference deck's slide master
#    (the generated master has the band and footer rule but not the logo pictures);
# 2. a one-line title sits lower in the band, as the deck's one-line titles do (E-Cluster 19: box top 0.668 in);
# 3. page number 12 (first slide number of this one-slide file);
# 4. round bullets in the deck's bullet colour (003D73).
import io, zipfile, os
from pptx import Presentation
from pptx.util import Emu, Inches
from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "../../../../../Templates/Case-2019-E-Cluster.pptx")
CAND = os.path.join(HERE, "candidate.pptx")
NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main", "p": "http://schemas.openxmlformats.org/presentationml/2006/main"}

z = zipfile.ZipFile(REF)
wordmark = z.read("ppt/media/image2.jpg")   # master 'bg object 21'
gear = z.read("ppt/media/image3.jpg")       # master 'bg object 22'

prs = Presentation(CAND)
s = prs.slides[0]
s.shapes.add_picture(io.BytesIO(gear), Emu(10568190), Emu(24383), Emu(308596), Emu(339293))
s.shapes.add_picture(io.BytesIO(wordmark), Emu(10895075), Emu(98977), Emu(1022603), Emu(208005))

for sh in s.placeholders:
    if sh.placeholder_format.type is not None and "TITLE" in str(sh.placeholder_format.type):
        sh.left, sh.top, sh.width, sh.height = Emu(0), Inches(0.668), prs.slide_width, Inches(0.43)
        bp = sh.text_frame._txBody.find("a:bodyPr", NS)
        bp.set("lIns", "0"); bp.set("tIns", "12700"); bp.set("bIns", "0")
        for p in sh.text_frame._txBody.findall("a:p", NS):   # the deck indents its titles by paragraph margin (marL 318135 EMU)
            ppr = p.find("a:pPr", NS)
            if ppr is None: ppr = etree.SubElement(p, "{%s}pPr" % NS["a"]); p.remove(ppr); p.insert(0, ppr)
            ppr.set("marL", "318135")

for p in s.shapes._spTree.iter("{%s}pPr" % NS["a"]):
    bu = p.find("a:buChar", NS)
    if bu is not None and p.find("a:buClr", NS) is None:
        clr = etree.SubElement(p, "{%s}buClr" % NS["a"]); etree.SubElement(clr, "{%s}srgbClr" % NS["a"]).set("val", "003D73")
        p.remove(clr)
        first = next(c for c in p if etree.QName(c).localname in ("buSzTx", "buSzPct", "buSzPts", "buFontTx", "buFont", "buChar"))
        first.addprevious(clr)
        bf = p.find("a:buFont", NS)
        if bf is not None: bf.set("typeface", "Arial")

for sh in s.placeholders:
    if "SLIDE_NUMBER" in str(sh.placeholder_format.type):
        for p in sh.text_frame._txBody.findall("a:p", NS):
            fld = p.find("a:fld", NS)
            if fld is not None:
                t = fld.find("a:t", NS); t.text = "12"
                r = etree.SubElement(p, "{%s}r" % NS["a"]); p.remove(r)
                for c in list(fld): r.append(c)
                fld.addprevious(r); p.remove(fld)

# layout '04 Title only': title band at the master's 90% opacity; drop the profile's body rule (y 1.74 in),
# which this deck draws only under panel heads, not on every slide
lay = s.slide_layout
for sp in list(lay.shapes._spTree):
    xf = sp.find(".//a:xfrm", NS)
    if xf is None: continue
    off, ext = xf.find("a:off", NS), xf.find("a:ext", NS)
    y, h = int(off.get("y")), int(ext.get("cy"))
    if sp.find(".//a:prstGeom[@prst='line']", NS) is not None and abs(y - Inches(1.74)) < Inches(0.05):
        sp.getparent().remove(sp)
    elif sp.find(".//a:prstGeom[@prst='rect']", NS) is not None and abs(y - Inches(0.43)) < Inches(0.03) and abs(h - Inches(0.89)) < Inches(0.05):
        clr = sp.find("p:spPr/a:solidFill/*", NS)
        if clr is not None and clr.find("a:alpha", NS) is None:
            etree.SubElement(clr, "{%s}alpha" % NS["a"]).set("val", "90194")

prs.save(CAND)

# first slide number = 12 (presentation.xml attribute)
tmp = CAND + ".tmp"
with zipfile.ZipFile(CAND) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for it in zin.infolist():
        data = zin.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            if "firstSlideNum" not in x:
                x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1)
            data = x.encode("utf8")
        zout.writestr(it, data)
os.replace(tmp, CAND)
