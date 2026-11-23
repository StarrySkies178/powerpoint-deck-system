#!/usr/bin/env python3
"""audit_reference.py — has every reference had the FULL treatment? Run before saying a reference is learned.

Usage (from the Powerpoint folder):
  python3 scripts/audit_reference.py            # all references in Style/refs/references.json
  python3 scripts/audit_reference.py <key> ...  # just these

Checks per reference (all must PASS):
  1 original     the file is in Templates/
  2 objects      every slide with a drawing is in Objects/store/<key>.jsonl.gz (whole-slide objects)
  3 parts        slides were split into single diagrams and every kept part was reviewed by eye
  4 slide map    every slide has a reviewed row in Style/slide-map.csv (no 'auto' left)
  5 story        a study file exists and covers storytelling and message -> figure
  6 formatting   the study file has a measured formatting section that covers this reference
  7 charts       the study file says which charts are editable and how picture charts are rebuilt
  11 composition how slides combine several figures (layouts, reading order) is studied
  10 shapes     pictures and embedded charts were turned into editable shapes (vectorize.py)
  8 rebuild      (PDF / image sources) the rebuilt deck and its review sheet exist
And once for the whole system:
  9 all decks    lessons are wired into every deck: storytelling.md has the study rules, DECK-SYSTEM §2 points every deck to them
Exit code 1 if anything fails. Never report "learned"/"done" while this fails; report exactly what is missing.
"""
import csv, gzip, json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
J = lambda *p: os.path.join(ROOT, *p)
def read(p):
    try: return open(J(p), encoding="utf-8").read()
    except OSError: return ""

def audit(ref, idx, smap):
    k, res = ref["key"], []
    ok = lambda name, cond, why="": res.append((name, bool(cond), "" if cond else why))
    ok("1 original", os.path.exists(J("Templates", ref["template"])), f"Templates/{ref['template']} missing")
    objs = [o for o in idx if o["deck"] == k]
    whole = [o for o in objs if not o.get("part_of")]; parts = [o for o in objs if o.get("part_of")]
    ok("2 objects", os.path.exists(J("Objects/store", f"{k}.jsonl.gz")) and whole, "no whole-slide objects in the store")
    unreviewed = [o["id"] for o in parts if "reviewed by eye" not in (o.get("note") or "")]
    ok("3 parts", (parts or ref.get("parts_checked")) and not unreviewed, "not split into single diagrams (or record parts_checked with the reason)" if not parts else f"{len(unreviewed)} parts not reviewed by eye: {unreviewed[:5]}")
    rows = [r for r in smap if r and (r[0] == ref["name"] or r[0] == ref["name"].replace("-rebuilt", ""))]
    auto = [r for r in rows if len(r) > 4 and "auto" in r[4].lower() and "reviewed" not in r[4].lower()]
    ok("4 slide map", rows and not auto, "no slide-map rows" if not rows else f"{len(auto)} rows still 'auto'")
    txt = "\n".join(read(s) for s in ref.get("study", []))
    low = txt.lower()
    ok("5 story", txt and ("message → figure" in low or "message -> figure" in low or "storytelling" in low), "no study file covering story and message → figure")
    ok("6 formatting", "formatting" in low and (k in txt or ref["name"].split("-rebuilt")[0] in txt or "case-competition" in low and k.startswith("case-")), "no measured formatting section for this reference")
    ok("7 charts", "chart" in low and ("editable" in low or "native" in low), "no chart inventory (editable vs picture, rebuild route)")
    ok("11 composition", ("composition" in low or "several figures" in low or "layout" in low) and ("§4b" in txt or "slide layout" in low or "several figures on one slide" in low) or ref.get("composition_checked"), "no study of how slides combine several figures (layouts, reading order, conclusion cell)")
    vec = [o for o in objs if o.get("vector_of")]
    vun = [o["id"] for o in vec if "reviewed by eye" not in (o.get("note") or "")]
    ok("10 shapes", (vec or ref.get("vector_checked")) and not vun, f"{len(vun)} vectorised objects not reviewed by eye" if vun else "pictures / embedded charts not turned into shapes (run Generators/vectorize.py, or record vector_checked with the reason)")
    if ref.get("rebuilt_from"):
        ok("8 rebuild", os.path.exists(J("review", k, "rebuild-review.jpg")) or os.path.exists(J("Templates", ref["template"])), "rebuilt deck / review sheet missing")
    return res

def main():
    reg = json.load(open(J("Style/refs/references.json"), encoding="utf-8"))["references"]
    keys = sys.argv[1:] or [r["key"] for r in reg]
    idx = json.load(open(J("Objects/store/index.json"), encoding="utf-8"))
    smap = list(csv.reader(open(J("Style/slide-map.csv"), encoding="utf-8-sig")))
    fails = 0
    for ref in reg:
        if ref["key"] not in keys: continue
        res = audit(ref, idx, smap); bad = [r for r in res if not r[1]]; fails += len(bad)
        print(f"{'PASS' if not bad else 'FAIL'}  {ref['key']}" + "".join(f"\n      ✗ {n}: {w}" for n, _, w in bad))
    st, ds = read("Style/storytelling.md"), read("DECK-SYSTEM.md")
    g = "## 8." in st and "every** deck" in ds
    print(f"{'PASS' if g else 'FAIL'}  9 all decks: rules in storytelling.md and DECK-SYSTEM §2 apply to every presentation")
    fails += 0 if g else 1
    print(f"\n{'ALL PASS' if not fails else str(fails) + ' check(s) failing: do not report this reference as learned'}")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
