#!/usr/bin/env python3
"""v2.6: OCR-reviewed, finer-traced rebuild of the five 2020 image decks; OCR review becomes a required step. Run from the Powerpoint folder."""
import os, json, gzip, shutil, zipfile, datetime
ROOT = os.getcwd(); INC = os.path.join(ROOT, "archive/_incoming/v26")
D = datetime.date.today().isoformat(); PREV = "2.5"
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

# 1 code
put(I("Generators/rebuild_slides.py"), "Generators/rebuild_slides.py")
put(I("Generators/ocr_review.py"), "Generators/ocr_review.py")
put(I("scripts/ingest_reference.py"), "scripts/ingest_reference.py")

# 2 decks + review material (page images, OCR cache, OCR info before/after, corrections, rebuild sheet)
for f in os.listdir(I("templates")): put(I("templates", f), f"Templates/{f}")
for k in KEYS:
    d = J("review", k); os.makedirs(d, exist_ok=True)
    for f in ("rebuild-review.jpg",):
        if os.path.exists(os.path.join(d, f)): archive(f"review/{k}/{f}")
    with zipfile.ZipFile(I(f"review-{k}.zip")) as z: z.extractall(d)

# 3 store objects: replace the five decks
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

# 4 registry: OCR review recorded per reference
reg_p = "Style/refs/references.json"; archive(reg_p); reg = json.load(open(J(reg_p), encoding="utf-8"))
OCR = {"case20-gym-brief": "5 number lines + 2 suspect lines checked against the page crops; 2 fixed",
       "case20-vaccine": "211 number lines + 59 suspect lines + 9 missed-number candidates checked; 83 lines fixed or removed, 6 numbers added",
       "case20-tnt": "190 number lines + 91 suspect lines + 14 missed-number candidates checked; 98 lines fixed or removed, 10 numbers added",
       "case20-baincraft": "1,071 number lines + 141 suspect lines + 67 missed-number candidates checked; 238 lines fixed or removed, 48 numbers added",
       "case20-doubleclick": "1,281 number lines + 133 suspect lines + 54 missed-number candidates checked; 160 lines fixed or removed, 51 numbers added"}
for r in reg["references"]:
    if r["key"] in OCR:
        r["ocr_reviewed"] = f"{D}: {OCR[r['key']]} (by eye, review/{r['key']}/ocr-corrections.json)"
        if r["key"] == "case20-gym-brief": r["parts_checked"] = "one text page with no diagrams: both candidate parts were text and a logo (checked by eye again in v2.6)"
json.dump(reg, open(J(reg_p), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# 5 audit: check 12 (OCR review for image-rebuilt references)
def audit(t):
    assert '  8 rebuild      (PDF / image sources)' in t and '        ok("8 rebuild", os.path.exists(J("review", k, "rebuild-review.jpg"))' in t
    t = t.replace('''  8 rebuild      (PDF / image sources) the rebuilt deck and its review sheet exist
''', '''  8 rebuild      (PDF / image sources) the rebuilt deck and its review sheet exist
  12 OCR review  (image pages) every number line was checked against the page by eye and the deck rebuilt with the corrections
''')
    t = t.replace('''        ok("8 rebuild", os.path.exists(J("review", k, "rebuild-review.jpg")) or os.path.exists(J("Templates", ref["template"])), "rebuilt deck / review sheet missing")
''', '''        ok("8 rebuild", os.path.exists(J("review", k, "rebuild-review.jpg")) or os.path.exists(J("Templates", ref["template"])), "rebuilt deck / review sheet missing")
    if "image" in (ref.get("rebuilt_from") or ""):
        ok("12 OCR review", ref.get("ocr_reviewed") and os.path.exists(J("review", k, "ocr-corrections.json")),
           "image pages not OCR-reviewed: Generators/ocr_review.py sheets / missing, review/<key>/ocr-corrections.json, rebuild with --fixes, record ocr_reviewed (maintenance/new-reference.md step 1b)")
''')
    return t
edit("scripts/audit_reference.py", audit)

# 6 maintenance: OCR review is step 1b of every image reference
def newref(t):
    a = t.index("   - **Check the rebuild:**"); b = t.index("\n", a) + 1
    step = ("   - **OCR review (image pages; required, audit check 12).** OCR misreads small labels (2.9 → 29, 1 → I, a pin read as 'A') and misses some numbers, so a rebuilt image page is never reused before this: "
            "`python3 Generators/ocr_review.py sheets review/<key>/rebuild-info.json review/<key>/pages review/<key>/ocr` (every line with a number: the original crop beside the OCR text) and the same with `--suspect` (lines without numbers that look misread: icons and logos read as letters); "
            "`missing` + `missing-sheets` list numbers the OCR did not find, each shown in context. Look at every row by eye and write `review/<key>/ocr-corrections.json` (right text; \"\" for an icon read as text, which then stays a graphic; `_missing` for numbers to add). "
            "Then rebuild with the corrections: `python3 scripts/ingest_reference.py <same source> <key> \"<name>\" --fixes review/<key>/ocr-corrections.json --replace` (same OCR from `review/<key>/ocr-cache`, so the ids match), look at the new rebuild sheet, review the store objects again and record `ocr_reviewed` in `Style/refs/references.json`. "
            "Real photos stay pictures by design; drawings, icons, maps and charts are traced finely into shapes.\n")
    return t[:b] + step + t[b:]
edit("maintenance/new-reference.md", newref)

def objreadme(t):
    old = "Rebuilt objects are approximations: text and simple shapes are reliable; complex drawings (maps, detailed icons) may need a generator or a cleaner source."
    assert old in t
    return t.replace(old, "Image pages are checked line by line against the page by eye (`Generators/ocr_review.py`) and rebuilt with the corrections before their objects are used, so their numbers can be trusted; drawings, icons, maps and charts are traced finely into shapes, and only real photos stay pictures. Isometric drawings and textured scans come out as many small shapes: fine to recolour and move, but redraw with a generator (`patterns_place.js` buildingExplode, maps) when they need changing.")
edit("Objects/README.md", objreadme)

def decksys(t):
    old = "rebuild_slides.py (PDF/image → editable slides),"
    assert old in t
    return t.replace(old, "rebuild_slides.py (PDF/image → editable slides), ocr_review.py (line-by-line OCR check of rebuilt image pages),")
edit("DECK-SYSTEM.md", decksys)

# 7 study §9
def study(t):
    a = t.index("Still imperfect: small chart labels"); b = t.index("\n", a)
    new = ("**v2.6 (OCR review + finer trace):** every text line with a number on the 106 image pages (2,758 lines), plus 426 lines that looked misread and 144 numbers the OCR may have missed, was checked by eye against the page crop; "
           "581 lines were corrected or removed (icons, logos and pins read as letters now stay graphics) and 115 missed numbers were added as text. The decks were then rebuilt with the corrections, so a corrected number is typed text and its pixels are no longer traced underneath. "
           "Tracing: text is erased with a flat fill in the local colour (table rules, chip and bar edges kept), light cards a few shades off the background keep their own colour, holes small enough for icons inside coloured boxes are kept, and drawings, icons, maps and charts that the coarse trace loses are traced again at up to 3x zoom "
           "(a page-wide soft scan, like the Baincraft timeline, is traced whole). Area kept as pictures per slide: Baincraft 52% → 26%, DoubleClick 23% → 17%, Vaccine 31% → 15%, TNT 28% → 29% (mostly real photos, kept by design). "
           "SSIM to the pages stays 0.55–0.67 (shapes in place of pasted pixels score about the same even where they look closer); judge by eye. "
           "Still not perfect: lines without numbers were only checked where they looked wrong (426 lines), so an ordinary word can still be misspelt; isometric drawings come out as many small shapes; real photos are pictures, not shapes. "
           "Store objects of the five decks were rebuilt from the corrected slides and reviewed by eye again: 113 single diagrams and 10 vectorised drawings kept out of 308 candidates (most former picture regions are now traced shapes inside the slide and part objects). "
           "Decisions in `review/case20-*/ocr-corrections.json`; the pages, OCR cache and OCR before/after are kept beside them, so the rebuild can be repeated exactly.")
    return t[:a] + new + t[b:]
edit("Style/refs/case-competitions-2019-2020.md", study)

# 8 changelog
def cl(t):
    line = ("| 2.6 | " + D + " | **OCR review + finer trace for image rebuilds.** New `Generators/ocr_review.py`: sheets of every OCR line with a number (and of lines that look misread) beside the page crop, a second digit-only pass for numbers the OCR missed, corrections file; "
            "`rebuild_slides.py` rebuilds with the reviewed corrections (`--fixes`, same OCR from a cache), erases text with a flat local fill that keeps rules and chip edges, keeps light cards and icon holes, traces drawings/icons/maps/charts finely (photos stay pictures), traces a page-wide soft scan whole. "
            "`ingest_reference.py --fixes … --replace` re-ingests after the review; audit check 12 requires the OCR review for every image-rebuilt reference; new-reference step 1b. "
            "The five 2020 decks: 2,758 number lines + 426 suspect lines + 144 missed-number candidates checked by eye, 581 lines fixed/removed, 115 numbers added; picture area per slide Baincraft 52→26%, DoubleClick 23→17%, Vaccine 31→15%; store objects rebuilt and re-reviewed (113 parts + 10 vectorised drawings kept of 308). | "
            "User: make the rebuilds perfect (numbers read wrongly, icons in boxes lost, too many parts left as pictures) | Generators/rebuild_slides.py, Generators/ocr_review.py, scripts/ingest_reference.py, scripts/audit_reference.py, Templates/Case-2020-*-rebuilt.pptx, review/case20-*, Objects/store/*, Style/refs/references.json, Style/refs/case-competitions-2019-2020.md, maintenance/new-reference.md, Objects/README.md, DECK-SYSTEM.md |\n")
    k = t.index("|---|"); k = t.index("\n", k) + 1
    return t[:k] + line + t[k:]
edit("logs/changelog.md", cl)
print("applied v2.6")
