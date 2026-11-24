# Runs after build.js (working directory = this folder).
# The deck's backup slides (growth assumptions, scenario charts) carry no page number, so the slide-number
# shape that the master layout puts on the slide is taken off this slide.
import re, zipfile, shutil, os

src = "candidate.pptx"
tmp = src + ".tmp"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if re.fullmatch(r"ppt/slides/slide\d+\.xml", item.filename):
            x = data.decode("utf-8")
            x = re.sub(r"<p:sp>(?:(?!</p:sp>).)*?<p:ph type=\"sldNum\"(?:(?!</p:sp>).)*</p:sp>", "", x, flags=re.S)
            data = x.encode("utf-8")
        zout.writestr(item, data)
shutil.move(tmp, src)
