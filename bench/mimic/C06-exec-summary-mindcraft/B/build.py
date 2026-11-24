"""Build B, step 2 (run in B/ after build.js). Same as Build A (see A/build.py), but the stored body text box is
refilled with new content of FIVE paragraphs (the original has four) through objstore.set_texts.
Fix needed after set_texts: it copies the first paragraph as the template for every new paragraph, so all five
got the first paragraph's 1 pt space-before and the paragraphs ran together. fix_paragraphs() gives paragraphs
2-5 the 12 pt space-before (and right margin) that paragraphs 2-4 have in the stored object.
--- Build A notes:
Places the slide's own stored object case19-mindcraft-003 as is, at its source size (full slide, scale 1):
  - group of the deck's own pictures: photo, the opaque red-to-grey gradient over it, the MindCraft logo
  - the native body text box with the four italic white paragraphs (Verdana 14 pt, 150% line spacing)
The stored object lost the slide title (it was the deck's placeholder), so the title is the frame's title
placeholder, moved above the object and set as on the original slide: white, bold, 26 pt (the profile's title size).
Line spacing: the stored 150% is set as its exact PowerPoint value, 25 pt (the original's 50 px pitch at 144 dpi),
so a renderer without Verdana (LibreOffice falls back to DejaVu Sans) keeps the same line pitch.
The frame's empty source placeholder and its slide number sit under the opaque background, invisible,
so they are removed (the original slide shows neither)."""
import os, sys, zipfile
from lxml import etree
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O

STORE = os.path.join(ROOT, "Objects/store")
DECK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "candidate.pptx")
NS = O.NS; A = "{%s}" % NS["a"]; P = "{%s}" % NS["p"]

def exact_spacing(obj, pts=2500):
    f = O._frag(obj)
    for ln in f.iter(A + "lnSpc"):
        for c in list(ln): ln.remove(c)
        etree.SubElement(ln, A + "spcPts", val=str(pts))
    return O._store(obj, f)

def place_slide_object(texts=None, fix=None):
    obj = O.get(STORE, "case19-mindcraft-003")
    if texts is not None: obj = O.set_texts(obj, texts)
    if fix: obj = fix(obj)
    obj = exact_spacing(obj)
    r = O.place(DECK, 1, obj, (0, 0, 13.333, 7.5), STORE, colours="original")
    return r

def finish_title(title_pt=2600, title_y=None):
    z = zipfile.ZipFile(DECK); files = {n: z.read(n) for n in z.namelist()}; z.close()
    sname = "ppt/slides/slide1.xml"
    sl = etree.fromstring(files[sname]); tree = sl.find(".//p:cSld/p:spTree", NS)
    title = None
    for sp in list(tree.findall("p:sp", NS)):
        ph = sp.find("p:nvSpPr/p:nvPr/p:ph", NS)
        if ph is None: continue
        if ph.get("type") == "title": title = sp
        elif ph.get("type") in ("body", "sldNum"): tree.remove(sp)
    tree.remove(title); tree.append(title)            # above the full-slide picture group
    for rpr in list(title.iter(A + "rPr")) + list(title.iter(A + "endParaRPr")):
        rpr.set("b", "1"); rpr.set("sz", str(title_pt))
        for sf in rpr.findall("a:solidFill", NS): rpr.remove(sf)
        sf = etree.Element(A + "solidFill"); etree.SubElement(sf, A + "schemeClr", val="bg1"); rpr.insert(0, sf)
    if title_y is not None:
        off = title.find("p:spPr/a:xfrm/a:off", NS); ext = title.find("p:spPr/a:xfrm/a:ext", NS)
        off.set("y", str(int(title_y[0] * 914400))); ext.set("cy", str(int(title_y[1] * 914400)))
    files[sname] = etree.tostring(sl, xml_declaration=True, encoding="UTF-8", standalone=True)
    with zipfile.ZipFile(DECK, "w", zipfile.ZIP_DEFLATED) as zo:
        for n, d in files.items(): zo.writestr(n, d)

TEXTS = [[
    "Premium ready-to-drink coffee in China is set to grow 18% a year to 2030, led by white-collar commuters in tier 1 and 2 cities and students in new-tier cities, who value convenience and price respectively.",
    "Yet BrewCo reaches only 9% of convenience stores in high tiers and is almost absent from new tiers, where two rivals hold over 60% of shelf space.",
    "Hence BrewCo’s three-year plan should combine a value sub-brand for new tiers, a chilled range for commuters and direct deals with the top five convenience chains.",
    "Together these moves are expected to lift revenue by 21% a year, two thirds of it from new-tier distribution.",
    "The plan needs RMB 340 million of capital over three years, covered by current cash flow; the main risks are channel conflict, cold-chain cost and slow sub-brand uptake.",
]]

def fix_paragraphs(obj):
    f = O._frag(obj)
    for tb in f.iter(P + "txBody"):
        for i, p_ in enumerate(tb.findall("a:p", NS)):
            if i == 0: continue
            ppr = p_.find("a:pPr", NS)
            ppr.set("marR", "5080")
            ppr.find("a:spcBef/a:spcPts", NS).set("val", "1200")
    return O._store(obj, f)

if __name__ == "__main__":
    r = place_slide_object(texts=TEXTS, fix=fix_paragraphs)
    print("placed", r)
    finish_title()
