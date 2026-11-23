# Runs after build.js (cwd = this folder). This page is number 2 in the deck: number the
# presentation from 2 (PowerPoint honours firstSlideNum). LibreOffice ignores firstSlideNum,
# so the slide's own page-number field is also given its value as plain text "2".
import re, shutil, zipfile, os

src, tmp = "candidate.pptx", "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            xml = data.decode("utf8")
            xml = re.sub(r'\sfirstSlideNum="\d+"', "", xml)
            xml = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="2"', xml, count=1)
            data = xml.encode("utf8")
        if item.filename == "ppt/slides/slide1.xml":
            xml = data.decode("utf8")
            # pptxgenjs bug: stray paragraph properties between runs of one bulleted paragraph (invalid
            # DrawingML; LibreOffice then drops the bullet). Remove them so the paragraph keeps its bullet.
            xml = re.sub(r'(</a:r>)<a:pPr indent="0" marL="0"><a:buNone/></a:pPr>', r'\1', xml)
            xml = re.sub(r'<a:fld [^>]*type="slidenum"><a:rPr([^>]*)/><a:t>\d+</a:t></a:fld>', r'<a:r><a:rPr\1/><a:t>2</a:t></a:r>', xml)
            data = xml.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
