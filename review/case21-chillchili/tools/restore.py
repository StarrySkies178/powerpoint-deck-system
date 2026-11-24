"""restore.py: put the second-pass decks back into a copy of the object store.

python3 restore.py STORE_COPY key deck.pptx [key deck.pptx ...] [--layouts layouts.pptx]
- slide objects (K-NNN) of slides the store already keeps are re-extracted from the new deck; title, pattern
  and review note are kept, the note says "second pass (v2.54+)";
- parts (K-NNNpM) and vectorised pictures (K-NNNvM) stay as they were;
- every native chart and native table on a kept slide becomes its own part K-NNNcM / K-NNNtM;
- --layouts adds the clean layout objects as deck 'layouts-2021-2024';
- new media go into STORE_COPY/media.zip (only files not there yet) and are listed in new-media.txt;
- index.json is rebuilt for the touched decks.
"""
import sys, os, gzip, json, copy, tempfile, zipfile, glob, shutil
sys.path.insert(0, "/home/claude/powerpoint-deck-system/Generators")
import objstore as O
from lxml import etree

A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"; P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
CH = "{http://schemas.openxmlformats.org/drawingml/2006/chart}chart"
IDX_KEYS = ("id", "deck", "slide", "pattern", "title", "note", "n_shapes", "text", "roles_used", "complete", "bbox", "src_slide", "slots")

def bbox(el):
    xf = el.find(P + "xfrm") if el.tag == P + "graphicFrame" else el.find(".//" + A + "xfrm")
    o, e = xf.find(A + "off"), xf.find(A + "ext")
    return [int(o.get("x")), int(o.get("y")), int(e.get("cx")), int(e.get("cy"))]

def native_parts(rec):
    f = etree.fromstring(rec["xml"].encode("utf-8")); out = []; nc = nt = 0
    for el in f:
        if el.tag != P + "graphicFrame": continue
        cr = el.find(".//" + CH); tb = el.find(".//" + A + "tbl")
        if cr is None and tb is None: continue
        g = etree.Element(P + "spTree", nsmap=f.nsmap); g.append(copy.deepcopy(el))
        p = {k: copy.deepcopy(v) for k, v in rec.items()}
        name = (el.find(".//" + P + "cNvPr").get("name") or "")
        if cr is not None:
            nc += 1; key = cr.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id", "").replace("CHART:", "")
            p["charts"] = {key: rec["charts"][key]} if key in rec["charts"] else {}
            p["id"] = f"{rec['id']}c{nc}"; p["kind"] = "native chart"; p["pattern"] = "chart"
        else:
            nt += 1; p["charts"] = {}; p["id"] = f"{rec['id']}t{nt}"; p["kind"] = "native table"; p["pattern"] = "table"
        p["part_of"] = rec["id"]; p["part"] = p["id"][len(rec["id"]):]
        p["title"] = f"{name or p['kind']} (slide {rec['slide']})"
        p["note"] = f"{p['kind']} rebuilt from the original page, data editable (second pass v2.54+)"
        p["xml"] = etree.tostring(g, encoding="unicode"); p["bbox"] = bbox(el); p["n_shapes"] = 1
        p["media"] = []; p["slots"] = 0
        p["text"] = " | ".join(t.text for t in el.iter(A + "t") if t.text)[:200]
        out.append(p)
    return out

def main():
    a = sys.argv[1:]; store = a[0]; lay = None
    if "--layouts" in a: i = a.index("--layouts"); lay = a[i + 1]; del a[i:i + 2]
    pairs = list(zip(a[1::2], a[2::2]))
    mtmp = tempfile.mkdtemp(); touched = {}; report = {}
    for key, deck in pairs:
        old = [json.loads(l) for l in gzip.open(os.path.join(store, f"{key}.jsonl.gz"), "rt", encoding="utf-8")]
        slides = {o["slide"]: o for o in old if o["id"] == f"{key}-{int(o['slide']):03d}"}
        meta = {int(s): dict(title=o["title"], pattern=o["pattern"], note=o["note"]) for s, o in slides.items()}
        tdir = tempfile.mkdtemp()
        new = {int(o["slide"]): o for o in O.extract(deck, key, tdir, meta)}
        for f in glob.glob(os.path.join(tdir, "media", "*")): shutil.copy(f, os.path.join(mtmp, os.path.basename(f)))
        out = []; nat = 0
        for o in old:
            sl = int(o["slide"])
            if o["id"] == f"{key}-{sl:03d}" and sl in new:
                r = new[sl]; r["note"] = (o["note"] + " | second pass (v2.54+): text, photos, dashed lines" + ("; native charts/tables" if '"CHART:' in r["xml"] or "a:tbl" in r["xml"] else "")).strip(" |")
                out.append(r)
                for p in native_parts(r): out.append(p); nat += 1
            elif o["id"] == f"{key}-{sl:03d}":
                out.append(o)                                   # slide had no objects in the new extract: keep the old one
            else:
                out.append(o)
        with gzip.open(os.path.join(store, f"{key}.jsonl.gz"), "wt", encoding="utf-8") as f:
            for o in out: f.write(json.dumps(o, ensure_ascii=False) + "\n")
        touched[key] = out; report[key] = {"objects": len(out), "slides_reextracted": sum(1 for s in slides if int(s) in new), "native_parts": nat}
    if lay:
        key = "layouts-2021-2024"; tdir = tempfile.mkdtemp()
        meta = {i + 1: dict(title=t, pattern=p, note="clean layout object (house-neutral, grouped units for extend), from the 2021-2024 case decks")
                for i, (t, p) in enumerate([("Equation slide: evidence + evidence + evidence = conclusion", "equation"),
                                            ("Driver formula row: target = driver x driver + driver", "formula-row"),
                                            ("L1R3: side card and three numbered sections", "side-card-sections"),
                                            ("Strategy tab bar above the title", "tab-bar"),
                                            ("Acronym banner: large initial per pillar", "acronym-banner"),
                                            ("Segment mekko (variable-width columns)", "mekko"),
                                            ("Bridge / waterfall as a native chart", "waterfall"),
                                            ("Numbered sections (right side of L1R3), extendable", "numbered-sections")])}
        objs = O.extract(lay, key, tdir, meta)
        for f in glob.glob(os.path.join(tdir, "media", "*")): shutil.copy(f, os.path.join(mtmp, os.path.basename(f)))
        shutil.copy(os.path.join(tdir, f"{key}.jsonl.gz"), os.path.join(store, f"{key}.jsonl.gz"))
        touched[key] = objs; report[key] = {"objects": len(objs)}
    mz = os.path.join(store, "media.zip"); added = []
    with zipfile.ZipFile(mz, "a", zipfile.ZIP_STORED) as z:
        have = set(z.namelist())
        for f in sorted(glob.glob(os.path.join(mtmp, "*"))):
            if os.path.basename(f) not in have: z.write(f, os.path.basename(f)); added.append(os.path.basename(f))
    os.makedirs(os.path.join(store, "_newmedia"), exist_ok=True)
    for b in added: shutil.copy(os.path.join(mtmp, b), os.path.join(store, "_newmedia", b))
    open(os.path.join(store, "new-media.txt"), "w").write("\n".join(added))
    idx = json.load(open(os.path.join(store, "index.json")))
    idx = [o for o in idx if o["deck"] not in touched]
    for key, objs in touched.items():
        for o in objs:
            e = {k: o.get(k) for k in IDX_KEYS}; e["charts"] = len(o.get("charts") or {})
            for k in ("part_of", "part", "kind", "vector_of"):
                if o.get(k) is not None: e[k] = o[k]
            idx.append(e)
    json.dump(idx, open(os.path.join(store, "index.json"), "w"), ensure_ascii=False)
    report["new_media"] = len(added); print(json.dumps(report, indent=1))

if __name__ == "__main__":
    main()
