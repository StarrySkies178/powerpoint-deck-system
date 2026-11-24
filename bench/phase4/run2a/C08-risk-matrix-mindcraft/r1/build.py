# Page number: the prompt places this slide on page 12. The slide-number field counts the one-slide candidate as 1,
# so the field in the layouts becomes the fixed page "12" (firstSlideNum kept as well for PowerPoint).
import zipfile, shutil, re
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
fld = re.compile(r'<a:fld [^>]*type="slidenum">(<a:rPr[^>]*/>)<a:t>[^<]*</a:t></a:fld>')
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            if "firstSlideNum" not in x:
                x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1)
            data = x.encode("utf8")
        elif re.match(r"ppt/(slides|slideLayouts|slideMasters)/[A-Za-z]+\d+\.xml$", it.filename):
            data = fld.sub(r'<a:r>\1<a:t>12</a:t></a:r>', data.decode("utf8")).encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
