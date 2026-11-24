# Runs after build.js (working directory = this folder): number the slide as page 16 of the deck,
# the page field becomes the fixed text 16 (LibreOffice recounts fields and ignores firstSlideNum), and numbering starts at 16.
import zipfile, shutil, re, os
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="16" ', 1)
            data = x.encode("utf8")
        elif it.filename.startswith("ppt/slides/slide") and it.filename.endswith(".xml"):
            x = data.decode("utf8")   # page field -> plain run '16'
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>((?:(?!</a:fld>).)*?)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>16</a:t></a:r>', x)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
