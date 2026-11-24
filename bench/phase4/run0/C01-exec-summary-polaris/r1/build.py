# Runs after build.js (cwd = this folder): the prompt says this is page 2 of the deck. A one-slide
# candidate numbers itself 1, and LibreOffice ignores presentation.xml firstSlideNum, so the page
# number field is written as the literal page "2" (in the full deck the field would give 2 itself).
import zipfile, shutil, re

src = "candidate.pptx"
tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            if "firstSlideNum=" not in x:
                x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="2" ', 1)
            data = x.encode("utf8")
        if it.filename == "ppt/slides/slide1.xml":
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>2</a:t></a:r>', x)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
