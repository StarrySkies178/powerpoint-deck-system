# Page number: the prompt places this slide as page 12. In this one-slide deck the layout's slide-number field
# would print 1, so the field (on the layout and on the slide) is replaced by the page number as text.
import re, zipfile, shutil, os
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if re.fullmatch(r"ppt/(slideLayouts/slideLayout|slides/slide)\d+\.xml", it.filename):
            s = data.decode("utf8")
            s = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(.*?)<a:t>[^<]*</a:t></a:fld>', r'<a:r>\1<a:t>12</a:t></a:r>', s, flags=re.S)
            data = s.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)

# Title indent: the reference's title box spans the full width with zero insets, yet its text starts ~0.34 in from
# the edge on every other slide's render, so the indent sits on the paragraph (marL), not the box inset.
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if re.fullmatch(r"ppt/slides/slide\d+\.xml", it.filename):
            s = data.decode("utf8")
            def fix(m):
                return re.sub(r'marL="0"', 'marL="310896"', m.group(0))
            s = re.sub(r'<p:sp>(?:(?!</p:sp>).)*?type="title"(?:(?!</p:sp>).)*?</p:sp>', fix, s, flags=re.S)
            data = s.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
