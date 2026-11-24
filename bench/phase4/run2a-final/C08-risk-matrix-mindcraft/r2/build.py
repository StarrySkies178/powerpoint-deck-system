# Page number: the prompt puts this slide on page 12. The deck numbers its pages with a field; in a one-slide file that field
# reads 1, so numbering starts at 12 (firstSlideNum) and the slide's own field is written as the text "12" for any viewer
# that ignores firstSlideNum.
import zipfile, shutil, re
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = re.sub(r'\sfirstSlideNum="\d+"', "", data.decode("utf8"))
            data = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1).encode("utf8")
        elif it.filename == "ppt/slides/slide1.xml":
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum">(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>12</a:t></a:r>', x)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
