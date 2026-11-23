# C04 attempt 1, post-step on candidate.pptx (run with this folder as cwd):
# 1. the title text sits indented in the band as on the deck's other slides (slide 5: marL 0.35 in, marR 0.62 in, 100% line spacing)
# 2. the title box moves up 0.12 in so both lines sit inside the band
# 3. the "title rule" the profile adds at y 1.74 in is not on the deck's T2B1 slides (5, 16): remove it from the layout
import re, zipfile, shutil, os

src, tmp = "candidate.pptx", "candidate.tmp.pptx"
zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data = zin.read(item.filename)
    if re.match(r"ppt/slides/slide\d+\.xml$", item.filename):
        x = data.decode("utf8")
        i = x.find('type="title"')
        if i >= 0:
            # glyph tops at ~0.56 in as on slide 5 (the box at the profile's text_top draws them ~0.12 in lower in the render)
            a = x.find("<a:off ", i); b = x.find("/>", a)
            off = re.search(r'y="(\d+)"', x[a:b]); y = int(off.group(1)) - int(0.12 * 914400)
            x = x[:a] + re.sub(r'y="\d+"', 'y="%d"' % y, x[a:b], count=1) + x[b:]
            j = x.find("<a:pPr", i)
            k = x.find(">", j)
            x = x[:j] + '<a:pPr algn="l" indent="0" marL="318135" marR="569595"><a:lnSpc><a:spcPct val="100000"/></a:lnSpc>' + x[k + 1:]
        data = x.encode("utf8")
    elif re.match(r"ppt/slideLayouts/slideLayout\d+\.xml$", item.filename):
        x = data.decode("utf8")
        # the line shape at y = 1.74 in (1591056 EMU) drawn by the master from the profile's title.rule
        x = re.sub(r"<p:sp>(?:(?!</p:sp>).)*?<a:off x=\"\d+\" y=\"1591056\"/>(?:(?!</p:sp>).)*?prst=\"line\"(?:(?!</p:sp>).)*?</p:sp>", "", x, flags=re.S)
        data = x.encode("utf8")
    zout.writestr(item, data)
zout.close(); zin.close()
shutil.move(tmp, src)
