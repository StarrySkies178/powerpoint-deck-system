# Runs after build.js (working directory = this folder): the prompt's page number (12) through the deck's own
# slide-number field, by starting the numbering at 12.
import zipfile, shutil, re, os

src = "candidate.pptx"
tmp = src + ".tmp"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1)
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
