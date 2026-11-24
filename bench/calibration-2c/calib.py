"""calib.py <out.json> <set> <case_id> <pptx> <label> [...]  -- roadmap 4.2 Run 2c, analysis only.
Measures every candidate measure the scorer computes or can compute cheaply, against the case's current original.png
(PowerPoint picture) and floors. Appends to out.json. Does not change the scorer."""
import sys, os, json, tempfile
B = os.environ.get("BENCH") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # bench/
sys.path.insert(0, os.path.join(B, "scripts"))
import numpy as np
import bench_score as S
from PIL import Image, ImageFilter

def parts_visual(a, b):
    A, Bm = S._prep(a, (160, 90)), S._prep(b, (160, 90))
    la, lb = S.rgb2lab(np.asarray(A.filter(ImageFilter.GaussianBlur(1)))), S.rgb2lab(np.asarray(Bm.filter(ImageFilter.GaussianBlur(1))))
    colour = 1 - float(np.mean(np.minimum(np.linalg.norm(la - lb, axis=-1), 50) / 50))
    def edges(png):
        g = np.asarray(S._prep(png, (480, 270)).convert("L"), dtype=float)
        gx = np.abs(np.diff(g, axis=1, prepend=g[:, :1])); gy = np.abs(np.diff(g, axis=0, prepend=g[:1]))
        e = (np.hypot(gx, gy) > 40)
        return np.asarray(Image.fromarray((e * 255).astype("uint8")).filter(ImageFilter.MaxFilter(5))) > 0
    ea, eb = edges(a), edges(b)
    return colour, float(2 * np.sum(ea & eb) / max(1, ea.sum() + eb.sum()))

def iou(a, b, gw, gh):
    A, Bm = S.ink_grid(a, gw, gh), S.ink_grid(b, gw, gh)
    return float((A & Bm).sum() / max(1, (A | Bm).sum())), float(A.mean()), float(Bm.mean())

def hist_sim(a, b):
    def h(p):
        x = (np.asarray(S._prep(p, (160, 90)), dtype=int) // 64).reshape(-1, 3)
        k = x[:, 0] * 16 + x[:, 1] * 4 + x[:, 2]; v = np.bincount(k, minlength=64).astype(float); return v / v.sum()
    return float(np.minimum(h(a), h(b)).sum())

out = sys.argv[1]; res = json.load(open(out)) if os.path.exists(out) else []
args = sys.argv[2:]
for i in range(0, len(args), 4):
    st, cid, pptx, label = args[i:i + 4]
    cdir = os.path.join(B, "cases", cid); cfg = json.load(open(os.path.join(cdir, "case.json"))); ref = json.load(open(os.path.join(cdir, "original.json")))
    opng = os.path.join(cdir, "original.png")
    d = tempfile.mkdtemp(); cpng = os.path.join(d, "c.png"); S.render(pptx, 1, cpng)
    cand = S.measure(pptx, 1); cand["render_colours"] = S.dominant_colours(cpng)
    for m_, png in ((ref, opng), (cand, cpng)):
        if m_.get("title") and m_["title"].get("box"):
            rt = S.render_title_top(png, m_["size_in"], m_["title"])
            if rt is not None: m_["title"]["top_in"] = rt
    std = S.check_standards(ref, cand, cfg)
    lr = S.layout_raw(opng, cpng); vr = S.visual_raw(opng, cpng); col, edge = parts_visual(opng, cpng)
    i16, inkO, inkC = iou(opng, cpng, 16, 9); i8, _, _ = iou(opng, cpng, 8, 4)
    r = dict(set=st, case=cid, label=label, layout_raw=round(lr, 4), floor_layout=cfg["floor"]["layout"], layout=round(S.norm(lr, cfg["floor"]["layout"]), 4),
             visual_raw=round(vr, 4), floor_visual=cfg["floor"]["visual"], visual=round(S.norm(vr, cfg["floor"]["visual"]), 4),
             colour=round(col, 4), edges=round(edge, 4), iou16=round(i16, 4), iou8=round(i8, 4), ink_orig=round(inkO, 4), ink_cand=round(inkC, 4),
             hist=round(hist_sim(opng, cpng), 4), standards={s["check"]: s["ok"] for s in std}, n_failed=sum(not s["ok"] for s in std))
    res = [x for x in res if not (x["set"] == st and x["case"] == cid)] + [r]
    print(st, cid, label, r["layout_raw"], r["layout"], r["visual"], r["n_failed"])
json.dump(res, open(out, "w"), indent=1)
