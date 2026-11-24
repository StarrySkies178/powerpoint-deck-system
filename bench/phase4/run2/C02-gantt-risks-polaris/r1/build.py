# Runs after build.js (cwd = this folder): the prompt gives the page number (16), so the one-slide file starts numbering at 16
# and the slide's own number field is written as the text 16.
import re, shutil, zipfile

src, tmp = "candidate.pptx", "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="16"', x, count=1)
            data = x.encode("utf8")
        elif item.filename == "ppt/slides/slide1.xml":   # LibreOffice ignores firstSlideNum: write the page number as text
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>[^<]*</a:t></a:fld>', r'<a:r>\1<a:t>16</a:t></a:r>', x)
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
