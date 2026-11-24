# pair1.py key deck.pptx slide [slide...] -> /tmp/nr/nat/pair-<slide>.jpg: page (left) vs render (right), full width each
import sys, glob, subprocess, tempfile, shutil
from PIL import Image
k, deck = sys.argv[1], sys.argv[2]; sl = [int(x) for x in sys.argv[3:]]
D = tempfile.mkdtemp(); shutil.copy(deck, D + '/d.pptx')
subprocess.run(['python3', glob.glob('/root/.claude/skills/synced/*/pptx/scripts/office/soffice.py')[0], '--headless', '--convert-to', 'pdf', '--outdir', D, D + '/d.pptx'], capture_output=True, timeout=900)
pages = sorted(glob.glob(f'/tmp/nr/img/{k}/pg-*.png'))
for s in sl:
    subprocess.run(['pdftoppm', '-r', '110', '-f', str(s), '-l', str(s), '-png', D + '/d.pdf', D + f'/r{s}'], check=True)
    r = Image.open(glob.glob(D + f'/r{s}*.png')[0]).convert('RGB'); o = Image.open(pages[s - 1]).convert('RGB')
    W = 1180; o = o.resize((W, int(o.height * W / o.width))); r = r.resize((W, int(r.height * W / r.width)))
    P = Image.new('RGB', (W, o.height + r.height + 10), (90, 90, 90)); P.paste(o, (0, 0)); P.paste(r, (0, o.height + 10))
    P.save(f'/tmp/nr/nat/pair-{s}.jpg', quality=88); print('pair', s)
