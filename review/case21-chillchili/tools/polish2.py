"""polish2.py: text fidelity pass for a rebuilt deck, measured word by word from the page images.

Usage: python3 polish2.py key deck.pptx out.pptx [--slides 3,5] [--report r.json]

Per OCR text line (paragraph) it measures every word on the page and sets:
  colour   the word's ink colour (strongest stroke pixels, snapped to colours read from large text on the slide)
  bold     ink mass against Arial regular / bold rendered at the measured size
  size     corrected when the stored size is >20% off the size implied by the ink height
  bullets  a solid dot before the first word becomes a native bullet (box widened to the dot)
It also removes traced glyph pieces left under a text box in the text's own colour (doubled text).
"""
import sys, json, glob, copy, re, difflib, statistics
import numpy as np
from PIL import Image
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from lxml import etree
sys.path.insert(0, "/tmp/nr/nat")
from wordfx import segments, word_metrics, bold_score, slant

A = "http://schemas.openxmlformats.org/drawingml/2006/main"
def q(t): return "{%s}%s" % (A, t.split(":")[1])

def thr(F):
    return 0.5 if F >= 32 else (0.8 if F >= 20 else 1.6)

def hexs(c):
    c = [int(max(0, min(255, round(v)))) for v in c]
    if min(c) >= 222: c = [255, 255, 255]                 # near-white ink on a chip is white
    return "%02X%02X%02X" % tuple(c)

def set_fill(rpr, hexcol):
    for f in rpr.findall(q("a:solidFill")): rpr.remove(f)
    sf = etree.Element(q("a:solidFill")); etree.SubElement(sf, q("a:srgbClr"), val=hexcol)
    ln = rpr.find(q("a:ln"))
    rpr.insert(1 if ln is not None else 0, sf)

def snap_colours(recs):
    """Washed colours of small text move to the matching colour read from large text (same hue direction)."""
    rel = []
    for r in recs:
        for w in r["words"]:
            if r["h"] >= 18 and w["m"] is not None: rel.append((np.array(w["color"]), np.array(r["bg"])))
    reps = []
    for c, bg in rel:
        for g in reps:
            if np.abs(g[0] - c).sum() < 40: g[1].append(c); break
        else: reps.append([c, [c]])
    reps = [np.median(np.array(g[1]), axis=0) for g in reps if len(g[1]) >= 2]
    for r in recs:
        bg = np.array(r["bg"], float)
        for w in r["words"]:
            c = np.array(w["color"], float)
            u = c - bg; nu = np.linalg.norm(u)
            if nu < 25: continue
            best = None
            for rc in reps:
                v = rc - bg; nv = np.linalg.norm(v)
                if nv < nu * 0.95: continue                       # a washed colour is never stronger than the true one
                cos = float(np.dot(u, v) / (nu * nv + 1e-6))
                if cos > 0.996 and (best is None or nv < best[0]): best = (nv, rc)
            if best is not None and r["h"] < 18: w["color"] = best[1]
            elif best is not None and np.abs(best[1] - c).sum() < 40: w["color"] = best[1]

def two_means(v):
    """Boundary between regular and bold words in one line, or None when the line is one weight."""
    v = sorted(v)
    if len(v) < 2: return None
    best = None
    for i in range(1, len(v)):
        lo, hi = v[:i], v[i:]
        cl, ch = np.mean(lo), np.mean(hi)
        sse = sum((x - cl) ** 2 for x in lo) + sum((x - ch) ** 2 for x in hi)
        if best is None or sse < best[0]: best = (sse, cl, ch, lo, hi)
    _, cl, ch, lo, hi = best
    sd = np.sqrt(best[0] / len(v)) + 0.05
    if ch - cl >= 0.45 and (ch - cl) > 2.2 * sd and ch >= 0.85 and cl <= 0.85: return (max(lo) + min(hi)) / 2
    return None

def approx_words(img, l, text, sg):
    """Word boxes from Arial advance widths spread over the measured line, when the gaps can't be counted."""
    from PIL import ImageFont
    f = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", 100)
    t = re.sub(r"^\s*[•●▪·]\s*", "", text)
    toks = [(m.start(), m.end()) for m in re.finditer(r"\S+", t)]
    if not toks: return None
    full = f.getlength(t[:toks[-1][1]])
    if full <= 0: return None
    k = l["w"] / full
    words = []
    for a, b in toks:
        x0 = l["x"] + f.getlength(t[:a]) * k; x1 = l["x"] + f.getlength(t[:b]) * k
        words.append({"x0": int(round(x0)), "x1": max(int(round(x0)) + 1, int(round(x1))), "color": None, "sw": 0})
    bg = sg["bg"]
    for w in words:
        reg = img[max(0, l["y"] - 2):l["y"] + l["h"] + 2, w["x0"]:w["x1"]].astype(int)
        d = np.abs(reg - bg).sum(2); ink = reg[d > 80]
        if len(ink) < 5: w["color"] = bg; continue
        dd = np.abs(ink - bg).sum(1); core = ink[dd >= np.percentile(dd, 92)]
        w["color"] = np.median(core, axis=0)
    return {"toks": [t[a:b] for a, b in toks], "bullet": None, "words": words, "ok": True, "bg": bg, "approx": True,
            "had_bullet_char": bool(re.match(r"^\s*[•●▪·]", text))}

def add_dashes(slide, img, px, st):
    """Dashed / dotted boxes and lines on the page become native shapes with that dash style."""
    from dashes import find
    from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
    r = find(img)
    E = lambda v: Emu(int(round(v * px)))
    def clear_under(x0, y0, x1, y1, band):
        for o in list(slide.shapes):
            if o.shape_type not in (1, 5) or (o.has_text_frame and o.text_frame.text.strip()): continue
            ox0, oy0 = o.left / px, o.top / px; ox1, oy1 = ox0 + o.width / px, oy0 + o.height / px
            for (a0, b0, a1, b1) in band:
                if ox0 >= a0 - 2 and ox1 <= a1 + 2 and oy0 >= b0 - 2 and oy1 <= b1 + 2:
                    o._element.getparent().remove(o._element); st["dash_pieces_removed"] = st.get("dash_pieces_removed", 0) + 1; break
    def style(line, col, th, dash):
        line.color.rgb = RGBColor.from_string(hexs(col)); line.width = E(max(1, th))
        ln = line._get_or_add_ln()
        for e in ln.findall(q("a:prstDash")): ln.remove(e)
        ln.append(ln.makeelement(q("a:prstDash"), {"val": dash}))
    for x0, y0, x1, y1, col, th, dash in r["rects"]:
        t = th + 1
        clear_under(x0, y0, x1, y1, [(x0, y0, x1, y0 + t), (x0, y1 - t, x1, y1), (x0, y0, x0 + t, y1), (x1 - t, y0, x1, y1)])
        h = th / 2
        sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, E(x0 + h), E(y0 + h), E(x1 - x0 - th), E(y1 - y0 - th))
        sh.fill.background(); sh.shadow.inherit = False; style(sh.line, col, th, dash)
        sh.name = "dashed box"; st["dashed_boxes"] = st.get("dashed_boxes", 0) + 1
    for x0, y0, x1, y1, col, th, dash in r["lines"]:
        horiz = (x1 - x0) >= (y1 - y0)
        if max(x1 - x0, y1 - y0) < 60: continue
        dup = False
        for o in slide.shapes:
            if o.shape_type in (9,) or getattr(o, "name", "").endswith("line"):
                ox0, oy0 = o.left / px, o.top / px; ox1, oy1 = ox0 + o.width / px, oy0 + o.height / px
                if ox0 <= x0 + 8 and ox1 >= x1 - 8 and oy0 - 6 <= y0 and oy1 + 6 >= y1: dup = True; break
        if dup: continue
        clear_under(x0, y0, x1, y1, [(x0, y0, x1, y1)])
        if horiz: a, b_, c, d = x0, (y0 + y1) / 2, x1, (y0 + y1) / 2
        else: a, b_, c, d = (x0 + x1) / 2, y0, (x0 + x1) / 2, y1
        ln = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, E(a), E(b_), E(c), E(d))
        style(ln.line, col, th, dash); ln.name = "dashed line"; st["dashed_lines"] = st.get("dashed_lines", 0) + 1

def fix_regions(slide, img, px, st):
    """Large light-coloured traced regions with holes punched by text become clean native rectangles,
    found as the solid areas of that colour on the page."""
    import cv2
    from pptx.enum.shapes import MSO_SHAPE
    H, W = img.shape[:2]
    for o in list(slide.shapes):
        if o.shape_type != 5: continue
        try:
            if o.fill.type != 1: continue
            fc = str(o.fill.fore_color.rgb)
        except Exception: continue
        x0, y0 = int(o.left / px), int(o.top / px); x1, y1 = int((o.left + o.width) / px), int((o.top + o.height) / px)
        if (x1 - x0) * (y1 - y0) < 6000: continue
        xml = o._element.xml
        if xml.count("<a:moveTo>") < 2: continue                       # no holes: leave it
        col = np.array([int(fc[i:i + 2], 16) for i in (0, 2, 4)])
        if col.min() < 200: continue                                    # only light shading; dark shapes may carry text as holes
        reg = img[max(0, y0):min(H, y1), max(0, x0):min(W, x1)].astype(int)
        if reg.size == 0: continue
        m = (np.abs(reg - col).sum(2) < 30).astype(np.uint8)
        if m.mean() < 0.15: continue
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
        n, lab, sts, _ = cv2.connectedComponentsWithStats(m, 4)
        rects = []
        for i in range(1, n):
            x, y, w, h, a = sts[i]
            if a >= 1500 and a >= 0.85 * w * h: rects.append((x0 + x, y0 + y, w, h))
        if not rects: continue
        for (x, y, w, h) in rects:
            r = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Emu(int(x * px)), Emu(int(y * px)), Emu(int(w * px)), Emu(int(h * px)))
            r.fill.solid(); r.fill.fore_color.rgb = RGBColor.from_string(fc); r.line.fill.background(); r.shadow.inherit = False
            r.name = "region"
            o._element.addprevious(r._element)                          # same place in the stacking order
        o._element.getparent().remove(o._element)
        st["regions_rebuilt"] = st.get("regions_rebuilt", 0) + 1

def fix_photos(slide, img, px, st, lines):
    """A photo the rebuild traced into many flat patches (posterised) becomes the original photo again:
    the page crop at full resolution, with the text inside it painted out (that text stays as text boxes)."""
    import cv2, io
    H, W = img.shape[:2]
    shp = []
    for o in slide.shapes:
        if o.shape_type != 5 or (o.has_text_frame and o.text_frame.text.strip()): continue
        try: fc = str(o.fill.fore_color.rgb) if o.fill.type == 1 else None
        except Exception: fc = None
        x0, y0 = o.left / px, o.top / px; x1, y1 = x0 + o.width / px, y0 + o.height / px
        if (x1 - x0) * (y1 - y0) > 0.25 * W * H: continue
        shp.append([o, x0, y0, x1, y1, fc])
    n = len(shp); par = list(range(n))
    def f(i):
        while par[i] != i: par[i] = par[par[i]]; i = par[i]
        return i
    for i in range(n):
        a = shp[i]
        for j in range(i + 1, n):
            b = shp[j]
            if a[1] - 3 <= b[3] and b[1] - 3 <= a[3] and a[2] - 3 <= b[4] and b[2] - 3 <= a[4]: par[f(i)] = f(j)
    groups = {}
    for i in range(n): groups.setdefault(f(i), []).append(shp[i])
    g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32)
    mu = cv2.blur(g, (9, 9)); sd = np.sqrt(np.maximum(cv2.blur(g * g, (9, 9)) - mu * mu, 0))
    for grp in groups.values():
        cols = {x[5] for x in grp if x[5]}
        if len(grp) < 20 or len(cols) < 6: continue
        X0 = int(max(0, min(x[1] for x in grp))); Y0 = int(max(0, min(x[2] for x in grp)))
        X1 = int(min(W, max(x[3] for x in grp))); Y1 = int(min(H, max(x[4] for x in grp)))
        if (X1 - X0) < 60 or (Y1 - Y0) < 40: continue
        r_ = img[Y0:Y1, X0:X1].astype(int); q_ = (r_ // 12).reshape(-1, 3)
        k_ = q_[:, 0] * 500 + q_[:, 1] * 22 + q_[:, 2]; _, cnt = np.unique(k_, return_counts=True)
        share = 1 - np.sort(cnt)[::-1][:8].sum() / cnt.sum()          # photos spread over many colours
        if share < 0.4: continue
        crop = img[Y0:Y1, X0:X1].copy()
        # paint out text lines inside the crop
        mask = np.zeros(crop.shape[:2], np.uint8)
        for l in lines:
            lx0, ly0, lx1, ly1 = l["x"] - 2 - X0, l["y"] - 2 - Y0, l["x"] + l["w"] + 2 - X0, l["y"] + l["h"] + 2 - Y0
            if lx1 <= 0 or ly1 <= 0 or lx0 >= crop.shape[1] or ly0 >= crop.shape[0]: continue
            lx0, ly0 = max(0, int(lx0)), max(0, int(ly0)); lx1, ly1 = min(crop.shape[1], int(lx1)), min(crop.shape[0], int(ly1))
            reg = crop[ly0:ly1, lx0:lx1].astype(int)
            med = np.median(reg.reshape(-1, 3), axis=0)
            ink = (np.abs(reg - med).sum(2) > 90).astype(np.uint8)
            mask[ly0:ly1, lx0:lx1] |= cv2.dilate(ink, np.ones((5, 5), np.uint8))
        if mask.any(): crop = cv2.inpaint(crop, mask, 5, cv2.INPAINT_TELEA)
        buf = io.BytesIO(); Image.fromarray(crop).save(buf, "PNG"); buf.seek(0)
        pic = slide.shapes.add_picture(buf, Emu(int(X0 * px)), Emu(int(Y0 * px)), Emu(int((X1 - X0) * px)), Emu(int((Y1 - Y0) * px)))
        pic.name = "photo (original pixels)"
        first = min(grp, key=lambda x: list(x[0]._element.getparent()).index(x[0]._element))[0]
        first._element.addprevious(pic._element)
        for x in grp: x[0]._element.getparent().remove(x[0]._element)
        st["photos_restored"] = st.get("photos_restored", 0) + 1

def main():
    key, deck, out = sys.argv[1:4]
    only = None
    if "--slides" in sys.argv: only = {int(x) for x in sys.argv[sys.argv.index("--slides") + 1].split(",")}
    tag = json.load(open("/tmp/nr/final/final_tags.json"))[key]
    info = json.load(open(f"/tmp/nr/out/{key}.info{tag}.json"))["info"]
    pages = sorted(glob.glob(f"/tmp/nr/img/{key}/pg-*.png"))
    prs = Presentation(deck)
    W0 = Image.open(pages[0]).size[0]; px = prs.slide_width / W0; ppt = W0 / (prs.slide_width / 12700)
    report = {}
    for si, slide in enumerate(prs.slides, 1):
        if only and si not in only: continue
        if si - 1 >= len(info) or not info[si - 1].get("ocr"): continue
        img = np.array(Image.open(pages[si - 1]).convert("RGB"))
        Wp = img.shape[1]; px = prs.slide_width / Wp; ppt = Wp / (prs.slide_width / 12700)   # page images differ in size: scale per page
        byname = {sh.name: sh for sh in slide.shapes}
        recs = []; st = {"lines": 0, "measured": 0, "recoloured": 0, "bold_changed": 0, "resized": 0, "bullets": 0, "remnants": 0}
        for blk in info[si - 1]["ocr"]:
            sh = byname.get(blk["name"])
            if sh is None or not sh.has_text_frame: continue
            paras = [p for p in sh.text_frame.paragraphs if p.text.strip()]
            lines = blk["lines"]
            pairs = []
            if len(paras) == len(lines): pairs = list(zip(paras, lines))
            else:
                for p in paras:
                    best = max(lines, key=lambda l: difflib.SequenceMatcher(None, p.text, l["text"]).ratio())
                    if difflib.SequenceMatcher(None, p.text, best["text"]).ratio() > 0.6: pairs.append((p, best))
            for p, l in pairs:
                st["lines"] += 1
                box = (l["x"], l["y"], l["w"], l["h"])
                sg = segments(img, box, p.text)
                if sg and not sg["ok"]: sg = approx_words(img, l, p.text, sg)
                if not sg or not sg["ok"]: continue
                ws = []
                for tok, w in zip(sg["toks"], sg["words"]):
                    m = word_metrics(img, w, max(0, l["y"] - 3), l["y"] + l["h"] + 3, sg["bg"])
                    sc = bold_score(tok, m) if m else None
                    it = slant(img, (w["x0"], l["y"], w["x1"] - w["x0"], l["h"])) if len(tok) >= 3 else 0
                    ws.append(dict(w, tok=tok, m=m, sc=sc, it=it))
                recs.append({"approx": bool(sg.get("approx")), "it": slant(img, box), "sh": sh, "p": p, "line": l, "h": l["h"], "bg": sg["bg"], "bullet": sg["bullet"],
                             "had_bullet_char": sg.get("had_bullet_char"), "words": ws})
                st["measured"] += 1
        snap_colours(recs)
        # decisions per line
        for r in recs:
            ws = r["words"]
            Fs = [w["sc"][2] for w in ws if w["sc"] and len(w["tok"]) >= 3] or [w["sc"][2] for w in ws if w["sc"]]
            if not Fs: continue
            F = statistics.median(Fs); r["F"] = F
            scs = [w["sc"][0] if w["sc"] and sum(ch.isalnum() for ch in w["tok"]) >= 3 else None for w in ws]
            valid = [s for s in scs if s is not None]
            med = statistics.median(valid) if valid else 0
            t = thr(F)
            line_bold = med >= t
            split = two_means(valid) if F >= 20 and len(valid) >= 2 and not r.get("approx") else None
            # adjacent words of one colour share one weight when the line has several colours
            grp = []; 
            for i, w in enumerate(ws):
                if grp and np.abs(np.array(ws[grp[-1][-1]]["color"], float) - np.array(w["color"], float)).sum() < 60: grp[-1].append(i)
                else: grp.append([i])
            gscore = list(scs)
            if len(grp) >= 2:
                for g in grp:
                    v = [scs[i] for i in g if scs[i] is not None]
                    for i in g: gscore[i] = float(np.mean(v)) if v else None
            for i, w in enumerate(ws):
                s_ = gscore[i]
                if split is not None and s_ is not None: w["bold"] = s_ >= split
                elif split is not None:               # short token: follow the nearest measured word
                    near = min((j for j in range(len(ws)) if gscore[j] is not None), key=lambda j: abs(j - i), default=None)
                    w["bold"] = (gscore[near] >= split) if near is not None else line_bold
                else: w["bold"] = line_bold
            # bold inside a regular line only as a lead-in from the line start or a run of 2+ words;
            # a lone heavier word in the middle is measuring noise ("may", "By")
            if split is not None:
                flags = [w["bold"] for w in ws]
                for i, w in enumerate(ws):
                    if not flags[i] or all(flags): continue
                    lead = all(flags[:i + 1])
                    run2 = (i > 0 and flags[i - 1]) or (i + 1 < len(ws) and flags[i + 1])
                    strong = gscore[i] is not None and gscore[i] >= split + 0.7
                    if not (lead or run2 or strong): w["bold"] = False
                # a lead-in ends at its colon ("Executive Summary: By ..." -> "By" is not bold)
                for i, w in enumerate(ws):
                    if w["bold"] and w["tok"].endswith(":") and all(x["bold"] for x in ws[:i + 1]):
                        for x, g_ in zip(ws[i + 1:], gscore[i + 1:]):
                            if x["bold"] and not (g_ is not None and g_ >= split + 0.7): x["bold"] = False
                        break
                # a lead-in that is only one short word is noise too, unless it ends with ':'
                if ws and ws[0]["bold"] and not (len(ws) > 1 and ws[1]["bold"]) and not ws[0]["tok"].endswith(":") and not all(w["bold"] for w in ws):
                    ws[0]["bold"] = gscore[0] is not None and gscore[0] >= split + 0.7
            for i, w in enumerate(ws):
                alpha = sum(ch.isalpha() for ch in w["tok"]) >= 5
                line_alpha = sum(ch.isalpha() for ch in r["p"].text) >= 4
                w["ital"] = (r["it"] < -0.05 and line_alpha) or (alpha and w["it"] < -0.1)
        # block-level size: the size implied by the ink, when the stored size is far off
        for r in recs:
            if "F" not in r: continue
            runs = r["p"].runs
            cur = [x.font.size.pt for x in runs if x.font.size]
            r["pt"] = round(r["F"] / ppt * 2) / 2
            r["cur"] = statistics.median(cur) if cur else None
            Fpx = r["pt"] * ppt
            if r["cur"] and not (0.75 * r["h"] <= Fpx <= 1.4 * r["h"] and 0.5 <= r["pt"] / r["cur"] <= 1.6):
                r["pt"] = r["cur"]                     # the ink measure is polluted (bar edge, badge): keep the stored size
            elif r["cur"] and abs(r["pt"] - r["cur"]) / r["cur"] > 0.08:
                # the new size must also explain the line's width better than the stored one
                from PIL import ImageFont
                bold = sum(1 for w in r["words"] if w.get("bold")) > len(r["words"]) / 2
                f = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf" % ("Bold" if bold else "Regular"), 100)
                txt = re.sub(r"^\s*[•●▪·]\s*", "", r["p"].text)
                w100 = f.getlength(txt)
                if w100 > 0:
                    wn = w100 * r["pt"] * ppt / 100; wc = w100 * r["cur"] * ppt / 100
                    if not (abs(wn - r["line"]["w"]) <= 0.18 * r["line"]["w"] and abs(wn - r["line"]["w"]) < abs(wc - r["line"]["w"])):
                        r["pt"] = r["cur"]
        # one size per text box when its lines are close in size
        groups = {}
        for r in recs:
            if "F" in r: groups.setdefault(id(r["sh"]), []).append(r)
        for g in groups.values():
            pts = [r["pt"] for r in g]; med = round(statistics.median(pts) * 2) / 2
            if max(pts) / max(0.1, min(pts)) <= 1.07:
                for r in g: r["pt"] = med
            g[0]["sh"]._box_pt = med
        # apply
        boxes_bullets = {}
        for r in recs:
            if "F" not in r: continue
            p = r["p"]; pe = p._p
            old_runs = pe.findall(q("a:r"))
            if not old_runs: continue
            text = "".join(x.findtext(q("a:t")) or "" for x in old_runs)
            # char -> source run
            src = []
            for x in old_runs: src += [x] * len(x.findtext(q("a:t")) or "")
            lead = re.match(r"^\s*[•●▪·]\s*", text)
            start = lead.end() if lead else 0
            toks = [(m.start(), m.end()) for m in re.finditer(r"\S+", text[start:])]
            toks = [(a + start, b + start) for a, b in toks]
            if len(toks) != len(r["words"]): continue
            newsize = None
            if r["cur"] and abs(r["cur"] - r["pt"]) / r["pt"] > 0.08 and r["pt"] >= 5:
                newsize = r["pt"]; st["resized"] += 1
            runcols = []
            for x in old_runs:
                c_ = x.find(q("a:rPr") + "/" + q("a:solidFill") + "/" + q("a:srgbClr"))
                if c_ is not None: runcols.append(np.array([int(c_.get("val")[i:i + 2], 16) for i in (0, 2, 4)], float))
            bgv = np.array(r["bg"], float)
            def huematch(c):
                u = np.array(c, float) - bgv; nu = np.linalg.norm(u)
                if nu < 25: return True
                for rc in runcols:
                    v = rc - bgv; nv = np.linalg.norm(v)
                    if nv > 10 and np.dot(u, v) / (nu * nv) > 0.97: return True
                return False
            cols_ = [w["color"] for w in r["words"]]
            maj = cols_[int(np.argmax([sum(np.abs(np.array(c, float) - np.array(d, float)).sum() < 60 for d in cols_) for c in cols_]))]
            for w in r["words"]:
                if np.abs(np.array(w["color"], float) - np.array(maj, float)).sum() >= 60 and not huematch(w["color"]): w["color"] = maj
            for w in r["words"]:
                if huematch(w["color"]): continue
                # a coloured mark (bubble, badge, bar) inside the word box: read the ink from neutral pixels only
                l_ = r["line"]
                reg = img[max(0, l_["y"] - 2):l_["y"] + l_["h"] + 2, w["x0"]:w["x1"]].reshape(-1, 3).astype(int)
                neu = reg[(reg.max(1) - reg.min(1) < 40) & (np.abs(reg - bgv).sum(1) > 90)]
                if len(neu) >= 8:
                    dd = np.abs(neu - bgv).sum(1); w["color"] = np.median(neu[dd >= np.percentile(dd, 85)], axis=0)
                elif runcols: w["color"] = runcols[0]
                st["colour_guarded"] = st.get("colour_guarded", 0) + 1
            # never trade a clearly readable stored colour for a faint one (a line box straddling a bar edge)
            for w_ in r["words"]:
                nc = np.abs(np.array(w_["color"], float) - bgv).sum()
                for rc in runcols:
                    oc = np.abs(rc - bgv).sum()
                    if oc > 150 and nc < 0.5 * oc: w_["color"] = rc; st["contrast_kept"] = st.get("contrast_kept", 0) + 1; break
            pieces = []                                   # (text, src_run, colour, bold)
            for i, ((a, b), w) in enumerate(zip(toks, r["words"])):
                end = toks[i + 1][0] if i + 1 < len(toks) else len(text)
                col_ = w["color"]
                oc_ = src[a].find(q("a:rPr") + "/" + q("a:solidFill") + "/" + q("a:srgbClr"))
                if oc_ is not None:
                    old = np.array([int(oc_.get("val")[i:i + 2], 16) for i in (0, 2, 4)], float)
                    Lb, Lo, Ln = bgv.mean(), old.mean(), np.array(col_, float).mean()
                    # polarity guard: light text on a dark ground stays light (and the reverse), and never fades
                    if (Lo > 225 and Ln < 205) or (Lo < 40 and Ln > 140) or \
                       (abs(Lo - Lb) > 60 and ((Lo - Lb) * (Ln - Lb) < 0 or abs(Ln - Lb) < 0.6 * abs(Lo - Lb))):
                        col_ = old; st["polarity_kept"] = st.get("polarity_kept", 0) + 1
                pieces.append([text[a:end], src[a], hexs(col_), bool(w["bold"]), bool(w["ital"])])
            merged = []
            for pc in pieces:
                if merged and merged[-1][1] is pc[1] and merged[-1][2] == pc[2] and merged[-1][3] == pc[3] and merged[-1][4] == pc[4]: merged[-1][0] += pc[0]
                else: merged.append(pc)
            for x in old_runs:
                rp = x.find(q("a:rPr"))
                c0 = rp.find(q("a:solidFill") + "/" + q("a:srgbClr")) if rp is not None else None
            before = {(x.findtext(q("a:t")), (x.find(q("a:rPr")).get("b") if x.find(q("a:rPr")) is not None else None)) for x in old_runs}
            anchor = old_runs[0]
            for t_, s_, col, bd, itl in merged:
                nr = copy.deepcopy(s_)
                nr.find(q("a:t")).text = t_
                rp = nr.find(q("a:rPr"))
                if rp is None: rp = etree.SubElement(nr, q("a:rPr")); nr.insert(0, rp)
                oldc = rp.find(q("a:solidFill") + "/" + q("a:srgbClr"))
                if oldc is None or oldc.get("val", "").upper() != col: st["recoloured"] += 1
                if (rp.get("b") == "1") != bd: st["bold_changed"] += 1
                rp.set("b", "1" if bd else "0")
                if itl: rp.set("i", "1"); st["italic"] = st.get("italic", 0) + 1
                elif "i" in rp.attrib: del rp.attrib["i"]
                if newsize: rp.set("sz", str(int(newsize * 100)))
                set_fill(rp, col)
                anchor.addprevious(nr)
            for x in old_runs: pe.remove(x)
            if r["bullet"] or (lead and r["had_bullet_char"]):
                boxes_bullets.setdefault(r["sh"].name, []).append(r)
        # native bullets
        for name, rs in boxes_bullets.items():
            sh = byname[name]
            bx0 = min((r["bullet"][0] for r in rs if r["bullet"]), default=None)
            left_px = sh.left / px
            if bx0 is not None and bx0 < left_px - 1:
                newl = bx0 - 1; d = left_px - newl
                sh.left = Emu(int(round(newl * px))); sh.width = Emu(int(round(sh.width + d * px)))
                left_px = newl
            allr = [r for r in recs if r["sh"] is sh and "F" in r]
            for r in allr:
                pPr = r["p"]._p.get_or_add_pPr()
                tx = r["words"][0]["x0"]
                if r in rs and r["bullet"]:
                    b0 = r["bullet"][0]
                    pPr.set("marL", str(int(round((tx - left_px) * px)))); pPr.set("indent", str(int(round(-(tx - b0) * px))))
                    for t_ in ("buNone", "buChar", "buAutoNum", "buFont", "buClr", "buSzPct"):
                        for e in pPr.findall(q("a:" + t_)): pPr.remove(e)
                    col = r["words"][0]["color"]
                    bc = etree.Element(q("a:buClr")); etree.SubElement(bc, q("a:srgbClr"), val=hexs(col))
                    bf = etree.Element(q("a:buFont"), typeface="Arial")
                    bch = etree.Element(q("a:buChar"), char="•")
                    pos = 0
                    for i, ch in enumerate(pPr):
                        if etree.QName(ch).localname in ("lnSpc", "spcBef", "spcAft"): pos = i + 1
                    for e in (bch, bf, bc): pPr.insert(pos, e)
                    st["bullets"] += 1
                else:
                    off = tx - left_px
                    if off > 3:
                        pPr.set("marL", str(int(round(off * px)))); pPr.set("indent", "0")
        # lines that could not be split into words: line-level bold / italic / colour
        done = {id(r["p"]._p) for r in recs if "F" in r}
        for blk in info[si - 1]["ocr"]:
            sh = byname.get(blk["name"])
            if sh is None or not sh.has_text_frame: continue
            paras = [p for p in sh.text_frame.paragraphs if p.text.strip()]
            for p, l in (zip(paras, blk["lines"]) if len(paras) == len(blk["lines"]) else []):
                if id(p._p) in done or not p.runs: continue
                if difflib.SequenceMatcher(None, p.text.strip(), l["text"].strip()).ratio() < 0.6: continue   # box was corrected by hand
                box = (l["x"], l["y"], l["w"], l["h"])
                from wordfx import box_bg
                reg = img[max(0, l["y"] - 3):l["y"] + l["h"] + 3, max(0, l["x"] - 2):l["x"] + l["w"] + 2].astype(int)
                if reg.size == 0: continue
                bg = box_bg(reg)
                m = word_metrics(img, {"x0": max(0, l["x"] - 2), "x1": l["x"] + l["w"] + 2}, max(0, l["y"] - 3), l["y"] + l["h"] + 3, bg)
                if not m: continue
                sc = bold_score(p.text.strip(), m)
                bd = sc[0] >= thr(sc[2]); itl = slant(img, box) < -0.05
                for rr in p.runs:
                    if rr.font.bold != bd: st["bold_changed"] += 1
                    rr.font.bold = bd; rr.font.italic = True if itl else None
                st["fallback"] = st.get("fallback", 0) + 1
        # paragraphs not measured take their box's measured size
        for g in groups.values():
            sh = g[0]["sh"]; med = getattr(sh, "_box_pt", None)
            if not med: continue
            meas = {id(r["p"]._p) for r in g}
            for p in sh.text_frame.paragraphs:
                if id(p._p) in meas: continue
                for rr in p.runs:
                    if rr.font.size and abs(rr.font.size.pt - med) / med > 0.08: rr.font.size = Pt(med); st["resized"] += 1
        # fragments of one visual line split over several boxes: merge into the left one
        items = []
        for blk in info[si - 1]["ocr"]:
            sh = byname.get(blk["name"])
            if sh is None or not sh.has_text_frame or sh._element.getparent() is None: continue
            paras = [p for p in sh.text_frame.paragraphs if p.text.strip()]
            if len(paras) != len(blk["lines"]): continue
            for p, l in zip(paras, blk["lines"]): items.append([sh, p, l, len(paras)])
        items.sort(key=lambda it: it[2]["x"])
        gone = set()
        for i, a in enumerate(items):
            if id(a[1]._p) in gone: continue
            la = a[2]
            for b in items[i + 1:]:
                lb = b[2]
                if b[0] is a[0] or b[3] != 1 or id(b[1]._p) in gone: continue
                hmax = max(la["h"], lb["h"])
                gap = lb["x"] - (la["x"] + la["w"])
                numeric = lambda t: re.fullmatch(r"[\s\d.,%~+\-–x×$¥€£()]*", t) is not None
                if numeric(a[1].text) or numeric(b[1].text): continue          # chart labels stay where they are
                if abs((la["y"] + la["h"]) - (lb["y"] + lb["h"])) < 0.3 * hmax and -0.3 * hmax <= gap < 0.8 * hmax and 0.7 < lb["h"] / la["h"] < 1.45:
                    ra = a[1]._p.findall(q("a:r")); rb = b[1]._p.findall(q("a:r"))
                    if not ra or not rb: continue
                    sp = copy.deepcopy(ra[-1]); sp.find(q("a:t")).text = " "
                    last = ra[-1]; last.addnext(sp); last = sp
                    for x in rb:
                        nx = copy.deepcopy(x)
                        rp = nx.find(q("a:rPr")); rpa = ra[-1].find(q("a:rPr"))
                        if rp is not None and rpa is not None:
                            for k_ in ("sz", "b", "i"):
                                if rpa.get(k_) is not None: rp.set(k_, rpa.get(k_))
                                elif k_ in rp.attrib: del rp.attrib[k_]
                        last.addnext(nx); last = nx
                    b[0]._element.getparent().remove(b[0]._element); gone.add(id(b[1]._p))
                    la = {"x": la["x"], "y": la["y"], "w": lb["x"] + lb["w"] - la["x"], "h": la["h"]}; a[2] = la
                    a[0]._merged_right = max(getattr(a[0], "_merged_right", 0), lb["x"] + lb["w"] + 4)
                    st["merged"] = st.get("merged", 0) + 1
        # wrap-none boxes: width = the text's own width, so no renderer re-centres them
        for blk in info[si - 1]["ocr"]:
            sh = byname.get(blk["name"])
            if sh is None or not sh.has_text_frame: continue
            if sh._element.getparent() is None: continue
            bp = sh.text_frame._txBody.find(q("a:bodyPr"))
            if bp is None or bp.get("wrap") != "none": continue
            right = max([l["x"] + l["w"] + 4 for l in blk["lines"]] + [getattr(sh, "_merged_right", 0)])
            nw = (right - sh.left / px) * px
            if nw > 0: sh.width = Emu(int(round(nw)))
            for af in bp.findall(q("a:spAutoFit")): bp.remove(af)       # fixed box: renderers keep the text at its left edge
        # traced glyph pieces under a text box, in the text's colour
        for r in recs:
            sh = r["sh"]; l = r["line"]
            cols = {hexs(w["color"]) for w in r["words"]}
            for o in list(slide.shapes):
                if o is sh or o.shape_type not in (1, 5) or o.has_text_frame and o.text_frame.text.strip(): continue
                ox0, oy0 = o.left / px, o.top / px; ox1, oy1 = ox0 + o.width / px, oy0 + o.height / px
                if ox0 >= l["x"] - 3 and ox1 <= l["x"] + l["w"] + 3 and oy0 >= l["y"] - 4 and oy1 <= l["y"] + l["h"] + 4 and (oy1 - oy0) <= 1.3 * l["h"]:
                    try:
                        if o.fill.type != 1: continue
                        fc = str(o.fill.fore_color.rgb)
                    except Exception: continue
                    fcv = np.array([int(fc[i:i + 2], 16) for i in (0, 2, 4)])
                    if any(np.abs(fcv - np.array([int(c[i:i + 2], 16) for i in (0, 2, 4)])).sum() < 120 for c in cols):
                        o._element.getparent().remove(o._element); st["remnants"] += 1
        fix_photos(slide, img, px, st, [l for blk in info[si - 1]["ocr"] for l in blk["lines"]])
        fix_regions(slide, img, px, st)
        add_dashes(slide, img, px, st)
        report[si] = st
    prs.save(out)
    print(key, json.dumps(report))
    if "--report" in sys.argv: json.dump(report, open(sys.argv[sys.argv.index("--report") + 1], "w"), indent=1)

if __name__ == "__main__":
    main()
