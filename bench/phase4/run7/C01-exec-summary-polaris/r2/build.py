# Runs after build.js in this folder: the slide is page 2 of the deck, so the deck's page numbering starts at 2.
import re, zipfile, shutil, os

src = "candidate.pptx"
tmp = src + ".tmp"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="2"', x, count=1)
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
