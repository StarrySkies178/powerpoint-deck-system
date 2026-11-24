"""ocrtable.py: turn a picture-only table page into a native slide: title and notes as text boxes,
the table as a native PowerPoint table (cell text, fills and text colours read from the page), long rules as lines.

python3 ocrtable.py key slide deck_in.pptx deck_out.pptx  (several key:slide pairs allowed with --many)
"""
import sys, glob, re, statistics, json
import numpy as np, cv2, pytesseract
from PIL import Image
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
sys.path.insert(0, "/tmp/nr/nat")
import tables as T
import os
FILLED = []
RAWDUMP = {}
YEN = {'case24-yess:21': True}
CURKEY = ['']
GRIDDUMP = {}
SUS = []
CELLFIX = {}
OLDGIVEN = []
HDR = {}
BLOCK = {'case21-whyconsulting:19', 'case21-whyconsulting:20', 'case24-yess:23'}
CELLREAD_DONE = True
FIXFILL = {}
GRID = {"case24-yess:18", "case24-yess:21"}
CORR = json.load(open("/tmp/nr/nat/specs/table-corrections.json")) if os.path.exists("/tmp/nr/nat/specs/table-corrections.json") else {}

def words(img, scale=4):
    """Text chunks (phrases) found as ink on any ground, each read by tesseract on its own."""
    mb = cv2.medianBlur(img, 21)
    con = np.abs(img.astype(int) - mb.astype(int)).sum(2)
    ink = (con > 80).astype(np.uint8)
    edges = cv2.morphologyEx(ink, cv2.MORPH_OPEN, np.ones((1, 41), np.uint8)) | cv2.morphologyEx(ink, cv2.MORPH_OPEN, np.ones((41, 1), np.uint8))
    ink = (ink & (1 - cv2.dilate(edges, np.ones((3, 3), np.uint8)))).astype(bool)        # band edges and rules are not text
    con = np.where(ink, con, 0)
    H, W = ink.shape
    prof = ink.sum(1) > 0
    bands = []; t = 0
    while t < H:
        if not prof[t]: t += 1; continue
        u = t
        while u < H and prof[u]: u += 1
        if u - t >= 4: bands.append((t, u))
        t = u
    hs = [b - a for a, b in bands if b - a <= 16]
    th = int(np.median(hs)) if hs else 10
    split = []
    rp = ink.sum(1)
    for (a, b) in bands:
        if b - a <= 1.5 * th + 1: split.append((a, b)); continue
        cur = a
        while b - cur > 1.5 * th + 1:                     # cut at the emptiest row near one text height on
            lo, hi = cur + int(0.7 * th), min(b - 3, cur + int(1.6 * th))
            if hi <= lo: break
            cut = lo + int(np.argmin(rp[lo:hi]))
            split.append((cur, cut)); cur = cut + 1
        split.append((cur, b))
    bands = [(a, b) for a, b in split if b - a >= 4]
    out = []
    for (a, b) in bands:
        h = b - a
        if h > 60: continue
        colp = ink[a:b].any(0).astype(np.uint8)
        colp = cv2.dilate(colp.reshape(1, -1), np.ones((1, max(3, int(0.55 * h))), np.uint8)).ravel()
        x = 0
        while x < W:
            if not colp[x]: x += 1; continue
            e = x
            while e < W and colp[e]: e += 1
            x0, x1 = x + int(0.25 * h), e - int(0.25 * h)
            if x1 - x0 >= 3:
                c = con[max(0, a - 2):b + 2, max(0, x0 - 2):x1 + 3].astype(float)
                g = (255 - np.clip(c / max(60.0, np.percentile(c, 98)) * 255, 0, 255)).astype(np.uint8)
                g = cv2.resize(g, None, fx=scale, fy=scale, interpolation=cv2.INTER_LANCZOS4)
                _, g = cv2.threshold(g, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                g = cv2.copyMakeBorder(g, 16, 16, 16, 16, cv2.BORDER_CONSTANT, value=255)
                t_ = pytesseract.image_to_string(g, config="--psm 7 --oem 1").strip()
                if t_ and sum(ch.isdigit() for ch in t_) >= 0.5 * len(t_.replace(" ", "")):
                    t2 = pytesseract.image_to_string(g, config="--psm 7 --oem 1 -c tessedit_char_whitelist=0123456789.,()%-+~¥$/").strip()
                    if t2: t_ = t2
                t_ = re.sub(r"\s+", " ", t_).strip(" |_")
                if t_: out.append({"t": t_, "x0": x0, "y0": a, "x1": x1, "y1": b, "conf": 90.0})
            x = e
    return out



def block_words(img, y0, y1, scale=3):
    """Words of a table area read as one block (tesseract psm 6 on the grey page, upscaled); dark bands read inverted."""
    g = cv2.cvtColor(img[y0:y1], cv2.COLOR_RGB2GRAY)
    out = []
    for inv in (False, True):
        src = 255 - g if inv else g
        b = cv2.resize(src, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
        b = cv2.copyMakeBorder(b, 20, 20, 20, 20, cv2.BORDER_CONSTANT, value=255 if not inv else int(np.median(b)))
        d = pytesseract.image_to_data(b, config="--psm 6 --oem 1 -c preserve_interword_spaces=1", output_type=pytesseract.Output.DICT)
        for i, t in enumerate(d["text"]):
            t = t.strip()
            if not t or float(d["conf"][i]) < 30: continue
            x = (d["left"][i] - 20) / scale; y = (d["top"][i] - 20) / scale + y0; w = d["width"][i] / scale; h = d["height"][i] / scale
            reg = img[int(y):int(y + h) + 1, int(x):int(x + w) + 1]
            if reg.size == 0: continue
            ground = np.median(reg.reshape(-1, 3), axis=0).mean()
            if inv and ground > 150: continue
            if not inv and ground < 130: continue
            out.append({"t": t, "x0": x, "y0": y, "x1": x + w, "y1": y + h, "conf": float(d["conf"][i])})
    res = []
    for w in sorted(out, key=lambda w: -w["conf"]):
        if any(min(w["x1"], r["x1"]) - max(w["x0"], r["x0"]) > 0.4 * (w["x1"] - w["x0"]) and min(w["y1"], r["y1"]) - max(w["y0"], r["y0"]) > 0.4 * (w["y1"] - w["y0"]) for r in res): continue
        res.append(w)
    # words of one phrase (label text) back together: neighbours on a line closer than a space
    res.sort(key=lambda w: (round((w["y0"] + w["y1"]) / 2 / 4), w["x0"]))
    merged = []
    for w in res:
        if merged:
            p = merged[-1]; h = max(p["y1"] - p["y0"], w["y1"] - w["y0"])
            if abs((p["y0"] + p["y1"]) / 2 - (w["y0"] + w["y1"]) / 2) < 0.4 * h and 0 <= w["x0"] - p["x1"] < 0.45 * h \
               and re.search(r"[A-Za-z]", p["t"] + w["t"]):
                p["t"] += " " + w["t"]; p["x1"] = w["x1"]; p["y0"] = min(p["y0"], w["y0"]); p["y1"] = max(p["y1"], w["y1"]); continue
        merged.append(dict(w))
    return merged

def rule_grid(img):
    """Ruled table: x and y of long thin lines (needs 5+ each), else None."""
    H, W = img.shape[:2]
    dark = (img.min(2) < 170).astype(np.uint8)
    hm = cv2.morphologyEx(dark, cv2.MORPH_OPEN, np.ones((1, int(0.3 * W)), np.uint8))
    vm = cv2.morphologyEx(dark, cv2.MORPH_OPEN, np.ones((int(0.3 * H), 1), np.uint8))
    def centres(prof, minv):
        idx = np.where(prof > minv)[0]; out = []
        for i in idx:
            if out and i - out[-1][-1] <= 2: out[-1].append(i)
            else: out.append([i])
        return [float(np.mean(g)) for g in out]
    ys = centres(hm.sum(1), 0.3 * W); xs = centres(vm.sum(0), 0.3 * H)
    if len(ys) < 5 or len(xs) < 5: return None
    return xs, ys

def read_cell(img, x0, y0, x1, y1):
    reg = img[int(y0) + 2:int(y1) - 1, int(x0) + 2:int(x1) - 1].astype(int)
    if reg.size == 0: return ""
    q = (reg // 16).reshape(-1, 3); k = q[:, 0] * 256 + q[:, 1] * 16 + q[:, 2]
    bg = np.median(reg.reshape(-1, 3)[k == np.bincount(k).argmax()], axis=0)
    d = np.abs(reg - bg).sum(2).astype(float)
    if (d > 120).sum() < 6: return ""
    ys_, xs_ = np.where(d > 120)
    d = d[max(0, ys_.min() - 2):ys_.max() + 3, max(0, xs_.min() - 2):xs_.max() + 3]
    g = (255 - np.clip(d / max(60, np.percentile(d, 98)) * 255, 0, 255)).astype(np.uint8)
    g = cv2.resize(g, None, fx=5, fy=5, interpolation=cv2.INTER_LANCZOS4)
    _, g = cv2.threshold(g, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    g = cv2.copyMakeBorder(g, 25, 25, 25, 25, cv2.BORDER_CONSTANT, value=255)
    t = re.sub(r"\s+", " ", pytesseract.image_to_string(g, config="--psm 7 --oem 1")).strip(" |_")
    if not t or sum(c.isdigit() for c in t) >= 0.5 * len(t.replace(" ", "")) or len(t) <= 2:
        t2 = re.sub(r"\s+", " ", pytesseract.image_to_string(g, config="--psm 7 --oem 1 -c tessedit_char_whitelist=0123456789.,()%-+~/")).strip()
        if t2 and (not t or sum(c.isdigit() for c in t2) >= sum(c.isdigit() for c in t)): t = t2
        if not t:
            t = re.sub(r"\s+", "", pytesseract.image_to_string(g, config="--psm 10 --oem 1 -c tessedit_char_whitelist=0123456789")).strip()
    return t

def grid_words(img, given):
    """Words for a ruled table: OCR lines kept where they are, empty grid cells read one by one."""
    rg = rule_grid(img)
    if not rg: return given
    xs, ys = rg; out = list(given)
    for i in range(len(ys) - 1):
        for j in range(len(xs) - 1):
            x0, x1, y0, y1 = xs[j], xs[j + 1], ys[i], ys[i + 1]
            if x1 - x0 < 8 or y1 - y0 < 8: continue
            if any(x0 - 2 <= (w["x0"] + w["x1"]) / 2 <= x1 + 2 and y0 - 2 <= (w["y0"] + w["y1"]) / 2 <= y1 + 2 for w in out): continue
            t = read_cell(img, x0, y0, x1, y1)
            if t: out.append({"t": t, "x0": x0 + 3, "y0": y0 + 2, "x1": x1 - 3, "y1": y1 - 2, "conf": 60.0, "cell": True})
    return out

def rows_of(ws):
    ws = sorted(ws, key=lambda w: (w["y0"] + w["y1"]) / 2)
    hmed = statistics.median([w["y1"] - w["y0"] for w in ws]) if ws else 10
    rows = []
    for w in ws:
        c = (w["y0"] + w["y1"]) / 2
        if rows and abs(c - rows[-1]["c"]) <= 0.45 * hmed: rows[-1]["w"].append(w); rows[-1]["c"] = statistics.mean([(x["y0"] + x["y1"]) / 2 for x in rows[-1]["w"]])
        else: rows.append({"c": c, "w": [w]})
    return rows, hmed

def lines_h(img, minlen):
    nonwhite = (img.min(2) < 200).astype(np.uint8)
    m = cv2.morphologyEx(nonwhite, cv2.MORPH_OPEN, np.ones((1, minlen), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8); out = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if h <= 5 and w >= minlen:
            col = np.median(img[y:y + h, x:x + w].reshape(-1, 3), axis=0)
            out.append((x, y, x + w, y + h, col))
    return out

def hexc(c):
    c = [int(max(0, min(255, round(v)))) for v in c]
    if min(c) >= 238: c = [255, 255, 255]
    return "%02X%02X%02X" % tuple(c)

def build(slide, img, px, title_hint=None, given=None, grid=None):
    H, W = img.shape[:2]
    HDR.clear()
    ws = given if given else words(img)
    if not ws: return None
    rules = lines_h(img, int(0.25 * W))
    # title: words above the first long rule near the top
    top_rule = min([r for r in rules if r[1] < 0.25 * H], key=lambda r: r[1], default=None)
    ty = top_rule[1] if top_rule else min(w["y0"] for w in ws) + 0.08 * H
    title_ws = [w for w in ws if w["y1"] <= ty + 2]
    body = [w for w in ws if w["y0"] > ty + 2]
    src = [w for w in body if re.match(r"^(Source|Note|Notes|Data source)\b", w["t"])]
    ny = min((w["y0"] for w in src), default=H + 1)
    notes = [w for w in body if w["y0"] >= ny - 2]
    body = [w for w in body if w not in notes]
    # one OCR line holding several numbers ("47 49", "15 20") is split into one word per number
    from PIL import ImageFont
    _f = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", 100)
    nb = []
    for w in body:
        toks = w["t"].split()
        if len(toks) > 1 and all(re.fullmatch(r"[\(\-−¥$]?[\d.,]+%?\)?", t) for t in toks):
            tot = _f.getlength(w["t"]); k = (w["x1"] - w["x0"]) / tot if tot else 1; pos = 0
            for t in toks:
                st_ = w["t"].index(t, pos); en_ = st_ + len(t); pos = en_
                nb.append(dict(w, t=t, x0=w["x0"] + _f.getlength(w["t"][:st_]) * k, x1=w["x0"] + _f.getlength(w["t"][:en_]) * k))
        else: nb.append(w)
    body = nb
    rows, hmed = rows_of(body)
    # columns: x coverage over rows (wide spanning text covers few rows, so it does not hide a gap)
    x0 = int(min(w["x0"] for w in body)); x1 = int(max(w["x1"] for w in body)) + 1
    cov = np.zeros(W + 2)
    for r in rows:
        line = np.zeros(W + 2, bool)
        for w in r["w"]: line[int(w["x0"]):int(w["x1"]) + 1] = True
        cov += line
    thr = max(1, 0.12 * len(rows))
    gaps = cov[x0:x1] < thr
    seps = [x0]; t = 0
    while t < len(gaps):
        if gaps[t]:
            u = t
            while u < len(gaps) and gaps[u]: u += 1
            if u - t >= max(4, 0.4 * hmed): seps.append(x0 + (t + u) / 2)
            t = u
        else: t += 1
    seps.append(x1)
    seps = sorted(set(seps))
    if grid: seps = grid[0]
    else:
        # financial models: a header row of years gives the data columns (numbers sit under their year)
        best = None
        for r in rows:
            yrs = [w for w in r["w"] if re.fullmatch(r"(19|20)\d\d[AEF]?|FY\d+|Year ?\d+", w["t"].strip())]
            if len(yrs) >= 4 and (best is None or len(yrs) > len(best)): best = yrs
        if best and not CELLREAD_DONE:
            cen = sorted((w["x0"] + w["x1"]) / 2 for w in best)
            pitch_ = statistics.median([cen[i + 1] - cen[i] for i in range(len(cen) - 1)])
            edges = [cen[0] - pitch_ / 2] + [(cen[i] + cen[i + 1]) / 2 for i in range(len(cen) - 1)] + [cen[-1] + pitch_ / 2]
            hy = max(w["y1"] for w in best)
            # read every data cell from the page: bands of ink below the header, one crop per column
            mb_ = cv2.medianBlur(img, 21); con_ = (np.abs(img.astype(int) - mb_.astype(int)).sum(2) > 90).astype(np.uint8)
            ylim = min([w["y0"] for w in notes] + [H])
            prof = con_[int(hy) + 2:int(ylim) - 2, int(edges[0]):int(edges[-1])].sum(1) > 0
            bands = []; t = 0
            while t < len(prof):
                if not prof[t]: t += 1; continue
                u = t
                while u < len(prof) and prof[u]: u += 1
                if u - t >= 4: bands.append((int(hy) + 2 + t, int(hy) + 2 + u))
                t = u
            cellw = []
            for (ya, yb) in bands:
                for j in range(len(edges) - 1):
                    xa, xb = int(edges[j]) + 1, int(edges[j + 1]) - 1
                    sub = con_[ya:yb, xa:xb]
                    if sub.sum() < 8: continue
                    yy, xx = np.where(sub)
                    tt = read_cell(img, xa + xx.min() - 4, ya - 3, xa + xx.max() + 5, yb + 3)
                    if tt and re.search(r"\d", tt):
                        cellw.append({"t": tt, "x0": xa + xx.min(), "x1": xa + xx.max() + 1, "y0": ya, "y1": yb, "conf": 80, "cellread": True})
            keep_ = [w for w in body if (w["x0"] + w["x1"]) / 2 < edges[0] - 2 or w["y1"] <= hy + 2]
            body = keep_ + cellw
            rows, hmed = rows_of(body)
            cov = np.zeros(W + 2)
            for r in rows:
                line = np.zeros(W + 2, bool)
                for w in r["w"]: line[int(w["x0"]):int(w["x1"]) + 1] = True
                cov += line
            x0 = int(min(w["x0"] for w in body)); x1 = int(max(w["x1"] for w in body)) + 1
            gaps = cov[x0:x1] < max(1, 0.12 * len(rows)); seps = [x0]; t = 0
            while t < len(gaps):
                if gaps[t]:
                    u = t
                    while u < len(gaps) and gaps[u]: u += 1
                    if u - t >= max(4, 0.4 * hmed): seps.append(x0 + (t + u) / 2)
                    t = u
                else: t += 1
            seps.append(x1)
        if best:
            cen = sorted((w["x0"] + w["x1"]) / 2 for w in best)
            pitch_ = statistics.median([cen[i + 1] - cen[i] for i in range(len(cen) - 1)])
            edges = [cen[0] - pitch_ / 2] + [(cen[i] + cen[i + 1]) / 2 for i in range(len(cen) - 1)] + [cen[-1] + pitch_ / 2]
            right = edges[-1]
            extra = [v for v in seps if v > edges[-1] + 4]          # a side table to the right keeps its own columns
            # how far right of the header centre the numbers end: median over number words near each header
            offs = []
            for w in body:
                if re.fullmatch(r"[\(\-−¥$]?[\d.,]+\)?", w["t"].strip()) and w["y0"] > max(b_["y1"] for b_ in best):
                    c_ = min(cen, key=lambda c: abs(w["x1"] - c - 0.3 * pitch_))
                    offs.append(w["x1"] - c_)
            offp = []
            for w in body:
                if re.fullmatch(r"[\(\-−]?[\d.,]+%\)?", w["t"].strip()) and w["y0"] > max(b_["y1"] for b_ in best):
                    c_ = min(cen, key=lambda c: abs(w["x1"] - c - 0.3 * pitch_)); offp.append(w["x1"] - c_)
            offn = [o for o in offs]
            HDR.update(pitch=pitch_, shift=statistics.median(offs) if offs else 0, first=edges[0],
                       shift_pct=statistics.median(offp) if offp else None)
            left = [v for v in seps if v < edges[0] - 4]
            seps = sorted(set(left + edges[:-1] + [right] + extra + ([x1] if x1 > right + 4 else [])))
    # row edges halfway between row centres
    cs = [r["c"] for r in rows]
    ys = [cs[0] - 0.75 * hmed] + [(cs[i] + cs[i + 1]) / 2 for i in range(len(cs) - 1)] + [cs[-1] + 0.75 * hmed]
    if grid:
        ys = grid[1]
        rows = [{"c": (ys[i] + ys[i + 1]) / 2, "w": [w for w in body if ys[i] <= (w["y0"] + w["y1"]) / 2 < ys[i + 1]]} for i in range(len(ys) - 1)]
    xs = seps
    R, C = len(ys) - 1, len(xs) - 1
    if R < 2 or C < 2: return None
    grid_ = [[[] for _ in range(C)] for _ in range(R)]
    for i, r in enumerate(rows):
        for w in r["w"]:
            cx = (w["x0"] + w["x1"]) / 2
            if HDR.get("pitch") and re.fullmatch(r"[\(\-−¥$]?[\d.,]+%?\)?", w["t"].strip()) and cx > HDR["first"]:
                sh_ = HDR["shift"]
                if w["t"].strip().endswith("%") and HDR.get("shift_pct") is not None: sh_ = HDR["shift_pct"]
                cx = w["x1"] - sh_                          # numbers are right-aligned under their year
            j = max(0, min(C - 1, int(np.searchsorted(xs, cx) - 1)))
            grid_[i][j].append(w)
    if not grid:                                    # cells the OCR missed: read them one by one where the page has text
        mb_ = cv2.medianBlur(img, 21); con_ = np.abs(img.astype(int) - mb_.astype(int)).sum(2) > 90
        for i in range(R):
            for j in range(C):
                if grid_[i][j]: continue
                y0_, y1_, x0_, x1_ = int(ys[i]) + 1, int(ys[i + 1]) - 1, int(xs[j]) + 1, int(xs[j + 1]) - 1
                if y1_ - y0_ < 6 or x1_ - x0_ < 6 or con_[y0_:y1_, x0_:x1_].sum() < 12: continue
                t_ = read_cell(img, x0_ - 2, y0_ - 2, x1_ + 2, y1_ + 2)
                t_ = t_.strip(" —-|_'‘’\"") if t_ else t_
                junk = (not t_) or re.fullmatch(r"[oOcCsSeE0 .,:;'\-—~]+", t_) and not re.fullmatch(r"-?0([.,]0+)?%?", t_)
                okt = t_ and not junk and (re.fullmatch(r"[\(\-−¥$]?[\d.,]+%?\)?", t_) or re.fullmatch(r"(FY|Year ?)?\d{1,4}[AE]?", t_) or re.search(r"[A-Za-z]{3,}", t_))
                spans = any(w_["x0"] < x1_ - 2 and w_["x1"] > x0_ + 2 for jj in range(C) for w_ in grid_[i][jj])
                if spans and re.search(r"[A-Za-z]", t_ or ""): okt = False      # part of a heading that spans columns
                fk = FIXFILL.get(f"{i},{j}")
                if fk is not None: t_ = fk; okt = fk != "<drop>"
                if okt:
                    yy, xx = np.where(con_[y0_:y1_, x0_:x1_])
                    grid_[i][j].append({"t": t_, "x0": x0_ + xx.min(), "x1": x0_ + xx.max() + 1, "y0": y0_ + yy.min(), "y1": y0_ + yy.max() + 1, "conf": 50, "filled": True})
                    FILLED.append((i, j, t_, x0_, y0_, x1_, y1_))
    for i in range(R):                              # rows marked "yoy" or "%" hold percentages: put back a cut-off %
        if any(w["t"].strip() in ("yoy", "%") for j in range(C) for w in grid_[i][j]):
            for j in range(C):
                for w in grid_[i][j]:
                    if re.fullmatch(r"-?\d+\.\d", w["t"].strip()): w["t"] = w["t"].strip() + "%"
    for i in range(R):                              # a row that is mostly percentages: the rest are percentages too
        nums = [w for j in range(C) for w in grid_[i][j] if re.fullmatch(r"-?[\d.,]+%?", w["t"].strip())]
        if len(nums) >= 4 and sum(w["t"].strip().endswith("%") for w in nums) >= 0.5 * len(nums):
            for w in nums:
                if re.fullmatch(r"-?\d+\.\d", w["t"].strip()): w["t"] = w["t"].strip() + "%"
            dec = sum(1 for w in nums if re.fullmatch(r"-?\d+\.\d%", w["t"].strip()))
            if dec >= 0.5 * len(nums):
                for w in nums:
                    m_ = re.fullmatch(r"(-?\d+)(\d)%", w["t"].strip())
                    if m_ and "." not in w["t"]: w["t"] = f"{m_.group(1)}.{m_.group(2)}%"
                    m_ = re.fullmatch(r"(-?\d+\.\d)0%", w["t"].strip())
                    if m_: w["t"] = m_.group(1) + "%"
    cells = {}; merges = []
    pt = round(hmed / (px and 1) / 1.69 * 0.92 * 2) / 2 if False else None
    ppt = W / (slide.part.package.presentation_part.presentation.slide_width / 12700)
    pitch = statistics.median([ys[i + 1] - ys[i] for i in range(len(ys) - 1)])
    fsz = max(5.0, min(round(hmed / ppt * 0.95 * 2) / 2, int(pitch / ppt / 1.2 * 2) / 2))
    print("dbg", round(pitch,1), round(hmed,1), round(ppt,3), fsz, file=sys.stderr)
    for i in range(R):
        for j in range(C):
            g = sorted(grid_[i][j], key=lambda w: w["x0"])
            y0, y1 = int(ys[i]), int(ys[i + 1]); cx0, cx1 = int(xs[j]), int(xs[j + 1])
            reg = img[max(0, y0):max(1, y1), max(0, cx0):max(1, cx1)].reshape(-1, 3).astype(int)
            if not len(reg): continue
            q = (reg // 12); k = q[:, 0] * 500 + q[:, 1] * 22 + q[:, 2]; kk = np.bincount(k).argmax()
            fill = np.median(reg[k == kk], axis=0)
            d = {"fill": None if fill.min() >= 238 else hexc(fill), "sz": fsz, "pad": [1, 0, 1, 0]}
            if g:
                txt = " ".join(w["t"] for w in g)
                wx0, wx1 = int(min(w["x0"] for w in g)), int(max(w["x1"] for w in g)) + 1
                ink = img[max(0, y0):y1, wx0:wx1].reshape(-1, 3).astype(int)
                dd = np.abs(ink - fill).sum(1); core = ink[dd >= max(90, np.percentile(dd, 90))] if (dd > 90).sum() > 5 else ink[dd >= np.percentile(dd, 95)]
                col = np.median(core, axis=0) if len(core) else np.array([30, 30, 30])
                if fill.mean() < 160 and col.mean() > fill.mean() + 40: col = np.array([255, 255, 255])   # light text on a dark band is white
                elif col.max() - col.min() < 40 and col.mean() > 70: col = np.array([38, 38, 38])   # anti-aliased grey text is black
                d.update(t=txt, c=hexc(col))
                d["al"] = "r" if re.fullmatch(r"[\(\-−¥$€£]?[\d.,%()¥\-−]+[%)]?", txt) and (xs[j + 1] - wx1) < (wx0 - xs[j]) else ("c" if abs((wx0 + wx1) / 2 - (xs[j] + xs[j + 1]) / 2) < 0.15 * (xs[j + 1] - xs[j]) and j > 0 else "l")
                if re.fullmatch(r"[\(\-−¥$]*[\d]{1,3}(,\d{3})+(\.\d+)?\)?|[\(\-−]?[\d.]+%\)?|\(.*\)", txt.strip()): d["al"] = "r"
                if re.fullmatch(r"(19|20)\d\d[AEF]?|FY\d+|Year ?\d+", txt.strip()): d["al"] = "c"
                d["b"] = bool(fill.mean() < 150) or bool(col[0] > 150 and col[1] < 90)
                # spill into empty neighbours to the right
                if wx1 > xs[j + 1] + 2 and j + 1 < C:
                    k2 = j + 1
                    while k2 < C - 1 and xs[k2 + 1] < wx1 and not grid_[i][k2]: k2 += 1
                    if k2 > j and all(not grid_[i][q_] for q_ in range(j + 1, k2 + 1)): merges.append([i, j, i, k2])
            if grid:
                d.update(bT=["404040", 1], bB=["404040", 1], bL=["404040", 1], bR=["404040", 1])
                if d.get("t"): d["al"] = "c"
            cells[f"{i},{j}"] = d
    if YEN.get(CURKEY[0]):                          # every amount in this table carries a yen sign; negatives in brackets
        for d in cells.values():
            t_ = d.get("t", "").strip()
            if re.fullmatch(r"\(?¥? ?[\d,]{5,}(\.\d+)?\)?", t_):
                core = t_.strip("()¥ ")
                d["t"] = f"(¥{core})" if t_.endswith(")") else f"¥{core}"
    RAWDUMP.clear(); RAWDUMP.update({k_: d.get("t", "") for k_, d in cells.items()})
    # corrections by eye, then the cells still worth a look (odd text, or a different reading in the rebuild OCR)
    for k_, v_ in CELLFIX.items():
        if k_ in cells: cells[k_]["t"] = "" if v_ == "<drop>" else v_
        else:
            i_, j_ = map(int, k_.split(",")); cells[k_] = {"t": v_, "sz": fsz, "pad": [1, 0, 1, 0], "al": "r", "c": "262626", "fill": None}
    clean = re.compile(r"^([\(\-−¥$]?[\d.,]+%?\)?|(19|20)\d\d[AEF]?|FY\d+|Year \d+|[A-Za-z][A-Za-z &/()'.,:\-]*[A-Za-z.)]|[A-Za-z]|%|-)$")
    sus = []
    for k_, d in cells.items():
        t_ = d.get("t", "")
        if not t_: continue
        i_, j_ = map(int, k_.split(","))
        alt = [g_["t"] for g_ in OLDGIVEN if xs[j_] - 2 <= (g_["x0"] + g_["x1"]) / 2 <= xs[j_ + 1] + 2 and ys[i_] - 1 <= (g_["y0"] + g_["y1"]) / 2 <= ys[i_ + 1] + 1]
        n_ = lambda z: re.sub(r"[\s¥]", "", z)
        if k_ in CELLFIX: continue
        if not clean.match(t_) or (alt and n_(" ".join(alt)) != n_(t_) and re.search(r"\d", t_ + " ".join(alt))):
            sus.append([k_, t_, " ".join(alt), xs[j_], ys[i_], xs[j_ + 1], ys[i_ + 1]])
    SUS.extend(sus)
    GRIDDUMP.clear(); GRIDDUMP.update({k_: d.get("t", "") for k_, d in cells.items()})
    # text must fit its cell (or merged span) on one line: else LibreOffice/PowerPoint wrap it and the rows grow
    from PIL import ImageFont
    fr = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", 100)
    fb = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 100)
    span = {}
    for m in merges: span[(m[0], m[1])] = m[3]
    for key_, d in cells.items():
        if not d.get("t"): continue
        i, j = map(int, key_.split(","))
        j2 = span.get((i, j), j)
        avail = xs[j2 + 1] - xs[j] - 3
        f = fb if d.get("b") else fr
        need = f.getlength(d["t"]) / 100 * d["sz"] * ppt
        if need > avail:
            k2 = j2
            while need > avail and k2 + 1 < C and not grid_[i][k2 + 1] and f"{i},{k2 + 1}" in cells and not cells[f"{i},{k2 + 1}"].get("t"):
                k2 += 1; avail = xs[k2 + 1] - xs[j] - 3
            if k2 > j2: merges = [m for m in merges if not (m[0] == i and m[1] == j)] + [[i, j, i, k2]]
            if need > avail: d["sz"] = max(4.5, int(d["sz"] * avail / need * 2) / 2)
    # merged cells must not overlap
    taken = set(); ok = []
    for m in merges:
        sp = {(m[0], c) for c in range(m[1], m[3] + 1)}
        if not (sp & taken): ok.append(m); taken |= sp
    spec = {"name": "table from page", "x": [float(v) for v in xs], "y": [float(v) for v in ys], "cells": cells, "merge": ok,
            "default": {"sz": fsz, "c": "262626"}}
    gf = T.build(slide, spec, px)
    # title and notes as text boxes
    def tbox(ws_, size, bold):
        if not ws_: return
        rs, h = rows_of(ws_)
        bx0 = min(w["x0"] for w in ws_); by0 = min(w["y0"] for w in ws_); bx1 = max(w["x1"] for w in ws_); by1 = max(w["y1"] for w in ws_)
        tb = slide.shapes.add_textbox(Emu(int(bx0 * px)), Emu(int((by0 - 2) * px)), Emu(int((bx1 - bx0 + 20) * px)), Emu(int((by1 - by0 + 6) * px)))
        tf = tb.text_frame; tf.word_wrap = False
        for a in ("margin_left", "margin_right", "margin_top", "margin_bottom"): setattr(tf, a, 0)
        for i, r in enumerate(rs):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            run = p.add_run(); run.text = " ".join(w["t"] for w in sorted(r["w"], key=lambda w: w["x0"]))
            run.font.size = Pt(size); run.font.name = "Arial"; run.font.bold = bold
            reg = img[int(min(w["y0"] for w in r["w"])):int(max(w["y1"] for w in r["w"])) + 1, int(min(w["x0"] for w in r["w"])):int(max(w["x1"] for w in r["w"])) + 1].reshape(-1, 3).astype(int)
            dd = (255 * 3 - reg.sum(1)); core = reg[dd >= np.percentile(dd, 90)]
            run.font.color.rgb = RGBColor.from_string(hexc(np.median(core, axis=0)) if len(core) else "262626")
        tb.name = "text from page"
    if title_ws:
        th = statistics.median([w["y1"] - w["y0"] for w in title_ws]); tbox(title_ws, max(10, round(th / ppt * 1.05 * 2) / 2), False)
    if notes:
        nh = statistics.median([w["y1"] - w["y0"] for w in notes]); tbox(notes, max(5, round(nh / ppt * 1.05 * 2) / 2), False)
    for (rx0, ry0, rx1, ry1, col) in rules:
        if ry0 < ty - 20 or (gf and False): continue
        if not (ry0 <= ty + 3 or ry0 > 0.88 * H): continue                     # rules inside the table are cell fills already
        ln = slide.shapes.add_connector(1, Emu(int(rx0 * px)), Emu(int((ry0 + ry1) / 2 * px)), Emu(int(rx1 * px)), Emu(int((ry0 + ry1) / 2 * px)))
        ln.line.color.rgb = RGBColor.from_string(hexc(col)); ln.line.width = Emu(int(max(1, ry1 - ry0) * px)); ln.name = "rule"
    return {"rows": R, "cols": C, "words": len(ws), "merged": len(ok), "font": fsz}

def main():
    deck_in, deck_out = sys.argv[1], sys.argv[2]
    pairs = [(a.split(":")[0], int(a.split(":")[1])) for a in sys.argv[3:]]
    prs = Presentation(deck_in); rep = {}
    for key, si in pairs:
        pages = sorted(glob.glob(f"/tmp/nr/img/{key}/pg-*.png"))
        img = np.array(Image.open(pages[si - 1]).convert("RGB"))
        px = prs.slide_width / img.shape[1]
        s = prs.slides[si - 1]
        pics = [sh for sh in s.shapes if sh.shape_type == 13 and sh.width > 0.8 * prs.slide_width]
        tag = json.load(open("/tmp/nr/final/final_tags.json"))[key]
        info = json.load(open(f"/tmp/nr/out/{key}.info{tag}.json"))["info"]
        given = [{"t": l["text"], "x0": l["x"], "y0": l["y"], "x1": l["x"] + l["w"], "y1": l["y"] + l["h"], "conf": l.get("conf", 90)}
                 for b in info[si - 1].get("ocr", []) for l in b["lines"]]
        fx = CORR.get(f"{key}:{si}", {})
        for i_, g_ in enumerate(given):
            if str(i_) in fx: g_["t"] = fx[str(i_)]
        given = [g_ for g_ in given if g_["t"] != "<drop>"]
        grid = None
        CURKEY[0] = f"{key}:{si}"; OLDGIVEN.clear(); OLDGIVEN.extend(given); CELLFIX.clear(); CELLFIX.update(CORR.get(f"cell:{key}:{si}", {}))
        if f"{key}:{si}" in BLOCK:                    # dense numeric tables: read the table area as one block
            ys0 = [g_ for g_ in given if re.match(r"^(Appendix|附录)", g_["t"])]
            top = int(max([g_["y1"] for g_ in ys0] + [0])) + 4
            src = [g_ for g_ in given if re.match(r"^(Source|Note)", g_["t"])]
            bot = int(min([g_["y0"] for g_ in src] + [img.shape[0]])) - 2
            given = [g_ for g_ in given if g_["y1"] <= top or g_["y0"] >= bot] + block_words(img, top, bot)
        FIXFILL.clear(); FIXFILL.update(CORR.get(f"fill:{key}:{si}", {}))
        if f"{key}:{si}" in GRID: given = grid_words(img, given); grid = rule_grid(img)
        tf_ = f"/tmp/nr/nat/specs/{key.split('-')[1]}{si}.txt"
        if os.path.exists(tf_):                       # transcribed by eye: these values replace the OCR inside the grid
            grid = rule_grid(img); xs_, ys_ = grid
            given = [g_ for g_ in given if not (ys_[0] - 2 <= (g_["y0"] + g_["y1"]) / 2 <= ys_[-1] + 2) or (g_["y0"] + g_["y1"]) / 2 < ys_[1]]
            given = [g_ for g_ in given if not g_.get("cell")]
            Lr = [l.split("|") for l in open(tf_).read().strip().split("\n")]
            for r_, (typ, comp, vals) in enumerate(Lr):
                i_ = r_ + 1
                cellsv = [typ, comp] + vals.split()
                for j_, t_ in enumerate(cellsv):
                    if not t_: continue
                    given.append({"t": t_, "x0": xs_[j_] + 3, "x1": xs_[j_ + 1] - 3, "y0": ys_[i_] + 2, "y1": ys_[i_ + 1] - 2, "conf": 99})
        r = build(s, img, px, given=given, grid=grid)
        if r:
            for p in pics: p._element.getparent().remove(p._element)
        rep[f"{key}:{si}"] = r
        if r: r["filled"] = len(FILLED); json.dump(FILLED, open(f"/tmp/nr/tbr/filled-{key}-{si}.json", "w")); FILLED.clear()
        if r: json.dump(RAWDUMP, open(f"/tmp/nr/tbr/raw-{key}-{si}.json", "w"))
        if r: json.dump(GRIDDUMP, open(f"/tmp/nr/tbr/grid-{key}-{si}.json", "w"))
        if r: r["suspect"] = len(SUS); json.dump(SUS, open(f"/tmp/nr/tbr/sus-{key}-{si}.json", "w")); SUS.clear()
    prs.save(deck_out); print(json.dumps(rep))

if __name__ == "__main__":
    main()
