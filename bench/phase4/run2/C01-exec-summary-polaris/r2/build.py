# Page number: the prompt says page 2, so the one-slide deck starts numbering at 2 (presentation firstSlideNum).
import zipfile, shutil, re, os

src = "candidate.pptx"
tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            s = data.decode("utf8")
            if "firstSlideNum" not in s:
                s = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="2"', s, count=1)
            data = s.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
