"""deck_lint.py <deck.pptx> [--profile Style/refs/<deck>.profile.json] [--json]

Quality gate for every PowerPoint deck before it is handed over (DECK-SYSTEM Stage 5).
It measures each slide in the file and checks it against the active style: the house style
(read live from Generators/house.js, so it follows every style change) or a reference's style profile.

ERRORS must be fixed before delivery; WARNINGS are looked at and either fixed or accepted with a reason.

  E off-slide      a shape runs past the slide edge
  E font           a font that is not the style's (Latin) / not the Chinese font on Chinese text
  E tiny text      text under 8 pt
  E overflow       text needs clearly more room than its box has (it will spill in PowerPoint)
  E off-palette    a fill, line or text colour that is not in the style's palette
  E title          content slide without a title, or title over 2 lines, or wrong size / colour / weight / font / position
  E covered        most of a text sits under a shape drawn on top of it (a pin over a map label, a box over a caption)
  E contrast       text and the fill behind it are nearly the same colour (under 2 : 1)
  E body size      (with --profile) body text smaller than the reference's: median under the profile's body.pt - 1,
                   (W) any body text (tables and chart text included) under its label_pt - 1. Measured as the benchmark
                   measures it (bench_score.measure). Never shrink type to fit: cut, drop the weakest item or split the
                   slide (roadmap 4.2 Run 1, v2.47: body text size failed in 14 of 30 fresh blind rebuilds)
  W margins        a shape outside the left or right margin
  W small text     text under 9 pt
  W accent         the accent colour fills more than two shapes (it should mark only the key point)
  W topic title    title under 4 words: probably a topic, not a sentence that states the point
  W no source      a chart on the slide but no source line
  W tight          text close to overflowing its box
  W covered        part of a text sits under a shape drawn on top of it
  W low-res image  a picture with under 150 pixels per inch at the size it is shown (it will look soft on a large screen)
  W contrast       words under 12 pt on a fill with less than 3 : 1 contrast (white on the accent green or on light grey is the usual case)
  W wordy          over 260 body words on a slide (320 on an executive summary): a document page, not a slide
  W thin           under 90 body words on an analysis slide: figures without their reading. The reference case decks
                   carry 140-211 body words on their median content slide (scripts/deck_measure.py); two Chinese
                   characters count as one word
  W empty          a content slide that leaves a large part of its body unused: under 70% of the body carries content,
                   or one empty block takes over 18% of it. Measured on 11 reference case decks (197 content slides,
                   2026-11-23): the median slide fills 93-98% of its body and its largest empty block is 1-4%; they
                   fill the page with 2-4 exhibits that prove the title. A lone figure in a sea of white is the usual
                   cause. Fix by adding the missing proof (a second exhibit, the numbers behind the claim, the so-what),
                   never by enlarging what is there or adding decoration.
  DECK W empty     the median content slide fills under 85% of its body
  DECK W repeat    the same signature form (scoring table, waterfall, process, map …) on neighbouring slides, or on more
                   than 2 slides of a deck (1 in 10 for long decks). Read from the "form:<builder>" names the generators
                   give their first object, so only decks built with the folder's generators are checked

Exit code 1 when any error is found. This does not replace looking at the rendered slides.
"""
import os, re, sys, json, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "bench", "scripts")); sys.path.insert(0, HERE)
from bench_score import Ctx, walk, run_props, count_lines, insets, inherited_anchor, de, EMU, SRC, CJK, _font, measure
WORDS = re.compile(r"[A-Za-z0-9%$€£¥'’\-]+")
from make_style_profile import fill_hex, line_hex
from pptx import Presentation
from pptx.oxml.ns import qn

def house_style():
    import sync_design_system as S
    h = S.house(); r, t = h["roles"], h["tints"]
    pal = set(r.values()) | set(t.values()) | set(h["ext"]) | {"FFFFFF", "000000"}
    return dict(name="house", W=h["W"], H=h["H"], font=h["font"]["latin"], ea=[h["font"]["ea"]], palette=pal, accent=r["accent"],
                title=dict(pt=h["type"]["title"], colour=r["main"], bold=True, left=h["grid"]["left"]), margin=(h["grid"]["left"], h["grid"]["right"]))

def profile_style(p):
    P = json.load(open(p, encoding="utf-8")); r = P["roles"]
    pal = {v.upper() for v in r.values() if isinstance(v, str)} | {c.upper() for c in P.get("colours_ranked", []) + P.get("neutrals_ranked", []) + P.get("theme", [])} | {"FFFFFF", "000000"}
    for k in ("title", "source_line", "page", "footer"):
        c = (P.get(k) or {}).get("colour")
        if c: pal.add(c.upper())
    T = P["title"]
    for extra in (T.get("band"), T.get("rule"), T.get("sub")):
        if extra and extra.get("colour"): pal.add(extra["colour"].upper())
    body = (P.get("body") or {})
    return dict(name=P.get("source", "reference"), W=P["size"][0], H=P["size"][1], font=P["fonts"]["latin"], ea=[P["fonts"].get("ea") or "Microsoft YaHei"], palette=pal,
                body=(body.get("pt"), body.get("label_pt") or body.get("pt")) if body.get("pt") else None, accent=r["accent"].upper(), title=dict(pt=T["pt"], colour=T["colour"].upper(), bold=bool(T["bold"]), left=T["x"]), margin=(P["margins"]["left"], P["margins"]["right"]))

_TINTS = {}
def near(c, pal, tol=12):
    """in the palette, or a tint / shade of a palette colour (maps and heat scales step a role colour towards white or black)"""
    if min(de(c, p) for p in pal) <= tol: return True
    key = frozenset(pal)
    if key not in _TINTS:
        mix = lambda a, b, k: "%02X%02X%02X" % tuple(round(int(a[i:i + 2], 16) * (1 - k) + int(b[i:i + 2], 16) * k) for i in (0, 2, 4))
        _TINTS[key] = [mix(p, t, k / 20) for p in pal if p not in ("FFFFFF", "000000") for t in ("FFFFFF", "000000") for k in range(1, 20)]
    return min(de(c, p) for p in _TINTS[key]) <= 6

def _lum(c):
    v = [int(c[i:i + 2], 16) / 255 for i in (0, 2, 4)]; v = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in v]
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
def contrast(a, b):
    la, lb = sorted((_lum(a), _lum(b)), reverse=True); return (la + 0.05) / (lb + 0.05)

def _alpha(sh):
    """opacity of a shape's solid fill, 0..1 (PowerPoint 'transparency' 30% = 0.7)"""
    sp = sh._element.find(qn("p:spPr")); sf = sp.find(qn("a:solidFill")) if sp is not None else None
    al = sf.find(".//" + qn("a:alpha")) if sf is not None else None
    return int(al.get("val")) / 100000 if al is not None else 1.0
_mixw = lambda c, k: "%02X%02X%02X" % tuple(round(int(c[i:i + 2], 16) * k + 255 * (1 - k)) for i in (0, 2, 4))   # a see-through fill over white

def _geom(sh):
    """('rect' | 'ellipse' | 'poly' | 'line' | 'other', polygon points in 0..1 of the box or None)"""
    sp = sh._element.find(qn("p:spPr"))
    if sp is None: return ("rect" if sh.shape_type == 13 else "other"), None
    cg = sp.find(qn("a:custGeom"))
    if cg is not None:
        path = cg.find(qn("a:pathLst") + "/" + qn("a:path"))
        if path is None or any(ch.tag.split("}")[1] not in ("moveTo", "lnTo", "close") for ch in path): return "other", None
        pw, ph = float(path.get("w") or 1) or 1, float(path.get("h") or 1) or 1
        return "poly", [(float(pt.get("x")) / pw, float(pt.get("y")) / ph) for pt in path.iter(qn("a:pt"))]
    pg = sp.find(qn("a:prstGeom")); k = pg.get("prst") if pg is not None else "rect"
    if k in ("line", "straightConnector1") or k.endswith("Connector2") or k.endswith("Connector3"): return "line", None
    if k in ("ellipse", "teardrop", "pie", "donut"): return "ellipse", None
    return ("rect" if k in ("rect", "roundRect", "snip1Rect", "round2SameRect", "homePlate", "chevron") else "other"), None

def _inside(kind, pts, box, px, py):
    x, y, w, h = box
    if not (x <= px <= x + w and y <= py <= y + h) or w <= 0 or h <= 0: return False
    if kind == "ellipse": return ((px - x - w / 2) / (w / 2)) ** 2 + ((py - y - h / 2) / (h / 2)) ** 2 <= 1
    if kind == "poly":
        u, v, c = (px - x) / w, (py - y) / h, False
        for i in range(len(pts)):
            (x1, y1), (x2, y2) = pts[i], pts[i - 1]
            if (y1 > v) != (y2 > v) and u < (x2 - x1) * (v - y1) / ((y2 - y1) or 1e-9) + x1: c = not c
        return c
    return True

def body_fill(items, ctx, W, H, top, margin):
    """(share of the body that carries content, share taken by the largest empty block, that block in inches).
    Content = text where it actually sits, charts, tables, pictures and drawn shapes; a big painted panel counts only
    through what is inside it. Cells of 0.1 in; content is grown by 0.2 in so normal gaps are not counted as empty."""
    x0, x1, y0, y1 = margin[0], W - margin[1], top, 0.925 * H
    nx, ny = int(round((x1 - x0) / 0.1)), int(round((y1 - y0) / 0.1))
    if nx < 10 or ny < 10: return None
    g = [[0] * nx for _ in range(ny)]; area = (x1 - x0) * (y1 - y0)
    def mark(ax, ay, aw, ah, grow=0.2):
        for j in range(max(0, int((ay - grow - y0) / 0.1)), min(ny, int((ay + ah + grow - y0) / 0.1) + 1)):
            row = g[j]
            for i in range(max(0, int((ax - grow - x0) / 0.1)), min(nx, int((ax + aw + grow - x0) / 0.1) + 1)): row[i] = 1
    for sh, (x, y, w, h) in items:
        if (w > 0.95 * W and h > 0.95 * H) or y + h <= y0 or y >= y1: continue
        has_text = getattr(sh, "has_text_frame", False) and sh.has_text_frame and sh.text_frame.text.strip()
        kind = _geom(sh)[0] if sh.shape_type != 13 and not getattr(sh, "has_chart", False) and not getattr(sh, "has_table", False) else "obj"
        if kind == "line":
            if w < 0.05 or h < 0.05: mark(x, y, w, h, 0.05)        # rules and axes; slanted leader lines are left out
            continue
        painted = kind != "obj" and (fill_hex(ctx, sh) or line_hex(ctx, sh))
        if has_text:
            il, it, ir, ib = insets(sh); tw = 0; th_ = 0
            for p in sh.text_frame.paragraphs:
                rr = [r for r in p.runs if r.text.strip()]
                if not rr: continue
                q = run_props(ctx, sh, p, rr[0]); wid = _font(q[2], q[1], q[0]).getlength("".join(r.text for r in p.runs)) / 4 / 72
                lines = max(1, int(wid / max(0.1, w - il - ir)) + 1); tw = max(tw, min(wid, w - il - ir)); th_ += lines * q[0] * 1.2 / 72
            th_ = min(th_, h); al = str(sh.text_frame.paragraphs[0].alignment or ""); an = str(inherited_anchor(ctx, sh) or "").lower()
            ex = x + il + ((w - il - ir - tw) / 2 if "CENTER" in al else (w - il - ir - tw if "RIGHT" in al else 0))
            ey = y + (h - th_) / 2 if "ctr" in an else (y + h - ib - th_ if an.startswith("b") else y + it)
            mark(ex, ey, tw, th_)
            if painted and (kind != "rect" or w * h <= 0.12 * area): mark(x, y, w, h)
        elif kind != "rect" or not painted or w * h <= 0.12 * area: mark(x, y, w, h)
        # else: a large painted panel with nothing in it is background, not content
    filled = sum(map(sum, g)) / (nx * ny)
    best = (0, 0, 0, 0, 0); hist = [0] * nx                                        # largest empty rectangle (histogram stack)
    for j in range(ny):
        hist = [0 if g[j][i] else hist[i] + 1 for i in range(nx)]; stack = []
        for i in range(nx + 1):
            cur = hist[i] if i < nx else 0; start = i
            while stack and stack[-1][1] >= cur:
                s0, hh = stack.pop(); a = hh * (i - s0)
                if a > best[0]: best = (a, s0, j - hh + 1, i - s0, hh)
                start = s0
            stack.append((start, cur))
    return filled, best[0] / (nx * ny), (x0 + best[1] * 0.1, y0 + best[2] * 0.1, best[3] * 0.1, best[4] * 0.1)

def lint_slide(prs, slide, n, st):
    ctx = Ctx(prs, slide); W, H = prs.slide_width / EMU, prs.slide_height / EMU
    E, Wn = [], []; fill_stats = None
    items = list(walk(slide.shapes)); texts = []; accent_fills = 0; has_chart = False; off_pal = collections.Counter(); fonts_bad = collections.Counter()
    # a native table is as tall as its rows: generators often leave the frame at its default height (1 in), which made a
    # full-height table read as a strip with an empty block under it (2026-11-24)
    table_words = 0
    for k, (sh, (x, y, w, h)) in enumerate(items):
        if getattr(sh, "has_table", False) and sh.has_table:
            items[k] = (sh, (x, y, w, max(h, sum((r.height or 0) for r in sh.table.rows) / 914400)))
            table_words += sum(len(WORDS.findall(c.text)) + len(CJK.findall(c.text)) // 2 for r in sh.table.rows for c in r.cells)
    painted = []   # (z, kind, points, box, fill as seen (None for a picture), opacity) of every filled shape
    for z, (sh, (x, y, w, h)) in enumerate(items):
        full = w > 0.95 * W and h > 0.95 * H
        if x < -0.02 or y < -0.02 or x + w > W + 0.02 or y + h > H + 0.02: E.append(f"off-slide: {sh.name} at x {x:.2f}–{x + w:.2f}, y {y:.2f}–{y + h:.2f} in")
        elif not full and w * h > 0.02 and h > 0.03 and y > 0.2 * H and y + h < 0.93 * H:
            ex0, ex1 = x, x + w
            if getattr(sh, "has_text_frame", False) and sh.has_text_frame and sh.text_frame.text.strip() and not fill_hex(ctx, sh) and not line_hex(ctx, sh):
                # an unpainted text box: what matters is where its text sits, not the empty box around it
                tw = 0
                for p in sh.text_frame.paragraphs:
                    rr = [r for r in p.runs if r.text.strip()]
                    if rr: q = run_props(ctx, sh, p, rr[0]); tw = max(tw, _font(q[2], q[1], q[0]).getlength("".join(r.text for r in p.runs)) / 4 / 72)
                tw = min(w, tw + 0.1); al = str(sh.text_frame.paragraphs[0].alignment or "")
                ex0 = x + (w - tw) / 2 if "CENTER" in al else (x + w - tw if "RIGHT" in al else x); ex1 = ex0 + tw
            if ex0 < st["margin"][0] - 0.06 or ex1 > W - st["margin"][1] + 0.06:
                Wn.append(f"margins: {sh.name} spans x {ex0:.2f}–{ex1:.2f} in (margins {st['margin'][0]:.2f} / {W - st['margin'][1]:.2f})")
        if getattr(sh, "has_chart", False) and sh.has_chart: has_chart = True
        if sh.shape_type == 13:                               # pictures keep their own colours
            painted.append((z, "rect", None, (x, y, w, h), None, 1.0))
            try:
                pw, ph = sh.image.size; cl, cr_ = sh.crop_left + sh.crop_right, sh.crop_top + sh.crop_bottom
                ppi = min(pw * (1 - cl) / max(w, 0.01), ph * (1 - cr_) / max(h, 0.01))
                if w * h > 1 and ppi < 150 and not (sh.image.ext or "").lower() in ("svg", "emf", "wmf"): Wn.append(f"low-res image: {sh.name} has {ppi:.0f} pixels per inch at {w:.1f} x {h:.1f} in ({pw} x {ph} px file)")
            except Exception: pass
            continue
        f = fill_hex(ctx, sh); l = line_hex(ctx, sh)
        if f and w > 0.02 and h > 0.02:
            kind, pts = _geom(sh)
            if kind != "line": op = _alpha(sh); painted.append((z, kind, pts, (x, y, w, h), _mixw(f.upper(), op), op))
        for c in (f, l):
            if c and not near(c.upper(), st["palette"]): off_pal[c.upper()] += 1
        if f and not full and de(f.upper(), st["accent"]) <= 6 and w * h > 0.05: accent_fills += 1
        if not (getattr(sh, "has_text_frame", False) and sh.has_text_frame) or not sh.text_frame.text.strip(): continue
        paras, runs = [], []
        for p in sh.text_frame.paragraphs:
            rr = [r for r in p.runs if r.text.strip()]
            if not rr: continue
            props = [run_props(ctx, sh, p, r) for r in rr]
            paras.append(("".join(r.text for r in p.runs), props[0][2], props[0][1], max(q[0] for q in props)))
            for r, q in zip(rr, props):
                runs.append((r.text, q))
                if q[2] and q[2].lower() != st["font"].lower(): fonts_bad[q[2]] += len(r.text)
                if CJK.search(r.text) and q[3] and q[3] not in st["ea"] and q[3].lower() != st["font"].lower(): fonts_bad[q[3] + " (Chinese)"] += len(r.text)
                if q[4] and not near(q[4].upper(), st["palette"]): off_pal[q[4].upper()] += 1
        if not runs: continue                               # fields only (page number)
        il, it, ir, ib = insets(sh); nl, hs = count_lines(paras, max(0.1, w - il - ir)); need = sum(hs) + it + ib
        bp = sh.text_frame._txBody.find(qn("a:bodyPr")); autofit = bp is not None and (bp.find(qn("a:normAutofit")) is not None or bp.find(qn("a:spAutoFit")) is not None)
        # where the text itself sits inside its box (alignment and anchor), for the covered and contrast checks
        tw = min(max(0.05, w - il - ir), max(_font(fn, b_, pt).getlength(tx) / 4 / 72 for tx, fn, b_, pt in paras)); th_ = min(sum(hs), max(0.05, h))
        al = str(sh.text_frame.paragraphs[0].alignment or ""); an = str(inherited_anchor(ctx, sh) or "").lower()
        ex = x + il + ((w - il - ir - tw) / 2 if "CENTER" in al else (w - il - ir - tw if "RIGHT" in al else 0))
        ey = y + (h - th_) / 2 if ("ctr" in an or "middle" in an) else (y + h - ib - th_ if (an.startswith("b") or "bottom" in an) else y + it)
        texts.append(dict(z=z, ext=(ex, ey, tw, th_), own=_mixw(f.upper(), _alpha(sh)) if f else None, sh=sh, x=x, y=y, w=w, h=h, text=sh.text_frame.text, runs=runs, paras=paras, nl=nl, need=need, size=max(q[0] for _, q in runs), autofit=autofit))
    low = collections.defaultdict(list)
    for t in texts:
        mn = min(q[0] for _, q in t["runs"]); short = t["text"].strip()[:40].replace("\n", " ")
        if mn < 8: E.append(f"tiny text: {mn:g} pt in “{short}”")
        elif mn < 9: Wn.append(f"small text: {mn:g} pt in “{short}”")
        over = t["need"] - t["h"]
        if not t["autofit"] and t["h"] > 0.05 and len(t["text"].strip()) > 3:
            if over > 0.3 and over > 0.25 * t["h"]: E.append(f"overflow: “{short}” needs {t['need']:.2f} in, box is {t['h']:.2f} in")
            elif over > 0.12: Wn.append(f"tight: “{short}” needs {t['need']:.2f} in, box is {t['h']:.2f} in")
        # covered: share of the text's area under shapes drawn after it; contrast: text colour against the fill it sits on
        ex, ey, tw, th_ = t["ext"]; pts = [(ex + tw * (i + 0.5) / 7, ey + th_ * (j + 0.5) / 3) for i in range(7) for j in range(3)]
        over_by = collections.Counter()
        for px, py in pts:
            for z2, kind, gp, box, f2, op in painted:
                if z2 > t["z"] and op >= 0.9 and kind != "other" and not (box[2] > 0.95 * W and box[3] > 0.95 * H) and _inside(kind, gp, box, px, py): over_by[items[z2][0].name] += 1; break
        share = sum(over_by.values()) / len(pts)
        if share >= 0.2: (E if share >= 0.5 else Wn).append(f"covered: “{short}” is {share:.0%} under {over_by.most_common(1)[0][0]}")
        bg = t["own"]
        if not bg:
            cx, cy = ex + tw / 2, ey + th_ / 2
            for z2, kind, gp, box, f2, op in reversed(painted):
                if z2 < t["z"] and kind != "other" and _inside(kind, gp, box, cx, cy): bg = f2 or "?"; break
        col = max(t["runs"], key=lambda r: len(r[0]))[1][4]
        if bg and bg != "?" and col:
            cr = contrast(col.upper(), bg)
            if cr < 2: E.append(f"contrast: “{short}” is #{col.upper()} on #{bg} ({cr:.1f} : 1)")
            elif cr < 3 and mn < 12 and len(t["text"].strip()) > 2: low[(col.upper(), bg, round(cr, 1))].append(short)   # one or two characters in a chip (a number, a letter) are left alone
    for (col, bg, cr), L in low.items(): Wn.append(f"contrast: #{col} on #{bg} ({cr:g} : 1) in {len(L)} small text(s), e.g. “{L[0]}”")
    for f, k in fonts_bad.most_common(3): E.append(f"font: {f} used ({k} characters); the style's font is {st['font']}")
    for c, k in off_pal.most_common(4): E.append(f"off-palette: #{c} ({k}×)")
    if accent_fills > 2: Wn.append(f"accent: {accent_fills} shapes filled with the accent colour (keep it for the key point)")
    # title checks on content slides (a slide with a title placeholder / title-sized text in the top quarter, light background)
    layout = slide.slide_layout.name or ""
    special = re.search(r"title$|^0?1 title|divider|agenda|statement|end|cover|blank|picture", layout, re.I) and "title only" not in layout.lower()
    top = [t for t in texts if t["y"] < 0.25 * H and len(t["text"].strip()) >= 3 and not SRC.match(t["text"]) and not re.search(r"►|▶|»|\s>\s|→", t["text"])]
    title = max(top, key=lambda t: (round(t["size"]), -t["y"])) if top else None
    if not special:
        if not title or title["size"] < st["title"]["pt"] - 6: E.append("title: no title found")
        else:
            q = [q for _, q in title["runs"] if q[0] == title["size"]][0]
            if abs(q[0] - st["title"]["pt"]) > 1: E.append(f"title: {q[0]:g} pt, style is {st['title']['pt']:g} pt")
            if de(q[4].upper(), st["title"]["colour"]) > 10: E.append(f"title: colour #{q[4]}, style is #{st['title']['colour']}")
            if bool(q[1]) != st["title"]["bold"]: E.append(f"title: bold {bool(q[1])}, style is {st['title']['bold']}")
            if abs(title["x"] + insets(title["sh"])[0] - st["title"]["left"]) > 0.15: E.append(f"title: left edge {title['x']:.2f} in, style is {st['title']['left']:.2f} in")
            lines = count_lines([p for p in title["paras"] if p[3] == title["size"]], max(0.1, title["w"] - sum(insets(title["sh"])[::2])))[0]
            if lines > 2: E.append(f"title: {lines} lines (max 2): “{title['text'][:60]}…”")
            words = len(re.findall(r"[A-Za-z0-9%$€£¥]+", title["text"])) + len(CJK.findall(title["text"])) // 2
            if words < 4: Wn.append(f"topic title: “{title['text'].strip()[:50]}” is not a sentence that states the point")
        if has_chart and not any(SRC.match(t["text"]) for t in texts): Wn.append("no source: chart without a source line")
        if title:
            sub = [t for t in texts if t is not title and title["y"] + title["h"] - 0.05 <= t["y"] < title["y"] + title["h"] + 0.25 and t["size"] < title["size"] and t["h"] < 0.6 and abs(t["x"] - title["x"]) < 0.2]
            top_ = max([title["y"] + title["h"]] + [t["y"] + t["h"] for t in sub[:1]]) + 0.05
            bf = body_fill(items, ctx, W, H, top_, st["margin"])
            if bf and (bf[0] < 0.70 or bf[1] > 0.18):
                ex, ey, ew, eh = bf[2]
                Wn.append(f"empty: {bf[0]:.0%} of the body carries content; the largest empty block is {ew:.1f} x {eh:.1f} in ({bf[1]:.0%} of the body) at x {ex:.1f}, y {ey:.1f}. Add the missing proof (second exhibit, numbers, so-what)")
            fill_stats = bf

        # body words = every word outside the title, the source line, the page number and the breadcrumb, tables included
        # (the count scripts/deck_measure.py reports). The reference case decks carry 140-211 on their median content slide
        # (7 decks, 2026-11-23): each exhibit sits with 2-4 bullets that read it. So an analysis slide under 90 words is
        # thin (figures without their reading) and one over 260 is a document page. Until v2.15 the rule was "at most ~40,
        # warn above 80", which produced figures with one line each; the user asked for the references' density instead.
        body = [t["text"] for t in texts if t is not title and not SRC.match(t["text"]) and not (t["y"] < 0.04 * H and t["h"] < 0.06 * H) and t["y"] < 0.93 * H]
        words = sum(len(WORDS.findall(b)) for b in body) + table_words; cjk = sum(len(CJK.findall(b)) for b in body)
        summary = bool(title and re.match(r"\s*(executive\s+)?summary|\s*(执行)?摘要|\s*概要", title["text"], re.I))
        units = words + cjk // 2                               # two Chinese characters read as about one English word
        if units > (320 if summary else 260): Wn.append(f"wordy: {words} words" + (f" + {cjk} Chinese characters" if cjk else "") + " of body text (the references carry 140-211; over 260 is a document page: split the slide or move detail to the appendix)")
        elif fill_stats and not summary and units < 90: Wn.append(f"thin: {words} words" + (f" + {cjk} Chinese characters" if cjk else "") + " of body text (the references carry 140-211 on an analysis slide: give each exhibit its unit line and 2-4 bullets that read it)")
    return dict(slide=n, layout=layout, title=(title["text"].strip().replace("\n", " ")[:70] if title else ""), errors=E, warnings=Wn,
                fill=(round(fill_stats[0], 2), round(fill_stats[1], 2)) if fill_stats else None,
                forms=sorted({(sh.name or "").split()[0][5:] for sh, _ in items if (sh.name or "").startswith("form:")}))

def lint(path, profile=None):
    st = profile_style(profile) if profile else house_style()
    prs = Presentation(path); W, H = prs.slide_width / EMU, prs.slide_height / EMU
    out = []; deck_errors = []
    if abs(W - st["W"]) > 0.05 or abs(H - st["H"]) > 0.05: deck_errors.append(f"slide size {W:.2f} × {H:.2f} in, style is {st['W']:.2f} × {st['H']:.2f} in")
    for i, s in enumerate(prs.slides, 1):
        r = lint_slide(prs, s, i, st); out.append(r)
        # body text size of a reference (roadmap 4.2 Run 1): the same measure the benchmark's "body text size" check uses
        if st.get("body") and r.get("fill") is not None:
            try: b = measure(path, i).get("body")
            except Exception: b = None
            pt, lab = st["body"]
            if b and b["median_pt"] < pt - 1:
                r["errors"].append(f"body size: body text {b['median_pt']:g} pt (median), the reference's body is {pt:g} pt. Never shrink type to fit: cut words, drop the weakest item or split the slide")
            elif b and b["min_pt"] < lab - 1:
                r["warnings"].append(f"body size: smallest body text {b['min_pt']:g} pt, the reference's labels, table cells and chart text are at least {lab:g} pt. Cut or split instead of shrinking; notes and footnotes may stay smaller if the reference's are")
    fills = sorted(s["fill"][0] for s in out if s.get("fill")); deck_warnings = []
    if len(fills) >= 4 and fills[len(fills) // 2] < 0.85:
        deck_warnings.append(f"empty: the median content slide fills {fills[len(fills) // 2]:.0%} of its body (reference decks: 93-98%). Most slides need more proof on the page: 2-4 exhibits per analysis slide (Style/storytelling.md §8 rule 11)")
    # the same form too often: the generators name the first object of each signature form "form:<builder>" (Generators
    # tagForms). The references use a scoring table once or twice in a deck of 16-33 slides and vary the form from slide to
    # slide; the v0.5 sample had three Harvey-ball tables within four slides (the user, 2026-11-24: "you do this too many times").
    by_form = collections.defaultdict(list)
    for r in out:
        for f in r.get("forms") or []:
            if f not in ("letteredSummary", "agendaTracker", "photoCover", "photoAgenda"): by_form[f].append(r["slide"])
    limit = max(2, len(fills) // 10)
    for f, where in sorted(by_form.items()):
        runs = [f"{a} and {b}" for a, b in zip(where, where[1:]) if b - a == 1]
        if runs: deck_warnings.append(f"repeat: {f} on neighbouring slides {', '.join(runs)}. Give one of them another form from the message → figure table (Style/refs/case-competitions.md §5)")
        elif len(where) > limit: deck_warnings.append(f"repeat: {f} on {len(where)} slides ({', '.join(map(str, where))}); at most {limit} in a deck of this length. Keep it where it decides something and change the others")
    return dict(deck=os.path.basename(path), style=st["name"], deck_errors=deck_errors, deck_warnings=deck_warnings, slides=out, median_fill=fills[len(fills) // 2] if fills else None,
                errors=len(deck_errors) + sum(len(s["errors"]) for s in out), warnings=len(deck_warnings) + sum(len(s["warnings"]) for s in out))

if __name__ == "__main__":
    a = sys.argv[1:]; prof = None; as_json = "--json" in a
    if as_json: a.remove("--json")
    if "--profile" in a: i = a.index("--profile"); prof = a[i + 1]; a = a[:i] + a[i + 2:]
    r = lint(a[0], prof)
    if as_json: print(json.dumps(r, indent=1, ensure_ascii=False))
    else:
        print(f"deck_lint: {r['deck']} against {r['style']} style: {r['errors']} error(s), {r['warnings']} warning(s) on {len(r['slides'])} slides")
        for e in r["deck_errors"]: print("  DECK  E", e)
        for w in r["deck_warnings"]: print("  DECK  W", w)
        for s in r["slides"]:
            for e in s["errors"]: print(f"  {s['slide']:>3}  E {e}")
            for w in s["warnings"]: print(f"  {s['slide']:>3}  W {w}")
        if not r["errors"] and not r["warnings"]: print("  clean")
    sys.exit(1 if r["errors"] else 0)
