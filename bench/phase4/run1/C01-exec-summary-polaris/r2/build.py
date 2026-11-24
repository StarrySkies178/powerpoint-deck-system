# Page number: the slide is page 2 of the deck (prompt). The candidate file has one slide, so the deck's
# first slide number is set to 2 (presentation.xml firstSlideNum), which PowerPoint honours; LibreOffice ignores it,
# so the page-number field on the slide is also written as the plain page number 2.
import zipfile, shutil, re, os
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="2"', x, count=1)
            data = x.encode("utf8")
        if it.filename == "ppt/slides/slide1.xml":
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>2</a:t></a:r>', x)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
