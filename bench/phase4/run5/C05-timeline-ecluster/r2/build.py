# Runs after build.js (working directory = this folder). Two finishing touches the harness leaves out:
# 1. Page 12 (from the prompt): numbering starts at 12 (presentation.xml firstSlideNum) and the slide's page-number
#    field shows 12 as plain text, so every renderer prints 12 on this one-slide build.
# 2. Title indent: the E-Cluster deck's titles sit in a full-width band box with a 0.35 in left indent
#    (paragraph marL 318135 EMU on its other slides, e.g. slides 13 and 16); the profile keeps x = 0 but not the indent.
import re, shutil, zipfile

src = "candidate.pptx"
tmp = src + ".tmp"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            xml = data.decode("utf8")
            xml = re.sub(r'\sfirstSlideNum="\d+"', "", xml)
            xml = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="12"', xml, count=1)
            data = xml.encode("utf8")
        elif item.filename == "ppt/slides/slide1.xml":
            xml = data.decode("utf8")
            xml = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r"<a:r>\1<a:t>12</a:t></a:r>", xml)
            i = xml.find('type="title"')
            j = xml.find("</p:sp>", i)
            part = xml[i:j].replace('marL="0"', 'marL="318135"', 1)
            xml = xml[:i] + part + xml[j:]
            data = xml.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
