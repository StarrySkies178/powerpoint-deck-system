"""bench_rebuilds.py: the fresh-rebuild half of change control (roadmap 4.2; maintenance/working-together.md).

  python3 bench/scripts/bench_rebuilds.py <run> [case prefixes...]   build and score bench/phase4/<run>/<case>/r1..r3
  python3 bench/scripts/bench_rebuilds.py <run> --report [<baseline run>]   write bench/phase4/<run>/results.md

Each r<k> folder holds a build written by its own fresh, blind builder from brief/brief.md (rebuild_briefs.py). Here,
in the official environment, the reference files the scorer needs (case.json, original.json, original.png) are copied
in, the build is run, and it is scored with the unchanged scorer (bench_score.score_case). A leave-one-out finding
(heldout.py) fails the build, as in bench_run.py. Nothing in bench/cases/ is changed."""
import json, os, sys, shutil, subprocess, datetime, statistics, time
from collections import Counter
sys.path.insert(0, os.path.dirname(__file__))
from bench_score import score_case, PASS
import heldout
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CASES = [c["id"] for c in json.load(open(os.path.join(B, "cases.json"))) if c["id"].startswith("C")]
RUNS = ("r1", "r2", "r3")
# the numbers check (every number from the prompt) is part of the measure since v2.50 (roadmap 4.2 Run 2);
# --no-numbers scores as before, to compare a run with earlier ones on the same terms
NUMBERS = "--no-numbers" not in sys.argv
if not NUMBERS: sys.argv.remove("--no-numbers")
sys.path.insert(0, os.path.join(os.path.dirname(B), "scripts"))
import deck_numbers
def numbers_missing(folder, prompt):
    if not os.path.exists(prompt): return []
    return [m for s in deck_numbers.check(os.path.join(folder, "candidate.pptx"), open(prompt, encoding="utf-8").read()) for m in s["missing"]]
NOISE = 0.14

def build(run):
    cand = os.path.join(run, "candidate.pptx"); t0 = time.time() - 1
    r = subprocess.run(["node", os.path.join(run, "build.js")], capture_output=True, text=True, cwd=run)
    if r.returncode == 0 and os.path.exists(os.path.join(run, "build.py")):
        r = subprocess.run([sys.executable, os.path.join(run, "build.py")], capture_output=True, text=True, cwd=run)
    if r.returncode or not os.path.exists(cand) or os.path.getmtime(cand) < t0:
        return (r.stderr or r.stdout or "no candidate.pptx written")[-400:]
    return None

def score(name, cid):
    out = {}
    for k in RUNS:
        run = os.path.join(B, "phase4", name, cid, k)
        if not os.path.exists(os.path.join(run, "build.js")): out[k] = dict(error="no build.js"); continue
        for f in ("case.json", "original.json", "original.png"): shutil.copyfile(os.path.join(B, "cases", cid, f), os.path.join(run, f))
        err = build(run)
        if err: out[k] = dict(error=err); print(cid, k, "BUILD FAILED", err[-200:]); continue
        r = score_case(run); leak = heldout.check(cid, run)
        nums = numbers_missing(run, os.path.join(B, "cases", cid, "prompt.md")) if NUMBERS else []
        if leak: r["passed"] = False; r["leave_one_out"] = leak
        if nums: r["passed"] = False; r["numbers"] = nums
        if leak or nums: json.dump(r, open(os.path.join(run, "result.json"), "w"), indent=1, ensure_ascii=False)
        out[k] = dict(passed=r["passed"], layout=r["layout"], visual=r["visual"], std=f"{r['n_std_ok']}/{r['n_std']}",
                      failed=[s["check"] for s in r["standards"] if not s["ok"]] + (["leave-one-out"] if leak else []) + (["numbers"] if nums else []),
                      detail=[f"{s['check']} ({s['detail']})" for s in r["standards"] if not s["ok"]] + [f"leave-one-out ({x})" for x in leak] + [f"number not in the prompt ({x})" for x in nums])
        print(cid, k, "PASS" if r["passed"] else "fail", "std", out[k]["std"], "layout", r["layout"], "visual", r["visual"])
    json.dump(dict(case=cid, run=name, scored=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"), builds=out),
              open(os.path.join(B, "phase4", name, cid, "rebuilds.json"), "w"), indent=1, ensure_ascii=False)

def load(name):
    rows = {}
    for cid in CASES:
        f = os.path.join(B, "phase4", name, cid, "rebuilds.json")
        if os.path.exists(f): rows[cid] = json.load(open(f))["builds"]
    return rows

def summary(rows):
    ok = lambda r: "error" not in r
    per = {}
    for cid, bs in rows.items():
        g = [b for b in bs.values() if ok(b)]
        per[cid] = dict(n=len(g), passes=sum(b["passed"] for b in g),
                        layout=statistics.mean([b["layout"] for b in g] + [0] * (3 - len(g))),   # a failed build counts 0
                        visual=statistics.mean([b["visual"] or 0 for b in g] + [0] * (3 - len(g))),
                        failed=Counter(f for b in g for f in b["failed"]))
    allb = [b for bs in rows.values() for b in bs.values()]
    return per, dict(builds=len(allb), built=sum(ok(b) for b in allb), passing_builds=sum(1 for b in allb if ok(b) and b["passed"]),
                     cases_3of3=sum(1 for p in per.values() if p["passes"] == 3),
                     layout=statistics.mean(p["layout"] for p in per.values()), visual=statistics.mean(p["visual"] for p in per.values()),
                     failed=sum((p["failed"] for p in per.values()), Counter()))

def report(name, base=None):
    rows = load(name); per, tot = summary(rows)
    L = [f"# Fresh blind rebuilds: {name}", "",
         f"Written by `bench/scripts/bench_rebuilds.py` ({datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}); official environment; unchanged scorer. "
         f"Bar: all standards, layout ≥ {PASS['layout']}, visual ≥ {PASS['visual']}. Three builds per C case, each by its own fresh blind builder. A build that did not run counts 0.", "",
         "| Case | r1 | r2 | r3 | Mean layout / visual |", "|---|---|---|---|---|"]
    cell = lambda b: "build failed" if "error" in b else f"{'**pass**' if b['passed'] else 'fail'} {b['std']} · {b['layout']:.2f} / " + ("–" if b["visual"] is None else f"{b['visual']:.2f}")
    for cid, bs in rows.items(): L.append(f"| {cid} | " + " | ".join(cell(bs.get(k, {"error": 1})) for k in RUNS) + f" | {per[cid]['layout']:.2f} / {per[cid]['visual']:.2f} |")
    L += ["", f"**Builds that ran:** {tot['built']} of {tot['builds']}. **Passing builds:** {tot['passing_builds']}. **Cases passing 3 of 3:** {tot['cases_3of3']} of {len(rows)}. "
          f"**Mean over the cases of the per-case mean:** layout {tot['layout']:.3f}, visual {tot['visual']:.3f}.", "",
          "**Failed standards (number of builds):** " + (", ".join(f"{k} {v}" for k, v in tot["failed"].most_common()) or "none"), ""]
    if base:
        bper, btot = summary(load(base))
        L += [f"## Against {base}", "", "| Case | Layout {0} → {1} | Visual {0} → {1} | Passing builds |".format(base, name), "|---|---|---|---|"]
        worse = []
        for cid in rows:
            if cid not in bper: continue
            dl = per[cid]["layout"] - bper[cid]["layout"]; dv = per[cid]["visual"] - bper[cid]["visual"]
            if dl <= -NOISE or dv <= -NOISE: worse.append(cid)
            L.append(f"| {cid} | {bper[cid]['layout']:.2f} → {per[cid]['layout']:.2f} ({dl:+.2f}) | {bper[cid]['visual']:.2f} → {per[cid]['visual']:.2f} ({dv:+.2f}) | {bper[cid]['passes']} → {per[cid]['passes']} |")
        L += ["", f"Mean layout {btot['layout']:.3f} → {tot['layout']:.3f}, visual {btot['visual']:.3f} → {tot['visual']:.3f}. "
              f"Cases worse by {NOISE} or more on the per-case mean layout or visual: {', '.join(worse) or 'none'}.",
              "Failed standards before: " + (", ".join(f"{k} {v}" for k, v in btot["failed"].most_common()) or "none"), ""]
    open(os.path.join(B, "phase4", name, "results.md"), "w").write("\n".join(L)); print("\n".join(L))

if __name__ == "__main__":
    a = sys.argv[1:]; name = a[0]
    if a[1:2] == ["--report"]: report(name, a[2] if len(a) > 2 else None); sys.exit()
    for cid in [c for c in CASES if len(a) == 1 or any(c.startswith(p) for p in a[1:])]: score(name, cid)
