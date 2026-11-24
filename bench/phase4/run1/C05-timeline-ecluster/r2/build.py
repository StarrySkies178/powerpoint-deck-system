# Post-step for build.js (runs in this folder).
# 1. The deck's logo top right (gear + wordmark), taken from the stored media of the deck's other content slides
#    (case19-ecluster-022 carries both pictures and their positions).
# 2. The title sits inset in its navy band and, when it is one line, centred in the band (as on the deck's one-line
#    appendix-table titles).
# 3. Page number 12 (prompt): the layout's slide-number field becomes the page text, firstSlideNum set too.
# 4. The profile's "title rule" (a sub-headline rule at y 1.74 measured from the deck's panel slides) is drawn on the
#    layout of every slide; this slide has no panel heading there, so it is taken off this candidate's layout.
import re, io, os, gzip, json, zipfile, shutil
from pptx import Presentation
from pptx.util import Emu

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../../.."))
SRC = os.path.join(HERE, "candidate.pptx")
EMU = 914400

# ---- 1. logo ----
obj = None
with gzip.open(os.path.join(ROOT, "Objects/store/case19-ecluster.jsonl.gz"), "rt", encoding="utf-8") as f:
    for line in f:
        o = json.loads(line)
        if o["id"] == "case19-ecluster-022":
            obj = o
            break
pics = []
for m in re.finditer(r"<p:pic>.*?</p:pic>", obj["xml"], re.S):
    p = m.group(0)
    name = re.search(r'r:embed="MEDIA:([^"]+)"', p).group(1)
    x, y, cx, cy = map(int, re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/><a:ext cx="(\d+)" cy="(\d+)"', p).groups())
    pics.append((name, x, y, cx, cy))
media = zipfile.ZipFile(os.path.join(ROOT, "Objects/store/media.zip"))
names = media.namelist()
prs = Presentation(SRC)
s = prs.slides[0]
for name, x, y, cx, cy in pics:
    data = media.read(next(n for n in names if n.endswith(name)))
    pic = s.shapes.add_picture(io.BytesIO(data), Emu(x), Emu(y), Emu(cx), Emu(cy))
    pic.name = "logo " + name
prs.save(SRC)

# ---- 2-4. XML edits ----
def page12(x):   # slide-number field -> the page text "12" (LibreOffice ignores firstSlideNum)
    x = re.sub(r'(<a:fld[^>]*type="slidenum"[^>]*>.*?<a:t>)[^<]*(</a:t>)', r"\g<1>12\2", x, flags=re.S)
    x = re.sub(r'<a:fld[^>]*type="slidenum"[^>]*>(.*?)</a:fld>', r"<a:r>\1</a:r>", x, flags=re.S)
    # the deck's page number is bold, in the panel-heading navy (renders of its other slides)
    return re.sub(r'<a:r><a:rPr b="0" lang="en-US"/><a:t>12</a:t></a:r>',
                  '<a:r><a:rPr b="1" lang="en-US"><a:solidFill><a:srgbClr val="10366C"/></a:solidFill></a:rPr><a:t>12</a:t></a:r>', x)

tmp = SRC + ".tmp"
with zipfile.ZipFile(SRC) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        n = item.filename
        if n == "ppt/presentation.xml":
            x = data.decode("utf-8")
            if "firstSlideNum" not in x:
                x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1)
            data = x.encode("utf-8")
        elif n == "ppt/slides/slide1.xml":
            x = data.decode("utf-8")
            def fix(m):
                sp = m.group(0)
                if 'type="title"' not in sp:
                    return sp
                box = (f'<p:spPr><a:xfrm><a:off x="0" y="{int(0.43 * EMU)}"/><a:ext cx="{int(13.32 * EMU)}" cy="{int(0.89 * EMU)}"/></a:xfrm>'
                       '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>')
                sp = re.sub(r"<p:spPr\s*/>|<p:spPr>.*?</p:spPr>", box, sp, count=1, flags=re.S)
                # the box starts at x 0 with no inset (profile); the text is indented 0.35 in by the paragraph, as rendered
                body = f'<a:bodyPr lIns="{int(0.01 * EMU)}" tIns="0" rIns="{int(0.2 * EMU)}" bIns="0" anchor="ctr"><a:normAutofit/></a:bodyPr>'
                sp = re.sub(r"<a:bodyPr[^>]*/>|<a:bodyPr[^>]*>.*?</a:bodyPr>", body, sp, count=1, flags=re.S)
                sp = sp.replace('indent="0" marL="0"', f'indent="0" marL="{int(0.35 * EMU)}"')
                return sp
            x = re.sub(r"<p:sp>.*?</p:sp>", fix, x, flags=re.S)
            x = page12(x)
            data = x.encode("utf-8")
        elif re.match(r"ppt/slideLayouts/slideLayout\d+\.xml$", n):
            x = data.decode("utf-8")
            if "04 Title only" in x:
                x = page12(x)
                # title band: the deck's slides render it 202C4F (the profile's 08163B is darker than every render)
                x = re.sub(r'(<a:off x="0" y="393192"/>.*?<a:solidFill>)<a:schemeClr val="accent1"/>(</a:solidFill>)', r'\1<a:srgbClr val="202C4F"/>\2', x, count=1, flags=re.S)
                y174 = int(1.74 * EMU)
                def drop_rule(m):
                    sp = m.group(0)
                    return "" if re.search(r'<p:cxnSp|prst="line"', sp) and re.search(rf'<a:off x="\d+" y="{y174 - 2}"|<a:off x="\d+" y="{y174}"|<a:off x="\d+" y="{y174 + 1}"|<a:off x="\d+" y="{y174 - 1}"', sp) else sp
                x = re.sub(r"<p:sp>.*?</p:sp>|<p:cxnSp>.*?</p:cxnSp>", drop_rule, x, flags=re.S)
            data = x.encode("utf-8")
        zout.writestr(item, data)
shutil.move(tmp, SRC)
