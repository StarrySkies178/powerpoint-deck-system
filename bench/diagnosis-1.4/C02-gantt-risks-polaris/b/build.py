# Runs after build.js (cwd = this folder): the prompt gives the page number (16), and the deck's page number is the
# master's slide-number field: the one-slide candidate starts its numbering there (presentation.xml firstSlideNum)
# and the slide's number field is written as the plain text 16.
import re, shutil, zipfile, os

src = "candidate.pptx"
tmp = src + ".tmp"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            s = data.decode("utf8")
            s = re.sub(r'\sfirstSlideNum="\d+"', "", s)
            s = s.replace("<p:presentation ", '<p:presentation firstSlideNum="16" ', 1)
            data = s.encode("utf8")
        elif item.filename == "ppt/slides/slide1.xml":
            # LibreOffice ignores firstSlideNum, so the slide's own number field becomes the plain page number
            s = data.decode("utf8")
            s = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>16</a:t></a:r>', s)
            data = s.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
