"""bench_setup.py: prepare each case: original render, measured standards, deck floors, slide text."""
import json, os, sys, random, statistics as st
sys.path.insert(0, os.path.dirname(__file__))
from bench_score import measure, render_pdf_page, dominant_colours, layout_raw, visual_raw
from pptx import Presentation
from pptx.oxml.ns import qn
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL, PDF = sys.argv[1], sys.argv[2]          # Templates dir, dir with <deck>.pdf renders
cases = json.load(open(os.path.join(B, "cases.json")))
floors = {}
for c in cases:
    d = os.path.join(B, "cases", c["id"]); os.makedirs(d, exist_ok=True)
    pptx, pdf = os.path.join(TPL, c["deck"] + ".pptx"), os.path.join(PDF, c["deck"] + ".pdf")
    opng = render_pdf_page(pdf, c["slide"], os.path.join(d, "original.png"))
    m = measure(pptx, c["slide"]); m["render_colours"] = dominant_colours(opng)
    c.setdefault("palette", "slide" if c["id"][0] in "DZ" else "deck")   # named slide: its own colours; deck as reference: the deck's
    json.dump(m, open(os.path.join(d, "original.json"), "w"), indent=1, ensure_ascii=False)
    key = (c["deck"], c["slide"])
    if key not in floors:
        n = len(Presentation(pptx).slides); random.seed(c["slide"])
        others = random.sample([i for i in range(2, n + 1) if abs(i - c["slide"]) > 1], 8)
        L, V = [], []
        for i in others:
            p = render_pdf_page(pdf, i, f"/tmp/_floor_{i}.png"); L.append(layout_raw(opng, p)); V.append(visual_raw(opng, p))
        from bench_score import dominant_colours as _dc
        deck_cols = sorted(set(c for i in others for c in _dc(f"/tmp/_floor_{i}.png")))
        floors[key] = dict(layout=round(st.median(L), 3), visual=round(st.median(V), 3), others=others, deck_colours=deck_cols)
    cfg = dict(c, floor=floors[key]); cfg.setdefault("skip_checks", [])
    if cfg["palette"] == "deck": m["render_colours"] = sorted(set(m["render_colours"]) | set(floors[key]["deck_colours"])); json.dump(m, open(os.path.join(d, "original.json"), "w"), indent=1, ensure_ascii=False)
    json.dump(cfg, open(os.path.join(d, "case.json"), "w"), indent=1)
    # slide text (for writing the prompt) and chart data
    s = Presentation(pptx).slides[c["slide"] - 1]
    lines = []
    def walk(shapes, depth=0):
        for sh in shapes:
            if sh.shape_type == 6: walk(sh.shapes, depth + 1); continue
            if getattr(sh, "has_chart", False) and sh.has_chart:
                ch = sh.chart
                try:
                    cats = list(ch.plots[0].categories)
                    lines.append(f"[chart {ch.chart_type}] categories={cats}")
                    for pl in ch.plots:
                        for se in pl.series: lines.append(f"   series {se.name}: {list(se.values)}")
                except Exception as e: lines.append(f"[chart] {e}")
            if getattr(sh, "has_table", False) and sh.has_table:
                for r in sh.table.rows: lines.append(" | ".join(cl.text.replace("\n", " / ") for cl in r.cells))
            if getattr(sh, "has_text_frame", False) and sh.has_text_frame and sh.text_frame.text.strip():
                lines.append(f"[{sh.left/914400:.1f},{sh.top/914400:.1f}] " + sh.text_frame.text.replace("\n", " / ").replace("\v", " "))
    walk(s.shapes)
    open(os.path.join(d, "slide-text.txt"), "w").write("\n".join(lines))
    print(c["id"], "floor", floors[key]["layout"], floors[key]["visual"], "| title", m.get("title", {}).get("pt"), m.get("title", {}).get("colour"), m.get("title", {}).get("font"), "| size", m["size_in"])
