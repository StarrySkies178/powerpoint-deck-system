#!/usr/bin/env python3
"""v2.15: missed-word check, text sizes measured from the glyphs, cleaner text erase; the five 2020 image decks rebuilt again
with the reviewed corrections and their store objects re-reviewed. Run from the Powerpoint folder."""
import os, json, shutil, zipfile, datetime
ROOT = os.getcwd(); INC = os.path.join(ROOT, "archive/_incoming/v215")
D = datetime.date.today().isoformat(); PREV = "pre-v2.15"
J = lambda *p: os.path.join(ROOT, *p); I = lambda *p: os.path.join(INC, *p)
def archive(rel):
    if os.path.exists(J(rel)):
        b, e = os.path.splitext(os.path.basename(rel))
        dst = J("archive", f"{b}_{PREV}_{D}{e}")
        assert not os.path.exists(dst), dst; shutil.copy2(J(rel), dst)
def put(src, rel): archive(rel); os.makedirs(os.path.dirname(J(rel)), exist_ok=True); shutil.copy2(src, J(rel))
def edit(rel, fn):
    archive(rel); t = open(J(rel), encoding="utf-8").read(); n = fn(t)
    assert n != t, f"no change in {rel}"; open(J(rel), "w", encoding="utf-8").write(n)
KEYS = ["case20-gym-brief", "case20-vaccine", "case20-tnt", "case20-baincraft", "case20-doubleclick"]

put(I("Generators/rebuild_slides.py"), "Generators/rebuild_slides.py")
put(I("Generators/ocr_review.py"), "Generators/ocr_review.py")
for f in os.listdir(I("templates")): put(I("templates", f), f"Templates/{f}")
for k in KEYS:
    d = J("review", k)
    for f in ("rebuild-review.jpg", "ocr-corrections.json", "rebuild-info.json"):
        if os.path.exists(os.path.join(d, f)):
            b, e = os.path.splitext(f); dst = J("archive", f"{k}-{b}_{PREV}_{D}{e}")
            if not os.path.exists(dst): shutil.copy2(os.path.join(d, f), dst)
    with zipfile.ZipFile(I(f"review-{k}.zip")) as z: z.extractall(d)

S = J("Objects/store")
for k in ["index.json", "media.zip"] + [f"{k}.jsonl.gz" for k in KEYS]: archive(f"Objects/store/{k}")
for k in KEYS: shutil.copy2(I("store", f"{k}.jsonl.gz"), os.path.join(S, f"{k}.jsonl.gz"))
idx = json.load(open(os.path.join(S, "index.json"), encoding="utf-8"))
idx = [o for o in idx if o["deck"] not in KEYS] + json.load(open(I("store", "index-add.json"), encoding="utf-8"))
json.dump(idx, open(os.path.join(S, "index.json"), "w", encoding="utf-8"), ensure_ascii=False)
with zipfile.ZipFile(os.path.join(S, "media.zip"), "a") as zo:
    have = set(zo.namelist())
    for f in sorted(os.listdir(I("store"))):
        if not f.startswith("media-add-"): continue
        with zipfile.ZipFile(I("store", f)) as zi:
            for n in zi.namelist():
                if n not in have: zo.writestr(n, zi.read(n)); have.add(n)

reg_p = "Style/refs/references.json"; archive(reg_p); reg = json.load(open(J(reg_p), encoding="utf-8"))
W = {"case20-vaccine": "48 missed-word candidates checked, 47 added", "case20-tnt": "48 missed-word candidates checked, 37 added",
     "case20-baincraft": "182 missed-word candidates checked, 168 added; 3 misread timeline-header lines removed", "case20-doubleclick": "80 missed-word candidates checked, 74 added",
     "case20-gym-brief": "no missed words found"}
for r in reg["references"]:
    if r["key"] in W and r.get("ocr_reviewed"): r["ocr_reviewed"] += f"; {D}: {W[r['key']]} (review/{r['key']}/ocr-missing-words-candidates.json)"
json.dump(reg, open(J(reg_p), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

def newref(t):
    old = "`missing` + `missing-sheets` list numbers the OCR did not find, each shown in context."
    assert old in t
    return t.replace(old, "`missing` + `missing-sheets` list numbers the OCR did not find, and `missing-words` + `missing-sheets --dense` list words it did not find (light text on colour: white on pink, grey on grey), each shown in context.")
edit("maintenance/new-reference.md", newref)

def study(t):
    a = t.index("Decisions in `review/case20-*/ocr-corrections.json`")
    add = ("**v2.15:** a third check looked for words the OCR missed (white text on pink tiles, grey text on grey cards, small captions): 358 candidates checked by eye, 326 added as text. "
           "Text size is now measured from the letters themselves, so a label inside an ellipse or badge no longer gets an oversized font; the text erase also flattens the faint halo round letters (no ghost lines left behind) and keeps a light card's own colour. "
           "Picture area per slide now: Baincraft 27%, DoubleClick 21%, Vaccine 15%, TNT 28% (real photos). Store objects re-reviewed by eye: 92 single diagrams and 17 vectorised drawings kept out of 276 candidates. ")
    return t[:a] + add + t[a:]
edit("Style/refs/case-competitions-2019-2020.md", study)

def cl(t):
    line = ("| 2.15 | " + D + " | **Missed words, glyph-measured text sizes, cleaner erase (image rebuilds).** `ocr_review.py missing-words` finds words the OCR did not read (light text on colour) and `missing-sheets --dense` shows them in context; "
            "`rebuild_slides.py` sizes each text line from its letters (labels inside ellipses and badges were too big), flattens the halo left round erased letters, uses a light card's own colour, and skips an added word that the OCR already read. "
            "The five 2020 decks rebuilt again: 358 missed-word candidates checked by eye, 326 added; store objects re-reviewed (92 parts + 17 vectorised drawings kept of 276). | "
            "User: continue making the rebuilds perfect | Generators/rebuild_slides.py, Generators/ocr_review.py, Templates/Case-2020-*-rebuilt.pptx, review/case20-*, Objects/store/*, Style/refs/references.json, Style/refs/case-competitions-2019-2020.md, maintenance/new-reference.md (old versions in archive/*_pre-v2.15_" + D + ".*) |\n")
    k = t.index("|---|"); k = t.index("\n", k) + 1
    return t[:k] + line + t[k:]
edit("logs/changelog.md", cl)
print("applied v2.15")
