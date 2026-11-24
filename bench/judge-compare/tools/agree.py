"""Count agreement once Mike has answered a set.
Usage: python3 agree.py <predictions.csv> <mike.csv> <set name> [track-record.md]
mike.csv: columns case, verdict (ok / not ok), reason. Prints agreement both ways and appends one line
to the track record. The judge takes over when it matched him on at least 9 of 10 in two sets in a row, counted only since the last '| retune' line."""
import sys, csv, datetime
pred, mike, name = sys.argv[1:4]; track = sys.argv[4] if len(sys.argv) > 4 else None
norm = lambda s: 'NOT OK' if s.strip().upper().replace('_', ' ').startswith('NOT') else 'OK'
P = {r['case']: r['judge'] for r in csv.DictReader(open(pred))}
M = {r['case']: norm(r['verdict']) for r in csv.DictReader(open(mike))}
common = sorted(set(P) & set(M))
a = sum(P[c] == M[c] for c in common)
okn = sum(M[c] == 'OK' and P[c] != 'OK' for c in common); nok = sum(M[c] != 'OK' and P[c] == 'OK' for c in common)
line = f"| {name} | {datetime.date.today()} | {a} of {len(common)} | {okn} | {nok} | {', '.join(c for c in common if P[c] != M[c]) or '-'} |"
print(line)
if track:
    open(track, 'a').write(line + "\n")
    lines = open(track).read().splitlines()
    k = max([i for i, l in enumerate(lines) if l.startswith('| retune')] + [-1])     # sets judged before a retune do not count
    rows = [l for l in lines[k + 1:] if l.startswith('| ') and ' of ' in l]
    last = [int(l.split('|')[3].split(' of ')[0]) for l in rows[-2:]]
    print('TAKES OVER (two sets in a row at 9 of 10 or better)' if len(last) == 2 and min(last) >= 9 else 'not yet: Mike stays the measure')
