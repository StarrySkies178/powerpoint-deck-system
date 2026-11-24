"""bench_run.py [--label NAME] [case ids... | regression | capability]: build every case from its build.js, score it,
write results.md and add to results-log.md.

Two suites (roadmap step 1.1, v2.25): `suite` in cases.json.
  regression  cases that pass today; must stay all-pass. A drop here is a broken build, whatever else improved.
  capability  cases that fail today; they measure progress. A capability case moves to regression only when it
              passes 3 of 3 fresh rebuilds (bench/README.md, "Noise band"), never on one run.
The pass bar and the scorer are the same for both suites (bench_score.PASS)."""
import json, os, sys, subprocess, datetime
sys.path.insert(0, os.path.dirname(__file__))
from bench_score import score_case, PASS
import heldout   # leave-one-out check for deck-as-reference cases (v2.29): a C build that cites its own target slide fails
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def environment():
    """What renders and builds the slides. The official environment is in bench/environment.json (README, "Official
    environment"); numbers from another environment are not comparable and the run says so."""
    def out(cmd):
        try: return subprocess.run(cmd, capture_output=True, text=True, timeout=60).stdout + subprocess.run(cmd, capture_output=True, text=True, timeout=60).stderr
        except Exception: return ""
    import platform, re as _re
    env = {"libreoffice": (_re.search(r"LibreOffice ([\d.]+)", out(["soffice", "--version"])) or [None, "?"])[1],
           "poppler": (_re.search(r"pdftoppm version ([\d.]+)", out(["pdftoppm", "-v"])) or [None, "?"])[1],
           "arch": platform.machine(), "python": platform.python_version()}
    try:
        p = subprocess.run(["node", "-e", "console.log(require.resolve('pptxgenjs'))"], capture_output=True, text=True, timeout=60).stdout.strip()
        while p and not os.path.exists(os.path.join(p, "package.json")): p = os.path.dirname(p)
        env["pptxgenjs"] = json.load(open(os.path.join(p, "package.json")))["version"]
    except Exception: env["pptxgenjs"] = "?"
    env["fonts"] = "; ".join(out(["fc-match", f]).strip() for f in ("Arial", "Microsoft YaHei"))
    try: off = json.load(open(os.path.join(B, "environment.json")))
    except Exception: off = {}
    env["official"] = bool(off) and all(env.get(k) == off.get(k) for k in ("libreoffice", "poppler", "arch", "pptxgenjs"))
    return env
ENV = environment()
ENV_LINE = (f"Environment: LibreOffice {ENV['libreoffice']}, poppler {ENV['poppler']}, pptxgenjs {ENV['pptxgenjs']}, {ENV['arch']}, Python {ENV['python']} "
            + ("(the official one)" if ENV["official"] else "(NOT the official environment in bench/environment.json: these numbers are not comparable with official runs)"))
print(ENV_LINE)
args = sys.argv[1:]; label = "run"
if args[:1] == ["--label"]: label, args = args[1], args[2:]
CASES = json.load(open(os.path.join(B, "cases.json")))
SUITE = {c["id"]: c.get("suite", "capability") for c in CASES}
suites = [a for a in args if a in ("regression", "capability")]; args = [a for a in args if a not in suites]
ids = [c["id"] for c in CASES if (not args or any(c["id"].startswith(a) for a in args)) and (not suites or SUITE[c["id"]] in suites)]
rows = []
for cid in ids:
    d = os.path.join(B, "cases", cid)
    cand = os.path.join(d, "candidate.pptx")
    t0 = __import__("time").time() - 1   # a build counts only if it (re)wrote candidate.pptx; old files are overwritten, never deleted
    r = subprocess.run(["node", os.path.join(d, "build.js")], capture_output=True, text=True, env=dict(os.environ))
    if r.returncode == 0 and os.path.exists(os.path.join(d, "build.py")):   # second step: place stored objects (object store)
        r = subprocess.run([sys.executable, os.path.join(d, "build.py")], capture_output=True, text=True, env=dict(os.environ), cwd=d)
    if r.returncode or not os.path.exists(cand) or os.path.getmtime(cand) < t0:
        rows.append(dict(id=cid, passed=False, error=(r.stderr or r.stdout)[-400:])); print(f"[{SUITE[cid][:3]}]", cid, "BUILD FAILED", r.stderr[-300:]); continue
    res = score_case(d)
    leak = heldout.check(cid, d)
    if leak:
        res["passed"] = False; res["leave_one_out"] = leak
        json.dump({k: v for k, v in res.items()}, open(os.path.join(d, "result.json"), "w"), indent=1, ensure_ascii=False)
    rows.append(res)
    print(f"[{SUITE[cid][:3]}]", cid, "PASS" if res["passed"] else "fail", f"std {res['n_std_ok']}/{res['n_std']}", "layout", res["layout"], "visual", res["visual"], "LEAVE-ONE-OUT: " + "; ".join(leak) if leak else "")

def count(suite=None):
    rr = [r for r in rows if suite is None or SUITE[r["id"]] == suite]
    return sum(1 for r in rr if r.get("passed")), len(rr)
n_pass, n_all = count(); rp, rn = count("regression"); cp, cn = count("capability")
broken = [r["id"] for r in rows if SUITE[r["id"]] == "regression" and not r.get("passed")]
now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
L = [f"# Benchmark results: {label} ({now})", "",
     f"**Regression {rp} / {rn}** (must stay all-pass) · **Capability {cp} / {cn}** · **Total {n_pass} / {n_all} pass**", "",
     f"Bar for every case: all standards, layout ≥ {PASS['layout']}, visual ≥ {PASS['visual']}. One run of the stored builds; a case counts as "
     "passing for good only after 3 of 3 fresh rebuilds pass (README, \"Noise band\").", "", ENV_LINE, ""]
if broken: L += [f"**REGRESSION BROKEN:** {', '.join(broken)}", ""]
for suite, title in (("regression", "Regression suite"), ("capability", "Capability suite")):
    rr = [r for r in rows if SUITE[r["id"]] == suite]
    if not rr: continue
    p_, n_ = count(suite)
    L += [f"## {title}: {p_} / {n_}", "", "| Case | Result | Standards | Layout | Visual | Failed checks |", "|---|---|---|---|---|---|"]
    for r in rr:
        if "error" in r: L.append(f"| {r['id']} | build failed | | | | {r['error'][:80]} |"); continue
        fails = "; ".join([f"{s['check']} ({s['detail']})" for s in r["standards"] if not s["ok"]] + [f"leave-one-out ({x})" for x in r.get("leave_one_out", [])])
        vis = "–" if r["visual"] is None else f"{r['visual']:.2f}"
        L.append(f"| {r['id']} | {'**pass**' if r['passed'] else 'fail'} | {r['n_std_ok']}/{r['n_std']} | {r['layout']:.2f} | {vis} | {fails} |")
    L.append("")
open(os.path.join(B, "results.md"), "w").write("\n".join(L))
log = os.path.join(B, "results-log.md")
prev = open(log).read() if os.path.exists(log) else "# Benchmark history\n\n| When | Run | Pass | Standards OK | Mean layout | Mean visual |\n|---|---|---|---|---|---|\n"
ok = [r for r in rows if "error" not in r]
ml = sum(r["layout"] for r in ok) / max(1, len(ok)); vv = [r["visual"] for r in ok if r["visual"] is not None]
prev += (f"| {now} | {label} ({len(rows)} cases{'' if ENV['official'] else ', NOT official environment: ' + ENV['libreoffice'] + ' ' + ENV['arch']}) | {n_pass}/{n_all} (regression {rp}/{rn}, capability {cp}/{cn}) | "
         f"{sum(r['n_std_ok'] for r in ok)}/{sum(r['n_std'] for r in ok)} | {ml:.2f} | {sum(vv)/max(1,len(vv)):.2f} |\n")
open(log, "w").write(prev)
print(f"Regression {rp}/{rn}{'  BROKEN: ' + ', '.join(broken) if broken else ' (must stay all-pass)'}")
print(f"Capability {cp}/{cn}")
print(f"Total {n_pass}/{n_all} pass")
