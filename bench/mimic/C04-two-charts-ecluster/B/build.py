"""C04 mimic, build B: the same stored objects as build A (case19-ecluster-004, -004p2, -004p3, -004p4), refilled with
new content. The exhibits whose data and count changed are drawn by build.js; here the objects' labels, ring, break mark,
CAGR arrow, headings and constraint cards are reused. Run with B/ as working directory, after build.js."""
import copy, os, re, sys, zipfile
from lxml import etree

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O

STORE = os.path.join(ROOT, "Objects/store")
OUT = os.path.abspath("candidate.pptx")
EMU = 914400


def keep_only(obj, keep):
    o = copy.deepcopy(obj); f = O._frag(o)
    for i, el in reversed(list(enumerate(list(f)))):
        if i not in keep: f.remove(el)
    o["id"] = obj["id"] + "[" + ",".join(map(str, sorted(keep))) + "]"
    return O._store(o, f)


def edit(obj, fn):
    """Run fn(list_of_top_level_elements, frag) on a copy of the object and store it back."""
    o = copy.deepcopy(obj); f = O._frag(o); fn(list(f), f); return O._store(o, f)


def refill(el, paras):
    """New text for each paragraph of one text box, keeping EACH paragraph's own formatting
    (objstore.set_texts gives every paragraph the first one's format: a bold card title would make the italic body bold)."""
    ps = el.find("p:txBody", O.NS).findall("a:p", O.NS)
    assert len(ps) == len(paras), (O._text(el), len(ps), paras)
    for p_, s in zip(ps, paras):
        runs = p_.findall("a:r", O.NS)
        for br in p_.findall("a:br", O.NS): p_.remove(br)
        if not runs:
            continue
        runs[0].find("a:t", O.NS).text = s
        for r in runs[1:]: p_.remove(r)


def resize(el, x=None, w=None, align=None, dy=0.0):
    """Widen a refilled label's box (the stored boxes are as tight as the old words); dy moves it down (in)."""
    bx, by, bw, bh = O._xfrm(el)
    O._set_xfrm(el, int(x * EMU) if x is not None else bx, by + int(dy * EMU), int(w * EMU) if w is not None else bw, bh)
    if align:
        for p_ in el.iter(O.A + "p"):
            pp = p_.find("a:pPr", O.NS)
            if pp is None: pp = etree.Element(O.A + "pPr"); p_.insert(0, pp)
            pp.set("algn", align)
            for a in ("indent", "marR"): pp.attrib.pop(a, None)   # a first-line indent sized for the old word breaks the new one


def find_text(els, start):
    return next(e for e in els if O._text(e).replace("  ", " ").startswith(start))


def paint(el, hexcol):
    for c in list(el.iter(O.A + "schemeClr")):
        c.getparent().replace(c, etree.Element(O.A + "srgbClr", val=hexcol))


def place_1to1(obj):
    X, Y, W, H = [v / EMU for v in obj["bbox"]]
    r = O.place(OUT, 1, obj, (X, Y, W, H), STORE, colours="original", scale_text=False)
    print("placed", obj["id"], "warnings:", r["warnings"])


def fix_package():
    """Same post-fixes as build A, on this candidate only."""
    z = zipfile.ZipFile(OUT); files = {n: z.read(n) for n in z.namelist()}; z.close()
    lay = files["ppt/slideLayouts/slideLayout5.xml"].decode()
    lay = re.sub(r'<p:sp><p:nvSpPr><p:cNvPr id="\d+" name="Shape 1">.*?</p:sp>', "", lay, count=1, flags=re.S)
    lay = re.sub(r'(name="Shape 0">.*?<a:solidFill>)<a:schemeClr val="accent1"/>', r'\1<a:srgbClr val="202C4F"/>', lay, count=1, flags=re.S)
    files["ppt/slideLayouts/slideLayout5.xml"] = lay.encode()
    sl = etree.fromstring(files["ppt/slides/slide1.xml"])
    for sp in sl.iter(O.P + "sp"):
        ph = sp.find("p:nvSpPr/p:nvPr/p:ph", O.NS)
        if ph is not None and ph.get("type") == "title":
            O._set_xfrm(sp, 0, int(0.47 * EMU), int(13.1 * EMU), int(0.85 * EMU))
            sp.find("p:txBody/a:bodyPr", O.NS).set("lIns", str(int(0.35 * EMU)))
        if ph is not None and ph.get("type") == "body":
            O._set_xfrm(sp, int(0.29 * EMU), int(7.3 * EMU), int(9.0 * EMU), int(0.19 * EMU))
            for r in sp.iter(O.A + "rPr"): r.set("i", "1")
        if ph is not None and ph.get("type") == "sldNum":
            for r in list(sp.iter(O.A + "rPr")):
                r.set("b", "1"); sf = etree.SubElement(r, O.A + "solidFill"); etree.SubElement(sf, O.A + "srgbClr", val="202C4F")
        if ph is None and O._text(sp).startswith("Market Overview"):
            O._set_xfrm(sp, int(0.32 * EMU), *[int(v) for v in O._xfrm(sp)[1:]])
            arrows = [r for r in sp.iter(O.A + "r") if r.find("a:t", O.NS).text.strip() == "→"]
            for k, r in enumerate(arrows):
                rp = r.find("a:rPr", O.NS); rp.set("b", "0")
                rp.find("a:solidFill/a:srgbClr", O.NS).set("val", "202C4F" if k == 0 else "BEBEBE")
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

    # panel 1: CAGR row labels, Total row, circled value (red ring) from 004p2; its columns are drawn by build.js (4 periods)
    def f2(els, f):
        refill(find_text(els, "Fashion jewelry"), ["Smart watches"]); resize(find_text(els, "Smart"), w=0.8)
        refill(find_text(els, "Fine jewelry"), ["Classic watches"]); resize(find_text(els, "Classic"), w=0.8)
        pct = [e for e in els if O._text(e) == "4%"]
        refill(min(pct, key=lambda e: O._xfrm(e)[1]), ["1%"])        # classic 12-20 (the circled one); Total 12-20 stays 4%
        paint(els[6], "CC0000")                                       # ring: stored in the main colour, the original is red
    place_1to1(keep_only(edit(p2, f2), {3, 4, 5, 6, 7, 8}))

    # panel 2b: break mark and the top segment's label pair from 004p3; segments, ticks and the two lower labels by build.js
    def f3(els, f):
        refill(find_text(els, "Fine jewelry"), ["Classic"]); resize(find_text(els, "Classic"), x=10.2, w=1.0, align="r", dy=0.12)
        refill(find_text(els, "89%"), ["66%"])
        g = els[2]                                                    # break-mark group: drop its two value ticks (redrawn per segment)
        for ch in [c for c in g if c.tag == O.P + "sp" and O._xfrm(c) and O._xfrm(c)[3] < 2000]: g.remove(ch)
    place_1to1(keep_only(edit(p3, f3), {2, 3, 4}))

    # panel 3: the three constraint cards with their icons, refilled (title stays bold, body stays italic)
    def f4(els, f):
        refill(find_text(els, "Customer"), ["Buyers prefer smart devices", "Younger buyers want health tracking and phone alerts on the wrist"])
        refill(find_text(els, "Tightened"), ["Slower corporate gifting", "Tighter expense rules cut the gift orders that carried premium sales"])
        refill(find_text(els, "Increasingly"), ["New digital rivals arrive", "Phone makers bundle smart watches and win shelf space in malls"])
    place_1to1(edit(p4, f4))

    # rest of the slide from the whole-slide object, refilled
    def f1(els, f):
        refill(els[3], ["Aurora’s 2018 revenue", "By segment %"]); resize(els[3], w=2.5)
        refill(els[4], ["China watch market size and growth"])
        refill(els[5], ["USD Billion"])
        refill(els[14], ["Classic watches grow more slowly\tClassic watches are most of Aurora’s sales*"])
        refill(els[30], ["", "Three shifts squeeze the classic watch segment"])
        refill(els[40], ["Aurora’s annual revenue", "USD Million", "2%"]); resize(els[40], w=2.5)
        refill(els[29], ["5%"]); refill(els[32], ["2%"])
        for i, e in enumerate(els):                                   # logo, chips, headings, exhibit titles, 5% / 7% cells, caption, arrow
            if i not in {1, 3, 4, 5, 10, 11, 12, 13, 14, 23, 29, 30, 32, 39, 40}: f.remove(e)
        # CAGR arrow (group 39): ungroup, stretch the shaft over three bars (7.72 -> 9.20 in), move the head; bubble stays
        g = els[39]; parts = [c for c in g if c.tag in O.SHAPE_TAGS]; O._ungroup_into(f, g)
        for e in parts:
            x, y, w, h = O._xfrm(e)
            if w > 0.9 * EMU: O._set_xfrm(e, int(7.62 * EMU), y, int(1.5 * EMU), h)      # shaft
            elif w < 0.15 * EMU: O._set_xfrm(e, int(9.11 * EMU), y, w, h)                 # head
    rest = edit(full, f1)
    place_1to1(rest)
    fix_package()
    print("written", OUT)
