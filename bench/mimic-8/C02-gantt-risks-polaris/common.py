# common.py: shared body builder for builds A and B of C02-gantt-risks-polaris.
# Stored object case19-polaris-016 (the slide's whole body) is placed at 1:1 with its original colours, minus its
# PDF-converted table (redrawn natively here) and with its Gantt bars re-laid from data (copies of the stored bars).
import copy, os, sys
from lxml import etree
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as o
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn

STORE = os.path.join(ROOT, "Objects/store"); E = o.EMU
OBJ_ID = "case19-polaris-016"
# element indices (O.elements(obj)): 0 dashed divider, 1 red rule under "Implementation Timeline", 2 red rule under the
# right header, 4-21 dashed Gantt column pieces, 28/29 grey rules between challenge blocks, 46 dotted sub-group rule
BAR_TPL = {"red": 39, "red2": 45, "grey": 41}     # stored bars used as templates (accent2 C00000, accent1 CC0000, bg2 D9D9D9)
BARS = list(range(37, 46))                           # the stored Gantt bars
CIRCLES = [23, 24, 25]; TAGS = [26, 27]              # letter circles a/b/c; Brand / Design boxes
COL_DASH = list(range(4, 22)); DOTTED = 46           # stored dashed column pieces (between A's bars); dotted rule
RED, BLACK, GREY_L, GREY_M = "CC0000", "000000", "B4B4B4", "A6A6A6"

# ------------------------------------------------------------------ helpers on the stored object
def _label(el, text, pt, colour="FFFFFF", bold=True):
    """Write a centred label into a stored shape's own text body."""
    tb = el.find(".//p:txBody", o.NS)
    bp = tb.find("a:bodyPr", o.NS); bp.set("anchor", "t"); bp.set("wrap", "none")   # top, as the original sets them
    for k in ("lIns", "tIns", "rIns", "bIns"): bp.set(k, "0")
    for p in tb.findall("a:p", o.NS): tb.remove(p)
    p = etree.SubElement(tb, o.A + "p"); etree.SubElement(p, o.A + "pPr", algn="ctr")
    r = etree.SubElement(p, o.A + "r")
    rp = etree.SubElement(r, o.A + "rPr", lang="en-US", sz=str(int(pt * 100)), b="1" if bold else "0", dirty="0")
    sf = etree.SubElement(rp, o.A + "solidFill"); etree.SubElement(sf, o.A + "srgbClr", val=colour)
    etree.SubElement(rp, o.A + "latin", typeface="+mn-lt"); etree.SubElement(rp, o.A + "cs", typeface="+mn-cs")
    etree.SubElement(r, o.A + "t").text = text

def body_object(spec):
    """The stored body, original colours, table removed, bars / circles / tags / texts set from spec."""
    obj = o.original_colours(o.get(STORE, OBJ_ID))      # each shape its own original colour (light boxes F1F1F1, bars D9D9D9)
    if spec.get("texts"): obj = o.set_texts(obj, spec["texts"])   # refill the stored text boxes (slot order), formats kept
    f = o._frag(obj); kids = list(f)
    tpl = {k: copy.deepcopy(kids[i]) for k, i in BAR_TPL.items()}
    # circles and tag boxes: move to the spec's rows, write their letters / words into their own text bodies
    for i, c in zip(CIRCLES, spec["circles"]):
        x, y, w, h = o._xfrm(kids[i]); o._set_xfrm(kids[i], int(c["x"] * E), int(c["y"] * E), w, h); _label(kids[i], c["letter"], 17)
    for i, t in zip(TAGS, spec["tags"]):
        x, y, w, h = o._xfrm(kids[i]); o._set_xfrm(kids[i], int(t["x"] * E), int(t["y"] * E), w, h); _label(kids[i], t["text"], 14)
    for i in CIRCLES[len(spec["circles"]):] + TAGS[len(spec["tags"]):]: f.remove(kids[i])
    # dashed column lines and dotted sub-group rule: stored as is, or (re-laid rows) copies of the stored ones
    if "col_dashes" in spec:
        cx = sorted({o._xfrm(kids[i])[0] for i in COL_DASH}); at = kids[COL_DASH[0]]
        for k, y1, y2 in spec["col_dashes"]:
            el = copy.deepcopy(kids[COL_DASH[0]]); o._set_xfrm(el, cx[k], int(y1 * E), 0, int((y2 - y1) * E)); at.addprevious(el)
        for i in COL_DASH: f.remove(kids[i])
    if "dotted" in spec:
        d = kids[DOTTED]; x, y, w, h = o._xfrm(d)
        for yy in spec["dotted"]:
            el = copy.deepcopy(d); o._set_xfrm(el, x, int(yy * E), w, h); d.addprevious(el)
        f.remove(d)
    # Gantt bars: keep the stored ones the spec names, add copies of the stored bars for the rest
    keep = {b["el"] for b in spec["bars"] if "el" in b}
    for i in BARS:
        if i not in keep: f.remove(kids[i])
    for b in spec["bars"]:
        if "el" in b: continue
        el = copy.deepcopy(tpl[b["kind"]]); x, y, w, h = b["box"]
        o._set_xfrm(el, int(x * E), int(y * E), int(w * E), int(h * E)); f.append(el)
    f.remove(next(e for e in f if etree.QName(e).localname == "graphicFrame"))
    return o._store(obj, f)

# ------------------------------------------------------------------ native drawing (python-pptx)
def _line(sl, x1, y1, x2, y2, colour, pt, dash=None):
    c = sl.shapes.add_connector(1, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = RGBColor.from_string(colour); c.line.width = Pt(pt)
    if dash: c.line.dash_style = dash
    return c

def _text(sl, x, yc, w, runs, pt=14, h=0.32, bullet=False, align=PP_ALIGN.LEFT):
    """runs: [(text, colour, bold)]; box centred on yc; bullet = '•' hanging 0.11 in like the original."""
    tb = sl.shapes.add_textbox(Inches(x), Inches(yc - h / 2 - 0.015), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]; p.alignment = align
    if bullet:
        pPr = p._p.get_or_add_pPr(); pPr.set("marL", str(int(0.11 * E))); pPr.set("indent", str(int(-0.11 * E)))
        etree.SubElement(pPr, qn("a:buFont"), typeface="Arial"); etree.SubElement(pPr, qn("a:buChar"), char="•")
    for t, col, b in runs:
        r = p.add_run(); r.text = t; r.font.size = Pt(pt); r.font.bold = b; r.font.name = "Arial"
        r.font.color.rgb = RGBColor.from_string(col)
    return tb

def draw_native(path, spec):
    prs = Presentation(path); sl = prs.slides[0]
    G = spec["grid"]; xs = G["xs"]; top, bot = G["top"], G["bottom"]
    # frame lines the stored object does not hold (the red rules, divider, challenge rules, dashed column pieces and
    # dotted rule are stored shapes): the year rule and grid lines were borders of the stored table (redrawn), the footer
    # rule is in the footer zone the store leaves out
    _line(sl, 0.34, top, 8.69, top, GREY_L, 2.25)                             # under the years
    _line(sl, 0.0, 7.21, 12.96, 7.21, GREY_L, 1.0)                            # footer rule
    # Gantt grid (table borders): solid column pieces, block rules
    _line(sl, xs[0], top, xs[0], bot, GREY_L, 0.75)
    for x in xs[1:-1]:
        for y1, y2 in G["spans"](x): _line(sl, x, y1, x, y2, GREY_L, 0.75)
    for y in G["block_rules"]: _line(sl, 0.34, y, 8.69, y, GREY_M, 0.75)
    # left labels
    for r in spec["rows"]:
        k = r["kind"]
        if k == "section": _text(sl, r["x"], r["y"], 3.0, [(r["text"], RED, True)])
        elif k == "group": _text(sl, r["x"], r["y"], 3.3, [(r["text"], BLACK, True)])
        else: _text(sl, r["x"], r["y"], 3.66 - r["x"] - 0.02, [(r["text"], BLACK, False)], bullet=True)
    # legend words (the legend bars are stored bars, placed with the object)
    for x, yc, t in spec["legend_text"]: _text(sl, x, yc, 2.6, [(t, BLACK, False)], pt=12)
    # logo slot: no logo files in the store (frame logos are stripped), so the names as a text label (Objects/images.md)
    # the client's name follows the content (spec "client"); the team name (Polaris) stays
    _text(sl, 10.6, 7.36, 2.1, [((spec.get("client", "PANDORA") + "  |  " if spec.get("client", "PANDORA") else "") + "Polaris", "5C5C5C", False)], pt=10, h=0.2, align=PP_ALIGN.RIGHT)
    prs.save(path)

def build(path, spec, page):
    draw_native(path, spec)
    obj = body_object(spec)
    X, Y, W, H = obj["bbox"]
    r = o.place(path, 1, obj, (X / E, Y / E, W / E, H / E), STORE, colours="theme")   # 1:1: text left as stored
    # page number: the deck's page 16 is a slide-number field here (slide 1); LibreOffice ignores firstSlideNum,
    # so the field on this slide is turned into a plain run carrying the page number, in the field's own formatting
    import zipfile
    z = zipfile.ZipFile(path); files = {n: z.read(n) for n in z.namelist()}; z.close()
    sname = "ppt/slides/slide1.xml"; sl = etree.fromstring(files[sname])
    for fld in list(sl.iter(o.A + "fld")):
        if fld.get("type") == "slidenum":
            run = etree.Element(o.A + "r"); rp = fld.find("a:rPr", o.NS)
            if rp is not None: run.append(copy.deepcopy(rp))
            etree.SubElement(run, o.A + "t").text = str(page); fld.addprevious(run); fld.getparent().remove(fld)
    files[sname] = etree.tostring(sl, xml_declaration=True, encoding="UTF-8", standalone=True)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zo:
        for n, d in files.items(): zo.writestr(n, d)
    return r
