# Post-pass on candidate.pptx (runs after build.js, working directory = this folder).
# Three frame details the deck shows on its other slides that the style profile does not carry:
#  1. the title band is the main colour at ~90% opacity (renders as 202C4E on white, profile band 08163B solid);
#  2. the title text starts ~0.35 in from the band's left edge (the layout's title has none): a paragraph indent;
#  3. the page number: the prompt says page 12. build.js writes "12" in the deck's page-number look; the layout's
#     slide-number field is removed so it does not show "1" beside it (firstSlideNum=12 kept for PowerPoint).
import re, shutil, zipfile, os

SRC = "candidate.pptx"
TMP = "candidate.tmp.pptx"

def fix(name, data):
    s = data.decode("utf-8")
    if name.startswith("ppt/slideLayouts/") and 'name="04 Title only"' in s:
        # band = first rect filled with accent1 at y=393192
        s = re.sub(r'(<a:off x="0" y="393192"/><a:ext cx="\d+" cy="813816"/></a:xfrm><a:prstGeom prst="rect"><a:avLst></a:avLst></a:prstGeom><a:solidFill><a:schemeClr val="accent1")/>',
                   r'\1><a:alpha val="90000"/></a:schemeClr>', s, count=1)
        s = re.sub(r'<p:sp>\s*<p:nvSpPr>\s*<p:cNvPr id="\d+" name="Slide Number Placeholder 0"/>.*?</p:sp>', '', s, count=1, flags=re.S)
    if name.startswith("ppt/slides/slide") and name.endswith(".xml"):
        # paragraph indent, not a box inset: the profile records the title box edge at 0.00 in (deck_lint checks it)
        s = re.sub(r'(type="title"[^>]*/></p:nvPr></p:nvSpPr>.*?<a:pPr algn="l" indent="0") marL="0"', r'\1 marL="320040"', s, count=1, flags=re.S)
    if name == "ppt/presentation.xml" and "firstSlideNum" not in s:
        s = s.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1)
    return s.encode("utf-8")

with zipfile.ZipFile(SRC) as zin, zipfile.ZipFile(TMP, "w", zipfile.ZIP_DEFLATED) as zout:
    for it in zin.infolist():
        d = zin.read(it.filename)
        if it.filename.endswith(".xml"):
            d = fix(it.filename, d)
        zout.writestr(it, d)
shutil.move(TMP, SRC)
