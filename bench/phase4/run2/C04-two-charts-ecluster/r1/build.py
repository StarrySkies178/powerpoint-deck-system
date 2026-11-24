# Post-process of this build's own candidate.pptx (runs after build.js, in this folder):
# 1. the title text sits inside the navy band with the deck's own paragraph indents (left 0.35 in, right 0.62 in) and top
#    inset; the profile carries the box (x 0, y 0.45, 13.33 x 0.86 in) but not the indents, so the text started at the slide edge;
# 2. the "rule" the profile carries at y 1.74 in (a panel headline rule, measured as a title rule) is taken off this
#    candidate's layout: the panel headlines draw their own rules;
# 3. the page number is bold dark blue, as on the deck's other slides.
import zipfile, shutil, re, os
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
EMU = 914400
zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED)
for it in zin.infolist():
    data = zin.read(it.filename)
    if re.match(r"ppt/slideLayouts/slideLayout\d+\.xml$", it.filename):
        x = data.decode("utf8")
        if 'name="04 Title only"' in x:
            x = re.sub(r'<p:sp><p:nvSpPr><p:cNvPr id="\d+" name="[^"]*"></p:cNvPr><p:cNvSpPr/><p:nvPr></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="\d+" y="1591056"/>.*?</p:sp>', "", x, flags=re.S)
            # page number: bold, in the deck's dark blue (other slides' renders), not the profile's grey
            x = re.sub(r'(<p:ph type="sldNum"[\s\S]*?<a:defRPr sz="1000")(><a:solidFill><a:srgbClr val=")585858', r'\1 b="1"\g<2>202C4F', x, count=1)
            data = x.encode("utf8")
    if it.filename == "ppt/slides/slide1.xml":
        x = data.decode("utf8")
        def fix(m):
            sp = m.group(0)
            if 'type="title"' not in sp: return sp
            sp = re.sub(r'<a:off x="\d+" y="\d+"/><a:ext cx="\d+" cy="\d+"/>', f'<a:off x="0" y="{int(0.45*EMU)}"/><a:ext cx="{int(13.33*EMU)}" cy="{int(0.86*EMU)}"/>', sp, count=1)
            sp = re.sub(r'lIns="0" tIns="0" rIns="0" bIns="0"', 'lIns="0" tIns="12700" rIns="0" bIns="0"', sp, count=1)
            sp = sp.replace('<a:pPr algn="l" indent="0" marL="0">', '<a:pPr algn="l" indent="0" marL="318135" marR="569595">', 1)   # the deck's own title indents
            return sp
        x = re.sub(r"<p:sp>.*?</p:sp>", fix, x, flags=re.S)
        x = re.sub(r'(<p:ph type="sldNum"[\s\S]*?<a:defRPr sz="1000")(><a:solidFill><a:srgbClr val=")585858', r'\1 b="1"\g<2>202C4F', x, count=1)
        data = x.encode("utf8")
    zout.writestr(it, data)
zout.close(); zin.close()
shutil.move(tmp, src)
print("post-processed", src)
