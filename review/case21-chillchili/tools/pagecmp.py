import sys, glob, subprocess, tempfile, shutil, json
sys.path.insert(0, "/tmp/nr/nat")
import numpy as np, cv2, autonat
from PIL import Image
def render(deck, out):
    D = tempfile.mkdtemp(); shutil.copy(deck, f"{D}/d.pptx")
    subprocess.run(["python3", autonat.SOFF, "--headless", "--convert-to", "pdf", "--outdir", D, f"{D}/d.pptx"], capture_output=True, timeout=1500)
    subprocess.run(["pdftoppm", "-r", "80", "-png", f"{D}/d.pdf", f"{out}/p"], check=True); shutil.rmtree(D)
key, new, old, out = sys.argv[1:5]
import os; os.makedirs(out + "/n", exist_ok=True); os.makedirs(out + "/o", exist_ok=True)
render(new, out + "/n"); render(old, out + "/o")
pages = sorted(glob.glob(f"/tmp/nr/img/{key}/pg-*.png")); N = sorted(glob.glob(out + "/n/p-*.png")); O = sorted(glob.glob(out + "/o/p-*.png"))
res = []
for i, (pg, a, b) in enumerate(zip(pages, N, O), 1):
    A = np.array(Image.open(a).convert("RGB")); B = np.array(Image.open(b).convert("RGB"))
    P = cv2.resize(np.array(Image.open(pg).convert("RGB")), (A.shape[1], A.shape[0]))
    sn, so = autonat.sim(P, A), autonat.sim(P, B); res.append((i, round(so, 3), round(sn, 3)))
print(key, " ".join(f"{i}:{so}->{sn}" + (" !!" if sn < so - 0.03 else "") for i, so, sn in res))
