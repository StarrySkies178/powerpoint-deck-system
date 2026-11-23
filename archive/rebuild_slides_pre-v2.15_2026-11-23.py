"""rebuild_slides.py: turn PDFs, screenshots and scans into EDITABLE PowerPoint slides.

  python3 Generators/rebuild_slides.py <file.pdf | image | folder-of-images> <out.pptx> [--lang eng+chi_sim]
        [--info info.json] [--pages DIR] [--ocr-cache DIR] [--fixes corrections.json --prev info.json]

  Image pages are then checked line by line (Generators/ocr_review.py) and rebuilt again with the
  corrections (--fixes, same --ocr-cache so the OCR lines are identical): deleted lines (icons read as
  letters) stay graphics, corrected and added numbers are erased from the trace and typed as text.

How each input is rebuilt
  * Vector PDF pages (exported from PowerPoint/Word/etc.): LibreOffice's PDF import gives every
    shape as an editable freeform and every line of text as a text box; text lines that belong
    together are then merged back into paragraphs.
  * Images and scanned PDF pages: rebuilt from pixels.
      1. OCR (Tesseract, English + Chinese) -> editable text boxes, size and colour measured from the image
      2. text removed from the image (flat fill in the local colour; rules and chip edges kept), colours
         reduced to the slide's palette; light panels a few shades off the background kept as their own colour
      3. each colour region traced -> rectangles, rounded rectangles, ellipses, lines, or freeform
         shapes (holes kept), drawn largest-first so the stacking matches
      4. drawings, icons, maps and charts the coarse trace loses are traced again finely (up to 3x zoom);
         only real photos (and what neither trace reproduces) stay as cropped pictures
  * Output: one slide per page/image, same proportions. A review sheet (original vs rebuilt,
    with a similarity score) is written next to the output.
"""
import glob, io, json, math, os, re, shutil, subprocess, sys, tempfile
import numpy as np
import cv2
from PIL import Image
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR
from lxml import etree

IMG_EXT = (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff", ".gif")
EMU_IN = 914400

def soffice(args, timeout=900):
    for exe in ("soffice", "libreoffice", "/Applications/LibreOffice.app/Contents/MacOS/soffice"):
        if shutil.which(exe) or os.path.exists(exe):
            return subprocess.run([exe, "--headless", *args], capture_output=True, timeout=timeout)
    raise SystemExit("LibreOffice not found")

# ----------------------------------------------------------------------------- raster -> shapes
def _hex(c): return RGBColor(int(c[0]), int(c[1]), int(c[2]))

def _ocr(img_rgb, lang):  # noqa: C901
    """Words from two OCR passes (normal + inverted, so white text on dark shapes is read too), de-duplicated."""
    import pytesseract
    from PIL import ImageOps
    H = img_rgb.shape[0]; up = 2.0 if H < 1100 else 1.0
    base = Image.fromarray(img_rgb).convert("L")
    if up != 1: base = base.resize((int(base.width * up), int(base.height * up)), Image.LANCZOS)
    cand = []
    # third pass: dark ink only (labels sitting on grey/patterned shapes, e.g. map regions)
    g0 = np.array(Image.fromarray(img_rgb).convert("L")); k3 = 3.0 if H < 1100 else 1.5
    ink = Image.fromarray(np.where(g0 < 120, 0, 255).astype(np.uint8)).resize((int(g0.shape[1] * k3), int(g0.shape[0] * k3)), Image.NEAREST)
    # fourth pass: light text on colour (white labels on red/navy bars, % in shaded cells) — light pixels much brighter than their surroundings
    gf = g0.astype(np.float32); lm = cv2.blur(gf, (41, 41))
    lt = ((gf > lm + 40) & (lm < 190)).astype(np.uint8)
    light = Image.fromarray(np.where(lt > 0, 0, 255).astype(np.uint8)).resize((int(g0.shape[1] * up), int(g0.shape[0] * up)), Image.LANCZOS)
    for img, sc, psm in ((base, up, 3), (ImageOps.invert(base), up, 3), (ink, k3, 3), (light, up, 11), (base, up, 11)):
        up = sc
        d = pytesseract.image_to_data(img, lang=lang, config=f"--psm {psm}", output_type=pytesseract.Output.DICT)
        for i in range(len(d["text"])):
            t = d["text"][i].strip()
            try: conf = float(d["conf"][i])
            except ValueError: conf = -1
            cjk = any(ord(ch) > 0x2E80 for ch in t)
            short = not cjk and len(t) <= 2 and not t.isdigit()          # 1-2 letter tokens are mostly icons misread as text
            if t and conf >= (40 if cjk else 80 if short else 55) and d["height"][i] >= 6 * up and any(ch.isalnum() or ord(ch) > 0x2E80 for ch in t):
                cand.append(dict(t=t, c=conf, x=int(d["left"][i] / up), y=int(d["top"][i] / up), w=int(d["width"][i] / up), h=int(d["height"][i] / up)))
    def iou(a, b):
        ix = max(0, min(a["x"] + a["w"], b["x"] + b["w"]) - max(a["x"], b["x"])); iy = max(0, min(a["y"] + a["h"], b["y"] + b["h"]) - max(a["y"], b["y"]))
        inter = ix * iy; return inter / max(1, min(a["w"] * a["h"], b["w"] * b["h"]))
    words = []
    for w in sorted(cand, key=lambda w: -w["c"]):
        if all(iou(w, v) < 0.4 for v in words): words.append(w)
    # group words into rows by vertical overlap, then split rows at column gaps
    words.sort(key=lambda w: w["y"] + w["h"] / 2)
    rows = []
    for w in words:
        wc = w["y"] + w["h"] / 2
        for R in rows:
            if abs(R["c"] - wc) < 0.5 * max(R["h"], w["h"]): R["w"].append(w); R["c"] = sum(x["y"] + x["h"] / 2 for x in R["w"]) / len(R["w"]); R["h"] = float(np.median([x["h"] for x in R["w"]])); break
        else: rows.append(dict(c=wc, h=w["h"], w=[w]))
    lines = []
    for R in rows:
        ws = sorted(R["w"], key=lambda w: w["x"]); cur = [ws[0]]
        for w in ws[1:]:
            prev = cur[-1]
            if w["x"] - (prev["x"] + prev["w"]) < 1.1 * R["h"]: cur.append(w)
            else: lines.append(cur); cur = [w]
        lines.append(cur)
    def mk(ws):
        for w in ws:  # a CJK glyph is about square: trust width over a stretched box
            n = sum(1 for ch in w["t"] if ord(ch) > 0x2E80)
            if n and n == len(w["t"]): w["h"] = min(w["h"], int(1.15 * w["w"] / n))
        mh = float(np.median([w["h"] for w in ws])); ws = [w for w in ws if w["h"] <= 1.8 * mh] or ws
        mh = max(w["h"] for w in ws)
        y0 = int(np.median([w["y"] for w in ws]))
        return dict(x=min(w["x"] for w in ws), y=y0, w=max(w["x"] + w["w"] for w in ws) - min(w["x"] for w in ws), h=int(mh), words=ws)
    lines = [mk(ws) for ws in lines]
    for L in lines:
        L["words"].sort(key=lambda w: w["x"])
        cjk = lambda s: any(ord(c) > 0x2E80 for c in s)
        L["text"] = "".join((("" if (cjk(a["t"]) and cjk(b["t"])) else " ") + b["t"]) if a else b["t"]
                            for a, b in zip([None] + L["words"][:-1], L["words"]))
    lines.sort(key=lambda L: (L["y"], L["x"]))
    blocks = []
    for L in lines:
        for B in blocks:
            last = B["lines"][-1]
            if abs(L["x"] - B["x"]) < 0.8 * L["h"] and 0 <= L["y"] - (last["y"] + last["h"]) < 0.9 * L["h"] and abs(L["h"] - last["h"]) < 0.35 * last["h"]:
                B["lines"].append(L); B["w"] = max(B["x"] + B["w"], L["x"] + L["w"]) - B["x"]; B["h"] = L["y"] + L["h"] - B["y"]; break
        else:
            blocks.append(dict(x=L["x"], y=L["y"], w=L["w"], h=L["h"], lines=[L]))
    return blocks

OCR_CACHE = os.environ.get("RB_OCR_CACHE")          # folder: OCR results per page image, so a re-run (with corrections) sees the same lines

def _ocr_cached(img, lang):
    if not OCR_CACHE: return _ocr(img, lang)
    import hashlib
    os.makedirs(OCR_CACHE, exist_ok=True)
    f = os.path.join(OCR_CACHE, hashlib.md5(img.tobytes() + lang.encode() + str(img.shape).encode()).hexdigest() + ".json")
    if os.path.exists(f): return json.load(open(f))
    b = _ocr(img, lang); json.dump(b, open(f, "w")); return b

def _fill_text(img, mask, rects=None):
    """Erase text inside each masked patch with flat colour (flat artwork: no smear, no halo).
    The fill colour is the patch's own most common colour. Text on the page background: every stroke is filled.
    Text on a chip, badge or bar that the patch overhangs: only strokes inside the chip are filled, so the chip keeps its edge."""
    def mode(px):
        q = (px // 8).astype(np.int32); key = q[:, 0] * 1024 + q[:, 1] * 32 + q[:, 2]
        top = np.bincount(key).argmax(); return np.median(px[key == top], axis=0)
    out = img.copy()
    if rects is None:                                  # no line boxes given: one patch per connected piece of the mask
        n, lab, st, _ = cv2.connectedComponentsWithStats((mask > 0).astype(np.uint8), 8)
        patches = [(st[i][0], st[i][1], st[i][2], st[i][3], i) for i in range(1, n)]
    else:                                              # one patch per text line, so neighbouring lines don't merge into one
        lab = None; patches = []
        for (x0_, y0_, x1_, y1_) in rects:
            x0_, y0_ = max(0, int(x0_)), max(0, int(y0_)); x1_, y1_ = min(img.shape[1], int(x1_)), min(img.shape[0], int(y1_))
            if x1_ > x0_ and y1_ > y0_: patches.append((x0_, y0_, x1_ - x0_, y1_ - y0_, None))
    for x, y, w, h, i in patches:
        X0, Y0, X1, Y1 = max(0, x - 6), max(0, y - 6), min(img.shape[1], x + w + 6), min(img.shape[0], y + h + 6)
        if lab is not None: comp = (lab[Y0:Y1, X0:X1] == i).astype(np.uint8)
        else: comp = np.zeros((Y1 - Y0, X1 - X0), np.uint8); comp[y - Y0:y - Y0 + h, x - X0:x - X0 + w] = 1
        sub = out[Y0:Y1, X0:X1]
        ring = (cv2.dilate(comp, np.ones((7, 7), np.uint8)) > 0) & (comp == 0) & (mask[Y0:Y1, X0:X1] == 0)
        inner = sub[comp > 0]
        if not len(inner): continue
        # the colour the text sits on: just left and right of the words, at mid-height of the line (the patch is padded by a few px)
        r0, r1, c0 = y - Y0 + h // 4, y - Y0 + h - h // 4, x - X0
        le, re_ = sub[r0:r1, c0:c0 + 4].reshape(-1, 3), sub[r0:r1, c0 + w - 4:c0 + w].reshape(-1, 3)
        rm_ = mode(sub[ring]) if ring.any() else mode(inner)
        if len(le) and len(re_):
            ml, mr = mode(le), mode(re_)
            # both ends agree: that is the backing; they differ (an icon or badge at one end): the end that matches the surroundings
            im_ = mode(np.concatenate([le, re_])) if np.linalg.norm(ml - mr) <= 40 else min((ml, mr), key=lambda c_: np.linalg.norm(c_ - rm_))
        else:
            im_ = mode(inner)
        far = ((np.linalg.norm(sub.astype(np.float32) - im_, axis=2) > 40) & (comp > 0)).astype(np.uint8)
        if np.linalg.norm(im_ - rm_) > 40:
            # text on its own chip or bar: the chip is the chip-coloured area with the letter gaps bridged sideways;
            # everything outside it (the page around a band that is no taller than the text) is kept
            chip = (np.linalg.norm(sub.astype(np.float32) - im_, axis=2) <= 40).astype(np.uint8) & comp
            cs, _ = cv2.findContours(chip, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            hull = np.zeros_like(chip)
            if cs:
                big = max(cs, key=cv2.contourArea)
                pts = np.vstack([c_ for c_ in cs if cv2.contourArea(c_) >= 0.05 * cv2.contourArea(big)] or [big])
                cv2.fillPoly(hull, [cv2.convexHull(pts)], 1)
            keep = (1 - hull) & far
        else:
            # text on the background: straight rules crossing the patch (table and grid lines) are kept
            # (a rule is a long straight run that runs out of the patch; runs inside the patch are letters joined by blur)
            L = int(max(15, 1.5 * h)); keep = np.zeros_like(far)
            ys_, xs_ = np.nonzero(comp); cy0, cy1, cx0, cx1 = ys_.min(), ys_.max(), xs_.min(), xs_.max()
            for horiz, ker in ((True, np.ones((1, L), np.uint8)), (False, np.ones((L, 1), np.uint8))):
                op = cv2.morphologyEx(far, cv2.MORPH_OPEN, ker); k, fl, fst, _ = cv2.connectedComponentsWithStats(op, 8)
                for j in range(1, k):               # a rule crosses the whole patch, from one side to the other
                    jx, jy, jw, jh = fst[j][:4]
                    if (horiz and jx <= cx0 + 1 and jx + jw >= cx1) or (not horiz and jy <= cy0 + 1 and jy + jh >= cy1): keep[fl == j] = 1
        keep = cv2.dilate(keep, np.ones((3, 3), np.uint8))
        text = far & (1 - keep)
        # strokes plus their anti-aliased edge (else the edge stays behind as a ghost outline that gets traced)
        fill = (cv2.dilate(text, np.ones((5, 5), np.uint8)) > 0) & (comp > 0) & (keep == 0)
        o = out[Y0:Y1, X0:X1]; o[fill] = im_.astype(img.dtype)
    return out

def _apply_fixes(blocks, fix, scale):
    """Reviewed OCR corrections: fix = {"edit": [[x, y, w, h, text], ...], "add": [[x, y, w, h, text], ...]} in original
    image pixels. "" deletes a line (its pixels are then traced as graphics, e.g. an icon OCR misread). Corrected and added
    lines are marked so the noise filter keeps them."""
    if not fix: return blocks
    def ov(L, e):
        x, y, w, h = [v * scale for v in e[:4]]
        ix = max(0, min(L["x"] + L["w"], x + w) - max(L["x"], x)); iy = max(0, min(L["y"] + L["h"], y + h) - max(L["y"], y))
        return ix * iy / max(1.0, max(L["w"] * L["h"], w * h))
    edits = list(fix.get("edit", []))
    for B in blocks:
        keep = []
        for L in B["lines"]:
            e = max(edits, key=lambda e: ov(L, e), default=None)
            if e is not None and ov(L, e) > 0.7:
                edits.remove(e); B["fixed"] = True
                if not e[4].strip(): continue
                t = e[4].strip(); ws = t.split()
                olds = [w_["t"] for w_ in L["words"]]; it_ = iter(range(len(olds))); sub_ = []
                for nt in ws:                                       # new text = old words with some dropped (icons read as letters)?
                    j = next((j for j in it_ if olds[j].lower() == nt.lower()), None)
                    if j is None: sub_ = None; break
                    sub_.append(j)
                if len(ws) == len(L["words"]):
                    for w_, nt in zip(L["words"], ws): w_["t"] = nt
                elif sub_:                                          # keep only those words, so the dropped ones stay graphics
                    L["words"] = [L["words"][j] for j in sub_]
                    for w_, nt in zip(L["words"], ws): w_["t"] = nt
                    L["x"] = min(w_["x"] for w_ in L["words"]); L["w"] = max(w_["x"] + w_["w"] for w_ in L["words"]) - L["x"]
                else:
                    L["words"] = [dict(t=t, c=99.0, x=L["x"], y=L["y"], w=L["w"], h=L["h"])]
                L["text"] = t
            keep.append(L)
        B["lines"] = keep
    blocks = [B for B in blocks if B["lines"]]
    for B in blocks:
        B["x"] = min(L["x"] for L in B["lines"]); B["y"] = min(L["y"] for L in B["lines"])
        B["w"] = max(L["x"] + L["w"] for L in B["lines"]) - B["x"]; B["h"] = max(L["y"] + L["h"] for L in B["lines"]) - B["y"]
    for a in fix.get("add", []):
        x, y, w, h = [int(round(v * scale)) for v in a[:4]]
        L = dict(x=x, y=y, w=max(1, w), h=max(1, h), text=a[4], words=[dict(t=a[4], c=99.0, x=x, y=y, w=max(1, w), h=max(1, h))])
        blocks.append(dict(x=L["x"], y=L["y"], w=L["w"], h=L["h"], lines=[L], fixed=True))
    return blocks

def _reread_number(gray, w_):
    """Second read of a token that contains digits: tight crop, 4x zoom, clean black-on-white, single-line OCR with a digit set."""
    import pytesseract
    pad = max(2, int(0.3 * w_["h"])); y0, y1 = max(0, w_["y"] - pad), min(gray.shape[0], w_["y"] + w_["h"] + pad)
    x0, x1 = max(0, w_["x"] - pad), min(gray.shape[1], w_["x"] + w_["w"] + pad)
    c = gray[y0:y1, x0:x1]
    if c.size == 0 or c.shape[0] < 4: return None
    k = max(1.0, 64.0 / c.shape[0]); c = cv2.resize(c, (int(c.shape[1] * k), int(c.shape[0] * k)), interpolation=cv2.INTER_CUBIC)
    _, b = cv2.threshold(c, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    if (b[[0, -1], :].mean() + b[:, [0, -1]].mean()) / 2 < 128: b = 255 - b                 # dark background: invert
    b = cv2.copyMakeBorder(b, 12, 12, 12, 12, cv2.BORDER_CONSTANT, value=255)
    best = None
    for psm in (7, 8):
        d = pytesseract.image_to_data(Image.fromarray(b), lang="eng", output_type=pytesseract.Output.DICT,
                                      config=f"--psm {psm} -c tessedit_char_whitelist=0123456789.,%+-~$/:xX<>=#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
        toks = [(d["text"][i].strip(), float(d["conf"][i])) for i in range(len(d["text"])) if d["text"][i].strip() and float(d["conf"][i]) >= 0]
        if not toks: continue
        t = "".join(x for x, _ in toks) if len(toks) > 1 and psm == 8 else " ".join(x for x, _ in toks)
        cf = min(c_ for _, c_ in toks)
        if " " in t: continue                                                                # one token in, one token out
        if best is None or cf > best["c"]: best = dict(t=t, c=cf)
    return best

def _text_colour(img, b):
    x, y, w, h = b["x"], b["y"], b["w"], b["h"]
    patch = img[max(0, y):y + h, max(0, x):x + w].reshape(-1, 3).astype(int)
    if len(patch) == 0: return (40, 40, 40), (255, 255, 255)
    border = np.concatenate([img[max(0, y - 2), x:x + w], img[min(img.shape[0] - 1, y + h + 1), x:x + w]]).astype(int)
    bg = np.median(border, axis=0) if len(border) else np.array([255, 255, 255])
    d = np.linalg.norm(patch - bg, axis=1)
    fg = patch[d >= max(np.percentile(d, 85), 0.5 * d.max(), 1)]
    return tuple(np.median(fg, axis=0).astype(int)) if len(fg) else (40, 40, 40), tuple(bg.astype(int))

_FONTS = {}
def _font_match(img, L, col, bgc):
    """Which of sans/serif × regular/bold best matches a text line: render the OCR text in each and compare with the page pixels."""
    from PIL import ImageFont, ImageDraw
    t = L["text"]
    if len(t) < 4 or any(ord(ch) > 0x2E80 for ch in t): return None
    x, y, w, h = L["x"], L["y"], L["w"], L["h"]
    p = img[max(0, y - 1):y + h + 1, max(0, x - 1):x + w + 1].astype(int)
    if p.size == 0 or h < 7: return None
    m = (np.linalg.norm(p - np.array(col), axis=2) < np.linalg.norm(p - np.array(bgc), axis=2)).astype(np.float32)
    if m.mean() < 0.03: return None
    best = None
    for fam in ("sans", "serif"):
        for bold in (False, True):
            key = (fam, bold)
            if key not in _FONTS:
                f = "/usr/share/fonts/truetype/liberation/Liberation%s-%s.ttf" % ("Sans" if fam == "sans" else "Serif", "Bold" if bold else "Regular")
                _FONTS[key] = ImageFont.truetype(f, 64)
            fnt = _FONTS[key]; bb = fnt.getbbox(t)
            if bb[2] - bb[0] < 2 or bb[3] - bb[1] < 2: return None
            im = Image.new("L", (bb[2] - bb[0] + 4, bb[3] - bb[1] + 4), 0)
            ImageDraw.Draw(im).text((2 - bb[0], 2 - bb[1]), t, font=fnt, fill=255)
            r = np.array(im.resize((m.shape[1], m.shape[0]), Image.LANCZOS)).astype(np.float32) / 255
            a, b = m - m.mean(), r - r.mean()
            sc = float((a * b).sum() / (np.sqrt((a * a).sum() * (b * b).sum()) + 1e-6))
            # stroke weight: ink share of the box vs the rendering
            sc -= 0.6 * abs(m.mean() - r.mean())
            if best is None or sc > best[2]: best = (fam, bold, sc)
    return best

def _trace_detail(crop, tmask_crop=None, max_shapes=700, strict=False, rects=None):
    """Fine trace of one region (drawing, map, icon, chart) at up to 3x zoom. Returns (shapes, quality) where shapes are
    (area, rgb, contour, holes) in crop pixel coordinates (float). Photos fail the quality test and stay pictures."""
    H, W = crop.shape[:2]
    if H < 8 or W < 8: return [], None
    # photos stay pictures: flat artwork has few colours and smooth runs; photos and textures don't
    g = cv2.cvtColor(cv2.resize(crop, (min(300, W), max(1, int(H * min(300, W) / W)))), cv2.COLOR_RGB2GRAY).astype(np.float32)
    smooth = float((np.abs(np.diff(g, axis=1)) < 6).mean())
    q = (cv2.resize(crop, (min(400, W), max(1, int(H * min(400, W) / W)))) // 24).reshape(-1, 3)
    _, cnt_ = np.unique(q, axis=0, return_counts=True); cover = float(np.sort(cnt_)[::-1][:16].sum() / cnt_.sum())
    if smooth < (0.75 if strict else 0.62) or cover < (0.9 if strict else 0.82): return [], dict(err=99, recall=0, n=0, photo=True, smooth=smooth, cover=cover)
    work = crop.copy()
    if tmask_crop is not None and tmask_crop.any():
        work = _fill_text(np.ascontiguousarray(work), cv2.dilate(tmask_crop, np.ones((3, 3), np.uint8)),
                          [(a - 1, b - 1, c + 1, d + 1) for a, b, c, d in rects] if rects else None)
    up = float(min(3.0, max(1.0, 700 / max(H, W))))
    big = cv2.resize(work, (int(W * up), int(H * up)), interpolation=cv2.INTER_CUBIC) if up > 1 else work
    big = cv2.bilateralFilter(big, 7, 30, 7)
    cents = _palette(big, np.ones(big.shape[:2], bool), k_max=10)
    dist = np.stack([np.linalg.norm(big.astype(np.float32) - c.astype(np.float32), axis=2) for c in cents])
    lab = np.argmin(dist, axis=0)
    lab = cv2.medianBlur(lab.astype(np.uint8), 3)
    bgl = np.bincount(lab.ravel(), minlength=len(cents)).argmax()
    bh, bw = lab.shape; amin = max(8.0, 0.000012 * bh * bw)   # small enough to keep thin digits and icon details
    shapes = []
    for ci, c in enumerate(cents):
        if ci == bgl: continue
        m = (lab == ci).astype(np.uint8) * 255
        cnts, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        if hier is None: continue
        for i, cnt in enumerate(cnts):
            if hier[0][i][3] != -1: continue
            a = cv2.contourArea(cnt)
            if a < amin: continue
            holes = [cnts[j] for j in range(len(cnts)) if hier[0][j][3] == i and cv2.contourArea(cnts[j]) > amin / 2]
            shapes.append((a, c, cnt, holes))
    if not shapes or len(shapes) > max_shapes: return [], None
    shapes.sort(key=lambda t: -t[0])
    recon = np.empty_like(big); recon[:] = cents[bgl].astype(big.dtype)
    for a, c, cnt, holes in shapes:
        cv2.drawContours(recon, [cnt], -1, tuple(int(v) for v in c), -1)
        for hc in holes: cv2.drawContours(recon, [hc], -1, tuple(int(v) for v in cents[bgl]), -1)
    raw = cv2.resize(work, (big.shape[1], big.shape[0]), interpolation=cv2.INTER_CUBIC) if up > 1 else work
    err = float(np.abs(recon.astype(np.float32) - raw.astype(np.float32)).mean())     # against the unsmoothed pixels
    eo = cv2.Canny(cv2.cvtColor(big, cv2.COLOR_RGB2GRAY), 50, 140) > 0
    er = cv2.dilate(cv2.Canny(cv2.cvtColor(recon, cv2.COLOR_RGB2GRAY), 50, 140), np.ones((5, 5), np.uint8)) > 0
    recall = float((eo & er).sum() / max(1, eo.sum()))
    out = []
    for a, c, cnt, holes in shapes:
        eps = lambda q: min(1.5, max(0.6, 0.003 * cv2.arcLength(q, True)))   # capped: a long grid outline must not collapse into triangles
        f = lambda q: cv2.approxPolyDP(q, eps(q), True).astype(np.float32) / up
        out.append((a / up / up, c, f(cnt), [f(hc) for hc in holes]))
    return out, dict(err=err, recall=recall, n=len(out), bg=cents[bgl])

def _palette(img, mask, k_max=14):
    from sklearn.cluster import MiniBatchKMeans
    px = img[mask].reshape(-1, 3).astype(np.float32)
    if len(px) > 60000: px = px[np.random.default_rng(0).choice(len(px), 60000, replace=False)]
    k = min(k_max, max(2, len(np.unique((px // 8).astype(int), axis=0)) // 3))
    km = MiniBatchKMeans(n_clusters=k, random_state=0, n_init=3).fit(px)
    cents = km.cluster_centers_; counts = np.bincount(km.labels_, minlength=k)
    keep = []  # merge near-identical colours (perceptual distance)
    lab = cv2.cvtColor(cents.reshape(1, -1, 3).astype(np.uint8), cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(float)
    for i in np.argsort(-counts):
        if all(np.linalg.norm(lab[i] - lab[j]) > 14 for j in keep): keep.append(i)
    return cents[keep]

def rebuild_raster(slide, img_rgb, slide_w, slide_h, lang="eng+chi_sim", left=0, top=0, fix=None):
    """Draw editable shapes + text reconstructed from an image onto a python-pptx slide."""
    H, W = img_rgb.shape[:2]
    scale = 1600 / max(W, H) if max(W, H) > 1600 else 1.0
    img = cv2.resize(img_rgb, (int(W * scale), int(H * scale)), interpolation=cv2.INTER_AREA) if scale != 1 else img_rgb.copy()
    h, w = img.shape[:2]; sx, sy = slide_w / w, slide_h / h
    blocks = _apply_fixes(_ocr_cached(img, lang), fix, scale)
    # 0. isolated big single characters are pins, arrows and icons read as letters: drop them before erasing text
    _allh = [L["h"] for B in blocks for L in B["lines"]]; _medh = float(np.median(_allh)) if _allh else 0
    def _core(B): return [ch for ch in " ".join(L["text"] for L in B["lines"]) if ch.isalnum() or ord(ch) > 0x2E80]
    blocks = [B for B in blocks if B.get("fixed") or not (len(_core(B)) <= 1 and B["h"] > 1.6 * _medh)]
    def _region_drop(B):                                              # text the detail-region noise rule will drop (must stay graphics)
        if B.get("fixed"): return False
        conf = np.mean([w_["c"] for L in B["lines"] for w_ in L["words"]]); core = _core(B)
        return (len(core) <= 2 and conf < 85 and not any(ch.isdigit() for ch in core)) or (B["h"] > 2.2 * _medh and conf < 80)
    def _region_tmask(px, py, pw, ph, shape):
        m = np.zeros((h, w), np.uint8); rr = []; kx, ky = shape[1] / max(1, pw), shape[0] / max(1, ph)
        for B in blocks:
            inside_ = B["x"] >= px and B["y"] >= py and B["x"] + B["w"] <= px + pw and B["y"] + B["h"] <= py + ph
            if inside_ and _region_drop(B): continue
            for L in B["lines"]:
                r_ = (L["x"] - 3, L["y"] - max(3, L["h"] // 4), L["x"] + L["w"] + 3, L["y"] + L["h"] + max(3, L["h"] // 4))
                cv2.rectangle(m, r_[:2], r_[2:], 255, -1)
                if r_[2] > px and r_[0] < px + pw and r_[3] > py and r_[1] < py + ph:
                    rr.append(((r_[0] - px) * kx, (r_[1] - py) * ky, (r_[2] - px) * kx, (r_[3] - py) * ky))
        return cv2.resize(m[py:py + ph, px:px + pw], (shape[1], shape[0]), interpolation=cv2.INTER_NEAREST), rr
    # 1. remove text so it doesn't become shapes
    tmask = np.zeros((h, w), np.uint8)
    for B in blocks:
        for L in B["lines"]: cv2.rectangle(tmask, (L["x"] - 3, L["y"] - max(3, L["h"] // 4)), (L["x"] + L["w"] + 3, L["y"] + L["h"] + max(3, L["h"] // 4)), 255, -1)
    trects = [(L["x"] - 3, L["y"] - max(3, L["h"] // 4), L["x"] + L["w"] + 3, L["y"] + L["h"] + max(3, L["h"] // 4)) for B in blocks for L in B["lines"]]
    clean = _fill_text(img, tmask, trects) if blocks else img
    clean = cv2.bilateralFilter(clean, 5, 18, 5)
    # 2. palette + quantize
    cents = _palette(clean, np.ones((h, w), bool))
    dist = np.stack([np.linalg.norm(clean.astype(float) - c, axis=2) for c in cents])
    lab_idx = np.argmin(dist, axis=0); err = np.min(dist, axis=0)
    # background = the most common colour on the page (the outer pixel rows are often a scan frame or shadow line)
    bg = np.bincount(lab_idx.ravel(), minlength=len(cents)).argmax()
    # light panels (cards, bands) a few shades off the background fall into the background colour: split them out
    bpx = clean[lab_idx == bg].reshape(-1, 3).astype(np.float32)
    if len(bpx) > 2000:
        from sklearn.cluster import KMeans
        sub_ = bpx[np.random.default_rng(0).choice(len(bpx), min(20000, len(bpx)), replace=False)]
        c2 = KMeans(2, n_init=3, random_state=0).fit(sub_).cluster_centers_
        if np.linalg.norm(c2[0] - c2[1]) > 7:
            d0 = np.linalg.norm(clean.astype(np.float32) - c2[0], axis=2); d1 = np.linalg.norm(clean.astype(np.float32) - c2[1], axis=2)
            m1 = (lab_idx == bg) & (d1 < d0); m0 = (lab_idx == bg) & ~m1
            major, minor, mm = (c2[0], c2[1], m1) if m0.sum() >= m1.sum() else (c2[1], c2[0], m0)
            mm = cv2.morphologyEx(mm.astype(np.uint8), cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
            mm = cv2.morphologyEx(mm, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)) & (lab_idx == bg)
            nn, ll, ss, _ = cv2.connectedComponentsWithStats(mm.astype(np.uint8), 8); panel = np.zeros_like(mm, bool)
            for j in range(1, nn):
                if ss[j][4] > 0.003 * w * h and ss[j][4] > 0.6 * ss[j][2] * ss[j][3]: panel |= ll == j
            if panel.any():
                cents = np.vstack([cents, minor[None, :]]); cents[bg] = major; lab_idx = lab_idx.copy(); lab_idx[panel] = len(cents) - 1
    # 3. picture regions: where flat colours don't describe the image (photos, gradients, detailed icons)
    errm = cv2.GaussianBlur(err.astype(np.float32), (0, 0), 6)
    pic = (errm > 22).astype(np.uint8)
    pic = cv2.morphologyEx(pic, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    pics = []; kinds = {}                                           # why a region is a picture: colour detail / photo / line work
    n, cc, st, _ = cv2.connectedComponentsWithStats(pic)
    bigcol = []                                                     # most of a slide off the palette (a soft scan): try a fine trace, else plain shapes, never one big picture
    for i in range(1, n):
        x, y, ww, hh, a = st[i]
        if ww * hh > 0.5 * w * h: bigcol.append((x, y, ww, hh)); continue
        if a > 0.002 * w * h and ww > 20 and hh > 20: pics.append((x, y, ww, hh)); kinds[(x, y, ww, hh)] = "colour"
    picmask = np.zeros((h, w), np.uint8)
    for x, y, ww, hh in pics: picmask[y:y + hh, x:x + ww] = 1
    # background
    bgc = cents[bg]
    slide.background.fill.solid(); slide.background.fill.fore_color.rgb = _hex(bgc)
    # 4. trace each colour region
    shapes = []
    min_area = 0.00005 * w * h
    for ci, c in enumerate(cents):
        if ci == bg: continue
        m = ((lab_idx == ci) & (picmask == 0)).astype(np.uint8) * 255
        
        cnts, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        if hier is None: continue
        for i, cnt in enumerate(cnts):
            if hier[0][i][3] != -1: continue                      # holes handled with their parent
            a = cv2.contourArea(cnt)
            if a < min_area:
                pe = cv2.arcLength(cnt, True)
                if not (a >= 0.000016 * w * h and pe > 0 and 4 * math.pi * a / pe ** 2 > 0.6): continue   # keep bullets / dots / small marks
            holes = [cnts[j] for j in range(len(cnts)) if hier[0][j][3] == i and cv2.contourArea(cnts[j]) > max(6.0, min_area / 8)]   # small holes = icons in boxes
            shapes.append((a, c, cnt, holes))
    shapes.sort(key=lambda s: -s[0])                              # big first = behind
    # 4b. check the trace: redraw it and compare with the text-free page; where flat shapes lose the picture
    #     (photos, isometric drawings, detailed icons, textured maps) keep the original pixels as a picture instead
    recon = np.empty_like(clean); recon[:] = np.array(bgc, dtype=clean.dtype)
    for a, c, cnt, holes in shapes:
        cv2.drawContours(recon, [cnt], -1, tuple(int(v) for v in c), -1)
        for hc in holes: cv2.drawContours(recon, [hc], -1, tuple(int(v) for v in bgc), -1)
    diff = np.abs(recon.astype(np.float32) - clean.astype(np.float32)).mean(axis=2)
    diff[picmask > 0] = 0
    dm = cv2.GaussianBlur(diff, (0, 0), 7)
    # line art (isometric drawings, outline icons, map borders): edges present on the page but missing from the trace
    eo = cv2.Canny(cv2.cvtColor(clean, cv2.COLOR_RGB2GRAY), 40, 120) > 0
    er = cv2.dilate(cv2.Canny(cv2.cvtColor(recon, cv2.COLOR_RGB2GRAY), 40, 120), np.ones((5, 5), np.uint8)) > 0
    miss = (eo & ~er).astype(np.uint8); miss[picmask > 0] = 0; miss[tmask > 0] = 0
    # straight horizontal/vertical runs are box outlines and rules, not drawings: they don't make a region a picture
    hv = cv2.morphologyEx(miss, cv2.MORPH_OPEN, np.ones((1, 25), np.uint8)) | cv2.morphologyEx(miss, cv2.MORPH_OPEN, np.ones((25, 1), np.uint8))
    miss = (miss & ~cv2.dilate(hv, np.ones((3, 3), np.uint8))).astype(np.float32)
    md = cv2.GaussianBlur(miss, (0, 0), 9)
    photo = cv2.morphologyEx((dm > 16).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
    bad = cv2.morphologyEx(((dm > 16) | (md > 0.03)).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    if os.environ.get("RB_DEBUG"):
        cv2.imwrite(os.environ["RB_DEBUG"] + "-recon.png", cv2.cvtColor(recon, cv2.COLOR_RGB2BGR)); cv2.imwrite(os.environ["RB_DEBUG"] + "-bad.png", bad * 255)
        cv2.imwrite(os.environ["RB_DEBUG"] + "-clean.png", cv2.cvtColor(clean, cv2.COLOR_RGB2BGR))
    n2, _, st2, _ = cv2.connectedComponentsWithStats(bad)
    boxes = [list(st2[i][:4]) for i in range(1, n2) if st2[i][4] > 0.0015 * w * h and st2[i][2] > 25 and st2[i][3] > 25]
    # no merging of boxes: each lost region stands alone; thin or very elongated ones are rules, dashes and borders
    boxes = [b_ for b_ in boxes if min(b_[2], b_[3]) >= 30 and max(b_[2], b_[3]) / max(1, min(b_[2], b_[3])) <= 6]
    nonbg = cv2.morphologyEx((lab_idx != bg).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    nonbg = cv2.morphologyEx(nonbg, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))   # cut thin frame lines that join blocks
    nb, _, stb, _ = cv2.connectedComponentsWithStats(nonbg)
    for x, y, ww, hh in boxes:
        is_photo = photo[y:y + hh, x:x + ww].mean() > 0.15
        if is_photo and ww * hh > 0.35 * w * h:                       # a box over most of the slide is a photo only if its pixels say so
            _s, _q = _trace_detail(img[y:y + hh, x:x + ww], None, max_shapes=0)
            is_photo = bool(_q and _q.get("photo"))
        if ww * hh > 0.35 * w * h and not is_photo: continue          # line work never turns most of a slide into one picture
        if tmask[y:y + hh, x:x + ww].mean() / 255 > 0.35: continue    # mostly text: keep it as text and shapes
        if is_photo:                                                  # grow a photo to the solid non-background block it sits in
            for k_ in range(1, nb):
                bx, by, bw, bh, ba = stb[k_]
                if ba < 0.6 * bw * bh or bw * bh > 0.6 * w * h: continue  # frames and whole-page blocks: no
                ix = max(0, min(x + ww, bx + bw) - max(x, bx)); iy = max(0, min(y + hh, by + bh) - max(y, by))
                if ix * iy > 0.3 * ww * hh and bw * bh > ww * hh:
                    x, y, ww, hh = min(x, bx), min(y, by), max(x + ww, bx + bw) - min(x, bx), max(y + hh, by + bh) - min(y, by)
        x0, y0 = max(0, x - 4), max(0, y - 4); pb_ = (x0, y0, min(w, x + ww + 4) - x0, min(h, y + hh + 4) - y0)
        pics.append(pb_); kinds[pb_] = "photo" if is_photo else "lines"
        if os.environ.get("RB_DEBUG"): print("bad box", pb_, kinds[pb_], len(shapes))
    def _within(a, b): return a[0] >= b[0] and a[1] >= b[1] and a[0] + a[2] <= b[0] + b[2] and a[1] + a[3] <= b[1] + b[3]
    pics = [p_ for i_, p_ in enumerate(pics) if not any(j_ != i_ and _within(p_, q_) and (p_ != q_ or j_ < i_) for j_, q_ in enumerate(pics))]
    detail = []                                                     # pictures that trace well become shapes (drawings, maps, icons, charts)
    keep_pics = []
    for (px, py, pw, ph) in pics:
        y0, y1, x0, x1 = int(py / scale), int((py + ph) / scale), int(px / scale), int((px + pw) / scale)
        crop = img_rgb[y0:y1, x0:x1]
        tm, trr = _region_tmask(px, py, pw, ph, crop.shape) if crop.size else (None, None)
        kind = kinds.get((px, py, pw, ph), "colour")
        if kind == "photo": keep_pics.append((px, py, pw, ph)); continue          # photos stay pictures
        sh_, q = _trace_detail(crop, tm, strict=(kind == "colour"), rects=trr)
        if os.environ.get("RB_DEBUG"): print("detail", (px, py, pw, ph), kind, {k_: v_ for k_, v_ in (q or {}).items() if k_ != "bg"}, len(sh_))
        if q and not q.get("photo") and q["err"] < 10.0 and q["recall"] > 0.72:
            detail.append(((px, py, pw, ph), x0, y0, sh_, q))
        else:
            keep_pics.append((px, py, pw, ph))
            if q and q.get("photo"): kinds[(px, py, pw, ph)] = "photo"
    pics = keep_pics
    # a photo broken into pieces by an overlay (cover, divider): one picture for the whole photo
    ph_ = [p_ for p_ in pics if kinds.get(p_) == "photo"]
    if ph_ and sum(p_[2] * p_[3] for p_ in ph_) > 0.3 * w * h:
        U = (min(p_[0] for p_ in ph_), min(p_[1] for p_ in ph_)); U = U + (max(p_[0] + p_[2] for p_ in ph_) - U[0], max(p_[1] + p_[3] for p_ in ph_) - U[1])
        if U[2] * U[3] > 0.6 * w * h:
            inU = lambda p_: p_[0] >= U[0] and p_[1] >= U[1] and p_[0] + p_[2] <= U[0] + U[2] and p_[1] + p_[3] <= U[1] + U[3]
            pics = [p_ for p_ in pics if not inU(p_)] + [U]; kinds[U] = "photo"
            detail = [d_ for d_ in detail if not inU(d_[0])]
    for (px, py, pw, ph) in bigcol:
        y0, y1, x0, x1 = int(py / scale), int((py + ph) / scale), int(px / scale), int((px + pw) / scale)
        crop = img_rgb[y0:y1, x0:x1]
        tm, trr = _region_tmask(px, py, pw, ph, crop.shape)
        sh_, q = _trace_detail(crop, tm, max_shapes=1500, rects=trr)
        if os.environ.get("RB_DEBUG"): print("bigcol", (px, py, pw, ph), {k_: v_ for k_, v_ in (q or {}).items() if k_ != "bg"}, len(sh_))
        if q and not q.get("photo") and q["err"] < 10.0 and q["recall"] > 0.66:   # a page-wide fine trace beats coarse shapes even when soft edges cut recall
            detail.append(((px, py, pw, ph), x0, y0, sh_, q))
        elif q and q.get("photo"):                                    # a full-bleed photo (cover, divider): one picture
            pics.append((px, py, pw, ph)); kinds[(px, py, pw, ph)] = "photo"
    if bigcol:                                                        # pictures inside a page-wide photo are part of it
        def _within_(a, b): return a[0] >= b[0] and a[1] >= b[1] and a[0] + a[2] <= b[0] + b[2] and a[1] + a[3] <= b[1] + b[3]
        big_ = [p_ for p_ in pics if kinds.get(p_) == "photo" and p_ in bigcol]
        pics = [p_ for p_ in pics if p_ in big_ or not any(_within_(p_, b_) for b_ in big_)]
    def inside(cnt):                                                # traced shapes hidden under a picture are dropped
        x, y, ww, hh = cv2.boundingRect(cnt)
        for px, py, pw, ph in pics:
            ix = max(0, min(x + ww, px + pw) - max(x, px)); iy = max(0, min(y + hh, py + ph) - max(y, py))
            if ix * iy >= 0.7 * ww * hh: return True
        return False
    shapes = [s_ for s_ in shapes if not inside(s_[2])]
    def in_detail(cnt):
        x, y, ww, hh = cv2.boundingRect(cnt)
        for (px, py, pw, ph), *_ in detail:
            ix = max(0, min(x + ww, px + pw) - max(x, px)); iy = max(0, min(y + hh, py + ph) - max(y, py))
            if ix * iy >= 0.7 * ww * hh: return True
        return False
    shapes = [s_ for s_ in shapes if not in_detail(s_[2])]
    # 4c. drop OCR noise: short tokens inside pictures (icons, photos read as letters) and isolated big single characters (pins, arrows)
    allh = [L["h"] for B in blocks for L in B["lines"]]; medh = float(np.median(allh)) if allh else 0
    pm = np.zeros((h, w), np.uint8); dm_ = np.zeros((h, w), np.uint8)
    for px, py, pw, ph in pics: pm[py:py + ph, px:px + pw] = 1
    for (px, py, pw, ph), *_ in detail: dm_[py:py + ph, px:px + pw] = 1
    def in_detail_txt(B): return dm_[max(0, B["y"]):B["y"] + B["h"], max(0, B["x"]):B["x"] + B["w"]].mean() > 0.9
    def in_pic(B):                                                  # text is dropped only where a picture really keeps its pixels
        return pm[max(0, B["y"]):B["y"] + B["h"], max(0, B["x"]):B["x"] + B["w"]].mean() > 0.9
    def noise(B):
        if B.get("fixed") and not in_pic(B): return False             # reviewed by a person
        t = " ".join(L["text"] for L in B["lines"]); core = [ch for ch in t if ch.isalnum() or ord(ch) > 0x2E80]
        conf = np.mean([w_["c"] for L in B["lines"] for w_ in L["words"]])
        if len(core) <= 1 and B["h"] > 1.6 * medh: return True
        # inside a picture the original pixels are already right: re-type text there only when OCR is sure (else a misread number
        # would replace a correct one); low-confidence text stays as part of the picture
        if in_pic(B) and (len(core) <= 3 or conf < 85 or B["h"] > 2.2 * medh): return True   # big words in a picture are signage
        # in a fine-traced drawing the text was taken out of the shapes, so keep it unless it is clearly a misread mark
        if in_detail_txt(B) and ((len(core) <= 2 and conf < 85 and not any(ch.isdigit() for ch in core)) or (B["h"] > 2.2 * medh and conf < 80)): return True
        return False
    blocks = [B for B in blocks if not noise(B)]
    tmask = np.zeros((h, w), np.uint8)                              # text to remove from pictures = only the text kept as text boxes
    for B in blocks:
        for L in B["lines"]: cv2.rectangle(tmask, (L["x"] - 3, L["y"] - max(3, L["h"] // 4)), (L["x"] + L["w"] + 3, L["y"] + L["h"] + max(3, L["h"] // 4)), 255, -1)
    for a, c, cnt, holes in shapes:
        x, y, ww, hh = cv2.boundingRect(cnt)
        X, Y, Wd, Hd = left + x * sx, top + y * sy, ww * sx, hh * sy
        peri = cv2.arcLength(cnt, True); approx = cv2.approxPolyDP(cnt, 0.012 * peri, True)
        rect_fill = a / max(ww * hh, 1)
        if min(ww, hh) <= 3 and max(ww, hh) > 12:                 # line
            sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Emu(int(X)), Emu(int(Y)), Emu(int(max(Wd, 9525))), Emu(int(max(Hd, 9525))))
        elif not holes and len(approx) == 4 and rect_fill > 0.93:
            sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Emu(int(X)), Emu(int(Y)), Emu(int(Wd)), Emu(int(Hd)))
        elif not holes and rect_fill > 0.86 and 4 < len(approx) <= 10 and _rounded(cnt, ww, hh):
            sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Emu(int(X)), Emu(int(Y)), Emu(int(Wd)), Emu(int(Hd)))
        elif not holes and len(cnt) >= 5 and abs(a - math.pi * ww * hh / 4) / max(a, 1) < 0.06 and len(approx) >= 7 and max(ww, hh) < 3 * min(ww, hh):
            sh = slide.shapes.add_shape(MSO_SHAPE.OVAL, Emu(int(X)), Emu(int(Y)), Emu(int(Wd)), Emu(int(Hd)))
        else:
            sh = _freeform(slide, [cv2.approxPolyDP(cnt, min(1.2, max(0.6, 0.0025 * peri)), True)] +
                           [cv2.approxPolyDP(hc, min(1.2, max(0.6, 0.0025 * cv2.arcLength(hc, True))), True) for hc in holes], left, top, sx, sy)
            if sh is None: continue
        sh.fill.solid(); sh.fill.fore_color.rgb = _hex(c); sh.line.fill.background(); sh.shadow.inherit = False
    # 4d. fine-traced regions: their own background block, then the shapes (all editable)
    for (px, py, pw, ph), x0, y0, sh_, q in detail:
        if np.linalg.norm(np.array(q["bg"], float) - np.array(bgc, float)) > 12:
            bgs = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Emu(int(left + px * sx)), Emu(int(top + py * sy)), Emu(int(pw * sx)), Emu(int(ph * sy)))
            bgs.fill.solid(); bgs.fill.fore_color.rgb = _hex(q["bg"]); bgs.line.fill.background(); bgs.shadow.inherit = False
        for a, c, cnt, holes in sh_:
            conv = lambda q_: (q_.reshape(-1, 2) + np.array([x0, y0], np.float32)) * scale    # crop px -> downscaled-page px
            ff = _freeform(slide, [conv(cnt)] + [conv(hc) for hc in holes], left, top, sx, sy)
            if ff is None: continue
            ff.fill.solid(); ff.fill.fore_color.rgb = _hex(c); ff.line.fill.background(); ff.shadow.inherit = False
    # 5. pictures on top of shapes, under text
    for x, y, ww, hh in pics:
        y0, y1, x0, x1 = int(y / scale), int((y + hh) / scale), int(x / scale), int((x + ww) / scale)
        sub = img_rgb[y0:y1, x0:x1].copy()
        msub = cv2.resize(tmask[y:y + hh, x:x + ww], (sub.shape[1], sub.shape[0]), interpolation=cv2.INTER_NEAREST)
        if msub.any():                                            # text inside a picture region is re-typed as a text box: remove it from the picture
            msub = cv2.dilate(msub, np.ones((5, 5), np.uint8))
            sub = cv2.inpaint(np.ascontiguousarray(sub), msub, 5, cv2.INPAINT_TELEA)
        crop = Image.fromarray(sub)
        bio = io.BytesIO(); crop.save(bio, "PNG"); bio.seek(0)
        slide.shapes.add_picture(bio, Emu(int(left + x * sx)), Emu(int(top + y * sy)), Emu(int(ww * sx)), Emu(int(hh * sy)))
    # 6. text boxes — font family decided per page (majority of matched lines), bold per block
    votes = {"sans": 0.0, "serif": 0.0}; fm = {}
    for bi, B in enumerate(blocks):
        col, _bgc = _text_colour(img, B); per = [_font_match(img, L, col, _bgc) for L in B["lines"]]
        r_ = [m_ for m_ in per if m_]; fm[bi] = r_; fm[(bi, "line")] = per
        for fam, bo, sc in r_: votes[fam] += max(sc, 0) * len(B["lines"])
    page_serif = votes["serif"] > 1.25 * votes["sans"]
    ocr_meta = []
    for bi, B in enumerate(blocks):
        col, _bgc = _text_colour(img, B)
        # OCR box = ink extent: ≈0.93 em when a line has descenders (g j p q y , ;), ≈0.73 em for caps/digits/no-descender text
        def em(L):
            t = L["text"]; cjk_ = sum(1 for ch in t if ord(ch) > 0x2E80) > len(t) / 2
            f = 0.88 if cjk_ else 0.93 if any(ch in "gjpqyQ,;()[]{}|/" for ch in t) else 0.74
            return L["h"] / f
        lh = float(np.median([em(L) for L in B["lines"]]))
        size_pt = max(6, round(lh * sy / 12700 * 2) / 2)
        # width check: a line box made tall by an icon/number chip next to the words gives an oversized font; Arial averages ≈0.5 em per char
        wcap = max((L["w"] * sx / 12700) / max(len(L["text"]), 1) / 0.47 for L in B["lines"])
        if size_pt > wcap * 1.15: size_pt = max(6, round(wcap * 2) / 2)
        tb = slide.shapes.add_textbox(Emu(int(left + B["x"] * sx)), Emu(int(top + B["y"] * sy - size_pt * 12700 * 0.12)),
                                      Emu(int(B["w"] * sx * 1.04 + size_pt * 12700 * 0.6)), Emu(int(B["h"] * sy + size_pt * 12700 * 0.3)))
        # bold: thick strokes relative to line height (only trusted for text >= ~13 pt; small text is anti-aliased mush)
        Lb = B["lines"][0]; p_ = img[Lb["y"]:Lb["y"] + Lb["h"], Lb["x"]:Lb["x"] + Lb["w"]].astype(int)
        bold = False
        if fm.get(bi):                                             # rendered-match vote
            bold = sum(1 for f_, bo, sc in fm[bi] if bo) > len(fm[bi]) / 2
        elif p_.size and size_pt >= 13:
            m_ = (np.linalg.norm(p_ - np.array(col), axis=2) < np.linalg.norm(p_ - np.array(_bgc), axis=2)).astype(np.uint8)
            dt = cv2.distanceTransform(m_, cv2.DIST_L2, 3); sk = dt[dt > 0]
            bold = bool(len(sk)) and 2 * np.percentile(sk, 90) / Lb["h"] >= 0.15
        tf = tb.text_frame; tf.word_wrap = False
        for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"): setattr(tf, m, 0)
        tf.vertical_anchor = MSO_ANCHOR.TOP
        tb.name = f"ocr b{bi}"
        for k, L in enumerate(B["lines"]):
            p = tf.paragraphs[0] if k == 0 else tf.add_paragraph()
            ml = fm.get((bi, "line"), [None] * len(B["lines"]))[k]
            # colour per word, merged into runs: emphasised words (often in the accent colour) keep their colour
            wc = []
            for w_ in L["words"]:
                c_, _b = _text_colour(img, dict(x=w_["x"], y=w_["y"], w=w_["w"], h=w_["h"]))
                wc.append(c_ if np.linalg.norm(np.array(c_, float) - np.array(col, float)) > 60 else col)
            cjk = lambda s_: any(ord(ch) > 0x2E80 for ch in s_)
            runs = []
            for j, w_ in enumerate(L["words"]):
                sep = "" if j == 0 or (cjk(L["words"][j - 1]["t"]) and cjk(w_["t"])) else " "
                if runs and runs[-1][1] == tuple(wc[j]): runs[-1][0] += sep + w_["t"]
                else: runs.append([sep + w_["t"], tuple(wc[j])])
            for text_, c_ in runs:
                r = p.add_run(); r.text = text_; r.font.size = Pt(size_pt); r.font.color.rgb = _hex(c_); r.font.name = "Times New Roman" if page_serif else "Arial"
                r.font.bold = ml[1] if ml else bold                   # bold per line where the line could be matched
                rPr = r._r.get_or_add_rPr(); ea = etree.SubElement(rPr, "{http://schemas.openxmlformats.org/drawingml/2006/main}ea"); ea.set("typeface", "Microsoft YaHei")
        ocr_meta.append(dict(block=bi, name=f"ocr b{bi}", lines=[dict(text=L["text"], x=int(L["x"] / scale), y=int(L["y"] / scale), w=int(L["w"] / scale), h=int(L["h"] / scale),
                              conf=round(float(np.mean([w_["c"] for w_ in L["words"]])), 1), reread=[w_.get("t_ocr") for w_ in L["words"] if w_.get("t_ocr")]) for L in B["lines"]]))
    return dict(shapes=len(shapes), pictures=len(pics), traced_regions=len(detail), traced_shapes=sum(len(d[3]) for d in detail), text_blocks=len(blocks), ocr=ocr_meta)

def _rounded(cnt, w, h):
    x, y, ww, hh = cv2.boundingRect(cnt)
    pts = cnt.reshape(-1, 2)
    corners = [(x, y), (x + ww, y), (x, y + hh), (x + ww, y + hh)]
    return all(min(np.hypot(*(pts - np.array(c)).T)) > 0.04 * min(ww, hh) for c in corners)

def _freeform(slide, contours, left, top, sx, sy):
    outer = contours[0].reshape(-1, 2)
    if len(outer) < 3: return None
    fb = slide.shapes.build_freeform(Emu(int(left + outer[0][0] * sx)), Emu(int(top + outer[0][1] * sy)), scale=1.0)
    fb.add_line_segments([(Emu(int(left + p[0] * sx)), Emu(int(top + p[1] * sy))) for p in outer[1:]], close=True)
    for hc in contours[1:]:
        pts = hc.reshape(-1, 2)
        if len(pts) < 3: continue
        fb.move_to(Emu(int(left + pts[0][0] * sx)), Emu(int(top + pts[0][1] * sy)))
        fb.add_line_segments([(Emu(int(left + p[0] * sx)), Emu(int(top + p[1] * sy))) for p in pts[1:]], close=True)
    return fb.convert_to_shape()

# ----------------------------------------------------------------------------- PDF
def pdf_pages_kind(pdf):
    import pdfplumber
    kinds = []
    with pdfplumber.open(pdf) as d:
        for pg in d.pages:
            area = float(pg.width * pg.height)
            big_img = any((im["x1"] - im["x0"]) * (im["bottom"] - im["top"]) > 0.8 * area for im in pg.images)
            vec = len(pg.chars) + len(pg.curves) + len(pg.rects) + len(pg.lines)
            kinds.append("raster" if (big_img and len(pg.chars) < 5) or vec == 0 else "vector")
    return kinds

def merge_text_lines(prs):
    """LibreOffice imports one text box per line: merge lines stacked in the same column with the same style."""
    A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
    for slide in prs.slides:
        boxes = [s for s in slide.shapes if s.has_text_frame and s.text_frame.text.strip() and s.shape_type == 17]
        def style(s):
            r = s.text_frame.paragraphs[0].runs
            return (round(r[0].font.size.pt) if r and r[0].font.size else None, str(r[0].font.color.rgb) if r and r[0].font.color and r[0].font.color.type else None) if r else (None, None)
        boxes.sort(key=lambda s: (s.left, s.top)); used = set()
        for i, a in enumerate(boxes):
            if id(a) in used: continue
            cur = a
            for b in boxes[i + 1:]:
                if id(b) in used: continue
                gap = b.top - (cur.top + cur.height); lh = cur.height / max(1, len(cur.text_frame.paragraphs))
                if abs(b.left - a.left) < Pt(4) and 0 <= gap < lh * 0.8 and style(b) == style(a):
                    for p in b.text_frame._txBody.findall(A + "p"): a.text_frame._txBody.append(p)
                    a.width = max(a.width, b.width); a.height = (b.top + b.height) - a.top
                    b._element.getparent().remove(b._element); used.add(id(b)); cur = b
    return prs

def restore_missing_text(prs, pdf):
    """LibreOffice drops text in fonts it can't map (e.g. CJK 'Adobe Heiti'); put any PDF text line missing from the slide back as a text box."""
    import pdfplumber, re
    norm = lambda t: re.sub(r"\s+", "", t)
    added = 0
    with pdfplumber.open(pdf) as d:
        for page, slide in zip(d.pages, prs.slides):
            have = norm("".join(sh.text_frame.text for sh in slide.shapes if sh.has_text_frame))
            k = prs.slide_width / float(page.width)
            try: lines = page.extract_text_lines(return_chars=True)
            except Exception: continue
            # split each PDF line at column gaps; a segment the import lost (not found as a whole) is put back
            groups = []
            for Ln in lines:
                cs = [c for c in Ln["chars"] if c.get("upright", True)]
                seg = []
                for c in cs:
                    if seg and c["x0"] - seg[-1]["x1"] > 1.5 * c["size"]: groups.append(seg); seg = []
                    seg.append(c)
                if seg: groups.append(seg)
            def seg_words(seg):
                out, cur = [], None
                for c in seg:
                    if cur and c["x0"] - cur["x1"] > 0.15 * c["size"]: out.append(cur); cur = None
                    if c["text"].strip() == "": 
                        if cur: out.append(cur); cur = None
                        continue
                    if cur: cur["text"] += c["text"]; cur["x1"] = c["x1"]
                    else: cur = dict(text=c["text"], x0=c["x0"], x1=c["x1"], top=c["top"], size=c["size"], fontname=c["fontname"], non_stroking_color=c.get("non_stroking_color"))
                if cur: out.append(cur)
                return out
            groups = [seg_words(g) for g in groups]
            def lost(g):
                if norm("".join(w["text"] for w in g)) in have: return False
                ws = [norm(w["text"]) for w in g if norm(w["text"])]
                pairs = [a + b for a, b in zip(ws, ws[1:])] or ws  # word pairs: specific enough to tell "wrapped differently" from "lost"
                return sum(p in have for p in pairs) / len(pairs) < 0.7
            boxes = [(sh.left, sh.top, sh.left + sh.width, sh.top + sh.height) for sh in slide.shapes
                     if sh.has_text_frame and sh.text_frame.text.strip() and sh.width is not None]
            def covered(g):  # a text box already sits where this text is: it was imported (maybe spelled differently)
                x0, x1 = g[0]["x0"] * k, g[-1]["x1"] * k; y0 = min(w["top"] for w in g) * k; y1 = y0 + max(w["size"] for w in g) * k
                area = max(1, (x1 - x0) * (y1 - y0))
                for bx0, by0, bx1, by1 in boxes:
                    ix = max(0, min(x1, bx1) - max(x0, bx0)); iy = max(0, min(y1, by1) - max(y0, by0))
                    if ix * iy / area > 0.4: return True
                return False
            groups = [g for g in groups if g and lost(g) and not covered(g)]
            for g in groups:
                t = " ".join(w["text"] for w in g)
                if len(norm(t)) < 2: continue
                L = dict(x0=g[0]["x0"], x1=g[-1]["x1"], top=min(w["top"] for w in g)); chars = [dict(size=w["size"], fontname=w["fontname"], non_stroking_color=w.get("non_stroking_color")) for w in g]
                size = float(np.median([c["size"] for c in chars]))
                col = chars[0].get("non_stroking_color")
                rgb = (40, 40, 40)
                if isinstance(col, (list, tuple)):
                    if len(col) == 3: rgb = tuple(int(255 * v) for v in col)
                    elif len(col) == 1: rgb = (int(255 * col[0]),) * 3
                    elif len(col) == 4: c_, m_, y_, k_ = col; rgb = tuple(int(255 * (1 - v) * (1 - k_)) for v in (c_, m_, y_))
                tb = slide.shapes.add_textbox(Emu(int(L["x0"] * k)), Emu(int(L["top"] * k - size * k * 0.15)), Emu(int((L["x1"] - L["x0"]) * k * 1.08 + size * k)), Emu(int(size * k * 1.3)))
                tf = tb.text_frame; tf.word_wrap = False
                for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"): setattr(tf, m, 0)
                r = tf.paragraphs[0].add_run(); r.text = t; r.font.size = Pt(max(6, round(size * k / 12700 * 2) / 2))
                r.font.color.rgb = _hex(rgb); r.font.name = "Arial"; r.font.bold = "Bold" in chars[0]["fontname"]
                rPr = r._r.get_or_add_rPr(); ea = etree.SubElement(rPr, "{http://schemas.openxmlformats.org/drawingml/2006/main}ea"); ea.set("typeface", "Microsoft YaHei")
                have += norm(t); added += 1
    return added

def rebuild_pdf(pdf, out, lang, fixes=None, pages_dir=None):
    work = tempfile.mkdtemp()
    kinds = pdf_pages_kind(pdf)
    if any(k == "vector" for k in kinds):
        soffice(["--infilter=impress_pdf_import", "--convert-to", "pptx", "--outdir", work, pdf])
        got = glob.glob(os.path.join(work, "*.pptx"))
        if not got: raise SystemExit("PDF import failed")
        prs = merge_text_lines(Presentation(got[0]))
        restore_missing_text(prs, pdf)
    else:
        prs = Presentation()
        import pdfplumber
        with pdfplumber.open(pdf) as d:
            pw, ph = float(d.pages[0].width), float(d.pages[0].height)
        prs.slide_width = Emu(int(13.333 * EMU_IN)); prs.slide_height = Emu(int(13.333 * EMU_IN * ph / pw))
        for _ in kinds: prs.slides.add_slide(prs.slide_layouts[6])
    # raster pages: render and rebuild from pixels
    stats = [dict(kind=k) for k in kinds]
    if pages_dir: os.makedirs(pages_dir, exist_ok=True)
    for i, k in enumerate(kinds):
        if k != "raster": continue
        subprocess.run(["pdftocairo", "-png", "-r", "150", "-f", str(i + 1), "-l", str(i + 1), "-singlefile", pdf, os.path.join(work, f"pg{i}")], check=True)
        if pages_dir: shutil.copy(os.path.join(work, f"pg{i}.png"), os.path.join(pages_dir, f"pg-{i:03d}.png"))   # the pixels the OCR saw, for ocr_review.py
        img = np.array(Image.open(os.path.join(work, f"pg{i}.png")).convert("RGB"))
        s = prs.slides[i]
        for shp in list(s.shapes): shp._element.getparent().remove(shp._element)
        SW, SH = prs.slide_width, prs.slide_height; ia = img.shape[1] / img.shape[0]
        w_, h_ = (SW, int(SW / ia)) if ia > SW / SH else (int(SH * ia), SH)  # fit page inside the slide, keep aspect
        stats[i] = dict(kind="raster", **rebuild_raster(s, img, w_, h_, lang, (SW - w_) // 2, (SH - h_) // 2, fix=(fixes or {}).get(i)))
    prs.save(out)
    return stats

def rebuild_images(paths, out, lang, fixes=None):
    ars = [round(Image.open(p).width / Image.open(p).height, 1) for p in paths]
    ar = max(set(ars), key=ars.count)
    exact = [Image.open(p).width / Image.open(p).height for p in paths]; exact = [e for e in exact if round(e, 1) == ar]
    ar = float(np.median(exact))
    for std in (16 / 9, 4 / 3, 16 / 10):  # snap to a standard slide size when close
        if abs(ar - std) / std < 0.03: ar = std
    prs = Presentation(); W = 13.333 if ar > 1.5 else 10.0
    prs.slide_width = Emu(int(W * EMU_IN)); prs.slide_height = Emu(int(W * EMU_IN / ar))
    stats = []
    for p in paths:
        img = np.array(Image.open(p).convert("RGB"))
        s = prs.slides.add_slide(prs.slide_layouts[6])
        ih, iw = img.shape[:2]; k = min(prs.slide_width / iw, prs.slide_height / ih)
        bw, bh = iw * k, ih * k
        stats.append(rebuild_raster(s, img, bw, bh, lang, left=(prs.slide_width - bw) / 2, top=(prs.slide_height - bh) / 2,
                                    fix=(fixes or {}).get(len(stats))))
    prs.save(out)
    return stats

# ----------------------------------------------------------------------------- review sheet
def review(src_imgs, out_pptx, sheet_path):
    from skimage.metrics import structural_similarity as ssim
    work = tempfile.mkdtemp()
    soffice(["--convert-to", "pdf", "--outdir", work, out_pptx])
    pdf = glob.glob(os.path.join(work, "*.pdf"))[0]
    subprocess.run(["pdftoppm", "-png", "-r", "60", pdf, os.path.join(work, "r")], check=True)
    rens = sorted(glob.glob(os.path.join(work, "r-*.png")), key=lambda f: int(f.rsplit("-", 1)[1][:-4]))
    rows, scores = [], []
    for s, r in zip(src_imgs, rens):
        a = Image.open(s).convert("RGB"); b = Image.open(r).convert("RGB").resize((int(a.width * 400 / a.height), 400)) if False else Image.open(r).convert("RGB")
        hgt = 300; a = a.resize((int(a.width * hgt / a.height), hgt))
        bb = Image.new("RGB", a.size, "white"); k = min(a.width / b.width, hgt / b.height); b2 = b.resize((int(b.width * k), int(b.height * k)))
        bb.paste(b2, ((a.width - b2.width) // 2, (hgt - b2.height) // 2)); b = bb
        g1, g2 = np.array(a.convert("L")), np.array(b.convert("L"))
        sc = ssim(g1, g2); scores.append(round(float(sc), 3))
        row = Image.new("RGB", (a.width * 2 + 10, hgt), "#888"); row.paste(a, (0, 0)); row.paste(b, (a.width + 10, 0)); rows.append(row)
    if rows:
        S = Image.new("RGB", (max(r.width for r in rows), sum(r.height + 8 for r in rows)), "#888"); y = 0   # pages can differ in width
        for r in rows: S.paste(r, (0, y)); y += r.height + 8
        S.save(sheet_path, quality=80)
    return scores

def load_fixes(corrections, prev_json):
    """Turn a reviewed corrections file (ids from ocr_review.py sheets) into per-page boxes for rebuild_raster."""
    info = json.load(open(prev_json))["info"]; corr = json.load(open(corrections)); fixes = {}
    lines = {}
    for pi, pg in enumerate(info):
        for b in pg.get("ocr", []):
            for li, L in enumerate(b["lines"]): lines[f"p{pi + 1}-b{b['block']}-l{li}"] = (pi, L)
    for iid, new in corr.items():
        if iid == "_missing" or iid not in lines: continue
        pi, L = lines[iid]
        if isinstance(new, dict): new = re.sub(new["sub"][0], new["sub"][1], L["text"]).strip()
        fixes.setdefault(pi, {"edit": [], "add": []})["edit"].append([L["x"], L["y"], L["w"], L["h"], new])
    for iid, it in corr.get("_missing", {}).items():
        fixes.setdefault(it["page"], {"edit": [], "add": []})["add"].append([it["x"], it["y"], it["w"], it["h"], it["text"]])
    return fixes

def rebuild(src, out, lang="eng+chi_sim", fixes=None, pages_dir=None, ocr_cache=None):
    """PDF / image / folder of images -> editable .pptx at out; returns info (per page, with the OCR lines of image
    pages), similarity scores and review sheet path.
    fixes: load_fixes(corrections, previous info json) -- reviewed OCR corrections, applied while rebuilding.
    pages_dir: where the rendered PDF pages are kept (the pixels ocr_review.py compares against).
    ocr_cache: folder of cached OCR results, so a re-run with corrections sees exactly the same lines."""
    global OCR_CACHE
    if ocr_cache: OCR_CACHE = ocr_cache
    work = tempfile.mkdtemp()
    if os.path.isdir(src):
        paths = sorted(p for p in glob.glob(os.path.join(src, "*")) if p.lower().endswith(IMG_EXT))
        if not paths: raise SystemExit("no images in folder")
        info = rebuild_images(paths, out, lang, fixes); srcs = paths
    elif src.lower().endswith(".pdf"):
        info = rebuild_pdf(src, out, lang, fixes, pages_dir)
        subprocess.run(["pdftoppm", "-png", "-r", "50", src, os.path.join(work, "s")], check=True)
        srcs = sorted(glob.glob(os.path.join(work, "s-*.png")), key=lambda f: int(f.rsplit("-", 1)[1][:-4]))
    elif src.lower().endswith(IMG_EXT):
        info = rebuild_images([src], out, lang); srcs = [src]
    else:
        raise SystemExit("unsupported input: give a .pdf, an image, or a folder of images")
    sheet = os.path.splitext(out)[0] + "-review.jpg"
    scores = review(srcs, out, sheet)
    return dict(out=out, pages=len(srcs), info=info, similarity=scores, review_sheet=sheet)

def main():
    if len(sys.argv) < 3: print(__doc__); sys.exit(1)
    opt = lambda k: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else None
    lang = opt("--lang") or "eng+chi_sim"
    fixes = load_fixes(opt("--fixes"), opt("--prev")) if opt("--fixes") else None
    r = rebuild(sys.argv[1], sys.argv[2], lang, fixes, opt("--pages"), opt("--ocr-cache"))
    if opt("--info"): json.dump(r, open(opt("--info"), "w"), default=str)
    print(json.dumps(dict(out=r["out"], pages=r["pages"], similarity=r["similarity"], review_sheet=r["review_sheet"]), default=str))

if __name__ == "__main__":
    main()
