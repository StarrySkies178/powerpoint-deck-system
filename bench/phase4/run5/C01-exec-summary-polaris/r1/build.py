# Runs after build.js (working directory = this folder): the prompt gives this slide as page 2,
# so the deck's numbering starts at 2 (presentation.xml firstSlideNum) and the page field shows 2.
import re, shutil, zipfile, os

src = "candidate.pptx"
tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            xml = data.decode("utf8")
            xml = re.sub(r'\sfirstSlideNum="\d+"', "", xml)
            xml = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="2"', xml, count=1)
            data = xml.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
