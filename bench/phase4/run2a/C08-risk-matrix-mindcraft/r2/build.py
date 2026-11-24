# Page number of the prompt ("Page 12"). The deck numbers its pages with a slide-number field; in a one-slide file that
# field would read 1. The numbering starts at 12 (presentation.xml firstSlideNum), and the slide's own number box keeps
# its place and format but holds the page number as text, so every renderer shows 12 (LibreOffice ignores firstSlideNum).
import zipfile, shutil, re
PAGE = "12"
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for it in zin.infolist():
        data = zin.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = re.sub(r'\sfirstSlideNum="\d+"', "", data.decode("utf8"))
            data = x.replace("<p:presentation ", '<p:presentation firstSlideNum="%s" ' % PAGE, 1).encode("utf8")
        elif it.filename == "ppt/slides/slide1.xml":
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>%s</a:t></a:r>' % PAGE, x)
            data = x.encode("utf8")
        zout.writestr(it, data)
shutil.move(tmp, src)
