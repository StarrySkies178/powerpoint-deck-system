"""draft.py key page x0 y0 x1 y1 base [--bar] [--colors HEX,HEX,...] [--tol N]
Measures a column (or, with --bar, horizontal bar) chart on the page image:
  bar centres and thickness (at the baseline side), stacked run heights per colour, top of each bar,
  and lists the OCR text inside the box (final rebuild info), so values can be calibrated from the reviewed labels."""
import sys, glob, json, collections, statistics
from PIL import Image
a = sys.argv; k, pg = a[1], int(a[2]); x0, y0, x1, y1, base = map(int, a[3:8])
horiz = "--bar" in a
cols = a[a.index("--colors") + 1].split(",") if "--colors" in a else None
tol = int(a[a.index("--tol") + 1]) if "--tol" in a else 60
im = Image.open(sorted(glob.glob(f"/tmp/nr/img/{k}/pg-*.png"))[pg - 1]).convert("RGB")
def dist(c, h): return sum(abs(c[i] - int(h[2 * i:2 * i + 2], 16)) for i in range(3))
def cls(c):
    if cols:
        d = [(dist(c, h), h) for h in cols]; m = min(d)
        return m[1] if m[0] <= tol else None
    if max(c) - min(c) < 18 and min(c) > 225: return None
    return "%02X%02X%02X" % tuple(v // 40 * 40 for v in c)
def P(x, y): return im.getpixel((x, y)) if not horiz else im.getpixel((y, x))
# scan line just inside the baseline to find bars
W0, W1 = (x0, x1) if not horiz else (y0, y1)
probe = base - 6 if not horiz else base + 6
row = [cls(P(t, probe)) for t in range(W0, W1)]
bars = []; s = None
for i, c in enumerate(row + [None]):
    if c is not None and s is None: s = i
    if c is None and s is not None:
        if i - s >= 4: bars.append((W0 + s, W0 + i - 1))
        s = None
print("bars (start,end):", bars)
if bars:
    print("centres:", [round((b0 + b1) / 2, 1) for b0, b1 in bars], "thickness median:", statistics.median(b1 - b0 + 1 for b0, b1 in bars))
for b0, b1 in bars:
    c = (b0 + b1) // 2; lane = []
    rng = range(base - 1, y0, -1) if not horiz else range(base + 1, x1)
    for t in rng:
        px_ = [P(c + d, t) for d in range(-max(2, (b1 - b0) * 2 // 5), max(2, (b1 - b0) * 2 // 5) + 1)]
        colored = [p for p in px_ if cls(p) is not None]
        if len(colored) < 0.3 * len(px_): lane.append(None); continue
        # cluster: the colour with most neighbours within 60
        best = max(colored, key=lambda p: sum(1 for o in colored if sum(abs(p[i] - o[i]) for i in range(3)) < 60))
        grp = [o for o in colored if sum(abs(best[i] - o[i]) for i in range(3)) < 60]
        lane.append(tuple(sum(o[i] for o in grp) // len(grp) for i in range(3)))
    def same(a_, b_): return (a_ is None and b_ is None) or (a_ is not None and b_ is not None and sum(abs(a_[i] - b_[i]) for i in range(3)) < 70)
    runs = []
    for v in lane:
        if runs and same(runs[-1][0], v): runs[-1][1] += 1; runs[-1][2].append(v)
        else: runs.append([v, 1, [v]])
    ch = True
    while ch:
        ch = False
        for i, r in enumerate(runs):
            if r[1] < 4 and r[0] is not None and len(runs) > 1:
                j = i - 1 if i > 0 else i + 1; runs[j][1] += r[1]; del runs[i]; ch = True; break
        m = []
        for r in runs:
            if m and same(m[-1][0], r[0]): m[-1][1] += r[1]; m[-1][2] += r[2]
            else: m.append(r)
        runs = m
    # stop at the first gap of >= 6 px background
    seg = []; total = 0
    for v, n, vs in runs:
        if v is not None:
            vv = [x for x in vs if x is not None]; v = "%02X%02X%02X" % tuple(sorted(x[i] for x in vv)[len(vv) // 2] for i in range(3))
        if v is None and n >= 6: break
        total += n; seg.append((v, n))
    print(f"bar {c}: length {total}px  runs(from base): {seg}")
from pptx import Presentation
names = dict(l.split() for l in open("/tmp/nr/keys.txt")); names.update(dict(l.split() for l in open("/tmp/nr/keys2.txt")))
prs = Presentation(f"/tmp/nr/final/{names[k]}-rebuilt.pptx"); px = prs.slide_width / im.width
def walk(shs):
    for sh in shs:
        if sh.shape_type == 6: yield from walk(sh.shapes)
        else: yield sh
txt = []
for sh in walk(prs.slides[pg - 1].shapes):
    if sh.has_text_frame and sh.text_frame.text.strip():
        cx, cy = (sh.left + sh.width / 2) / px, (sh.top + sh.height / 2) / px
        if x0 <= cx <= x1 and y0 <= cy <= y1: txt.append((round(cx), round(cy), sh.text_frame.text.strip().replace("\n", " / ")))
print("text (centre x, centre y):", sorted(txt, key=lambda t: (t[1] // 10, t[0])))
