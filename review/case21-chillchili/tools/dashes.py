"""dashes.py: find dashed / dotted lines and boxes on a page image.
find(img) -> dict(rects=[(x0,y0,x1,y1,color,thick,dash)], lines=[(x0,y0,x1,y1,color,thick,dash)])"""
import numpy as np

def _runs(v):
    ch = np.diff(np.r_[0, v.astype(np.int8), 0]); st = np.where(ch == 1)[0]; en = np.where(ch == -1)[0]
    return list(zip(st, en))

def _dashed_segments(mask_line, min_n=6):
    """Runs of regular dashes along one row: list of (x0, x1, on, off)."""
    rs = [(a, b) for a, b in _runs(mask_line) if 2 <= b - a <= 24]
    out = []; i = 0
    while i < len(rs):
        j = i
        while j + 1 < len(rs) and 2 <= rs[j + 1][0] - rs[j][1] <= 18: j += 1
        chain = rs[i:j + 1]; i = j + 1
        if len(chain) < min_n: continue
        on_m = np.median([b - a for a, b in chain]); off_m = np.median([chain[k + 1][0] - chain[k][1] for k in range(len(chain) - 1)])
        # split where a dash or a gap is far from the chain's typical size (text pieces glued to a dashed line)
        sub = [chain[0]]
        def flush(sub):
            if len(sub) < min_n: return
            core = sub[1:-1] if len(sub) >= 5 else sub
            on = np.array([b - a for a, b in core]); off = np.array([core[k + 1][0] - core[k][1] for k in range(len(core) - 1)])
            if on.std() <= max(1.6, 0.3 * on.mean()) and (len(off) == 0 or off.std() <= max(1.6, 0.35 * off.mean())):
                out.append((sub[0][0], sub[-1][1], float(np.median(on)), float(np.median(off)) if len(off) else 0.0))
        for k in range(1, len(chain)):
            a, b = chain[k]; gap = a - chain[k - 1][1]; ln = b - a
            ok_gap = abs(gap - off_m) <= max(2, 0.45 * off_m)
            ok_on = abs(ln - on_m) <= max(2, 0.45 * on_m) or k == len(chain) - 1
            if ok_gap and (ok_on or len(sub) == 1): sub.append((a, b))
            else:
                flush(sub); sub = [(a, b)]
        flush(sub)
    return out

def _scan(ink, img, axis):
    """Dashed lines along rows (axis 0) or columns (axis 1)."""
    A = ink if axis == 0 else ink.T
    I = img if axis == 0 else img.transpose(1, 0, 2)
    H = A.shape[0]; found = []
    min_n = 8 if axis == 0 else 4
    for y in range(2, H - 2):
        for x0, x1, on, off in _dashed_segments(A[y], min_n):
            if axis == 1 and x1 - x0 < 40: continue
            # a thin line: clear rows a few px above and below (text has ink there)
            up = min(A[max(0, y - k), x0:x1].mean() for k in range(3, 7))
            dn = min(A[min(H - 1, y + k), x0:x1].mean() for k in range(3, 7))
            if up > 0.12 or dn > 0.12: continue
            found.append([y, y, x0, x1, on, off])
    # merge rows of the same line (adjacent rows that overlap along the line)
    found.sort(key=lambda f: (f[0], f[2])); lines = []
    for f in found:
        for l in lines:
            if f[0] <= l[1] + 1 and min(f[3], l[3]) - max(f[2], l[2]) > 0.5 * min(f[3] - f[2], l[3] - l[2]):
                l[1] = max(l[1], f[0]); l[2] = min(l[2], f[2]); l[3] = max(l[3], f[3]); break
        else: lines.append(list(f))
    res = []
    for y0, y1, x0, x1, on, off in lines:
        if x1 - x0 < 30: continue
        px = I[y0:y1 + 1, x0:x1][A[y0:y1 + 1, x0:x1]]
        d = np.abs(px.astype(int) - 255).sum(1); core = px[d >= np.percentile(d, 70)] if len(px) > 10 else px
        col = np.median(core, axis=0)
        res.append((x0, y0, x1, y1, col, y1 - y0 + 1, on, off) if axis == 0 else (y0, x0, y1, x1, col, y1 - y0 + 1, on, off))
    return res

def dash_style(on, off, thick):
    r = on / max(1.0, thick)
    if r <= 1.6: return "sysDot"
    if r <= 3.5: return "sysDash" if off < on * 0.7 else "dash"
    return "dash" if r <= 6 else "lgDash"

def find(img):
    img = img.astype(int)
    ink = np.abs(img - 255).sum(2) > 110
    hs = _scan(ink, img, 0); vs = _scan(ink, img, 1)
    rects = []; used_h = set(); used_v = set()
    # boxes: two neighbouring vertical edges, with a dashed line along the top and the bottom between them
    vs_sorted = sorted(range(len(vs)), key=lambda k: vs[k][0])
    for ia, a in enumerate(vs_sorted):
        if a in used_v: continue
        va = vs[a]
        nxt = [b for b in vs_sorted[ia + 1:] if b not in used_v and vs[b][0] - va[0] >= 30
               and min(va[3], vs[b][3]) - max(va[1], vs[b][1]) > 15]
        if not nxt: continue
        b = nxt[0]; vb = vs[b]
        y0, y1 = min(va[1], vb[1]), max(va[3], vb[3])
        top = [k for k, h in enumerate(hs) if y0 - 16 <= h[1] <= y0 + 16 and h[0] <= va[0] + 12 and h[2] >= vb[2] - 12]
        bot = [k for k, h in enumerate(hs) if y1 - 16 <= h[3] <= y1 + 16 and h[0] <= va[0] + 12 and h[2] >= vb[2] - 12]
        if top and bot:
            used_v |= {a, b}; used_h |= {top[0], bot[0]}
            ht, hb = hs[top[0]], hs[bot[0]]
            th = int(round((va[5] + vb[5] + ht[5] + hb[5]) / 4)); col = np.median(np.array([va[4], vb[4], ht[4], hb[4]]), axis=0)
            rects.append((va[0], ht[1], vb[2], hb[3], col, th, dash_style(ht[6], ht[7], max(1, ht[5]))))
    lines = [(h[0], h[1], h[2], h[3], h[4], h[5], dash_style(h[6], h[7], h[5])) for k, h in enumerate(hs) if k not in used_h] + \
            [(v[0], v[1], v[2], v[3], v[4], v[5], dash_style(v[6], v[7], v[5])) for k, v in enumerate(vs) if k not in used_v]
    return {"rects": rects, "lines": lines}

if __name__ == "__main__":
    import sys, glob
    from PIL import Image
    key, pg = sys.argv[1], int(sys.argv[2])
    im = np.array(Image.open(sorted(glob.glob(f"/tmp/nr/img/{key}/pg-*.png"))[pg - 1]).convert("RGB"))
    r = find(im)
    for x in r["rects"]: print("rect", x[:4], "%02X%02X%02X" % tuple(int(v) for v in x[4]), x[5], x[6])
    for x in r["lines"]: print("line", x[:4], "%02X%02X%02X" % tuple(int(v) for v in x[4]), x[5], x[6])
