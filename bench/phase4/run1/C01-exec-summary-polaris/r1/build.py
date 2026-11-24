# Page number: the prompt gives the page as 2, so the one-slide candidate starts numbering there.
import zipfile, shutil, re
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            if "firstSlideNum" not in x:
                x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="2"', x, count=1)
            data = x.encode("utf8")
        elif re.fullmatch(r"ppt/slides/slide\d+\.xml", it.filename):   # cached field text, for viewers that do not recompute it
            data = re.sub(r'(<a:fld [^>]*type="slidenum">.*?<a:t>)1(</a:t>)', r'\g<1>2\2', data.decode("utf8")).encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
