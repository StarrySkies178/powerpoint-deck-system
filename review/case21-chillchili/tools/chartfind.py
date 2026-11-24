"""chartfind.py: find bar / column charts on a page image and write nativize.py specs.

python3 chartfind.py key [slides] -> prints JSON {slide: [spec,...]}
Bars = solid rectangles of one colour (text inside them closed over). A column chart = 2+ columns on one
baseline (bottom within 3 px), similar width, even pitch; stacked segments touch. Same for horizontal bars
(left edge shared). Values from number labels (OCR) inside or just outside each bar; others measured with the
scale fitted on labelled bars. Charts with no number labels and no axis are skipped (they are diagrams)."""
import sys, json, re, glob, statistics
import numpy as np, cv2
from PIL import Image

NUM = re.compile(r"^[~≈<>]?[-+]?\$?\d[\d,]*(\.\d+)?\s*(%|x|bn|mn|k|K|M|B)?$")
ONE_SERIES = [False]          # boxchart: a plain column chart is one series, other colours are highlighted points
def num(t):
    t = t.strip().replace(",", "").lstrip("~≈<>$")
    m = re.match(r"^([-+]?\d+(\.\d+)?)", t)
    return float(m.group(1)) if m else None

def colours(img):
    px = img.reshape(-1, 3).astype(np.float32)
    keep = (px.min(1) < 235) & (px.max(1) - px.min(1) + (255 - px.max(1)) > 25)   # not page white
    s = px[keep]
    if len(s) < 500: return []
    if len(s) > 60000: s = s[np.random.default_rng(0).choice(len(s), 60000, replace=False)]
    K = 14
    _, lab, cen = cv2.kmeans(s, K, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1.0), 2, cv2.KMEANS_PP_CENTERS)
    cnt = np.bincount(lab.ravel(), minlength=K)
    out = [cen[i] for i in np.argsort(-cnt) if cnt[i] > 150]
    merged = []
    for c in out:
        if all(np.abs(c - m).sum() > 30 for m in merged): merged.append(c)
    return merged

def _split_rects(m, ox, oy):
    """column-run sweep inside one component's box -> rectangles"""
    H, W = m.shape; out = []
    d = np.diff(np.vstack([np.zeros((1, W), np.int8), m.astype(np.int8), np.zeros((1, W), np.int8)]), axis=0)
    open_ = []
    for x in range(W):
        st = np.where(d[:, x] == 1)[0]; en = np.where(d[:, x] == -1)[0]
        nxt = []
        for a, b in zip(st, en):
            if b - a < 3: continue
            hit = None
            for r in open_:
                if abs(r[2] - a) <= 2 and abs(r[3] - b) <= 2: hit = r; break
            if hit is not None: open_.remove(hit); hit[1] = x + 1; nxt.append(hit)
            else: nxt.append([x, x + 1, a, b])
        for r in open_:
            if r[1] - r[0] >= 6: out.append(r)
        open_ = nxt
    out += [r for r in open_ if r[1] - r[0] >= 6]
    return [{"x0": ox + r[0], "x1": ox + r[1], "y0": oy + int(r[2]), "y1": oy + int(r[3])} for r in out]

def rects(img):
    """Solid rectangles per colour (labels on bars closed over; touching shapes split by column runs)."""
    H, W = img.shape[:2]; im = img.astype(np.int16); out = []
    for c in colours(img):
        m = (np.abs(im - c.astype(np.int16)).sum(2) < 34).astype(np.uint8)
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 1), np.uint8))
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((1, 9), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(m, 4)
        for i in range(1, n):
            x, y, w, h, a = st[i]
            if w < 6 or h < 3 or a < 30 or w > 0.45 * W or h > 0.8 * H: continue
            sub = (lab[y:y + h, x:x + w] == i).astype(np.uint8)
            if a >= 0.93 * w * h: out.append({"x0": x, "x1": x + w, "y0": y, "y1": y + h})
            elif w * h < 400000: out += _split_rects(sub, x, y)
    res = []
    for r in out:
        w, h = r["x1"] - r["x0"], r["y1"] - r["y0"]
        if min(w, h) < 7 or w * h < 160: continue
        col = np.median(img[r["y0"]:r["y1"], r["x0"]:r["x1"]].reshape(-1, 3), axis=0)
        r.update(w=w, h=h, c="%02X%02X%02X" % tuple(int(v) for v in col)); res.append(r)
    return res

def scan_lane(img, a0, a1, base, horiz, limit):
    """Colour runs from the base outward along the middle of a bar lane -> stacked segments."""
    m0, m1 = int(a0 + 0.3 * (a1 - a0)), int(a1 - 0.3 * (a1 - a0)) + 1
    if horiz: prof = img[m0:m1, int(base):int(limit)].astype(int).transpose(1, 0, 2)   # along x
    else: prof = img[int(limit):int(base), m0:m1].astype(int)[::-1]                    # from base upward
    if prof.size == 0: return []
    col = np.median(prof, axis=1)
    bg = lambda c: c.min() >= 236
    runs = []; cur = None
    for t, c in enumerate(col):
        if cur is not None and np.abs(c - cur["c"]).sum() < 45: cur["n"] += 1; cur["sum"] += c; cur["c"] = cur["sum"] / cur["n"]; continue
        cur = {"s": t, "n": 1, "sum": c.copy(), "c": c.copy()}; runs.append(cur)
    # glue short interruptions (labels written on the bar) between runs of one colour
    out = []
    for r in runs:
        if out and np.abs(out[-1]["c"] - r["c"]).sum() < 45: out[-1]["n"] = r["s"] + r["n"] - out[-1]["s"]; continue
        out.append(dict(r))
    changed = True
    while changed:                       # glue short interruptions (labels on the bar) between runs of one colour
        changed = False
        for i_ in range(len(out)):
            if bg(out[i_]["c"]) or out[i_]["n"] < 3: continue
            tot = 0
            for j_ in range(i_ + 1, len(out)):
                if j_ > i_ + 1 and np.abs(out[j_]["c"] - out[i_]["c"]).sum() < 45 and out[j_]["n"] >= 3:
                    out[i_]["n"] = out[j_]["s"] + out[j_]["n"] - out[i_]["s"]; del out[i_ + 1:j_ + 1]; changed = True; break
                tot += out[j_]["n"]
                if tot > 18: break
            if changed: break
    segs = []; pos = 0
    for r in out:
        if r["s"] > pos + 2: break
        if bg(r["c"]) or r["n"] < 3:
            if r["n"] >= 3: break
            pos = r["s"] + r["n"]; continue
        segs.append({"from": r["s"], "to": r["s"] + r["n"], "c": "%02X%02X%02X" % tuple(int(v) for v in r["c"])}); pos = r["s"] + r["n"]
    def hx(c): return np.array([int(c[i:i + 2], 16) for i in (0, 2, 4)])
    k = 0
    while k + 1 < len(segs):
        a, b = segs[k], segs[k + 1]
        la, lb = a["to"] - a["from"], b["to"] - b["from"]
        if np.abs(hx(a["c"]) - hx(b["c"])).sum() < 90 or min(la, lb) < 6:
            keep = a if la >= lb else b
            segs[k] = {"from": a["from"], "to": b["to"], "c": keep["c"]}; del segs[k + 1]
        else: k += 1
    res = []
    for g in segs:
        if horiz: res.append({"x0": base + g["from"], "x1": base + g["to"], "y0": a0, "y1": a1, "c": g["c"]})
        else: res.append({"x0": a0, "x1": a1, "y0": base - g["to"], "y1": base - g["from"], "c": g["c"]})
    return res

def plausible(cols, horiz, img):
    """bars, not table cells or text: lengths differ (or stacked), gaps between bars, open page beyond the base"""
    A0, A1, B0, B1 = ("y0", "y1", "x0", "x1") if horiz else ("x0", "x1", "y0", "y1")
    lens = [abs(c["end"] - c["base"]) for c in cols]
    stacked = any(len(c["segs"]) > 1 for c in cols)
    th = statistics.median([c["thick"] for c in cols])
    if max(lens) < 30 or max(lens) < 1.3 * th: return False
    if max(c["thick"] for c in cols) > 1.25 * min(c["thick"] for c in cols) + 2: return False
    hx = lambda h: np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)])
    firsts = []
    for c in cols:
        k = hx(c["segs"][0]["c"])
        if all(np.abs(k - f).sum() > 60 for f in firsts): firsts.append(k)
    if len(firsts) > 2 and len(firsts) > len(cols) / 2: return False
    if not stacked and max(lens) < 1.08 * min(lens): return False
    gaps = [cols[i + 1][A0] - cols[i][A1] for i in range(len(cols) - 1)]
    if min(gaps) < 0.1 * statistics.median([c["thick"] for c in cols]): return False
    H, W = img.shape[:2]; b = int(cols[0]["base"]); light = 0
    for c in cols:
        m0, m1 = int(c[A0] + 0.3 * c["thick"]), int(c[A1] - 0.3 * c["thick"]) + 1
        if horiz: strip = img[m0:m1, max(0, b - 9):max(1, b - 3)]
        else: strip = img[min(H - 1, b + 3):min(H, b + 9), m0:m1]
        if strip.size and (strip.reshape(-1, 3).min(1) > 200).mean() > 0.4: light += 1
    return light >= 0.6 * len(cols)

def lane_lim(L, horiz):
    return max(r["x1"] for r in L["rs"]) + 120 if horiz else max(0, min(r["y0"] for r in L["rs"]) - 120)

def group_axis(rs, horiz, img):
    A0, A1, B0, B1 = ("y0", "y1", "x0", "x1") if horiz else ("x0", "x1", "y0", "y1")
    lanes = []
    for r in sorted(rs, key=lambda r: r[A0]):
        for L in lanes:
            if abs(L[A0] - r[A0]) <= 3 and abs(L[A1] - r[A1]) <= 3: L["rs"].append(r); break
        else: lanes.append({A0: r[A0], A1: r[A1], "rs": [r]})
    for L in lanes:
        L["thick"] = L[A1] - L[A0]
        L["bases"] = {int(x[B0] if horiz else x[B1]) for x in L["rs"]}
    lanes = [L for L in lanes if L["thick"] >= 8 and max((x[B1] - x[B0]) for x in L["rs"]) >= 10]
    bases = {}
    for L in lanes:
        for b in L["bases"]:
            for b2 in list(bases):
                if abs(b2 - b) <= 3: bases[b2].append(L); break
            else: bases[b] = [L]
    charts = []; used = set()
    for b, Ls in sorted(bases.items(), key=lambda kv: -len(kv[1])):
        Ls = sorted({id(L): L for L in Ls if id(L) not in used}.values(), key=lambda L: L[A0])
        if len(Ls) < 2: continue
        th = statistics.median([L["thick"] for L in Ls])
        lo_, hi_ = min(L[A0] for L in Ls) - 6 * th - 60, max(L[A1] for L in Ls) + 6 * th + 60
        for L in lanes:                   # lanes whose rects do not reach this base but whose bar does
            if id(L) in used or L in Ls or abs(L["thick"] - th) > max(3, 0.25 * th) or not (lo_ <= L[A0] <= hi_): continue
            near = min(abs((x[B0] if horiz else x[B1]) - b) for x in L["rs"])
            sg = scan_lane(img, L[A0], L[A1], b, horiz, lane_lim(L, horiz))
            if sg and abs((sg[0]["x0"] if horiz else sg[0]["y1"]) - b) <= 3 and near < 400: Ls.append(L)
        Ls.sort(key=lambda L: L[A0])
        Ls = [L for L in Ls if abs(L["thick"] - th) <= max(3, 0.25 * th)]
        # clustered: lanes touching their neighbour form clusters of equal size
        if len(Ls) >= 4:
            cl = [[Ls[0]]]
            for L in Ls[1:]:
                if L[A0] - cl[-1][-1][A1] <= max(4, 0.35 * th): cl[-1].append(L)
                else: cl.append([L])
            sizes = [len(c) for c in cl]
            if max(sizes) >= 2 and len(cl) >= 2 and sum(1 for x in sizes if x == max(sizes)) >= 0.6 * len(cl):
                m = max(sizes); cents = [(c[0][A0] + c[-1][A1]) / 2 for c in cl]
                pit = [cents[i + 1] - cents[i] for i in range(len(cents) - 1)]
                if max(pit) <= 1.25 * min(pit) + 6:
                    H, W = img.shape[:2]; chart = []
                    for c in cl:
                        cols = []
                        for L in c:
                            segs = scan_lane(img, L[A0], L[A1], b, horiz, lane_lim(L, horiz))
                            if segs: cols.append({A0: L[A0], A1: L[A1], "thick": L["thick"], "segs": segs[:1], "base": b,
                                                  "end": segs[0][B1] if horiz else segs[0][B0]})
                        chart.append(cols)
                    if all(chart):
                        for c in cl:
                            for L in c: used.add(id(L))
                        charts.append({"clustered": chart, "m": m})
                        continue
        # split into runs of even pitch
        groups = []; rest = list(Ls)
        while rest:
            g = [rest.pop(0)]; left = []
            for L in rest:
                gap = L[A0] - g[-1][A1]
                if gap < 2 or gap > 4 * th + 30: left.append(L); continue          # overlapping duplicate or far
                if len(g) >= 2:
                    p0 = g[-1][A0] - g[-2][A0]; p1 = L[A0] - g[-1][A0]
                    if abs(p1 - p0) > max(6, 0.2 * p0): left.append(L); continue
                g.append(L)
            groups.append(g); rest = [L for L in left if all(L is not x for x in g)]
            if len(g) == 1 and not rest: break
        H, W = img.shape[:2]
        for g in groups:
            if len(g) < 2: continue
            cols = []
            for L in g:
                segs = scan_lane(img, L[A0], L[A1], b, horiz, lane_lim(L, horiz))
                if not segs: break
                cols.append({A0: L[A0], A1: L[A1], "thick": L["thick"], "segs": segs, "base": b,
                             "end": segs[-1][B1] if horiz else segs[-1][B0]})
            else:
                if not plausible(cols, horiz, img): continue
                for L in g: used.add(id(L))
                charts.append(cols)
    return charts

def lines_in(lines, x0, y0, x1, y1):
    return [l for l in lines if x0 <= l["x"] + l["w"] / 2 <= x1 and y0 <= l["y"] + l["h"] / 2 <= y1]

def cdist(a, b):
    ca = np.array([a[0] - a[1], a[1] - a[2], a[2] - a[0]], float); cb = np.array([b[0] - b[1], b[1] - b[2], b[2] - b[0]], float)
    return 2 * np.abs(ca - cb).sum() + 0.3 * abs(a.mean() - b.mean())

def spec_clustered(ch, horiz, lines, img):
    A0, A1, B0, B1 = ("y0", "y1", "x0", "x1") if horiz else ("x0", "x1", "y0", "y1")
    cl = ch["clustered"]; m = ch["m"]; n = len(cl)
    base = cl[0][0]["base"]; th = statistics.median([c["thick"] for g in cl for c in g])
    nums = [l for l in lines if NUM.match(l["text"].strip())]
    vals = [[None] * n for _ in range(m)]; size = [[0.0] * n for _ in range(m)]; cols = [None] * m; used = []
    hx = lambda h: np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)])
    full = [g for g in cl if len(g) == m]
    if full:
        for i in range(m): cols[i] = full[0][i]["segs"][0]["c"]
    for j, g in enumerate(cl):
        for i, c in enumerate(g):
            s = c["segs"][0]
            si = min(range(m), key=lambda a: cdist(hx(cols[a]), hx(s["c"])) if cols[a] else 9999) if full else i
            if si >= m: continue
            cols[si] = cols[si] or s["c"]; size[si][j] = s[B1] - s[B0]
            if horiz: cand = [l for l in nums if s["y0"] - 3 <= l["y"] + l["h"] / 2 <= s["y1"] + 3 and s["x0"] - 2 <= l["x"] <= s["x1"] + 60]
            else: cand = [l for l in nums if s["x0"] - 6 <= l["x"] + l["w"] / 2 <= s["x1"] + 6 and s["y0"] - 40 <= l["y"] + l["h"] / 2 <= s["y1"]]
            if cand:
                l = min(cand, key=lambda l: abs(l["y"] + l["h"] - s["y0"])) if not horiz else cand[0]
                vals[si][j] = num(l["text"]); used.append(l)
            else:
                t = ocr_num(img, (s["x0"] - 2, s["y0"] + 1, s["x1"] + 2, s["y1"] - 1), s["c"]) if (s[B1] - s[B0]) >= 9 else None
                if t is None: t = ocr_num(img, (s["x0"] - 8, s["y0"] - 28, s["x1"] + 8, s["y0"] - 1) if not horiz else (s["x1"] + 1, s["y0"] - 2, s["x1"] + 70, s["y1"] + 2))
                if t is not None: vals[si][j] = num(t)
    pairs = [(size[a][j], vals[a][j]) for a in range(m) for j in range(n) if vals[a][j] not in (None, 0) and size[a][j] > 3]
    if len(pairs) < 2: return None, "too few labels"
    ks = sorted(h / v for h, v in pairs if v > 0); kk = statistics.median(ks)
    if sum(1 for x in ks if abs(x / kk - 1) < 0.25) / len(ks) < 0.6: return None, "labels disagree"
    notes = []; meas = [0] * m; read = [0] * m
    for a in range(m):
        for j in range(n):
            v = vals[a][j]
            if v not in (None, 0) and size[a][j] > 3 and abs(size[a][j] / v / kk - 1) >= 0.25: v = None
            if v is None:
                v = round(size[a][j] / kk, 1) if size[a][j] > 0 else None
                if size[a][j] > 0: notes.append(f"series {a + 1} point {j + 1} measured"); meas[a] += 1
            elif size[a][j] > 0: read[a] += 1
            vals[a][j] = v
    if any(meas[a] and read[a] for a in range(m)): return None, "a series mixes read and measured values"
    cents = [(g[0][A0] + g[-1][A1]) / 2 for g in cl]; width = max(g[-1][A1] - g[0][A0] for g in cl)
    inner = statistics.median([g[i + 1][A0] - g[i][A1] for g in cl for i in range(len(g) - 1)] or [0])
    cats = categories(lines, cents, base, horiz, (cents[1] - cents[0]) if n > 1 else width, width, used)
    lo = min(g[0][A0] for g in cl) - width * 0.4; hi = max(g[-1][A1] for g in cl) + width * 0.4
    end = min(c["end"] for g in cl for c in g) if not horiz else max(c["end"] for g in cl for c in g)
    typ = "bar" if horiz else "column"
    clear = [round(base - 2), round(lo), round(end + 60), round(hi)] if horiz else [round(lo), round(end - 40), round(hi), round(base + 26)]
    series = [{"name": cols[a] or "series", "values": vals[a], "color": cols[a] or "808080", "labels": True, "label_pos": "outEnd",
               "label_color": "262626", "label_size": 10} for a in range(m)]
    if sum(1 for c in cats if c) < 0.6 * n: return None, "no category labels"
    sp = {"name": "auto clustered " + typ, "type": typ, "clear": clear, "categories": cats, "series": series,
          "centers": [round(cents[0], 1), round(cents[-1], 1)], "bar": round(width, 1), "overlap": -round(inner / th * 100),
          "base": round(base, 1), "k": round(kk, 5), "cat_size": 10, "axis_line": "404040", "_notes": notes,
          "note": "Native clustered chart rebuilt from the page: values are the original's labels" + ("; some are measured from bar lengths" if notes else "") + "."}
    if horiz: sp["horizontal"] = True
    else: sp["top"] = round(end - 40)
    return sp, "ok"

def categories(lines, centres, base, horiz, pitch, thick, used):
    """Category label per bar; a text line spanning several bars ("2021E 2022E 2023E") is split by words."""
    cats = [""] * len(centres)
    if horiz:
        for i, cc in enumerate(centres):
            cand = [l for l in lines if base - 260 <= l["x"] + l["w"] <= base + 4 and abs(l["y"] + l["h"] / 2 - cc) <= max(thick / 2 + 4, 10) and l not in used]
            cand.sort(key=lambda l: -(l["x"] + l["w"]))
            if cand: cats[i] = cand[0]["text"]
        return cats
    below = [l for l in lines if base - 2 <= l["y"] <= base + 34 and l not in used]
    for l in sorted(below, key=lambda l: l["y"]):
        hit = [i for i, cc in enumerate(centres) if l["x"] - pitch / 3 <= cc <= l["x"] + l["w"] + pitch / 3]
        toks = l["text"].split()
        if len(hit) > 1 and len(toks) == len(hit):
            for i, t in zip(hit, toks):
                if not cats[i]: cats[i] = t
        elif len(hit) >= 1:
            i = min(hit, key=lambda i: abs(centres[i] - (l["x"] + l["w"] / 2)))
            if not cats[i]: cats[i] = l["text"]
    return cats

def spec_for(chart, horiz, lines, W, img=None, allow_mixed=False):
    if isinstance(chart, dict): return spec_clustered(chart, horiz, lines, img)
    A0, A1, B0, B1 = ("y0", "y1", "x0", "x1") if horiz else ("x0", "x1", "y0", "y1")
    n = len(chart); thick = statistics.median([c["thick"] for c in chart]); base = statistics.median([c["base"] for c in chart])
    centres = [(c[A0] + c[A1]) / 2 for c in chart]
    pitch = (centres[-1] - centres[0]) / (n - 1)
    colours_ = []
    for c in chart:
        for s in c["segs"]:
            if not any(np.abs(np.array([int(s["c"][i:i + 2], 16) for i in (0, 2, 4)]) - np.array([int(k[i:i + 2], 16) for i in (0, 2, 4)])).sum() < 60 for k in colours_):
                colours_.append(s["c"])
    def key(cc):
        for k in colours_:
            if np.abs(np.array([int(cc[i:i + 2], 16) for i in (0, 2, 4)]) - np.array([int(k[i:i + 2], 16) for i in (0, 2, 4)])).sum() < 60: return k
    layers = max(len(c["segs"]) for c in chart)
    vals = {k: [None] * n for k in colours_}; size = {k: [0.0] * n for k in colours_}; used_lines = []; ocr_read = []; ocr_above = []
    nums = [l for l in lines if NUM.match(l["text"].strip())]
    for j, c in enumerate(chart):
        for s in c["segs"]:
            k = key(s["c"]); L = (s[B1] - s[B0]); size[k][j] += L
            if horiz:
                inside = [l for l in nums if s["y0"] - 3 <= l["y"] + l["h"] / 2 <= s["y1"] + 3 and s["x0"] - 2 <= l["x"] + l["w"] / 2 <= s["x1"] + 2]
                after = [l for l in nums if s is c["segs"][-1] and s["y0"] - 3 <= l["y"] + l["h"] / 2 <= s["y1"] + 3 and s["x1"] - 2 <= l["x"] <= s["x1"] + 60]
            else:
                inside = [l for l in nums if s["x0"] - 3 <= l["x"] + l["w"] / 2 <= s["x1"] + 3 and s["y0"] - 2 <= l["y"] + l["h"] / 2 <= s["y1"] + 2]
                after = [l for l in nums if s is c["segs"][-1] and abs(l["x"] + l["w"] / 2 - (s["x0"] + s["x1"]) / 2) <= max(thick, 30) and s["y0"] - 45 <= l["y"] + l["h"] <= s["y0"] + 3]
            cand = inside or after
            if cand:
                l = cand[0] if inside else max(cand, key=lambda l: l["y"] if not horiz else -l["x"])
                vals[k][j] = num(l["text"]); used_lines.append(l)
            elif img is not None and (s[B1] - s[B0]) >= 9:
                t = ocr_num(img, (s["x0"] - 2, s["y0"] + 1, s["x1"] + 2, s["y1"] - 1), s["c"])
                if t is None and s is c["segs"][-1]:
                    t = ocr_num(img, (s["x0"] - 8, s["y0"] - 30, s["x1"] + 8, s["y0"] - 1) if not horiz else (s["x1"] + 1, s["y0"] - 2, s["x1"] + 70, s["y1"] + 2))
                    if t is not None: ocr_above.append((k, j))
                if t is not None: vals[k][j] = num(t); ocr_read.append((k, j))
    if layers == 1 and len(colours_) > 1 and (ONE_SERIES[0] or all(sum(1 for j in range(n) if size[k][j] > 0) <= max(1, n // 3) for k in colours_[1:])):
        # one series, some bars highlighted in another colour
        pc = [None] * n; v1 = [None] * n; s1 = [0.0] * n
        for k in colours_:
            for j in range(n):
                if size[k][j] > 0: pc[j] = k; v1[j] = vals[k][j]; s1[j] = size[k][j]
        main = max(colours_, key=lambda k: sum(1 for j in range(n) if size[k][j] > 0))
        colours_ = [main]; vals = {main: v1}; size = {main: s1}; point_cols = [c if c != main else None for c in pc]
    else: point_cols = None
    pairs = [(size[k][j], vals[k][j]) for k in colours_ for j in range(n) if vals[k][j] not in (None, 0) and size[k][j] > 3]
    if len(pairs) < max(2, 0.4 * sum(1 for k in colours_ for j in range(n) if size[k][j] > 3)): return None, "too few labels"
    ks = sorted(h / v for h, v in pairs if v > 0)
    if not ks: return None, "no positive labels"
    kk = statistics.median(ks)
    agree = sum(1 for x in ks if abs(x / kk - 1) < 0.25) / len(ks)
    if agree >= 0.6:                              # a few misread labels: drop them, they get measured
        for k in colours_:
            for j in range(n):
                v = vals[k][j]
                if v not in (None, 0) and size[k][j] > 3 and abs(size[k][j] / v / kk - 1) >= 0.25:
                    vals[k][j] = None
        agree = 1.0
    stacked = layers > 1
    if agree < 0.7:
        if stacked and all(len(c["segs"]) == layers for c in chart):
            tot = [sum(s[B1] - s[B0] for s in c["segs"]) for c in chart]
            if max(tot) - min(tot) <= 4: return None, "100% stacked: use percentages"  # handled below by caller
        return None, f"labels and lengths disagree ({agree:.0%})"
    notes = []
    for k in colours_:
        mixed = [vals[k][j] is None and size[k][j] > 3 for j in range(n)]
        if any(mixed) and any(vals[k][j] is not None and size[k][j] > 3 for j in range(n)) and not allow_mixed:
            return None, "a series mixes read and measured values"
        for j in range(n):
            if vals[k][j] is None:
                vals[k][j] = round(size[k][j] / kk, 1) if size[k][j] > 0 else 0
                if size[k][j] > 0: notes.append(f"series {k} point {j + 1} measured")
    cats = categories(lines, centres, base, horiz, pitch, thick, used_lines)
    end = min(c["end"] for c in chart) if not horiz else max(c["end"] for c in chart)
    lo = min(c[A0] for c in chart) - thick * 0.6; hi = max(c[A1] for c in chart) + thick * 0.6
    if horiz:
        clear = [round(base - 2), round(lo), round(end + 60), round(hi)]
        typ = "bar_stacked" if stacked else "bar"
    else:
        clear = [round(lo), round(end - 45), round(hi), round(base + 26)]       # the category labels under the axis go too
        typ = "column_stacked" if stacked else "column"
    series = []
    for k in colours_:
        lum = sum(int(k[i:i + 2], 16) for i in (0, 2, 4)) / 3
        series.append({"name": k, "values": vals[k], "color": k, "labels": True,
                       "label_pos": "ctr" if stacked else ("outEnd"), "label_color": ("FFFFFF" if (stacked and lum < 150) else "262626"),
                       "label_size": round(statistics.median([l["h"] for l in used_lines]) / 1.69 / 1.25 * 2) / 2 if used_lines else 10})
    if sum(1 for c in cats if c) < 0.6 * n and not allow_mixed: return None, "no category labels"
    if point_cols: series[0]["colors"] = point_cols
    if n == 2 and point_cols: return None, "two bars of two colours: ambiguous (waterfall ends?)"
    if horiz and sum(1 for c in cats if c) < 0.5 * n and not allow_mixed: return None, "bar chart without category labels"
    spec = {"name": "auto " + typ, "type": typ, "clear": clear, "categories": cats, "series": series,
            "centers": [round(centres[0], 1), round(centres[-1], 1)], "bar": round(thick, 1), "base": round(base, 1),
            "k": round(kk, 5), "cat_size": 10, "axis_line": "404040", "_notes": notes,
            "note": "Native chart rebuilt from the page: values are the original's labels" + ("; some are measured from bar lengths" if notes else "") + "."}
    if horiz: spec["horizontal"] = True
    else: spec["top"] = round(end - 45)
    # remove the number labels and categories we turned into chart text
    spec["_used"] = [l["text"] for l in used_lines]
    return spec, "ok"


def axis_lines(img, horiz_bars):
    """Long thin lines: baselines of column charts (horizontal) or of bar charts (vertical)."""
    nonwhite = (img.min(2) < 200).astype(np.uint8)
    if not horiz_bars:
        m = cv2.morphologyEx(nonwhite, cv2.MORPH_OPEN, np.ones((1, 120), np.uint8))
    else:
        m = cv2.morphologyEx(nonwhite, cv2.MORPH_OPEN, np.ones((80, 1), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8); out = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if not horiz_bars and h <= 4 and w >= 120: out.append((x, y, x + w, y + h))
        if horiz_bars and w <= 4 and h >= 80: out.append((x, y, x + w, y + h))
    return out

def bars_on_axis(img, line, horiz):
    """Lanes of bars standing on an axis line: runs of colour just beside the line."""
    x0, y0, x1, y1 = line; H, W = img.shape[:2]
    if not horiz:
        rows = [img[max(0, y0 - k)] for k in (3, 5, 8)]
        prof = np.median(np.stack(rows), axis=0)[x0:x1].astype(int); base = y0; off = x0
    else:
        cols_ = [img[:, min(W - 1, x1 + k)] for k in (2, 4, 7)]
        prof = np.median(np.stack(cols_), axis=0)[y0:y1].astype(int); base = x1; off = y0
    fg = prof.min(1) < 228
    runs = []; t = 0; L = len(fg)
    while t < L:
        if not fg[t]: t += 1; continue
        u = t
        while u < L and fg[u] and np.abs(prof[u] - prof[t]).sum() < 60: u += 1
        if u - t >= 8: runs.append((off + t, off + u, prof[(t + u) // 2]))
        t = max(u, t + 1)
    return base, runs


def floating_between(img, cols, horiz, th):
    """a coloured bar between two lanes that does not touch the axis (waterfall step)"""
    A0, A1 = ("y0", "y1") if horiz else ("x0", "x1")
    base = int(cols[0]["base"]); far = int(min(c["end"] for c in cols)) if not horiz else int(max(c["end"] for c in cols))
    for i in range(len(cols) - 1):
        g0, g1 = cols[i][A1], cols[i + 1][A0]
        if g1 - g0 < 1.5 * th: continue
        m = int((g0 + g1) / 2)
        line = img[min(far, base) - 20:base - 3, m] if not horiz else img[m, base + 3:max(far, base) + 20]
        if len(line) == 0: continue
        fg = (line.min(1) < 220).astype(np.int8)
        d = np.diff(np.r_[0, fg, 0]); st = np.where(d == 1)[0]; en = np.where(d == -1)[0]
        if any(e - s_ >= 12 for s_, e in zip(st, en)):
            w0 = img[(st[0] + en[0]) // 2 + (min(far, base) - 20 if not horiz else 0), max(0, m - 6):m + 7] if not horiz else None
            return True
    return False

def axis_charts(img):
    charts = []
    for horiz in (False, True):
        A0, A1, B0, B1 = ("y0", "y1", "x0", "x1") if horiz else ("x0", "x1", "y0", "y1")
        for line in axis_lines(img, horiz):
            base, runs = bars_on_axis(img, line, horiz)
            if len(runs) < 2: continue
            lanes = [{A0: a, A1: b, "thick": b - a} for a, b, _ in runs]
            th = statistics.median([L["thick"] for L in lanes])
            lanes = [L for L in lanes if abs(L["thick"] - th) <= max(3, 0.3 * th)]
            if len(lanes) < 2: continue
            cols = []
            for L in lanes:
                segs = scan_lane(img, L[A0], L[A1], base, horiz, (img.shape[1] if horiz else 0))
                if segs: cols.append({A0: L[A0], A1: L[A1], "thick": L["thick"], "segs": segs, "base": base,
                                      "end": segs[-1][B1] if horiz else segs[-1][B0]})
            if len(cols) < 2: continue
            gaps = [cols[i + 1][A0] - cols[i][A1] for i in range(len(cols) - 1)]
            if min(gaps) <= max(4, 0.35 * th) and len(cols) >= 4:     # clustered
                cl = [[cols[0]]]
                for c in cols[1:]:
                    if c[A0] - cl[-1][-1][A1] <= max(4, 0.35 * th): cl[-1].append(c)
                    else: cl.append([c])
                for g in cl:
                    for c in g: c["segs"] = c["segs"][:1]
                if len(cl) >= 2: charts.append((horiz, {"clustered": cl, "m": max(len(g) for g in cl)}))
                continue
            lens = [abs(c["end"] - c["base"]) for c in cols]
            if max(lens) < 25: continue
            if floating_between(img, cols, horiz, th): continue          # waterfall: leave it for a written spec
            charts.append((horiz, cols))
    return charts

def deck_lines(slide, px):
    out = []
    for sh in slide.shapes:
        if not sh.has_text_frame or not sh.text_frame.text.strip(): continue
        ps = [p for p in sh.text_frame.paragraphs if p.text.strip()]
        x, y, w, h = sh.left / px, sh.top / px, sh.width / px, sh.height / px
        for i, p in enumerate(ps):
            sz = max([r.font.size.pt for r in p.runs if r.font.size] or [10]) * 1.69
            out.append({"text": p.text.strip(), "x": x, "y": y + i * h / len(ps), "w": min(w, len(p.text) * sz * 0.55), "h": h / len(ps), "shape": sh.name, "W": w})
    return out

def find(key, si, info, page, slide=None, px=None):
    img = np.array(Image.open(page).convert("RGB"))
    lines = deck_lines(slide, px) if slide is not None else [l for b in info[si - 1].get("ocr", []) for l in b["lines"]]
    res = []
    found = axis_charts(img)
    for horiz, ch in found:
        sp, why = spec_for(ch, horiz, lines, img.shape[1], img)
        if sp: sp["slide"] = si; res.append(sp)
    return res

def ocr_num(img, box, segcol=None):
    """Read a number written inside a box (light on dark or dark on light)."""
    import pytesseract
    x0, y0, x1, y1 = [int(round(v)) for v in box]
    H, W = img.shape[:2]; x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
    if x1 - x0 < 6 or y1 - y0 < 6: return None
    reg = img[y0:y1, x0:x1].astype(int)
    bgc = np.array([int(segcol[i:i + 2], 16) for i in (0, 2, 4)]) if segcol else np.median(reg.reshape(-1, 3), axis=0)
    d = np.abs(reg - bgc).sum(2)
    if (d > 120).mean() < 0.01: return None
    ink = (d > 110).astype(np.uint8)
    e = 3; ink[:e] = 0; ink[-e:] = 0; ink[:, :e] = 0; ink[:, -e:] = 0          # bar edges are not text
    n, lab, st, _ = cv2.connectedComponentsWithStats(ink, 8)
    hh, ww = ink.shape
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if (x <= e and h > 0.8 * hh) or (y <= e and w > 0.8 * ww) or a < 4 or h > 0.9 * hh: ink[lab == i] = 0
    ys, xs = np.where(ink)
    if len(xs) < 8: return None
    pad = 4
    Y0, Y1, X0, X1 = max(0, ys.min() - pad), ys.max() + pad + 1, max(0, xs.min() - pad), xs.max() + pad + 1
    dd = d[Y0:Y1, X0:X1].astype(float); mask = cv2.dilate(ink[Y0:Y1, X0:X1], np.ones((3, 3), np.uint8)).astype(bool)
    dd[~mask] = 0
    im = (255 - np.clip(dd / max(1.0, np.percentile(dd[mask], 90)) * 255, 0, 255)).astype(np.uint8)
    im = cv2.resize(im, None, fx=5, fy=5, interpolation=cv2.INTER_CUBIC)
    im = cv2.copyMakeBorder(im, 20, 20, 20, 20, cv2.BORDER_CONSTANT, value=255)
    for psm in (7, 8):
        t = pytesseract.image_to_string(im, config=f"--psm {psm} -c tessedit_char_whitelist=0123456789.,%-+~").strip()
        t = t.replace(" ", "")
        if re.fullmatch(r"[~+-]?\d[\d,]*(\.\d+)?%?", t): return t
    return None

if __name__ == "__main__":
    key = sys.argv[1]; only = {int(x) for x in sys.argv[2].split(",")} if len(sys.argv) > 2 and sys.argv[2] != 'all' else None
    tag = json.load(open("/tmp/nr/final/final_tags.json"))[key]
    info = json.load(open(f"/tmp/nr/out/{key}.info{tag}.json"))["info"]
    pages = sorted(glob.glob(f"/tmp/nr/img/{key}/pg-*.png"))
    from pptx import Presentation
    prs = Presentation(sys.argv[3] if len(sys.argv) > 3 else f"/tmp/nr/pol/{key}.pptx")
    px = prs.slide_width / Image.open(pages[0]).size[0]
    out = {}
    for si, pg in enumerate(pages, 1):
        if only and si not in only: continue
        if si - 1 >= len(info): continue
        r = find(key, si, info, pg, prs.slides[si - 1], px)
        if r: out[si] = r
    print(json.dumps(out, indent=1, default=float))

