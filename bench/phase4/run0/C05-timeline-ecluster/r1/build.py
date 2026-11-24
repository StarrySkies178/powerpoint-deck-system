# Post-process of candidate.pptx (runs after build.js, cwd = this folder).
# 1. Title: the deck's title text sits ~0.35 in in from the band's left edge, and a one-line title is centred
#    in the navy band (as on the deck's one-line titles, E-Cluster 19, 22, 23). The profile gives the box at x 0
#    with no inset, so the inset and the anchor are set here.
# 2. Page number: the prompt says page 12; the slide-number field shows 12 when the deck numbering starts at 12.
import re, zipfile, shutil, os

src = "candidate.pptx"
tmp = "candidate.tmp.pptx"
EMU = 914400
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            if "firstSlideNum" not in x:
                x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1)
            data = x.encode("utf8")
        if re.fullmatch(r"ppt/(slideLayouts/slideLayout|slides/slide)\d+\.xml", item.filename):
            x = data.decode("utf8")
            # the title placeholder (layout and slide copy): band-high box, inset 0.35 in, anchored in the middle
            def fix(m):
                sp = m.group(0)
                if 'type="title"' not in sp:
                    return sp
                sp = re.sub(r'<a:off x="\d+" y="\d+"/><a:ext cx="(\d+)" cy="\d+"/>',
                            lambda k: f'<a:off x="0" y="{int(0.43 * EMU)}"/><a:ext cx="{k.group(1)}" cy="{int(0.89 * EMU)}"/>', sp, count=1)
                sp = re.sub(r'<a:bodyPr([^>]*?)(/?)>', lambda k: '<a:bodyPr' + re.sub(r'\s(lIns|anchor)="[^"]*"', '', k.group(1))
                            + f' lIns="{int(0.35 * EMU)}" anchor="ctr"' + k.group(2) + '>', sp, count=1)
                return sp
            x = re.sub(r"<p:sp>.*?</p:sp>", fix, x, flags=re.S)
            # the profile's "title rule" at y 1.74 in (x 4.6 in) is a panel sub-head rule of single slides, not a frame element: drop it
            x = re.sub(r'<p:sp><p:nvSpPr><p:cNvPr id="\d+" name="Shape \d+"></p:cNvPr><p:cNvSpPr/><p:nvPr></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="4206240" y="1591056"/>.*?</p:sp>', "", x, flags=re.S)
            # title band as the deck renders it (202C4E; the profile's 08163B renders darker than every slide of the deck)
            x = re.sub(r'(<a:off x="0" y="393192"/><a:ext cx="\d+" cy="\d+"/></a:xfrm><a:prstGeom prst="rect"><a:avLst></a:avLst></a:prstGeom><a:solidFill>)<a:schemeClr val="accent1"/>', r'\1<a:srgbClr val="202C4E"/>', x)
            # page number bold navy, as on the deck's slides
            x = re.sub(r'(type="sldNum".*?<a:defRPr sz="1000")(><a:solidFill>)<a:srgbClr val="585858"/>', r'\1 b="1"\2<a:srgbClr val="202C4F"/>', x, flags=re.S)
            # page number: the prompt's page 12 as plain text in the slide-number box
            x = re.sub(r'<a:fld [^>]*type="slidenum">\s*(<a:rPr[^>]*/>)\s*<a:t>[^<]*</a:t>\s*</a:fld>', r'<a:r>\1<a:t>12</a:t></a:r>', x)
            # round bullets in the deck's navy, a little smaller than the text (E-Cluster 16)
            x = x.replace('<a:buSzPct val="100000"/><a:buChar', '<a:buClr><a:srgbClr val="10366C"/></a:buClr><a:buSzPct val="80000"/><a:buChar')
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
