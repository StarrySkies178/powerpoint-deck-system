# Runs after build.js (working directory = this folder). The deck's two-line titles sit centred in the dark band
# (0.43 to 1.32 in) with its text starting about 0.36 in from the left edge; the title placeholder from the profile starts at x 0 with no
# inset and top-anchored at 0.57 in, so a two-line title runs past the band. Move this slide's title box into the band.
import re, zipfile, shutil, os

EMU = 914400
src, tmp = "candidate.pptx", "candidate.tmp.pptx"
with zipfile.ZipFile(src) as z:
    items = [(i, z.read(i.filename)) for i in z.infolist()]
out = []
for info, data in items:
    if info.filename == "ppt/slides/slide1.xml":
        s = data.decode("utf8")
        i = s.index('type="title"'); a = s.rfind("<p:sp>", 0, i); b = s.index("</p:sp>", i)
        sp = s[a:b]
        sp = re.sub(r'<a:off x="\d+" y="\d+"/><a:ext cx="\d+" cy="\d+"/>',
                    '<a:off x="0" y="%d"/><a:ext cx="%d" cy="%d"/>' % (round(0.43 * EMU), round(13.333 * EMU), round(0.89 * EMU)), sp, count=1)
        sp = re.sub(r'<a:bodyPr[^>]*>', '<a:bodyPr wrap="square" lIns="0" tIns="0" rIns="%d" bIns="0" rtlCol="0" anchor="ctr">' % round(0.2 * EMU), sp, count=1)
        # the text starts 0.36 in from the slide edge, as on the deck's slides: a paragraph margin (the box itself stays at x 0)
        sp = sp.replace('<a:pPr algn="l" indent="0" marL="0">', '<a:pPr algn="l" indent="0" marL="%d">' % round(0.36 * EMU), 1)
        s = s[:a] + sp + s[b:]
        # the deck sets its "Sources:" line in italics
        j = s.find("Sources:")
        if j > 0:
            a = s.rfind("<p:sp>", 0, j); b = s.index("</p:sp>", j)
            s = s[:a] + s[a:b].replace('<a:rPr lang="en-US"', '<a:rPr lang="en-US" i="1"') + s[b:]
        data = s.encode("utf8")
    out.append((info, data))
with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
    for info, data in out:
        z.writestr(info, data)
shutil.move(tmp, src)
