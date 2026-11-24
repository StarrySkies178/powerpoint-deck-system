"""Anonymise side-by-side comparison pictures for the comparison judge.
Usage: python3 anon.py OUTDIR SEED LABEL=path [LABEL=path ...]
Blanks the top 64 px label band (case id) so the picture shows only the two slides,
copies each at full resolution under a random 6-character name, and writes
OUTDIR/map.json {name: label}. Judges never see map.json."""
import sys, json, random, string, os
from PIL import Image
out, seed, items = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
os.makedirs(out, exist_ok=True)
rng = random.Random(seed)
m = {}
pairs = [a.split('=', 1) for a in items]
rng.shuffle(pairs)
for label, path in pairs:
    name = ''.join(rng.choice(string.ascii_lowercase + string.digits) for _ in range(6))
    im = Image.open(path).convert('RGB')
    w, h = im.size
    # the case id is written in the 72 px label band above the slides (top left); blank that band only
    im.paste((255, 255, 255), (0, 0, w, 64))
    im.save(f'{out}/{name}.png')
    m[name] = label
json.dump(m, open(f'{out}/map.json', 'w'), indent=1)
print(len(m), 'pictures ->', out)
