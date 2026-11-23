"""layout_skeleton.py <deck.pptx> <slide> [--gap 0.2] [--render [--pdf deck.pdf]]

The panel layout of one reference slide, for building a NEW slide in the same arrangement
(composeSlide(..., { regions })). Used when the user gives a deck as the style: pick the closest
OTHER slide of that deck (Style/slide-map.csv: same layout code / pattern), never the slide being remade.

How: mark where the slide's shapes sit (or, with --render, the ink of its render), then cut the body area (below the title,
above the source line) along empty gutters: first into horizontal bands, then each band into columns
(XY-cut, gutters >= --gap inches). Prints JSON: {"size", "body", "bands": [{"box", "cols": [box...]}],
"panels": [box...]} in inches; "panels" is the flat list, top-to-bottom, left-to-right.
"""
import sys, os, json, tempfile, subprocess
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "bench", "scripts"))
from bench_score import measure, render_pdf_page, render, walk, EMU, Ctx, run_props, count_lines, inherited_anchor, insets, _font
from pptx import Presentation

def ink_mask(png):
    a = np.asarray(Image.open(png).convert("RGB"), dtype=float)
    q = (a // 16).reshape(-1, 3).astype(int); vals, cnt = np.unique(q, axis=0, return_counts=True)
    bg = vals[cnt.argmax()] * 16 + 8
    return np.linalg.norm(a - bg, axis=-1) > 30

def runs(profile, min_gap):
    """ink runs along one axis, split by empty stretches of at least min_gap pixels"""
    out, start, empty = [], None, 0
    for i, v in enumerate(profile):
        if v:
            if start is None: start = i
            empty = 0; end = i
        elif start is not None:
            empty += 1
            if empty >= min_gap: out.append((start, end)); start, empty = None, 0
    if start is not None: out.append((start, end))
    return out

def skeleton(pptx, n, pdf=None, gap_in=0.2, source="shapes"):
    m = measure(pptx, n); W, H = m["size_in"]
    png = tempfile.mktemp(suffix=".png")
    if pdf: render_pdf_page(pdf, n, png)
    else: render(pptx, n, png)
    rink = ink_mask(png); os.remove(png)
    if source == "render": ink = rink
    else:   # ink that is drawn AND inside a shape's box: text overflowing its box (renderer font differences) can't bridge gutters,
            # and one text box holding two far-apart lines doesn't either (only its drawn lines count)
        k0 = rink.shape[1] / W; ink = np.zeros(rink.shape, bool)
        prs = Presentation(pptx); sl = prs.slides[n - 1]; ctx = Ctx(prs, sl)
        for sh, (x, y, w, h) in walk(sl.shapes):
            if w > 0.95 * W and h > 0.95 * H: continue
            x0, y0 = max(0, int(x * k0)), max(0, int(y * k0)); x1, y1 = min(ink.shape[1], int((x + w) * k0) + 1), min(ink.shape[0], int((y + h) * k0) + 1)
            if getattr(sh, "has_text_frame", False) and sh.has_text_frame and not sh.text_frame.text.strip() and sh.shape_type != 1 and \
               sh._element.find(".//{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill") is None: continue   # empty, unfilled boxes
            filled = sh._element.find("{http://schemas.openxmlformats.org/presentationml/2006/main}spPr/{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill") is not None
            if False and getattr(sh, "has_text_frame", False) and sh.has_text_frame and sh.text_frame.text.strip() and not filled:
                # an unfilled text box occupies only its text: lines x line height, and the widest line
                paras = []
                for p_ in sh.text_frame.paragraphs:
                    rr = [r for r in p_.runs if r.text.strip()]
                    if rr: rp = run_props(ctx, sh, p_, rr[0]); paras.append(("".join(r.text for r in p_.runs), rp[2], rp[1], rp[0]))
                if paras:
                    l, tp, r, b = insets(sh); nl, hs = count_lines(paras, max(0.1, w - l - r)); th = sum(hs)
                    wmax = min(w, max(_font(f, bo, pt).getlength(t) / 4 / 72 for t, bo, f, pt in paras) + l + r)
                    an = inherited_anchor(ctx, sh)
                    ty = y + h - b - th if an == "b" else (y + (h - th) / 2 if an == "ctr" else y + tp)
                    al = sh.text_frame.paragraphs[0].alignment
                    tx = x + (w - wmax) / 2 if str(al).startswith("CENTER") else (x + w - wmax if str(al).startswith("RIGHT") else x)
                    x0, x1 = max(0, int(tx * k0)), min(ink.shape[1], int((tx + wmax) * k0) + 1)
                    y0, y1 = max(0, int(ty * k0)), min(ink.shape[0], int((ty + th) * k0) + 1)
            ink[y0:y1, x0:x1] = True
        ink &= rink
    k = ink.shape[1] / W; g = max(2, int(gap_in * k))
    t = m.get("title", {}); tb = t.get("box")
    top = (tb[1] + tb[3] + 0.05) if tb else 0.2 * H
    bot = m["source"]["top_in"] - 0.05 if m.get("source") else 0.93 * H
    r0, r1 = int(top * k), int(bot * k)
    body = ink[r0:r1].copy()
    # drop long thin rules (panel underlines, separators): they bridge the gutters between panels
    thin = max(2, int(0.06 * k))
    long_rows = body.mean(axis=1) > 0.35
    for a, b in runs(long_rows, 1):
        if b - a < thin: body[a:b + 1] = False
    long_cols = body.mean(axis=0) > 0.35
    for a, b in runs(long_cols, 1):
        if b - a < thin: body[:, a:b + 1] = False
    for y_ in range(body.shape[0]):                  # shorter rules too: a run of ink >= 1.2 in on one row, nothing above or below it
        pass
    rows = body.mean(axis=1) > 0.002
    bands = []
    for a, b in runs(rows, g):
        if (b - a) / k < 0.25: continue
        cols_ = runs(body[a:b + 1].mean(axis=0) > 0.002, g)
        cols = [[round(c0 / k, 2), round((r0 + a) / k, 2), round((c1 - c0) / k, 2), round((b - a) / k, 2)] for c0, c1 in cols_ if (c1 - c0) / k > 0.5]
        bands.append({"box": [round(min(c[0] for c in cols), 2) if cols else 0, round((r0 + a) / k, 2), round((max(c[0] + c[2] for c in cols) - min(c[0] for c in cols)) if cols else W, 2), round((b - a) / k, 2)], "cols": cols})
    panels = [c for b in bands for c in b["cols"]]
    return {"size": [W, H], "body": [0, round(top, 2), W, round(bot - top, 2)], "bands": bands, "panels": panels}

if __name__ == "__main__":
    a = sys.argv[1:]; pdf = None; gap = 0.2; src = "shapes"
    if "--render" in a: a.remove("--render"); src = "render"
    if "--pdf" in a: i = a.index("--pdf"); pdf = a[i + 1]; a = a[:i] + a[i + 2:]
    if "--gap" in a: i = a.index("--gap"); gap = float(a[i + 1]); a = a[:i] + a[i + 2:]
    print(json.dumps(skeleton(a[0], int(a[1]), pdf, gap, src), indent=1))
