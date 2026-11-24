# C04 rebuild 3, post-step on candidate.pptx (runs after build.js, in this folder).
# Three things the generated master does not match on the deck's analysis slides (seen on the renders of its other slides):
#  1. title text starts ~0.37 in from the slide edge (a paragraph indent; the box stays at the profile's x 0) and its two lines
#     sit close (about 90% line spacing), so both fit the band;
#  2. the profile's "title rule" (a navy line at 1.74 in from x 4.6 in) is the panel underline of some slides, not a frame
#     element: the panels here draw their own underlines, so the stray master line is removed;
#  3. the page number is navy and bold.
import re, zipfile, shutil, os

SRC = "candidate.pptx"
TMP = "candidate.tmp.pptx"
EMU = 914400

def fix_title(xml):
    def one(m):
        sp = m.group(0)
        if 'type="title"' not in sp:
            return sp
        sp = re.sub(r'<a:ext cx="\d+"', '<a:ext cx="%d"' % int(13.2 * EMU), sp, count=1)
        sp = re.sub(r'<a:pPr([^>]*)>', lambda m: '<a:pPr%s><a:lnSpc><a:spcPct val="90000"/></a:lnSpc>' % m.group(1).replace('marL="0"', 'marL="%d"' % int(0.36 * EMU)), sp)
        return sp
    return re.sub(r'<p:sp>.*?</p:sp>', one, xml, flags=re.S)

def fix_layout(xml):
    def one(m):
        sp = m.group(0)
        if 'prst="line"' in sp and 'y="%d"' % 1591056 in sp:
            return ""
        if 'type="sldNum"' in sp:
            sp = sp.replace('<a:srgbClr val="585858"/>', '<a:srgbClr val="10366C"/>')
            sp = re.sub(r'<a:rPr([^>]*?)(/?)>', lambda r: '<a:rPr%s b="1"%s>' % (r.group(1).replace(' b="0"', ''), r.group(2)) if ' b="1"' not in r.group(1) else r.group(0), sp)
            sp = re.sub(r'<a:defRPr([^>]*?)(/?)>', lambda r: '<a:defRPr%s b="1"%s>' % (r.group(1), r.group(2)) if ' b="' not in r.group(1) else r.group(0), sp)
        return sp
    return re.sub(r'<p:sp>.*?</p:sp>', one, xml, flags=re.S)

with zipfile.ZipFile(SRC) as zin, zipfile.ZipFile(TMP, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if re.match(r"ppt/slides/slide\d+\.xml$", item.filename):
            data = fix_layout(fix_title(data.decode("utf8"))).encode("utf8")
        elif re.match(r"ppt/slide(Layouts/slideLayout|Masters/slideMaster)\d+\.xml$", item.filename):
            data = fix_layout(data.decode("utf8")).encode("utf8")
        zout.writestr(item, data)
shutil.move(TMP, SRC)
print("build.py: title inset and spacing, stray master rule removed, page number styled")
