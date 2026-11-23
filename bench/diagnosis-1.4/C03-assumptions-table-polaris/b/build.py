# Page number: the slide is page 22 of the deck (prompt). The master's slide-number field counts from 1 in a
# one-slide file: the presentation starts its numbering at 22 (PowerPoint honours it), and the slide's number
# field is written as the text "22" because LibreOffice ignores firstSlideNum when it renders.
import zipfile, shutil, re
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            s = re.sub(r'\sfirstSlideNum="\d+"', "", data.decode("utf8"))
            data = s.replace("<p:presentation ", '<p:presentation firstSlideNum="22" ', 1).encode("utf8")
        elif it.filename == "ppt/slides/slide1.xml":
            s = data.decode("utf8")
            s = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>22</a:t></a:r>', s)
            data = s.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
