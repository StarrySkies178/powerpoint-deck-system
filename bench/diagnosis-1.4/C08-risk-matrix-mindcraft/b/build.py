# Page number: the prompt says this is page 12 of the deck; the layout's slide-number field
# shows it when the presentation's numbering starts at 12 (p:presentation firstSlideNum);
# the slide's own number field is also written as the text 12.
import os, re, shutil, tempfile, zipfile

here = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(here, "candidate.pptx")
tmp = tempfile.mktemp(suffix=".pptx")
with zipfile.ZipFile(path) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1)
            data = x.encode("utf8")
        elif it.filename == "ppt/slides/slide1.xml":   # LibreOffice ignores firstSlideNum: write the number as text
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum">(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>12</a:t></a:r>', x)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, path)
