# Post-step: the deck's footer logos and its page numbering.
# The two logos (client and team) sit on every content slide of the reference deck but are stripped from
# the object store as frame furniture, so they are copied from the reference deck's own media (as used on
# its backup-table slides) at the positions those slides use. Page number: the prompt says page 22.
import os, re, io, zipfile
from pptx import Presentation
from pptx.util import Inches

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../../.."))
REF = os.path.join(ROOT, "Templates", "Case-2019-Polaris.pptx")
OUT = os.path.join(HERE, "candidate.pptx")

z = zipfile.ZipFile(REF)
# logos as placed on the deck's first backup table (frame furniture, same on every content slide)
LOGOS = [("ppt/media/image5.jpg", 10.748, 7.242, 1.070, 0.213),   # client logo
         ("ppt/media/image4.png", 11.855, 7.117, 0.958, 0.383)]   # team logo

prs = Presentation(OUT)
sl = prs.slides[0]
for name, x, y, w, h in LOGOS:
    pic = sl.shapes.add_picture(io.BytesIO(z.read(name)), Inches(x), Inches(y), Inches(w), Inches(h))
    pic.name = "logo"
# this slide is page 22 of the deck: numbering starts there, and the number shown is 22
prs.part._element.set("firstSlideNum", "22")
from pptx.oxml.ns import qn
for sh in sl.placeholders:
    if sh.placeholder_format.type == 13:   # slide number: plain run "22" (LibreOffice ignores firstSlideNum)
        for fld in sh._element.iter(qn("a:fld")):
            r = fld.makeelement(qn("a:r"), {})
            rpr = fld.find(qn("a:rPr"))
            if rpr is not None: r.append(rpr)
            t = r.makeelement(qn("a:t"), {}); t.text = "22"; r.append(t)
            fld.addprevious(r); fld.getparent().remove(fld)
            break
prs.save(OUT)
