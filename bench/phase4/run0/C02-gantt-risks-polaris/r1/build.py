# Page number given in the prompt ("Page 16"): the one-slide candidate starts numbering there.
import zipfile, shutil, os, re
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            if "firstSlideNum" not in x:
                x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="16"', x, count=1)
            data = x.encode("utf8")
        if it.filename.startswith("ppt/slides/slide") and it.filename.endswith(".xml"):
            # pptxgenjs writes a <a:pPr> before every later run of a bulleted paragraph (invalid, and it drops the bullet)
            x = data.decode("utf8")
            x = re.sub(r"(</a:r>)<a:pPr[^>]*>(?:<a:buNone/>)?</a:pPr>", r"\1", x)
            # page number: a renderer that ignores firstSlideNum would still print 1, so write the page as text
            x = re.sub(r'<a:fld [^>]*type="slidenum">(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r"<a:r>\1<a:t>16</a:t></a:r>", x)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
