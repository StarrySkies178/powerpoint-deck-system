"""reextract_store.py: extract a reference deck's whole-slide objects again after a fix to objstore.extract (v2.84).

Usage (from the Powerpoint folder):
  python3 scripts/reextract_store.py <key> [<key> ...]          re-extract, write the store, print what changed
  python3 scripts/reextract_store.py <key> ... --dry-run        only print what would change
  python3 scripts/reextract_store.py <key> ... --tags-only      no extraction: set each whole-slide object's pattern,
                                                                title and note from its REVIEWED row in Style/slide-map.csv
                                                                (store file + index.json), and print what changed

For each key (Style/refs/references.json gives its template in Templates/):
  - the whole-slide objects (<key>-NNN) are extracted again from the template with the current objstore.extract, keeping
    each object's reviewed pattern, title and note (from the store as it is);
  - the single-diagram parts (<key>-NNNpK) and the vectorised pictures (<key>-NNNvK) are kept exactly as they are: parts
    were reviewed by eye (audit check 3) and a new split would need that review again;
  - new pictures go into media.zip (appended, as ingest_reference.py does); index.json rows of the whole-slide objects are
    replaced; the old store file is copied to archive/<key>_before-reextract_<date>.jsonl.gz.
Prints per key how many whole-slide objects changed, and how many shapes and pictures were added or lost.
Run scripts/audit_reference.py <key> afterwards (must be ALL PASS)."""
import datetime, glob, gzip, json, os, shutil, sys, tempfile, zipfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O  # noqa: E402

STORE = os.path.join(ROOT, "Objects", "store")
IDX_KEYS = ("id", "deck", "slide", "pattern", "title", "note", "n_shapes", "text", "roles_used", "complete", "bbox", "src_slide", "slots")

def slide_map_rows(name):
    """Reviewed rows of Style/slide-map.csv for a reference: {slide: (pattern, title, note)}."""
    import csv
    out = {}
    for r in csv.reader(open(os.path.join(ROOT, "Style", "slide-map.csv"), encoding="utf-8-sig")):
        if len(r) >= 5 and r[0] in (name, name.replace("-rebuilt", "")) and r[1].isdigit() and "auto" not in r[4]:
            out[int(r[1])] = (r[2], r[3], r[4])
    return out

def retag(key, dry=False):
    refs = {r["key"]: r for r in json.load(open(os.path.join(ROOT, "Style", "refs", "references.json"), encoding="utf-8"))["references"]}
    rows = slide_map_rows(refs[key]["name"])
    fp = os.path.join(STORE, f"{key}.jsonl.gz")
    cur = [json.loads(l) for l in gzip.open(fp, "rt", encoding="utf-8")]
    changed = []
    for o in cur:
        if o.get("part_of") or o.get("vector_of") or o["slide"] not in rows: continue
        pat, title, note = rows[o["slide"]]
        if o.get("pattern") != pat: changed.append(f"{o['id']}: {o.get('pattern')} -> {pat}")
        o.update(pattern=pat, title=title, note=note)
    if not dry and changed:
        d = datetime.date.today().isoformat()
        shutil.copy(fp, os.path.join(ROOT, "archive", f"{key}_before-retag_{d}_{datetime.datetime.now():%H%M}.jsonl.gz"))
        with gzip.open(fp, "wt", encoding="utf-8") as f:
            for o in cur: f.write(json.dumps(o, ensure_ascii=False) + "\n")
        ip = os.path.join(STORE, "index.json"); idx = json.load(open(ip)); byid = {o["id"]: o for o in cur}
        for r in idx:
            if r["id"] in byid and not r.get("part_of") and not r.get("vector_of"):
                r.update(pattern=byid[r["id"]]["pattern"], title=byid[r["id"]]["title"], note=byid[r["id"]]["note"])
        json.dump(idx, open(ip, "w"), ensure_ascii=False); O._CACHE.clear()
    return dict(key=key, reviewed_rows=len(rows), tags_changed=len(changed), changes=changed)

def reextract(key, dry=False):
    refs = {r["key"]: r for r in json.load(open(os.path.join(ROOT, "Style", "refs", "references.json"), encoding="utf-8"))["references"]}
    tpl = os.path.join(ROOT, "Templates", refs[key]["template"])
    fp = os.path.join(STORE, f"{key}.jsonl.gz")
    cur = [json.loads(l) for l in gzip.open(fp, "rt", encoding="utf-8")]
    whole = {o["id"]: o for o in cur if not o.get("part_of") and not o.get("vector_of")}
    keep = [o for o in cur if o.get("part_of") or o.get("vector_of")]
    meta = {o["slide"]: dict(pattern=o.get("pattern", ""), title=o.get("title", ""), note=o.get("note", "")) for o in whole.values()}
    tmp = tempfile.mkdtemp()
    new = O.extract(tpl, key, tmp, meta)
    changed, added, lost, sh_plus, sh_minus = [], [], [], 0, 0
    newd = {o["id"]: o for o in new}
    for oid, o in newd.items():
        if oid not in whole: added.append(oid); continue
        if o["xml"] != whole[oid]["xml"] or o.get("role_src") != whole[oid].get("role_src"):
            changed.append(oid); d = o["n_shapes"] - whole[oid]["n_shapes"]
            sh_plus += max(d, 0); sh_minus += max(-d, 0)
    lost = [oid for oid in whole if oid not in newd]
    pics = sorted(set(m for o in new for m in o["media"]) - set(m for o in whole.values() for m in o.get("media", [])))
    # parts and vectorised pictures are kept, but each colour in them gets the per-colour original the new extraction
    # recorded (objstore.DS + "c", v2.85), matched shape by shape (same cNvPr id) with their whole-slide object
    recoloured = 0
    for o in keep:
        w = newd.get(o.get("part_of") or "")
        if not w: continue
        fw, fp_ = O._frag(w), O._frag(o)
        byid = {}
        for e in fw.iter(O.P + "sp", O.P + "cxnSp"):
            c = e.find("./*/p:cNvPr", O.NS)
            if c is not None: byid[c.get("id")] = e
        hit = False
        for e in fp_.iter(O.P + "sp", O.P + "cxnSp"):
            c = e.find("./*/p:cNvPr", O.NS); src = byid.get(c.get("id")) if c is not None else None
            if src is None: continue
            a_ = list(e.iter(O.A + "schemeClr")); b_ = list(src.iter(O.A + "schemeClr"))
            if len(a_) != len(b_): continue
            for x, y in zip(a_, b_):
                if x.get("val") == y.get("val") and y.get(getattr(O, "DS", "") + "c"): x.set(O.DS + "c", y.get(O.DS + "c")); hit = True
        if hit: O._store(o, fp_); recoloured += 1
    report = dict(key=key, whole_objects=len(newd), changed=len(changed), added=added, lost=lost, parts_given_colours=recoloured,
                  shapes_added=sh_plus, shapes_removed=sh_minus, new_pictures=len(pics), parts_and_vectorised_kept=len(keep))
    if dry: return report
    d = datetime.date.today().isoformat()
    shutil.copy(fp, os.path.join(ROOT, "archive", f"{key}_before-reextract_{d}_{datetime.datetime.now():%H%M}.jsonl.gz"))
    with gzip.open(fp, "wt", encoding="utf-8") as f:
        for o in new + keep: f.write(json.dumps(o, ensure_ascii=False) + "\n")
    mz = os.path.join(STORE, "media.zip")
    with zipfile.ZipFile(mz, "a", zipfile.ZIP_STORED) as z:
        have = set(z.namelist())
        for m in glob.glob(os.path.join(tmp, "media", "*")):
            if os.path.basename(m) not in have: z.write(m, os.path.basename(m)); have.add(os.path.basename(m))
    ip = os.path.join(STORE, "index.json"); idx = json.load(open(ip))
    pos = {r["id"]: i for i, r in enumerate(idx)}
    for o in new:
        row = {**{x: o[x] for x in IDX_KEYS}, "charts": len(o["charts"])}
        if o["id"] in pos: idx[pos[o["id"]]] = {**idx[pos[o["id"]]], **row}
        else: idx.append(row)
    idx = [r for r in idx if r["id"] not in lost]
    json.dump(idx, open(ip, "w"), ensure_ascii=False)
    O._CACHE.clear()
    return report

if __name__ == "__main__":
    a = sys.argv[1:]; dry = "--dry-run" in a; keys = [k for k in a if not k.startswith("--")]
    if not keys: print(__doc__); sys.exit(1)
    for k in keys: print(json.dumps(retag(k, dry) if "--tags-only" in a else reextract(k, dry), ensure_ascii=False))
