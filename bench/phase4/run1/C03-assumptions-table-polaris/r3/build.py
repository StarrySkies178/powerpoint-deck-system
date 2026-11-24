# Runs after build.js in this folder: the prompt gives the page number ("Page 22"), so the page-number
# box reads 22 instead of 1 (firstSlideNum for PowerPoint, plus a plain run for LibreOffice renders).
import re, shutil, zipfile

src, tmp = "candidate.pptx", "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="22"', x, count=1)
            data = x.encode("utf8")
        elif item.filename == "ppt/slides/slide1.xml":
            # LibreOffice ignores firstSlideNum, so the page-number field becomes a plain run reading 22
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>((?:(?!</a:fld>).)*?)<a:t>\d+</a:t></a:fld>', r"<a:r>\g<1><a:t>22</a:t></a:r>", x, flags=re.S)
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
