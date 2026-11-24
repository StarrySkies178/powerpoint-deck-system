"""Open-book mimic test (roadmap 4.2, v2.72): score build A against the original and make the review pictures.
Run in the official environment: python3 bench/mimic/score.py
- A is scored with the unchanged scorer (bench_score.score_case) and layout_raw against the case's original.png.
- The candidate.pptx files are the builders' own (built in the cloud copy); they are rendered here, not rebuilt.
- Every picture in A and B is listed with its share of the slide (no picture of the slide may be embedded).
- With --official: only the numbers, into results-official.json; no picture is rewritten.
- bench/review-mimic/<case>.png: original (PowerPoint) left, A right. bench/review-mimic-b/<case>.png: A left, B right."""
import os, sys, json, shutil, subprocess, tempfile
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.path.join(B, "scripts"))
from bench_score import score_case, layout_raw
from pptx import Presentation
from PIL import Image, ImageDraw, ImageFont
cases = [c for c in json.load(open(os.path.join(B, "cases.json"))) if c["id"].startswith("C")]
try: font = ImageFont.truetype("DejaVuSans-Bold.ttf", 28)
except Exception: font = ImageFont.load_default()
def pdfpng(pdf, page, dest):
    subprocess.run(["pdftoppm", "-png", "-r", "300", "-f", str(page), "-l", str(page), "-scale-to-x", "1920", "-scale-to-y", "-1", "-singlefile", pdf, dest], check=True)
    return Image.open(dest + ".png").convert("RGB")
def render(pptx, t, tag):
    subprocess.run(["soffice", f"-env:UserInstallation=file://{t}/lo{tag}", "--headless", "--convert-to", "pdf", "--outdir", t, pptx], check=True, capture_output=True)
    return pdfpng(os.path.join(t, os.path.splitext(os.path.basename(pptx))[0] + ".pdf"), 1, f"{t}/{tag}")
def pair(left, right, label, out):
    h = max(left.height, right.height); im = Image.new("RGB", (3880, h + 72), "white"); im.paste(left, (0, 72)); im.paste(right, (1960, 72))
    ImageDraw.Draw(im).text((20, 22), label, fill="black", font=font); im.save(out)
def pictures(pptx):
    p = Presentation(pptx); W, H = p.slide_width, p.slide_height; out = []
    def walk(shs):
        for s in shs:
            if s.shape_type == 6: walk(s.shapes)
            elif s.shape_type == 13: out.append(round(s.width * s.height / (W * H), 3))
    for sl in p.slides: walk(sl.shapes)
    return out
os.makedirs(os.path.join(B, "review-mimic"), exist_ok=True); os.makedirs(os.path.join(B, "review-mimic-b"), exist_ok=True)
OFFICIAL = "--official" in sys.argv  # official numbers only: no pictures are rewritten (the judge md5s refer to the review pictures already made)
only = [a for a in sys.argv[1:] if not a.startswith("--")]; res = {}
rf = os.path.join(B, "mimic", "results-official.json" if OFFICIAL else "results.json")
if os.path.exists(rf): res = json.load(open(rf))
for c in cases:
    cid = c["id"]
    if only and not any(cid.startswith(o) for o in only): continue
    d = os.path.join(B, "mimic", cid); A = os.path.join(d, "A"); Bd = os.path.join(d, "B"); r = {}
    for k, f in (("A", os.path.join(A, "candidate.pptx")), ("B", os.path.join(Bd, "candidate.pptx"))):
        r[k + "_exists"] = os.path.exists(f)
        if r[k + "_exists"]: r[k + "_pictures"] = pictures(f)
    if r["A_exists"]:
        for f in ("case.json", "original.json", "original.png"): shutil.copyfile(os.path.join(B, "cases", cid, f), os.path.join(A, f))
        s = score_case(A)
        r.update(layout_raw=round(layout_raw(os.path.join(A, "original.png"), os.path.join(A, "candidate.png")), 4), layout=s["layout"], visual=s["visual"],
                 std=f"{s['n_std_ok']}/{s['n_std']}", failed=[x["check"] for x in s["standards"] if not x["ok"]])
        t = tempfile.mkdtemp()
        if OFFICIAL: res[cid] = r; print(cid, r.get("layout_raw"), r.get("std"), r.get("failed")); continue
        orig = pdfpng(os.path.join(B, "originals-powerpoint", f"{c['deck']}-ppt.pdf"), int(c["slide"]), f"{t}/o")
        a = render(os.path.join(A, "candidate.pptx"), t, "a"); pair(orig, a, cid[:3], os.path.join(B, "review-mimic", cid + ".png"))
        if r["B_exists"]:
            b = render(os.path.join(Bd, "candidate.pptx"), t, "b"); pair(a, b, cid[:3] + " B", os.path.join(B, "review-mimic-b", cid + ".png"))
    res[cid] = r; print(cid, r.get("layout_raw"), r.get("std"), "pictures A", r.get("A_pictures"), "B", r.get("B_pictures"))
json.dump(res, open(rf, "w"), indent=1)
