#!/usr/bin/env python3
"""Check the text of a rebuilt (image -> editable) deck against the original pixels, line by line.
Required for every reference whose pages were rebuilt from images (maintenance/new-reference.md step 1b, audit check 12).

  python3 Generators/ocr_review.py sheets <rebuild-info.json> <page images dir> <out dir>              # every line with a number
  python3 Generators/ocr_review.py sheets <rebuild-info.json> <page images dir> <out dir> --suspect    # lines without numbers that look misread
  python3 Generators/ocr_review.py missing <rebuild-info.json> <page images dir> <missing.json>       # numbers on the page that OCR missed
  python3 Generators/ocr_review.py missing-words <rebuild-info.json> <page images dir> <words.json>   # words OCR missed (light text on colour)
  python3 Generators/ocr_review.py missing-sheets <missing.json> <page images dir> <out dir> [--dense] # each candidate in context
  python3 Generators/ocr_review.py apply <rebuilt.pptx> <rebuild-info.json> <corrections.json> <out.pptx> [page images dir]

For a reference ingested with scripts/ingest_reference.py the inputs are review/<key>/rebuild-info.json and
review/<key>/pages/ (or the source image folder). Each sheet row shows the original crop next to the OCR text, with an id
like p12-b3-l0 (page 12, text block 3, line 0). Write corrections to review/<key>/ocr-corrections.json:
  {id: "right text"}   "" deletes the line (an icon or logo read as letters: it then stays a graphic)
  {id: {"sub": [regex, replacement]}}   fixes part of a long line
  "_missing": {m12-4: {...candidate from missing.json, "text" corrected if needed}}   numbers OCR missed, added as text
Then rebuild with the corrections (best: ingest_reference.py ... --fixes review/<key>/ocr-corrections.json --replace,
which erases corrected text from the trace and keeps deleted lines as graphics). 'apply' only patches the text boxes of an
existing deck, without re-tracing.
"""
import glob, json, os, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IMG_EXT = (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff")

def pages(src):
    return sorted(p for p in glob.glob(os.path.join(src, "*")) if p.lower().endswith(IMG_EXT))

def suspect(L):
    """A line without digits that OCR may have invented from an icon, a logo or faint text (or that was auto-fixed)."""
    if L.get("autofix"): return True
    t = L["text"]; al = [c for c in t if c.isalnum()]
    cjk = sum(1 for c in t if ord(c) > 0x2E80)
    return (L.get("conf", 100) < 80 or len(al) <= 3 or len(al) < 0.7 * len(t.replace(" ", "")) or 0 < cjk < len(t) / 2
            or bool(re.search(r"[^\x20-\x7e\u00a0-\u024f\u2010-\u2027\u2030-\u203a\u2190-\u21ff\u3000-\u303f\u4e00-\u9fff\uff00-\uffef²³¹°]", t)))

def items(info, digits_only=True, mode=None):
    """mode None/'digits': lines with a number; 'suspect': lines without numbers that look misread; 'all'."""
    mode = mode or ("digits" if digits_only else "all")
    for pi, pg in enumerate(info):
        for b in pg.get("ocr", []):
            for li, L in enumerate(b["lines"]):
                has_d = bool(re.search(r"\d", L["text"]))
                if mode == "digits" and not has_d and not L.get("autofix"): continue
                if mode == "suspect" and (has_d or not suspect(L)): continue
                yield f"p{pi + 1}-b{b['block']}-l{li}", pi, L

def sheets(jpath, src, out, all_lines=False, per=60, mode=None):
    info = json.load(open(jpath))["info"]; imgs = pages(src); os.makedirs(out, exist_ok=True)
    f_id, f_t = ImageFont.truetype(FONT, 15), ImageFont.truetype(FONT, 22)
    rows = []
    for iid, pi, L in items(info, not all_lines, mode):
        im = Image.open(imgs[pi]).convert("RGB"); pad = max(3, L["h"] // 3)
        c = im.crop((max(0, L["x"] - pad), max(0, L["y"] - pad), min(im.width, L["x"] + L["w"] + pad), min(im.height, L["y"] + L["h"] + pad)))
        k = 38 / max(1, c.height); c = c.resize((max(1, min(560, int(c.width * k))), 38))
        rows.append((iid, c, L["text"] + (f"   [auto: {L['autofix'][0]} → {L['autofix'][1]}]" if L.get("autofix") else "")))
    import textwrap
    f_t = ImageFont.truetype(FONT, 17); W = 2400; colw = W // 2; rh = 48; n = 0
    for s in range(0, len(rows), per):
        chunk = rows[s:s + per]; S = Image.new("RGB", (W, (per // 2) * rh + 10), "white"); d = ImageDraw.Draw(S)
        for i, (iid, c, t) in enumerate(chunk):
            x = (i // (per // 2)) * colw; y = (i % (per // 2)) * rh + 4
            d.text((x + 4, y + 14), iid, fill=(110, 110, 110), font=f_id)
            c2 = c if c.width <= 520 else c.resize((520, max(1, int(c.height * 520 / c.width))))
            S.paste(c2, (x + 125, y + (40 - c2.height) // 2))
            lines = textwrap.wrap(t, 52)[:2]
            if len(textwrap.wrap(t, 52)) > 2: lines[-1] = lines[-1][:49] + "…"
            for k, ln in enumerate(lines): d.text((x + 655, y + 2 + k * 21 + (10 if len(lines) == 1 else 0)), ln, fill=(200, 0, 0), font=f_t)
            d.line([(x, y + rh - 3), (x + colw - 12, y + rh - 3)], fill=(225, 225, 225))
        n += 1; S.save(os.path.join(out, f"review-{n:02d}.jpg"), quality=88)
    print(f"{len(rows)} lines on {n} sheets in {out}")

def missing(jpath, src, outp):
    """Digits OCR found on a second, digit-only sparse pass that no existing line covers."""
    import pytesseract, cv2
    info = json.load(open(jpath))["info"]; imgs = pages(src); found = {}
    for pi, pg in enumerate(info):
        boxes = [(L["x"], L["y"], L["w"], L["h"]) for b in pg.get("ocr", []) for L in b["lines"]]
        g = np.array(Image.open(imgs[pi]).convert("L")); k = 2.0
        g2 = cv2.resize(g, (int(g.shape[1] * k), int(g.shape[0] * k)), interpolation=cv2.INTER_CUBIC)
        for img in (g2, 255 - g2):
            d = pytesseract.image_to_data(Image.fromarray(img), lang="eng", output_type=pytesseract.Output.DICT,
                                          config="--psm 11 -c tessedit_char_whitelist=0123456789.,%+-")
            for i, t in enumerate(d["text"]):
                t = t.strip()
                if not t or not re.search(r"\d", t) or float(d["conf"][i]) < 60: continue
                x, y, w, h = [int(d[q][i] / k) for q in ("left", "top", "width", "height")]
                if h < 6 or any(x < bx + bw and bx < x + w and y < by + bh and by < y + h for bx, by, bw, bh in boxes): continue
                boxes.append((x, y, w, h)); found[f"m{pi + 1}-{len(found)}"] = dict(page=pi, text=t, x=x, y=y, w=w, h=h, conf=float(d["conf"][i]))
    json.dump(found, open(outp, "w"), indent=0); print(len(found), "possible missed numbers")
    return found

def missing_words(jpath, src, outp):
    """Words (letters) that no OCR line covers: light text on colour (white on pink, grey on grey) is often missed.
    Read on the saturation channel and on a contrast-stretched grey image, both polarities; words of 3+ letters."""
    import pytesseract, cv2
    info = json.load(open(jpath))["info"]; imgs = pages(src); found = {}
    for pi, pg in enumerate(info):
        boxes = [(L["x"], L["y"], L["w"], L["h"]) for b in pg.get("ocr", []) for L in b["lines"]]
        rgb = np.array(Image.open(imgs[pi]).convert("RGB")); k = 2.0
        sat = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)[:, :, 1]
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY); gray = cv2.createCLAHE(3.0, (8, 8)).apply(gray)
        for base in (sat, gray):
            b2 = cv2.resize(base, (int(base.shape[1] * k), int(base.shape[0] * k)), interpolation=cv2.INTER_CUBIC)
            for img in (b2, 255 - b2):
                d = pytesseract.image_to_data(Image.fromarray(img), lang="eng", output_type=pytesseract.Output.DICT, config="--psm 11")
                for i, t in enumerate(d["text"]):
                    t = t.strip()
                    if len(re.sub(r"[^A-Za-z]", "", t)) < 3 or float(d["conf"][i]) < 75: continue
                    x, y, w, h = [int(d[q][i] / k) for q in ("left", "top", "width", "height")]
                    if h < 6 or any(x < bx + bw and bx < x + w and y < by + bh and by < y + h for bx, by, bw, bh in boxes): continue
                    boxes.append((x, y, w, h)); found[f"w{pi + 1}-{len(found)}"] = dict(page=pi, text=t, x=x, y=y, w=w, h=h, conf=float(d["conf"][i]))
    json.dump(found, open(outp, "w"), indent=0); print(len(found), "possible missed words")
    return found

def missing_sheets(mpath, src, out, per=24, dense=False):
    """Each candidate shown in context (red box) so a person can accept or reject it. dense: 40 smaller cells per sheet."""
    found = json.load(open(mpath)); imgs = pages(src); os.makedirs(out, exist_ok=True)
    f = ImageFont.truetype(FONT, 17); W, cw, ch = (2400, 480, 130) if dense else (2400, 600, 190); per = 40 if dense else per
    cols = W // cw; n = 0; items_ = list(found.items())
    for s in range(0, len(items_), per):
        chunk = items_[s:s + per]; rows = (len(chunk) + cols - 1) // cols
        S = Image.new("RGB", (W, rows * (ch + 34)), "white"); d = ImageDraw.Draw(S)
        for i, (iid, it) in enumerate(chunk):
            im = Image.open(imgs[it["page"]]).convert("RGB"); cx, cy = it["x"] + it["w"] / 2, it["y"] + it["h"] / 2
            span = max(90, it["w"] * 5, it["h"] * 6); x0, y0 = max(0, int(cx - span)), max(0, int(cy - span * 0.32))
            c = im.crop((x0, y0, min(im.width, int(cx + span)), min(im.height, int(cy + span * 0.32)))).copy()
            ImageDraw.Draw(c).rectangle([it["x"] - x0 - 2, it["y"] - y0 - 2, it["x"] - x0 + it["w"] + 2, it["y"] - y0 + it["h"] + 2], outline=(255, 0, 0), width=2)
            k = min((cw - 10) / c.width, ch / c.height); c = c.resize((max(1, int(c.width * k)), max(1, int(c.height * k))))
            x = (i % cols) * cw; y = (i // cols) * (ch + 34)
            S.paste(c, (x + 4, y + 30)); d.text((x + 4, y + 4), f"{iid}  OCR: {it['text']}  ({it['conf']:.0f})", fill=(200, 0, 0), font=f)
        n += 1; S.save(os.path.join(out, f"missing-{n:02d}.jpg"), quality=88)
    print(f"{len(found)} candidates on {n} sheets in {out}")

def glyph_groups(rgb, it, ref_h=None):
    """Tight box(es) around the digits of a missed-number candidate, with background and ink colours.
    A candidate whose text has several tokens ("1  12") is split into one box per token when the ink
    falls into that many groups; otherwise one box."""
    import cv2
    H, W = rgb.shape[:2]; x0, y0 = max(0, it["x"] - 2), max(0, it["y"] - 2); x1, y1 = min(W, it["x"] + it["w"] + 2), min(H, it["y"] + it["h"] + 2)
    c = rgb[y0:y1, x0:x1]; ring = np.concatenate([c[0], c[-1], c[:, 0], c[:, -1]])
    bg = np.median(ring, axis=0); ink = (np.linalg.norm(c - bg, axis=2) > 55).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(ink, 8); comps = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if h >= 6 and w <= 1.6 * h and a >= 6 and a / (w * h) < 0.8 and (ref_h is None or 0.6 * ref_h <= h <= 1.45 * ref_h):
            comps.append((x, y, w, h))   # glyph-like: not a filled bar piece, about the height of this page's other numbers
    toks = it["text"].split()
    if comps:
        mh = np.median([q[3] for q in comps]); comps = sorted([q for q in comps if 0.7 * mh <= q[3] <= 1.35 * mh])
    if not comps:
        h = int(min(it["h"], 1.2 * ref_h)) if ref_h else it["h"]; comps = [(2, 2 + (it["h"] - h) // 2, it["w"], h)]
    groups = [[comps[0]]]
    for q in comps[1:]:
        p = groups[-1][-1]
        if q[0] - (p[0] + p[2]) > 0.45 * max(p[3], q[3]) and len(toks) > 1: groups.append([q])
        else: groups[-1].append(q)
    if len(groups) != len(toks): groups = [sum(groups, [])]; toks = [" ".join(toks)]
    out = []
    for gq, t in zip(groups, toks):
        gx0 = min(q[0] for q in gq); gy0 = min(q[1] for q in gq); gx1 = max(q[0] + q[2] for q in gq); gy1 = max(q[1] + q[3] for q in gq)
        X0, Y0, X1, Y1 = max(0, x0 + gx0 - 2), max(0, y0 + gy0 - 2), min(W, x0 + gx1 + 2), min(H, y0 + gy1 + 2); cc = rgb[Y0:Y1, X0:X1]
        gbg = np.median(np.concatenate([cc[0], cc[-1], cc[:, 0], cc[:, -1]]), axis=0)
        patch = c[gy0:gy1, gx0:gx1].reshape(-1, 3); d = np.linalg.norm(patch - gbg, axis=1)
        fg = patch[d >= max(np.percentile(d, 80), 1)]; fgc = np.median(fg, axis=0) if len(fg) else np.array([40, 40, 40])
        out.append(dict(text=t, x=x0 + gx0, y=y0 + gy0, w=gx1 - gx0, h=gy1 - gy0, bg=tuple(int(v) for v in gbg), fg=tuple(int(v) for v in fgc)))
    return out

def apply(pptx, jpath, cpath, outp, src=None):
    from pptx import Presentation
    from pptx.util import Emu, Pt
    from pptx.dml.color import RGBColor
    info = json.load(open(jpath))["info"]; corr = json.load(open(cpath)); prs = Presentation(pptx)
    miss = corr.pop("_missing", {}); done = 0
    for iid, new in corr.items():
        m = re.match(r"p(\d+)-b(\d+)-l(\d+)$", iid)
        if not m: continue
        pi, bi, li = int(m[1]) - 1, int(m[2]), int(m[3]); slide = prs.slides[pi]
        sh = next((s for s in slide.shapes if s.name == f"ocr b{bi}"), None)
        if sh is None: print("not found", iid); continue
        paras = sh.text_frame.paragraphs
        if li >= len(paras): print("no line", iid); continue
        runs = paras[li].runs
        if not runs: continue
        if isinstance(new, dict):   # {"sub": [regex, replacement]} edits part of the line
            new = re.sub(new["sub"][0], new["sub"][1], "".join(r.text for r in runs)).strip()
        old_words = "".join(r.text for r in runs).split(); new_words = new.split()
        if len(old_words) == len(new_words) and len(runs) > 1:   # keep per-word colours: rewrite run by run
            k = 0
            for r in runs:
                n_ = len(r.text.split()); lead = " " if r.text.startswith(" ") else ""
                r.text = lead + " ".join(new_words[k:k + n_]); k += n_
        else:
            runs[0].text = new
            for r in runs[1:]: r._r.getparent().remove(r._r)
        done += 1
    if miss and src:
        from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
        imgs = pages(src); sw, sh_ = prs.slide_width, prs.slide_height
        for iid, it in miss.items():
            im = Image.open(imgs[it["page"]]); rgb = np.array(im.convert("RGB")).astype(int)
            k = min(sw / im.width, sh_ / im.height); left, top = (sw - im.width * k) / 2, (sh_ - im.height * k) / 2
            hs = [L["h"] for b in info[it["page"]].get("ocr", []) for L in b["lines"] if re.fullmatch(r"[\d.,%~+\-\s]+", L["text"].strip() or "x")]
            for g in glyph_groups(rgb, it, float(np.median(hs)) if hs else None):
                # an opaque patch in the local background colour hides any traced copy of the same digits underneath
                tb = prs.slides[it["page"]].shapes.add_textbox(Emu(int(left + g["x"] * k)), Emu(int(top + g["y"] * k)), Emu(int(g["w"] * k)), Emu(int(g["h"] * k)))
                tb.name = f"ocr {iid}"; tf = tb.text_frame; tf.word_wrap = False; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
                for a in ("margin_left", "margin_right", "margin_top", "margin_bottom"): setattr(tf, a, 0)
                tb.fill.solid(); tb.fill.fore_color.rgb = RGBColor(*g["bg"])
                p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
                r = p.add_run(); r.text = g["text"]; r.font.name = "Arial"
                r.font.size = Pt(max(5, round(g["h"] * k / 12700 / 0.72 * 2) / 2)); r.font.color.rgb = RGBColor(*g["fg"])
            done += 1
    prs.save(outp); print(done, "corrections applied ->", outp)

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(1)
    if a[0] == "sheets": sheets(a[1], a[2], a[3], "--all" in a, mode="suspect" if "--suspect" in a else None)
    elif a[0] == "missing": missing(a[1], a[2], a[3])
    elif a[0] == "missing-words": missing_words(a[1], a[2], a[3])
    elif a[0] == "missing-sheets": missing_sheets(a[1], a[2], a[3], dense="--dense" in a)
    elif a[0] == "apply": apply(a[1], a[2], a[3], a[4], a[5] if len(a) > 5 else None)
    else: print(__doc__)
