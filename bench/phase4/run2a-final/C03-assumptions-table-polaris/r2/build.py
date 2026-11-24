# Page number: the prompt gives page 22. PowerPoint counts the slide-number field from firstSlideNum; LibreOffice
# ignores that, so the field on this one-slide file is also replaced by the fixed text "22" (same run formatting).
from pptx import Presentation
from pptx.oxml.ns import qn
p = Presentation("candidate.pptx")
p.part._element.set("firstSlideNum", "22")
for sh in p.slides[0].shapes:
    for fld in sh._element.iter(qn("a:fld")):
        if fld.get("type") == "slidenum":
            r = fld.makeelement(qn("a:r"), {})
            rpr = fld.find(qn("a:rPr"))
            if rpr is not None: r.append(rpr)
            t = r.makeelement(qn("a:t"), {}); t.text = "22"; r.append(t)
            fld.addprevious(r); fld.getparent().remove(fld)
p.save("candidate.pptx")
