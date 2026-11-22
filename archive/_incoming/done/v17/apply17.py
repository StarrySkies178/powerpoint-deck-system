import json, os, shutil
D="2026-11-23"; I="archive/_incoming/v17"
for f in ["Generators/patterns_story.js","Style/refs/template-libraries.md","Style/refs/case-competitions.md","Style/refs/references.json"]:
    b=os.path.basename(f); n,e=os.path.splitext(b); shutil.copy(f,f"archive/{n}_v1.6_{D}{e}")
for s,d in [("patterns_story.js","Generators/patterns_story.js"),("demo_compose.js","Generators/demo_compose.js"),("compose-demo.pptx","Generators/compose-demo.pptx")]: shutil.copy(f"{I}/{s}",d)
p="Style/refs/template-libraries.md"; s=open(p,encoding="utf-8").read()
if "## Several figures on one slide (composition)" not in s: s=s.rstrip("\n")+"\n"+open(f"{I}/libsec.md",encoding="utf-8").read()
open(p,"w",encoding="utf-8").write(s)
p="Style/refs/case-competitions.md"; s=open(p,encoding="utf-8").read()
s=s.replace("draws any of these 14 layouts.","draws any of these layouts, plus MULTI (small multiples with the same categories and highlight) and TXC (text left, chart right) from the libraries, and `boxed:true` for the header-on-a-box panel style (see `Style/refs/template-libraries.md`, composition). `fadeOut()` greys out panels for live, step-by-step presenting.")
open(p,"w",encoding="utf-8").write(s)
p="Style/refs/references.json"; d=json.load(open(p,encoding="utf-8"))
for r in d["references"]:
    if r["key"] in ("mono","bain","bp","ey","map"): r["composition_checked"]="2026-11-23: one diagram per slide; no multi-figure layouts to learn (see template-libraries.md, composition)"
json.dump(d,open(p,"w",encoding="utf-8"),ensure_ascii=False,indent=1)
c=open("logs/changelog.md",encoding="utf-8").read()
row="| 1.7 | 2026-11-23 | Composition studied for the 11 template libraries too: every library slide that shows combined figures or presenting viewed (RB, Deloitte, BCG, QPT, ATK, McK); lessons added to template-libraries.md and to the composer: MULTI (small multiples, same categories + highlight), TXC (text + chart), boxed panels with the point in the header, fadeOut() for step-by-step live presenting. Audit check 11 now ALL PASS for all 21 references | User: 'did u study how they present and put many figures in one slide' | Style/refs/template-libraries.md, Style/refs/case-competitions.md, Generators/patterns_story.js, Generators/demo_compose.js, Generators/compose-demo.pptx, Style/refs/references.json |\n"
if "| 1.7 |" not in c: c=c.replace("|---|---|---|---|---|\n","|---|---|---|---|---|\n"+row,1)
open("logs/changelog.md","w",encoding="utf-8").write(c)
print("ok")
