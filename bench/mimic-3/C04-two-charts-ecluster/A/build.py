"""C04 mimic, build A: place the slide's stored objects (case19-ecluster-004, -004p2, -004p3, -004p4)
into candidate.pptx written by build.js, at their source positions and in their original colours.
Run with A/ as working directory, after build.js."""
import copy, os, re, sys, zipfile
from lxml import etree

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O

STORE = os.path.join(ROOT, "Objects/store")
OUT = os.path.abspath("candidate.pptx")
EMU = 914400


def subset(obj, keep):
    """Keep only the chosen top-level elements of a stored object (bbox unchanged, so it still places 1:1)."""
    o = copy.deepcopy(obj); f = O._frag(o)
    for i, el in reversed(list(enumerate(list(f)))):
        if i not in keep: f.remove(el)
    o["id"] = obj["id"] + "[" + ",".join(map(str, sorted(keep))) + "]"
    return O._store(o, f)


def paint(obj, idx, hexcol):
    """Give element idx an explicit colour (for a colour the theme roles lost, e.g. the red ring)."""
    o = copy.deepcopy(obj); f = O._frag(o); el = list(f)[idx]
    for c in list(el.iter(O.A + "schemeClr")):
        n = etree.Element(O.A + "srgbClr", val=hexcol); c.getparent().replace(c, n)
    return O._store(o, f)


def place_1to1(obj, **kw):
    X, Y, W, H = [v / EMU for v in obj["bbox"]]
    r = O.place(OUT, 1, obj, (X, Y, W, H), STORE, colours="original", **kw)
    print("placed", obj["id"], "warnings:", r["warnings"])


def fix_package():
    """Post-fixes on this candidate only (no framework file is touched)."""
    z = zipfile.ZipFile(OUT); files = {n: z.read(n) for n in z.namelist()}; z.close()
    # 1. layout: band in the original's navy, drop the layout's stray heading rule (the panels draw their own)
    lay = files["ppt/slideLayouts/slideLayout5.xml"].decode()
    lay = re.sub(r'<p:sp><p:nvSpPr><p:cNvPr id="\d+" name="Shape 1">.*?</p:sp>', "", lay, count=1, flags=re.S)
    lay = re.sub(r'(name="Shape 0">.*?<a:solidFill>)<a:schemeClr val="accent1"/>', r'\1<a:srgbClr val="202C4F"/>', lay, count=1, flags=re.S)
    files["ppt/slideLayouts/slideLayout5.xml"] = lay.encode()
    # 2. slide: title box where the original sets it; source line italic as in the original
    sl = etree.fromstring(files["ppt/slides/slide1.xml"])
    for sp in sl.iter(O.P + "sp"):
        ph = sp.find("p:nvSpPr/p:nvPr/p:ph", O.NS)
        if ph is not None and ph.get("type") == "title":
            O._set_xfrm(sp, 0, int(0.47 * EMU), int(13.1 * EMU), int(0.85 * EMU))   # box at the style's x = 0,
            sp.find("p:txBody/a:bodyPr", O.NS).set("lIns", str(int(0.35 * EMU)))   # text inset 0.35 in, as drawn
        if ph is not None and ph.get("type") == "body":
            O._set_xfrm(sp, int(0.29 * EMU), int(7.3 * EMU), int(9.0 * EMU), int(0.19 * EMU))
            for r in sp.iter(O.A + "rPr"): r.set("i", "1")
        if ph is not None and ph.get("type") == "sldNum":          # page number bold in the navy, as in the original
            for r in list(sp.iter(O.A + "rPr")):
                r.set("b", "1"); sf = etree.SubElement(r, O.A + "solidFill"); etree.SubElement(sf, O.A + "srgbClr", val="202C4F")
        if ph is None and O._text(sp).startswith("Market Overview"):   # breadcrumb: arrows as the original draws them
            O._set_xfrm(sp, int(0.32 * EMU), *[int(v) for v in O._xfrm(sp)[1:]])
            arrows = [r for r in sp.iter(O.A + "r") if r.find("a:t", O.NS).text.strip() == "\u2192"]
            for k, r in enumerate(arrows):
                rp = r.find("a:rPr", O.NS); rp.set("b", "0")
                rp.find("a:solidFill/a:srgbClr", O.NS).set("val", "202C4F" if k == 0 else "BEBEBE")
        # 3. two-word labels of the placed objects: place() sets them to no-wrap; the original wraps them
        #    in their own box ("Fine / jewelry"), so give back the source's square wrap
        if ph is None and sp.find("p:txBody", O.NS) is not None and not O._filled(sp):
            t = O._text(sp)
            if " " in t.strip() and len(t.split()) <= 3:
                sp.find("p:txBody/a:bodyPr", O.NS).set("wrap", "square")
    files["ppt/slides/slide1.xml"] = etree.tostring(sl, xml_declaration=True, encoding="UTF-8", standalone=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zo:
        for n, d in files.items(): zo.writestr(n, d)


if __name__ == "__main__":
    full = O.get(STORE, "case19-ecluster-004")
    p2 = O.get(STORE, "case19-ecluster-004p2")
    p3 = O.get(STORE, "case19-ecluster-004p3")
    p4 = O.get(STORE, "case19-ecluster-004p4")
    # panel 1 exhibit: stacked columns, labels, CAGR rows, ring (stored in the main colour: back to the original red)
    place_1to1(paint(p2, 6, "CC0000"))
    # panel 2, right exhibit: 100% column with leader lines
    place_1to1(p3)
    # panel 3: constraint cards with their icons
    place_1to1(p4)
    # the rest of the slide from the whole-slide object: logo, number chips, panel headings, exhibit titles,
    # 998 / 5% / 7%, chart-1 axis labels + panel-3 heading, the 2013/2018 revenue columns with their CAGR arrow
    keep = {1, 3, 4, 5, 10, 11, 12, 13, 14, 18, 23, 29, 30, 32, 36, 37, 38, 39, 40, 41, 42}
    # element 30 (slot 24) holds the axis labels (tab stops, drawn natively in build.js) and the panel-3 heading:
    # blank the first paragraph, the heading is passed unchanged (set_texts keeps its runs)
    texts = [None] * 32
    texts[24] = ["", "Major constraints limit the further development of fine jewelry"]
    rest = subset(O.set_texts(full, texts), keep)
    place_1to1(rest)
    fix_package()
    print("written", OUT)
