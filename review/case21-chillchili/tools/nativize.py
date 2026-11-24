"""nativize.py: replace traced charts in a rebuilt deck with native, editable PowerPoint charts.

Usage: python3 nativize.py deck.pptx key spec.json out.pptx

spec.json: {"charts": [ {...}, ... ]}, one entry per chart, page-pixel coordinates of the page image:
  slide        1-based slide number
  clear        [x0,y0,x1,y1]  region whose traced shapes and OCR text are removed (chart + its axis labels + data labels)
  keep         optional list of regexes: OCR text boxes in `clear` that stay (annotations, legends kept as text)
  keep_colors  optional list of hex colours: traced shapes of these fills/lines stay (red circles, arrows)
  type         column | column_stacked | column_stacked_100 | bar | bar_stacked | bar_stacked_100 | line | line_markers | pie | doughnut | scatter | bubble
  categories   list of category labels (bar/column/line/pie)
  series       [{"name", "values", "color", "labels": bool, "label_color", "label_pos", "label_size", "fmt", "line": bool, "marker", "invisible": bool}]
  total        optional {"values", "color", "size", "fmt"}: labels above stacked columns (a hidden line series, so they move with the data)
  centers      [first_center_x, last_center_x]  page px of the first and last bar centre (column) or bar centre y (bar)
  bar          bar thickness in page px (gap width is derived)
  base         baseline in page px (column: y of the axis; bar: x of the axis)
  k            page px per unit of value (from the reviewed labels)
  top          (column) y in px of the plot top; (bar) x of the plot end. Default: clear edge
  axis_line    hex colour of the category axis line, or null
  cat_size     category label size in pt (null hides category labels)
  frame        optional [x0,y0,x1,y1] chart frame (default `clear`)
  note         where the numbers come from (written to the chart's alt text)
  For pie/doughnut: "frame" is the pie's square box; "hole" percent for doughnut; "first_angle".
  For scatter/bubble: "x_axis": [min,max], "y_axis": [min,max] and "plot": [x0,y0,x1,y1] page px of the axes box; series values are [[x,y(,size)],...].
"""
import sys, json, re, copy
sys.path.insert(0, '/tmp/nr/nat')
from pptx import Presentation
from pptx.chart.data import CategoryChartData, XyChartData, BubbleChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from lxml import etree

C = "http://schemas.openxmlformats.org/drawingml/2006/chart"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
def q(tag): p, t = tag.split(":"); return "{%s}%s" % ({"c": C, "a": A}[p], t)
def sub(parent, tag, **attrs):
    e = etree.SubElement(parent, q(tag))
    for k, v in attrs.items(): e.set(k, str(v))
    return e

TYPES = {"column": XL_CHART_TYPE.COLUMN_CLUSTERED, "column_stacked": XL_CHART_TYPE.COLUMN_STACKED,
         "column_stacked_100": XL_CHART_TYPE.COLUMN_STACKED_100, "bar": XL_CHART_TYPE.BAR_CLUSTERED,
         "bar_stacked": XL_CHART_TYPE.BAR_STACKED, "bar_stacked_100": XL_CHART_TYPE.BAR_STACKED_100,
         "line": XL_CHART_TYPE.LINE, "line_markers": XL_CHART_TYPE.LINE_MARKERS, "pie": XL_CHART_TYPE.PIE,
         "doughnut": XL_CHART_TYPE.DOUGHNUT, "scatter": XL_CHART_TYPE.XY_SCATTER, "bubble": XL_CHART_TYPE.BUBBLE}

def walk(shapes):
    for sh in list(shapes):
        yield sh
        if sh.shape_type == 6: yield from walk(sh.shapes)

def hexes(sh):
    out = []
    try:
        if sh.fill.type == 1: out.append(str(sh.fill.fore_color.rgb))
    except Exception: pass
    try:
        if sh.line.fill.type == 1: out.append(str(sh.line.color.rgb))
    except Exception: pass
    return out

def near(h, cols, tol=40):
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    for c in cols:
        R, G, B = (int(c[i:i + 2], 16) for i in (0, 2, 4))
        if abs(r - R) + abs(g - G) + abs(b - B) <= tol: return True
    return False

def clear_region(slide, box, px, keep=(), keep_colors=(), strip_lines=(), drop_pics=False, keep_max=1e12):
    x0, y0, x1, y1 = box; n = 0
    for sh in list(walk(slide.shapes)):
        if sh.shape_type in (3, 6): continue                                # charts and groups are never cleared
        sx0, sy0 = sh.left / px, sh.top / px; sx1, sy1 = (sh.left + sh.width) / px, (sh.top + sh.height) / px
        cx, cy = (sx0 + sx1) / 2, (sy0 + sy1) / 2
        if not (x0 <= cx <= x1 and y0 <= cy <= y1): continue
        if sh.has_text_frame and sh.text_frame.text.strip() and any(re.search(k, sh.text_frame.text.strip()) for k in keep):
            ps = list(sh.text_frame.paragraphs); n0 = len(ps); lead = 0; seen_kept = False
            for p_ in ps:
                if any(re.search(r, p_.text.strip()) for r in strip_lines) and len(sh.text_frame.paragraphs) > 1:
                    p_._p.getparent().remove(p_._p)
                    if not seen_kept: lead += 1
                else: seen_kept = True
            if lead:                                     # removed lines sat at the top: the rest keeps its place
                dy = int(sh.height * lead / n0); sh.top = sh.top + dy; sh.height = sh.height - dy
            continue
        ix = max(0, min(sx1, x1) - max(sx0, x0)); iy = max(0, min(sy1, y1) - max(sy0, y0))
        area = max(1e-6, (sx1 - sx0) * (sy1 - sy0))
        if sh.shape_type != 17 and ix * iy / area < 0.7: continue          # shapes reaching far outside stay
        if sh.has_text_frame and sh.text_frame.text.strip(): pass
        elif keep_colors and any(near(h, keep_colors) for h in hexes(sh)) and (sx1 - sx0) * (sy1 - sy0) <= keep_max: continue
        if sh.shape_type == 13 and not drop_pics: continue                  # pictures (photos, logos) stay unless the spec says they are chart crops
        sh._element.getparent().remove(sh._element); n += 1
    return n

def txpr(parent, size, color="404040", bold=False):
    t = sub(parent, "c:txPr"); bp = sub(t, "a:bodyPr", wrap="none"); sub(t, "a:lstStyle"); p = sub(t, "a:p"); pp = sub(p, "a:pPr")
    d = sub(pp, "a:defRPr", sz=int(size * 100), b=1 if bold else 0)
    sf = sub(d, "a:solidFill"); sub(sf, "a:srgbClr", val=color); sub(d, "a:latin", typeface="Arial")
    sub(p, "a:endParaRPr", lang="en-US")
    return t

def rich_label(dl, text, size, color, bold):
    """a data label showing given text (c:tx/c:rich) instead of the value"""
    tx = sub(dl, "c:tx"); rich = sub(tx, "c:rich"); sub(rich, "a:bodyPr", wrap="none"); sub(rich, "a:lstStyle")
    p = sub(rich, "a:p"); pp = sub(p, "a:pPr"); d = sub(pp, "a:defRPr", sz=int(size * 100), b=1 if bold else 0)
    r = sub(p, "a:r"); rp = sub(r, "a:rPr", lang="en-US", sz=int(size * 100), b=1 if bold else 0)
    sf = sub(rp, "a:solidFill"); sub(sf, "a:srgbClr", val=color); sub(rp, "a:latin", typeface="Arial")
    t = sub(r, "a:t"); t.text = text.split("\n")[0]
    for extra in text.split("\n")[1:]:                      # more lines: one paragraph each
        p2 = sub(rich, "a:p"); pp2 = sub(p2, "a:pPr"); sub(pp2, "a:defRPr", sz=int(size * 100), b=1 if bold else 0)
        r2 = sub(p2, "a:r"); rp2 = sub(r2, "a:rPr", lang="en-US", sz=int(size * 100), b=1 if bold else 0)
        sf2 = sub(rp2, "a:solidFill"); sub(sf2, "a:srgbClr", val=color); sub(rp2, "a:latin", typeface="Arial")
        t2 = sub(r2, "a:t"); t2.text = extra

def dlbls(ser_el, pos, color, size, fmt=None, bold=False, skip=(), point_colors=None, texts=None):
    old = ser_el.find(q("c:dLbls"))
    if old is not None: ser_el.remove(old)
    d = etree.Element(q("c:dLbls"))
    point_colors = point_colors or {}
    pts = sorted(set(int(i) for i in skip) | set(int(i) for i in point_colors) | set(i for i, t in enumerate(texts or []) if t is not None))
    for i in pts:
        dl = sub(d, "c:dLbl"); sub(dl, "c:idx", val=i)
        if i in [int(x) for x in skip] or (texts and i < len(texts) and texts[i] == ""): sub(dl, "c:delete", val=1); continue
        if texts and i < len(texts) and texts[i] is not None:
            pc_ = point_colors.get(str(i), point_colors.get(i, color))
            sub(dl, "c:layout"); rich_label(dl, texts[i], size, pc_, bold)
            sp_ = sub(dl, "c:spPr"); sub(sp_, "a:noFill"); ln_ = sub(sp_, "a:ln"); sub(ln_, "a:noFill")
            if pos: sub(dl, "c:dLblPos", val=pos)
            for tag, v in (("showLegendKey", 0), ("showVal", 1), ("showCatName", 0), ("showSerName", 0), ("showPercent", 0), ("showBubbleSize", 0)):
                sub(dl, "c:" + tag, val=v)
            continue
        if fmt: sub(dl, "c:numFmt", formatCode=fmt, sourceLinked=0)
        sp_ = sub(dl, "c:spPr"); sub(sp_, "a:noFill"); ln_ = sub(sp_, "a:ln"); sub(ln_, "a:noFill")
        txpr(dl, size, point_colors[str(i)] if str(i) in point_colors else point_colors[i], bold)
        if pos: sub(dl, "c:dLblPos", val=pos)
        for tag, v in (("showLegendKey", 0), ("showVal", 1), ("showCatName", 0), ("showSerName", 0), ("showPercent", 0), ("showBubbleSize", 0)):
            sub(dl, "c:" + tag, val=v)
    if fmt: sub(d, "c:numFmt", formatCode=fmt, sourceLinked=0)
    sp = sub(d, "c:spPr"); sub(sp, "a:noFill"); ln = sub(sp, "a:ln"); sub(ln, "a:noFill")
    txpr(d, size, color, bold)
    if pos: sub(d, "c:dLblPos", val=pos)
    for tag, v in (("showLegendKey", 0), ("showVal", 1), ("showCatName", 0), ("showSerName", 0), ("showPercent", 0), ("showBubbleSize", 0)):
        sub(d, "c:" + tag, val=v)
    # dLbls must sit before c:cat/c:val (schema order): after c:spPr/c:invertIfNegative/c:dPt
    anchor = None
    for tag in ("c:cat", "c:val", "c:xVal", "c:yVal", "c:smooth", "c:marker", "c:bubbleSize"):
        anchor = ser_el.find(q(tag))
        if anchor is not None: break
    if anchor is not None: anchor.addprevious(d)
    else: ser_el.append(d)

def pattern(ser_or_pt_fmt_el, prst, fg, bg="FFFFFF"):
    """hatched fill (e.g. wdUpDiag) on a series or point spPr"""
    sp = ser_or_pt_fmt_el
    for e in list(sp):
        if etree.QName(e).localname in ("solidFill", "noFill", "gradFill", "pattFill", "blipFill"): sp.remove(e)
    pf = etree.Element(q("a:pattFill"), prst=prst)
    f = sub(pf, "a:fgClr"); sub(f, "a:srgbClr", val=fg); g = sub(pf, "a:bgClr"); sub(g, "a:srgbClr", val=bg)
    sp.insert(0, pf)

def fill_ser(ser, color, line=False, width=2.0, invisible=False):
    if invisible:
        ser.format.fill.background(); ser.format.line.fill.background(); return
    if line:
        ser.format.line.color.rgb = RGBColor.from_string(color); ser.format.line.width = Pt(width)
    else:
        ser.format.fill.solid(); ser.format.fill.fore_color.rgb = RGBColor.from_string(color)
        ser.format.line.fill.background()

def manual_layout(chart, fx, fy, fw, fh):
    pa = chart._chartSpace.find(".//" + q("c:plotArea"))
    lay = pa.find(q("c:layout"))
    if lay is None: lay = etree.Element(q("c:layout")); pa.insert(0, lay)
    for ch in list(lay): lay.remove(ch)
    ml = sub(lay, "c:manualLayout"); sub(ml, "c:layoutTarget", val="inner"); sub(ml, "c:xMode", val="edge"); sub(ml, "c:yMode", val="edge")
    for k, v in (("x", fx), ("y", fy), ("w", fw), ("h", fh)): sub(ml, "c:" + k, val=round(v, 5))

def axis_style(ax_el, line_color=None, size=None, visible=True, color="404040", bold=False, rot=0):
    for tag in ("c:majorGridlines", "c:minorGridlines"):
        g = ax_el.find(q(tag))
        if g is not None: ax_el.remove(g)
    dele = ax_el.find(q("c:delete")); dele.set("val", "0" if visible else "1")
    sp = ax_el.find(q("c:spPr"))
    if sp is not None: ax_el.remove(sp)
    sp = etree.Element(q("c:spPr")); ln = sub(sp, "a:ln", w=9525)
    if line_color: sf = sub(ln, "a:solidFill"); sub(sf, "a:srgbClr", val=line_color)
    else: sub(ln, "a:noFill")
    old = ax_el.find(q("c:txPr"))
    if old is not None: ax_el.remove(old)
    # schema order: ... numFmt, majorTickMark, minorTickMark, tickLblPos, spPr, txPr, crossAx ...
    tlp = ax_el.find(q("c:tickLblPos"))
    if tlp is None: tlp = sub(ax_el, "c:tickLblPos", val="nextTo")
    tlp.set("val", "nextTo" if (visible and size) else "none")
    for tag in ("c:majorTickMark", "c:minorTickMark"):
        e = ax_el.find(q(tag))
        if e is not None: e.set("val", "none")
    tlp.addnext(sp)
    tx = etree.Element(q("c:txPr")); sp.addnext(tx)
    bp = sub(tx, "a:bodyPr", rot=str(int(rot * 60000)), vert="horz"); sub(tx, "a:lstStyle"); p = sub(tx, "a:p"); pp = sub(p, "a:pPr")   # labels level unless a rotation is given
    d = sub(pp, "a:defRPr", sz=int((size or 9) * 100), b=1 if bold else 0); sf = sub(d, "a:solidFill"); sub(sf, "a:srgbClr", val=color); sub(d, "a:latin", typeface="Arial")
    sub(p, "a:endParaRPr", lang="en-US")

def set_scale(ax_el, mn, mx):
    sc = ax_el.find(q("c:scaling"))
    for tag in ("c:max", "c:min"):
        e = sc.find(q(tag))
        if e is not None: sc.remove(e)
    o = sc.find(q("c:orientation"))
    if o is None: o = sub(sc, "c:orientation", val="minMax")
    e = etree.Element(q("c:max")); e.set("val", str(mx)); o.addnext(e)
    e2 = etree.Element(q("c:min")); e2.set("val", str(mn)); e.addnext(e2)

def no_frame(chart):
    cs = chart._chartSpace
    sp = cs.find(q("c:spPr"))
    if sp is None:
        sp = etree.Element(q("c:spPr")); cs.find(q("c:chart")).addnext(sp)
    for ch in list(sp): sp.remove(ch)
    sub(sp, "a:noFill"); ln = sub(sp, "a:ln"); sub(ln, "a:noFill")
    pa = cs.find(".//" + q("c:plotArea")); psp = pa.find(q("c:spPr"))
    if psp is None: psp = sub(pa, "c:spPr")
    for ch in list(psp): psp.remove(ch)
    sub(psp, "a:noFill"); ln = sub(psp, "a:ln"); sub(ln, "a:noFill")
    rc = cs.find(q("c:roundedCorners"))
    if rc is None:
        rc = etree.Element(q("c:roundedCorners")); cs.insert(0, rc)
    rc.set("val", "0")

def add_chart(slide, spec, px):
    t = spec["type"]; ct = TYPES[t]
    fx0, fy0, fx1, fy1 = spec.get("frame", spec["clear"])
    X, Y, W, H = Emu(int(fx0 * px)), Emu(int(fy0 * px)), Emu(int((fx1 - fx0) * px)), Emu(int((fy1 - fy0) * px))
    sers = spec["series"]; tot = spec.get("total")
    if t in ("scatter", "bubble"):
        cd = XyChartData() if t == "scatter" else BubbleChartData()
        for s in sers:
            ss = cd.add_series(s["name"])
            for pt in s["values"]: ss.add_data_point(*pt)
    else:
        cd = CategoryChartData(); cd.categories = spec["categories"]
        for s in sers: cd.add_series(s["name"], s["values"])
        if tot: cd.add_series("Total", tot["values"])
    gf = slide.shapes.add_chart(ct, X, Y, W, H, cd); ch = gf.chart
    if spec.get("z") == "back":                     # behind the slide's own text (labels written on bubbles, notes)
        tree = gf._element.getparent(); tree.remove(gf._element); tree.insert(2, gf._element)
    gf.name = "chart: " + spec.get("name", t)
    try: gf._element.xpath("./p:nvGraphicFramePr/p:cNvPr")[0].set("descr", spec.get("note", ""))
    except Exception: pass
    ch.has_legend = bool(spec.get("legend")); ch.has_title = False
    if spec.get("legend"):
        from pptx.enum.chart import XL_LEGEND_POSITION
        ch.legend.position = {"b": XL_LEGEND_POSITION.BOTTOM, "r": XL_LEGEND_POSITION.RIGHT, "t": XL_LEGEND_POSITION.TOP}[spec["legend"]]
        ch.legend.include_in_layout = False; ch.legend.font.size = Pt(spec.get("legend_size", 9))
    no_frame(ch)
    plot = ch.plots[0]
    xml_sers = plot._element.findall(q("c:ser"))
    for s, ser, el in zip(sers + ([tot] if tot else []), plot.series, xml_sers):
        is_line = t.startswith("line") or s.get("line")
        if t == "scatter" and s is not tot:
            from pptx.enum.chart import XL_MARKER_STYLE
            ser.format.line.fill.background()
            ser.marker.style = getattr(XL_MARKER_STYLE, s.get("marker_symbol", "CIRCLE")); ser.marker.size = int(s.get("marker_size", 8))
            ser.marker.format.fill.solid(); ser.marker.format.fill.fore_color.rgb = RGBColor.from_string(s.get("color", "808080"))
            ser.marker.format.line.fill.background()
            if s.get("labels"):
                dlbls(el, s.get("label_pos"), s.get("label_color", "404040"), s.get("label_size", 10), None, False, (), None, s.get("texts"))
            continue
        if s is tot:
            fill_ser(ser, "FFFFFF", invisible=True)
        else:
            fill_ser(ser, s.get("color", "808080"), line=is_line, width=s.get("width", 2.0), invisible=s.get("invisible", False))
            if is_line:
                from pptx.enum.chart import XL_MARKER_STYLE
                ser.smooth = False
                if t == "line_markers" or s.get("marker"):
                    ser.marker.style = getattr(XL_MARKER_STYLE, s.get("marker_symbol", "CIRCLE")); ser.marker.size = int(s.get("marker_size", 6))
                    ser.marker.format.fill.solid(); ser.marker.format.fill.fore_color.rgb = RGBColor.from_string(s.get("color", "808080"))
                    ser.marker.format.line.color.rgb = RGBColor.from_string(s.get("color", "808080"))
                else:
                    ser.marker.style = XL_MARKER_STYLE.NONE
        if s.get("pattern"):
            spel = el.find(q("c:spPr")); pattern(spel, s["pattern"], s.get("color", "808080"), s.get("pattern_bg", "FFFFFF"))
            if s.get("outline"):
                ser.format.line.color.rgb = RGBColor.from_string(s["outline"]); ser.format.line.width = Pt(0.75)
        for i, (c1, c2) in (s.get("grads") or {}).items():         # two-colour points (e.g. half red, half green)
            pt = ser.points[int(i)]; pt.format.fill.gradient(); pt.format.fill.gradient_angle = 0
            st_ = pt.format.fill.gradient_stops
            st_[0].color.rgb = RGBColor.from_string(c1); st_[0].position = 0.45
            st_[1].color.rgb = RGBColor.from_string(c2); st_[1].position = 0.55
        for i, c in enumerate(s.get("colors", [])):
            if not c: continue
            pt = ser.points[i]
            if c == "none": pt.format.fill.background(); pt.format.line.fill.background(); continue
            pt.format.fill.solid(); pt.format.fill.fore_color.rgb = RGBColor.from_string(c)
            if t in ("pie", "doughnut"): pt.format.line.color.rgb = RGBColor(255, 255, 255)
            else: pt.format.line.fill.background()
        if s.get("labels"):
            dlbls(el, s.get("label_pos"), s.get("label_color", "404040"), s.get("label_size", spec.get("label_size", 10)), s.get("fmt"), s.get("label_bold", False), s.get("label_skip", ()), s.get("label_colors"), s.get("texts"))
        for i, pct in (s.get("explode") or {}).items():         # pulled-out slices
            pt = ser.points[int(i)]; pt.format                      # makes the c:dPt
            dpt = [e for e in el.findall(q("c:dPt")) if e.find(q("c:idx")).get("val") == str(int(i))]
            if dpt:
                ex = dpt[0].find(q("c:explosion"))
                if ex is None:
                    ex = etree.Element(q("c:explosion")); dpt[0].find(q("c:invertIfNegative")) if False else None
                    inv = dpt[0].find(q("c:invertIfNegative")); bub = dpt[0].find(q("c:bubble3D"))
                    anchor = bub if bub is not None else (inv if inv is not None else dpt[0].find(q("c:marker")))
                    (anchor.addnext(ex) if anchor is not None else dpt[0].find(q("c:idx")).addnext(ex))
                ex.set("val", str(int(pct)))
    if t in ("pie", "doughnut"):
        if spec.get("first_angle") is not None:
            fa = plot._element.find(q("c:firstSliceAng"))
            if fa is None: fa = sub(plot._element, "c:firstSliceAng")
            fa.set("val", str(spec["first_angle"]))
        if t == "doughnut":
            hs = plot._element.find(q("c:holeSize")); hs.set("val", str(spec.get("hole", 55)))
        manual_layout(ch, 0, 0, 1, 1)
        return gf
    if t not in ("scatter", "bubble"):
        if "gap" in spec or "bar" in spec:
            pass
        g = plot._element.find(q("c:gapWidth"))
        if g is None: g = sub(plot._element, "c:gapWidth")
        if "stacked" in t:
            ov = plot._element.find(q("c:overlap"))
            if ov is None: ov = etree.Element(q("c:overlap")); g.addnext(ov)
            ov.set("val", "100")
    lines_ = [el for s, el in zip(sers, xml_sers) if s.get("as_line")]
    if lines_ and t not in ("pie", "doughnut", "scatter", "bubble"):
        bar = plot._element
        lc = etree.Element(q("c:lineChart")); sub(lc, "c:grouping", val="standard"); sub(lc, "c:varyColors", val=0)
        for s, el in zip(sers, xml_sers):
            if not s.get("as_line"): continue
            bar.remove(el); lc.append(el)
            for e in el.findall(q("c:invertIfNegative")): el.remove(e)
            sp_ = el.find(q("c:spPr"))
            if sp_ is not None: el.remove(sp_)
            sp_ = etree.Element(q("c:spPr")); ln = sub(sp_, "a:ln", w=int(s.get("width", 1.5) * 12700))
            sf = sub(ln, "a:solidFill"); sub(sf, "a:srgbClr", val=s.get("color", "808080"))
            if s.get("dash"): sub(ln, "a:prstDash", val=s["dash"])
            el.find(q("c:tx")).addnext(sp_)
            mk = etree.Element(q("c:marker"))
            if s.get("marker"):
                sub(mk, "c:symbol", val="circle"); sub(mk, "c:size", val=int(s.get("marker_size", 6)))
                msp = sub(mk, "c:spPr"); mf = sub(msp, "a:solidFill"); sub(mf, "a:srgbClr", val=s.get("color", "808080"))
            else: sub(mk, "c:symbol", val="none")
            sp_.addnext(mk)
            sm = el.find(q("c:smooth"))
            if sm is None: sub(el, "c:smooth", val=0)
        sub(lc, "c:marker", val=1)
        for ax in bar.findall(q("c:axId")): sub(lc, "c:axId", val=ax.get("val"))
        bar.addnext(lc)
    if tot:
        # move the Total series into a line chart on the same axes: labels only, no line, no marker
        bar = plot._element; tot_el = bar.findall(q("c:ser"))[-1]; bar.remove(tot_el)
        lc = etree.Element(q("c:lineChart")); sub(lc, "c:grouping", val="standard"); sub(lc, "c:varyColors", val=0)
        lc.append(tot_el)
        sp = tot_el.find(q("c:spPr"))
        if sp is not None: tot_el.remove(sp)
        sp = etree.Element(q("c:spPr")); ln = sub(sp, "a:ln"); sub(ln, "a:noFill")
        tot_el.find(q("c:tx")).addnext(sp)
        mk = etree.Element(q("c:marker")); sub(mk, "c:symbol", val="none"); sp.addnext(mk)
        for e in tot_el.findall(q("c:invertIfNegative")): tot_el.remove(e)
        dlbls(tot_el, "t", tot.get("color", "404040"), tot.get("size", spec.get("label_size", 10)), tot.get("fmt"), tot.get("bold", False), texts=tot.get("texts"))
        sub(lc, "c:marker", val=1)
        for ax in bar.findall(q("c:axId")): sub(lc, "c:axId", val=ax.get("val"))
        bar.addnext(lc)
    # axes and geometry
    pa = ch._chartSpace.find(".//" + q("c:plotArea"))
    cat_ax = pa.find(q("c:catAx")); val_ax = pa.find(q("c:valAx"))
    if t in ("scatter", "bubble"):
        vals = pa.findall(q("c:valAx")); xa, ya = vals[0], vals[1]
        set_scale(xa, *spec["x_axis"]); set_scale(ya, *spec["y_axis"])
        axis_style(xa, spec.get("axis_line"), spec.get("x_size"), visible=bool(spec.get("x_size")))
        axis_style(ya, spec.get("axis_line"), spec.get("y_size"), visible=bool(spec.get("y_size")))
        px0, py0, px1, py1 = spec["plot"]
        manual_layout(ch, (px0 - fx0) / (fx1 - fx0), (py0 - fy0) / (fy1 - fy0), (px1 - px0) / (fx1 - fx0), (py1 - py0) / (fy1 - fy0))
        if t == "bubble":
            bs = plot._element.find(q("c:bubbleScale"))
            if bs is None:
                bs = etree.Element(q("c:bubbleScale")); plot._element.find(q("c:axId")).addprevious(bs)
            bs.set("val", str(spec.get("bubble_scale", 100)))
        return gf
    axis_style(cat_ax, spec.get("axis_line"), spec.get("cat_size"), visible=spec.get("cat_size") is not None, color=spec.get("cat_color", "404040"), bold=spec.get("cat_bold", False), rot=spec.get("cat_rot", 0))
    axis_style(val_ax, spec.get("val_line"), spec.get("val_size"), visible=spec.get("val_size") is not None)
    if spec.get("val_fmt"):
        nf = val_ax.find(q("c:numFmt"))
        if nf is None: nf = etree.Element(q("c:numFmt")); val_ax.find(q("c:axPos")).addnext(nf)
        nf.set("formatCode", spec["val_fmt"]); nf.set("sourceLinked", "0")
    if spec.get("major"):
        mu = val_ax.find(q("c:majorUnit"))
        if mu is None:
            mu = etree.Element(q("c:majorUnit")); cb = val_ax.find(q("c:crossBetween"))
            (cb.addnext(mu) if cb is not None else val_ax.append(mu))
        mu.set("val", str(spec["major"]))
    n = len(spec["categories"]); c0, c1 = spec["centers"]; pitch = (c1 - c0) / (n - 1) if n > 1 else spec["bar"] * 2
    horiz = t.startswith("bar")
    if "bar" in spec:
        gap = max(0, min(500, round((abs(pitch) - spec["bar"]) / spec["bar"] * 100)))
        plot._element.find(q("c:gapWidth")).set("val", str(gap))
    if "overlap" in spec:
        g = plot._element.find(q("c:gapWidth")); ov = plot._element.find(q("c:overlap"))
        if ov is None: ov = etree.Element(q("c:overlap")); g.addnext(ov)
        ov.set("val", str(int(spec["overlap"])))
    k = spec["k"]; base = spec["base"]
    if not horiz:
        top = spec.get("top", fy0); mx = spec.get("min", 0) + (base - top) / k
        set_scale(val_ax, spec.get("min", 0), round(mx, 4) if "100" not in t else 1)
        manual_layout(ch, (c0 - pitch / 2 - fx0) / (fx1 - fx0), (top - fy0) / (fy1 - fy0), (n * pitch) / (fx1 - fx0), (base - top) / (fy1 - fy0))
    else:
        end = spec.get("top", fx1); mx = (end - base) / k
        set_scale(val_ax, spec.get("min", 0), round(mx, 4) if "100" not in t else 1)
        # bar charts list categories bottom-up; reverse so the first category is on top like the source
        sc = cat_ax.find(q("c:scaling")); o_ = sc.find(q("c:orientation"))
        if o_ is None: o_ = sub(sc, "c:orientation")
        o_.set("val", "maxMin")
        cr = val_ax.find(q("c:crosses"))
        if cr is not None: cr.set("val", "max")
        top_c = min(c0, c1) - abs(pitch) / 2
        manual_layout(ch, (base - fx0) / (fx1 - fx0), (top_c - fy0) / (fy1 - fy0), (end - base) / (fx1 - fx0), (n * abs(pitch)) / (fy1 - fy0))
    return gf

def main():
    deck, key, spec_p, out = sys.argv[1:5]
    prs = Presentation(deck)
    spec = json.load(open(spec_p)); px = prs.slide_width / spec["page_w"]
    for c in spec["charts"]:
        s = prs.slides[c["slide"] - 1]
        boxes = c["clear"] if isinstance(c["clear"][0], list) else [c["clear"]]
        n = 0
        for bx in boxes + c.get("extra_clear", []):
            n += clear_region(s, bx, px, c.get("keep", []), c.get("keep_colors", []), c.get("strip_lines", []), c.get("remove_pictures", False))
        add_chart(s, c, px)
        print(f"slide {c['slide']}: {c.get('name', c['type'])}: removed {n} traced shapes, native {c['type']} chart added")
    for tf_ in spec.get("text_fix", []):                 # OCR misreads: right text and place, measured on the page
        s = prs.slides[tf_["slide"] - 1]
        for sh in s.shapes:
            if sh.name != tf_["name"]: continue
            x0, y0, x1, y1 = tf_["box"]
            sh.left, sh.top, sh.width, sh.height = [Emu(int(round(v * px))) for v in (x0, y0, x1 - x0 + 8, y1 - y0)]
            p = sh.text_frame.paragraphs[0]; rs = p.runs
            for r in rs[1:]: r._r.getparent().remove(r._r)
            r = rs[0]; r.text = tf_["text"]
            if "size" in tf_: r.font.size = Pt(tf_["size"])
            if "italic" in tf_: r.font.italic = tf_["italic"]
            if "underline" in tf_: r.font.underline = tf_["underline"]
            if "bold" in tf_: r.font.bold = tf_["bold"]
            print(f"slide {tf_['slide']}: text fixed in {sh.name}: {tf_['text']}")
    for tb in spec.get("tables", []):
        import tables
        s = prs.slides[tb["slide"] - 1]
        n = 0
        for bx in tb.get("clear", []):
            n += clear_region(s, bx, px, tb.get("keep", []), tb.get("keep_colors", []), (), tb.get("remove_pictures", False))
        tables.build(s, tb, px)
        print(f"slide {tb['slide']}: {tb.get('name')}: removed {n} traced shapes, native table added")
    for o in spec.get("overlays", []):
        s = prs.slides[o["slide"] - 1]
        for sh in list(s.shapes):
            if sh.name in o.get("remove", []): sh._element.getparent().remove(sh._element)
        for bx in o.get("clear", []):
            clear_region(s, bx, px, o.get("keep", []), o.get("keep_colors", []), (), o.get("remove_pictures", False), o.get("keep_max", 1e12))
        for f in o.get("fills", []):
            for sh in s.shapes:
                if sh.has_text_frame and re.search(f["match"], sh.text_frame.text.strip()):
                    sh.fill.solid(); sh.fill.fore_color.rgb = RGBColor.from_string(f["fill"])
                    tf = sh.text_frame; tf.margin_left = tf.margin_right = Emu(int(4 * px))
        for d in o.get("shapes", []): add_overlay(s, d, px)
        for f in o.get("fills", []):                       # filled labels sit above the lines drawn through them
            for sh in list(s.shapes):
                if sh.has_text_frame and re.search(f["match"], sh.text_frame.text.strip()):
                    el = sh._element; tree = el.getparent(); tree.remove(el); tree.append(el)
        print(f"slide {o['slide']}: removed {len(o.get('remove', []))} picture crops, added {len(o.get('shapes', []))} native shapes")
    prs.save(out)

def add_overlay(slide, d, px):
    sh = _add_overlay(slide, d, px)
    if d.get("z") == "back" and sh is not None:
        tree = sh._element.getparent(); tree.remove(sh._element); tree.insert(2, sh._element)
    return sh

def _add_overlay(slide, d, px):
    from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
    from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
    from pptx.util import Emu
    E = lambda v: Emu(int(round(v * px)))
    if d["type"] == "line":
        (x0, y0), (x1, y1) = d["from"], d["to"]
        ln = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, E(x0), E(y0), E(x1), E(y1))
        ln.line.color.rgb = RGBColor.from_string(d.get("color", "000000")); ln.line.width = E(d.get("w", 2))
        lnx = ln.line._get_or_add_ln()
        if d.get("dash"):
            pd = lnx.makeelement(q("a:prstDash"), {"val": d["dash"]}); lnx.append(pd)
        if d.get("tail_start"):
            lnx.append(lnx.makeelement(q("a:headEnd"), {"type": d["tail_start"], "w": "med", "len": "med"}))
        if d.get("head"):
            te = lnx.makeelement(q("a:tailEnd"), {"type": d["head"], "w": "med", "len": "med"}); lnx.append(te)
        ln.name = d.get("name", "line")
        return ln
    if d["type"] == "text":
        x0, y0 = d["xy"]
        tb = slide.shapes.add_textbox(E(x0), E(y0), E(d.get("w", 100)), E(d.get("h", 20)))
        tf = tb.text_frame; tf.word_wrap = False
        for a in ("margin_left", "margin_right", "margin_top", "margin_bottom"): setattr(tf, a, 0)
        for i, t in enumerate(d["lines"]):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            r = p.add_run(); r.text = t; r.font.size = Pt(d.get("size", 12)); r.font.bold = d.get("bold", False)
            r.font.name = "Arial"; r.font.color.rgb = RGBColor.from_string(d.get("color", "000000"))
        tb.name = d.get("name", "text"); return tb
    shp = {"ellipse": MSO_SHAPE.OVAL, "rect": MSO_SHAPE.RECTANGLE, "rounded": MSO_SHAPE.ROUNDED_RECTANGLE}[d["type"]]
    x0, y0, x1, y1 = d["box"]
    sh = slide.shapes.add_shape(shp, E(x0), E(y0), E(x1 - x0), E(y1 - y0))
    if d.get("fill"): sh.fill.solid(); sh.fill.fore_color.rgb = RGBColor.from_string(d["fill"])
    else: sh.fill.background()
    if d.get("line"):
        sh.line.color.rgb = RGBColor.from_string(d["line"]); sh.line.width = E(d.get("w", 2))
        if d.get("dash"):
            lnx = sh.line._get_or_add_ln(); lnx.append(lnx.makeelement(q("a:prstDash"), {"val": d["dash"]}))
    else: sh.line.fill.background()
    sh.shadow.inherit = False
    tf = sh.text_frame
    for a in ("margin_left", "margin_right", "margin_top", "margin_bottom"): setattr(tf, a, 0)
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE; tf.word_wrap = False
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    if d.get("text"):
        r = p.add_run(); r.text = d["text"]; r.font.size = Pt(d.get("size", 10)); r.font.bold = d.get("bold", False)
        r.font.name = "Arial"; r.font.color.rgb = RGBColor.from_string(d.get("color", "000000"))
    sh.name = d.get("name", d["type"])
    return sh

if __name__ == "__main__":
    main()
