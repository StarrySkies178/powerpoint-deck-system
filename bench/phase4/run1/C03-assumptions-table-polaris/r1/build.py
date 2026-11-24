# Runs after build.js (working directory = this folder): the prompt places this slide as page 22 of the deck,
# so number the one-slide candidate from 22 (presentation.xml firstSlideNum); the page-number field then reads 22.
import os, re, shutil, zipfile

src = "candidate.pptx"
tmp = src + ".tmp"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            xml = data.decode("utf8")
            xml = re.sub(r'\sfirstSlideNum="\d+"', "", xml)
            xml = xml.replace("<p:presentation ", '<p:presentation firstSlideNum="22" ', 1)
            data = xml.encode("utf8")
        elif re.fullmatch(r"ppt/slides/slide\d+\.xml", item.filename):
            # LibreOffice ignores firstSlideNum and recomputes the field, so the page number becomes a plain run "22"
            xml = data.decode("utf8")
            xml = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r"<a:r>\g<1><a:t>22</a:t></a:r>", xml)
            data = xml.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
