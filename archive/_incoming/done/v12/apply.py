# run from the Powerpoint folder
import json, os, zipfile, shutil, re
D = "2026-11-23"; inc = "archive/_incoming/v12"
for f in ["Style/storytelling.md", "Style/patterns.json", "Style/pattern-catalogue.md", "Style/refs/case-competitions.md", "DECK-SYSTEM.md", "Objects/README.md", "logs/lessons-log.md", "logs/changelog.md", "Objects/store/index.json"]:
    b = os.path.basename(f); n, e = os.path.splitext(b); shutil.copy(f, f"archive/{n}_v1.1_{D}{e}")
# store: replace the case decks (now with diagram parts) and merge index
z = zipfile.ZipFile(f"{inc}/store-cases.zip")
for n in z.namelist():
    if n.endswith(".jsonl.gz"): open("Objects/store/" + n, "wb").write(z.read(n))
new = json.loads(z.read("index-cases.json")); keys = {o["deck"] for o in new if o["deck"].startswith("case-")}
idx = [o for o in json.load(open("Objects/store/index.json")) if o["deck"] not in keys] + [o for o in new if o["deck"] in keys]
json.dump(idx, open("Objects/store/index.json", "w"), ensure_ascii=False)
print("index", len(idx), "parts", sum(1 for o in idx if o.get("part_of")))
# files
for src, dst in [("patterns_story.js", "Generators/patterns_story.js"), ("demo_story.js", "Generators/demo_story.js"), ("story-patterns-demo.pptx", "Generators/story-patterns-demo.pptx"),
                 ("components.py", "Generators/components.py"), ("rebuild_slides.py", "Generators/rebuild_slides.py"), ("case-competitions.md", "Style/refs/case-competitions.md"),
                 ("chart-rebuild-map.csv", "Style/refs/case-competitions-chart-rebuild-map.csv"), ("fmt_measure.py", "scripts/measure_type_scale.py")]:
    shutil.copy(f"{inc}/{src}", dst)
# storytelling.md §8 (approved by the user: apply to all presentations)
s = open("Style/storytelling.md", encoding="utf-8").read()
if "## 8." not in s:
    s += """
## 8. Storyline rules from the case-competition study (all presentations) [Style/refs/case-competitions.md]

1. **Answer first.** Open with a one-page executive summary in one of four forms: lettered conclusions (A/B/C, letters reused in section titles), decision framework (stages → what we analysed → answer → goal bar), story diagram (findings → target → strategies → next steps) or pyramid (governing thought → key lines → supports). Generators: `letteredSummary`, `decisionFramework`, `storyDiagram`, `pyramidSummary`.
2. **Title chain test.** Read the titles alone before building: they must read as one argument. Use connectives where a slide follows from the one before: *therefore, hence, meanwhile, furthermore, then, in the long term*.
3. **Evidence → decision.** Close every block of evidence with a decision slide ("Therefore, we…") that shows the choice as a table or matrix.
4. **Problem before solution.** In a recommendation, put one problem slide before each strategy pillar.
5. **Role tags in long decks** (> 12 slides): "Analysis n:", "Strategy n:", "S-term:", "L-term:", the value-chain stage, or the exec-summary letter (A, B, C1…).
6. **Fixed so-what.** The so-what of an analysis slide sits in the same place on every slide (bottom-right box `soWhat()` or the takeaway bar).
7. **Panels.** At most 3 numbered panels per slide; each sub-headline is a sentence; together they prove the title (`evidencePanels`, `subhead`).
8. **Value bridge.** A deck with financials shows a waterfall from today's value to the target, by initiative (`waterfall`).
9. **Recurring characters.** Name customer personas and key competitors once and reuse them, with the same name, picture and colour, on every later slide.
10. **Message → figure.** Choose the exhibit from the message using the table in `Style/refs/case-competitions.md` §5, and make the point with one highlight (circle, box or accent colour), never with a second colour scheme.
"""
    open("Style/storytelling.md", "w", encoding="utf-8").write(s)
# patterns.json + catalogue
P = json.load(open("Style/patterns.json", encoding="utf-8")); have = {p["id"] for p in P["patterns"]}
NEW = [
 dict(id="persona-cards", category="A. Argument & storyline", name="Persona cards", story="Who the customers are: 2-5 named groups, each with a face, facts and reasons to buy.",
      use_when="Targeting, segmentation, product or channel choices that differ by customer group.", avoid_when="One undifferentiated customer; data-only segment sizing (use a chart).",
      parts="photo or initials -> name bar -> rows (age, income, needs, buys because, brand option)", count=[2, 5], scaling="columns share width; rows share height; label column 1.3in",
      emphasis="target persona in the main colour", title_example="Four customer groups, each with its own reason to buy", engine="grid",
      keywords="persona|customer profile|segment|target customer|consumer group|who buys", variants="speech-bubble personas (one quote each); persona rows (product <-> photo <-> age <-> income <-> pain point)",
      source_slides={"case-jaguar-amorepacific": "6", "case-harvester-lg": "9", "case-neptune-appliance": "10", "case-truenorth-pola": "9"}, source_count=4, generator="Generators/patterns_story.js personaCards"),
 dict(id="customer-journey", category="B. Sequence & process", name="Customer journey", story="How customers move from need to purchase and sharing, and where each group or channel matters.",
      use_when="Channel strategy, marketing, CRM, omni-channel; showing where to act along the path to purchase.", avoid_when="A simple process with no customer view (use chevron-process).",
      parts="4-6 stage chevrons -> lanes (personas, channels or 'journey / client / strategy') with dots and short actions per stage", count=[4, 6], scaling="stage width = (W - label column)/n; lanes share height",
      emphasis="one stage highlighted; key cells in the accent colour", title_example="Each customer group decides at a different moment of the journey", engine="grid",
      keywords="customer journey|consumer journey|path to purchase|touch point|awareness|purchase|after-sales|o2o|omni-channel", variants="central funnel with online actions left and offline right; stage x short/long term synthesis",
      source_slides={"case-jaguar-amorepacific": "12", "case-littleboat-gree": "14", "case-polaris-gree": "15", "case-sparkle-shiseido": "15"}, source_count=4, generator="Generators/patterns_story.js customerJourney"),
 dict(id="evidence-panels", category="A. Argument & storyline", name="Evidence panels with insights", story="A conclusion proved by 2-3 numbered findings, each with its own exhibit, plus the so-what.",
      use_when="Analysis slides in any deck: market, customer, competitor, diagnosis.", avoid_when="A single exhibit that needs the whole slide.",
      parts="title -> 2-3 panels (number chip + sub-headline sentence + chart/table/bullets) -> insights column -> fixed so-what box", count=[1, 3], scaling="2 panels side by side; 3 = 2 on top + 1 wide; insight column ~30%",
      emphasis="one highlight per chart; so-what box in the same place on every slide", title_example="Skin care is the largest segment, and premium grows fastest", engine="grid",
      keywords="panels|sub-headline|insights|key insights|comment|implication|recommendation|so what", variants="chart -> chevron -> takeaway box (chartTakeaway)",
      source_slides={"all 10 case decks": "most content slides"}, source_count=120, generator="Generators/patterns_story.js evidencePanels"),
]
for p in NEW:
    if p["id"] not in have: P["patterns"].append(p)
VAR = {"exec-summary-tree": ("lettered conclusions (A/B/C); decision framework (stages x dimensions -> answer -> goal); story diagram (findings -> target -> strategies -> next steps); pyramid diagram", "Generators/patterns_story.js letteredSummary / decisionFramework / storyDiagram / pyramidSummary"),
       "scoring-table": ("options x criteria with a verdict column (tick/cross, up/down); client-vs-peers diagnosis with the client column dashed", None),
       "table": ("status quo | current practice | best demonstrated practice (named peers)", None),
       "bubble-portfolio": ("positioning map: two axes, bubble = revenue, client in the main colour, shaded target zone", "Generators/patterns_story.js positioningMap"),
       "issue-tree": ("issue as a question -> goal -> strategy, 3 aligned columns", "Generators/patterns_story.js issueGoalStrategy"),
       "stacked-chart": ("stacked columns + two-period CAGR table, chosen row circled", "Generators/patterns_story.js stackedCagr"),
       "column-chart": ("paired columns with +x% growth callouts; history vs forecast with CAGR callouts", "Generators/patterns_story.js growthPairs / growthBars"),
       "kpi-numbers": ("donut KPIs (survey %, drivers)", "Generators/patterns_story.js donutKpis")}
for p in P["patterns"]:
    if p["id"] in VAR:
        v, g = VAR[p["id"]]
        if v not in (p.get("variants") or ""): p["variants"] = ((p.get("variants") or "") + ("; " if p.get("variants") else "") + v)
        if g and ("not yet" in str(p.get("generator", "")) or not p.get("generator")): p["generator"] = g
        elif g and g not in str(p.get("generator")): p["generator"] = str(p.get("generator")) + "; " + g
P["version"] = str(P.get("version", "")) + "+cases-" + D
json.dump(P, open("Style/patterns.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
c = open("Style/pattern-catalogue.md", encoding="utf-8").read()
if "`persona-cards`" not in c:
    add = "\n## H. Added from the case-competition study (2026-11-23)\n\n"
    for p in NEW:
        add += f"### `{p['id']}` — {p['name']}\n- **Story:** {p['story']}\n- **Use when:** {p['use_when']}\n- **Avoid when:** {p['avoid_when']}\n- **Parts:** {p['parts']}\n- **Count:** {p['count'][0]}–{p['count'][1]} · **Engine:** {p['engine']}\n- **Generator:** {p['generator']}\n- **Scaling:** {p['scaling']}\n- **Emphasis:** {p['emphasis']}\n- **Variants:** {p['variants']}\n- **Example title:** \"{p['title_example']}\"\n- **Sources:** {', '.join(k + ' ' + v for k, v in p['source_slides'].items())}\n\n"
    add += "**New variants of existing patterns** (also in patterns.json):\n" + "".join(f"- `{k}`: {v[0]}" + (f" ({v[1]})" if v[1] else "") + "\n" for k, v in VAR.items())
    open("Style/pattern-catalogue.md", "w", encoding="utf-8").write(c + add)
# DECK-SYSTEM: make the pointer apply to every deck
s = open("DECK-SYSTEM.md", encoding="utf-8").read()
s = s.replace("| Stage 2: writing the storyline of a recommendation / strategy deck | `Style/storytelling.md`, then `Style/refs/case-competitions.md` (story skeleton, 4 executive-summary forms, title chains, the message → figure table) | Section 4 of this file |",
              "| Stage 2–3 of **every** deck: storyline and choosing figures | `Style/storytelling.md` (§8 = case-study rules), then `Style/refs/case-competitions.md` §2 (exec-summary forms), §5 (message → figure), §6b (formatting) | Section 4 of this file |")
s = s.replace("objstore.py, rebuild_slides.py (PDF/image → editable slides), build_*.js", "patterns_story.js (exec-summary forms, evidence panels, personas, journey, story charts), objstore.py, components.py (slides → single diagrams), rebuild_slides.py (PDF/image → editable slides), build_*.js")
open("DECK-SYSTEM.md", "w", encoding="utf-8").write(s)
o = open("Objects/README.md", encoding="utf-8").read()
if "components.py" not in o:
    o += "\n## Single diagrams (parts)\n\nSlides are also split into their separate diagrams by `Generators/components.py` (whitespace cuts, then checked by eye). Parts have ids like `case-jaguar-amorepacific-012p1`, with `part_of` and `kind` in `index.json`, and every operation (place, recolour, set_texts, extend, combine) works on them. Done so far for the 10 case-competition decks (142 parts). Picture charts are never reused as charts: `Style/refs/case-competitions-chart-rebuild-map.csv` maps each to a native builder.\n"
    open("Objects/README.md", "w", encoding="utf-8").write(o)
L = open("logs/lessons-log.md", encoding="utf-8").read()
L = L.replace("| Study of 10 case-competition decks | — |", "| Study of 10 case-competition decks | User: 'it should encompass all presentations' (2026-11-23) |").replace("(see Style/refs/case-competitions.md §7) | Style/storytelling.md", "(see Style/refs/case-competitions.md §7) | Style/storytelling.md")
L = re.sub(r"(\| Study of 10 case-competition decks \|.*?)\| proposed \|", r"\1| applied |", L)
open("logs/lessons-log.md", "w", encoding="utf-8").write(L)
ch = open("logs/changelog.md", encoding="utf-8").read()
row = "| 1.2 | 2026-11-23 | Case-competition lessons now apply to every presentation: storytelling.md §8 (10 rules), 3 new patterns (persona-cards, customer-journey, evidence-panels) and 8 variants in patterns.json + catalogue §H; DECK-SYSTEM §2 points Stage 2–3 of every deck to them. New `Generators/patterns_story.js` (19 builders: 4 exec-summary forms, evidence panels, chart→takeaway, issue→goal→strategy, personas, journey, stacked+CAGR, growth pairs, growth bars, donut KPIs, positioning map, chartIn incl. radar) with a 14-slide test deck. `Generators/components.py` splits slides into single diagrams: 142 parts from the case decks, each checked by eye. Formatting measured (type scale, title length, colours, grid) in case-competitions.md §6b; style-rules.md unchanged. 42 picture charts mapped to native builders | User: 'it should encompass all presentations'; 'have u taken all the artefacts, diagrams, formatting?' | Style/storytelling.md, Style/patterns.json, Style/pattern-catalogue.md, Style/refs/case-competitions*.{md,csv}, Generators/patterns_story.js, Generators/components.py, Generators/demo_story.js, Generators/story-patterns-demo.pptx, Objects/store/case-*, Objects/README.md, DECK-SYSTEM.md, logs/*, scripts/measure_type_scale.py |\n"
if "| 1.2 |" not in ch: ch = ch.replace("|---|---|---|---|---|\n", "|---|---|---|---|---|\n" + row, 1)
open("logs/changelog.md", "w", encoding="utf-8").write(ch)
print("done")
