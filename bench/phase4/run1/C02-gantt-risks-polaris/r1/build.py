# Runs after build.js (cwd = this folder): give the one-slide candidate the page number the prompt states,
# so the footer shows it instead of 1.
import zipfile, shutil, re, os

src = "candidate.pptx"
tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for item in zi.infolist():
        data = zi.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="16" ', 1)
            data = x.encode("utf8")
        elif item.filename == "ppt/slides/slide1.xml":
            # the page-number field becomes the plain page number (renderers that ignore firstSlideNum would show 1)
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>16</a:t></a:r>', x)
            data = x.encode("utf8")
        zo.writestr(item, data)
shutil.move(tmp, src)
