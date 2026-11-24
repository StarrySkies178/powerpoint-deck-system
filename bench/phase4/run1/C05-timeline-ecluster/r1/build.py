# Post-process of candidate.pptx (runs after build.js, working directory = this folder).
# Three frame details the E-Cluster style profile does not carry:
#  1. the title text sits ~0.34 in inside the full-width band (the profile keeps x = 0 and the master sets lIns = 0),
#     and a one-line title is centred in the band, as on the deck's one-line title slides;
#  2. the band is drawn in the colour the deck renders (#202C4E), not the darker profile value (#08163B);
#  3. the slide carries page number 12 (firstSlideNum, and the field replaced by a text box in build.js).
import re, shutil, zipfile, os

SRC = "candidate.pptx"
TMP = "candidate.tmp.pptx"
EMU = 914400

def fix_slide(xml):
    # title placeholder: move to the band, inset the text, centre it vertically
    def sp(m):
        s = m.group(0)
        if 'type="title"' not in s:
            return s
        s = re.sub(r'<a:off x="\d+" y="\d+"/><a:ext cx="\d+" cy="\d+"/>',
                   '<a:off x="0" y="%d"/><a:ext cx="%d" cy="%d"/>' % (int(0.43 * EMU), int(13.32 * EMU), int(0.89 * EMU)), s, count=1)
        s = re.sub(r'<a:bodyPr[^>]*>', '<a:bodyPr wrap="square" lIns="0" tIns="0" rIns="%d" bIns="0" rtlCol="0" anchor="ctr">'
                   % int(0.3 * EMU), s, count=1)
        # the text inset as a paragraph indent (the deck's title box sits at x = 0 with no inset, its text 0.34 in in)
        s = s.replace('<a:pPr algn="l" indent="0" marL="0">', '<a:pPr algn="l" indent="0" marL="%d">' % int(0.34 * EMU))
        return s
    return re.sub(r'<p:sp>.*?</p:sp>', sp, xml, flags=re.S)

def fix_layout(xml):
    # the band: the full-width rectangle at y = 0.43 in
    def sp(m):
        s = m.group(0)
        if '<a:off x="0" y="%d"/>' % int(0.43 * EMU) in s or re.search(r'<a:off x="0" y="39\d{4}"/>', s):
            s = re.sub(r'<a:solidFill>\s*<a:(?:schemeClr|srgbClr) val="[^"]+"\s*/>\s*</a:solidFill>',
                       '<a:solidFill><a:srgbClr val="202C4E"/></a:solidFill>', s, count=1)
        return s
    return re.sub(r'<p:sp>.*?</p:sp>', sp, xml, flags=re.S)

def drop_sldnum(xml):
    # LibreOffice redraws a slide-number field from the slide index (1 here) whatever firstSlideNum says, so the field goes
    # and build.js writes the page number (12) as text in the deck's page-number style
    return re.sub(r'<p:sp>(?:(?!</p:sp>).)*?type="sldNum".*?</p:sp>', '', xml, flags=re.S)

with zipfile.ZipFile(SRC) as zin, zipfile.ZipFile(TMP, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "ppt/slides/slide1.xml":
            data = fix_slide(data.decode("utf8")).encode("utf8")
        elif re.match(r"ppt/slideLayouts/slideLayout\d+\.xml$", item.filename):
            x = data.decode("utf8")
            if 'name="04 Title only"' in x or "04 Title only" in x:
                x = fix_layout(x)
                # page number: LibreOffice ignores firstSlideNum, so the one-slide candidate carries the number as text
                x = drop_sldnum(x)
                data = x.encode("utf8")
        elif re.match(r"ppt/slideMasters/slideMaster\d+\.xml$", item.filename):
            data = drop_sldnum(data.decode("utf8")).encode("utf8")
        elif item.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            if "firstSlideNum" not in x:
                x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="12"', x, count=1)
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(TMP, SRC)
print("post-processed", SRC)
