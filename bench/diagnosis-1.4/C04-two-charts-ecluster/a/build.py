"""C04 (variant a), after build.js: three finishing steps on candidate.pptx (working directory = this build folder).
1. The E-Cluster logo, lifted from a stored object of ANOTHER slide of the deck (case19-ecluster-005, element 1 = the
   logo group top right, which every E-Cluster content slide carries), placed at its own box with its original colours.
2. The E-Cluster profile records a "title rule" at y 1.74 from x 4.6 that is really the rule under panel 2's headline
   of the slide it was measured on; the master draws it on every slide, where it bridges the gap between the two panel
   heads here. It is taken off this candidate's layout (the panel rules are drawn by build.js).
3. The title text in the reference starts ~0.35 in from the slide edge (inside the full-width band); the placeholder from
   the profile has no indent, so the reference's paragraph indents are set on the slide's title."""
import os, re, sys, zipfile, shutil
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
STORE = os.path.join(ROOT, "Objects/store")
cand = os.path.join(HERE, "candidate.pptx")

# 1. logo from the deck's own stored slide object (not the target slide)
src = O.original_colours(O.get(STORE, "case19-ecluster-005"))
logo = O.element(src, 1)
O.place(cand, 1, logo, [v / 914400 for v in logo["bbox"]], STORE, out_path=cand, colours="original")

# 2 + 3: edit the package
EMU = 914400
tmp = cand + ".tmp"
with zipfile.ZipFile(cand) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if re.match(r"ppt/slideLayouts/slideLayout\d+\.xml$", item.filename):
            x = data.decode("utf8")
            x = re.sub(r'<p:sp><p:nvSpPr><p:cNvPr id="\d+" name="[^"]*"></p:cNvPr><p:cNvSpPr/><p:nvPr></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="4206240" y="1591056"/>'
                       r'<a:ext cx="\d+" cy="0"/></a:xfrm><a:prstGeom prst="line">.*?</p:sp>', "", x, flags=re.S)
            data = x.encode("utf8")
        if item.filename == "ppt/slides/slide1.xml":
            x = data.decode("utf8")
            # the reference indents its title paragraph (marL 318135, marR 569595 EMU, insets 0), not the box
            x = re.sub(r'(<p:ph\s+idx="102"\s+type="title"[\s\S]*?<a:pPr algn="l" indent="0") marL="0"', r'\1 marL="318135" marR="569595"', x, count=1)
            # the placeholder box sits at the measured glyph top (0.57 in), so the glyphs land ~0.1 in lower than the
            # reference's and the second line runs past the band: move the box up by the first line's ascent gap
            x = re.sub(r'(<p:ph\s+idx="102"\s+type="title"[\s\S]*?<a:off x="0" y=")(\d+)"', lambda m: m.group(1) + str(int(m.group(2)) - int(0.09 * EMU)) + '"', x, count=1)
            # the reference's source line is italic (as its note line)
            # page number: bold, in the headline blue, as on the reference's pages
            x = re.sub(r'(type="sldNum"[\s\S]*?<a:defRPr sz="1000")><a:solidFill><a:srgbClr val="585858"/>', r'\1 b="1"><a:solidFill><a:srgbClr val="10366C"/>', x, count=1)
            x = re.sub(r'(<p:ph\s+idx="103"\s+type="body"[\s\S]*?<a:rPr lang="en-US" sz="1000")', r'\1 i="1"', x, count=1)
            data = x.encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, cand)
print("build.py: logo placed, layout rule removed, title indent and position set, source italic, page number bold")
