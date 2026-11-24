"""Score judge-1.8 runs against Mike's rating-1.7 labels. Prints aggregates only."""
import json, csv, glob, sys
B = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/sync/bench/rating-1.7'
m = json.load(open('map.json'))['map']
lab = {r['file']: r['pass_or_fail'].strip().lower() for r in csv.DictReader(open(f'{B}/ratings.csv'))}
key = {e['file']: e for e in json.load(open(f'{B}/key.json'))['files']}
def verdict(rnd, n):
    t = open(f'out/{rnd}-{n}.txt').read().strip().splitlines()
    return 'pass' if t[0].strip().strip('*').upper().startswith('PASS') else 'fail'
J = {}
for n, v in m.items():
    rnd = 't1' if v['group'] == 'tuning' else 'h'
    J[n] = dict(v, judge=verdict(rnd, n))
out = {}
def stats(rows, name):
    a = sum(r['judge'] == lab[r['file']] for r in rows)
    pf = sum(lab[r['file']] == 'pass' and r['judge'] == 'fail' for r in rows)
    fp = sum(lab[r['file']] == 'fail' and r['judge'] == 'pass' for r in rows)
    mp = sum(lab[r['file']] == 'pass' for r in rows)
    out[name] = dict(n=len(rows), agree=a, mike_pass=mp, pass_judged_fail=pf, fail_judged_pass=fp)
    print(f"{name}: agree {a}/{len(rows)}; Mike pass {mp}; his pass judged fail {pf}; his fail judged pass {fp}")
for g in ('tuning', 'held_out'):
    rows = [r for r in J.values() if r['group'] == g]
    stats(rows, g)
    for s in ('reference', 'system'):
        stats([r for r in rows if key[r['file']]['source'] == s], f'{g} {s}')
# repeats: judge on repeat vs judge on first showing; also vs Mike's label on the repeat
first = {r['file']: r['judge'] for r in J.values() if r['group'] in ('tuning', 'held_out')}
reps = [r for r in J.values() if r['group'] == 'repeat']
same = sum(r['judge'] == first[key[r['file']]['repeat_of']] for r in reps)
stats(reps, 'repeat (vs Mike label on the repeat)')
mike_same = sum(lab[r['file']] == lab[key[r['file']]['repeat_of']] for r in reps)
print(f"repeat consistency: judge {same}/10, Mike {mike_same}/10")
out['repeat_consistency'] = dict(judge=same, mike=mike_same)
# tables
for g in ('table-old', 'table-new'):
    rows = [r for r in J.values() if r['group'] == g]
    p = sum(r['judge'] == 'pass' for r in rows)
    print(f"{g}: judge pass {p}/10")
    out[g] = dict(judge_pass=p)
old = {r['file']: r['judge'] for r in J.values() if r['group'] == 'table-old'}
cons = sum(old[f] == first[f] for f in old)
fl = sum(lab[f] == 'fail' for f in old)
print(f"table-old: Mike failed {fl}/10 in round 1b; judge on the cut half agrees with judge on the same slide shown whole {cons}/10")
out['table-old'].update(mike_fail=fl, agrees_with_whole_slide=cons, agree_with_mike=sum(old[f]==lab[f] for f in old))
print('table-old agree with Mike', out['table-old']['agree_with_mike'])
json.dump(out, open('summary.json', 'w'), indent=1)
# per-slide verdict file without Mike's labels
with open('judgements.csv', 'w') as f:
    w = csv.writer(f); w.writerow(['anon', 'group', 'file', 'judge', 'reason'])
    for n in json.load(open('map.json'))['order']:
        rnd = 't1' if m[n]['group'] == 'tuning' else 'h'
        t = open(f'out/{rnd}-{n}.txt').read().strip().splitlines()
        w.writerow([n, m[n]['group'], m[n]['file'], J[n]['judge'], t[1].strip() if len(t) > 1 else ''])
