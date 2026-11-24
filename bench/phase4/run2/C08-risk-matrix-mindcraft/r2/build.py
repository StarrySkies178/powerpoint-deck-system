# page number: the prompt places this slide as page 12. The layout's slide-number field would print 1 (a one-slide file),
# so the field on this slide is replaced by the plain page number, in the same run properties.
import zipfile, shutil, re
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if re.fullmatch(r"ppt/slides/slide\d+\.xml", it.filename):
            x = data.decode("utf8")
            x = re.sub(r'<a:fld id="[^"]*" type="slidenum">(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r"<a:r>\1<a:t>12</a:t></a:r>", x)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
