"""boxchart.py: make a native chart spec for a chart whose box on the page is given by hand.

The box says where the chart is; the tool measures the rest from the page image (bars, base, scale, colours)
and reads values from the deck's number labels (falling back to OCR on the bar, then to bar length).

python3 boxchart.py key deck.pptx boxes.json out_specs.json
boxes.json: [{"slide": 3, "box": [x0,y0,x1,y1], "kind": "column|bar|waterfall|line", ...overrides}]
overrides: "categories", "values" (list per series), "names", "colors", "clear", "keep", "fmt", "label_pos",
           "label_size", "cat_size", "legend", "type", "total" (true: label stacked totals from labels above columns)
"""
import sys, json, re, glob, statistics, copy
import numpy as np, cv2
from PIL import Image
sys.path.insert(0, "/tmp/nr/nat")
import chartfind as CF
from pptx import Presentation

def hx(c): return np.array([int(c[i:i + 2], 16) for i in (0, 2, 4)])
def hexc(c): return "%02X%02X%02X" % tuple(int(v) for v in c)

def blobs(img, box, horiz):
    x0, y0, x1, y1 = [int(v) for v in box]
    reg = img[y0:y1, x0:x1]
    border = np.r_[reg[0], reg[-1], reg[:, 0], reg[:, -1]].astype(int)
    bgc = np.median(border, axis=0)                                                     # page colour around the chart
    nonwhite = ((np.abs(reg.astype(int) - bgc).sum(2) > 24) & (reg.min(2) < 245)).astype(np.uint8)
    m = cv2.morphologyEx(nonwhite, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8), borderType=cv2.BORDER_CONSTANT, borderValue=0)   # text strokes and rules (up to 6 px) go
    # white labels written on bars are holes: fill holes that do not reach the box edge
    inv = (1 - m).astype(np.uint8); H, W = inv.shape
    lab_n, lab, hst, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
    edge = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    small = [i for i in range(1, lab_n) if i not in edge and hst[i][2] < 0.4 * W and hst[i][3] < 0.4 * H]   # label-sized holes only
    holes = np.isin(lab, small)
    m = (m | holes).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 4)
    out = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if w < 7 or h < 3 or a < 40: continue
        if max(w, h) < 26: continue                                                     # a glyph or a legend key, not a bar
        if a < 0.35 * w * h: continue                                                   # not solid (clusters of unequal bars pass)
        sub_ = {"x0": x0 + x, "x1": x0 + x + w, "y0": y0 + y, "y1": y0 + y + h}
        out += split_colours(img, sub_, horiz)
    return out

def split_colours(img, b, horiz):
    """bars of a cluster touching each other: split the blob where the colour changes across it"""
    if horiz:
        xs = slice(int(b["x0"]) + 2, int(b["x0"]) + 8); prof = np.median(img[int(b["y0"]):int(b["y1"]), xs].astype(int), axis=1); off = b["y0"]
    else:
        ys = slice(int(b["y1"]) - 8, int(b["y1"]) - 2); prof = np.median(img[ys, int(b["x0"]):int(b["x1"])].astype(int), axis=0); off = b["x0"]
    runs = []; t = 0; L = len(prof)
    while t < L:
        u = t
        while u < L and np.abs(prof[u] - prof[t]).sum() < 45: u += 1
        runs.append([t, u]); t = max(u, t + 1)
    runs = [r for r in runs if r[1] - r[0] >= 4]
    if len(runs) <= 1: return [b]
    cols_ = [np.median(prof[a:c], axis=0) for a, c in runs]
    solid = [c for c in cols_ if c.min() < 236]
    if any(c.min() >= 236 for c in cols_) or all(np.abs(c - solid[0]).sum() < 60 for c in solid):
        return [b]                                   # white label text on one bar, not touching bars
    out = []
    for a, c in runs:
        d = dict(b)
        if horiz: d["y0"], d["y1"] = off + a, off + c
        else: d["x0"], d["x1"] = off + a, off + c
        out.append(d)
    return out

def lanes_of(bs, horiz, img=None):
    A0, A1 = ("y0", "y1") if horiz else ("x0", "x1")
    lanes = []
    for b in sorted(bs, key=lambda b: b[A0]):
        for L in lanes:
            ov = min(L[A1], b[A1]) - max(L[A0], b[A0])
            if ov > 0.6 * min(L[A1] - L[A0], b[A1] - b[A0]):
                L["bs"].append(b); L[A0] = min(L[A0], b[A0]); L[A1] = max(L[A1], b[A1]); break
        else: lanes.append({A0: b[A0], A1: b[A1], "bs": [b]})
    for L in lanes:
        L["thick"] = L[A1] - L[A0]
        if horiz: L["lo"] = min(b["x0"] for b in L["bs"]); L["hi"] = max(b["x1"] for b in L["bs"])
        else: L["lo"] = max(b["y1"] for b in L["bs"]); L["hi"] = min(b["y0"] for b in L["bs"])
    return lanes

def refine(img, lanes, horiz):
    """true bar ends: the longest run of non-white median colour along the middle of the lane"""
    for L in lanes:
        if horiz:
            a0, a1 = int(L["y0"] + 0.3 * L["thick"]), int(L["y1"] - 0.3 * L["thick"]) + 1
            lo, hi = int(L["lo"]), int(L["hi"])
            prof = np.median(img[a0:a1, lo:hi].astype(int), axis=0)
        else:
            a0, a1 = int(L["x0"] + 0.3 * L["thick"]), int(L["x1"] - 0.3 * L["thick"]) + 1
            lo, hi = int(L["hi"]), int(L["lo"])
            prof = np.median(img[lo:hi, a0:a1].astype(int), axis=1)
        fg = prof.min(1) < 238
        # white separators (1-3 px) between stacked segments do not end a bar
        idx = np.where(fg)[0]
        for a_, c_ in zip(idx[:-1], idx[1:]):
            if 1 < c_ - a_ <= 4: fg[a_:c_] = True
        best = None; t = 0
        while t < len(fg):
            if not fg[t]: t += 1; continue
            u = t
            while u < len(fg) and fg[u]: u += 1
            if best is None or u - t > best[1] - best[0]: best = (t, u)
            t = u
        if best is None: continue
        if horiz: L["lo"], L["hi"] = lo + best[0], lo + best[1]
        else: L["hi"], L["lo"] = lo + best[0], lo + best[1]
    return lanes

def main_thick(lanes):
    """bar thickness shared by the most lanes (ties: the larger total area); glyph blobs and rules are odd ones out"""
    def area(L): return L["thick"] * abs(L["lo"] - L["hi"])
    best = None
    for L in lanes:
        grp = [M for M in lanes if abs(M["thick"] - L["thick"]) <= max(4, 0.3 * L["thick"])]
        key = (len(grp), sum(area(M) for M in grp))
        if best is None or key > best[0]: best = (key, statistics.median([M["thick"] for M in grp]))
    return best[1]

def pick_base(lanes, horiz):
    """the edge most lanes share (column bottoms / bar left edges)"""
    vals = [L["lo"] for L in lanes]
    best = None
    for v in vals:
        grp = [L for L in lanes if abs(L["lo"] - v) <= 4]
        if best is None or len(grp) > len(best[1]) or (len(grp) == len(best[1]) and ((v > best[0]) if not horiz else (v < best[0]))):
            best = (v, grp)
    return statistics.median([L["lo"] for L in best[1]]), best[1]

def measure(img, box, horiz):
    bs = blobs(img, box, horiz)
    lanes = refine(img, lanes_of(bs, horiz), horiz)
    if len(lanes) < 2: return None, None, "fewer than two bars found"
    th = main_thick(lanes)
    lanes = [L for L in lanes if abs(L["thick"] - th) <= max(4, 0.4 * th)]
    if len(lanes) < 1: return None, None, "no bars of one width"
    base, on = pick_base(lanes, horiz)
    if BASE[0] is not None:                       # axis given by hand: every lane stands on it
        base = BASE[0]
        for L in lanes: L["lo"] = base
        return base, lanes, "ok"
    # a thin first segment (under the opening size) lifts a lane's end: keep lanes ending near the base
    on = [L for L in lanes if abs(L["lo"] - base) <= max(4, 0.2 * abs(L["lo"] - L["hi"]))] if not horiz else \
         [L for L in lanes if abs(L["lo"] - base) <= max(4, 0.2 * abs(L["hi"] - L["lo"]))]
    return base, on, "ok"

def mode_colour(img, s):
    reg = img[int(s["y0"]) + 1:max(int(s["y0"]) + 2, int(s["y1"]) - 1), int(s["x0"]) + 1:max(int(s["x0"]) + 2, int(s["x1"]) - 1)].reshape(-1, 3)
    if len(reg) == 0: return s["c"]
    nw = reg[reg.min(1) < 236]
    if len(nw) > 0.2 * len(reg): reg = nw                    # white label text is not the bar's colour
    qz = (reg // 8).astype(np.int32); key = qz[:, 0] * 1024 + qz[:, 1] * 32 + qz[:, 2]
    vals, cnt = np.unique(key, return_counts=True); k = vals[cnt.argmax()]
    sel = reg[key == k]
    return hexc(np.median(sel, axis=0))

PALETTE = [None]
BASE = [None]
def palette_segs(img, L, base, horiz, lim, pal):
    """stacked segments by nearest legend colour along the middle of the lane (white separators ignored)"""
    P = np.array([hx(c) for c in pal]); A0, A1 = ("y0", "y1") if horiz else ("x0", "x1")
    m0, m1 = int(L[A0] + 0.3 * (L[A1] - L[A0])), int(L[A1] - 0.3 * (L[A1] - L[A0])) + 1
    m0, m1 = int(L[A0] + 0.2 * (L[A1] - L[A0])), int(L[A1] - 0.2 * (L[A1] - L[A0])) + 1
    if horiz: strip = img[m0:m1, int(base):int(lim)].astype(int).transpose(1, 0, 2)
    else: strip = img[int(lim):int(base), m0:m1].astype(int)[::-1]
    d = np.abs(strip[:, :, None, :] - P[None, None, :, :]).sum(3)          # rows x pixels x palette
    near = d.argmin(2); ok = d.min(2) < 70
    cls = []
    for r in range(strip.shape[0]):
        v = near[r][ok[r]]
        if len(v) < 0.3 * strip.shape[1]: cls.append(-1); continue        # mostly text or page: no class
        cls.append(int(np.bincount(v).argmax()))
    # runs of one class (short gaps of -1 inside a stack are separators)
    segs = []; t = 0; end = 0
    while t < len(cls):
        if cls[t] < 0:
            if segs and t - segs[-1]["to"] > 6: break
            t += 1; continue
        u = t
        while u < len(cls) and cls[u] == cls[t]: u += 1
        if segs and segs[-1]["i"] == cls[t]: segs[-1]["to"] = u
        else: segs.append({"i": cls[t], "from": t, "to": u})
        t = u
    out = []
    for g in segs:
        if g["to"] - g["from"] < 2: continue
        c = pal[g["i"]]
        if horiz: out.append({"x0": base + g["from"], "x1": base + g["to"], "y0": L["y0"], "y1": L["y1"], "c": c, "i": g["i"]})
        else: out.append({"x0": L["x0"], "x1": L["x1"], "y0": base - g["to"], "y1": base - g["from"], "c": c, "i": g["i"]})
    return out

def light_segs(img, L, base, horiz):
    A0, A1 = ("y0", "y1") if horiz else ("x0", "x1")
    m0, m1 = int(L[A0] + 0.3 * (L[A1] - L[A0])), int(L[A1] - 0.3 * (L[A1] - L[A0])) + 1
    if horiz: prof = np.median(img[m0:m1, int(base):int(L["hi"])].astype(int), axis=0)
    else: prof = np.median(img[int(L["hi"]):int(base), m0:m1].astype(int), axis=1)[::-1]
    runs = []; t = 0
    while t < len(prof):
        u = t
        while u < len(prof) and np.abs(prof[u] - prof[t]).sum() < 30: u += 1
        runs.append([t, u, np.median(prof[t:u], axis=0)]); t = max(u, t + 1)
    segs = []
    for a, c, col in runs:
        if c - a < 3 or col.min() >= 248:
            if segs: segs[-1]["to"] = c
            continue
        if segs and np.abs(hx(segs[-1]["c"]) - col).sum() < 30: segs[-1]["to"] = c; continue
        segs.append({"from": a, "to": c, "c": hexc(col)})
    out = []
    for g in segs:
        if horiz: out.append({"x0": base + g["from"], "x1": base + g["to"], "y0": L["y0"], "y1": L["y1"], "c": g["c"]})
        else: out.append({"x0": L["x0"], "x1": L["x1"], "y0": base - g["to"], "y1": base - g["from"], "c": g["c"]})
    return out

def make_cols(img, lanes, base, horiz, box):
    A0, A1, B0, B1 = ("y0", "y1", "x0", "x1") if horiz else ("x0", "x1", "y0", "y1")
    cols = []
    for L in sorted(lanes, key=lambda L: L[A0]):
        if PALETTE[0]:
            lim = box[2] if horiz else box[1]
            segs = palette_segs(img, L, base, horiz, lim, PALETTE[0])
            if segs: cols.append({A0: L[A0], A1: L[A1], "thick": L[A1] - L[A0], "segs": segs, "base": base, "end": segs[-1][B1] if horiz else segs[-1][B0]})
            continue
        lim = (min(box[2], L["hi"] + 1) if horiz else max(box[1], L["hi"] - 1)) if "hi" in L else (box[2] if horiz else box[1])
        segs = CF.scan_lane(img, L[A0], L[A1], base, horiz, lim)
        end_ = (segs[-1]["x1"] if horiz else segs[-1]["y0"]) if segs else None
        if "hi" in L and (end_ is None or abs(end_ - L["hi"]) > 6):      # pale segments the scan took for page
            segs = light_segs(img, L, base, horiz)
        if not segs: continue
        for sg in segs: sg["c"] = mode_colour(img, sg)
        cols.append({A0: L[A0], A1: L[A1], "thick": L[A1] - L[A0], "segs": segs, "base": base,
                     "end": segs[-1][B1] if horiz else segs[-1][B0]})
    return cols

def clustered(cols, horiz):
    A0, A1 = ("y0", "y1") if horiz else ("x0", "x1")
    th = statistics.median([c["thick"] for c in cols])
    gaps = [cols[i + 1][A0] - cols[i][A1] for i in range(len(cols) - 1)]
    if not gaps or min(gaps) > max(4, 0.35 * th) or len(cols) < 4: return None
    if max(gaps) < 0.8 * th: return None                     # even spacing: one series, bars close together
    cl = [[cols[0]]]
    for c in cols[1:]:
        if c[A0] - cl[-1][-1][A1] <= max(4, 0.35 * th): cl[-1].append(c)
        else: cl.append([c])
    for g in cl:
        for c in g: c["segs"] = c["segs"][:1]
    return {"clustered": cl, "m": max(len(g) for g in cl)} if len(cl) >= 2 else None

def waterfall(img, box, lines, W, b=None):
    """steps typed from the slide's labels (b["steps"], b["totals"] = indices of full bars from the axis);
    geometry measured: centres of the bars, the axis and the scale from the tallest full bar"""
    steps = b["steps"]; tots = set(b.get("totals", [0, len(steps) - 1])); n = len(steps)
    bs = blobs(img, box, False); lanes = refine(img, lanes_of(bs, False), False)
    th = main_thick(lanes) if lanes else 30
    lanes = sorted([L for L in lanes if abs(L["thick"] - th) <= max(4, 0.4 * th)], key=lambda L: L["x0"])
    if len(lanes) < 2: return None, "bars not found"
    if 0 in tots: base = lanes[0]["lo"]                            # the first bar stands on the axis
    elif (n - 1) in tots: base = lanes[-1]["lo"]
    else: base, _ = pick_base(lanes, False)
    lanes = [L for L in lanes if L["lo"] <= base + 4]
    full = [L for L in lanes if abs(L["lo"] - base) <= 4]
    c0 = (lanes[0]["x0"] + lanes[0]["x1"]) / 2; c1 = (lanes[-1]["x0"] + lanes[-1]["x1"]) / 2
    cents = [c0 + (c1 - c0) * j / (n - 1) for j in range(n)]
    # scale: full bars against their typed totals
    ks = []
    for L in full:
        cx = (L["x0"] + L["x1"]) / 2; j = min(range(n), key=lambda j: abs(cents[j] - cx))
        if j in tots and steps[j]: ks.append((base - L["hi"]) / abs(steps[j]))
    if not ks: return None, "no full bar to scale from"
    k = statistics.median(ks)
    run = 0; inv = [None] * n; up = [None] * n; dn = [None] * n; tot = [None] * n; tops = []
    for j, v in enumerate(steps):
        if j in tots: tot[j] = abs(v); run = abs(v); tops.append(base - run * k)
        elif v >= 0: inv[j] = round(run, 4); up[j] = v; run += v; tops.append(base - run * k)
        else: run += v; inv[j] = round(run, 4); dn[j] = -v; tops.append(base - (run - v) * k)
    def colour_at(j, lo_v, hi_v):
        cx = cents[j]
        for L in lanes:
            if L["x0"] <= cx <= L["x1"]:
                return mode_colour(img, {"x0": L["x0"], "x1": L["x1"], "y0": L["hi"], "y1": L["lo"], "c": "808080"})
        y0_ = base - hi_v * k; y1_ = base - lo_v * k
        col = img[max(0, int(y0_ - 15)):int(y1_ + 15), int(cx - 3):int(cx + 4)].astype(int)
        prof = np.median(col, axis=1); idx = [i for i, c in enumerate(prof) if c.min() < 235 and (c.max() - c.min() > 12 or c.max() < 225)]
        if not idx: return "BFBFBF"
        sel = prof[idx]
        return hexc(np.median(sel, axis=0))
    run = 0; cols = {}
    for j, v in enumerate(steps):
        if j in tots: cols.setdefault("tot", []).append(colour_at(j, 0, abs(v))); run = abs(v)
        elif v >= 0: cols.setdefault("up", []).append(colour_at(j, run, run + v)); run += v
        else: cols.setdefault("dn", []).append(colour_at(j, run + v, run)); run += v
    pitch = (c1 - c0) / (n - 1)
    cats = b.get("categories") or cats2(lines, cents, base, pitch)
    top = max(box[1], min(tops) - 40)
    nums = [l for l in lines if CF.NUM.match(l["text"].strip())]
    fmt = b.get("fmt", "#,##0.0" if any(isinstance(v, float) and v != int(v) for v in steps) else "#,##0")
    series = [{"name": "base", "values": inv, "color": "FFFFFF", "invisible": True}]
    def pc(name, vals, key):
        cs = cols.get(key, ["808080"]); it = iter(cs)
        per = [next(it) if v is not None else None for v in vals]
        main = max(set(cs), key=cs.count)
        s = {"name": name, "values": vals, "color": main, "labels": True, "label_pos": "outEnd" if key == "tot" else "inEnd", "label_color": "262626", "label_size": 10}
        if any(c and np.abs(hx(c) - hx(main)).sum() > 40 for c in per): s["colors"] = [c if c and np.abs(hx(c) - hx(main)).sum() > 40 else None for c in per]
        return s
    if any(v is not None for v in tot): series.append(pc("Total", tot, "tot"))
    if any(v is not None for v in up): series.append(pc("Increase", up, "up"))
    if any(v is not None for v in dn): series.append(pc("Decrease", dn, "dn"))
    for s in series[1:]: s["labels"] = False
    lab_top = [(inv[j] or 0) + (tot[j] or up[j] or dn[j] or 0) for j in range(n)]
    texts = b.get("texts") or [str(v) if j in tots else (("+" if b.get("plus") else "") + str(v) if v >= 0 else str(v)) for j, v in enumerate(steps)]
    spec = {"name": "waterfall", "type": "column_stacked", "clear": list(box), "categories": cats, "series": series,
            "centers": [round(c0, 1), round(c1, 1)], "bar": round(th, 1), "base": round(base, 1), "k": round(k, 5), "top": round(top),
            "cat_size": 10, "axis_line": "404040", "_used": [l["text"] for l in nums],
            "note": "Native waterfall (stacked columns on an invisible base): step values typed from the original's labels.",
            "total": {"values": lab_top, "texts": texts, "color": "262626", "size": 10}}
    return spec, "ok"

def line_chart(img, box, lines, colors=None):
    """line(s) with markers: x from category labels under the plot, y from the line colour, values from labels"""
    x0, y0, x1, y1 = [int(v) for v in box]
    reg = img[y0:y1, x0:x1].astype(int)
    if not colors:
        sat = (reg.max(2) - reg.min(2)) > 60
        if sat.sum() < 50: return None, "no coloured line"
        colors = [hexc(np.median(reg[sat], axis=0))]
    nums = [l for l in lines if CF.NUM.match(l["text"].strip()) and x0 <= l["x"] + l["w"] / 2 <= x1 and y0 <= l["y"] + l["h"] / 2 <= y1]
    cats_l = [l for l in lines if x0 <= l["x"] + l["w"] / 2 <= x1 and y1 - 45 <= l["y"] + l["h"] / 2 <= y1 + 5 and not CF.NUM.match(l["text"].strip()) or
              (x0 <= l["x"] + l["w"] / 2 <= x1 and y1 - 45 <= l["y"] + l["h"] / 2 <= y1 + 5 and re.fullmatch(r"(19|20)\d\d[A-Z]?", l["text"].strip()))]
    toks = []
    for l in cats_l:
        ws = l["text"].split()
        if len(ws) > 1 and all(re.fullmatch(r"(19|20)\d\d[A-Z]?|FY\d+|Y(ear)?\s?\d+", w) for w in ws):
            for i, w in enumerate(ws): toks.append((l["x"] + l["w"] * (i + 0.5) / len(ws), w))
        else: toks.append((l["x"] + l["w"] / 2, l["text"]))
    toks.sort()
    if len(toks) < 2: return None, "no category labels under the box"
    series = []; ys_all = []
    for c in colors:
        d = np.abs(reg - hx(c)).sum(2) < 60
        ys = []
        for cx, _ in toks:
            xi = int(cx - x0)
            col = d[:, max(0, xi - 2):xi + 3].any(1)
            r = np.where(col)[0]
            ys.append(y0 + float(np.median(r)) if len(r) else None)
        ys_all.append(ys); series.append(c)
    # scale from labels next to points
    pairs = []; vals = []
    for ys in ys_all:
        v_ = []
        for (cx, _), y in zip(toks, ys):
            if y is None: v_.append(None); continue
            cand = [l for l in nums if abs(l["x"] + l["w"] / 2 - cx) <= 40 and abs(l["y"] + l["h"] / 2 - y) <= 40]
            if cand:
                l = min(cand, key=lambda l: abs(l["y"] + l["h"] / 2 - y)); v = CF.num(l["text"]); v_.append(v)
                if v is not None: pairs.append((v, y))
            else: v_.append(None)
        vals.append(v_)
    if len(pairs) < 2: return None, "too few labels"
    A = np.array([[v, 1] for v, _ in pairs]); b = np.array([y for _, y in pairs])
    (slope, icpt), *_ = np.linalg.lstsq(A, b, rcond=None)
    k = -slope; base = icpt
    if k <= 0: return None, "labels do not rise with the line"
    for vs, ys in zip(vals, ys_all):
        for j, (v, y) in enumerate(zip(vs, ys)):
            if v is None and y is not None: vs[j] = round((base - y) / k, 2)
    cents = [cx for cx, _ in toks]; n = len(cents)
    pitch = (cents[-1] - cents[0]) / (n - 1)
    sers = [{"name": c, "values": v, "color": c, "labels": True, "label_pos": "t", "label_color": "262626", "label_size": 10, "marker": True}
            for c, v in zip(series, vals)]
    spec = {"name": "line", "type": "line_markers", "clear": [x0, y0, x1, y1 + 5], "categories": [t for _, t in toks], "series": sers,
            "centers": [round(cents[0], 1), round(cents[-1], 1)], "bar": round(pitch * 0.5, 1), "base": round(float(base), 1),
            "k": round(float(k), 5), "top": y0, "cat_size": 10, "axis_line": None,
            "_used": [l["text"] for l in nums], "note": "Native line chart: values are the original's labels; unlabelled points measured from the page."}
    if base > y1 + 5: spec["min"] = 0
    return spec, "ok"

PW = [1600]
def fontinfo(slide, names):
    """size, bold, colour of the first run of the named text shapes (the deck's own labels)"""
    out = []
    for sh in CF_walk(slide.shapes):
        if sh.name in names and sh.has_text_frame:
            for p in sh.text_frame.paragraphs:
                for r in p.runs:
                    if not r.text.strip(): continue
                    try: c = str(r.font.color.rgb) if r.font.color and r.font.color.type is not None else "262626"
                    except Exception: c = "262626"
                    out.append((r.font.size.pt if r.font.size else 10, bool(r.font.bold), c)); break
                break
    if not out: return None
    sz = statistics.median([o[0] for o in out]); bold = sum(o[1] for o in out) > len(out) / 2
    cs = [o[2] for o in out]; col = max(set(cs), key=cs.count)
    return sz, bold, col

def CF_walk(shapes):
    for sh in shapes:
        if sh.shape_type == 6: yield from CF_walk(sh.shapes)
        else: yield sh

def restyle(sp, slide, lines):
    """label and category fonts as the deck's own text boxes had them"""
    used = set(sp.get("_used", []))
    labs = [l["shape"] for l in lines if l["text"] in used]
    cats = set(c for c in sp.get("categories", []) if c)
    catl = [l["shape"] for l in lines if l["text"] in cats or any(c in l["text"].split() for c in cats)]
    fi = fontinfo(slide, set(labs)) if labs else None
    if fi:
        sz, bold, col = fi
        light = sum(int(col[i:i + 2], 16) for i in (0, 2, 4)) / 3 > 200
        if light and not sp["type"].startswith(("line",)):
            for s in sp["series"]:
                if s.get("labels") and s.get("label_pos") == "outEnd": s["label_pos"] = "inEnd"
        for s in sp["series"]:
            if s.get("labels") and not s.get("invisible"):
                s["label_size"] = sz; s["label_bold"] = bold
                if s.get("label_pos") in ("outEnd", "t", None) or s.get("label_color") in ("262626", None): s["label_color"] = col if s.get("label_pos") != "ctr" else s.get("label_color", col)
        if sp.get("total"):
            sp["total"]["size"] = sz; sp["total"]["bold"] = bold
            if sum(int(col[i:i + 2], 16) for i in (0, 2, 4)) / 3 < 120: sp["total"]["color"] = col   # dark deck text only
        if used and all(t.strip().endswith("%") for t in used):
            dec = max((len(t.strip().rstrip("%").split(".")[1]) if "." in t else 0) for t in used)
            for s in sp["series"]:
                if s.get("labels") and not s.get("fmt"): s["fmt"] = ("0." + "0" * dec if dec else "0") + '"%"'
        elif any("," in t for t in used):
            for s in sp["series"]:
                if s.get("labels") and not s.get("fmt"): s["fmt"] = "#,##0" if all("." not in t for t in used) else "#,##0.0#"
    fc = fontinfo(slide, set(catl)) if catl else None
    if fc and sp.get("cat_size") is not None:
        sp["cat_size"], sp["cat_bold"], sp["cat_color"] = fc
    if sp.get("cat_size") and not sp["type"].startswith("bar") and len(sp.get("categories", [])) > 1:
        c0, c1 = sp["centers"]; pitch = abs(c1 - c0) / (len(sp["categories"]) - 1); ppp = PW[0] / 960.0
        longest = max((len(w) for c in sp["categories"] for w in str(c).split()), default=1)
        need = longest * sp["cat_size"] * 0.56 * ppp
        if need > pitch * 0.98: sp["cat_size"] = max(7, round(sp["cat_size"] * pitch * 0.98 / need * 2) / 2)
    return sp

def cats2(lines, centres, base, pitch, horiz=False, depth=70):
    """category label per bar: every text line under the axis within half a pitch, joined top to bottom;
    a line spanning several bars is split into its words"""
    out = [[] for _ in centres]
    if horiz:
        for i, c in enumerate(centres):
            cand = [l for l in lines if l["x"] + l["w"] <= base + 6 and l["x"] + l["w"] >= base - 300 and abs(l["y"] + l["h"] / 2 - c) <= pitch / 2]
            cand.sort(key=lambda l: -(l["x"] + l["w"]))
            out[i] = [cand[0]["text"]] if cand else []
        return [" ".join(o) for o in out]
    for l in sorted([l for l in lines if base - 4 <= l["y"] <= base + depth and not CF.NUM.match(l["text"].strip()) or
                     (base - 4 <= l["y"] <= base + depth and re.fullmatch(r"(19|20)\d\d[A-Z]?", l["text"].strip()))], key=lambda l: l["y"]):
        hit = [i for i, c in enumerate(centres) if l["x"] - pitch * 0.3 <= c <= l["x"] + l["w"] + pitch * 0.3]
        toks = l["text"].split()
        if len(hit) > 1 and len(toks) == len(hit):
            for i, t in zip(hit, toks): out[i].append(t)
        elif len(hit) > 1:
            # words placed by character position
            n = len(l["text"]); pos = 0; ww = l.get("W", l["w"])
            for t in toks:
                st = l["text"].index(t, pos); pos = st + len(t)
                cx = l["x"] + ww * (st + len(t) / 2) / n
                i = min(range(len(centres)), key=lambda i: abs(centres[i] - cx))
                if abs(centres[i] - cx) <= pitch / 2: out[i].append(t)
        elif hit:
            i = min(hit, key=lambda i: abs(centres[i] - (l["x"] + l["w"] / 2))); out[i].append(l["text"])
    return [" ".join(o) for o in out]

MEAS = []
def rows100(img, box, lines, b):
    """100% bars where each row has its own segments (age bands, income bands...): series by position,
    each point coloured as drawn; values from the labels on the segments"""
    base, lanes, why = measure(img, box, True)
    if base is None: return None, why
    lanes = sorted(lanes, key=lambda L: L["y0"]); rows = []
    nums = [l for l in lines if CF.NUM.match(l["text"].strip())]
    for L in lanes:
        y = int((L["y0"] + L["y1"]) / 2); x0, x1 = int(L["lo"]), int(L["hi"])
        band = img[int(L["y0"] + 0.15 * L["thick"]):int(L["y1"] - 0.15 * L["thick"]) + 1, x0:x1].astype(int)
        qz = band // 12; key = qz[:, :, 0] * 10000 + qz[:, :, 1] * 100 + qz[:, :, 2]
        prof = []
        for xi in range(band.shape[1]):                   # the colour most of the column has (label glyphs are thin)
            v, c_ = np.unique(key[:, xi], return_counts=True); kk = v[c_.argmax()]
            prof.append(np.median(band[:, xi][key[:, xi] == kk], axis=0))
        prof = np.array(prof)
        runs = []; t = 0
        while t < len(prof):
            u = t
            while u < len(prof) and np.abs(prof[u] - prof[t]).sum() < 60: u += 1
            runs.append([t, u]); t = max(u, t + 1)
        segs = []
        for a, c in runs:
            if c - a < 6:
                if segs: segs[-1][1] = c
                continue
            if segs and np.abs(hx(segs[-1][2]) - np.median(prof[a:c], axis=0)).sum() < 40: segs[-1][1] = c; continue
            segs.append([a, c, mode_colour(img, {"x0": x0 + a, "x1": x0 + c, "y0": L["y0"], "y1": L["y1"], "c": "808080"})])
        tot = sum(c - a for a, c, _ in segs); vals = []
        for a, c, col in segs:
            lab = [l for l in nums if x0 + a - 4 <= l["x"] + l["w"] / 2 <= x0 + c + 4 and L["y0"] - 4 <= l["y"] + l["h"] / 2 <= L["y1"] + 4]
            v = CF.num(lab[0]["text"]) if lab else None
            if v is None:
                t_ = CF.ocr_num(img, (x0 + a + 1, L["y0"] + 2, x0 + c - 1, L["y1"] - 2), col)
                v = CF.num(t_) if t_ else round(100 * (c - a) / tot, 1)
                if t_ is None: MEAS.append(v)
            vals.append((v, col, lab[0] if lab else None))
        rows.append(vals)
    m = max(len(r) for r in rows); n = len(rows)
    series = []
    for i in range(m):
        series.append({"name": f"band {i + 1}", "values": [r[i][0] if i < len(r) else None for r in rows], "color": rows[0][i][1] if i < len(rows[0]) else "808080",
                       "colors": [r[i][1] if i < len(r) else None for r in rows], "labels": True, "label_pos": "ctr", "label_color": "FFFFFF", "label_size": 11,
                       "fmt": '0"%"', "label_colors": {j: ("FFFFFF" if sum(hx(r[i][1])) / 3 < 150 else "262626") for j, r in enumerate(rows) if i < len(r)}})
    cents = [(L["y0"] + L["y1"]) / 2 for L in lanes]; th = statistics.median([L["thick"] for L in lanes])
    used = [v[2]["text"] for r in rows for v in r if v[2]]
    sp = {"name": "100% bars", "type": "bar_stacked_100", "clear": list(box), "categories": b.get("categories") or [""] * n, "series": series,
          "centers": [round(cents[0], 1), round(cents[-1], 1)], "bar": round(th, 1), "base": round(base, 1), "k": 1, "top": max(L["hi"] for L in lanes),
          "cat_size": None, "axis_line": None, "_used": used, "note": "Native 100% bar chart: each row's segments are the original's labelled shares."}
    return sp, "ok"

def one(key, deck_slide, page, px, b):
    img = np.array(Image.open(page).convert("RGB"))
    lines = CF.deck_lines(deck_slide, px)
    kind = b.get("kind", "column"); box = b["box"]
    inb = CF.lines_in(lines, box[0] - 5, box[1] - 5, box[2] + 5, box[3] + 30)
    if kind == "waterfall": sp, why = waterfall(img, box, inb, img.shape[1], b)
    elif kind == "line": sp, why = line_chart(img, box, inb, b.get("colors"))
    elif kind == "rows100": sp, why = rows100(img, box, inb, b)
    else:
        horiz = kind == "bar"
        PALETTE[0] = b.get("palette"); BASE[0] = b.get("base_px")
        base, lanes, why = measure(img, box, horiz)
        if base is None: return None, why
        cols = make_cols(img, lanes, base, horiz, box)
        if len(cols) < 1: return None, "no bars after scanning"
        cl = clustered(cols, horiz) if not (b.get("not_clustered") or b.get("palette")) else None
        CF.ONE_SERIES[0] = not b.get("stacked_colors", False)
        if b.get("scale"):
            sp, why = by_scale(cols, cl, horiz, inb, b, img)
        elif b.get("totals") or b.get("force_values"):
            sp, why = forced(cols, horiz, lines, b, img)
        else:
            sp, why = CF.spec_for(cl if cl else cols, horiz, inb, img.shape[1], img, allow_mixed=True)
            if sp is None and b.get("values"): sp, why = forced(cols, horiz, lines, b, img)
    if sp is None: return None, why
    sp["slide"] = b["slide"]
    sp["clear"] = list(box)
    if not b.get("totals"): sp = restyle(sp, deck_slide, inb)
    else:
        sp["_used"] = [str(t) for t in b["totals"]]
        tl = [l for l in inb if CF.NUM.match(l["text"].strip())]
        sp["_used"] = [l["text"] for l in tl]; sp = restyle(sp, deck_slide, inb)
    if sp["type"].startswith("bar"): sp["top"] = min(sp.get("top", box[2]), box[2])
    else: sp["top"] = max(sp.get("top", box[1]), box[1])
    if "clear" in b and isinstance(b["clear"][0], list) and "frame" not in b: sp["frame"] = list(box)
    if b.get("centers"): sp["centers"] = b["centers"]
    for kk in ("punch", "overlays", "keep_max", "z", "categories", "clear", "keep", "keep_colors", "strip_lines", "legend", "cat_size", "type", "frame", "top", "remove_pictures", "name", "note", "extra_clear", "min", "val_size"):
        if kk in b: sp[kk] = b[kk]
    if b.get("n") and kind != "waterfall":                 # short bars the page scan missed: extend at the same pitch
        m = len(sp["series"][0]["values"]); n = b["n"]
        if n > m and m >= 2:
            c0, c1 = sp["centers"]; pitch = (c1 - c0) / (m - 1); sp["centers"] = [c0, round(c0 + pitch * (n - 1), 1)]
            for s in sp["series"]:
                if s.get("colors"): s["colors"] = s["colors"] + [s["colors"][-1]] * (n - m)
                s["values"] = s["values"] + [None] * (n - m)
            if len(sp["categories"]) < n: sp["categories"] = sp["categories"] + [""] * (n - len(sp["categories"]))
    if kind not in ("waterfall", "line") and not b.get("categories") and any(not c for c in sp["categories"]):
        c0, c1 = sp["centers"]; m = len(sp["categories"]); pitch = (c1 - c0) / max(1, m - 1)
        cents = [c0 + pitch * j for j in range(m)]
        cc = cats2(inb, cents, sp["base"], abs(pitch) if m > 1 else sp["bar"] * 2, sp["type"].startswith("bar"))
        sp["categories"] = [a or c for a, c in zip(sp["categories"], cc)]
    if "values" in b:
        for s, v in zip(sp["series"], b["values"]): s["values"] = v
    if "names" in b:
        for s, v in zip(sp["series"], b["names"]): s["name"] = v
    if "colors" in b and kind != "line":
        for s, v in zip(sp["series"], b["colors"]): s["color"] = v
    for kk in ("fmt", "label_pos", "label_size", "label_color"):
        if kk in b:
            for s in sp["series"]:
                if s.get("labels"): s[kk] = b[kk]
    for a in b.get("add_series") or []: sp["series"].append(dict(a))
    if b.get("colors_points"):
        n_ = len(sp["series"][0]["values"]); cp = [b["colors_points"].get(str(j)) for j in range(n_)]
        sp["series"][0]["colors"] = cp
    if b.get("val_fmt"): sp["val_fmt"] = b["val_fmt"]
    for i, t in enumerate((b.get("texts") or []) if kind != "waterfall" else []):               # labels as the slide shows them (some points unlabelled)
        if i < len(sp["series"]) and t is not None:
            s_ = sp["series"][i]; s_["texts"] = t; s_["labels"] = True
            s_["label_color"] = "FFFFFF" if sum(hx(s_["color"])) / 3 < 140 else "262626"
    for s in sp["series"]:
        if s.get("labels") and s.get("label_pos") in ("ctr", "inEnd", "inBase") and s.get("color") and not s.get("invisible"):
            if sum(hx(s["color"])) / 3 < 140 and s.get("label_color", "262626") in ("262626", "404040", "000000"): s["label_color"] = "FFFFFF"
    if b.get("total_vals"):
        sp["total"] = {"values": b["total_vals"], "color": b.get("total_color", "262626"), "size": b.get("label_size", sp["series"][0].get("label_size", 10)), "fmt": "#,##0"}
        if b.get("total_texts"): sp["total"]["texts"] = b["total_texts"]
    for i, sk in (b.get("label_skip") or {}).items(): sp["series"][int(i)]["label_skip"] = sk
    if b.get("no_labels"):
        for s in sp["series"]: s["labels"] = False
    return sp, why

def by_scale(cols, cl, horiz, lines, b, img):
    """no labels on the bars: values from bar lengths and the axis scale [px_at_0, px_at_v, v]"""
    A0, A1, B0, B1 = ("y0", "y1", "x0", "x1") if horiz else ("x0", "x1", "y0", "y1")
    p0, p1, v1 = b["scale"]; k = abs(p1 - p0) / v1
    groups = cl["clustered"] if cl else [[c] for c in cols]
    m = max(len(g) for g in groups); n = len(groups)
    if PALETTE[0]:                                                   # stacked, one series per legend colour
        m = len(PALETTE[0]); vals = [[None] * n for _ in range(m)]; colors = list(PALETTE[0])
        for j, c in enumerate(cols):
            for s in c["segs"]: vals[s["i"]][j] = round((vals[s["i"]][j] or 0) + (s[B1] - s[B0]) / k, 2)
        typ = ("bar" if horiz else "column") + "_stacked"; overlap = None
        cents = [(c[A0] + c[A1]) / 2 for c in cols]; width = statistics.median([c["thick"] for c in cols])
    elif not cl and max(len(c["segs"]) for c in cols) > 1:            # stacked
        m = max(len(c["segs"]) for c in cols)
        vals = [[None] * n for _ in range(m)]; colors = [None] * m
        for j, c in enumerate(cols):
            for i, s in enumerate(c["segs"]): vals[i][j] = round((s[B1] - s[B0]) / k, 2); colors[i] = colors[i] or s["c"]
        typ = ("bar" if horiz else "column") + "_stacked"; overlap = None
        cents = [(c[A0] + c[A1]) / 2 for c in cols]; width = statistics.median([c["thick"] for c in cols])
    else:
        vals = [[None] * n for _ in range(m)]; colors = [None] * m
        for j, g in enumerate(groups):
            for i, c in enumerate(g):
                s = c["segs"][0]; vals[i][j] = round((s[B1] - s[B0]) / k, 2); colors[i] = colors[i] or s["c"]
        typ = "bar" if horiz else "column"
        cents = [(g[0][A0] + g[-1][A1]) / 2 for g in groups]; width = max(g[-1][A1] - g[0][A0] for g in groups)
        th = statistics.median([c["thick"] for g in groups for c in g])
        inner = statistics.median([g[i + 1][A0] - g[i][A1] for g in groups for i in range(len(g) - 1)] or [0])
        overlap = -round(inner / th * 100) if m > 1 else None
    base = cols[0]["base"]
    cats = b.get("categories") or CF.categories(lines, cents, base, horiz, (cents[-1] - cents[0]) / max(1, n - 1) if n > 1 else width, width, [])
    series = [{"name": (b.get("names") or [None] * m)[i] or colors[i] or f"s{i}", "values": vals[i], "color": colors[i] or "808080", "labels": False} for i in range(m)]
    sp = {"name": "chart", "type": typ, "clear": b["box"], "categories": cats, "series": series,
          "centers": [round(cents[0], 1), round(cents[-1], 1)], "bar": round(width, 1), "base": round(base, 1), "k": round(k, 5),
          "cat_size": 10, "axis_line": "404040", "note": "Native chart: no labels on the original, values measured from bar lengths against its axis."}
    if overlap is not None: sp["overlap"] = overlap
    if horiz: sp["top"] = b["box"][2]
    else: sp["top"] = b["box"][1]
    return sp, "ok"

def forced(cols, horiz, lines, b, img):
    """values given by hand: geometry from the bars, scale from the tallest bar"""
    A0, A1, B0, B1 = ("y0", "y1", "x0", "x1") if horiz else ("x0", "x1", "y0", "y1")
    n = len(cols)
    if b.get("totals"):                     # stacked columns labelled with totals only: segments measured
        T = b["totals"]; lens = [abs(c["end"] - c["base"]) for c in cols]
        k = statistics.median([l / t for l, t in zip(lens, T) if t])
        layers = max(len(c["segs"]) for c in cols)
        vals = [[None] * n for _ in range(layers)]
        for j, c in enumerate(cols):
            L_ = sum(sg[B1] - sg[B0] for sg in c["segs"])
            for i, sg in enumerate(c["segs"]): vals[i][j] = round(T[j] * (sg[B1] - sg[B0]) / L_, 1)
        b = dict(b); b["values"] = b.get("values") or vals
    vals = b["values"]
    stacked = len(vals) > 1 and b.get("stacked", True)
    m_ = len(vals); n_ = len(vals[0])
    if not stacked and m_ > 1 and len(cols) == m_ * n_:              # clustered: m bars per category
        groups = [cols[j * m_:(j + 1) * m_] for j in range(n_)]
        k = statistics.median([abs(c["end"] - c["base"]) / vals[i][j] for j, g in enumerate(groups) for i, c in enumerate(g) if vals[i][j]])
        cents = [(g[0][A0] + g[-1][A1]) / 2 for g in groups]; width = statistics.median([g[-1][A1] - g[0][A0] for g in groups])
        th = statistics.median([c["thick"] for c in cols]); inner = statistics.median([g[i + 1][A0] - g[i][A1] for g in groups for i in range(m_ - 1)])
        colors = b.get("colors") or [mode_colour(img, groups[-1][i]["segs"][0]) for i in range(m_)]
        base = cols[0]["base"]; end = min(c["end"] for c in cols)
        series = [{"name": (b.get("names") or [f"s{i}" for i in range(m_)])[i], "values": vals[i], "color": colors[i], "labels": True,
                   "label_pos": "outEnd", "label_color": "262626", "label_size": 10} for i in range(m_)]
        sp = {"name": "chart", "type": "column", "clear": list(b["box"]), "categories": b.get("categories") or [""] * n_, "series": series,
              "centers": [round(cents[0], 1), round(cents[-1], 1)], "bar": round(width, 1), "overlap": -round(inner / th * 100),
              "base": round(base, 1), "k": round(k, 5), "top": round(end - 45), "cat_size": 10, "axis_line": "404040",
              "note": "Native clustered columns: values typed from the original's labels."}
        return sp, "ok"
    tot = [sum(v[j] or 0 for v in vals) for j in range(n)] if stacked else [max((v[j] or 0) for v in vals) for j in range(n)]
    lens = [abs(c["end"] - c["base"]) for c in cols]
    j = max(range(n), key=lambda j: lens[j])
    if b.get("kscale"):                                    # [px of 0, px of v, v] read off the page by hand
        p0, p1, v1 = b["kscale"]; k = abs(p0 - p1) / v1
    else: k = None
    k = k or (lens[j] / tot[j] if not b.get("totals") else statistics.median([l / t for l, t in zip(lens, b["totals"]) if t]))
    centres = [(c[A0] + c[A1]) / 2 for c in cols]; th = statistics.median([c["thick"] for c in cols]); base = cols[0]["base"]
    cats = b.get("categories") or CF.categories(lines, centres, base, horiz, (centres[-1] - centres[0]) / max(1, n - 1), th, [])
    colors = b.get("colors") or [s["c"] for s in cols[j]["segs"]][:len(vals)]
    typ = ("bar" if horiz else "column") + ("_stacked" if stacked and len(vals) > 1 else "")
    end = min(c["end"] for c in cols) if not horiz else max(c["end"] for c in cols)
    if b.get("kscale"): base = b["kscale"][0]; end = base - max(tot) * k if not horiz else base + max(tot) * k
    lo = centres[0] - th; hi = centres[-1] + th
    clear = [round(base - 2), round(lo), round(end + 60), round(hi)] if horiz else [round(lo), round(end - 45), round(hi), round(base + 26)]
    series = [{"name": (b.get("names") or [f"s{i}" for i in range(len(vals))])[i], "values": v, "color": colors[i] if i < len(colors) else "808080",
               "labels": True, "label_pos": "ctr" if stacked else "outEnd", "label_color": "262626", "label_size": 10} for i, v in enumerate(vals)]
    sp = {"name": "chart", "type": typ, "clear": clear, "categories": cats, "series": series, "centers": [round(centres[0], 1), round(centres[-1], 1)],
          "bar": round(th, 1), "base": round(base, 1), "k": round(k, 5), "cat_size": 10, "axis_line": "404040",
          "note": "Native chart: values typed from the original's labels."}
    if b.get("totals"):
        sp["total"] = {"values": b["totals"], "color": "262626", "size": b.get("label_size", 10), "fmt": b.get("total_fmt", "#,##0")}
        for s_ in series: s_["labels"] = False
        sp["note"] = "Native stacked chart: totals are the original's labels; the split inside each column is measured from the page."
    if horiz: sp["horizontal"] = True; sp["top"] = round(end + 60)
    else: sp["top"] = round(end - 45)
    return sp, "ok"

if __name__ == "__main__":
    key, deck, boxes_p, out_p = sys.argv[1:5]
    boxes = json.load(open(boxes_p))
    pages = sorted(glob.glob(f"/tmp/nr/img/{key}/pg-*.png"))
    prs = Presentation(deck); W0 = Image.open(pages[0]).size[0]; px = prs.slide_width / W0
    out = []
    for b in boxes:
        pw = Image.open(pages[b["slide"] - 1]).size[0]; px = prs.slide_width / pw       # page images differ in size
        PW[0] = pw
        if "spec" in b:                                   # written by hand: passed through
            sp = dict(b["spec"]); sp["slide"] = b["slide"]; sp["pw"] = pw; out.append(sp); print("HAND", b["slide"], sp.get("name")); continue
        try: sp, why = one(key, prs.slides[b["slide"] - 1], pages[b["slide"] - 1], px, b)
        except Exception as e:
            import traceback; traceback.print_exc(); sp, why = None, f"error {e}"
        tag = f'{b["slide"]} {b.get("kind","column")} {b["box"]}'
        if sp is None: print("FAIL", tag, why); continue
        sp["pw"] = pw
        print("OK  ", tag, sp["type"], sp["categories"], [s["values"] for s in sp["series"]])
        out.append(sp)
    json.dump({"page_w": W0, "charts": out}, open(out_p, "w"), indent=1, default=float)
