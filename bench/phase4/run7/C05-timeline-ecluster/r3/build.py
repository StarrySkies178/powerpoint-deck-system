# Runs after build.js (working directory = this folder). Two touches the generators cannot express:
#  1. Page number: the prompt says page 12. The deck's numbering starts at 12 (presentation.xml firstSlideNum, read by
#     PowerPoint) and the slide's page-number field (and its layout's) is written as the plain number 12, because
#     LibreOffice ignores firstSlideNum and would print 1.
#  3. The source line is italic, as on the deck's content slides.
#  2. Title: the deck's titles sit inside the navy band with the text about 0.35 in from the slide edge, and a
#     one-line title is centred in the band (E-Cluster appendix slides 22-24 in the renders). The title box takes
#     the band's box, a 0.34 in paragraph indent (the box edge stays at 0, as the profile measures it) and middle anchoring.
import os, re, shutil, tempfile, zipfile

EMU = 914400
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "candidate.pptx")

with zipfile.ZipFile(src) as z:
    rels = z.read("ppt/slides/_rels/slide1.xml.rels").decode("utf8")
layout = "ppt/slideLayouts/" + re.search(r'Target="\.\./slideLayouts/([^"]+)"', rels).group(1)

def fix_title(xml):
    i = xml.find('type="title"')
    a = xml.rfind("<p:sp>", 0, i); b = xml.find("</p:sp>", i)
    sp = xml[a:b]
    sp = re.sub(r'<a:off x="\d+" y="\d+"/><a:ext cx="\d+" cy="\d+"/>',
                '<a:off x="0" y="%d"/><a:ext cx="%d" cy="%d"/>' % (round(0.43 * EMU), round(13.32 * EMU), round(0.89 * EMU)), sp, count=1)
    sp = re.sub(r'<a:pPr ([^>]*?)marL="\d+"', lambda m: '<a:pPr %smarL="%d"' % (m.group(1), round(0.34 * EMU)), sp, count=1)
    sp = re.sub(r'(<a:bodyPr [^>]*?)anchor="\w+"', r'\1anchor="ctr"', sp, count=1)
    return xml[:a] + sp + xml[b:]

tmp = tempfile.mktemp(suffix=".pptx")
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            xml = re.sub(r'\sfirstSlideNum="\d+"', "", data.decode("utf8"))
            data = xml.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1).encode("utf8")
        elif item.filename in (layout, "ppt/slides/slide1.xml"):
            xml = data.decode("utf8")
            xml = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>[^<]*</a:t></a:fld>', r'<a:r>\1<a:t>12</a:t></a:r>', xml)
            if item.filename.endswith("slide1.xml"):
                xml = fix_title(xml)
                # the deck's source line is italic
                xml = re.sub(r'<a:rPr ([^>]*)>((?:(?!</a:r>).)*?<a:t>Sources:)', lambda m: '<a:rPr i="1" %s>%s' % (m.group(1), m.group(2)), xml, count=1, flags=re.S)
            data = xml.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
