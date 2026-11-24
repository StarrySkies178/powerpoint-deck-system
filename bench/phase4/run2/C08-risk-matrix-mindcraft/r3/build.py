# Page number: the prompt places this slide as page 12 of the deck. A one-slide file numbers itself 1, and
# LibreOffice ignores presentation firstSlideNum, so the slide's number field is written as the plain text "12"
# (firstSlideNum is set too, for PowerPoint).
import zipfile, os, re
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = re.sub(r'\sfirstSlideNum="\d+"', "", data.decode("utf8"))
            data = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1).encode("utf8")
        elif re.fullmatch(r"ppt/slides/slide\d+\.xml", it.filename):
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>|<a:rPr[^>]*>.*?</a:rPr>)?<a:t>\d+</a:t></a:fld>',
                       lambda m: "<a:r>" + (m.group(1) or "") + "<a:t>12</a:t></a:r>", x)
            data = x.encode("utf8")
        zo.writestr(it, data)
os.replace(tmp, src)
