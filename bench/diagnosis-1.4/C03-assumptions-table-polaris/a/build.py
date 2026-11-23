# Runs after build.js (cwd = this folder): number the slide as page 22 of the deck (prompt: "Page 22").
# firstSlideNum="22" makes PowerPoint count from 22; LibreOffice ignores it, so the slide's own page-number field
# is also written as the static text 22 (this file holds one slide of the deck, not the whole deck).
import zipfile, shutil, re
src, tmp = "candidate.pptx", "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = re.sub(r'\sfirstSlideNum="\d+"', "", data.decode("utf8"))
            data = x.replace("<p:presentation ", '<p:presentation firstSlideNum="22" ', 1).encode("utf8")
        elif it.filename == "ppt/slides/slide1.xml":
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum">(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>22</a:t></a:r>', x)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
