# Sets the first page number to the one the prompt gives (firstSlideNum on the presentation), so the master's
# slide-number field shows it and stays a live field. LibreOffice ignores the attribute; PowerPoint honours it.
import os, re, shutil, tempfile, zipfile

src = os.path.join(os.getcwd(), "candidate.pptx")
tmp = tempfile.mktemp(suffix=".pptx")
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            if "firstSlideNum" not in x:
                x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="22"', x, count=1)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
