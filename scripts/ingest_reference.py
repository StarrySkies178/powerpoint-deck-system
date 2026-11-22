"""ingest_reference.py: add a NEW reference deck to the system (same treatment as the first 11).

Usage (from the Powerpoint folder):
  python3 scripts/ingest_reference.py <file.pptx|.ppt|.potx|.pdf|image|folder-of-images> <key> ["Readable name"]

What it does, in order:
  0. PDFs, screenshots and scans are first TURNED INTO EDITABLE SLIDES (Generators/rebuild_slides.py):
     vector PDF pages -> LibreOffice PDF import (real shapes + text); image/scanned pages -> OCR text
     (English + Chinese) + colour regions traced into rectangles/ovals/freeforms, photos kept as pictures.
     Saved as Templates/<name>-rebuilt.pptx (the original is kept beside it) with a side-by-side
     review sheet and a similarity score per page in review/<key>/.
  1. Converts .ppt/.potx to .pptx if needed (LibreOffice) and copies the original into Templates/.
  2. Object store: saves every slide (and each slide's separate diagrams as parts, Generators/components.py)'s drawing as editable vector objects with theme-role colours
     (Objects/store/<key>.jsonl.gz, media into media.zip) and rebuilds Objects/store/index.json.
  3. Slide index: appends every slide's title to Style/slide-index.md.
  4. Pattern map: classifies each slide against Style/patterns.json (keywords on title + text) and
     appends to Style/slide-map.csv, marked "auto" until reviewed by eye.
  5. Review sheets: renders contact sheets (every slide, numbered) to review/<key>/ for the visual
     pass that Claude MUST do next (maintenance/new-reference.md, step 2).
  6. Prints a summary: counts, unclassified slides, colours/fonts found.

Never overwrites an existing key (pass a new key, or delete the old one first with approval).
"""
import csv, glob, gzip, json, os, re, shutil, subprocess, sys, tempfile, zipfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O  # noqa: E402

def soffice(args):
    for exe in ("soffice", "libreoffice", "/Applications/LibreOffice.app/Contents/MacOS/soffice"):
        if shutil.which(exe) or os.path.exists(exe):
            return subprocess.run([exe, "--headless", *args], capture_output=True, timeout=900)
    raise SystemExit("LibreOffice not found: needed to convert .ppt and render review sheets")

def to_pptx(src, work):
    ext = os.path.splitext(src)[1].lower()
    if ext == ".pptx": return src
    if ext == ".potx":
        dst = os.path.join(work, "ref.pptx"); shutil.copy(src, dst)
        z = zipfile.ZipFile(dst); files = {n: z.read(n) for n in z.namelist()}; z.close()
        files["[Content_Types].xml"] = files["[Content_Types].xml"].replace(b"presentationml.template.main+xml", b"presentationml.presentation.main+xml")
        with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as zo:
            for n, d in files.items(): zo.writestr(n, d)
        return dst
    soffice(["--convert-to", "pptx", "--outdir", work, src])
    out = glob.glob(os.path.join(work, "*.pptx"))
    if not out: raise SystemExit("conversion to .pptx failed")
    return out[0]

def titles(pptx):
    from pptx import Presentation
    p = Presentation(pptx); out = []
    for i, s in enumerate(p.slides, 1):
        t = ""
        if s.shapes.title is not None and s.shapes.title.has_text_frame: t = s.shapes.title.text_frame.text
        if not t.strip():
            cands = [sh.text_frame.text for sh in s.shapes if sh.has_text_frame and sh.text_frame.text.strip()]
            t = cands[0] if cands else ""
        body = " ".join(sh.text_frame.text for sh in s.shapes if sh.has_text_frame)[:400]
        out.append((i, re.sub(r"\s+", " ", t).strip()[:90], re.sub(r"\s+", " ", body)))
    return out

def classify(text, patterns):
    t = text.lower(); best, bs = "", 0
    for p in patterns:
        s = 0
        for k in (x.strip().lower() for x in p["keywords"].split("|") if x.strip()):
            pat = (r"\b" + re.escape(k) + r"\b") if len(k) <= 5 else (r"\b" + re.escape(k))
            if re.search(pat, t): s += len(k)
        if s > bs: best, bs = p["id"], s
    return best if bs >= 3 else "unclassified"

def contact_sheets(pptx, outdir, cols=8, rows=6, tw=260):
    from PIL import Image, ImageDraw
    os.makedirs(outdir, exist_ok=True); tmp = tempfile.mkdtemp()
    soffice(["--convert-to", "pdf", "--outdir", tmp, pptx])
    pdf = glob.glob(os.path.join(tmp, "*.pdf"))
    if not pdf: return []
    subprocess.run(["pdftoppm", "-jpeg", "-r", "36", pdf[0], os.path.join(tmp, "p")], check=False)
    files = sorted(glob.glob(os.path.join(tmp, "p-*.jpg")), key=lambda f: int(f.rsplit("-", 1)[1][:-4]))
    outs, per = [], cols * rows
    for b in range(0, len(files), per):
        ims = []
        for f in files[b:b + per]:
            im = Image.open(f); ims.append(im.resize((tw, int(im.height * tw / im.width))))
        th = max(i.height for i in ims)
        S = Image.new("RGB", (cols * (tw + 6), ((len(ims) + cols - 1) // cols) * (th + 6)), "#888"); d = ImageDraw.Draw(S)
        for k, im in enumerate(ims):
            x, y = (k % cols) * (tw + 6), (k // cols) * (th + 6); S.paste(im, (x, y))
            d.rectangle([x, y, x + 38, y + 20], fill="red"); d.text((x + 3, y + 3), str(b + k + 1), fill="white")
        o = os.path.join(outdir, f"sheet-{b // per + 1:02d}.jpg"); S.save(o, quality=70); outs.append(o)
    return outs

def main():
    if len(sys.argv) < 3: print(__doc__); sys.exit(1)
    src, key = sys.argv[1], re.sub(r"[^a-z0-9]+", "-", sys.argv[2].lower()).strip("-")
    name = sys.argv[3] if len(sys.argv) > 3 else os.path.splitext(os.path.basename(src))[0]
    store = os.path.join(ROOT, "Objects", "store")
    if os.path.exists(os.path.join(store, f"{key}.jsonl.gz")): raise SystemExit(f"key '{key}' already exists: choose another")
    work = tempfile.mkdtemp()
    tdir = os.path.join(ROOT, "Templates"); os.makedirs(tdir, exist_ok=True)
    base = re.sub(r"[^A-Za-z0-9]+", "-", name).strip("-")
    src = os.path.abspath(src.rstrip("/")); ext = os.path.splitext(src)[1].lower()
    rebuilt = None
    if os.path.isdir(src) or ext in (".pdf", ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff", ".gif"):
        # 0 no editable shapes in the source: turn every page/screenshot into an editable slide first
        import rebuild_slides as RB
        orig = os.path.join(tdir, base + ("-source" if os.path.isdir(src) else "-original" + ext))
        if not os.path.exists(orig): (shutil.copytree if os.path.isdir(src) else shutil.copy)(src, orig)
        rdir = os.path.join(ROOT, "review", key); os.makedirs(rdir, exist_ok=True)
        tmp_out = os.path.join(work, base + "-rebuilt.pptx")
        rebuilt = RB.rebuild(src, tmp_out)
        tname = base + "-rebuilt.pptx"; shutil.copy(tmp_out, os.path.join(tdir, tname))
        shutil.move(rebuilt["review_sheet"], os.path.join(rdir, "rebuild-review.jpg")); rebuilt["review_sheet"] = os.path.join(rdir, "rebuild-review.jpg")
        pptx = os.path.join(tdir, tname)
    else:
        pptx = to_pptx(src, work)
        # 1 original into Templates/
        tname = base + ext
        if not os.path.exists(os.path.join(tdir, tname)): shutil.copy(src, os.path.join(tdir, tname))
    # 3/4 titles + classification
    pats = json.load(open(os.path.join(ROOT, "Style", "patterns.json")))["patterns"]
    T = titles(pptx)
    meta = {}
    for i, t, body in T:
        meta[i] = dict(title=t, pattern=classify(t + " " + body, pats), note="auto")
    # 2 object store (media to a temp folder, then merged into media.zip)
    mtmp = tempfile.mkdtemp()
    objs = O.extract(pptx, key, mtmp, meta)
    shutil.move(os.path.join(mtmp, f"{key}.jsonl.gz"), os.path.join(store, f"{key}.jsonl.gz"))
    mz = os.path.join(store, "media.zip")
    with zipfile.ZipFile(mz, "a", zipfile.ZIP_STORED) as z:
        have = set(z.namelist())
        for f in glob.glob(os.path.join(mtmp, "media", "*")):
            if os.path.basename(f) not in have: z.write(f, os.path.basename(f))
    idx_path = os.path.join(store, "index.json"); idx = json.load(open(idx_path))
    idx = [o for o in idx if o["deck"] != key]
    for o in objs: idx.append({**{x: o[x] for x in ("id", "deck", "slide", "pattern", "title", "note", "n_shapes", "text", "roles_used", "complete", "bbox", "src_slide", "slots")}, "charts": len(o["charts"])})
    # single diagrams: split each slide into its separate diagrams (parts), so they can be reused on their own
    import components as CP
    for prt in CP.split_deck(store, key):
        idx.append({k: prt.get(k) for k in ("id", "deck", "slide", "title", "n_shapes", "text", "roles_used", "complete", "bbox", "src_slide", "part_of", "part", "kind")}
                   | {"pattern": prt["kind"], "note": f"part {prt['part']} of slide {prt['slide']} (auto-split; check by eye)", "slots": 0, "charts": 0})
    json.dump(idx, open(idx_path, "w"), ensure_ascii=False)
    with open(os.path.join(ROOT, "Style", "slide-index.md"), "a", encoding="utf-8") as f:
        f.write(f"\n## {name}  ({tname})\n\n" + "\n".join(f"- {i}: {t or '(graphic, no title)'}" for i, t, _ in T) + "\n")
    with open(os.path.join(ROOT, "Style", "slide-map.csv"), "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        for i, t, _ in T: w.writerow([os.path.splitext(tname)[0], i, meta[i]["pattern"], t, "auto (review by eye)"])
    # pictures and embedded charts -> editable shapes (always)
    try:
        import vectorize as VZ
        ids = {o["slide"]: o["id"] for o in objs}
        vec = VZ.route_a(src if not os.path.isdir(src) else pptx, pptx, key, ids) if not rebuilt else []
        vec += VZ.route_b(VZ.graphic_pictures(store, key, os.path.join(store, "media.zip")), key)
        VZ.save(store, key, vec); idx = json.load(open(idx_path))
    except Exception as e:   # missing tools (LibreOffice, Tesseract, scikit-learn): the audit will fail check 10 until this is run
        vec = []; print("vectorize did not run:", e)
    # registry for the audit gate (scripts/audit_reference.py fails until the study file is written)
    reg_p = os.path.join(ROOT, "Style", "refs", "references.json"); reg = json.load(open(reg_p, encoding="utf-8"))
    if not any(r["key"] == key for r in reg["references"]):
        reg["references"].append({"key": key, "name": os.path.splitext(tname)[0], "template": tname, "study": [f"Style/refs/{key}.md"], **({"rebuilt_from": "pdf/images"} if rebuilt else {})})
        json.dump(reg, open(reg_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    # 5 review sheets
    sheets = contact_sheets(pptx, os.path.join(ROOT, "review", key))
    # 6 summary
    unc = [i for i, *_ in T if meta[i]["pattern"] == "unclassified"]
    print(json.dumps(dict(key=key, slides=len(T), objects=len(objs), media=sum(len(o["media"]) for o in objs),
                          unclassified=len(unc), vectorised=len(vec), unclassified_slides=unc[:60], review_sheets=sheets,
                          rebuilt_from_pdf_or_images=(dict(file=tname, similarity=rebuilt["similarity"], sheet=rebuilt["review_sheet"],
                                                          low_pages=[i + 1 for i, v in enumerate(rebuilt["similarity"]) if v is not None and v < 0.8]) if rebuilt else None),
                          next=f"Follow maintenance/new-reference.md from step 2; finish with: python3 scripts/audit_reference.py {key} (must be ALL PASS)"), indent=1))

if __name__ == "__main__":
    main()
