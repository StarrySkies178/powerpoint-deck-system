# Page number: the prompt places this slide on page 12. The layout's slide-number field would print 1 for a one-slide
# file, so the field on this file's slide and layout is turned into the fixed page number (and firstSlideNum set for PowerPoint).
import zipfile, re, shutil, os
from pptx import Presentation
p = Presentation("candidate.pptx")
p.part._element.set("firstSlideNum", "12")
p.save("candidate.pptx")
src, tmp = "candidate.pptx", "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if re.match(r"ppt/(slides/slide|slideLayouts/slideLayout)\d+\.xml$", it.filename) and b'type="slidenum"' in data:
            data = re.sub(rb'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>|<a:rPr[^>]*>.*?</a:rPr>)?\s*<a:t>[^<]*</a:t>\s*</a:fld>',
                          lambda m: b"<a:r>" + (m.group(1) or b"") + b"<a:t>12</a:t></a:r>", data, flags=re.S)
        zo.writestr(it, data)
shutil.move(tmp, src)
