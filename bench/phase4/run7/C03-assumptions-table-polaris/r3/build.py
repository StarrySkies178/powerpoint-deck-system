# Runs after build.js in this folder: the prompt gives the page number, so the one-file deck starts its
# numbering there (presentation.xml firstSlideNum), and PowerPoint's page-number field shows the prompt's number.
# (LibreOffice ignores firstSlideNum and still draws 1.)
import os, re, shutil, zipfile

src = "candidate.pptx"
tmp = src + ".tmp"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="22"', x, count=1)
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
