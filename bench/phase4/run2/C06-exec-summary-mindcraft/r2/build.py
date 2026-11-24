# Runs after build.js in this folder. The reference deck numbers its pages from the first analysis slide
# (its slide 4 shows "1"), and the Agenda before it carries no number; the executive summary sits between
# them, so it carries no page number either. Remove the slide-number placeholder pptxgenjs put on the slide.
import re, shutil, zipfile, os

src = "candidate.pptx"
tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if re.fullmatch(r"ppt/slides/slide\d+\.xml", item.filename):
            x = data.decode("utf8")
            x = re.sub(r"<p:sp>(?:(?!</p:sp>).)*?<p:ph type=\"sldNum\".*?</p:sp>", "", x, flags=re.S)
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
