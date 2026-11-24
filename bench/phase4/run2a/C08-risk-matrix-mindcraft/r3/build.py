# The prompt places this slide on page 12 of the deck: start the slide numbering at 12 so the master's page field shows it.
import zipfile, shutil, re, os
src = "candidate.pptx"; tmp = src + ".tmp"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="12"', x, count=1)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
