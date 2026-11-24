# The prompt gives the page number (12); the layout's slide-number field would print 1 in a one-slide file.
# Replace the field on the slide with the plain number. Runs after build.js with this folder as working directory.
import re, shutil, zipfile

src, tmp = "candidate.pptx", "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for item in zi.infolist():
        data = zi.read(item.filename)
        if item.filename == "ppt/slides/slide1.xml":
            x = data.decode("utf8")
            x, n = re.subn(r'<a:fld [^>]*type="slidenum"[^>]*>.*?</a:fld>',
                           '<a:r><a:rPr lang="en-US" dirty="0"/><a:t>12</a:t></a:r>', x, flags=re.S)
            data = x.encode("utf8")
        zo.writestr(item, data)
shutil.move(tmp, src)
