"""autochart.py: find traced column charts on a rebuilt slide and draft a nativize.py spec.

Usage: python3 autochart.py key deck.pptx [slides] > draft.json
A column chart = 2+ bars (solid rectangles, same width, same baseline, even spacing); bars of the same
x stacked on each other make a stacked chart; series by fill colour. Values come from number labels on or
above each segment; unlabelled segments are measured from their height with the scale fitted on labelled ones.
The draft always needs a look: it prints notes on anything guessed."""
import sys, re, json, statistics
import numpy as np
from pptx import Presentation

NUM = re.compile(r"^[~≈]?-?\d[\d,]*(\.\d+)?%?$")

def walk(shapes):
    for s in shapes:
        if s.shape_type == 6: yield from walk(s.shapes)
        else: yield s

def fill_hex(s):
    try:
        if s.fill.type == 1: return str(s.fill.fore_color.rgb)
    except Exception: return None
    return None

def is_rect(s):
    """A traced rectangle: freeform or rect whose path is (nearly) its bounding box."""
    if s.shape_type == 1: return True
    if s.shape_type != 5: return False
    xml = s._element.xml
    pts = re.findall(r'<a:pt x="(\d+)" y="(\d+)"', xml)
    if not (4 <= len(pts) <= 6) or "a:cubicBezTo" in xml: return False
    xs = sorted({int(x) for x, _ in pts}); ys = sorted({int(y) for _, y in pts})
    def two(v): return len(v) >= 2 and all(min(abs(a - v[0]), abs(a - v[-1])) <= max(2, 0.04 * (v[-1] - v[0] + 1)) for a in v)
    return two(xs) and two(ys)

def num(t):
    t = t.strip().replace(",", "").lstrip("~≈")
    if t.endswith("%"): t = t[:-1]
    try: return float(t)
    except ValueError: return None

def page_rects(img):
    """Solid axis-aligned rectangles on the page (bars), from colour-uniform connected pieces."""
    import cv2
    H, W = img.shape[:2]
    q = (img // 20).astype(np.int32); key = q[..., 0] * 4096 + q[..., 1] * 64 + q[..., 2]
    ks, cnt = np.unique(key, return_counts=True)
    out = []
    for k_, c_ in zip(ks, cnt):
        if c_ < 150: continue
        rgb = np.array([k_ // 4096, (k_ // 64) % 64, k_ % 64]) * 20 + 10
        if rgb.min() >= 235: continue                          # page background
        m = (key == k_).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(m, 4)
        for i in range(1, n):
            x, y, w, h, a = st[i]
            if w < 6 or h < 3 or w > 0.3 * W or a < 0.9 * w * h or a < 40: continue
            col = np.median(img[y:y + h, x:x + w].reshape(-1, 3), axis=0)
            out.append({"x0": x - 0.5, "y0": y - 0.5, "x1": x + w + 0.5, "y1": y + h + 0.5,
                        "c": "%02X%02X%02X" % tuple(int(v) for v in col), "name": f"page rect {x},{y}"})
    return out

def slide_charts(slide, px, img=None):
    rects = []; texts = []
    for s in walk(slide.shapes):
        x0, y0 = s.left / px, s.top / px; x1, y1 = x0 + s.width / px, y0 + s.height / px
        if s.has_text_frame and s.text_frame.text.strip():
            for p in s.text_frame.paragraphs:
                if p.text.strip(): texts.append((p.text.strip(), x0, y0, x1, y1, s.name))
            continue
    rects = page_rects(img)
    # columns: rects grouped by x-span
    cols = []
    for r in sorted(rects, key=lambda r: (r["x0"], -r["y1"])):
        for c in cols:
            if abs(c["x0"] - r["x0"]) <= 3 and abs(c["x1"] - r["x1"]) <= 3: c["segs"].append(r); break
        else: cols.append({"x0": r["x0"], "x1": r["x1"], "segs": [r]})
    for c in cols:
        c["segs"].sort(key=lambda r: -r["y1"])
        # keep the contiguous stack from the bottom
        st = [c["segs"][0]]
        for r in c["segs"][1:]:
            if abs(r["y1"] - st[-1]["y0"]) <= 4: st.append(r)
        c["segs"] = st; c["base"] = st[0]["y1"]; c["top"] = st[-1]["y0"]; c["w"] = c["x1"] - c["x0"]
    # charts: columns on one baseline with similar widths
    charts = []; used = set()
    for i, c in enumerate(sorted(cols, key=lambda c: c["x0"])):
        if id(c) in used: continue
        grp = [c]
        for d in sorted(cols, key=lambda c: c["x0"]):
            if d is c or id(d) in used: continue
            if abs(d["base"] - c["base"]) <= 3 and abs(d["w"] - c["w"]) <= max(3, 0.2 * c["w"]) and d["x0"] > grp[-1]["x1"] - 1 \
               and d["x0"] - grp[-1]["x1"] < 6 * c["w"]:
                grp.append(d)
        if len(grp) >= 2:
            for g in grp: used.add(id(g))
            charts.append(grp)
    out = []
    for grp in charts:
        n = len(grp); centers = [(g["x0"] + g["x1"]) / 2 for g in grp]; bar = statistics.median([g["w"] for g in grp])
        base = statistics.median([g["base"] for g in grp])
        layers = max(len(g["segs"]) for g in grp)
        colours = []
        for g in grp:
            for s_ in g["segs"]:
                if s_["c"] not in colours: colours.append(s_["c"])
        stacked = layers > 1
        # series = colour (stacked) or one series
        series = {c: [None] * n for c in colours}
        heights = {c: [0.0] * n for c in colours}
        for j, g in enumerate(grp):
            for s_ in g["segs"]:
                heights[s_["c"]][j] = s_["y1"] - s_["y0"]
                # a number label inside the segment, or just above the top segment
                cand = [t for t in texts if NUM.match(t[0]) and g["x0"] - 0.6 * bar <= (t[1] + t[3]) / 2 <= g["x1"] + 0.6 * bar
                        and ((s_["y0"] - 2 <= (t[2] + t[4]) / 2 <= s_["y1"] + 2) or (s_ is g["segs"][-1] and s_["y0"] - 40 <= (t[2] + t[4]) / 2 < s_["y0"]))]
                if cand:
                    t = min(cand, key=lambda t: abs((t[2] + t[4]) / 2 - (s_["y0"] + s_["y1"]) / 2)); series[s_["c"]][j] = num(t[0])
        nlab = sum(v is not None for c in colours for v in series[c])
        if nlab == 0: continue                                   # charts carry number labels; boxes and banners don't
        hs = [g["base"] - g["top"] for g in grp]
        if n >= 2 and max(hs) - min(hs) < 3 and not stacked and len({series[c][j] for c in colours for j in range(n)}) <= 1: continue
        # scale: labelled heights vs values
        pairs = [(heights[c][j], series[c][j]) for c in colours for j in range(n) if series[c][j] is not None and heights[c][j] > 3]
        k = None; note = []
        if pairs:
            ks = [h / v for h, v in pairs if v and v > 0]
            if ks: k = statistics.median(ks)
            spread = (max(ks) / min(ks) - 1) if ks and min(ks) > 0 else 0
            if spread > 0.25: note.append(f"labels and heights disagree (k spread {spread:.0%}); check values")
        for c in colours:
            for j in range(n):
                if series[c][j] is None and heights[c][j] > 0:
                    if k: series[c][j] = round(heights[c][j] / k, 1); note.append(f"{c} bar {j + 1} measured, not labelled")
                    else: series[c][j] = round(heights[c][j], 1); note.append(f"{c} bar {j + 1}: no scale, raw height")
                if series[c][j] is None: series[c][j] = 0
        # categories: text just under the baseline at each centre
        cats = []
        for cx in centers:
            cand = [t for t in texts if t[2] >= base - 2 and t[2] <= base + 40 and abs((t[1] + t[3]) / 2 - cx) <= max(bar, 0.6 * (centers[1] - centers[0]) if n > 1 else bar)]
            cats.append(min(cand, key=lambda t: t[2])[0] if cand else "")
        top = min(g["top"] for g in grp)
        x0 = min(g["x0"] for g in grp) - bar * 0.8; x1 = max(g["x1"] for g in grp) + bar * 0.8
        spec = {"name": "auto chart", "type": "column_stacked" if stacked else "column",
                "clear": [round(x0), round(top - 30), round(x1), round(base + 30)],
                "categories": cats, "centers": [round(centers[0], 1), round(centers[-1], 1)], "bar": round(bar, 1),
                "base": round(base, 1), "top": round(top - 30), "k": round(k, 4) if k else None,
                "series": [{"name": c, "values": series[c], "color": c, "labels": True} for c in colours],
                "_notes": note, "_traced": [s_["name"] for g in grp for s_ in g["segs"]]}
        out.append(spec)
    return out

if __name__ == "__main__":
    key, deck = sys.argv[1], sys.argv[2]
    only = {int(x) for x in sys.argv[3].split(",")} if len(sys.argv) > 3 else None
    import glob
    from PIL import Image
    pages = sorted(glob.glob(f"/tmp/nr/img/{key}/pg-*.png"))
    prs = Presentation(deck); px = prs.slide_width / Image.open(pages[0]).size[0]
    res = {}
    for i, s in enumerate(prs.slides, 1):
        if only and i not in only: continue
        img = np.array(Image.open(pages[i - 1]).convert("RGB"))
        cs = slide_charts(s, px, img)
        if cs: res[i] = cs
    print(json.dumps(res, indent=1))
