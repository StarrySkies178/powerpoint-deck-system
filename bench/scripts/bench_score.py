"""bench_score.py: score a candidate slide against the original reference slide.

Three parts:
  standards  exact checks read from the .pptx (slide size, title position/size/bold/colour/font,
             body text sizes, fonts, body margins, colours, source line), each with a tolerance
  layout     where things sit: ink occupancy of the two renders on a 32x18 grid (IoU)
  visual     how alike the renders look: colour + edge similarity
Layout and visual are normalised against the same deck: 0 = as alike as two unrelated slides of
that deck, 1 = identical.  Pass bar (fixed in bench/README.md before any run):
  every applicable standards check passes, layout >= 0.60, visual >= 0.50
  (cases marked "translated": standards + layout only)

Usage (library): measure(pptx, slide_no) / render(pptx, slide_no) / score_case(case_dir)
"""
import os, re, json, math, subprocess, tempfile, shutil, statistics as st, collections
import numpy as np
from PIL import Image, ImageFilter
from pptx import Presentation
from pptx.oxml.ns import qn

EMU = 914400
RENDER_W = 1280
PASS = {"layout": 0.60, "visual": 0.50}
TOL = {"size_in": 0.05, "title_left_in": 0.15, "title_top_in": 0.25, "title_pt": 1.0, "title_de": 10,
       "body_med_pt": 1.5, "body_min_pt": 1.0, "margin_in": 0.25, "colour_de": 15, "source_pt": 1.0, "source_top_in": 0.25}

# ---------------------------------------------------------------- colour helpers
def hex2rgb(h): h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def rgb2hex(c): return "%02X%02X%02X" % tuple(int(round(max(0, min(255, v)))) for v in c)
def _lin(c): c = c / 255.0; return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def rgb2lab(arr):
    a = _lin(np.asarray(arr, dtype=float))
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = a @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)
def de(h1, h2): return float(np.linalg.norm(rgb2lab(hex2rgb(h1)) - rgb2lab(hex2rgb(h2))))
def lum_mod(hexc, mod=None, off=None, tint=None, shade=None):
    import colorsys
    r, g, b = [v / 255 for v in hex2rgb(hexc)]
    if tint is not None: r, g, b = [v + (1 - v) * (1 - tint) for v in (r, g, b)]
    if shade is not None: r, g, b = [v * shade for v in (r, g, b)]
    if mod is not None or off is not None:
        h, l, s = colorsys.rgb_to_hls(r, g, b); l = l * (mod if mod is not None else 1) + (off or 0)
        r, g, b = colorsys.hls_to_rgb(h, max(0, min(1, l)), s)
    return rgb2hex((r * 255, g * 255, b * 255))

# ---------------------------------------------------------------- theme + inheritance
class Ctx:
    def __init__(self, prs, slide):
        self.prs, self.slide = prs, slide
        self.layout = slide.slide_layout; self.master = self.layout.slide_master
        theme = None
        for rel in self.master.part.rels.values():
            if rel.reltype.endswith("/theme"): theme = rel.target_part
        from lxml import etree
        self.theme = etree.fromstring(theme.blob) if theme is not None else None
        A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
        self.A = A
        self.scheme, self.fonts = {}, {}
        if self.theme is not None:
            cs = self.theme.find(f".//{A}clrScheme")
            for el in cs:
                tag = el.tag.split("}")[1]; c = el[0]
                self.scheme[tag] = c.get("val") if c.tag.endswith("srgbClr") else (c.get("lastClr") or "000000")
            fs = self.theme.find(f".//{A}fontScheme")
            for k, n in (("major", "majorFont"), ("minor", "minorFont")):
                f = fs.find(f"{A}{n}")
                self.fonts[k + "-lt"] = f.find(f"{A}latin").get("typeface")
                self.fonts[k + "-ea"] = (f.find(f"{A}ea").get("typeface") or "") if f.find(f"{A}ea") is not None else ""
        cm = self.master._element.find(qn("p:clrMap"))
        self.clrmap = dict(cm.attrib) if cm is not None else {"tx1": "dk1", "bg1": "lt1", "tx2": "dk2", "bg2": "lt2"}
        tx = self.master._element.find(qn("p:txStyles"))
        self.txstyles = {k: (tx.find(qn(f"p:{k}")) if tx is not None else None) for k in ("titleStyle", "bodyStyle", "otherStyle")}
        self.deflt = prs.part._element.find(qn("p:defaultTextStyle"))

    def colour(self, el):
        """resolve an a:solidFill (or colour element) to hex"""
        if el is None: return None
        c = el[0] if el.tag.endswith("solidFill") and len(el) else el
        tag = c.tag.split("}")[1]
        if tag == "srgbClr": base = c.get("val")
        elif tag == "schemeClr":
            v = c.get("val"); v = self.clrmap.get(v, v); base = self.scheme.get(v, "000000")
        elif tag == "sysClr": base = c.get("lastClr") or "000000"
        elif tag == "prstClr": base = {"black": "000000", "white": "FFFFFF"}.get(c.get("val"), "000000")
        else: return None
        kw = {}
        for m in c:
            t = m.tag.split("}")[1]; val = int(m.get("val")) / 100000
            if t == "lumMod": kw["mod"] = val
            elif t == "lumOff": kw["off"] = val
            elif t == "tint": kw["tint"] = val
            elif t == "shade": kw["shade"] = val
        return lum_mod(base, **kw) if kw else base.upper()

    def font(self, tf):
        if tf is None: return None
        if tf.startswith("+"):
            k = tf[1:].replace("mj", "major").replace("mn", "minor")
            return self.fonts.get(k, tf)
        return tf

def _lvl_props(lst, lvl):
    if lst is None: return None
    return lst.find(qn(f"a:lvl{lvl}pPr"))

def _ph_chain(ctx, sh):
    """placeholder shapes on layout and master that this shape inherits from"""
    out = []
    try: ph = sh.placeholder_format
    except Exception: return out
    if ph is None: return out
    idx, typ = ph.idx, ph.type
    for src in (ctx.layout, ctx.master):
        for p in src.placeholders:
            pf = p.placeholder_format
            if pf.idx == idx or (pf.type == typ and typ is not None and str(typ) != "BODY (2)") or \
               (str(typ).startswith("CENTER_TITLE") and str(pf.type).startswith("TITLE")):
                out.append(p); break
    return out

def _style_key(sh):
    try:
        t = str(sh.placeholder_format.type)
        if "TITLE" in t: return "titleStyle"
        return "bodyStyle"
    except Exception:
        return "otherStyle"

def run_props(ctx, sh, para, run):
    """resolved (size_pt, bold, latin, ea, colour) for a run"""
    lvl = (para.level or 0) + 1
    chain = []
    rpr = run._r.find(qn("a:rPr")); chain.append(rpr)
    ppr = para._p.find(qn("a:pPr"))
    if ppr is not None: chain.append(ppr.find(qn("a:defRPr")))
    def add_lst(shape_el):
        tb = shape_el.find(qn("p:txBody"))
        if tb is not None:
            lp = _lvl_props(tb.find(qn("a:lstStyle")), lvl)
            if lp is not None: chain.append(lp.find(qn("a:defRPr")))
    add_lst(sh._element)
    for p in _ph_chain(ctx, sh): add_lst(p._element)
    ts = ctx.txstyles.get(_style_key(sh))
    lp = _lvl_props(ts, lvl)
    if lp is not None: chain.append(lp.find(qn("a:defRPr")))
    lp = _lvl_props(ctx.deflt, lvl)
    if lp is not None: chain.append(lp.find(qn("a:defRPr")))
    chain = [c for c in chain if c is not None]
    size = bold = latin = ea = col = None
    for c in chain:
        if size is None and c.get("sz"): size = int(c.get("sz")) / 100
        if bold is None and c.get("b") is not None: bold = c.get("b") in ("1", "true")
        if latin is None and c.find(qn("a:latin")) is not None: latin = ctx.font(c.find(qn("a:latin")).get("typeface"))
        if ea is None and c.find(qn("a:ea")) is not None: ea = ctx.font(c.find(qn("a:ea")).get("typeface"))
        if col is None and c.find(qn("a:solidFill")) is not None: col = ctx.colour(c.find(qn("a:solidFill")))
    # autofit scale
    tb = sh._element.find(qn("p:txBody"))
    if tb is not None and size:
        na = tb.find(qn("a:bodyPr") + "/" + qn("a:normAutofit"))
        if na is not None and na.get("fontScale"): size = size * int(na.get("fontScale")) / 100000
    if latin is None: latin = ctx.fonts.get("major-lt" if _style_key(sh) == "titleStyle" else "minor-lt")
    if ea is None: ea = ctx.fonts.get("major-ea" if _style_key(sh) == "titleStyle" else "minor-ea")
    if col is None:
        col = ctx.colour_default if hasattr(ctx, "colour_default") else ctx.scheme.get(ctx.clrmap.get("tx1", "dk1"), "000000")
    return (size or 18.0, bool(bold), latin, ea, col)

# ---------------------------------------------------------------- shapes with absolute geometry
def walk(shapes, xf=(0, 0, 1, 1)):
    ox, oy, sx, sy = xf
    for sh in shapes:
        try: is_group = sh.shape_type == 6
        except Exception: is_group = False
        if sh.left is None: continue
        x, y, w, h = ox + sh.left * sx, oy + sh.top * sy, (sh.width or 0) * sx, (sh.height or 0) * sy
        if is_group:
            g = sh._element.find(qn("p:grpSpPr") + "/" + qn("a:xfrm"))
            co, ce = g.find(qn("a:chOff")), g.find(qn("a:chExt"))
            if co is not None and ce is not None and int(ce.get("cx")) and int(ce.get("cy")):
                ncx, ncy = w / int(ce.get("cx")), h / int(ce.get("cy"))
                nxf = (x - int(co.get("x")) * ncx, y - int(co.get("y")) * ncy, ncx, ncy)
            else: nxf = (x - sh.left, y - sh.top, 1, 1)
            yield from walk(sh.shapes, nxf)
        else:
            rot = (getattr(sh, "rotation", 0) or 0) % 180
            if 45 < rot < 135: x, y, w, h = x + (w - h) / 2, y + (h - w) / 2, h, w   # quarter-turned: swap around the centre
            yield sh, (x / EMU, y / EMU, w / EMU, h / EMU)


# ---------------------------------------------------------------- line wrapping with real font metrics
from PIL import ImageFont
import subprocess as _sp
_FONTS = {}
def _font(name, bold, pt):
    key = (name, bold, round(pt * 4))
    if key not in _FONTS:
        try:
            f = _sp.run(["fc-match", "-f", "%{file}", f"{name or 'Arial'}:{'bold' if bold else 'regular'}"], capture_output=True, text=True).stdout.strip()
            _FONTS[key] = ImageFont.truetype(f, max(1, int(round(pt * 4))))   # 4 px per pt
        except Exception:
            _FONTS[key] = ImageFont.load_default()
    return _FONTS[key]
def count_lines(paras, width_in):
    """paras: list of (text, font, bold, pt). Word-wrap each paragraph at width_in; returns (lines, line heights in inches)."""
    hs = []
    for text, font, bold, pt in paras:
        f = _font(font, bold, pt); maxw = width_in * 72 * 4 * 1.02   # 2%: renderers kern a little differently
        words = text.replace("\t", " ").split(" "); cur = ""; n = 1
        for w_ in words:
            trial = (cur + " " + w_).strip()
            if f.getlength(trial) <= maxw or not cur: cur = trial
            else: n += 1; cur = w_
        hs += [pt * 1.2 / 72] * n
    return len(hs), hs
def inherited_anchor(ctx, sh):
    bp = sh.text_frame._txBody.find(qn("a:bodyPr"))
    if bp is not None and bp.get("anchor"): return bp.get("anchor")
    for p in _ph_chain(ctx, sh):
        b2 = p._element.find(qn("p:txBody") + "/" + qn("a:bodyPr"))
        if b2 is not None and b2.get("anchor"): return b2.get("anchor")
    return "t"
def insets(sh):
    bp = sh.text_frame._txBody.find(qn("a:bodyPr"))
    g = lambda k, d: int(bp.get(k)) / EMU if bp is not None and bp.get(k) is not None else d
    return g("lIns", 0.1), g("tIns", 0.05), g("rIns", 0.1), g("bIns", 0.05)

CJK = re.compile(r"[　-〿一-鿿＀-￯]")
SRC = re.compile(r"^\s*(source|sources|quote source|note|notes|来源|资料来源|注)\s*[:：]?", re.I)

def measure(pptx_path, slide_no):
    prs = Presentation(pptx_path); slide = prs.slides[slide_no - 1]; ctx = Ctx(prs, slide)
    W, H = prs.slide_width / EMU, prs.slide_height / EMU
    texts, boxes, chart_runs = [], [], []
    for sh, (x, y, w, h) in walk(slide.shapes):
        full = w > 0.95 * W and h > 0.95 * H
        if not full and w * h > 0: boxes.append((x, y, w, h))
        if getattr(sh, "has_chart", False) and sh.has_chart and not full:   # native chart labels are slide text too
            cx = sh.chart._chartSpace
            szs = [int(e.get("sz")) / 100 for e in cx.iter(qn("a:defRPr")) if e.get("sz")] + [int(e.get("sz")) / 100 for e in cx.iter(qn("a:rPr")) if e.get("sz")]
            if szs:
                pt = collections.Counter(szs).most_common(1)[0][0]
                try:
                    cats = [str(c) for c in sh.chart.plots[0].categories]; nv = sum(len(list(se.values)) for pl in sh.chart.plots for se in pl.series)
                except Exception: cats, nv = [], 0
                n_ch = sum(len(c) for c in cats) + 4 * nv
                if n_ch: chart_runs.append((pt, n_ch, (x, y, w, h)))
        if not getattr(sh, "has_text_frame", False) or not sh.has_text_frame: continue
        runs = []
        for p in sh.text_frame.paragraphs:
            for r in p.runs:
                if r.text.strip(): runs.append((r.text,) + run_props(ctx, sh, p, r))
        if not runs: continue
        t = "".join(r[0] for r in runs)
        ph = None
        try: ph = str(sh.placeholder_format.type)
        except Exception: pass
        anchor = inherited_anchor(ctx, sh)
        npara = sum(1 for p in sh.text_frame.paragraphs if p.text.strip())
        paras = []
        for p in sh.text_frame.paragraphs:
            rr = [r for r in p.runs if r.text.strip()]
            if rr:
                rp = run_props(ctx, sh, p, rr[0]); paras.append(("".join(r.text for r in p.runs), rp[2], rp[1], max(run_props(ctx, sh, p, r)[0] for r in rr)))
        ins = insets(sh)
        texts.append(dict(text=t, x=x, y=y, w=w, h=h, ph=ph, anchor=anchor or "t", runs=runs, npara=npara, paras=paras, ins=ins,
                          size=max(r[1] for r in runs)))
    # title: title placeholder with text, else the largest text in the top 25%
    title = None
    # the biggest text in the top quarter (a title placeholder wins ties); breadcrumbs (► | >) are skipped
    top = [t for t in texts if t["y"] < 0.25 * H and len(t["text"].strip()) >= 3 and not SRC.match(t["text"])
           and not re.search(r"►|▶|»|\s>\s", t["text"])]
    if top:
        title = max(top, key=lambda t: (round(t["size"]), bool(t["ph"] and "TITLE" in t["ph"]), -t["y"]))
    src = [t for t in texts if SRC.match(t["text"]) and t["y"] > 0.75 * H]
    src = min(src, key=lambda t: -t["y"]) if src else None
    t_bot = (title["y"] + title["h"]) if title else 0.2 * H
    s_top = src["y"] if src else 0.93 * H
    body = [t for t in texts if t is not title and t is not src and t["y"] + t["h"] / 2 > t_bot and t["y"] + t["h"] / 2 < s_top]
    sizes = [r[1] for t in body for r in t["runs"] for _ in range(max(1, len(r[0]) // 10))]
    sizes += [pt for pt, n_ch, (x, y, w, h) in chart_runs if t_bot < y + h / 2 < s_top for _ in range(max(1, n_ch // 10))]
    bb = [b for b in boxes if b[1] + b[3] / 2 > t_bot - 0.05 and b[1] + b[3] / 2 < s_top and b[2] < 0.98 * W]
    latin = collections.Counter(r[3] for t in texts for r in t["runs"] if r[3])
    cjk_text = any(CJK.search(t["text"]) for t in texts)
    ea = collections.Counter(r[4] for t in texts for r in t["runs"] if r[4] and CJK.search(r[0]))
    def text_top(t):
        l, tp, r, b = t["ins"]
        n, hs = count_lines([(a, f, bo, pt) for a, bo, f, pt in t["paras"]], max(0.1, t["w"] - l - r))
        th = sum(hs)
        if t["anchor"] == "b": return t["y"] + t["h"] - b - th
        if t["anchor"] == "ctr": return t["y"] + (t["h"] - th) / 2
        return t["y"] + tp
    out = dict(size_in=[round(W, 3), round(H, 3)])
    if title:
        r0 = [r for r in title["runs"] if r[1] == title["size"]][0]   # first run at the title size
        above = [t["y"] + t["h"] for t in texts if t is not title and t["y"] + t["h"] <= title["y"] + 0.05 and t["x"] < title["x"] + title["w"] and t["x"] + t["w"] > title["x"]]
        out["title"] = dict(text=title["text"][:120], left_in=round(title["x"] + title["ins"][0], 3), top_in=round(text_top(title), 3),
                            box=[round(v, 3) for v in (title["x"], title["y"], title["w"], title["h"])], above=round(max(above), 3) if above else 0,
                            pt=round(r0[1], 1), bold=r0[2], font=r0[3], colour=r0[5])
    if sizes:
        out["body"] = dict(median_pt=round(st.median(sizes), 1), min_pt=round(min(sizes), 1))
    if bb:
        out["margins"] = dict(left_in=round(min(b[0] for b in bb), 3), right_in=round(W - max(b[0] + b[2] for b in bb), 3))
    out["fonts"] = dict(latin=sorted(latin), ea=sorted(ea), cjk=cjk_text)
    if src:
        out["source"] = dict(pt=round(min(r[1] for r in src["runs"]), 1), top_in=round(src["y"], 3))
    out["theme_colours"] = sorted(set(v.upper() for k, v in ctx.scheme.items()))
    return out

# ---------------------------------------------------------------- rendering
def render(pptx_path, slide_no, out_png):
    d = tempfile.mkdtemp()
    try:
        src = os.path.join(d, "x.pptx"); shutil.copy(pptx_path, src)
        subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", d, src], capture_output=True, timeout=600)
        subprocess.run(["pdftoppm", "-png", "-f", str(slide_no), "-l", str(slide_no), "-scale-to-x", str(RENDER_W), "-scale-to-y", "-1",
                        os.path.join(d, "x.pdf"), os.path.join(d, "p")], check=True)
        p = [f for f in os.listdir(d) if f.startswith("p") and f.endswith(".png")][0]
        shutil.copy(os.path.join(d, p), out_png)
    finally:
        shutil.rmtree(d, ignore_errors=True)
    return out_png

def render_pdf_page(pdf, page, out_png):
    base = out_png[:-4]
    subprocess.run(["pdftoppm", "-png", "-singlefile", "-f", str(page), "-l", str(page), "-scale-to-x", str(RENDER_W), "-scale-to-y", "-1", pdf, base], check=True)
    return out_png

# ---------------------------------------------------------------- visual + layout
def _prep(png, size):
    return Image.open(png).convert("RGB").resize(size, Image.LANCZOS)

def visual_raw(a_png, b_png):
    A, B = _prep(a_png, (160, 90)), _prep(b_png, (160, 90))
    la, lb = rgb2lab(np.asarray(A.filter(ImageFilter.GaussianBlur(1)))), rgb2lab(np.asarray(B.filter(ImageFilter.GaussianBlur(1))))
    colour = 1 - float(np.mean(np.minimum(np.linalg.norm(la - lb, axis=-1), 50) / 50))
    def edges(png):
        g = np.asarray(_prep(png, (480, 270)).convert("L"), dtype=float)
        gx = np.abs(np.diff(g, axis=1, prepend=g[:, :1])); gy = np.abs(np.diff(g, axis=0, prepend=g[:1]))
        e = (np.hypot(gx, gy) > 40)
        img = Image.fromarray((e * 255).astype("uint8")).filter(ImageFilter.MaxFilter(5))
        return np.asarray(img) > 0
    ea, eb = edges(a_png), edges(b_png)
    dice = 2 * np.sum(ea & eb) / max(1, ea.sum() + eb.sum())
    return 0.5 * colour + 0.5 * float(dice)

def ink_grid(png, gw=32, gh=18):
    a = np.asarray(_prep(png, (gw * 10, gh * 10)), dtype=float)
    q = (a // 16).reshape(-1, 3); vals, cnt = np.unique(q, axis=0, return_counts=True)
    bg = vals[cnt.argmax()] * 16 + 8
    ink = np.linalg.norm(a - bg, axis=-1) > 30
    return ink.reshape(gh, 10, gw, 10).mean(axis=(1, 3)) > 0.06

def layout_raw(a_png, b_png):
    A, B = ink_grid(a_png), ink_grid(b_png)
    return float((A & B).sum() / max(1, (A | B).sum()))

def dominant_colours(png, min_share=0.02):
    a = np.asarray(_prep(png, (320, 180)), dtype=int).reshape(-1, 3)
    q = (a // 24) * 24 + 12
    vals, cnt = np.unique(q, axis=0, return_counts=True)
    bg = vals[cnt.argmax()]
    keep = [(v, c) for v, c in zip(vals, cnt) if np.abs(v - bg).sum() > 40]
    tot = sum(c for _, c in keep) or 1
    out = [rgb2hex(v) for v, c in sorted(keep, key=lambda x: -x[1]) if c / tot >= min_share]
    return out[:10]

# ---------------------------------------------------------------- scoring
def check_standards(ref, cand, cfg):
    R = []
    def add(name, ok, detail): R.append(dict(check=name, ok=bool(ok), detail=detail))
    skip = set(cfg.get("skip_checks", []))
    if "size" not in skip:
        ok = abs(ref["size_in"][0] - cand["size_in"][0]) <= TOL["size_in"] and abs(ref["size_in"][1] - cand["size_in"][1]) <= TOL["size_in"]
        add("slide size", ok, f"ref {ref['size_in']} in, got {cand['size_in']} in")
    if "title" in ref and "title" not in skip:
        rt, ct = ref["title"], cand.get("title")
        if not ct: add("title found", False, "no title in candidate")
        else:
            add("title position", abs(rt["left_in"] - ct["left_in"]) <= TOL["title_left_in"] and abs(rt["top_in"] - ct["top_in"]) <= TOL["title_top_in"],
                f"ref left {rt['left_in']:.2f} top {rt['top_in']:.2f}; got left {ct['left_in']:.2f} top {ct['top_in']:.2f} in")
            add("title size", abs(rt["pt"] - ct["pt"]) <= TOL["title_pt"], f"ref {rt['pt']} pt, got {ct['pt']} pt")
            add("title bold", rt["bold"] == ct["bold"], f"ref {rt['bold']}, got {ct['bold']}")
            add("title colour", de(rt["colour"], ct["colour"]) <= TOL["title_de"], f"ref #{rt['colour']}, got #{ct['colour']} (ΔE {de(rt['colour'], ct['colour']):.0f})")
            add("title font", (rt["font"] or "").lower() == (ct["font"] or "").lower(), f"ref {rt['font']}, got {ct['font']}")
    if "body" in ref and "body" in cand and "body" not in skip:
        add("body text size", abs(ref["body"]["median_pt"] - cand["body"]["median_pt"]) <= TOL["body_med_pt"]
            and cand["body"]["min_pt"] >= ref["body"]["min_pt"] - TOL["body_min_pt"],
            f"ref median {ref['body']['median_pt']} / min {ref['body']['min_pt']} pt; got {cand['body']['median_pt']} / {cand['body']['min_pt']} pt")
    if "fonts" not in skip:
        extra = [f for f in cand["fonts"]["latin"] if f.lower() not in [g.lower() for g in ref["fonts"]["latin"]]]
        add("fonts", not extra, f"ref {ref['fonts']['latin']}, got {cand['fonts']['latin']}")
        if cand["fonts"]["cjk"]:
            want = ref["fonts"]["ea"] or ["Microsoft YaHei"]
            ok = bool(cand["fonts"]["ea"]) and all(f in want for f in cand["fonts"]["ea"])
            add("Chinese font", ok, f"want {want}, got {cand['fonts']['ea']}")
    if "margins" in ref and "margins" in cand and "margins" not in skip:
        rm, cm = ref["margins"], cand["margins"]
        add("body margins", abs(rm["left_in"] - cm["left_in"]) <= TOL["margin_in"] and abs(rm["right_in"] - cm["right_in"]) <= TOL["margin_in"],
            f"ref L {rm['left_in']:.2f} R {rm['right_in']:.2f}; got L {cm['left_in']:.2f} R {cm['right_in']:.2f} in")
    if "colours" not in skip:
        pal = set(ref["render_colours"]) | set(ref["theme_colours"])
        bad = [c for c in cand["render_colours"] if min(de(c, p) for p in pal) > TOL["colour_de"]]
        add("colours", not bad, ("off-palette " + ", ".join("#" + c for c in bad)) if bad else "all colours in the reference palette")
    if "source" in ref and "source" not in skip:
        cs = cand.get("source")
        add("source line", bool(cs) and abs(ref["source"]["pt"] - cs["pt"]) <= TOL["source_pt"] and abs(ref["source"]["top_in"] - cs["top_in"]) <= TOL["source_top_in"],
            f"ref {ref['source']['pt']} pt at {ref['source']['top_in']:.2f} in; got " + (f"{cs['pt']} pt at {cs['top_in']:.2f} in" if cs else "none"))
    return R

def render_title_top(png, size_in, title):
    """Top of the title's glyphs in the render (inches): first row in the title's column span with glyph edges in the title colour.
    Searches from just below any text above the title (breadcrumbs) to the bottom of the title box."""
    im = np.asarray(Image.open(png).convert("RGB"), dtype=float); H_, W_ = im.shape[:2]; k = W_ / size_in[0]
    x, y, w, h = title["box"]; c = np.array(hex2rgb(title["colour"]), dtype=float)
    r0 = int(max(title.get("above", 0) + 0.02, y - 0.9, 0) * k); r1 = int(min(size_in[1], y + h + 0.05) * k)
    c0, c1 = int(max(0, x) * k), int(min(size_in[0], x + w) * k)
    win = im[r0:r1, c0:c1]
    if win.size == 0: return None
    box = im[int(y * k):int((y + h) * k), c0:c1].reshape(-1, 3)        # the colour behind the title = most common in its box
    q = (box // 16).astype(int); vals, cnt = np.unique(q, axis=0, return_counts=True); bg = vals[cnt.argmax()] * 16 + 8
    on = np.linalg.norm(win - c, axis=-1) < 60; nb = np.linalg.norm(win - bg, axis=-1) < 60
    edge = (on[:, 1:] & nb[:, :-1]) | (on[:, :-1] & nb[:, 1:])           # title-colour glyph pixels next to the title's background
    rows = np.where(edge.sum(axis=1) >= 3)[0]
    return round((r0 + rows[0]) / k, 3) if len(rows) else None

def norm(raw, floor):
    return max(0.0, min(1.0, (raw - floor) / max(1e-6, 1 - floor)))

def score_case(case_dir):
    cfg = json.load(open(os.path.join(case_dir, "case.json")))
    ref = json.load(open(os.path.join(case_dir, "original.json")))
    cand_pptx = os.path.join(case_dir, "candidate.pptx")
    cand = measure(cand_pptx, 1)
    cpng = os.path.join(case_dir, "candidate.png"); render(cand_pptx, 1, cpng)
    opng = os.path.join(case_dir, "original.png")
    cand["render_colours"] = dominant_colours(cpng)
    for m_, png in ((ref, opng), (cand, cpng)):        # title top from the render (both sides measured the same way)
        if m_.get("title") and m_["title"].get("box"):
            rt = render_title_top(png, m_["size_in"], m_["title"])
            if rt is not None: m_["title"]["top_in"] = rt
    std = check_standards(ref, cand, cfg)
    lay = norm(layout_raw(opng, cpng), cfg["floor"]["layout"])
    vis = norm(visual_raw(opng, cpng), cfg["floor"]["visual"])
    translated = cfg.get("translated", False)
    passed = all(r["ok"] for r in std) and lay >= PASS["layout"] and (translated or vis >= PASS["visual"])
    res = dict(id=cfg["id"], passed=passed, standards=std, layout=round(lay, 2), visual=None if translated else round(vis, 2),
               n_std=len(std), n_std_ok=sum(r["ok"] for r in std), candidate=cand)
    json.dump(res, open(os.path.join(case_dir, "result.json"), "w"), indent=1, ensure_ascii=False)
    # side-by-side for review
    A, B = Image.open(opng).convert("RGB"), Image.open(cpng).convert("RGB")
    h = 400; A = A.resize((int(A.width * h / A.height), h)); B = B.resize((int(B.width * h / B.height), h))
    S = Image.new("RGB", (A.width + B.width + 30, h + 20), "#888"); S.paste(A, (10, 10)); S.paste(B, (A.width + 20, 10))
    S.save(os.path.join(case_dir, "compare.png"))
    return res
