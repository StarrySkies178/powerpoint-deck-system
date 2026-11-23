#!/usr/bin/env python3
"""v2.38: 16 references learned (2021 Fruit Co, 2022 Carbonated Co, 2024 Senior Living: 13 case decks + 3 briefs).
Image rebuilds with a by-eye OCR review, store objects reviewed by eye, slide map + index rows, study file.
Freeze: no rule, builder or catalogue file is changed; lessons go to logs/proposals.md. Run from the Powerpoint folder."""
import os, json, shutil, zipfile, datetime, glob
ROOT = os.getcwd(); INC = os.path.join(ROOT, "archive/_incoming/v238")
D = datetime.date.today().isoformat(); PREV = "pre-v2.38"
J = lambda *p: os.path.join(ROOT, *p); I = lambda *p: os.path.join(INC, *p)
def archive(rel):
    if os.path.exists(J(rel)):
        b, e = os.path.splitext(os.path.basename(rel))
        dst = J("archive", f"{b}_{PREV}_{D}{e}")
        assert not os.path.exists(dst), dst; shutil.copy2(J(rel), dst)
def append(rel, text, crlf=False):
    archive(rel); t = open(J(rel), "rb").read()
    nl = b"\r\n" if crlf else b"\n"
    if not t.endswith(nl): t += nl
    add = text.encode("utf-8")
    if crlf: add = add.replace(b"\r\n", b"\n").replace(b"\n", b"\r\n")
    open(J(rel), "wb").write(t + add)
refs = json.load(open(I("references-add.json"), encoding="utf-8")); KEYS = [r["key"] for r in refs]

# 1 originals and rebuilt decks
for f in sorted(os.listdir(I("templates"))):
    assert not os.path.exists(J("Templates", f)), f
    shutil.copy2(I("templates", f), J("Templates", f))
# 2 review folders (pages, OCR cache, corrections of every round, rebuild info, review sheet, notes)
for k in KEYS:
    assert not os.path.exists(J("review", k)), k
    shutil.copytree(I("review", k), J("review", k))
# 3 object store
S = J("Objects/store")
for f in ("index.json", "media.zip"): archive(f"Objects/store/{f}")
for k in KEYS:
    assert not os.path.exists(os.path.join(S, f"{k}.jsonl.gz")), k
    shutil.copy2(I("store", f"{k}.jsonl.gz"), os.path.join(S, f"{k}.jsonl.gz"))
idx = json.load(open(os.path.join(S, "index.json"), encoding="utf-8"))
assert not any(o["deck"] in KEYS for o in idx)
add = json.load(open(I("store", "index-add.json"), encoding="utf-8"))
json.dump(idx + add, open(os.path.join(S, "index.json"), "w", encoding="utf-8"), ensure_ascii=False)
n_media = 0
with zipfile.ZipFile(os.path.join(S, "media.zip"), "a") as zo:
    have = set(zo.namelist())
    for f in sorted(glob.glob(I("store", "media-add-*.zip"))):
        with zipfile.ZipFile(f) as zi:
            for n in zi.namelist():
                if n not in have: zo.writestr(n, zi.read(n)); have.add(n); n_media += 1
# 4 slide map and slide index: new rows only (freeze: append only)
append("Style/slide-map.csv", open(I("slide-map-rows.csv"), encoding="utf-8").read(), crlf=True)
append("Style/slide-index.md", open(I("slide-index-add.md"), encoding="utf-8").read())
# 5 study file, chart rebuild map rows, registry
assert not os.path.exists(J("Style/refs/case-competitions-2021-2024.md"))
shutil.copy2(I("case-competitions-2021-2024.md"), J("Style/refs/case-competitions-2021-2024.md"))
append("Style/refs/case-competitions-chart-rebuild-map.csv", open(I("chart-map-rows.csv"), encoding="utf-8").read(), crlf=True)
reg_p = "Style/refs/references.json"; archive(reg_p); reg = json.load(open(J(reg_p), encoding="utf-8"))
assert not any(r["key"] in KEYS for r in reg["references"])
reg["references"] += refs
json.dump(reg, open(J(reg_p), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
# 6 lessons (proposals.md is appended separately, after signing in for it)
append("logs/lessons-log.md", open(I("lessons-rows.md"), encoding="utf-8").read())
print("applied v2.38:", len(KEYS), "references,", len(add), "index entries,", n_media, "media files")
