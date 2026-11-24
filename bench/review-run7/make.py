"""Comparison pictures for Mike, in the form of bench/review-run2/: the original slide (PowerPoint PDF, 1920 px) on the
left, the first fresh build of the run (r1, rendered by LibreOffice as the benchmark renders, 1920 px) on the right,
labelled with the case id only. Usage (official environment): python3 bench/review-run7/make.py <run> <out dir>"""
import json, os, sys, subprocess, tempfile, glob
from PIL import Image, ImageDraw, ImageFont
run, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
cases = [c for c in json.load(open("bench/cases.json")) if c["id"].startswith("C")]
def png(pdf, page, dest):
    subprocess.run(["pdftoppm", "-png", "-r", "300", "-f", str(page), "-l", str(page), "-scale-to-x", "1920", "-scale-to-y", "-1", "-singlefile", pdf, dest], check=True)
    return Image.open(dest + ".png").convert("RGB")
try: font = ImageFont.truetype("DejaVuSans-Bold.ttf", 28)
except Exception: font = ImageFont.load_default()
for c in cases:
    cid = c["id"]; t = tempfile.mkdtemp()
    left = png(f"bench/originals-powerpoint/{c['deck']}-ppt.pdf", int(c["slide"]), f"{t}/o")
    cand = f"bench/phase4/{run}/{cid}/r1/candidate.pptx"
    subprocess.run(["soffice", f"-env:UserInstallation=file://{t}/lo", "--headless", "--convert-to", "pdf", "--outdir", t, cand], check=True, capture_output=True)
    right = png(f"{t}/candidate.pdf", 1, f"{t}/c")
    h = max(left.height, right.height); W = 1920 * 2 + 40
    im = Image.new("RGB", (W, h + 72), "white"); im.paste(left, (0, 72)); im.paste(right, (1960, 72))
    ImageDraw.Draw(im).text((20, 22), cid[:3], fill="black", font=font)
    im.save(f"{out}/{cid}.png"); print(cid, im.size)
