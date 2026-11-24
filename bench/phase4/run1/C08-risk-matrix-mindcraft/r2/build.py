# Page number: the prompt gives "Page 12". The slide-number field would show 1 in a one-slide file, so the
# number placeholder gets the page as plain text (same placeholder, size and position).
import zipfile, shutil, re
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if re.fullmatch(r"ppt/slides/slide\d+\.xml", it.filename):
            x = data.decode("utf8")
            x, n = re.subn(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>12</a:t></a:r>', x)
            assert n == 1, n
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
