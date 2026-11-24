# tri.py key before.pptx after.pptx outdir [slides] -> outdir/tri-NN.jpg : original | before | after, stacked, labelled
import sys, glob, subprocess, tempfile, shutil, os
from PIL import Image, ImageDraw
k, b, a, out = sys.argv[1:5]; os.makedirs(out, exist_ok=True)
sl = [int(x) for x in sys.argv[5].split(',')] if len(sys.argv) > 5 else None
soff = glob.glob('/root/.claude/skills/synced/*/pptx/scripts/office/soffice.py')[0]
def render(deck, tag):
    D = tempfile.mkdtemp(); shutil.copy(deck, f'{D}/{tag}.pptx')
    subprocess.run(['python3', soff, '--headless', '--convert-to', 'pdf', '--outdir', D, f'{D}/{tag}.pptx'], capture_output=True, timeout=1200)
    subprocess.run(['pdftoppm', '-r', '100', '-png', f'{D}/{tag}.pdf', f'{D}/p'], check=True)
    return sorted(glob.glob(f'{D}/p-*.png'))
B = render(b, 'b'); A = render(a, 'a'); pages = sorted(glob.glob(f'/tmp/nr/img/{k}/pg-*.png'))
for i in range(len(A)):
    s = i + 1
    if sl and s not in sl: continue
    W = 1200; ims = []
    for lab, f in (('ORIGINAL', pages[i]), ('BEFORE (v2.38 rebuild)', B[i]), ('AFTER', A[i])):
        im = Image.open(f).convert('RGB'); im = im.resize((W, int(im.height * W / im.width)))
        c = Image.new('RGB', (W, im.height + 28), 'white'); c.paste(im, (0, 28)); ImageDraw.Draw(c).text((8, 6), f'slide {s}: {lab}', fill=(200, 0, 0)); ims.append(c)
    P = Image.new('RGB', (W, sum(x.height for x in ims) + 20), (80, 80, 80)); y = 0
    for x in ims: P.paste(x, (0, y)); y += x.height + 10
    P.save(f'{out}/tri-{s:02d}.jpg', quality=85)
print('done', len(A))
