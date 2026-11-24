# Page number: the prompt places this slide as page 22 of the deck. firstSlideNum makes PowerPoint's slide-number
# field count from 22; LibreOffice ignores it, so the field on the slide and in its layout is also set to the fixed text 22.
import zipfile, shutil, re
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi:
    rels = zi.read("ppt/slides/_rels/slide1.xml.rels").decode("utf8")
    layout = "ppt/slideLayouts/" + re.search(r'Target="\.\./slideLayouts/([^"]+)"', rels).group(1)
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
        for it in zi.infolist():
            data = zi.read(it.filename)
            if it.filename == "ppt/presentation.xml":
                x = re.sub(r'\sfirstSlideNum="\d+"', "", data.decode("utf8"))
                data = x.replace("<p:presentation ", '<p:presentation firstSlideNum="22" ', 1).encode("utf8")
            elif it.filename in (layout, "ppt/slides/slide1.xml"):
                x = data.decode("utf8")
                x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*?(?:/>|>.*?</a:rPr>))<a:t>[^<]*</a:t></a:fld>', r'<a:r>\1<a:t>22</a:t></a:r>', x)
                data = x.encode("utf8")
            zo.writestr(it, data)
shutil.move(tmp, src)
