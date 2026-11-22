import os, shutil, json, re
D="2026-11-23"; I="archive/_incoming/v16"
for f in ["Generators/patterns_story.js","Style/refs/case-competitions.md","Style/storytelling.md","DECK-SYSTEM.md","scripts/audit_reference.py","maintenance/new-reference.md","logs/changelog.md"]:
    b=os.path.basename(f); n,e=os.path.splitext(b); shutil.copy(f,f"archive/{n}_v1.5_{D}{e}")
for s,d in [("patterns_story.js","Generators/patterns_story.js"),("fill_objects.py","Generators/fill_objects.py"),("demo_compose.js","Generators/demo_compose.js"),("compose-demo.pptx","Generators/compose-demo.pptx"),
            ("composition.py","scripts/composition.py"),("layout_scan.py","scripts/layout_scan.py"),("case-competitions.md","Style/refs/case-competitions.md"),("compose_eye.py","Style/refs/case-competitions-layouts.py")]:
    shutil.copy(f"{I}/{s}",d)
# storytelling §8: composition rules
p="Style/storytelling.md"; s=open(p,encoding="utf-8").read()
add="""11. **Several figures per slide.** An analysis slide usually carries 2–4 exhibits that together prove its title (78% of the case-deck content slides do). Pick the layout from `Style/refs/case-competitions.md` §4b (HALF2, GRID4I, BAND2, T2B1/T1B2, GRID4, EXI, L2R1, COL3, FLOW, CHAIN, EXB) and build it with `composeSlide()`. Rules: every panel numbered with a sentence sub-headline; Z reading order with the conclusion (insights / so-what) in the last cell; same palette, categories and highlight across panels, all pointing to the same answer; connectors only when one panel follows from another; at most 4 panels, otherwise a table or the appendix; gutters, not boxes.
"""
if "Several figures per slide" not in s: s=s.rstrip("\n")+"\n"+add
open(p,"w",encoding="utf-8").write(s)
# DECK-SYSTEM: Stage 3 table gets a Layout column + rule; checklist
p="DECK-SYSTEM.md"; s=open(p,encoding="utf-8").read()
s=s.replace("| # | Action title | Message type | Data shape | Archetype | Variant | Why this archetype |\n|---|---|---|---|---|---|---|",
            "| # | Action title | Message type | Data shape | Slide layout (§4b) | Archetype per panel | Variant | Why |\n|---|---|---|---|---|---|---|---|")
s=s.replace("- Choose each figure from the message → figure table (`Style/refs/case-competitions.md` §5); one highlight makes the point.",
            "- Choose each figure from the message → figure table (`Style/refs/case-competitions.md` §5); one highlight makes the point.\n- **Slide layout:** analysis slides normally combine 2–4 figures using a layout from `Style/refs/case-competitions.md` §4b (HALF2, GRID4I, BAND2, T2B1, T1B2, GRID4, EXI, L2R1, COL3, FLOW, CHAIN, EXB), built with `composeSlide()`; a panel can be a native chart, any generator, or a reused store object (`object:` + `Generators/fill_objects.py`). One-figure slides are for the exec summary, frameworks, roadmaps and big single charts. Vary layouts across the deck (never the same layout three slides running).")
s=s.replace("- Slide rules: ≤ 3 numbered panels with sentence sub-headlines; so-what in the same place on every analysis slide; one highlight per figure",
            "- Slide rules: ≤ 4 numbered panels with sentence sub-headlines in a §4b layout; Z reading order with the conclusion in the last cell; same palette and categories across panels; so-what in the same place on every analysis slide; one highlight per figure")
open(p,"w",encoding="utf-8").write(s)
# new-reference + audit: composition must be studied for every reference
p="maintenance/new-reference.md"; s=open(p,encoding="utf-8").read()
if "Slide composition" not in s:
    s=s.replace("   - **Charts:**","   - **Slide composition (always):** for every content slide record its layout (how many figures, how they are arranged, where the conclusion sits) like `Style/refs/case-competitions.md` §4b; run `scripts/layout_scan.py` on the rendered slides as a guide, then classify by eye. Add any new layout to `composeSlide()`.\n   - **Charts:**",1)
open(p,"w",encoding="utf-8").write(s)
p="scripts/audit_reference.py"; s=open(p,encoding="utf-8").read()
if "11 composition" not in s:
    s=s.replace('''    vec = [o for o in objs if o.get("vector_of")]''','''    ok("11 composition", ("composition" in low or "several figures" in low or "layout" in low) and ("§4b" in txt or "slide layout" in low or "several figures on one slide" in low) or ref.get("composition_checked"), "no study of how slides combine several figures (layouts, reading order, conclusion cell)")
    vec = [o for o in objs if o.get("vector_of")]''')
    s=s.replace("  10 shapes ","  11 composition how slides combine several figures (layouts, reading order) is studied\n  10 shapes ")
open(p,"w",encoding="utf-8").write(s)
c=open("logs/changelog.md",encoding="utf-8").read()
row="| 1.6 | 2026-11-23 | Studied how the case decks put many figures on one slide: all 160 content slides classified by layout (78% carry 2+ exhibits; HALF2 23%, GRID4I 13%, BAND2 8%, T2B1/T1B2 10%…), plus the rules that keep them readable (numbered sentence sub-headlines, Z order with the conclusion last, same grammar across panels, ≤4 panels). New `composeSlide()` with 14 layouts (panels = native charts, generators or reused store objects via `fill_objects.py`), test deck `Generators/compose-demo.pptx`. Wired in: storytelling.md §8 rule 11, DECK-SYSTEM Stage 3 layout column + slide rule + checklist, new-reference step, audit check 11 | User: 'did u study how they present and put many figures and diagrams in one slide and good effective storytelling?' | Generators/patterns_story.js, Generators/fill_objects.py, Generators/compose-demo.pptx, scripts/composition.py, scripts/layout_scan.py, Style/refs/case-competitions.md (§4b), Style/storytelling.md, DECK-SYSTEM.md, maintenance/new-reference.md, scripts/audit_reference.py |\n"
if "| 1.6 |" not in c: c=c.replace("|---|---|---|---|---|\n","|---|---|---|---|---|\n"+row,1)
open("logs/changelog.md","w",encoding="utf-8").write(c)
print("applied")
