"""Write the comparison judge's answers for one set BEFORE the pictures go to Mike.
Usage: python3 predict.py <pics dir with map.json> <out dir> <round> <instructions.md> <predictions.csv>
One row per picture: when it was written, the instructions' md5, the picture's md5, what the picture is
(from map.json), the judge's verdict and reason. Refuses to overwrite an existing file: predictions are
written once. Commit the file to GitHub before Mike sees the pictures; the commit time is the proof."""
import sys, os, json, csv, hashlib, datetime
pics, out, rnd, instr, dest = sys.argv[1:6]
if os.path.exists(dest): sys.exit(f"{dest} exists: predictions are written once")
md5 = lambda p: hashlib.md5(open(p, 'rb').read()).hexdigest()
m = json.load(open(os.path.join(pics, 'map.json')))
now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
rows = []
for name, label in sorted(m.items(), key=lambda x: x[1]):
    t = open(os.path.join(out, f'{rnd}-{name}.txt')).read().strip().splitlines()
    v = 'NOT OK' if t[0].strip().strip('*').upper().startswith('NOT') else 'OK'
    rows.append([now, md5(instr), name, md5(os.path.join(pics, name + '.png')), label, v, t[1].strip() if len(t) > 1 else ''])
with open(dest, 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['written_utc', 'instructions_md5', 'picture', 'picture_md5', 'case', 'judge', 'reason']); w.writerows(rows)
print(f"{len(rows)} predictions written {now} -> {dest}; judge OK {sum(r[5] == 'OK' for r in rows)}")
