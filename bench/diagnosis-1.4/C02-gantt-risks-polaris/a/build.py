# Runs after build.js (working directory = this folder): number the one-slide deck as page 16, as the prompt says,
# so the slide-number field prints "16": presentation firstSlideNum for PowerPoint, and the field's cached text for
# renderers that ignore firstSlideNum (LibreOffice prints the cached slide index otherwise).
import zipfile, shutil, re, os
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="16" ', 1)
            data = x.encode("utf8")
        if re.fullmatch(r"ppt/slides/slide\d+\.xml", item.filename):
            x = data.decode("utf8")
            x = re.sub(r'<a:fld id="[^"]*" type="slidenum">(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>16</a:t></a:r>', x)
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
print("page number set to 16")
