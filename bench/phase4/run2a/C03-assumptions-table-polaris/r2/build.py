# Page number: the prompt puts this slide at page 22. The one-slide candidate starts its numbering there
# (firstSlideNum, read by PowerPoint) and its page-number field is written out as the text "22"
# (LibreOffice ignores firstSlideNum and would draw "1").
import copy
from pptx import Presentation
from pptx.oxml.ns import qn
p = Presentation("candidate.pptx")
p.part._element.set("firstSlideNum", "22")
for fld in p.slides[0].shapes._spTree.iter(qn("a:fld")):
    if fld.get("type") == "slidenum":
        r = fld.makeelement(qn("a:r"), {})
        rpr = fld.find(qn("a:rPr"))
        if rpr is not None: r.append(copy.deepcopy(rpr))
        t = r.makeelement(qn("a:t"), {}); t.text = "22"; r.append(t)
        fld.getparent().replace(fld, r)
p.save("candidate.pptx")
