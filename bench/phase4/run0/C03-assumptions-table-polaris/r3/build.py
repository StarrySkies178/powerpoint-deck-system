# build.py: runs after build.js (cwd = this folder). The one-slide candidate's slide-number field would read "1";
# the prompt gives this page as 22, so the field on the slide is replaced by the fixed text "22" in the same
# placeholder (same position, size and colour as the deck's page numbers).
import os, re, shutil, zipfile, tempfile

PAGE = "22"
src = "candidate.pptx"
fd, tmp = tempfile.mkstemp(suffix=".pptx"); os.close(fd)
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if re.fullmatch(r"ppt/slides/slide\d+\.xml", item.filename):
            x = data.decode("utf-8")
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>|<a:rPr[^>]*>.*?</a:rPr>)?<a:t>[^<]*</a:t></a:fld>',
                       lambda m: "<a:r>%s<a:t>%s</a:t></a:r>" % (m.group(1) or "", PAGE), x)
            data = x.encode("utf-8")
        zout.writestr(item, data)
shutil.move(tmp, src)
