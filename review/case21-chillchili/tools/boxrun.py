"""boxrun.py: apply boxchart specs to a deck and make a review sheet (original | native) for each chart.

python3 boxrun.py key deck_in.pptx specs.json deck_out.pptx [sheet.png]
"""
import sys, json, glob, subprocess, tempfile, shutil, os, copy
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, "/tmp/nr/nat")
import autonat, nativize, tables as T
from pptx import Presentation

def only_slides(deck, keep, out):
    prs = Presentation(deck)
    lst = prs.slides._sldIdLst; ids = list(lst)
    for i, s in enumerate(ids, 1):
        if i not in keep: lst.remove(s)
    prs.save(out)

def punch(slide, box, px):
    """a large picture under the chart (the slide baked into one image): paint the chart's box with the
    colour around it, in the picture's own pixels (same size, lossless), so only the native chart shows"""
    import io
    from PIL import Image as I
    x0, y0, x1, y1 = box; n = 0
    for sh in list(slide.shapes):
        if sh.shape_type != 13: continue
        sx0, sy0 = sh.left / px, sh.top / px; sx1, sy1 = sx0 + sh.width / px, sy0 + sh.height / px
        ix = max(0, min(sx1, x1) - max(sx0, x0)); iy = max(0, min(sy1, y1) - max(sy0, y0))
        if ix * iy < 0.5 * (x1 - x0) * (y1 - y0): continue                  # not under the chart
        if (sx1 - sx0) * (sy1 - sy0) < 2 * (x1 - x0) * (y1 - y0): continue  # small pictures are cleared, not punched
        blob = sh.image.blob; im = I.open(io.BytesIO(blob)); mode = im.mode; im = im.convert("RGBA" if "A" in mode else "RGB")
        cl = getattr(sh, "crop_left", 0) or 0; ct = getattr(sh, "crop_top", 0) or 0; cr = getattr(sh, "crop_right", 0) or 0; cb = getattr(sh, "crop_bottom", 0) or 0
        W, H = im.size; vw = W * (1 - cl - cr); vh = H * (1 - ct - cb)
        fx = lambda x: int(round(W * cl + (x - sx0) / (sx1 - sx0) * vw)); fy = lambda y: int(round(H * ct + (y - sy0) / (sy1 - sy0) * vh))
        a, b_, c, d = max(0, fx(x0)), max(0, fy(y0)), min(W, fx(x1)), min(H, fy(y1))
        arr = np.array(im)
        ring = np.concatenate([arr[max(0, b_ - 3):b_, a:c].reshape(-1, arr.shape[2]), arr[d:d + 3, a:c].reshape(-1, arr.shape[2]),
                               arr[b_:d, max(0, a - 3):a].reshape(-1, arr.shape[2]), arr[b_:d, c:c + 3].reshape(-1, arr.shape[2])])
        col = np.median(ring, axis=0) if len(ring) else np.array([255] * arr.shape[2])
        arr[b_:d, a:c] = col.astype(arr.dtype)
        out = io.BytesIO(); I.fromarray(arr).save(out, "PNG")
        img_part = sh.part.related_part(sh._element.blipFill.blip.rEmbed) if hasattr(sh._element, "blipFill") else None
        from pptx.parts.image import ImagePart
        rid = sh._element.xpath("./p:blipFill/a:blip/@r:embed")[0]
        old = sh.part.related_part(rid)
        new_part, new_rid = sh.part.get_or_add_image_part(io.BytesIO(out.getvalue()))
        sh._element.xpath("./p:blipFill/a:blip")[0].set("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed", new_rid)
        n += 1
    return n

def apply_all(deck_in, out, spec, W0):
    prs = Presentation(deck_in)
    for sp in spec.get("charts", []):
        px = prs.slide_width / sp.get("pw", W0)
        s = prs.slides[sp["slide"] - 1]
        c = {k: v for k, v in sp.items() if not k.startswith("_")}
        boxes = c["clear"] if isinstance(c["clear"][0], list) else [c["clear"]]
        for bx in boxes + c.get("extra_clear", []):
            nativize.clear_region(s, bx, px, c.get("keep", []), c.get("keep_colors", []), c.get("strip_lines", []), c.get("remove_pictures", False), c.get("keep_max", 1e12))
        for bx in c.get("punch", []): punch(s, bx, px)
        nativize.add_chart(s, c, px)
        for o in c.get("overlays", []): nativize.add_overlay(s, o, px)
    for tb in spec.get("tables", []):
        px = prs.slide_width / tb.get("pw", W0)
        s = prs.slides[tb["slide"] - 1]
        for bx in tb["clear"]:
            nativize.clear_region(s, bx, px, tb.get("keep", []), tb.get("keep_colors", []), (), tb.get("remove_pictures", False))
        T.build(s, tb, px)
    prs.save(out)

def sheet(key, spec, deck_out, W0, out_png):
    slides = sorted({c["slide"] for c in spec.get("charts", []) + spec.get("tables", [])})
    D = tempfile.mkdtemp(); only_slides(deck_out, set(slides), f"{D}/d.pptx")
    subprocess.run(["python3", autonat.SOFF, "--headless", "--convert-to", "pdf", "--outdir", D, f"{D}/d.pptx"], capture_output=True, timeout=1500)
    subprocess.run(["pdftoppm", "-r", "150", "-png", f"{D}/d.pdf", f"{D}/p"], check=True)
    R = sorted(glob.glob(f"{D}/p-*.png")); rmap = dict(zip(slides, R))
    pages = sorted(glob.glob(f"/tmp/nr/img/{key}/pg-*.png"))
    rows = []
    for c in spec.get("charts", []) + spec.get("tables", []):
        box = c.get("frame") or (c["clear"] if not isinstance(c["clear"][0], list) else c["clear"][0])
        x0, y0, x1, y1 = [int(v) for v in box]; x0 -= 10; y0 -= 10; x1 += 10; y1 += 10
        a = Image.open(pages[c["slide"] - 1]).convert("RGB").crop((x0, y0, x1, y1))
        r = Image.open(rmap[c["slide"]]).convert("RGB"); s = r.size[0] / c.get("pw", W0)
        b = r.crop((int(x0 * s), int(y0 * s), int(x1 * s), int(y1 * s))).resize(a.size)
        w, h = a.size; im = Image.new("RGB", (2 * w + 10, h + 20), "white"); im.paste(a, (0, 20)); im.paste(b, (w + 10, 20))
        ImageDraw.Draw(im).text((4, 4), f'slide {c["slide"]}  {c.get("name","")}  left original, right native', fill=(200, 0, 0))
        rows.append(im)
    W = max(i.size[0] for i in rows); H = sum(i.size[1] + 8 for i in rows)
    sh = Image.new("RGB", (W, H), (235, 235, 235)); y = 0
    for i in rows: sh.paste(i, (0, y)); y += i.size[1] + 8
    sh.save(out_png); shutil.rmtree(D)
    return out_png

if __name__ == "__main__":
    key, deck_in, spec_p, deck_out = sys.argv[1:5]
    spec = json.load(open(spec_p)); W0 = spec["page_w"]
    apply_all(deck_in, deck_out, spec, W0)
    if len(sys.argv) > 5: print(sheet(key, spec, deck_out, W0, sys.argv[5]))
