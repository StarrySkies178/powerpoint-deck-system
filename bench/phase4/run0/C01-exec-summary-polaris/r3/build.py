# Runs after build.js (cwd = this folder): the prompt says this is page 2 of the deck, so the slide-number field
# starts at 2 (presentation firstSlideNum) instead of drawing a fake number.
import re, shutil, zipfile, os

src = "candidate.pptx"
tmp = src + ".tmp"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for item in zi.infolist():
        data = zi.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            if "firstSlideNum" not in x:
                x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="2"', x, count=1)
            data = x.encode("utf8")
        if item.filename == "ppt/slides/slide1.xml":   # LibreOffice ignores firstSlideNum: the number is written as text
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum">(.*?)<a:t>\d+</a:t></a:fld>', r"<a:r>\g<1><a:t>2</a:t></a:r>", x)
            data = x.encode("utf8")
        zo.writestr(item, data)
shutil.move(tmp, src)
