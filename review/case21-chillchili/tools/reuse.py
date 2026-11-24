"""reuse.py STORE out.pptx results.json : reuse test of stored objects with objstore (place, resize, recolour,
set_texts, set_chart_data, table_size, extend). One slide per test, the test written on the slide."""
import sys, json, copy, traceback, gzip, os
sys.path.insert(0, "/home/claude/powerpoint-deck-system/Generators")
import objstore as O
from pptx import Presentation
from pptx.util import Emu, Pt

store, out, resp = sys.argv[1:4]
recs = {}
for f in os.listdir(store):
    if f.endswith(".jsonl.gz"):
        for l in gzip.open(os.path.join(store, f), "rt", encoding="utf-8"):
            o = json.loads(l); recs[o["id"]] = o

prs = Presentation(); prs.slide_width = Emu(12192000); prs.slide_height = Emu(6858000); prs.save(out)
tests = []
def T(name, oid, fn, box=(0.5, 1.0, 12.3, 6.0)):
    tests.append((name, oid, fn, box))

def chart(oid, cats, series): return lambda o: O.set_chart_data(o, cats, series)
# 1. native charts from the second pass: new numbers
T("ChillChili market size chart: new numbers (2016-2023E)", "case21-chillchili-003c1",
  chart(None, ["2016", "2019", "2020", "2021E", "2022E", "2023E"], [("Mom&Pop", [500, 520, 530, 540, 550, 560]), ("Multi-category", [250, 260, 270, 280, 290, 300]), ("Fruit Specialty Chain", [80, 110, 120, 140, 160, 180]), ("E-Commerce", [20, 60, 70, 90, 100, 140]), ("Total", [850, 950, 990, 1050, 1100, 1180])]))
T("ChillChili per-capita chart: 3 regions instead of 2", "case21-chillchili-003c2", chart(None, ["Developed", "Mainland China", "SEA"], [("kg per capita", [83, 46, 55])]))
T("ChillChili import chart: 5 years", "case21-chillchili-003c3", chart(None, ["2018", "2019", "2021", "2022", "2023E"], [("USD bn", [7, 9, 12, 16, 20])]))
T("ChillChili bubble chart (kept as is, resized small)", "case21-chillchili-004c1", lambda o: o, (3, 2, 5, 3.5))
T("ChillChili share bridge: other shares", "case21-chillchili-004c2", chart(None, ["Total", "Pagoda", "XF", "others"], [("base", [0, 88, 82, 0]), ("share", [100, 12, 6, 82])]))
T("ChillChili KPC chart: 4 criteria", "case21-chillchili-006c1", chart(None, ["Quality", "Convenience", "Online", "Price"], [("36-55", [90, 40, 30, 35]), ("26-35", [70, 45, 55, 40])]))
T("ChillChili EBIT bridge: 4 steps", "case21-chillchili-007c1", chart(None, ["2020", "Stores", "RPS", "Supply chain", "Online", "2023E"], [("base", [0, 3, 8, 11, 12, 0]), ("EBIT", [3, 5, 3, 1, 2, 14])]))
T("ChillChili revenue forecast chart: 5 years", "case21-chillchili-014c1", chart(None, ["2020E", "2021E", "2022E", "2023E", "2024E"], [("Low", [61, 65, 70, 75, 80]), ("Base", [61, 71, 83, 97, 110]), ("High", [61, 80, 108, 147, 180])]))
T("ChillChili EBIT line chart: recoloured to accent2", "case21-chillchili-014c2", lambda o: O.recolour(o, {"accent1": "accent2"}))
# 1b. native charts from the other 15 decks (v2.77 hand-boxed pass)
T("Starlight revenue bridge (waterfall): new steps", "case21-starlight-015c1", chart(None, ["2019", "Stores", "Omni", "CRM", "2023E"], [("base", [None, 12, 16, 18, None]), ("Total", [12, None, None, None, 20]), ("Increase", [None, 4, 2, 2, None]), ("Total labels", [12, 16, 18, 20, 20])]))
T("Starlight doughnut: 4 players", "case21-starlight-004c4", chart(None, ["A", "B", "C", "Others"], [("Share", [12, 6, 3, 79])]))
T("TrueNorth stacked market chart: 3 years", "case21-truenorth-004c1", chart(None, ["2021", "2022E", "2023E"], [("E-commerce", [80, 100, 130]), ("Hyper", [150, 160, 170]), ("Chain", [150, 180, 210]), ("Grocery", [700, 750, 790])]))
T("TrueNorth bubble chart: resized", "case21-truenorth-020c1", lambda o: o, (1, 1.5, 8, 4.5))
T("WhyConsulting combo (columns + lines): new years", "case21-whyconsulting-014c2", chart(None, ["2023", "2024E", "2025E", "2026E", "2027E"], [("Base", [30, 34, 39, 44, 50]), ("Optimistic", [30, 36, 44, 52, 60]), ("Pessimistic", [30, 32, 34, 36, 38])]))
T("BeAnInnovator pie: new split", "case22-beaninnovator-013c1", chart(None, ["Give up for price", "Others"], [("Share", [25, 75])]))
T("Fusion line chart: recoloured", "case22-fusion-014c1", lambda o: O.recolour(o, {"accent1": "accent2"}))
T("IIVA scatter: resized", "case22-iiva-015c1", lambda o: o, (2, 1.5, 6, 4.5))
T("Shibaco bar chart: 4 channels", "case22-shibaco-006c1", chart(None, ["CVS", "Grocery", "M&P", "Others"], [("Share", [10, 20, 60, 10])]))
T("WXYZ combo with lines: new values", "case22-wxyz-005c2", chart(None, ["2021", "2022E", "2023E", "2024E"], [("base case", [8, 20, 30, 40]), ("high case", [8, 24, 36, 50]), ("low case", [8, 18, 26, 34])]))
T("BASIL stacked + 2 lines: 5 years", "case24-basil-014c1", chart(None, ["2024", "2025", "2026", "2027", "2028"], [("Taikang Home", [0, 0, 0, 10, 20]), ("Nursing centers", [13, 80, 270, 520, 800]), ("Introduction of HK senior citizens", [0, 30, 56, 154, 140]), ("Total", [13, 110, 326, 684, 960]), ("Bear Case", [0, 70, 225, 547, 800]), ("Bull Case", [0, 112, 379, 758, 1109])]))
T("BSTORM line chart: 4 years", "case24-bstorm-014c1", chart(None, ["2024E", "2025E", "2026E", "2027E"], [("High Case", [0.7, 1.5, 2.3, 3.1]), ("Base Case", [0.7, 1.3, 2.0, 2.6]), ("Low Case", [0.7, 1.1, 1.5, 1.8])]))
T("CVCJ 100% columns: 3 years", "case24-cvcj-004c2", chart(None, ["Now", "2026", "Aim"], [("Home care", [96, 93, 90]), ("Community", [3, 5, 7]), ("Institutional", [1, 2, 3])]))
T("YESS clustered columns: 2 brands", "case24-yess-014c1", chart(None, ["2024", "2025", "2026"], [("Yiyuan", [250, 280, 310]), ("Suiyuan", [160, 165, 170])]))
# 2. native tables
T("ChillChili rating table: +2 rows", "case21-chillchili-004t1", lambda o: O.table_size(o, rows=13))
T("ChillChili rating table: -1 column", "case21-chillchili-004t1", lambda o: O.table_size(o, cols=4))
for k, s in (("case21-starlight", 19), ("case21-starlight", 20), ("case21-whyconsulting", 19), ("case21-whyconsulting", 20), ("case24-yess", 18), ("case24-yess", 21), ("case24-yess", 23)):
    T(f"{k} slide {s} table: +2 rows", f"{k}-{s:03d}t1", lambda o: O.table_size(o, rows=o["xml"].count("<a:tr ") + 2))
# 3. layout objects
L = "layouts-2021-2024"
T("Equation: 3 panels -> 4 (extend)", f"{L}-001", lambda o: O.extend(o, 4))
T("Equation: new texts", f"{L}-001", lambda o: O.set_texts(o, ["Market", "Customers", "Competition", "So", ["Growing 13% a year"], ["Want quality"], ["Fragmented"], ["Enter now"]]))
T("Formula row: 4 drivers -> 5 (extend)", f"{L}-002", lambda o: O.extend(o, 5))
T("L1R3 numbered sections: 3 -> 4 (extend)", f"{L}-008", lambda o: O.extend(o, 4))
T("Tab bar: 4 tabs -> 5 (extend)", f"{L}-004", lambda o: O.extend(o, 5))
T("Tab bar: recoloured (accent -> accent2)", f"{L}-004", lambda o: O.recolour(o, {"accent1": "accent2"}))
T("Acronym banner: 3 -> 4 (extend)", f"{L}-005", lambda o: O.extend(o, 4))
T("Mekko: 3 columns -> 4 (extend; widths differ, expected to need the mekko builder)", f"{L}-006", lambda o: O.extend(o, 4))
T("Mekko: resized to half width", f"{L}-006", lambda o: o, (0.5, 1.0, 6.0, 5.5))
T("Waterfall layout: new numbers", f"{L}-007", chart(None, ["2024", "A", "B", "C", "D", "2027E"], [("base", [0, 10, 14, 17, 19, 0]), ("value", [10, 4, 3, 2, 3, 22])]))

results = []
for name, oid, fn, box in tests:
    r = {"test": name, "object": oid}
    if oid not in recs: r.update(ok=False, error="object not in store"); results.append(r); continue
    try:
        o = fn(copy.deepcopy(recs[oid]))
        p = Presentation(out); sl = p.slides.add_slide(p.slide_layouts[6])
        tb = sl.shapes.add_textbox(Emu(300000), Emu(100000), Emu(11500000), Emu(500000)); tb.text_frame.text = f"{len(results) + 1}. {name}  [{oid}]"
        tb.text_frame.paragraphs[0].runs[0].font.size = Pt(14)
        p.save(out)
        O.place(out, len(p.slides), o, box, store, out_path=out)
        r.update(ok=True)
    except Exception as e:
        r.update(ok=False, error=f"{type(e).__name__}: {e}"[:300])
    results.append(r)
json.dump(results, open(resp, "w"), indent=1)
print(sum(r["ok"] for r in results), "of", len(results), "ran")
for r in results:
    if not r["ok"]: print("FAIL", r["test"], r.get("error"))
