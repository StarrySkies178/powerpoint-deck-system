# Runs after build.js (working directory = this folder): page numbering starts at the page number the prompt gives
# (presentation.xml firstSlideNum); nothing else is changed.
import zipfile, shutil, re, os
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="16" ', 1)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
