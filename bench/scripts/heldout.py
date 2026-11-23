"""heldout.py: keep a deck-as-reference (C) build blind to its own target slide (leave-one-out).

  python3 bench/scripts/heldout.py check [case ids...]    check every stored build and noise rebuild; exit 1 on a finding
  python3 bench/scripts/heldout.py brief [case ids...]    write cases/<id>/brief/: the builder's instructions (brief.md)
                                                         and, for C cases, slide-map.csv without the target's row

Why (v2.29): in the noise rebuilds of 2026-11-24 all six C builders came across their target slide's one-line
layout description in Style/slide-map.csv, and the study notes cite some targets as examples ("Pola 8" is C10's
slide). Leave-one-out covered stored objects only. Style/ is frozen, so the fix lives in bench/: builders get a
slide map without their target's row, and this check fails a C build whose files cite the target.

What counts as citing the target (all in the build's own files: build.js, build.py and any .md / .txt note there,
but not brief/ or prompt.md):
  - a stored-object id from the target slide (e.g. case19-ecluster-004, case19-ecluster-004p1)
  - "slide 14", "slide #14", "slides[13]" for the target's number, or the short deck name with it ("Mindcraft 14")
  - five words in a row from the target's row in Style/slide-map.csv that are not also in the case's prompt.md
A finding fails the case in bench_run.py and bench_noise.py (check "leave-one-out"); a person then reads the
finding and the build. The scorer itself is not involved. Named-slide cases (D, Z) may use their slide: not checked.
"""
import csv, json, os, re, sys, glob
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(B)
CASES = {c["id"]: c for c in json.load(open(os.path.join(B, "cases.json"), encoding="utf-8"))}
SLIDE_MAP = os.path.join(ROOT, "Style", "slide-map.csv")
# short names the study notes use for each reference deck (Style/refs/*.md cite slides as "<short> <n>")
SHORT = {"Case-2019-Polaris": ["Polaris"], "Case-2019-E-Cluster": ["E-Cluster", "ECluster", "E Cluster"],
         "Case-2019-Mindcraft": ["Mindcraft", "MindCraft"], "Case-2016-TrueNorth-Pola-China-growth": ["TrueNorth", "True North", "Pola"]}
WORD = re.compile(r"[a-z0-9]+")
# slides of the reference deck that repeat a target slide (found 2026-11-24 in roadmap 1.4: TrueNorth slide 18 is a
# recap that repeats slide 8 almost pixel for pixel); citing one of them is citing the target
TWINS = {"C10-strategy-table-truenorth": [18]}

def is_deck_case(cid): return CASES[cid].get("palette", "deck" if cid.startswith("C") else "slide") == "deck" or cid.startswith("C")

def store_key(deck):
    try:
        for r in json.load(open(os.path.join(ROOT, "Style", "refs", "references.json"), encoding="utf-8"))["references"]:
            if r.get("name") == deck or r.get("template") == deck + ".pptx": return r.get("key")
    except Exception: pass
    return None

def target_row(c):
    with open(SLIDE_MAP, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r["deck_file"] == c["deck"] and r["slide"] == str(c["slide"]): return r
    return None

def ngrams(text, n=5):
    w = WORD.findall(text.lower()); return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)}

def patterns(cid):
    c = CASES[cid]; n = int(c["slide"]); pats = []
    key = store_key(c["deck"])
    if key: pats.append(("stored object of the target slide", re.compile(rf"\b{re.escape(key)}-0*{n}(?:p\d+)?\b", re.I)))
    pats.append(("target slide number", re.compile(rf"\bslides?\s*(?:no\.?|number|#)?\s*0*{n}\b(?!\s*[-–]\s*\d)", re.I)))
    pats.append(("target slide index", re.compile(rf"slides\s*\[\s*{n - 1}\s*\]|slides\.item\(\s*{n - 1}\s*\)", re.I)))
    for s in SHORT.get(c["deck"], []): pats.append((f"study-note citation '{s} {n}'", re.compile(rf"\b{re.escape(s)}\s+0*{n}\b(?!\s*[-–.]\s*\d)", re.I)))
    for t in TWINS.get(cid, []):
        if key: pats.append((f"stored object of slide {t}, which repeats the target", re.compile(rf"\b{re.escape(key)}-0*{t}(?:p\d+)?\b", re.I)))
        pats.append((f"slide {t}, which repeats the target", re.compile(rf"\bslides?\s*(?:no\.?|number|#)?\s*0*{t}\b(?!\s*[-–]\s*\d)", re.I)))
        for s in SHORT.get(c["deck"], []): pats.append((f"study-note citation '{s} {t}' (repeats the target)", re.compile(rf"\b{re.escape(s)}\s+0*{t}\b(?!\s*[-–.]\s*\d)", re.I)))
    row = target_row(c)
    prompt = open(os.path.join(B, "cases", cid, "prompt.md"), encoding="utf-8").read()
    grams = (ngrams(row["what_the_slide_shows"] + " " + row.get("slide_title", "")) - ngrams(prompt)) if row else set()
    return pats, grams, row

def build_files(folder):
    out = []
    for f in sorted(os.listdir(folder)):
        p = os.path.join(folder, f)
        if os.path.isfile(p) and (f in ("build.js", "build.py") or (f.endswith((".md", ".txt")) and f not in ("prompt.md", "slide-text.txt"))): out.append(p)
    return out

def check(cid, folder):
    """Findings for one build folder (the case folder or a noise run); [] when clean or not a deck-as-reference case."""
    if not is_deck_case(cid): return []
    pats, grams, _ = patterns(cid); found = []
    for p in build_files(folder):
        t = open(p, encoding="utf-8", errors="replace").read()
        for name, rx in pats:
            for m in rx.finditer(t): found.append(f"{os.path.basename(p)}: {name} ('{m.group(0)}')")
        g = ngrams(t) & grams
        if g: found.append(f"{os.path.basename(p)}: words from the target's row in Style/slide-map.csv ('{sorted(g)[0]}'{' and more' if len(g) > 1 else ''})")
    return sorted(set(found))

BRIEF = """# Builder brief: {cid}

You are a fresh builder for one case of the reproduction benchmark in this folder. Write the build for this case from its prompt alone, the way a builder following `DECK-SYSTEM.md` would.

**Read:** `DECK-SYSTEM.md` (the procedure; what applies to one slide), `bench/README.md` ("Two modes, two honesty rules"), the prompt `bench/cases/{cid}/prompt.md`, the harness `bench/lib/bench_lib.js`{lib2}, and the framework as you need it: `Generators/`, `Style/refs/`, `Objects/README.md` and `Objects/store`, `Templates/`.
{mode}
**Do not open:** anything else in `bench/cases/` (no build.js, build.py, result.json, compare.png, candidate.*, original.*, slide-text.txt, case.json of any case, no `noise/` folder but your own), `bench/results*.md`, `bench/noise.md`, `bench/review-1.3/`, `bench/scripts/`. Do not run `bench/scripts/` or score against the original.

**Write only into your build folder:** `build.js` (and `build.py` if needed). `build.js` loads the harness relative to its own folder and saves with `L.save(pres, __dirname + "/candidate.pptx")`. You may run it and look at the render (use your own `-env:UserInstallation` for LibreOffice) and run `scripts/deck_lint.py`. Change no file outside your build folder.
"""
MODE_C = """**Mode: deck as reference, leave-one-out.** The reference deck is `Templates/{deck}.pptx`; you are building slide {n}, which in real use does not exist yet.
- Do not look at slide {n} in any form (the .pptx, a render, its text) and do not use its stored objects (`{key}-{n:03d}` and its parts).
- **Use `bench/cases/{cid}/brief/slide-map.csv` instead of `Style/slide-map.csv`.** It is the same file without slide {n}'s row. Do not open `Style/slide-map.csv`.
- If a study note in `Style/refs/` names slide {n} as an example ("{short} {n}"), skip that example.
- Your build files must not cite slide {n}, its stored objects or its slide-map row: `bench/scripts/heldout.py` checks this and fails the case if they do.
"""
MODE_D = """**Mode: named slide.** You may look at the named reference slide (slide {n} of `Templates/{deck}.pptx`) and use that slide's own stored object, as `bench/README.md` allows.
"""

def brief(cid):
    c = CASES[cid]; d = os.path.join(B, "cases", cid, "brief"); os.makedirs(d, exist_ok=True)
    if is_deck_case(cid):
        key = store_key(c["deck"]) or "?"
        mode = MODE_C.format(deck=c["deck"], n=int(c["slide"]), key=key, cid=cid, short=(SHORT.get(c["deck"]) or ["<deck>"])[0])
        with open(SLIDE_MAP, encoding="utf-8-sig") as f, open(os.path.join(d, "slide-map.csv"), "w", encoding="utf-8", newline="") as g:
            r = csv.reader(f); w = csv.writer(g); head = next(r); w.writerow(head); dropped = 0
            for row in r:
                if row[0] == c["deck"] and row[1] == str(c["slide"]): dropped += 1; continue
                w.writerow(row)
        assert dropped == 1, f"{cid}: expected one slide-map row for the target, found {dropped}"
    else:
        mode = MODE_D.format(deck=c["deck"], n=int(c["slide"]))
    lib2 = " and `bench/lib/place_named.py`" if not is_deck_case(cid) else ""
    open(os.path.join(d, "brief.md"), "w", encoding="utf-8").write(BRIEF.format(cid=cid, mode=mode, lib2=lib2))
    return d

if __name__ == "__main__":
    a = sys.argv[1:]; cmd = a[0] if a else "check"; ids = [i for i in CASES if not a[1:] or any(i.startswith(x) for x in a[1:])]
    if cmd == "brief":
        for cid in ids: print(cid, "->", os.path.relpath(brief(cid), ROOT))
    else:
        bad = 0
        for cid in ids:
            if not is_deck_case(cid): continue
            for folder in [os.path.join(B, "cases", cid)] + sorted(glob.glob(os.path.join(B, "cases", cid, "noise", "run*"))):
                f = check(cid, folder); rel = os.path.relpath(folder, B)
                print(("LEAK  " if f else "clean ") + rel + ("".join("\n      " + x for x in f) if f else ""))
                bad += bool(f)
        sys.exit(1 if bad else 0)
