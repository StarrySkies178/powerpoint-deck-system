"""rebuild_slides.py: turn PDFs, screenshots and scans into EDITABLE PowerPoint slides.

  python3 scripts/rebuild_slides.py <file.pdf | image | folder-of-images> <out.pptx> [--lang eng+chi_sim]

How each input is rebuilt
  * Vector PDF pages (exported from PowerPoint/Word/etc.): LibreOffice's PDF import gives every
    shape as an editable freeform and every line of text as a text box; text lines that belong
    together are then merged back into paragraphs.
  * Images and scanned PDF pages: rebuilt from pixels.
      1. OCR (Tesseract, English + Chinese) -> editable text boxes, size and colour measured from the image
      2. text removed from the image (inpainting), colours reduced to the slide's palette
      3. each colour region traced -> rectangles, rounded rectangles, ellipses, lines, or freeform
         shapes (holes kept), drawn largest-first so the stacking matches
      4. photos / gradients / detailed icons that can't be shapes stay as cropped pictures
  * Output: one slide per page/image, same proportions. A review sheet (original vs rebuilt,
    with a similarity score) is written next to the output.
"""
import glob, io, json, math, os, shutil, subprocess, sys, tempfile
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

def _ocr(img_rgb, lang):
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
    for img, sc in ((base, up), (ImageOps.invert(base), up), (ink, k3)):
        up = sc
        d = pytesseract.image_to_data(img, lang=lang, config="--psm 3", output_type=pytesseract.Output.DICT)
        for i in range(len(d["text"])):
            t = d["text"][i].strip()
            try: conf = float(d["conf"][i])
            except ValueError: conf = -1
            cjk = any(ord(ch) > 0x2E80 for ch in t)
            if t and conf >= (40 if cjk else 55) and d["height"][i] >= 6 * up and any(ch.isalnum() or ord(ch) > 0x2E80 for ch in t):
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

def _text_colour(img, b):
    x, y, w, h = b["x"], b["y"], b["w"], b["h"]
    patch = img[max(0, y):y + h, max(0, x):x + w].reshape(-1, 3).astype(int)
    if len(patch) == 0: return (40, 40, 40), (255, 255, 255)
    border = np.concatenate([img[max(0, y - 2), x:x + w], img[min(img.shape[0] - 1, y + h + 1), x:x + w]]).astype(int)
    bg = np.median(border, axis=0) if len(border) else np.array([255, 255, 255])
    d = np.linalg.norm(patch - bg, axis=1)
    fg = patch[d >= max(np.percentile(d, 85), 0.5 * d.max(), 1)]
    return tuple(np.median(fg, axis=0).astype(int)) if len(fg) else (40, 40, 40), tuple(bg.astype(int))

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

def rebuild_raster(slide, img_rgb, slide_w, slide_h, lang="eng+chi_sim", left=0, top=0):
    """Draw editable shapes + text reconstructed from an image onto a python-pptx slide."""
    H, W = img_rgb.shape[:2]
    scale = 1600 / max(W, H) if max(W, H) > 1600 else 1.0
    img = cv2.resize(img_rgb, (int(W * scale), int(H * scale)), interpolation=cv2.INTER_AREA) if scale != 1 else img_rgb.copy()
    h, w = img.shape[:2]; sx, sy = slide_w / w, slide_h / h
    blocks = _ocr(img, lang)
    # 1. remove text so it doesn't become shapes
    tmask = np.zeros((h, w), np.uint8)
    for B in blocks:
        for L in B["lines"]: cv2.rectangle(tmask, (L["x"] - 3, L["y"] - 3), (L["x"] + L["w"] + 3, L["y"] + L["h"] + 3), 255, -1)
    clean = cv2.inpaint(img, tmask, 5, cv2.INPAINT_TELEA) if blocks else img
    clean = cv2.bilateralFilter(clean, 5, 18, 5)
    # 2. palette + quantize
    cents = _palette(clean, np.ones((h, w), bool))
    dist = np.stack([np.linalg.norm(clean.astype(float) - c, axis=2) for c in cents])
    lab_idx = np.argmin(dist, axis=0); err = np.min(dist, axis=0)
    border = np.concatenate([lab_idx[0], lab_idx[-1], lab_idx[:, 0], lab_idx[:, -1]])
    bg = np.bincount(border, minlength=len(cents)).argmax()
    # 3. picture regions: where flat colours don't describe the image (photos, gradients, detailed icons)
    errm = cv2.GaussianBlur(err.astype(np.float32), (0, 0), 6)
    pic = (errm > 22).astype(np.uint8)
    pic = cv2.morphologyEx(pic, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    pics = []
    n, cc, st, _ = cv2.connectedComponentsWithStats(pic)
    for i in range(1, n):
        x, y, ww, hh, a = st[i]
        if a > 0.002 * w * h and ww > 20 and hh > 20: pics.append((x, y, ww, hh))
    picmask = np.zeros((h, w), np.uint8)
    for x, y, ww, hh in pics: picmask[y:y + hh, x:x + ww] = 1
    # background
    bgc = cents[bg]
    slide.background.fill.solid(); slide.background.fill.fore_color.rgb = _hex(bgc)
    # 4. trace each colour region
    shapes = []
    min_area = 0.00012 * w * h
    for ci, c in enumerate(cents):
        if ci == bg: continue
        m = ((lab_idx == ci) & (picmask == 0)).astype(np.uint8) * 255
        
        cnts, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        if hier is None: continue
        for i, cnt in enumerate(cnts):
            if hier[0][i][3] != -1: continue                      # holes handled with their parent
            a = cv2.contourArea(cnt)
            if a < min_area: continue
            holes = [cnts[j] for j in range(len(cnts)) if hier[0][j][3] == i and cv2.contourArea(cnts[j]) > min_area / 2]
            shapes.append((a, c, cnt, holes))
    shapes.sort(key=lambda s: -s[0])                              # big first = behind
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
        elif not holes and len(cnt) >= 5 and abs(a - math.pi * ww * hh / 4) / max(a, 1) < 0.06 and len(approx) >= 7:
            sh = slide.shapes.add_shape(MSO_SHAPE.OVAL, Emu(int(X)), Emu(int(Y)), Emu(int(Wd)), Emu(int(Hd)))
        else:
            sh = _freeform(slide, [cv2.approxPolyDP(cnt, max(0.6, 0.0025 * peri), True)] +
                           [cv2.approxPolyDP(hc, max(0.6, 0.0025 * cv2.arcLength(hc, True)), True) for hc in holes], left, top, sx, sy)
            if sh is None: continue
        sh.fill.solid(); sh.fill.fore_color.rgb = _hex(c); sh.line.fill.background(); sh.shadow.inherit = False
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
    # 6. text boxes
    for B in blocks:
        col, _bgc = _text_colour(img, B)
        lh = np.median([L["h"] for L in B["lines"]])
        size_pt = max(6, round(lh * sy / 12700 * 1.07 * 2) / 2)  # OCR line box ≈ 0.93 em (calibrated on known 24/14 pt text)
        # width check: a line box made tall by an icon/number chip next to the words gives an oversized font; Arial averages ≈0.5 em per char
        wcap = max((L["w"] * sx / 12700) / max(len(L["text"]), 1) / 0.47 for L in B["lines"])
        if size_pt > wcap * 1.15: size_pt = max(6, round(wcap * 2) / 2)
        tb = slide.shapes.add_textbox(Emu(int(left + B["x"] * sx)), Emu(int(top + B["y"] * sy - size_pt * 12700 * 0.12)),
                                      Emu(int(B["w"] * sx * 1.04 + size_pt * 12700 * 0.6)), Emu(int(B["h"] * sy + size_pt * 12700 * 0.3)))
        # bold: thick strokes relative to line height (only trusted for text >= ~13 pt; small text is anti-aliased mush)
        Lb = B["lines"][0]; p_ = img[Lb["y"]:Lb["y"] + Lb["h"], Lb["x"]:Lb["x"] + Lb["w"]].astype(int)
        bold = False
        if p_.size and size_pt >= 13:
            m_ = (np.linalg.norm(p_ - np.array(col), axis=2) < np.linalg.norm(p_ - np.array(_bgc), axis=2)).astype(np.uint8)
            dt = cv2.distanceTransform(m_, cv2.DIST_L2, 3); sk = dt[dt > 0]
            bold = bool(len(sk)) and 2 * np.percentile(sk, 90) / Lb["h"] >= 0.15
        tf = tb.text_frame; tf.word_wrap = False
        for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"): setattr(tf, m, 0)
        tf.vertical_anchor = MSO_ANCHOR.TOP
        for k, L in enumerate(B["lines"]):
            p = tf.paragraphs[0] if k == 0 else tf.add_paragraph()
            r = p.add_run(); r.text = L["text"]; r.font.size = Pt(size_pt); r.font.color.rgb = _hex(col); r.font.name = "Arial"; r.font.bold = bold
            rPr = r._r.get_or_add_rPr(); ea = etree.SubElement(rPr, "{http://schemas.openxmlformats.org/drawingml/2006/main}ea"); ea.set("typeface", "Microsoft YaHei")
    return dict(shapes=len(shapes), pictures=len(pics), text_blocks=len(blocks))

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

def rebuild_pdf(pdf, out, lang):
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
    for i, k in enumerate(kinds):
        if k != "raster": continue
        subprocess.run(["pdftocairo", "-png", "-r", "150", "-f", str(i + 1), "-l", str(i + 1), "-singlefile", pdf, os.path.join(work, f"pg{i}")], check=True)
        img = np.array(Image.open(os.path.join(work, f"pg{i}.png")).convert("RGB"))
        s = prs.slides[i]
        for shp in list(s.shapes): shp._element.getparent().remove(shp._element)
        SW, SH = prs.slide_width, prs.slide_height; ia = img.shape[1] / img.shape[0]
        w_, h_ = (SW, int(SW / ia)) if ia > SW / SH else (int(SH * ia), SH)  # fit page inside the slide, keep aspect
        rebuild_raster(s, img, w_, h_, lang, (SW - w_) // 2, (SH - h_) // 2)
    prs.save(out)
    return kinds

def rebuild_images(paths, out, lang):
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
        stats.append(rebuild_raster(s, img, bw, bh, lang, left=(prs.slide_width - bw) / 2, top=(prs.slide_height - bh) / 2))
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
        S = Image.new("RGB", (rows[0].width, sum(r.height + 8 for r in rows)), "#888"); y = 0
        for r in rows: S.paste(r, (0, y)); y += r.height + 8
        S.save(sheet_path, quality=80)
    return scores

def rebuild(src, out, lang="eng+chi_sim"):
    """PDF / image / folder of images -> editable .pptx at out; returns info, similarity scores and review sheet path."""
    work = tempfile.mkdtemp()
    if os.path.isdir(src):
        paths = sorted(p for p in glob.glob(os.path.join(src, "*")) if p.lower().endswith(IMG_EXT))
        if not paths: raise SystemExit("no images in folder")
        info = rebuild_images(paths, out, lang); srcs = paths
    elif src.lower().endswith(".pdf"):
        info = rebuild_pdf(src, out, lang)
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
    lang = sys.argv[sys.argv.index("--lang") + 1] if "--lang" in sys.argv else "eng+chi_sim"
    print(json.dumps(rebuild(sys.argv[1], sys.argv[2], lang), default=str))

if __name__ == "__main__":
    main()
