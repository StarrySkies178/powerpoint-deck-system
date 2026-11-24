# Number the slide as page 2 of the deck (the prompt's "Page 2"): presentation.xml firstSlideNum.
import zipfile, shutil, os
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            if "firstSlideNum" not in x:
                x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="2" ', 1)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
