"""c09lib.py: shared chart step for the C09 mimic builds (A and B).

Places the stored slide object case-truenorth-pola-022 (two stacked-column charts drawn as vector shapes)
and the TrueNorth logo (a picture in the original deck, lifted from stored object case-truenorth-pola-004),
then writes every label as a native text box.

The stored object comes from a PDF-converted slide: all its labels (values, years, CAGR, legend names) are
pictures of text or glyph outlines. Those are removed and redrawn as native text; the vector bars, white
bar outlines, dashed connectors, axis lines and the two scenario headings (real text boxes) are kept.
  mode "keep":   bars, outlines and dashes kept exactly as stored (build A)
  mode "relay":  bars re-laid from the data (any number of years), dashed connectors and outlines redrawn
                 to match (build B)
"""
import copy, os, sys
from lxml import etree

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

STORE = os.path.join(ROOT, "Objects", "store")
EMU = 914400
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
GLYPH_SHAPES = {"object 46", "object 65", "object 111", "object 130"}   # "2014", "jurlique", "2014", "Jurlique" as outlines
AXES = {"object 43", "object 108"}
FONT = "Calibri"
RED, GREY, BLACK = "CC0000", "A3A3A3", "000000"


def _name(el):
    c = el.find(".//" + P + "cNvPr")
    return c.get("name") if c is not None else ""

def _xf(el):
    x = el.find(P + "spPr/" + A + "xfrm")
    o, e = x.find(A + "off"), x.find(A + "ext")
    return [int(o.get("x")), int(o.get("y")), int(e.get("cx")), int(e.get("cy"))]

def _fill(el):
    f = el.find(P + "spPr/" + A + "solidFill")
    return f[0].get("val") if f is not None and len(f) else None

def _path_bbox(path, ox, oy):
    xs, ys = [], []
    for q in path.iter(A + "pt"): xs.append(int(q.get("x"))); ys.append(int(q.get("y")))
    return ox + min(xs), oy + min(ys), max(xs) - min(xs), max(ys) - min(ys)


def _rect_sp(x, y, w, h, role, line_white=False):
    ln = ('<a:ln w="9525"><a:solidFill><a:schemeClr val="bg1"/></a:solidFill></a:ln>' if line_white else "")
    s = ('<p:sp xmlns:p="%s" xmlns:a="%s"><p:nvSpPr><p:cNvPr id="0" name="bar"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
         '<p:spPr><a:xfrm><a:off x="%d" y="%d"/><a:ext cx="%d" cy="%d"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
         '<a:solidFill><a:schemeClr val="%s"/></a:solidFill>%s</p:spPr></p:sp>') % (P[1:-1], A[1:-1], x, y, w, h, role, ln)
    return etree.fromstring(s)

def _dash(x1, y1, x2, y2):
    x, y, w, h = min(x1, x2), min(y1, y2), abs(x2 - x1), abs(y2 - y1)
    flip = ' flipV="1"' if (y2 < y1) != (x2 < x1) else ""
    s = ('<p:cxnSp xmlns:p="%s" xmlns:a="%s"><p:nvCxnSpPr><p:cNvPr id="0" name="dash"/><p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr>'
         '<p:spPr><a:xfrm%s><a:off x="%d" y="%d"/><a:ext cx="%d" cy="%d"/></a:xfrm><a:prstGeom prst="line"><a:avLst/></a:prstGeom>'
         '<a:ln w="9525"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:prstDash val="dash"/></a:ln></p:spPr></p:cxnSp>'
         ) % (P[1:-1], A[1:-1], flip, x, y, w, h)
    return etree.fromstring(s)


def chart_object(spec):
    """Return (object ready to place, geometry per chart) for the stored slide object."""
    obj = O.get(STORE, "case-truenorth-pola-022")
    f = O._frag(obj)
    for pic in list(f.iter(P + "pic")): pic.getparent().remove(pic)           # pictures of text
    for el in list(f.iter(P + "sp")):
        if _name(el) in GLYPH_SHAPES: el.getparent().remove(el)
    groups = [g for g in f if g.tag == P + "grpSp"]
    geo = []
    for k, g in enumerate(groups):
        ch = spec["charts"][k]
        axis = next(el for el in g if _name(el) in AXES)
        ox, oy = _xf(axis)[:2]
        paths = axis.findall(".//" + A + "path")
        for p in paths[:-1]: p.getparent().remove(p)                         # tick-label glyphs; keep the axis lines
        ax_x, ax_y, ax_w, ax_h = _path_bbox(paths[-1], ox, oy)
        bars = sorted([el for el in g if el.tag == P + "sp" and _fill(el) in ("accent1", "accent6")], key=lambda e: (_xf(e)[0], _fill(e)))
        cols = {}
        for b in bars: cols.setdefault(round(_xf(b)[0] / 20000), {})[_fill(b)] = _xf(b)
        cols = [cols[c] for c in sorted(cols)]
        base = max(c["accent6"][1] + c["accent6"][3] for c in cols)
        # value scale from the stored axis: the ticks are evenly spaced from the baseline to the axis top
        n_t = len(ch["ticks"])
        tick_ys = [base - i * (base - ax_y) / (n_t - 1) for i in range(n_t)]
        pitch0 = cols[1]["accent1"][0] - cols[0]["accent1"][0]
        bw0 = cols[0]["accent1"][2]
        c00 = cols[0]["accent1"][0] + bw0 / 2 - ax_x                            # first centre from the axis line
        if spec["mode"] == "keep":
            colgeo = [dict(cx=c["accent1"][0] + c["accent1"][2] / 2, w=c["accent1"][2], top=c["accent1"][1],
                           mid=c["accent6"][1], base=base) for c in cols]
        else:
            n = len(ch["years"])
            pitch = pitch0 * len(cols) / n
            bw = bw0 * pitch / pitch0
            c0 = c00 * pitch / pitch0
            per = (base - ax_y) / ch["ticks_max"]
            for el in list(g):
                if el.tag == P + "sp" and _name(el) not in AXES: g.remove(el)      # stored bars, outlines, dash pieces
            colgeo = []
            g.remove(axis)                                                     # re-appended last: the axis line stays on top of the bars
            for i in range(n):
                cx = ax_x + c0 + i * pitch
                top = base - ch["totals"][i] * per; mid = base - ch["pola"][i] * per
                g.append(_rect_sp(int(cx - bw / 2), int(mid), int(bw), int(base - mid), "accent6", True))
                g.append(_rect_sp(int(cx - bw / 2), int(top), int(bw), int(mid - top), "accent1", True))
                colgeo.append(dict(cx=cx, w=bw, top=top, mid=mid, base=base))
            for i in range(n - 1):
                a, b = colgeo[i], colgeo[i + 1]
                g.append(_dash(int(a["cx"] + a["w"] / 2), int(a["top"]), int(b["cx"] - b["w"] / 2), int(b["top"])))
                g.append(_dash(int(a["cx"] + a["w"] / 2), int(a["mid"]), int(b["cx"] - b["w"] / 2), int(b["mid"])))
            g.append(axis)
        if ch.get("grey"):                     # the store keeps one grey slot for both charts; the lower chart's grey is lighter
            for c in g.iter(A + "schemeClr"):
                if c.get("val") == "accent6": c.tag = A + "srgbClr"; c.set("val", ch["grey"])
        geo.append(dict(cols=colgeo, axis_x=ax_x, axis_y=ax_y, axis_r=ax_x + ax_w, base=base, tick_ys=tick_ys))
    if spec["mode"] != "keep":
        for el in list(f):                                                     # loose dash piece outside the groups
            if el.tag == P + "sp" and _fill(el) == "tx1": f.remove(el)
    obj = O._store(obj, f)
    obj["media"] = []
    return obj, geo


def _text(slide, text, x, y, w, h, pt, color=BLACK, bold=False, align="c", anchor="t", underline=False):
    tb = slide.shapes.add_textbox(Emu(int(x)), Emu(int(y)), Emu(int(w)), Emu(int(h)))
    tf = tb.text_frame
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.word_wrap = True
    tf.vertical_anchor = {"t": MSO_ANCHOR.TOP, "b": MSO_ANCHOR.BOTTOM, "m": MSO_ANCHOR.MIDDLE}[anchor]
    lines = text.split("\n")
    for i, line in enumerate(lines):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = {"c": PP_ALIGN.CENTER, "l": PP_ALIGN.LEFT, "r": PP_ALIGN.RIGHT}[align]
        r = para.add_run(); r.text = line
        r.font.size = Pt(pt); r.font.name = FONT; r.font.bold = bold; r.font.color.rgb = RGBColor.from_string(color)
        if underline and i == 0: r.font.underline = True
    return tb


def _rect(slide, x, y, w, h, color):
    s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Emu(int(x)), Emu(int(y)), Emu(int(w)), Emu(int(h)))
    s.fill.solid(); s.fill.fore_color.rgb = RGBColor.from_string(color); s.line.fill.background()
    s.shadow.inherit = False
    return s


def build(pptx_path, spec):
    I = lambda v: v * EMU
    # 1. the stored chart object, at its own position (identity box), original colours
    obj, geo = chart_object(spec)
    X, Y, W, H = obj["bbox"]
    r = O.place(pptx_path, 1, obj, (X / EMU, Y / EMU, W / EMU, H / EMU), STORE, colours="original",
                texts=[ch["heading"] for ch in spec["charts"]])   # the stored scenario headings, refilled
    # 2. the logo: a picture in the original deck (stored with slide 4's object), at its frame position
    lo = O.get(STORE, "case-truenorth-pola-004")
    lo = O.element(lo, 0)
    lf = O._frag(lo)
    blip = lf.find(".//" + A + "blip")
    lo["media"] = [m for m in lo["media"] if ("MEDIA:" + m) == blip.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed")]
    X, Y, W, H = lo["bbox"]
    O.place(pptx_path, 1, lo, (X / EMU, Y / EMU, W / EMU, H / EMU), STORE)
    # 3. native labels
    prs = Presentation(pptx_path)
    s = prs.slides[0]
    LBL = spec.get("label_pt", 12)
    for k, (ch, g) in enumerate(zip(spec["charts"], geo)):
        # value axis ticks, right-aligned left of the axis
        for t, ty in zip(ch["ticks"], g["tick_ys"]):
            _text(s, t, g["axis_x"] - I(1.0), ty - I(0.11), I(0.97), I(0.22), LBL, align="r", anchor="m")
        for i, c in enumerate(g["cols"]):
            _text(s, ch["total_labels"][i], c["cx"] - I(0.4), c["top"] - I(0.34), I(0.8), I(0.3), LBL, anchor="b")
            _text(s, ch["years"][i], c["cx"] - I(0.42), g["base"] + I(0.035), I(0.84), I(0.25), LBL)
        # legend: two squares and names, top left of the plot
        ly = ch["legend_y"]
        for (name, lx), col in zip(ch["legend"], [ch.get("grey", GREY), RED]):
            _rect(s, I(lx), I(ly - 0.0475), I(0.095), I(0.095), col)
            _text(s, name, I(lx + 0.12), I(ly - 0.12), I(0.12 + 0.09 * len(name)), I(0.24), LBL, align="l", anchor="m")
        # CAGR column, level with the last column's two segments
        cx = I(spec.get("cagr_cx", 8.76)); last = g["cols"][-1]
        _text(s, "CAGR\n" + ch["cagr_period"], cx - I(0.6), I(ch["cagr_y"]), I(1.2), I(0.5), LBL, underline=True)
        _text(s, ch["cagr"][1], cx - I(0.5), (last["top"] + last["mid"]) / 2 - I(0.13), I(1.0), I(0.26), LBL, anchor="m")
        _text(s, ch["cagr"][0], cx - I(0.5), (last["mid"] + last["base"]) / 2 - I(0.13), I(1.0), I(0.26), LBL, anchor="m")
    if spec.get("title_dy"):                          # the reference's title text sits a little higher than the layout's
        t = next(sh for sh in s.shapes if sh.is_placeholder and "TITLE" in str(sh.placeholder_format.type))
        t.left, t.top, t.width, t.height = t.left, t.top + int(I(spec["title_dy"])), t.width, t.height
    for sh in list(s.shapes):                       # the reference shows no page number (its grey footer bar is empty)
        if sh.is_placeholder and sh.placeholder_format.type is not None and "SLIDE_NUMBER" in str(sh.placeholder_format.type):
            sh._element.getparent().remove(sh._element)
    prs.save(pptx_path)
    return r
