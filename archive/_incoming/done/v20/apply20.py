#!/usr/bin/env python3
"""v2.0 — learn 10 case-competition decks (2019-20). Run from the Powerpoint folder."""
import os, json, gzip, shutil, zipfile, csv, datetime, re, sys
ROOT = os.getcwd(); INC = os.path.join(ROOT, "archive/_incoming/v20")
D = datetime.date.today().isoformat(); PREV = "1.9"
J = lambda *p: os.path.join(ROOT, *p); I = lambda *p: os.path.join(INC, *p)
def archive(rel):
    if os.path.exists(J(rel)):
        b, e = os.path.splitext(os.path.basename(rel))
        dst = J("archive", f"{b}_v{PREV}_{D}{e}")
        if not os.path.exists(dst): shutil.copy2(J(rel), dst)
def put(src, rel):
    archive(rel); os.makedirs(os.path.dirname(J(rel)), exist_ok=True); shutil.copy2(src, J(rel))
def edit(rel, fn):
    archive(rel); t = open(J(rel), encoding="utf-8").read(); n = fn(t)
    assert n != t, f"no change in {rel}"; open(J(rel), "w", encoding="utf-8").write(n)

KEYS = ["case19-bainology","case19-ecluster","case19-innovision","case19-mindcraft","case19-polaris","case20-gym-brief","case20-vaccine","case20-tnt","case20-baincraft","case20-doubleclick"]

# 1. code
for f in ["patterns_story.js","components.py","rebuild_slides.py","demo_cases1920.js","cases1920-demo.pptx"]:
    put(I("Generators", f), f"Generators/{f}")
# 2. templates (originals + rebuilt)
for f in os.listdir(I("templates")):
    dst = J("Templates", f)
    if not os.path.exists(dst): shutil.copy2(I("templates", f), dst)
# 3. review sheets
for d in os.listdir(I("review")):
    os.makedirs(J("review", d), exist_ok=True)
    for f in os.listdir(I("review", d)): shutil.copy2(I("review", d, f), J("review", d, f))
# 4. store: per-deck files, index, media
S = J("Objects/store")
for k in ["index.json", "media.zip"]: archive(f"Objects/store/{k}")
for k in KEYS:
    assert not os.path.exists(os.path.join(S, f"{k}.jsonl.gz")), f"{k} already in store"
    shutil.copy2(I("store", f"{k}.jsonl.gz"), os.path.join(S, f"{k}.jsonl.gz"))
idx = json.load(open(os.path.join(S, "index.json"), encoding="utf-8"))
idx = [o for o in idx if o["deck"] not in KEYS] + json.load(open(I("store", "index-add.json"), encoding="utf-8"))
json.dump(idx, open(os.path.join(S, "index.json"), "w", encoding="utf-8"), ensure_ascii=False)
with zipfile.ZipFile(os.path.join(S, "media.zip"), "a") as zo:
    have = set(zo.namelist())
    for part in ("media-add-1.zip", "media-add-2.zip"):
        with zipfile.ZipFile(I("store", part)) as zi:
            for n in zi.namelist():
                if n not in have: zo.writestr(n, zi.read(n)); have.add(n)
# 5. slide map + slide index
archive("Style/slide-map.csv"); rows = list(csv.reader(open(I("slide-map-add.csv"), encoding="utf-8")))
names = {r[0] for r in rows}
old = [r for r in csv.reader(open(J("Style/slide-map.csv"), encoding="utf-8-sig")) if not r or r[0] not in names]
with open(J("Style/slide-map.csv"), "w", newline="", encoding="utf-8-sig") as f: csv.writer(f).writerows(old + rows)
archive("Style/slide-index.md")
with open(J("Style/slide-index.md"), "a", encoding="utf-8") as f: f.write(open(I("slide-index-add.md"), encoding="utf-8").read())
# 6. study file + registry
put(I("Style/refs/case-competitions-2019-2020.md"), "Style/refs/case-competitions-2019-2020.md")
archive("Style/refs/references.json")
reg = json.load(open(J("Style/refs/references.json"), encoding="utf-8"))
reg["references"] = [r for r in reg["references"] if r["key"] not in KEYS]
STUDY = ["Style/refs/case-competitions-2019-2020.md"]
nm = {"case19-bainology":"Case-2019-Bainology","case19-ecluster":"Case-2019-E-Cluster","case19-innovision":"Case-2019-InnoVision","case19-mindcraft":"Case-2019-Mindcraft","case19-polaris":"Case-2019-Polaris"}
for k, n in nm.items(): reg["references"].append({"key": k, "name": n, "template": n + ".pptx", "study": STUDY})
for k, n in [("case20-gym-brief","Case-2020-Gym-case-brief"),("case20-vaccine","Case-2020-Vaccine"),("case20-tnt","Case-2020-TNT"),("case20-baincraft","Case-2020-Baincraft"),("case20-doubleclick","Case-2020-DoubleClick")]:
    reg["references"].append({"key": k, "name": n + "-rebuilt", "template": n + "-rebuilt.pptx", "original": n + "-original.pdf", "study": STUDY, "rebuilt_from": "pdf/images"})
for r in reg["references"]:
    if r["key"] == "case19-polaris": r["vector_checked"] = "no picture charts: its charts are drawn shapes (freeforms) already; its pictures are logos, photos and icons under 1 sq in (checked by eye 2026-11-23)"
    if r["key"] == "case20-baincraft": r["vector_checked"] = "image PDF rebuilt into shapes; the 17 pictures the rebuild left (photos, logos) were traced again and none was worth keeping (checked by eye 2026-11-23)"
    if r["key"] == "case20-gym-brief":
        r["vector_checked"] = "one text page (the case prompt); the only picture is an organiser logo (checked by eye 2026-11-23)"
        r["parts_checked"] = "one text page with no diagrams: the two candidate parts were text and a logo (checked by eye 2026-11-23)"
json.dump(reg, open(J("Style/refs/references.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
# 7. storytelling rules 12-15
add = open(I("story_add.md"), encoding="utf-8").read().strip()
def st(t):
    i = t.index("## 8."); j = t.find("\n## ", i + 5); j = len(t) if j < 0 else j
    return t[:j].rstrip() + "\n" + add + "\n" + t[j:]
edit("Style/storytelling.md", st)
# 8. case-competitions.md: point to the second study
def cc(t):
    t = t.replace("## 2. Four ways they write the executive summary\n", "## 2. Four ways they write the executive summary\n\nMore forms (situation → pillars → outcome; label-block rows; situation · strategy · projection) in `case-competitions-2019-2020.md` §2.\n", 1)
    t = t.replace("## 5. Message → figure: how they turn a point into a picture\n", "## 5. Message → figure: how they turn a point into a picture\n\nNew rows from the 2019–20 decks (risk heat map, value tree, heat grid, scoring table, initiative matrix, exploded bar, phased Gantt, agenda tracker) are in `case-competitions-2019-2020.md` §5.\n", 1)
    return t
edit("Style/refs/case-competitions.md", cc)
# 9. DECK-SYSTEM: every deck uses the new study and rules 12-15
def ds(t):
    t = t.replace("`Style/refs/case-competitions.md` §2 (exec-summary forms), §5 (message → figure), §6b (formatting)",
                  "`Style/refs/case-competitions.md` §2 (exec-summary forms), §5 (message → figure), §6b (formatting), and `Style/refs/case-competitions-2019-2020.md` §2 and §5 (more forms and figures)", 1)
    t = t.replace("  - Executive summary in one of the four forms: lettered conclusions, decision framework, story diagram or pyramid (`patterns_story.js`).",
                  "  - Executive summary in one of the forms: lettered conclusions, decision framework, story diagram, pyramid, or situation → pillars → outcome (`T3B1`) (`patterns_story.js`).", 1)
    t = t.replace("  - Personas and competitors are named once and reused with the same name, picture and colour.\n",
                  "  - Personas and competitors are named once and reused with the same name, picture and colour.\n"
                  "  - A key-questions slide sits between the analysis and the strategy; the strategy answers the questions by number.\n"
                  "  - The strategy has a short name; its pillars are lettered (A/B/C, A1…) and the letter chip leads every title of that pillar.\n"
                  "  - Risks are a numbered heat map with the same numbers in the mitigation list (`riskMatrix`).\n"
                  "  - A headline target is shown as a value tree tied to the initiatives (`valueTree`); the roadmap is a Gantt under named phases (`gantt`).\n", 1)
    t = t.replace("(HALF2, GRID4I, BAND2, T2B1, T1B2, GRID4, EXI, L2R1, COL3, FLOW, CHAIN, EXB), built with `composeSlide()`",
                  "(HALF2, GRID4I, BAND2, T2B1, T1B2, T3B1, GRID4, EXI, L2R1, R2L1, COL3, COL4/COLN, FLOW with 2–4 blocks, CHAIN, EXB), built with `composeSlide()`; add `takeaway` to a panel when each panel has its own so-what", 1)
    t = t.replace("personas/competitors consistent", "personas/competitors consistent; key-questions slide; named strategy with lettered pillars; numbered risk heat map; value tree + phased roadmap", 1)
    return t
edit("DECK-SYSTEM.md", ds)
# 10. pattern catalogue
archive("Style/patterns.json")
P = json.load(open(J("Style/patterns.json"), encoding="utf-8")); byid = {p["id"]: p for p in P["patterns"]}
SRC = {"Case-2019/2020 decks": "see Style/refs/case-competitions-2019-2020.md §5"}
def upd(pid, gen, variants=None):
    p = byid[pid]; p["generator"] = gen
    if variants: p["variants"] = (p.get("variants", "") + ("; " if p.get("variants") else "") + variants)
    p.setdefault("source_slides", {}).update(SRC)
upd("gantt", "Generators/patterns_story.js gantt", "Gantt grouped by pillar under a phase staircase (0-1 / 1-3 / 3-5 years, named phases), priority bars in the main colour, milestones as diamonds")
upd("phase-matrix", "Generators/patterns_story.js gantt (phases)", "named phases over the roadmap")
upd("scoring-table", "Generators/patterns_story.js scoringTable", "Harvey balls or ticks per player x criterion, own column in a dashed box, verdict row, vertical row-group labels")
upd("driver-tree", "issueTree; Generators/patterns_story.js valueTree", "target = a x b x c with each leaf tied to a lettered initiative")
upd("tracker", "frame({tracker}); Generators/patterns_story.js agendaTracker", "agenda repeated before each section with the current section highlighted")
upd("exec-summary-tree", P["patterns"][0]["generator"] + " / composeSlide T3B1", "situation boxes -> pillars -> outcome (T3B1)")
new = [
 dict(id="risk-matrix", category="F. Forces & cause-effect", name="Risk heat map with mitigations", story="Which risks matter most and what we do about each.", use_when="Risk section of a recommendation.", avoid_when="One or two risks: use a short list.", parts="likelihood x impact grid, numbered risk dots, dashed priority zone -> chevron -> risk | mitigation rows with the same numbers", count=[3, 8], scaling="rows share the height; >8 risks: group them", emphasis="dots in the priority zone in the accent colour", title_example="Four risks need action now; the rest we monitor", engine="grid", keywords="risk|mitigation|likelihood|impact|heat map", variants="map only (labels beside dots); quadrant names (detect / prevent / monitor / low control)", source_slides=SRC, source_count=7, generator="Generators/patterns_story.js riskMatrix"),
 dict(id="heat-grid", category="E. Compare & position", name="Segment heat grid", story="Where the demand concentrates across two dimensions.", use_when="Choosing target segments or cells among many.", avoid_when="Fewer than 6 cells: use bars.", parts="rows (segments, optional vertical group labels) x columns (needs) cells shaded by value, target cells dashed", count=[6, 40], scaling="cell size from the grid; labels 9-12 pt", emphasis="target cells boxed", title_example="Young professionals in tier-1 cities are the core segment", engine="grid", keywords="heat map|segment|matrix|share by cell", variants="customer-type mosaic with icons", source_slides=SRC, source_count=3, generator="Generators/patterns_story.js heatGrid"),
 dict(id="initiative-matrix", category="A. Argument & storyline", name="Initiative matrix", story="The initiatives side by side, each read top-down from what to impact.", use_when="Strategy overview; comparing 3-4 initiatives on the same rows.", avoid_when="One initiative: use a card.", parts="lettered column headers x labelled row bands (overview / detail / impact), optional journey chain at the foot", count=[2, 5], scaling="columns share the width", emphasis="the pillar being discussed tinted", title_example="Four initiatives improve every step of the customer journey", engine="grid", keywords="initiatives|pillars|overview detail impact", variants="COL4/COLN layout of panels", source_slides=SRC, source_count=4, generator="Generators/patterns_story.js initiativeMatrix"),
 dict(id="exploded-bar", category="G. Data", name="Exploded bar (bar of bar)", story="Of those who do X, why or how?", use_when="A share whose sub-group needs a breakdown (survey results).", avoid_when="The breakdown is of the whole: use one bar chart.", parts="one stacked column -> dashed bracket from the chosen segment -> breakdown bar chart", count=[3, 10], scaling="breakdown bars share the height", emphasis="chosen segment and top reason in the main colour", title_example="Nine in ten work out, and most do it to keep in shape", engine="chart", keywords="survey|breakdown|of which|bar of bar", variants="two-level explosion", source_slides=SRC, source_count=2, generator="Generators/patterns_story.js explodedBar"),
]
for n in new:
    if n["id"] not in byid: P["patterns"].append(n)
json.dump(P, open(J("Style/patterns.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
# 11. logs
def cl(t):
    line = ("| 2.0 | " + D + " | Learned 10 more case-competition decks (2019 jewellery case ×5 .pptx, 2020 fitness case ×5 image PDFs incl. the case brief; 238 slides; duplicates skipped). "
            "Every slide looked at and mapped by hand (layout, role, message → figure); 5 image PDFs rebuilt into editable slides; 238 slide objects, 229 single diagrams and 27 vectorised drawings kept after review by eye (559 candidates; logos, photos, team pages, fragments dropped). "
            "New study `Style/refs/case-competitions-2019-2020.md`; storytelling rules 12–15 (key questions, named strategy + lettered pillars, numbered risk heat map, value tree + phased roadmap) wired into DECK-SYSTEM Stage 2/3 and §7; "
            "new builders riskMatrix, gantt, scoringTable, harvey, initiativeMatrix, explodedBar, heatGrid, agendaTracker, valueTree; layouts T3B1, COL4/COLN, FLOW 2–4 blocks, panel takeaway; 4 catalogue patterns added, 6 updated. "
            "Fixes: splitter ignores divider lines and straddling labels (Polaris 4 → 29 parts); image rebuild removes text from picture regions and caps oversized fonts. Test deck `Generators/cases1920-demo.pptx` | "
            "User: learn these and do the full process like the previous decks | DECK-SYSTEM.md, Style/storytelling.md, Style/refs/case-competitions*.md, Style/refs/references.json, Style/patterns.json, Style/slide-map.csv, Style/slide-index.md, Generators/patterns_story.js, components.py, rebuild_slides.py, demo_cases1920.js, Objects/store/*, Templates/*, review/* |\n")
    k = t.index("|---|"); k = t.index("\n", k) + 1
    return t[:k] + line + t[k:]
edit("logs/changelog.md", cl)
if os.path.exists(J("logs/lessons-log.md")):
    archive("logs/lessons-log.md")
    with open(J("logs/lessons-log.md"), "a", encoding="utf-8") as f:
        f.write(f"\n- {D} (v2.0, applied): from 10 case decks 2019–20 — rules 12–15 in storytelling §8 (key questions before the strategy; named strategy + lettered pillars; numbered risk heat map with matching mitigation list; value tree for the headline target + phased roadmap). Applied to every deck.\n")
print("applied v2.0")
