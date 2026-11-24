"""wordfx.py: per-word measurements of a text line on a page image.
segments(img, box, text) -> dict(bullet=(x0,x1) or None, words=[dict(x0,x1,color,sw)], ok=bool)
sw = stroke width / line height (bold when high)."""
import numpy as np, cv2

def box_bg(reg):
    q = (reg // 16).astype(np.int32); key = q[..., 0] * 256 + q[..., 1] * 16 + q[..., 2]
    k = np.bincount(key.ravel()).argmax(); return np.median(reg[key == k], axis=0)

def segments(img, box, text):
    x, y, w, h = [int(round(v)) for v in box]
    H, W = img.shape[:2]
    X0, Y0, X1, Y1 = max(0, x - int(1.6 * h)), max(0, y - 2), min(W, x + w + 3), min(H, y + h + 2)
    reg = img[Y0:Y1, X0:X1].astype(int)
    if reg.size == 0: return None
    tight = img[max(0, y):min(H, y + h), max(0, x):min(W, x + w)].astype(int)   # the text's own background, not the margin around
    bg = box_bg(tight if tight.size else reg)
    d = np.abs(reg - bg).sum(2)
    if d.max() < 80: return None
    ink = d > max(80, 0.45 * np.percentile(d[d > 40], 90) if (d > 40).any() else 80)
    cols = ink.any(0)
    runs = []; i = 0; n = len(cols)
    while i < n:
        if cols[i]:
            j = i
            while j < n and cols[j]: j += 1
            runs.append([i, j]); i = j
        else: i += 1
    if not runs: return None
    toks = text.split()
    has_b = bool(toks) and toks[0] in ("•", "·", "-", "–", "▪", "●")
    if has_b: toks = toks[1:]
    elif toks and toks[0][:1] in "•●▪": toks[0] = toks[0][1:]; has_b = True
    pre_bullet = None
    if len(runs) > 1:                                   # a bullet dot is its own small solid blob
        a = runs[0]; sub = ink[:, a[0]:a[1]]; rows = np.where(sub.any(1))[0]
        bw = a[1] - a[0]; bh = (rows[-1] - rows[0] + 1) if len(rows) else 0
        if 2 <= bw <= 0.45 * h and 2 <= bh <= 0.5 * h and abs(bw - bh) <= max(3, 0.6 * bw) and sub[rows[0]:rows[-1] + 1].mean() > 0.55 \
           and runs[1][0] - a[1] >= 0.12 * h:
            pre_bullet = a; runs = runs[1:]
    # bullet: a small round blob, first run, left of the OCR box start or tiny
    bullet = None
    lh = Y1 - Y0
    for gapf in (0.22, 0.18, 0.26, 0.3, 0.15, 0.35, 0.4):
        g = max(2, gapf * h); ws = [list(runs[0])]
        for r in runs[1:]:
            if r[0] - ws[-1][1] < g: ws[-1][1] = r[1]
            else: ws.append(list(r))
        b = None
        if len(ws) > 1:
            a = ws[0]; sub = ink[:, a[0]:a[1]]; rows = np.where(sub.any(1))[0]
            bw, bh = a[1] - a[0], (rows[-1] - rows[0] + 1) if len(rows) else 0
            if bw <= 0.45 * h and bh <= 0.5 * h and bw >= 2 and abs(bw - bh) <= max(3, 0.5 * bw) and sub.mean() > 0.5:
                b = a
        if pre_bullet is not None: b = None
        rest = ws[1:] if b else ws
        if len(rest) == len(toks):
            bullet = b if b is not None else pre_bullet; ws = rest; break
    else:
        return {"bullet": None, "words": [], "ok": False, "bg": bg}
    words = []
    for a in ws:
        m = ink[:, a[0]:a[1]]; px = reg[:, a[0]:a[1]][m]
        dd = d[:, a[0]:a[1]][m]
        core = px[dd >= np.percentile(dd, 92)] if len(px) > 25 else px
        col = np.median(core, axis=0) if len(core) else bg
        m8 = m.astype(np.uint8)
        er = cv2.erode(m8, np.ones((3, 3), np.uint8))
        per = int((m8 - er).sum()); area = int(m8.sum())
        sw = (2.0 * area / max(1, per)) / max(1, h)
        words.append({"x0": X0 + a[0], "x1": X0 + a[1], "color": col, "sw": sw})
    out = {"toks": toks, "bullet": None if bullet is None else (X0 + bullet[0], X0 + bullet[1]), "words": words, "ok": True, "bg": bg,
           "had_bullet_char": bool(has_b)}
    return out

from PIL import Image as _I, ImageDraw as _D, ImageFont as _F
_FONTS = {False: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
          True: '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'}
_cache = {}
def ref(txt, bold):
    k = (txt, bold)
    if k in _cache: return _cache[k]
    f = _F.truetype(_FONTS[bold], 100)
    im = _I.new('L', (max(200, 80 * len(txt) + 100), 260), 255); _D.Draw(im).text((20, 40), txt, font=f, fill=0)
    a = (255 - np.array(im).astype(float)) / 255
    ys, xs = np.where(a > 0.45)
    r = (a.sum(), xs.max() - xs.min() + 1, ys.max() - ys.min() + 1) if len(xs) else (1, 1, 1)
    _cache[k] = r; return r

def word_metrics(img, seg, y0, y1, bg):
    """mass (ink px equivalents), width, height of the ink in [seg.x0, seg.x1) x [y0, y1)."""
    reg = img[y0:y1, seg["x0"]:seg["x1"]].astype(float)
    d = np.abs(reg - bg).sum(2)
    con = max(60.0, np.percentile(d, 99))
    a = np.clip(d / con, 0, 1)
    ys, xs = np.where(a > 0.45)
    if not len(xs): return None
    return a.sum(), xs.max() - xs.min() + 1, ys.max() - ys.min() + 1

def bold_score(tok, m):
    """0 = looks regular, 1 = looks bold (by ink mass at the size implied by the ink height)."""
    mr, wr, hr = ref(tok, False); mb, wb, hb = ref(tok, True)
    mass, w, h = m
    F = h / hr * 100
    er, eb = mr * (F / 100) ** 2, mb * (F / 100) ** 2
    s_mass = np.log(mass / er) / np.log(eb / er) if eb > er else 0
    wr_, wb_ = wr * F / 100, wb * F / 100
    s_w = np.log(w / wr_) / np.log(wb_ / wr_) if wb_ > wr_ * 1.01 else 0
    return s_mass, s_w, F

def italic_score(img, box):
    """Best shear that makes the line's strokes most vertical. ~0.2 for italic, ~0 for upright."""
    x, y, w, h = [int(round(v)) for v in box]
    H, W = img.shape[:2]
    X0, Y0, X1, Y1 = max(0, x - 2), max(0, y - 2), min(W, x + w + 2), min(H, y + h + 2)
    reg = img[Y0:Y1, X0:X1].astype(int)
    if reg.size == 0: return 0, 0
    bg = box_bg(reg); d = np.abs(reg - bg).sum(2)
    if d.max() < 80: return 0, 0
    a = np.clip(d / max(60, np.percentile(d, 99)), 0, 1)
    hh, ww = a.shape; yc = np.arange(hh) - hh * 0.7
    best = (-1, 0); base = None
    for s in np.arange(-0.1, 0.36, 0.05):
        prof = np.zeros(ww + hh)
        xs = (np.arange(ww)[None, :] + s * yc[:, None]).round().astype(int) + hh // 2
        np.add.at(prof, xs.clip(0, ww + hh - 1).ravel(), a.ravel())
        v = (prof ** 2).sum()
        if abs(s) < 1e-6: base = v
        if v > best[0]: best = (v, s)
    gain = best[0] / base - 1 if base else 0
    return best[1], gain

def slant(img, box):
    """Median lean of near-vertical stroke edges (tan of angle from vertical). Italic ~0.2, upright ~0."""
    x, y, w, h = [int(round(v)) for v in box]
    H, W = img.shape[:2]
    reg = img[max(0, y - 1):min(H, y + h + 1), max(0, x - 1):min(W, x + w + 1)].astype(np.float32)
    if reg.size == 0: return 0.0
    g = reg.mean(2)
    up = cv2.resize(g, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    gx = cv2.Sobel(up, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(up, cv2.CV_32F, 0, 1, ksize=3)
    mag = np.hypot(gx, gy); m = (mag > np.percentile(mag, 85)) & (np.abs(gx) > 2.5 * np.abs(gy))
    if m.sum() < 30: return 0.0
    t = -gy[m] / gx[m]                       # stroke lean: + means top leans right
    return float(np.median(t))
