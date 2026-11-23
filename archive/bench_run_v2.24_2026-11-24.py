"""bench_run.py [--label NAME] [case ids...]: build every case from its build.js, score it, write results.md and add to results-log.md."""
import json, os, sys, subprocess, datetime
sys.path.insert(0, os.path.dirname(__file__))
from bench_score import score_case, PASS
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]; label = "run"
if args[:1] == ["--label"]: label, args = args[1], args[2:]
cases = [c["id"] for c in json.load(open(os.path.join(B, "cases.json")))]
ids = [c for c in cases if not args or any(c.startswith(a) for a in args)]
rows = []
for cid in ids:
    d = os.path.join(B, "cases", cid)
    cand = os.path.join(d, "candidate.pptx")
    t0 = __import__("time").time() - 1   # a build counts only if it (re)wrote candidate.pptx; old files are overwritten, never deleted
    r = subprocess.run(["node", os.path.join(d, "build.js")], capture_output=True, text=True, env=dict(os.environ))
    if r.returncode == 0 and os.path.exists(os.path.join(d, "build.py")):   # second step: place stored objects (object store)
        r = subprocess.run([sys.executable, os.path.join(d, "build.py")], capture_output=True, text=True, env=dict(os.environ), cwd=d)
    if r.returncode or not os.path.exists(cand) or os.path.getmtime(cand) < t0:
        rows.append(dict(id=cid, passed=False, error=(r.stderr or r.stdout)[-400:])); print(cid, "BUILD FAILED", r.stderr[-300:]); continue
    res = score_case(d); rows.append(res)
    print(cid, "PASS" if res["passed"] else "fail", f"std {res['n_std_ok']}/{res['n_std']}", "layout", res["layout"], "visual", res["visual"])
n_pass = sum(1 for r in rows if r.get("passed"))
now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
L = [f"# Benchmark results: {label} ({now})", "", f"**{n_pass} / {len(rows)} pass** (bar: all standards, layout ≥ {PASS['layout']}, visual ≥ {PASS['visual']})", "",
     "| Case | Result | Standards | Layout | Visual | Failed checks |", "|---|---|---|---|---|---|"]
for r in rows:
    if "error" in r: L.append(f"| {r['id']} | build failed | | | | {r['error'][:80]} |"); continue
    fails = "; ".join(f"{s['check']} ({s['detail']})" for s in r["standards"] if not s["ok"])
    L.append(f"| {r['id']} | {'**pass**' if r['passed'] else 'fail'} | {r['n_std_ok']}/{r['n_std']} | {r['layout']:.2f} | {'–' if r['visual'] is None else f'{r[chr(118)+chr(105)+chr(115)+chr(117)+chr(97)+chr(108)]:.2f}'} | {fails} |")
open(os.path.join(B, "results.md"), "w").write("\n".join(L) + "\n")
log = os.path.join(B, "results-log.md")
prev = open(log).read() if os.path.exists(log) else "# Benchmark history\n\n| When | Run | Pass | Standards OK | Mean layout | Mean visual |\n|---|---|---|---|---|---|\n"
ok = [r for r in rows if "error" not in r]
ml = sum(r["layout"] for r in ok) / max(1, len(ok)); vv = [r["visual"] for r in ok if r["visual"] is not None]
prev += f"| {now} | {label} ({len(rows)} cases) | {n_pass}/{len(rows)} | {sum(r['n_std_ok'] for r in ok)}/{sum(r['n_std'] for r in ok)} | {ml:.2f} | {sum(vv)/max(1,len(vv)):.2f} |\n"
open(log, "w").write(prev)
print(f"{n_pass}/{len(rows)} pass")
