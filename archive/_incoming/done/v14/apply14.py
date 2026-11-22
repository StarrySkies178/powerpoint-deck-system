# run from the Powerpoint folder
import json, os, re, shutil
D="2026-11-23"; I="archive/_incoming/v14"
for f in ["DECK-SYSTEM.md","maintenance/new-reference.md","scripts/ingest_reference.py","scripts/audit_reference.py","Objects/README.md","logs/changelog.md","logs/lessons-log.md"]:
    b=os.path.basename(f); n,e=os.path.splitext(b); shutil.copy(f,f"archive/{n}_v1.3_{D}{e}")
shutil.copy(f"{I}/vectorize.py","Generators/vectorize.py")
# 1 learning rule: add "pictures and embedded charts become shapes"
p="DECK-SYSTEM.md"; s=open(p,encoding="utf-8").read()
s=s.replace("every slide split into its single diagrams, each checked by eye;","every slide split into its single diagrams, each checked by eye; **every picture chart, pasted diagram and embedded (think-cell / MS Graph / Excel) chart turned into editable shapes** (`Generators/vectorize.py`) so it can be reused, resized, recoloured, transformed and transmuted;")
s=s.replace("rebuild_slides.py (PDF/image → editable slides), build_*.js","rebuild_slides.py (PDF/image → editable slides), vectorize.py (pictures + embedded charts → shapes), build_*.js")
open(p,"w",encoding="utf-8").write(s)
# 2 new-reference.md
p="maintenance/new-reference.md"; s=open(p,encoding="utf-8").read()
add="   - **Pictures and embedded charts become shapes (always):** `ingest_reference.py` runs `Generators/vectorize.py`. Embedded charts (think-cell, MS Graph, Excel objects) are rendered to vector PDF and imported back as shapes; graphic pictures (pasted charts, diagrams, icons) are traced into shapes and text; photos stay pictures. Check a sample of the vectorised objects by eye (ids ending `c<n>` and `v<n>`), and drop ones that came out wrong.\n"
if "become shapes (always)" not in s: s=s.replace("   - **Charts:**", add+"   - **Charts:**",1)
open(p,"w",encoding="utf-8").write(s)
# 3 ingest: call vectorize after the store is written
p="scripts/ingest_reference.py"; s=open(p,encoding="utf-8").read()
old="    # registry for the audit gate"
new='''    # pictures and embedded charts -> editable shapes (always)
    import vectorize as VZ
    ids = {o["slide"]: o["id"] for o in objs}
    vec = VZ.route_a(src if not os.path.isdir(src) else pptx, pptx, key, ids) if not rebuilt else []
    vec += VZ.route_b(VZ.graphic_pictures(store, key, os.path.join(store, "media.zip")), key)
    VZ.save(store, key, vec); idx = json.load(open(idx_path))
    # registry for the audit gate'''
if "vectorize as VZ" not in s: s=s.replace(old,new,1)
s=s.replace('''unclassified=len(unc),''','''unclassified=len(unc), vectorised=len(vec),''',1)
open(p,"w",encoding="utf-8").write(s)
# 4 audit: check 10 vectorised
p="scripts/audit_reference.py"; s=open(p,encoding="utf-8").read()
if "10 shapes" not in s:
    s=s.replace('''    if ref.get("rebuilt_from"):''','''    vec = [o for o in objs if o.get("vector_of")]
    ok("10 shapes", vec or ref.get("vector_checked"), "pictures / embedded charts not turned into shapes (run Generators/vectorize.py, or record vector_checked with the reason)")
    if ref.get("rebuilt_from"):''')
    s=s.replace("  8 rebuild ","  10 shapes     pictures and embedded charts were turned into editable shapes (vectorize.py)\n  8 rebuild ")
open(p,"w",encoding="utf-8").write(s)
# 5 Objects README
p="Objects/README.md"; s=open(p,encoding="utf-8").read()
if "## Pictures and embedded charts → shapes" not in s:
    s+="\n## Pictures and embedded charts → shapes\n\nEvery reference's pictures and embedded charts are turned into editable shapes by `Generators/vectorize.py` (run automatically by `ingest_reference.py`). Embedded charts (think-cell / MS Graph / Excel) come from the vector render, so they are exact; they get ids `<slide id>c<n>`. Graphic pictures are traced (OCR text + colour regions); ids `<slide id>v<n>`. Photos stay pictures. Every operation works on them: place, resize, recolour, swap_geom, transform (flip/rotate), ungroup/explode, combine, set_texts. A vectorised chart's numbers are shapes, not chart data: to change the data, redraw it with a builder (`chartIn`, `stackedCagr`, `waterfall`…).\n"
    open(p,"w",encoding="utf-8").write(s)
# 6 registry: map has no pictures/charts
p="Style/refs/references.json"; d=json.load(open(p,encoding="utf-8"))
for r in d["references"]:
    if r["key"] in ("map",): r["vector_checked"]="2026-11-23: no pictures or embedded charts to convert"
json.dump(d,open(p,"w",encoding="utf-8"),ensure_ascii=False,indent=1)
print("rules applied")
