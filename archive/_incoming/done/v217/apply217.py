#!/usr/bin/env python3
"""v2.17: automatic fixes for OCR misreads that came up again and again in reviewed rebuilds. Run from the Powerpoint folder."""
import os, shutil, datetime
ROOT = os.getcwd(); INC = os.path.join(ROOT, "archive/_incoming/v217"); D = datetime.date.today().isoformat(); TAG = "pre-v2.17"
J = lambda *p: os.path.join(ROOT, *p); I = lambda *p: os.path.join(INC, *p)
def archive(rel):
    if os.path.exists(J(rel)):
        b, e = os.path.splitext(os.path.basename(rel)); dst = J("archive", f"{b}_{TAG}_{D}{e}")
        assert not os.path.exists(dst), dst; shutil.copy2(J(rel), dst)
def put(src, rel): archive(rel); shutil.copy2(src, J(rel))
def edit(rel, fn):
    archive(rel); t = open(J(rel), encoding="utf-8").read(); n = fn(t); assert n != t, rel; open(J(rel), "w", encoding="utf-8").write(n)
for f in ("rebuild_slides.py", "ocr_review.py", "ocr_autofix.json"): put(I("Generators", f), f"Generators/{f}")
def newref(t):
    old = "Look at every row by eye and write `review/<key>/ocr-corrections.json`"
    assert old in t
    return t.replace(old, "Misreads that came up again and again in earlier reviews are already fixed automatically (`Generators/ocr_autofix.json`; shown on the sheets as `[auto: old → new]`, still checked). Look at every row by eye and write `review/<key>/ocr-corrections.json`", 1)
edit("maintenance/new-reference.md", newref)
def newref2(t):
    old = "(audit check 12)."
    if "ocr_autofix.json grows" in t: return t + "\n"
    k = t.index("**OCR review (image pages; required, audit check 12).**"); e = t.index("\n", k)
    return t[:e] + " After the review, add to `Generators/ocr_autofix.json` any misread you corrected in more than one place whose fix can't be wrong in any context (ocr_autofix.json grows with every reviewed deck)." + t[e:]
edit("maintenance/new-reference.md", newref2)
def cl(t):
    line = ("| 2.17 | " + D + " | **Auto-fix for repeated OCR misreads.** `Generators/ocr_autofix.json` (new) holds the misreads corrected by eye again and again in the 2020 reviews: Intemet/GAGR/Finess/O20, x15 → ×15, 其 → × and 二 → = between numbers, 。 → bullet (or = before a lone number), and Chinese-character noise on English pages "
            "(118 of 120 such lines were deleted by eye; the rule reproduces all 120 decisions). `rebuild_slides.py` applies it right after OCR, before the reviewed corrections (which win); every fix is marked on the line and shown on the review sheets as `[auto: old → new]`, so it is still checked. "
            "new-reference step 1b: grow the file after each review. | User: make the system learn from each rebuild | Generators/rebuild_slides.py, Generators/ocr_review.py, Generators/ocr_autofix.json, maintenance/new-reference.md (old versions in archive/*_pre-v2.17_" + D + ".*) |\n")
    k = t.index("|---|"); k = t.index("\n", k) + 1; return t[:k] + line + t[k:]
edit("logs/changelog.md", cl)
print("applied v2.17")
