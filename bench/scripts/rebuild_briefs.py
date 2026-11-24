"""rebuild_briefs.py <run name>: write blind briefs for 3 fresh rebuilds of each C case (roadmap 4.2 change control).

Folders: bench/phase4/<run>/<case>/r1, r2, r3, each with brief/brief.md and brief/slide-map.csv (the slide map without
the target's row, and without rows of slides that repeat the target: heldout.TWINS). Renders of the deck's other slides,
drawn from the PowerPoint PDFs with the target and its twins left out, are in bench/phase4/other-slides/<case>/."""
import json, os, sys, csv, io, shutil
sys.path.insert(0, os.path.dirname(__file__))
import heldout
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(B)
SHORT = {"Case-2019-Polaris": "Polaris", "Case-2019-E-Cluster": "E-Cluster", "Case-2019-Mindcraft": "Mindcraft", "Case-2016-TrueNorth-Pola-China-growth": "Pola"}
KEY = {r["name"]: r["key"] for r in json.load(open(os.path.join(ROOT, "Style/refs/references.json")))["references"]}
T = """# Builder brief: {cid}, {run}, rebuild {k}

You are a fresh builder for one case of the reproduction benchmark in this folder (a working copy of the deck system). Write the build for this case the way a builder following `DECK-SYSTEM.md` would.

**Read:** `DECK-SYSTEM.md` (the procedure; what applies to one slide), `bench/README.md` ("Two modes, two honesty rules"), the prompt `bench/cases/{cid}/prompt.md`, the harness `bench/lib/bench_lib.js`, and the framework as you need it: `Generators/`, `Style/refs/`, `Objects/README.md` and `Objects/store`, `Templates/`. Build the slide the way a builder following `DECK-SYSTEM.md` would, choosing your own approach (generators, the deck's style profile, stored objects of the deck's OTHER slides, or a mix).

**Mode: deck as reference, leave-one-out.** The reference deck is `Templates/{deck}.pptx`; you are building slide {n}, which in real use does not exist yet.
- Do not look at slide {n} in any form (the .pptx, a render, its text) and do not use its stored objects (`{key}-{n:03d}` and its parts).{twins}
- **Use `{d}/brief/slide-map.csv` instead of `Style/slide-map.csv`.** It is the same file without the target's row. Do not open `Style/slide-map.csv`.
- If a study note in `Style/refs/` names slide {n} as an example ("{short} {n}"), skip that example.
- Renders of the deck's other slides are in `bench/phase4/other-slides/{cid}/` (`NN.png` = slide NN; slide {n} is left out). Use them instead of rendering `Templates/` yourself.
- Your build files must not cite slide {n}, its stored objects or its slide-map row: `bench/scripts/heldout.py` checks this and fails the build if they do.

**Do not open:** anything in `bench/cases/` except `bench/cases/{cid}/prompt.md` (no build.js, build.py, result.json, compare.png, candidate.*, original.*, slide-text.txt, case.json, brief/, noise/ of any case), anything in `bench/phase4/` outside your own folder `{d}/` and the case's `other-slides/`, `bench/diagnosis-1.4/`, `bench/originals-powerpoint/`, `bench/review-*`, `bench/rating-1.7/`, `bench/results*.md`, `bench/noise.md`, `bench/scripts/`. Do not run `bench/scripts/` or score against the original.

**Write only into your build folder `{d}/`:** `build.js` (and `build.py` if needed; a `build.py` runs after `build.js` with your folder as working directory). `build.js` loads the harness relative to its own folder, `const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));`, and saves with `L.save(pres, __dirname + "/candidate.pptx")`. You may run it and look at the render (LibreOffice with your own profile: `soffice -env:UserInstallation=file:///tmp/lo_{tag} --headless --convert-to pdf ...`, then `pdftoppm`), and run `scripts/deck_lint.py`. Change no file outside your build folder, do not use git, and do not change the framework files.
"""
def main(run):
    for c in json.load(open(os.path.join(B, "cases.json"))):
        cid = c["id"]
        if not cid.startswith("C"): continue
        n = int(c["slide"]); twins = heldout.TWINS.get(cid, [])
        key = KEY[c["deck"]]
        tw = "".join(f"\n- Slide {t} of the deck repeats slide {n}, so it counts as slide {n}: no render, text or stored objects of slide {t} either (`{key}-{t:03d}` and its parts). Its row is also left out of your slide map." for t in twins)
        rows = list(csv.reader(open(os.path.join(B, "cases", cid, "brief", "slide-map.csv"), encoding="utf-8-sig")))
        rows = [r for r in rows if not (len(r) > 1 and r[0] == c["deck"] and r[1].isdigit() and int(r[1]) in twins)]
        for k in (1, 2, 3):
            d = f"bench/phase4/{run}/{cid}/r{k}"; os.makedirs(os.path.join(ROOT, d, "brief"), exist_ok=True)
            csv.writer(open(os.path.join(ROOT, d, "brief", "slide-map.csv"), "w", encoding="utf-8", newline="")).writerows(rows)
            open(os.path.join(ROOT, d, "brief", "brief.md"), "w").write(T.format(cid=cid, run=run, k=k, deck=c["deck"], n=n, key=key, short=SHORT[c["deck"]], d=d, twins=tw, tag=f"{run}{cid[:3]}{k}"))
    print("briefs written for", run)

if __name__ == "__main__": main(sys.argv[1])
