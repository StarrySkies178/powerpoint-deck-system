"""bench_noise.py: how much does a case's result move when its build is written again from the prompt? (roadmap step 1.2)

  python3 bench/scripts/bench_noise.py <case id prefix> ...      score every cases/<id>/noise/run*/ attempt
  python3 bench/scripts/bench_noise.py --report                  rewrite bench/noise.md from the scored attempts

An attempt is a folder cases/<id>/noise/runN/ holding a build.js (and build.py if any) written by a FRESH builder
from prompt.md alone: no sight of the case's own build.js, result, original or the other attempts. Nothing in the
case folder itself is touched: the case's build.js, candidate.pptx and result.json stay as they are.

Scoring uses bench_score.score_case unchanged, on the attempt's own folder. The reference files it needs
(case.json, original.json, original.png) are copied into the attempt folder only here, after the build was written,
so a builder working in that folder never had them. The attempt keeps its candidate.pptx, candidate.png,
compare.png and result.json.

Rule this measures (bench/README.md, "Noise band"): a case counts as passing only if 3 of 3 rebuilds pass."""
import json, os, sys, shutil, subprocess, datetime, statistics, glob
sys.path.insert(0, os.path.dirname(__file__))
from bench_score import score_case, PASS
import heldout   # leave-one-out check (v2.29)
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CASES = {c["id"]: c for c in json.load(open(os.path.join(B, "cases.json")))}

def build(run):
    cand = os.path.join(run, "candidate.pptx"); t0 = __import__("time").time() - 1
    r = subprocess.run(["node", os.path.join(run, "build.js")], capture_output=True, text=True, cwd=run)
    if r.returncode == 0 and os.path.exists(os.path.join(run, "build.py")):
        r = subprocess.run([sys.executable, os.path.join(run, "build.py")], capture_output=True, text=True, cwd=run)
    if r.returncode or not os.path.exists(cand) or os.path.getmtime(cand) < t0:
        return (r.stderr or r.stdout or "no candidate.pptx written")[-400:]
    return None

def score(cid):
    out = []
    for run in sorted(glob.glob(os.path.join(B, "cases", cid, "noise", "run*"))):
        if not os.path.exists(os.path.join(run, "build.js")): out.append(dict(run=os.path.basename(run), error="no build.js")); continue
        for f in ("case.json", "original.json", "original.png"): shutil.copyfile(os.path.join(B, "cases", cid, f), os.path.join(run, f))
        err = build(run)
        if err: out.append(dict(run=os.path.basename(run), error=err)); print(cid, os.path.basename(run), "BUILD FAILED", err[-200:]); continue
        r = score_case(run); leak = heldout.check(cid, run)
        if leak: r["passed"] = False; r["leave_one_out"] = leak; json.dump(r, open(os.path.join(run, "result.json"), "w"), indent=1, ensure_ascii=False)
        out.append(dict(run=os.path.basename(run), passed=r["passed"], layout=r["layout"], visual=r["visual"], std=f"{r['n_std_ok']}/{r['n_std']}",
                        failed=[f"{s['check']} ({s['detail']})" for s in r["standards"] if not s["ok"]] + [f"leave-one-out ({x})" for x in leak]))
        print(cid, os.path.basename(run), "PASS" if r["passed"] else "fail", "std", out[-1]["std"], "layout", r["layout"], "visual", r["visual"])
    json.dump(dict(case=cid, scored=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"), runs=out),
              open(os.path.join(B, "cases", cid, "noise", "noise.json"), "w"), indent=1, ensure_ascii=False)
    return out

def spread(v): v = [x for x in v if x is not None]; return (min(v), max(v), max(v) - min(v), statistics.mean(v)) if v else None

def report():
    L = ["# Noise band: the same prompt built again by fresh builders", "",
         f"Written by `bench/scripts/bench_noise.py --report` ({datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}). Bar: all standards, layout ≥ {PASS['layout']}, visual ≥ {PASS['visual']}. "
         "Stored = the case's own build.js in the last full run; runs 1 to 3 = three builds written again from prompt.md alone, each by a fresh builder.", "",
         "| Case | Suite | Stored | Run 1 | Run 2 | Run 3 | Passes | Layout range (spread) | Visual range (spread) |", "|---|---|---|---|---|---|---|---|---|"]
    for nf in sorted(glob.glob(os.path.join(B, "cases", "*", "noise", "noise.json"))):
        d = json.load(open(nf)); cid = d["case"]; st = json.load(open(os.path.join(B, "cases", cid, "result.json")))
        cell = lambda r: ("build failed" if "error" in r else f"{'**pass**' if r['passed'] else 'fail'} {r['std']} · {r['layout']:.2f} / " + ("–" if r["visual"] is None else f"{r['visual']:.2f}"))
        runs = d["runs"]; ok = [r for r in runs if "error" not in r]
        lay = spread([r["layout"] for r in ok]); vis = spread([r["visual"] for r in ok])
        fmt = lambda s: "–" if not s else f"{s[0]:.2f} to {s[1]:.2f} ({s[2]:.2f})"
        stored = f"{'**pass**' if st['passed'] else 'fail'} {st['n_std_ok']}/{st['n_std']} · {st['layout']:.2f} / " + ("–" if st["visual"] is None else f"{st['visual']:.2f}")
        L.append(f"| {cid} | {CASES[cid].get('suite', '')} | {stored} | " + " | ".join(cell(r) for r in runs) + f" | {sum(1 for r in ok if r['passed'])} of {len(runs)} | {fmt(lay)} | {fmt(vis)} |")
        for r in ok:
            if r["failed"]: L.append(f"|  |  |  | {r['run']} failed: {'; '.join(r['failed'])} |  |  |  |  |  |")
    L += ["", "Cells: result, standards passed, layout / visual."]
    open(os.path.join(B, "noise.md"), "w").write("\n".join(L) + "\n"); print("wrote bench/noise.md")

if __name__ == "__main__":
    a = sys.argv[1:]
    if a == ["--report"]: report()
    else:
        for cid in [c for c in CASES if any(c.startswith(x) for x in a)]: score(cid)
        report()
