#!/usr/bin/env python3
"""v2.3 — better rebuild of image-only PDFs; re-rebuild the five 2020 decks and replace their store objects. Run from the Powerpoint folder."""
import os, json, gzip, shutil, zipfile, csv, datetime
ROOT = os.getcwd(); INC = os.path.join(ROOT, "archive/_incoming/v23")
D = datetime.date.today().isoformat(); PREV = "2.2"
J = lambda *p: os.path.join(ROOT, *p); I = lambda *p: os.path.join(INC, *p)
def archive(rel):
    if os.path.exists(J(rel)):
        b, e = os.path.splitext(os.path.basename(rel))
        dst = J("archive", f"{b}_v{PREV}_{D}{e}")
        if not os.path.exists(dst): shutil.copy2(J(rel), dst)
def put(src, rel): archive(rel); os.makedirs(os.path.dirname(J(rel)), exist_ok=True); shutil.copy2(src, J(rel))
def edit(rel, fn):
    archive(rel); t = open(J(rel), encoding="utf-8").read(); n = fn(t)
    assert n != t, f"no change in {rel}"; open(J(rel), "w", encoding="utf-8").write(n)
KEYS = ["case20-gym-brief", "case20-vaccine", "case20-tnt", "case20-baincraft", "case20-doubleclick"]
put(I("Generators/rebuild_slides.py"), "Generators/rebuild_slides.py")
for f in os.listdir(I("templates")): put(I("templates", f), f"Templates/{f}")
for d in os.listdir(I("review")):
    os.makedirs(J("review", d), exist_ok=True)
    for f in os.listdir(I("review", d)): shutil.copy2(I("review", d, f), J("review", d, f))
S = J("Objects/store")
for k in ["index.json", "media.zip"] + [f"{k}.jsonl.gz" for k in KEYS]: archive(f"Objects/store/{k}")
for k in KEYS: shutil.copy2(I("store", f"{k}.jsonl.gz"), os.path.join(S, f"{k}.jsonl.gz"))
idx = json.load(open(os.path.join(S, "index.json"), encoding="utf-8"))
idx = [o for o in idx if o["deck"] not in KEYS] + json.load(open(I("store", "index-add.json"), encoding="utf-8"))
json.dump(idx, open(os.path.join(S, "index.json"), "w", encoding="utf-8"), ensure_ascii=False)
with zipfile.ZipFile(os.path.join(S, "media.zip"), "a") as zo:
    have = set(zo.namelist())
    for i in range(1, 5):
        with zipfile.ZipFile(I("store", f"media-add-{i}.zip")) as zi:
            for n in zi.namelist():
                if n not in have: zo.writestr(n, zi.read(n)); have.add(n)
archive("Style/slide-map.csv"); rows = list(csv.reader(open(I("slide-map-2020.csv"), encoding="utf-8")))
names = {r[0] for r in rows}; old = list(csv.reader(open(J("Style/slide-map.csv"), encoding="utf-8-sig")))
out, done = [], False
for r in old:
    if r and r[0] in names:
        if not done: out += rows; done = True
        continue
    out.append(r)
if not done: out += rows
with open(J("Style/slide-map.csv"), "w", newline="", encoding="utf-8-sig") as f: csv.writer(f).writerows(out)
reg_p = "Style/refs/references.json"; archive(reg_p); reg = json.load(open(J(reg_p), encoding="utf-8"))
for r in reg["references"]:
    if r["key"] == "case20-baincraft": r.pop("vector_checked", None)   # it now has reviewed vectorised drawings of its own
json.dump(reg, open(J(reg_p), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
def study(t):
    a = t.index("- **Image decks rebuilt**"); b = t.index("\n", a)
    new = ("- **Image decks rebuilt** (`Generators/rebuild_slides.py`, improved in v2.3). Similarity to the original pages (SSIM on 300-px-tall renders; 1.0 = identical), before → after v2.3: "
           "Gym brief 0.54 → 0.56, Vaccine 0.62 → 0.67, TNT 0.60 → 0.66, Baincraft 0.63 → 0.72, DoubleClick 0.67 → 0.70; at layout scale (120 px) 0.60–0.72 → 0.60–0.78. "
           "What changed: the rebuild now redraws its own traced shapes and compares them with the page; where flat shapes lose the picture (photos, isometric drawings, line art, textured maps) "
           "it keeps the original pixels as a picture instead (never more than a third of a slide for line work); text inside pictures is only re-typed when the OCR is sure (else a misread number would replace a correct one); "
           "font size is set from the ink height with a descender check (caps-only lines were 20% too small); bold and serif vs sans are matched by rendering each line in both fonts and comparing; "
           "white text on colour bars is read by a fourth OCR pass; OCR noise from icons and pins is dropped; the background colour is the page's most common colour (a scan frame line had made one slide dark). "
           "Still imperfect: small chart labels can be misread (check numbers against `Templates/<name>-original.pdf` before reusing a chart), a few icons inside coloured boxes are lost, and slides keep more pictures than before (those regions are not editable shapes). "
           "Store objects of the five 2020 decks were rebuilt from the new slides and reviewed by eye again: 89 single diagrams and 27 vectorised drawings kept out of 342 candidates.")
    return t[:a] + new + t[b:]
edit("Style/refs/case-competitions-2019-2020.md", study)
def cl(t):
    line = ("| 2.3 | " + D + " | Better rebuild of image-only PDFs (`Generators/rebuild_slides.py`): self-check of the trace keeps photos, line art and drawings as pictures where shapes lose them; "
            "font size from ink height with descender check; bold/serif matched by rendering; light-text OCR pass; OCR noise filter; safer text inside pictures; most-common-colour background; review sheet no longer crops wider pages. "
            "Re-rebuilt the five 2020 decks (SSIM 0.54–0.67 → 0.56–0.72) and replaced their store objects (89 parts + 27 vectorised drawings kept after review by eye). | "
            "User: fix the rough 2020 rebuilds | Generators/rebuild_slides.py, Templates/Case-2020-*-rebuilt.pptx, Objects/store/*, Style/slide-map.csv, Style/refs/case-competitions-2019-2020.md, Style/refs/references.json, review/case20-* |\n")
    k = t.index("|---|"); k = t.index("\n", k) + 1
    return t[:k] + line + t[k:]
edit("logs/changelog.md", cl)
print("applied v2.3")
