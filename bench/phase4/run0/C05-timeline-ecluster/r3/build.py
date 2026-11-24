# Post-process of candidate.pptx (runs after build.js, working directory = this folder):
# 1. the title sits in the band as the deck's titles do: box over the whole band, text centred vertically,
#    starting ~0.36 in from the slide edge as in the deck's renders (box at x = 0 as the profile measures it, text pushed in by a paragraph margin);
# 2. the master's measured "rule" (x 4.6 in, y 1.74 in: a panel-heading underline the profile took for a title rule)
#    is dropped from this file's layout, since this slide has no panel heading there;
# 3. the page number reads 12 (the deck's page number for this slide): the slide-number field counts from 12.
import re, shutil, zipfile, os

SRC = "candidate.pptx"
TMP = "candidate.tmp.pptx"
EMU = 914400

def fix_slide(x):
    def title(m):
        sp = m.group(0)
        sp = re.sub(r'<a:off x="\d+" y="\d+"/><a:ext cx="\d+" cy="\d+"/>',
                    '<a:off x="0" y="%d"/><a:ext cx="%d" cy="%d"/>' % (int(0.43 * EMU), int(13.32 * EMU), int(0.89 * EMU)), sp, count=1)
        sp = re.sub(r'<a:bodyPr[^>]*>', '<a:bodyPr wrap="square" lIns="0" tIns="0" rIns="%d" bIns="0" rtlCol="0" anchor="ctr">'
                    % int(0.3 * EMU), sp, count=1)
        sp = sp.replace('<a:pPr algn="l" indent="0" marL="0">', '<a:pPr algn="l" indent="0" marL="%d">' % int(0.33 * EMU))
        return sp
    x = re.sub(r'<p:sp>(?:(?!</p:sp>).)*?type="title"(?:(?!</p:sp>).)*</p:sp>', title, x, count=1, flags=re.S)
    # LibreOffice ignores firstSlideNum, so the slide's own number field is written as the page number
    return re.sub(r'<a:fld [^>]*type="slidenum">(<a:rPr[^>]*/>)<a:t>[^<]*</a:t></a:fld>', r'<a:r>\1<a:t>12</a:t></a:r>', x)

with zipfile.ZipFile(SRC) as zin, zipfile.ZipFile(TMP, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/slides/slide1.xml":
            data = fix_slide(data.decode("utf-8")).encode("utf-8")
        elif item.filename.startswith("ppt/slideLayouts/slideLayout") and item.filename.endswith(".xml"):
            x = data.decode("utf-8")
            x = re.sub(r'<p:(sp|cxnSp)>(?:(?!</p:\1>).)*?<a:off x="\d+" y="1591056"/>(?:(?!</p:\1>).)*</p:\1>', "", x, flags=re.S)
            data = x.encode("utf-8")
        elif item.filename == "ppt/presentation.xml":
            x = data.decode("utf-8")
            if "firstSlideNum" not in x:
                x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1)
            data = x.encode("utf-8")
        zout.writestr(item, data)
shutil.move(TMP, SRC)
