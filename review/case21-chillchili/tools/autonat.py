"""autonat.py: find charts on every page, make them native, keep only those that look at least as close
to the original as the traced version did.

python3 autonat.py key deck_in.pptx deck_out.pptx report.json [--skip 3,4]
"""
import sys, json, glob, subprocess, tempfile, shutil, os, copy, re
import numpy as np, cv2
from PIL import Image
sys.path.insert(0, "/tmp/nr/nat")
import chartfind, nativize
from pptx import Presentation

SOFF = glob.glob('/root/.claude/skills/synced/*/pptx/scripts/office/soffice.py')[0]

def render(deck):
    D = tempfile.mkdtemp(); shutil.copy(deck, f"{D}/d.pptx")
    subprocess.run(["python3", SOFF, "--headless", "--convert-to", "pdf", "--outdir", D, f"{D}/d.pptx"], capture_output=True, timeout=1500)
    subprocess.run(["pdftoppm", "-r", "110", "-png", f"{D}/d.pdf", f"{D}/p"], check=True)
    return sorted(glob.glob(f"{D}/p-*.png"))

def sim(a, b):
    """closeness of two crops: correlation of blurred grey + colour difference"""
    a = cv2.GaussianBlur(cv2.cvtColor(a, cv2.COLOR_RGB2GRAY).astype(np.float32), (5, 5), 0)
    b = cv2.GaussianBlur(cv2.cvtColor(b, cv2.COLOR_RGB2GRAY).astype(np.float32), (5, 5), 0)
    a -= a.mean(); b -= b.mean()
    return float((a * b).sum() / (np.sqrt((a * a).sum() * (b * b).sum()) + 1e-6))

def crop(img, box, W0):
    s = img.shape[1] / W0
    x0, y0, x1, y1 = [int(round(v * s)) for v in box]
    return img[max(0, y0):max(1, y1), max(0, x0):max(1, x1)]

def apply(deck_in, out, specs, W0):
    prs = Presentation(deck_in); px = prs.slide_width / W0
    for sp in specs:
        s = prs.slides[sp["slide"] - 1]
        c = {k: v for k, v in sp.items() if not k.startswith("_")}
        boxes = c["clear"] if isinstance(c["clear"][0], list) else [c["clear"]]
        for bx in boxes:
            nativize.clear_region(s, bx, px, c.get("keep", []), c.get("keep_colors", []), c.get("strip_lines", []), c.get("remove_pictures", False))
        nativize.add_chart(s, c, px)
    prs.save(out)

def main():
    key, deck_in, deck_out, rep = sys.argv[1:5]
    skip = {int(x) for x in sys.argv[sys.argv.index("--skip") + 1].split(",")} if "--skip" in sys.argv else set()
    tag = json.load(open("/tmp/nr/final/final_tags.json"))[key]
    info = json.load(open(f"/tmp/nr/out/{key}.info{tag}.json"))["info"]
    pages = sorted(glob.glob(f"/tmp/nr/img/{key}/pg-*.png"))
    W0 = Image.open(pages[0]).size[0]
    prs = Presentation(deck_in); px = prs.slide_width / W0
    specs = []
    for si, pg in enumerate(pages, 1):
        if si in skip or si - 1 >= len(info) or si > len(prs.slides): continue
        try:
            for sp in chartfind.find(key, si, info, pg, prs.slides[si - 1], px): specs.append(sp)
        except Exception as e: print("find failed", si, e)
    report = {"found": len(specs), "kept": [], "dropped": []}
    if not specs:
        shutil.copy(deck_in, deck_out); json.dump(report, open(rep, "w"), indent=1); print(key, report["found"], "found"); return
    tmp = deck_out + ".try.pptx"
    try: apply(deck_in, tmp, specs, W0)
    except Exception as e:
        print("apply failed, trying one by one", e); ok = []
        for sp in specs:
            try: apply(deck_in, tmp, ok + [sp], W0); ok.append(sp)
            except Exception as e2: report["dropped"].append({"slide": sp["slide"], "why": f"error {e2}"})
        specs = ok; apply(deck_in, tmp, specs, W0)
    R0 = render(deck_in); R1 = render(tmp)
    kept = []
    for sp in specs:
        si = sp["slide"]; box = sp["clear"] if not isinstance(sp["clear"][0], list) else sp["clear"][0]
        page = np.array(Image.open(pages[si - 1]).convert("RGB"))
        r0 = np.array(Image.open(R0[si - 1]).convert("RGB")); r1 = np.array(Image.open(R1[si - 1]).convert("RGB"))
        pg_ = cv2.resize(crop(page, box, W0), None, fx=r0.shape[1] / W0, fy=r0.shape[1] / W0)
        a0 = crop(r0, box, W0); a1 = crop(r1, box, W0)
        h = min(pg_.shape[0], a0.shape[0], a1.shape[0]); w = min(pg_.shape[1], a0.shape[1], a1.shape[1])
        s0, s1 = sim(pg_[:h, :w], a0[:h, :w]), sim(pg_[:h, :w], a1[:h, :w])
        entry = {"slide": si, "type": sp["type"], "categories": sp["categories"], "traced": round(s0, 3), "native": round(s1, 3),
                 "values": [x["values"] for x in sp["series"]], "notes": sp.get("_notes", [])}
        cats = [c for c in sp["categories"] if c]
        numcat = [c for c in cats if re.fullmatch(r"[~≈<>]?[-+]?[\d.,]+%?", c.strip()) and not re.fullmatch(r"(19|20)\d\d", c.strip())]
        vals = [v for x in sp["series"] for v in x["values"]]
        nnone = sum(1 for v in vals if v is None)
        ok = (len(cats) >= 0.6 * len(sp["categories"]) and not numcat and nnone <= len(vals) / 3 and s1 >= 0.6)
        if ok: kept.append(sp); report["kept"].append(entry)
        else: entry["why"] = "looks less like the original than the traced version"; report["dropped"].append(entry)
    if kept: apply(deck_in, deck_out, kept, W0)
    else: shutil.copy(deck_in, deck_out)
    os.remove(tmp)
    json.dump(report, open(rep, "w"), indent=1, default=float)
    print(key, "found", report["found"], "kept", len(report["kept"]), "dropped", len(report["dropped"]))

if __name__ == "__main__":
    main()
