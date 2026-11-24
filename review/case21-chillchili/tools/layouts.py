"""layouts.py: clean, editable layout objects seen in the 2021-2024 case decks, one per slide, for the object store.
Every repeated unit is one group (panel, driver, tab, section, column) so objstore.extend can add or remove units.
Colours: one accent (red), greys, white; no logos, no firm names. Text is placeholder wording to replace.
"""
import sys
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE

RED, DARK, MID, LIGHT, PALE, WHITE, INK = "C00000", "404040", "8C8C8C", "D9D9D9", "F2F2F2", "FFFFFF", "262626"
IN = 914400

def box(sh_coll, x, y, w, h, fill=None, line=None, lw=1.0, shape=MSO_SHAPE.RECTANGLE, name=None):
    s = sh_coll.add_shape(shape, Emu(int(x * IN)), Emu(int(y * IN)), Emu(int(w * IN)), Emu(int(h * IN)))
    if fill: s.fill.solid(); s.fill.fore_color.rgb = RGBColor.from_string(fill)
    else: s.fill.background()
    if line: s.line.color.rgb = RGBColor.from_string(line); s.line.width = Pt(lw)
    else: s.line.fill.background()
    s.shadow.inherit = False
    st = s._element.find("{http://schemas.openxmlformats.org/presentationml/2006/main}style")
    if st is not None: s._element.remove(st)                     # no theme effects (shadow) on house objects
    if name: s.name = name
    return s

def text(shape, lines, size=11, color=INK, bold=False, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, margin=0.06):
    tf = shape.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    for a in ("margin_left", "margin_right"): setattr(tf, a, Emu(int(margin * IN)))
    for a in ("margin_top", "margin_bottom"): setattr(tf, a, Emu(int(0.03 * IN)))
    if isinstance(lines, str): lines = [lines]
    for i, l in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); p.alignment = align
        runs = l if isinstance(l, list) else [(l, {})]
        for t, o in runs:
            r = p.add_run(); r.text = t; f = r.font; f.name = "Arial"; f.size = Pt(o.get("size", size))
            f.bold = o.get("bold", bold); f.color.rgb = RGBColor.from_string(o.get("color", color))
    return shape

def tbox(coll, x, y, w, h, lines, **k):
    s = coll.add_textbox(Emu(int(x * IN)), Emu(int(y * IN)), Emu(int(w * IN)), Emu(int(h * IN)))
    return text(s, lines, **k)

def title(slide, t):
    tbox(slide.shapes, 0.45, 0.3, 12.4, 0.8, [t], size=20, color=INK)
    ln = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Emu(int(0.45 * IN)), Emu(int(1.12 * IN)), Emu(int(12.88 * IN)), Emu(int(1.12 * IN)))
    ln.line.color.rgb = RGBColor.from_string(RED); ln.line.width = Pt(1.5); ln.name = "title rule"

def group(slide, shapes, name):
    g = slide.shapes.add_group_shape(shapes); g.name = name; return g

def operator(coll, x, y, d, sym, name):
    s = box(coll, x, y, d, d, fill=RED, shape=MSO_SHAPE.OVAL, name=name)
    text(s, [sym], size=20, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, margin=0)
    return s

def equation(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6]); title(s, "Equation: evidence panels add up to one conclusion (+ ... + = result)")
    n, x0, y0, w, h, gap = 3, 0.45, 1.5, 3.05, 4.6, 0.55
    for i in range(n):
        x = x0 + i * (w + gap)
        parts = []
        if i: parts.append(operator(s.shapes, x - gap + (gap - 0.42) / 2, y0 + h / 2 - 0.21, 0.42, "+", f"plus {i}"))   # operator leads each unit
        hd = box(s.shapes, x, y0, w, 0.45, fill=RED, name=f"panel {i + 1} header"); text(hd, [f"Evidence {i + 1}"], size=13, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        bd = box(s.shapes, x, y0 + 0.45, w, h - 0.45, fill=PALE, name=f"panel {i + 1} body")
        text(bd, ["Fact or chart", "Second supporting point", "Source / number"], size=11)
        group(s, parts + [hd, bd], f"evidence unit {i + 1}")
    xr = x0 + n * (w + gap)
    eq = operator(s.shapes, xr - gap + (gap - 0.42) / 2, y0 + h / 2 - 0.21, 0.42, "=", "equals")
    r1 = box(s.shapes, xr, y0, 12.88 - xr, 0.45, fill=DARK, name="result header"); text(r1, ["Conclusion"], size=13, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    r2 = box(s.shapes, xr, y0 + 0.45, 12.88 - xr, h - 0.45, fill=WHITE, line=RED, lw=1.5, name="result body"); text(r2, ["What the facts add up to"], size=12, bold=True)
    group(s, [eq, r1, r2], "result")

def formula_row(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6]); title(s, "Driver formula row: target = driver × driver × driver (numbers under each driver)")
    ops = [None, "=", "×", "×"]; labels = ["Revenue 2026", "# of POS", "Sales per POS", "Margin"]
    vals = ["RMB 21 Bn", "1.5 Mn", "RMB 14k", "35%"]
    x, y, w, h, gap = 0.6, 2.2, 2.45, 1.05, 0.75
    for i, (lab, v) in enumerate(zip(labels, vals)):
        parts = []
        if ops[i]:
            o = tbox(s.shapes, x - gap, y + 0.18, gap, 0.7, [ops[i]], size=28, bold=True, color=DARK, align=PP_ALIGN.CENTER); o.name = f"operator {i}"
            parts.append(o)                                   # operator leads each driver, so copies read "× driver"
        b = box(s.shapes, x, y, w, h, fill=RED if i == 0 else WHITE, line=None if i == 0 else DARK, lw=1.25, name=f"driver {i + 1} box")
        text(b, [lab], size=14, bold=True, color=WHITE if i == 0 else INK, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        n = tbox(s.shapes, x, y + h + 0.1, w, 0.45, [v], size=14, bold=True, color=RED, align=PP_ALIGN.CENTER); n.name = f"driver {i + 1} number"
        d = tbox(s.shapes, x, y + h + 0.55, w, 0.9, ["How it is reached", "(assumption)"], size=10, color=DARK, align=PP_ALIGN.CENTER); d.name = f"driver {i + 1} note"
        group(s, parts + [b, n, d], f"formula unit {i + 1}")
        x += w + gap

def l1r3(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6]); title(s, "L1R3: side card for one option, three numbered sections")
    c = box(s.shapes, 0.45, 1.4, 2.6, 5.6, fill=DARK, name="side card")
    ph = box(s.shapes, 0.6, 1.55, 2.3, 1.6, fill=MID, name="side card picture placeholder"); text(ph, ["Picture"], size=11, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    sp = tbox(s.shapes, 0.6, 3.3, 2.3, 3.5, [[("Option name", {"bold": True, "size": 15})], "Positioning", "Target segment", "Price range", "Business model"], size=11, color=WHITE)
    group(s, [c, ph, sp], "side card")
    for i in range(3):
        y = 1.4 + i * 1.9
        nb = box(s.shapes, 3.35, y, 0.42, 0.42, fill=RED, name=f"section {i + 1} number"); text(nb, [str(i + 1)], size=14, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, margin=0)
        hd = tbox(s.shapes, 3.9, y, 8.9, 0.42, [f"Section {i + 1} heading"], size=14, bold=True, anchor=MSO_ANCHOR.MIDDLE)
        ln = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Emu(int(3.35 * IN)), Emu(int((y + 0.5) * IN)), Emu(int(12.88 * IN)), Emu(int((y + 0.5) * IN)))
        ln.line.color.rgb = RGBColor.from_string(LIGHT); ln.line.width = Pt(1)
        bd = tbox(s.shapes, 3.9, y + 0.6, 8.9, 1.1, ["• Point with the key number in bold", "• Second point"], size=11)
        group(s, [nb, hd, ln, bd], f"section {i + 1}")

def sections(prs):
    """the right side of L1R3 on its own: numbered sections that extend (the side card is a separate object)"""
    s = prs.slides.add_slide(prs.slide_layouts[6]); title(s, "Numbered sections (right side of L1R3)")
    for i in range(3):
        y = 1.4 + i * 1.9
        nb = box(s.shapes, 3.35, y, 0.42, 0.42, fill=RED, name=f"section {i + 1} number"); text(nb, [str(i + 1)], size=14, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, margin=0)
        hd = tbox(s.shapes, 3.9, y, 8.9, 0.42, [f"Section {i + 1} heading"], size=14, bold=True, anchor=MSO_ANCHOR.MIDDLE)
        bd = tbox(s.shapes, 3.9, y + 0.6, 8.9, 1.1, ["• Point with the key number in bold", "• Second point"], size=11)
        group(s, [nb, hd, bd], f"section {i + 1}")

def tab_bar(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    names = ["Location", "Format", "Assortment", "Operating model"]
    w, gap, x = 2.9, 0.12, 0.45
    for i, n in enumerate(names):
        t = box(s.shapes, x + i * (w + gap), 0.2, w, 0.42, fill=RED if i == 1 else LIGHT, name=f"tab {i + 1}")
        text(t, [n], size=12, bold=True, color=WHITE if i == 1 else DARK, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        group(s, [t], f"tab unit {i + 1}")
    tbox(s.shapes, 0.45, 0.75, 12.4, 0.8, ["Tab bar: the strategy pillars above the title, the current one in the accent colour"], size=20)

def acronym(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6]); title(s, "Acronym banner: one large initial in a colour block per pillar")
    words = [("S", "tandardization"), ("P", "ersonalization"), ("V", "italization")]
    w, gap = 3.95, 0.3
    for i, (a, rest) in enumerate(words):
        x = 0.45 + i * (w + gap)
        band = box(s.shapes, x, 1.5, w, 0.75, fill=RED, name=f"banner {i + 1} band")
        lt = tbox(s.shapes, x + 0.1, 1.38, 0.8, 0.95, [a], size=40, bold=True, color=WHITE); lt.name = f"banner {i + 1} initial"
        rw = tbox(s.shapes, x + 0.85, 1.6, w - 0.95, 0.55, [rest], size=18, color=WHITE, anchor=MSO_ANCHOR.MIDDLE); rw.name = f"banner {i + 1} word"
        bd = tbox(s.shapes, x, 2.4, w, 3.8, ["• What this pillar does", "• Method 1", "• Method 2"], size=11); bd.name = f"banner {i + 1} body"
        group(s, [band, lt, rw, bd], f"banner unit {i + 1}")

def mekko(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6]); title(s, "Segment mekko: column width = segment size, target cells in the accent colour")
    cols = [("Tier 1", 0.30, [0.25, 0.45, 0.30]), ("Tier 1.5&2", 0.40, [0.35, 0.40, 0.25]), ("Tier 3+", 0.30, [0.50, 0.35, 0.15])]
    rows = ["40+", "26-40", "<25"]; target = {(1, 1), (2, 1)}
    X0, Y0, W, H = 1.3, 1.5, 9.0, 4.6
    x = X0
    for j, (cn, cw, shares) in enumerate(cols):
        parts = []; y = Y0
        for i, sh in enumerate(shares):
            h = H * sh
            c = box(s.shapes, x, y, W * cw - 0.04, h - 0.04, fill=RED if (j, i) in target else (MID if i % 2 == 0 else LIGHT), name=f"cell {j + 1}.{i + 1}")
            text(c, [f"{round(sh * 100)}%"], size=11, color=WHITE if (j, i) in target or i % 2 == 0 else INK, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
            parts.append(c); y += h
        lab = tbox(s.shapes, x, Y0 + H + 0.05, W * cw, 0.35, [cn], size=11, align=PP_ALIGN.CENTER); lab.name = f"column {j + 1} label"
        pct = tbox(s.shapes, x, Y0 - 0.35, W * cw, 0.3, [f"{round(cw * 100)}%"], size=10, color=DARK, align=PP_ALIGN.CENTER); pct.name = f"column {j + 1} size"
        group(s, parts + [lab, pct], f"mekko column {j + 1}")
        x += W * cw
    for i, r in enumerate(rows):
        yy = Y0 + sum(cols[0][2][:i]) * H
        tbox(s.shapes, 0.45, yy, 0.8, cols[0][2][i] * H, [r], size=11, align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE)
    lg = tbox(s.shapes, 10.6, 1.5, 2.3, 1.2, [[("■ ", {"color": RED}), ("Target segment", {})], [("■ ", {"color": MID}), ("Other segments", {})]], size=11)

def waterfall(prs):
    """native-chart waterfall (bridge) like the ChillChili EBIT bridge: stacked columns with an invisible base"""
    s = prs.slides.add_slide(prs.slide_layouts[6]); title(s, "Bridge (waterfall) as a native chart: change the numbers in the chart data")
    cats = ["2020", "Driver A", "Driver B", "Driver C", "2023E"]; vals = [3, 5, 3, 1, 12]
    base = [0, 3, 8, 11, 0]
    cd = CategoryChartData(); cd.categories = cats
    cd.add_series("base", base); cd.add_series("value", vals)
    gf = s.shapes.add_chart(XL_CHART_TYPE.COLUMN_STACKED, Emu(int(0.8 * IN)), Emu(int(1.5 * IN)), Emu(int(11.5 * IN)), Emu(int(5.2 * IN)), cd)
    ch = gf.chart; ch.has_legend = False
    b = ch.series[0]; b.format.fill.background(); b.format.line.fill.background()
    v = ch.series[1]; v.format.fill.solid(); v.format.fill.fore_color.rgb = RGBColor.from_string(MID)
    for i in (1, 2, 3):
        pt = v.points[i]; pt.format.fill.solid(); pt.format.fill.fore_color.rgb = RGBColor.from_string(RED)
    v.data_labels.show_value = True; v.data_labels.font.size = Pt(12); v.data_labels.font.bold = True
    v.data_labels.font.color.rgb = RGBColor.from_string(WHITE)
    ch.plots[0].gap_width = 60
    va = ch.value_axis; va.visible = False; va.has_major_gridlines = False
    gf.name = "chart: bridge"

def main(out):
    prs = Presentation(); prs.slide_width = Emu(int(13.333 * IN)); prs.slide_height = Emu(int(7.5 * IN))
    for f in (equation, formula_row, l1r3, tab_bar, acronym, mekko, waterfall, sections): f(prs)
    prs.save(out); print("saved", out)

if __name__ == "__main__":
    main(sys.argv[1])
