# Page number from the prompt ("Page 12"): the one-slide deck starts its numbering at 12, so the
# master's slide-number field shows 12; the title gets the deck's left inset (runs after build.js, with this folder as working directory).
import re, shutil, zipfile, os

src, tmp = "candidate.pptx", "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            xml = data.decode("utf8")
            xml = re.sub(r'\sfirstSlideNum="\d+"', "", xml)
            xml = xml.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1)
            data = xml.encode("utf8")
        if item.filename == "ppt/slides/slide1.xml":
            # the deck's titles start ~0.35 in inside the full-width band (renders of its other slides); the layout's
            # title box sits at x 0 with no inset, so indent this slide's title paragraph
            xml = data.decode("utf8")
            i = xml.find('type="title"'); e = xml.find("</p:sp>", i)
            sp = xml[i:e].replace('<a:pPr algn="l" indent="0" marL="0">', '<a:pPr algn="l" indent="0" marL="320040">')
            xml = xml[:i] + sp + xml[e:]
            # page number "12" as text in the slide's page-number box (LibreOffice ignores firstSlideNum)
            k = xml.find('type="sldNum"'); e = xml.find("</p:sp>", k)
            sp = re.sub(r'<a:fld [^>]*>(<a:rPr[^>]*?(?:/>|>.*?</a:rPr>))?.*?</a:fld>', lambda m: '<a:r>' + (m.group(1) or '') + '<a:t>12</a:t></a:r>', xml[k:e], flags=re.S)
            xml = xml[:k] + sp + xml[e:]
            data = xml.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
print("firstSlideNum=12 and title inset set")
