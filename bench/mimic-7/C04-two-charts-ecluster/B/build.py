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


def place_1to1(obj):
    X, Y, W, H = [v / EMU for v in obj["bbox"]]
    r = O.place(OUT, 1, obj, (X, Y, W, H), STORE, colours="original")
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
    # slots (O.slots): 0 Fashion jewelry, 3 Fine jewelry, 4 the circled 4% (classic 12-20); Total 12-20 (slot 6) stays 4%
    p2 = O.set_texts(p2, [ "Smart watches", None, None, "Classic watches", "1%", None, None])
    def f2(els, f):
        resize(find_text(els, "Smart"), w=0.8); resize(find_text(els, "Classic"), w=0.8)
    place_1to1(keep_only(edit(p2, f2), {3, 4, 5, 6, 7, 8}))

    # panel 2b: break mark and the top segment's label pair from 004p3; segments, ticks and the two lower labels by build.js
    p3 = O.set_texts(p3, ["Classic", "66%", None, None])               # slots: 0 Fine jewelry, 1 89%
    def f3(els, f):
        resize(find_text(els, "Classic"), x=10.2, w=1.0, align="r", dy=0.12)
        g = els[2]                                                    # break-mark group: drop its two value ticks (redrawn per segment)
        for ch in [c for c in g if c.tag == O.P + "sp" and O._xfrm(c) and O._xfrm(c)[3] < 2000]: g.remove(ch)
    place_1to1(keep_only(edit(p3, f3), {2, 3, 4}))

    # panel 3: the three constraint cards with their icons, refilled (title stays bold, body stays italic)
    # slots: 0 chip "3" (unchanged), 1 Customer, 2 Tightened, 3 Increasingly
    place_1to1(O.set_texts(p4, [None,
        ["Buyers prefer smart devices", "Younger buyers want health tracking and phone alerts on the wrist"],
        ["Slower corporate gifting", "Tighter expense rules cut the gift orders that carried premium sales"],
        ["New digital rivals arrive", "Phone makers bundle smart watches and win shelf space in malls"]]))

    # rest of the slide from the whole-slide object, refilled
    texts = [None] * 32                                               # slot numbers from O.slots(full)
    texts[5] = ["Aurora’s 2018 revenue", "By segment %"]              # element 3
    texts[3] = "China watch market size and growth"                   # element 4
    texts[6] = "USD Billion"                                          # element 5
    texts[1] = "Classic watches grow more slowly\tClassic watches are most of Aurora’s sales*"   # element 17
    texts[24] = ["", "Three shifts squeeze the classic watch segment"]   # element 33
    texts[4] = ["Aurora’s annual revenue", "USD Million", "2%"]       # element 43
    texts[23] = "5%"; texts[18] = "2%"                                # elements 32 and 35
    full = O.set_texts(full, texts)
    def f1(els, f):
        resize(els[3], w=2.5); resize(els[43], w=2.5)
        for i, e in enumerate(els):                                   # logo, chips, headings, heading rules 1-2 and panel-2 divider
            # (11, 14, 10), exhibit titles, 5% / 7% cells, caption, arrow
            if i not in {1, 3, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 26, 32, 33, 35, 42, 43}: f.remove(e)
        # CAGR arrow (group 42): ungroup, stretch the shaft over three bars (7.72 -> 9.20 in), move the head; bubble stays
        g = els[42]; parts = [c for c in g if c.tag in O.SHAPE_TAGS]; O._ungroup_into(f, g)
        for e in parts:
            x, y, w, h = O._xfrm(e)
            if w > 0.9 * EMU: O._set_xfrm(e, int(7.62 * EMU), y, int(1.5 * EMU), h)      # shaft
            elif w < 0.15 * EMU: O._set_xfrm(e, int(9.11 * EMU), y, w, h)                 # head
    rest = edit(full, f1)
    place_1to1(rest)
    fix_package()
    print("written", OUT)
