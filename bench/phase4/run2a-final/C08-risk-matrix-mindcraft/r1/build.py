# Page number: the prompt's page 12. The deck starts counting at 12 (firstSlideNum), and the slide-number field's
# text is set to 12 too, since some viewers ignore firstSlideNum.
import zipfile, shutil, re
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml" and b"firstSlideNum" not in data:
            data = data.replace(b"<p:presentation ", b'<p:presentation firstSlideNum="12" ', 1)
        if it.filename == "ppt/slides/slide1.xml":
            data = re.sub(rb'<a:fld id="[^"]*" type="slidenum">(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', rb'<a:r>\1<a:t>12</a:t></a:r>', data)
        zo.writestr(it, data)
shutil.move(tmp, src)
