# sheets.py tri-dir prefix -> prefix-N.jpg contact sheets (original | before | after), 4 slides per sheet
import sys, glob
from PIL import Image
d, pre = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(f'{d}/tri-*.jpg')); rows = []
for f in fs:
    im = Image.open(f); W, H = im.size; h3 = (H - 20) // 3
    parts = [im.crop((0, i * (h3 + 10), W, i * (h3 + 10) + h3)).resize((600, int(h3 * 600 / W))) for i in range(3)]
    r = Image.new('RGB', (1810, parts[0].height), 'white')
    for i, p in enumerate(parts): r.paste(p, (i * 605, 0))
    rows.append(r)
for k in range(0, len(rows), 4):
    g = rows[k:k + 4]; S = Image.new('RGB', (1810, sum(x.height + 8 for x in g)), (60, 60, 60)); y = 0
    for x in g: S.paste(x, (0, y)); y += x.height + 8
    S.save(f'{pre}-{k // 4 + 1}.jpg', quality=85)
print(len(rows))
