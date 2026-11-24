# Post-processing of candidate.pptx (runs after build.js, in this folder):
# 1. page number 12 (prompt): static "12" in the slide-number box, and firstSlideNum=12 for PowerPoint;
# 2. title text indented to the deck's left text edge (~0.35 in on every rendered slide of the deck, level with the
#    breadcrumb) and a one-line title centred in the title band, as the deck's one-line titles are (slides 19, 22-24).
import zipfile, shutil, re
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
EMU = 914400
def fix_slide(x):
    x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>12</a:t></a:r>', x)
    i = x.find('type="title"'); j = x.find("</p:sp>", i)
    sp = x[i:j]
    sp = re.sub(r'<a:off x="\d+" y="\d+"/><a:ext cx="\d+" cy="\d+"/>',
                '<a:off x="0" y="%d"/><a:ext cx="%d" cy="%d"/>' % (round(0.43 * EMU), round(13.32 * EMU), round(0.89 * EMU)), sp, count=1)
    sp = re.sub(r'marL="0"', 'marL="%d"' % round(0.34 * EMU), sp, count=1)   # box stays at x 0 like the profile's; the text starts 0.34 in in
    sp = re.sub(r'rIns="\d+"', 'rIns="%d"' % round(0.3 * EMU), sp, count=1)
    sp = re.sub(r'anchor="t"', 'anchor="ctr"', sp, count=1)
    return x[:i] + sp + x[j:]
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        d = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = re.sub(r'\sfirstSlideNum="\d+"', "", d.decode("utf-8"))
            d = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1).encode("utf-8")
        elif it.filename == "ppt/slides/slide1.xml":
            d = fix_slide(d.decode("utf-8")).encode("utf-8")
        zo.writestr(it, d)
shutil.move(tmp, src)
