"""Store-tool fix re-runs (Next block of roadmap 4.2, v2.77): score build A of bench/<folder>/<case>/ against the original,
beside the v2.74 official number (bench/mimic/results-official.json). A worse by more than 0.03 is flagged (restore rule).
  python3 bench/mimic/score_fix.py <folder> [case prefixes]               numbers -> bench/<folder>/results.json
  python3 bench/mimic/score_fix.py <folder> --pictures <n> [case prefixes] also bench/review-mimic-<n>/ (original | A) and -b/ (A | B)
Run in the official environment. The builds are the builders' own candidate.pptx files; they are rendered here, not rebuilt."""
import os, sys, json, shutil, tempfile
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.path.join(B, "scripts")); sys.path.insert(0, os.path.join(B, "mimic"))
from bench_score import score_case, layout_raw
a = sys.argv[1:]; folder = a.pop(0); pics = None
if a[:1] == ["--pictures"]: pics = a[1]; a = a[2:]
cases = [c for c in json.load(open(os.path.join(B, "cases.json"))) if c["id"].startswith("C")]
base = json.load(open(os.path.join(B, "mimic", "results-official.json")))
rf = os.path.join(B, folder, "results.json"); res = json.load(open(rf)) if os.path.exists(rf) else {}
if pics:
    from PIL import Image, ImageDraw, ImageFont
    import subprocess
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
    ra, rb = os.path.join(B, f"review-mimic-{pics}"), os.path.join(B, f"review-mimic-{pics}-b"); os.makedirs(ra, exist_ok=True); os.makedirs(rb, exist_ok=True)
for c in cases:
    cid = c["id"]; d = os.path.join(B, folder, cid)
    if not os.path.isdir(d) or (a and not any(cid.startswith(p) for p in a)): continue
    A, Bd = os.path.join(d, "A"), os.path.join(d, "B")
    for f in ("case.json", "original.json", "original.png"): shutil.copyfile(os.path.join(B, "cases", cid, f), os.path.join(A, f))
    s = score_case(A); lr = round(layout_raw(os.path.join(A, "original.png"), os.path.join(A, "candidate.png")), 4)
    was = base[cid]["layout_raw"]; r = dict(layout_raw=lr, v274=was, diff=round(lr - was, 4), worse=lr < was - 0.03, std=f"{s['n_std_ok']}/{s['n_std']}")
    res[cid] = r; print(cid, lr, "v2.74", was, f"{lr - was:+.4f}", "WORSE by more than 0.03" if r["worse"] else "")
    if pics:
        t = tempfile.mkdtemp()
        orig = pdfpng(os.path.join(B, "originals-powerpoint", f"{c['deck']}-ppt.pdf"), int(c["slide"]), f"{t}/o")
        ia = render(os.path.join(A, "candidate.pptx"), t, "a"); pair(orig, ia, cid[:3], os.path.join(ra, cid + ".png"))
        if os.path.exists(os.path.join(Bd, "candidate.pptx")):
            ib = render(os.path.join(Bd, "candidate.pptx"), t, "b"); pair(ia, ib, cid[:3] + " B", os.path.join(rb, cid + ".png"))
json.dump(res, open(rf, "w"), indent=1)
