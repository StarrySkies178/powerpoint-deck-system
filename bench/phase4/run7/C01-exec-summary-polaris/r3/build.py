# build.py: two touches pptxgenjs cannot make (runs after build.js in this folder).
# 1. Page number from the prompt: the master number field counts from firstSlideNum.
# 2. The funnel over the goal bar narrows to the bar's width: trapezoid inset set in its own adj value.
import re, zipfile, shutil, os
src, tmp = "candidate.pptx", "candidate.tmp.pptx"
zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED)
for it in zin.infolist():
    d = zin.read(it.filename)
    if it.filename == "ppt/presentation.xml":
        s = d.decode("utf8")
        if "firstSlideNum" not in s:
            s = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="2"', s, count=1)
        d = s.encode("utf8")
    elif re.match(r"ppt/slides/slide\d+\.xml$", it.filename):
        s = d.decode("utf8")
        def fix(m):
            sp = m.group(0)
            ext = re.search(r'<a:ext cx="(\d+)" cy="(\d+)"', sp)
            cx, cy = int(ext.group(1)), int(ext.group(2))
            inset = cx * 0.1                       # bar is 80% of the funnel's top width
            adj = int(inset / min(cx, cy) * 100000)
            return re.sub(r'<a:prstGeom prst="trapezoid">\s*<a:avLst\s*(?:/>|></a:avLst>)', f'<a:prstGeom prst="trapezoid"><a:avLst><a:gd name="adj" fmla="val {adj}"/></a:avLst>', sp)
        s = re.sub(r"<p:sp>(?:(?!</p:sp>).)*?prst=\"trapezoid\".*?</p:sp>", fix, s, flags=re.S)
        d = s.encode("utf8")
    zout.writestr(it, d)
zout.close(); zin.close()
shutil.move(tmp, src)
