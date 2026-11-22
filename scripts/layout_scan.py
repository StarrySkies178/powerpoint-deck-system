"""layout_scan.py — measure slide composition from rendered slide images (robust to overlapping shapes).
Content area = slide minus title band and footer. Recursive whitespace cuts on the ink mask give the panel grid.
Output per slide: signature (H = side by side, V = stacked), panel boxes (share of content area), gutters."""
import sys, os, glob, json
MINW, MINH = 0.2, 0.16
import numpy as np
from PIL import Image

def runs(prof, thr, min_gap):
    """gaps (start,end) where profile <= thr for at least min_gap pixels, excluding the margins."""
    empty = prof <= thr; gaps = []; i = 0; n = len(prof)
    first = np.argmax(~empty) if (~empty).any() else n; last = n - np.argmax((~empty)[::-1]) if (~empty).any() else 0
    i = first
    while i < last:
        if empty[i]:
            j = i
            while j < last and empty[j]: j += 1
            if j - i >= min_gap: gaps.append((i, j))
            i = j
        else: i += 1
    return gaps, first, last

def cut(m, x0, y0, x1, y1, W, H, depth=0):
    sub = m[y0:y1, x0:x1]
    if sub.sum() == 0: return None
    best = None
    for axis in (1, 0):  # axis=1: column profile -> vertical gutters -> side-by-side (H)
        prof = sub.sum(axis=0) if axis == 1 else sub.sum(axis=1)
        L = sub.shape[1] if axis == 1 else sub.shape[0]
        thr = max(1, 0.004 * (sub.shape[0] if axis == 1 else sub.shape[1]))
        gaps, f, l = runs(prof, thr, int((0.013 if axis == 1 else 0.02) * (W if axis == 1 else H)))
        minsz = (MINW * W) if axis == 1 else (MINH * H)
        for g0, g1 in sorted(gaps, key=lambda g: -(g[1] - g[0])):
            a = (f, g0); b = (g1, l)
            if a[1] - a[0] >= minsz and b[1] - b[0] >= minsz:
                score = (g1 - g0) / (W if axis == 1 else H) * (1.0 if axis == 1 else 1.1)
                if best is None or score > best[0]: best = (score, axis, (g0 + g1) // 2)
                break
    if best is None or depth > 5:
        ys, xs = np.nonzero(sub); return ("L", [x0 + xs.min(), y0 + ys.min(), x0 + xs.max(), y0 + ys.max()])
    _, axis, p = best
    if axis == 1: a = cut(m, x0, y0, x0 + p, y1, W, H, depth + 1); b = cut(m, x0 + p, y0, x1, y1, W, H, depth + 1); tag = "H"
    else: a = cut(m, x0, y0, x1, y0 + p, W, H, depth + 1); b = cut(m, x0, y0 + p, x1, y1, W, H, depth + 1); tag = "V"
    kids = [k for k in (a, b) if k]
    flat = []
    for k in kids: flat += k[1] if k[0] == tag else [k]
    return (tag, flat) if len(flat) > 1 else flat[0]

def scan(png, top=0.17, bottom=0.07):
    im = np.asarray(Image.open(png).convert("L"), dtype=int); H0, W = im.shape
    y0, y1 = int(top * H0), int((1 - bottom) * H0)
    bg = np.median(im[y0:y1]); m = (np.abs(im - bg) > 28).astype(np.uint8)
    import cv2
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))      # thin rules/borders don't join panels
    m[:y0] = 0; m[y1:] = 0
    T = cut(m, 0, y0, W, y1, W, H0)
    if not T: return None
    leaves = []
    def sig(t):
        if t[0] == "L":
            x0, yy0, x1, yy1 = t[1]; leaves.append([round(x0 / W, 3), round((yy0 - y0) / (y1 - y0), 3), round((x1 - x0) / W, 3), round((yy1 - yy0) / (y1 - y0), 3)]); return "p"
        return t[0] + "(" + ",".join(sig(c) for c in t[1]) + ")"
    return dict(sig=sig(T), leaves=leaves)

if __name__ == "__main__":
    out = {}
    for d in sys.argv[1:]:
        for p in sorted(glob.glob(os.path.join(d, "p-*.png")), key=lambda f: int(f.rsplit("-", 1)[1][:-4])):
            r = scan(p)
            if r: out[f"{os.path.basename(d.rstrip("/"))}#{int(p.rsplit('-',1)[1][:-4])}"] = r
    json.dump(out, open("/home/claude/study/layout_scan.json", "w"))
    print(len(out))
