#!/usr/bin/env python3
"""v2.5 — decomposing a place (country → city → site → building → zone): maps as editable shapes. Run from the Powerpoint folder."""
import os, json, shutil, datetime
ROOT = os.getcwd(); INC = os.path.join(ROOT, "archive/_incoming/v25"); D = datetime.date.today().isoformat(); PREV = "2.4"
J = lambda *p: os.path.join(ROOT, *p); I = lambda *p: os.path.join(INC, *p)
def archive(rel):
    if os.path.exists(J(rel)):
        b, e = os.path.splitext(os.path.basename(rel)); dst = J("archive", f"{b}_v{PREV}_{D}{e}")
        if not os.path.exists(dst): shutil.copy2(J(rel), dst)
def put(src, rel): archive(rel); os.makedirs(os.path.dirname(J(rel)), exist_ok=True); shutil.copy2(src, J(rel))
def edit(rel, fn):
    archive(rel); t = open(J(rel), encoding="utf-8").read(); n = fn(t)
    assert n != t, f"no change in {rel}"; open(J(rel), "w", encoding="utf-8").write(n)
for f in ["patterns_place.js", "demo_place.js", "place-demo.pptx"]: put(I("Generators", f), f"Generators/{f}")
put(I("maps_README.md"), "Objects/maps/README.md")
os.makedirs(J("review", "place-demo"), exist_ok=True)
for f in ["place-demo-1.jpg", "place-demo-2.jpg"]: shutil.copy2(I(f), J("review", "place-demo", f))
# composeSlide: a panel can be a map
edit("Generators/patterns_story.js", lambda t: t.replace(
    "  else if (p.draw) p.draw(slide, inner);\n",
    "  else if (p.draw) p.draw(slide, inner);\n  else if (p.map) require(\"./patterns_place.js\").mapRegions(pres, slide, p.map, inner);   // a map panel: any mapRegions spec\n", 1))
# study + rule 16
edit("Style/refs/case-competitions-2019-2020.md", lambda t: t.rstrip() + "\n" + open(I("study_place.md"), encoding="utf-8").read())
rule = ("16. **Decompose a place from the whole to the part.** When the answer is \"where\", go level by level (country → region → city → district → site → building → floor → zone) "
        "and stop at the level the decision is made. At each level the chosen part is in the main colour and the rest grey, and the next level zooms into exactly that part "
        "(zoom lines, the same highlight or a breadcrumb). Put the selection logic (criteria, score, formula or funnel) next to the map, and give every pin or zone its numbers in a callout. "
        "Builders: `mapRegions`, `regionMultiples`, `geoZoom`, `siteCallouts`, `buildingExplode`, `floorPlan` in `Generators/patterns_place.js`; map data in `Objects/maps/` "
        "(more with `scripts/get_map.py`). Name the map source in the source line. See `Style/refs/case-competitions-2019-2020.md` §10.")
def st(t):
    i = t.index("## 8."); j = t.find("\n## ", i + 5); j = len(t) if j < 0 else j
    return t[:j].rstrip() + "\n" + rule + "\n" + t[j:]
edit("Style/storytelling.md", st)
def ds(t):
    a = t.index("- **Slide layout:**"); b = t.index("\n", a) + 1
    line = ("- **Places (where?):** break the place down level by level with `Generators/patterns_place.js` — country map (`mapRegions`), regional panels (`regionMultiples`), "
            "zoom chain country → province → city → sites (`geoZoom`, `siteCallouts`), building and floors (`buildingExplode`, `floorPlan`). A map can also be a `composeSlide` panel (`map:`). "
            "Every region is an editable shape; data in `Objects/maps/` (fetch more with `scripts/get_map.py`); name the map source; a full China map always carries the South China Sea inset (storytelling rule 16).\n")
    t = t[:b] + line + t[b:]
    return t.replace("patterns_story.js (exec-summary forms, evidence panels, personas, journey, story charts),",
                     "patterns_story.js (exec-summary forms, evidence panels, personas, journey, story charts), patterns_place.js (maps, zoom chains, sites, buildings, floor plans),", 1)
edit("DECK-SYSTEM.md", ds)
# pattern catalogue
archive("Style/patterns.json"); P = json.load(open(J("Style/patterns.json"), encoding="utf-8")); by = {p["id"]: p for p in P["patterns"]}
SRC = {"Case-2019/2020 decks": "Style/refs/case-competitions-2019-2020.md §10"}
m = by.get("map")
if m:
    m["generator"] = "Generators/patterns_place.js mapRegions (any country/province/city from Objects/maps)"
    m["variants"] = (m.get("variants", "") + "; " if m.get("variants") else "") + "choropleth by value with bins; sized city dots with 'BJ, 20' labels; highlighted regions; China with South China Sea inset; map as a composeSlide panel (map:)"
    m.setdefault("source_slides", {}).update(SRC)
new = [
 dict(id="region-multiples", category="E. Compare & position", name="Regional small multiples", story="The same country split into regions, each with its core city and next cities.", use_when="A national plan run region by region (radiation from core cities).", avoid_when="One region matters: zoom into it instead.", parts="dashed panels per region with title, region map, star = core city, pins by stage, shared legend", count=[2, 9], scaling="grid chosen to fit the panel shape; empty cell holds the legend", emphasis="core cities as stars in the accent colour", title_example="Five core cities radiate to the rest of their regions in two stages", engine="map", keywords="regions|radiation|core city|north east south|map panels", variants="", source_slides=SRC, source_count=1, generator="Generators/patterns_place.js regionMultiples"),
 dict(id="geo-zoom", category="A. Argument & storyline", name="Zoom chain (country → province → city → site)", story="From the whole to the chosen part in one slide.", use_when="Showing where exactly, with the context it sits in.", avoid_when="The audience already knows the geography: start at the city.", parts="2–4 maps left to right, the chosen part boxed and joined to the next map by zoom lines; level chips; numbered sites with callout cards on the last map", count=[2, 4], scaling="last level gets the most width", emphasis="the chosen part in the main colour at every level; accent box + zoom lines", title_example="In Shenzhen, four malls in the CBD districts are the best first sites", engine="map", keywords="zoom|drill down|where|location|site selection", variants="world → country → regions", source_slides=SRC, source_count=4, generator="Generators/patterns_place.js geoZoom"),
 dict(id="site-callouts", category="E. Compare & position", name="Site map with callouts", story="Which sites in a city, and what each offers.", use_when="Site selection, store network in a city, case-study city.", avoid_when="More than ~6 sites: use a table plus a dot map.", parts="district map, target districts shaded, numbered pins, a card per site on a dashed leader (traffic, customers, price)", count=[2, 6], scaling="cards stack on one or both sides", emphasis="the first site's card and leader in the accent colour", title_example="Taking Shanghai as an example, four sites score best on our criteria", engine="map", keywords="site|mall|location|district|callout", variants="cards right; cards on both sides", source_slides=SRC, source_count=4, generator="Generators/patterns_place.js siteCallouts"),
 dict(id="building-explode", category="C. Structure & composition", name="Exploded building", story="What happens on each floor or area of a building.", use_when="A store, office, campus or plant concept; anything with floors or areas.", avoid_when="A single-room layout: use a floor plan.", parts="isometric floors stacked apart (bottom → top), zones on each floor, a card per floor on an elbow leader", count=[1, 5], scaling="floors keep ~60% of each lower floor visible; zone names or numbers by space", emphasis="the floor that matters in the main colour, its key zone dark", title_example="The flagship stacks three experiences: train, recover, play", engine="iso", keywords="building|floor|store concept|layout|zones|exploded", variants="numbers + zone legend in the card when names don't fit", source_slides=SRC, source_count=1, generator="Generators/patterns_place.js buildingExplode"),
 dict(id="floor-plan", category="C. Structure & composition", name="Floor plan with customer path", story="How the space leads the customer through it.", use_when="Store or office layout, visitor flow.", avoid_when="Exact architecture matters: use the architect's drawing.", parts="footprint with walls, numbered zones, entrance arrow, dashed customer path, numbered legend with one line per zone", count=[3, 9], scaling="zones in 0–1 coordinates of the footprint", emphasis="the centre-piece zone in the main colour", title_example="Four areas lead the customer from the window to the service desk", engine="grid", keywords="floor plan|layout|zones|customer path|store design", variants="", source_slides=SRC, source_count=2, generator="Generators/patterns_place.js floorPlan"),
]
for n in new:
    if n["id"] not in by: P["patterns"].append(n)
json.dump(P, open(J("Style/patterns.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
def cl(t):
    line = ("| 2.5 | " + D + " | **Decomposing a place** (country → region → city → district → site → building → floor → zone), learned from 11 slides of the 2019–20 case decks: "
            "`Generators/patterns_place.js` with `mapRegions` (choropleth, sized dots, highlight, legend), `regionMultiples`, `geoZoom` (zoom chain with zoom lines), `siteCallouts` (numbered pins + callout cards), "
            "`buildingExplode` (isometric floors pulled apart, zones, cards), `floorPlan` (zones, entrance, customer path); a `composeSlide` panel can be a map (`map:`). "
            "Map data in `Objects/maps/` fetched with new `scripts/get_map.py`: world, 247 countries' states/provinces, 7,300 cities (Natural Earth), China provinces → cities → districts with the South China Sea inset (DataV.GeoAtlas), GBR/CHN counties (geoBoundaries). "
            "Every region is an editable named shape. Storytelling rule 16; study §10; 1 catalogue pattern updated (map), 5 added. Test deck `Generators/place-demo.pptx`. | "
            "User: study how they decompose a building, and decompose other buildings, cities or countries | Generators/patterns_place.js, demo_place.js, place-demo.pptx, patterns_story.js, scripts/get_map.py, Objects/maps/*, "
            "Style/storytelling.md, Style/refs/case-competitions-2019-2020.md, Style/patterns.json, DECK-SYSTEM.md, review/place-demo |\n")
    k = t.index("|---|"); k = t.index("\n", k) + 1
    return t[:k] + line + t[k:]
edit("logs/changelog.md", cl)
print("applied v2.5")
