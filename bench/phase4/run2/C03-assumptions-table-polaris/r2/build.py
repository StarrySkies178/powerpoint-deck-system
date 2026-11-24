# Runs after build.js (cwd = this folder). The brief gives the page number (22); in a one-slide file the
# slide-number field would read 1, so the field on the slide is replaced by the page number as plain text
# (same run properties, same placeholder, so position, size and colour stay those of the reference's page number).
import re, shutil, zipfile

PAGE = "22"
src, tmp = "candidate.pptx", "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if re.fullmatch(r"ppt/slides/slide\d+\.xml", item.filename):
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>|<a:rPr.*?</a:rPr>)?<a:t>[^<]*</a:t></a:fld>',
                       lambda m: "<a:r>" + (m.group(1) or "") + "<a:t>" + PAGE + "</a:t></a:r>", x)
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
