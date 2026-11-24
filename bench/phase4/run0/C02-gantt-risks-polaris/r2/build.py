# Post-process candidate.pptx (runs after build.js, in this folder):
# 1. pptxgenjs writes a second <a:pPr> in the middle of a paragraph when a run after the first carries
#    paragraph options (bullets); drop those, so each bulleted paragraph is valid and keeps its first pPr.
# 2. Page number as given in the prompt: start the numbering there (presentation firstSlideNum) and write it in the page-number box.
import re, zipfile, shutil, os

src = "candidate.pptx"
tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if re.match(r"ppt/slides/slide\d+\.xml$", item.filename):
            s = data.decode("utf8")
            s = re.sub(r"(</a:r>)<a:pPr\b[^>]*/>", r"\1", s)
            s = re.sub(r"(</a:r>)<a:pPr\b[^>]*>.*?</a:pPr>", r"\1", s)
            # the page number field reads "1" in a one-slide file (LibreOffice ignores firstSlideNum): write the prompt's number
            s = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>16</a:t></a:r>', s)
            data = s.encode("utf8")
        elif item.filename == "ppt/presentation.xml":
            s = data.decode("utf8")
            if "firstSlideNum" not in s:
                s = s.replace("<p:presentation ", '<p:presentation firstSlideNum="16" ', 1)
            data = s.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
