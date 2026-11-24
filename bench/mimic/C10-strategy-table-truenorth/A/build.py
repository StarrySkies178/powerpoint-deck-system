"""C10 mimic, build A: place the slide's own stored object (case-truenorth-pola-008) with its original
colours, refilled with clean text, plus the deck's logo picture. Run after build.js, with A/ as cwd."""
import copy, os, sys, zipfile
from lxml import etree

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O

STORE = os.path.join(ROOT, "Objects/store")
DECK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "candidate.pptx")
A_, NS = O.A, O.NS

# Text per stored text box (index in the stored object). "# " = bold sub-heading paragraph, "= " = plain
# paragraph, anything else = bullet. Each paragraph is cloned from the box's own paragraph of that kind.
TEXTS = {
    21: ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.’s poor performance in China"],
    3: ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"],
    5: ["= Market Risks", "= Political Risks"],
    7: ["= R&D Process Product Intro Re-evaluation"],
    25: ["# Planning phase", "Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
    23: ["# Brand position", "Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"],
    11: ["# Awareness phase", "Desire for emotional empathy", "Dependence on social media", "Idol effect"],
    9: ["# Marketing strategy", "Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"],
    13: ["# Purchase phase", "Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
    15: ["# Channel optimization", "Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"],
    19: ["# Aftersales phase", "Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
    17: ["# Loyalty management", "Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"],
    27: ["# Market Risks", "Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"],
    28: ["# Political Risks", "Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"],
    30: ["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs", "Prioritize channel management for weak channels"],
    31: ["Re-consider manufacturing strategy in 2 years and consider option of building factory in China"],
}
DROP = [1]   # the stored title box: the harness frame draws the title


def refill(el, lines):
    """Replace the paragraphs of one text box, cloning the box's own heading / bullet / plain paragraph
    for each line and collapsing the PDF-import runs (one run per word, letter-spacing tweaks) into one."""
    tb = el.find("p:txBody", NS); paras = tb.findall("a:p", NS)
    bullet = lambda p: p.find("a:pPr/a:buChar", NS) is not None
    texty = [p for p in paras if p.find(".//a:t", NS) is not None]
    tmpl = {"b": next((p for p in texty if bullet(p)), None), "#": next((p for p in texty if not bullet(p)), None)}
    tmpl["="] = texty[0]
    for p in paras: tb.remove(p)
    for line in lines:
        kind = line[0] if line[:2] in ("# ", "= ") else "b"
        text = line[2:] if kind != "b" else line
        np_ = copy.deepcopy(tmpl[kind] if tmpl[kind] is not None else tmpl["="])
        ppr = np_.find("a:pPr", NS)
        if ppr is not None and "marR" in ppr.attrib: del ppr.attrib["marR"]   # PDF-import line-break hack, not wanted for new text
        runs = np_.findall("a:r", NS)
        for r in runs[1:]: np_.remove(r)
        rpr = runs[0].find("a:rPr", NS)
        if rpr is not None and "spc" in rpr.attrib: del rpr.attrib["spc"]
        runs[0].find("a:t", NS).text = text
        tb.append(np_)


def build_object(texts=TEXTS, drop=DROP):
    obj = O.get(STORE, "case-truenorth-pola-008")
    f = O._frag(obj); els = list(f)
    for i, lines in texts.items(): refill(els[i], lines)
    for i in drop: f.remove(els[i])
    return O._store(obj, f)


def bbox_in(obj): return tuple(v / O.EMU for v in obj["bbox"])


def finish(deck):
    """z-order: grey source band to the back, header labels to the front."""
    z = zipfile.ZipFile(deck); files = {n: z.read(n) for n in z.namelist()}; z.close()
    name = "ppt/slides/slide1.xml"; sl = etree.fromstring(files[name]); tree = sl.find(".//p:cSld/p:spTree", NS)
    named = lambda n: [e for e in tree if e.find("./*/p:cNvPr", NS) is not None and e.find("./*/p:cNvPr", NS).get("name") == n]
    for e in named("srcBand"): tree.remove(e); tree.insert(2, e)
    for e in named("hdr"): tree.remove(e); tree.append(e)
    for e in tree:                                         # title at the deck's tight line spacing (about 0.9)
        ph = e.find("./p:nvSpPr/p:nvPr/p:ph", NS)
        if ph is not None and ph.get("type") == "title":
            off = e.find("./p:spPr/a:xfrm/a:off", NS); off.set("y", str(int(off.get("y")) - int(0.09 * O.EMU))); off.set("x", str(int(off.get("x")) + int(0.02 * O.EMU)))
            for p in e.iter(A_ + "p"):
                ppr = p.find("a:pPr", NS)
                if ppr is None: ppr = etree.SubElement(p, A_ + "pPr"); p.insert(0, ppr)
                ls = etree.Element(A_ + "lnSpc"); etree.SubElement(ls, A_ + "spcPct", val="90000"); ppr.insert(0, ls)
    files[name] = etree.tostring(sl, xml_declaration=True, encoding="UTF-8", standalone=True)
    with zipfile.ZipFile(deck, "w", zipfile.ZIP_DEFLATED) as zo:
        for n, d in files.items(): zo.writestr(n, d)


if __name__ == "__main__":
    obj = build_object()
    r = O.place(DECK, 1, obj, bbox_in(obj), STORE, colours="original", scale_text=False)
    print("table object at", [round(v, 2) for v in r["box"]], r["warnings"])
    logo = O.element(O.get(STORE, "case-truenorth-pola-004"), 0)          # the deck's TrueNorth logo picture
    r = O.place(DECK, 1, logo, bbox_in(logo), STORE, colours="original", scale_text=False)
    print("logo at", [round(v, 2) for v in r["box"]])
    finish(DECK)
