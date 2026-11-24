# Page number: the deck numbers its pages from the master's slide-number field; the brief says this is page 12.
import zipfile, shutil, re, os
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1)
            data = x.encode("utf8")
        if it.filename == "ppt/slides/slide1.xml":   # LibreOffice ignores firstSlideNum: the field becomes the text "12"
            data = re.sub(r'<a:fld [^>]*type="slidenum">(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>12</a:t></a:r>', data.decode("utf8")).encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
