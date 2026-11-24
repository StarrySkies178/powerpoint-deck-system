# C03 rebuild 3, step 2 (runs after build.js): the deck's own footer, which the style profile does not carry.
# Every content slide of Case-2019-Polaris ends in a thin grey footer rule with the client and team logos at the
# bottom right (seen on the renders of its other slides, e.g. the backup tables 19 to 21). The logos are copied from
# backup slide 19 of the reference (same 13.33 x 7.5 in page, so the same positions). The page number continues the
# deck: the prompt gives the page number, so the presentation starts its numbering there (PAGE).
import copy, io, os
from pptx import Presentation

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../../.."))
REF = os.path.join(ROOT, "Templates", "Case-2019-Polaris.pptx")
OUT = os.path.join(HERE, "candidate.pptx")
RN = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed"
PAGE = "22"                                  # from the prompt
FOOTER = ("object 3", "object 5", "object 6", "object 7")   # footer rule, team logo, client logo, separator

src = Presentation(REF).slides[18]          # backup slide 19
pres = Presentation(OUT)
dst = pres.slides[0]
tree = dst.shapes._spTree
for sh in src.shapes:
    if sh.name not in FOOTER:
        continue
    el = copy.deepcopy(sh._element)
    for blip in el.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}blip"):
        part = src.part.related_part(blip.get(RN))
        _, rid = dst.part.get_or_add_image_part(io.BytesIO(part.blob))
        blip.set(RN, rid)
    nv = el.find(".//{http://schemas.openxmlformats.org/presentationml/2006/main}cNvPr")
    nv.set("id", str(9000 + FOOTER.index(sh.name)))
    nv.set("name", "footer " + sh.name.split()[-1])
    tree.append(el)
pres.part._element.set("firstSlideNum", PAGE)
# LibreOffice ignores firstSlideNum: write the number as plain text into the slide (and its layout) as well
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
for fld in [f for el in (dst._element, dst.slide_layout._element) for f in el.iter(A + "fld")]:
    if fld.get("type") == "slidenum":
        r = fld.makeelement(A + "r", {})
        for ch in fld:
            r.append(ch)
        r.find(A + "t").text = PAGE
        fld.addprevious(r)
        fld.getparent().remove(fld)
pres.save(OUT)
