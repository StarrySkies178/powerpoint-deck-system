"""addauto.py key deck_in deck_out boxspecs.json: add the automatically found charts that were kept (and eye-checked)
in the earlier pass, unless a hand-boxed chart already covers that place."""
import sys, json, glob
sys.path.insert(0, "/tmp/nr/nat")
import chartfind, autonat
from PIL import Image
from pptx import Presentation
key, din, dout, bsp = sys.argv[1:5]
kept = json.load(open(f"/tmp/nr/p2/{key}.charts.json"))["kept"]
mine = json.load(open(bsp))["charts"] if bsp != "-" else []
tag = json.load(open("/tmp/nr/final/final_tags.json"))[key]
info = json.load(open(f"/tmp/nr/out/{key}.info{tag}.json"))["info"]
pages = sorted(glob.glob(f"/tmp/nr/img/{key}/pg-*.png"))
prs = Presentation(din); W0 = Image.open(pages[0]).size[0]; px = prs.slide_width / W0
def box(c): return c["clear"] if not isinstance(c["clear"][0], list) else c["clear"][0]
def ov(a, b): return max(0, min(a[2], b[2]) - max(a[0], b[0])) * max(0, min(a[3], b[3]) - max(a[1], b[1]))
add = []
for si in sorted({k["slide"] for k in kept}):
    found = chartfind.find(key, si, info, pages[si - 1], prs.slides[si - 1], px)
    for sp in found:
        if not any(k["slide"] == si and k["categories"] == sp["categories"] for k in kept): continue
        if any(m["slide"] == si and ov(box(m), box(sp)) > 0.3 * (box(sp)[2] - box(sp)[0]) * (box(sp)[3] - box(sp)[1]) for m in mine):
            print("covered by hand", si, sp["categories"]); continue
        add.append(sp); print("add", si, sp["categories"])
autonat.apply(din, dout, add, W0)
