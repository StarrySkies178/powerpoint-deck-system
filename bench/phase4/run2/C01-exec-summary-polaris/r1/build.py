# Number the slide as page 2 (the prompt's page number).
import zipfile, shutil, re, os

src = "candidate.pptx"
tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="2" ', 1)
            data = x.encode("utf8")
        if item.filename == "ppt/slides/slide1.xml":
            x = data.decode("utf8")
            # LibreOffice ignores firstSlideNum, so the number is written as text (PowerPoint keeps it too)
            x = re.sub(r'<a:fld [^>]*type="slidenum">(<a:rPr[^>]*/>)<a:t>[^<]*</a:t></a:fld>', r"<a:r>\1<a:t>2</a:t></a:r>", x)
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
