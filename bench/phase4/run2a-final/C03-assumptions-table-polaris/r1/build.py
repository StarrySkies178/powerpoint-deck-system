# The prompt says the slide is page 22 of the deck. The candidate holds one slide, so its slide-number field would read 1;
# start the numbering at 22 (p:presentation firstSlideNum) so the page number matches the prompt.
import re, shutil, tempfile, zipfile, os

src = "candidate.pptx"
tmp = tempfile.mktemp(suffix=".pptx")
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for item in zi.infolist():
        data = zi.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="22"', x, count=1)
            data = x.encode("utf8")
        zo.writestr(item, data)
shutil.move(tmp, src)
