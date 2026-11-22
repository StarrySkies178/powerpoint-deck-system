"""vectorize.py — turn pictures and embedded-chart previews into editable shapes, saved as store objects.

Two routes, both ending as normal store objects (theme colours, theme fonts, fillable text) that every objstore
operation works on (place, resize, recolour, swap_geom, transform, ungroup/explode, combine, set_texts):
  A. OLE charts (think-cell, MS Graph, Excel): the original deck is rendered to PDF by LibreOffice, the vector
     page is imported back as shapes, and the shapes inside each OLE frame become the object.  -> kind 'chart (vectorised from embedded chart)'
  B. Graphic pictures (charts, diagrams, icons pasted as PNG/JPG): traced with rebuild_slides.rebuild_raster
     (OCR text + colour regions -> rect/roundRect/ellipse/line/freeform). Photos are left as pictures. -> kind 'vectorised picture'
Ids: <slide object id>c<k> (route A) and <slide object id>v<k> (route B); 'vector_of' records the source.
"""
import copy, glob, gzip, io, json, os, re, shutil, subprocess, sys, tempfile, zipfile
import numpy as np
from PIL import Image
from lxml import etree
sys.path.insert(0, os.path.dirname(__file__))
import objstore as O
import rebuild_slides as RB
from pptx import Presentation
from pptx.util import Emu
EMU = 914400
NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main", "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}

def _soffice(args, timeout=1800):
    return RB.soffice(args, timeout)

def _slide_order(z):
    pres = etree.fromstring(z.read("ppt/presentation.xml"))
    rels = {r.get("Id"): r.get("Target") for r in etree.fromstring(z.read("ppt/_rels/presentation.xml.rels"))}
    sz = pres.find("p:sldSz", NS)
    return ["ppt/" + rels[s.get("{%s}id" % NS["r"])] for s in pres.find("p:sldIdLst", NS)], int(sz.get("cx")), int(sz.get("cy"))

def ole_frames(pptx):
    """[(slide_no, (x,y,w,h) EMU)] for every embedded object frame."""
    z = zipfile.ZipFile(pptx); order, SW, SH = _slide_order(z); out = []
    for i, s in enumerate(order, 1):
        t = etree.fromstring(z.read(s))
        for gf in t.iter("{%s}graphicFrame" % NS["p"]):
            if gf.find(".//p:oleObj", NS) is None: continue
            xf = gf.find("p:xfrm", NS); o, e = xf.find("a:off", NS), xf.find("a:ext", NS)
            x, y, w, h = int(o.get("x")), int(o.get("y")), int(e.get("cx")), int(e.get("cy"))
            if w * h > 0.25 * EMU * EMU: out.append((i, (max(0, x), max(0, y), min(w, SW - max(0, x)), min(h, SH - max(0, y)))))
    return out, SW, SH

def _no_frame(*a, **k): return set()

def _extract_temp(tmp_pptx, key, meta):
    """Run objstore.extract on a temp deck (no frame/footer/title filtering)."""
    saved = O._frame_keys; O._frame_keys = _no_frame
    try:
        d = tempfile.mkdtemp(); objs = O.extract(tmp_pptx, key, d, meta)
    finally:
        O._frame_keys = saved
    return objs, d

def _temp_deck(W=13.333, H=7.5):
    prs = Presentation(); prs.slide_width = Emu(int(W * EMU)); prs.slide_height = Emu(int(H * EMU)); return prs
BOX = (0.4 * EMU, 1.4 * EMU, 12.5 * EMU, 5.3 * EMU)   # where content is placed on temp slides (clear of title/footer zones)

def route_a(original, converted, deck_key, slide_ids):
    """original: the source deck (.ppt/.pptx) for a faithful render; converted: the .pptx used for frame positions."""
    frames, SW, SH = ole_frames(converted)
    if not frames: return []
    work = tempfile.mkdtemp(); src = os.path.join(work, "src" + os.path.splitext(original)[1]); shutil.copy(original, src)
    _soffice(["--convert-to", "pdf", "--outdir", work, src]); pdf = os.path.join(work, "src.pdf")
    pages = sorted({p for p, _ in frames})
    subs = []
    for p in pages:
        subprocess.run(["pdfseparate", "-f", str(p), "-l", str(p), pdf, os.path.join(work, f"pg-{p:04d}.pdf")], check=True)
    subprocess.run(["pdfunite", *[os.path.join(work, f"pg-{p:04d}.pdf") for p in pages], os.path.join(work, "sub.pdf")], check=True)
    _soffice(["--infilter=impress_pdf_import", "--convert-to", "pptx", "--outdir", work, os.path.join(work, "sub.pdf")])
    imp = Presentation(os.path.join(work, "sub.pptx")); k = imp.slide_width / SW
    out_prs = _temp_deck(); meta = {}; made = []
    for pi, p in enumerate(pages):
        isl = imp.slides[pi]
        for fi, (_, (x, y, w, h)) in enumerate([f for f in frames if f[0] == p]):
            fx, fy, fw, fh = x * k, y * k, w * k, h * k; tol = 0.03 * EMU
            inside = [sh for sh in isl.shapes if sh.left is not None and sh.width is not None and
                      sh.left >= fx - tol and sh.top >= fy - tol and sh.left + sh.width <= fx + fw + tol and sh.top + sh.height <= fy + fh + tol]
            if len(inside) < 2: continue
            s = out_prs.slides.add_slide(out_prs.slide_layouts[6]); tree = s.shapes._spTree
            sc = min(BOX[2] / fw, BOX[3] / fh); ox = BOX[0] + (BOX[2] - fw * sc) / 2; oy = BOX[1] + (BOX[3] - fh * sc) / 2
            grp = etree.SubElement(tree, "{%s}grpSp" % NS["p"])
            nv = etree.SubElement(grp, "{%s}nvGrpSpPr" % NS["p"]); c = etree.SubElement(nv, "{%s}cNvPr" % NS["p"]); c.set("id", str(1000 + fi)); c.set("name", "Chart (vectorised)")
            etree.SubElement(nv, "{%s}cNvGrpSpPr" % NS["p"]); etree.SubElement(nv, "{%s}nvPr" % NS["p"])
            gp = etree.SubElement(grp, "{%s}grpSpPr" % NS["p"]); xf = etree.SubElement(gp, "{%s}xfrm" % NS["a"])
            for tag, a_, b_ in (("off", ox, oy), ("ext", fw * sc, fh * sc), ("chOff", fx, fy), ("chExt", fw, fh)):
                e = etree.SubElement(xf, "{%s}%s" % (NS["a"], tag)); e.set("x" if tag in ("off", "chOff") else "cx", str(int(a_))); e.set("y" if tag in ("off", "chOff") else "cy", str(int(b_)))
            for sh in inside: grp.append(copy.deepcopy(sh._element))
            src_id = slide_ids.get(p, f"{deck_key}-{p:03d}")
            meta[len(out_prs.slides._sldIdLst)] = dict(title=f"chart from slide {p}", pattern="chart", note=f"chart (vectorised from embedded chart) on slide {p}")
            made.append((len(out_prs.slides._sldIdLst), p, src_id, fi + 1))
    if not made: return []
    tmp = os.path.join(work, "vec.pptx"); out_prs.save(tmp)
    objs, mdir = _extract_temp(tmp, deck_key + "__a", meta)
    res = []
    for o in objs:
        m = next((m for m in made if m[0] == o["slide"]), None)
        if not m: continue
        _, p, src_id, fi = m
        o.update(id=f"{src_id}c{fi}", deck=deck_key, slide=p, kind="chart (vectorised from embedded chart)", vector_of=f"OLE frame {fi} on slide {p}", pattern="chart",
                 note=f"chart on slide {p}, vectorised from the embedded chart's vector preview (route A)", media_dir=mdir)
        res.append(o)
    return res

def flat(img):
    """Transparent areas -> white (a transparent PNG would otherwise trace as a black box)."""
    if img.mode in ("RGBA", "LA", "P"):
        im = img.convert("RGBA"); bg = Image.new("RGB", im.size, "white"); bg.paste(im, mask=im.split()[3]); return bg
    return img.convert("RGB")

def is_graphic(img, min_cover=0.9):
    """Flat-colour artwork (chart, diagram, icon) rather than a photo or a soft shadow."""
    g = np.asarray(flat(img).convert("L").resize((min(300, img.width), max(1, int(img.height * min(300, img.width) / img.width)))), dtype=float)
    if g.max() - g.min() < 70: return False                       # soft shadow / glow / blank
    dx = np.abs(np.diff(g, axis=1)); smooth = (dx < 4).mean()
    if smooth < 0.7: return False                                   # textured: photo or screenshot
    a = np.asarray(flat(img).resize((min(400, img.width), max(1, int(img.height * min(400, img.width) / img.width)))))
    q = (a // 24).reshape(-1, 3); _, c = np.unique(q, axis=0, return_counts=True); c = np.sort(c)[::-1]
    return c[:16].sum() / c.sum() >= min_cover

def route_b(items, deck_key):
    """items: [(src_obj_id, slide, k, PIL.Image, w_in, h_in)] graphic pictures -> traced objects."""
    if not items: return []
    prs = _temp_deck(); meta = {}; made = []
    for src_id, slide, k_, img, w, h in items:
        if max(img.size) < 1200: k2 = 1200 / max(img.size); img = img.resize((int(img.width * k2), int(img.height * k2)), Image.LANCZOS)
        s = prs.slides.add_slide(prs.slide_layouts[6]); ar = img.width / img.height
        bw, bh = BOX[2], BOX[3]; fw, fh = (bw, bw / ar) if ar > bw / bh else (bh * ar, bh)
        try:
            RB.rebuild_raster(s, np.asarray(flat(img)), int(fw), int(fh), "eng+chi_sim", int(BOX[0] + (bw - fw) / 2), int(BOX[1] + (bh - fh) / 2))
        except Exception as e:
            print("trace failed", src_id, e); continue
        n = len(prs.slides._sldIdLst); meta[n] = dict(title=f"picture from slide {slide}", pattern="", note="vectorised picture")
        made.append((n, src_id, slide, k_))
    work = tempfile.mkdtemp(); tmp = os.path.join(work, "vecb.pptx"); prs.save(tmp)
    objs, mdir = _extract_temp(tmp, deck_key + "__b", meta); res = []
    for o in objs:
        m = next((m for m in made if m[0] == o["slide"]), None)
        if not m: continue
        _, src_id, slide, k_ = m
        o.update(id=f"{src_id}v{k_}", deck=deck_key, slide=slide, kind="vectorised picture", vector_of=f"picture {k_} of {src_id}", pattern="",
                 note=f"picture {k_} on slide {slide}, traced into shapes and text (route B)", media_dir=mdir)
        res.append(o)
    return res

def graphic_pictures(store_dir, deck, media_zip, min_area_in2=1.0):
    """Graphic (non-photo) pictures used in a deck's whole-slide objects."""
    z = zipfile.ZipFile(media_zip); out = []
    for l in gzip.open(os.path.join(store_dir, f"{deck}.jsonl.gz"), "rt", encoding="utf-8"):
        o = json.loads(l)
        if o.get("part_of") or o.get("vector_of"): continue
        for k_, m in enumerate(re.finditer(r"<p:pic>.*?</p:pic>", o["xml"], re.S), 1):
            x = m.group(0); mm = re.search(r"MEDIA:([0-9a-f]+\.(png|jpe?g|gif|bmp))", x); ext = re.search(r'<a:ext cx="(\d+)" cy="(\d+)"', x)
            if not mm or not ext: continue
            w, h = int(ext.group(1)) / EMU, int(ext.group(2)) / EMU
            if w * h < min_area_in2: continue
            try: img = Image.open(io.BytesIO(z.read(mm.group(1)))); img.load()
            except Exception: continue
            if min(img.size) < 60 or not is_graphic(img): continue
            out.append((o["id"], o["slide"], k_, img, w, h))
    return out

def save(store_dir, deck, objs):
    """Append vectorised objects to the deck file + index, media into media.zip (idempotent per id)."""
    fp = os.path.join(store_dir, f"{deck}.jsonl.gz")
    cur = [json.loads(l) for l in gzip.open(fp, "rt", encoding="utf-8")]
    ids = {o["id"] for o in objs}; cur = [o for o in cur if o["id"] not in ids]
    mz = os.path.join(store_dir, "media.zip")
    with zipfile.ZipFile(mz, "a", zipfile.ZIP_STORED) as z:
        have = set(z.namelist())
        for o in objs:
            for f in glob.glob(os.path.join(o.get("media_dir", ""), "media", "*")):
                if os.path.basename(f) not in have: z.write(f, os.path.basename(f)); have.add(os.path.basename(f))
    for o in objs: o.pop("media_dir", None)
    with gzip.open(fp, "wt", encoding="utf-8") as f:
        for o in cur + objs: f.write(json.dumps(o, ensure_ascii=False) + "\n")
    ip = os.path.join(store_dir, "index.json"); idx = [o for o in json.load(open(ip)) if o["id"] not in ids]
    for o in objs:
        idx.append({k: o.get(k) for k in ("id", "deck", "slide", "title", "n_shapes", "text", "roles_used", "complete", "bbox", "src_slide", "kind", "vector_of", "pattern", "note")} | {"slots": o.get("slots", 0), "charts": 0})
    json.dump(idx, open(ip, "w"), ensure_ascii=False); O._CACHE.clear()

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument("store"); ap.add_argument("deck"); ap.add_argument("--original"); ap.add_argument("--converted"); ap.add_argument("--no-b", action="store_true"); ap.add_argument("--no-a", action="store_true")
    a = ap.parse_args()
    ids = {}
    for l in gzip.open(os.path.join(a.store, f"{a.deck}.jsonl.gz"), "rt", encoding="utf-8"):
        o = json.loads(l)
        if not o.get("part_of") and not o.get("vector_of"): ids[o["slide"]] = o["id"]
    A = route_a(a.original, a.converted or a.original, a.deck, ids) if a.original and not a.no_a else []
    B = [] if a.no_b else route_b(graphic_pictures(a.store, a.deck, os.path.join(a.store, "media.zip")), a.deck)
    save(a.store, a.deck, A + B)
    print(json.dumps(dict(deck=a.deck, charts_vectorised=len(A), pictures_vectorised=len(B))))
