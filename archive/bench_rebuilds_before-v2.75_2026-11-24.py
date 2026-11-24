"""bench_rebuilds.py: the fresh-rebuild half of change control (roadmap 4.2; maintenance/working-together.md).

  python3 bench/scripts/bench_rebuilds.py <run> [case prefixes...]   build and score bench/phase4/<run>/<case>/r1..r3
  python3 bench/scripts/bench_rebuilds.py <run> --report [<baseline run>]   write bench/phase4/<run>/results.md

Each r<k> folder holds a build written by its own fresh, blind builder from brief/brief.md (rebuild_briefs.py). Here,
in the official environment, the reference files the scorer needs (case.json, original.json, original.png) are copied
in, the build is run, and it is scored with the unchanged scorer (bench_score.score_case). A leave-one-out finding
(heldout.py) fails the build, as in bench_run.py. Nothing in bench/cases/ is changed.

Since v2.62 (Run 2c step 4, decided with the user 2026-11-24 14:40) the C cases carry no pass mark. What decides a run
against the one before is the mean overlap before the floor (layout_raw) of each case's fresh builds: a case whose mean
falls by more than NOISE_RAW is flagged (change control: restore unless the fall is explained). Pass/fail with the old bar,
layout and visual after the floor are still reported beside it, for comparison only."""
import json, os, sys, shutil, subprocess, datetime, statistics, time
from collections import Counter
sys.path.insert(0, os.path.dirname(__file__))
from bench_score import score_case, PASS, layout_raw
import heldout
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CASES = [c["id"] for c in json.load(open(os.path.join(B, "cases.json"))) if c["id"].startswith("C")]
RUNS = ("r1", "r2", "r3")
NOISE = 0.14       # old band on the floored layout/visual (v2.25); reported for comparison only
NOISE_RAW = 0.05   # band on the per-case mean layout_raw of 3 fresh builds (README, "Deck-as-reference cases")

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
        if leak:
            r["passed"] = False; r["leave_one_out"] = leak
            json.dump(r, open(os.path.join(run, "result.json"), "w"), indent=1, ensure_ascii=False)
        out[k] = dict(passed=r["passed"], layout=r["layout"], visual=r["visual"], std=f"{r['n_std_ok']}/{r['n_std']}",
                      layout_raw=round(layout_raw(os.path.join(run, "original.png"), os.path.join(run, "candidate.png")), 4),
                      failed=[s["check"] for s in r["standards"] if not s["ok"]] + (["leave-one-out"] if leak else []),
                      detail=[f"{s['check']} ({s['detail']})" for s in r["standards"] if not s["ok"]] + [f"leave-one-out ({x})" for x in leak])
        print(cid, k, "PASS" if r["passed"] else "fail", "std", out[k]["std"], "layout", r["layout"], "visual", r["visual"])
    json.dump(dict(case=cid, run=name, scored=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"), builds=out),
              open(os.path.join(B, "phase4", name, cid, "rebuilds.json"), "w"), indent=1, ensure_ascii=False)

def load(name):
    rows = {}
    for cid in CASES:
        f = os.path.join(B, "phase4", name, cid, "rebuilds.json")
        if os.path.exists(f):
            rows[cid] = json.load(open(f))["builds"]
            for k, bd in rows[cid].items():   # runs scored before v2.62 have no layout_raw: measure it from the build's own picture
                c = os.path.join(B, "phase4", name, cid, k, "candidate.png")
                if "error" not in bd and "layout_raw" not in bd and os.path.exists(c):
                    bd["layout_raw"] = round(layout_raw(os.path.join(B, "cases", cid, "original.png"), c), 4)
    return rows

def summary(rows):
    ok = lambda r: "error" not in r
    per = {}
    for cid, bs in rows.items():
        g = [b for b in bs.values() if ok(b)]
        per[cid] = dict(n=len(g), passes=sum(b["passed"] for b in g),
                        layout=statistics.mean([b["layout"] for b in g] + [0] * (3 - len(g))),   # a failed build counts 0
                        visual=statistics.mean([b["visual"] or 0 for b in g] + [0] * (3 - len(g))),
                        raw=statistics.mean([b.get("layout_raw", 0) for b in g] + [0] * (3 - len(g))),
                        failed=Counter(f for b in g for f in b["failed"]))
    allb = [b for bs in rows.values() for b in bs.values()]
    return per, dict(builds=len(allb), built=sum(ok(b) for b in allb), passing_builds=sum(1 for b in allb if ok(b) and b["passed"]),
                     cases_3of3=sum(1 for p in per.values() if p["passes"] == 3),
                     layout=statistics.mean(p["layout"] for p in per.values()), visual=statistics.mean(p["visual"] for p in per.values()),
                     raw=statistics.mean(p["raw"] for p in per.values()),
                     failed=sum((p["failed"] for p in per.values()), Counter()))

def report(name, base=None):
    rows = load(name); per, tot = summary(rows)
    L = [f"# Fresh blind rebuilds: {name}", "",
         f"Written by `bench/scripts/bench_rebuilds.py` ({datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}); official environment; unchanged scorer. "
         "Three builds per C case, each by its own fresh blind builder. A build that did not run counts 0. Since v2.62 the C cases carry no pass mark: the "
         f"measure is the overlap with the original before the floor (layout_raw); a case whose mean falls by more than {NOISE_RAW} against the run before is flagged. "
         f"The old bar (all standards, layout ≥ {PASS['layout']}, visual ≥ {PASS['visual']}) is shown for comparison only.", "",
         "| Case | r1 | r2 | r3 | Mean layout_raw | Old: mean layout / visual |", "|---|---|---|---|---|---|"]
    cell = lambda b: "build failed" if "error" in b else f"{b.get('layout_raw', 0):.3f} (old: {'pass' if b['passed'] else 'fail'} {b['std']} · {b['layout']:.2f} / " + ("–" if b["visual"] is None else f"{b['visual']:.2f}") + ")"
    for cid, bs in rows.items(): L.append(f"| {cid} | " + " | ".join(cell(bs.get(k, {"error": 1})) for k in RUNS) + f" | {per[cid]['raw']:.3f} | {per[cid]['layout']:.2f} / {per[cid]['visual']:.2f} |")
    L += ["", f"**Builds that ran:** {tot['built']} of {tot['builds']}. **Mean over the cases of the per-case mean layout_raw:** {tot['raw']:.3f}. "
          f"Old bar: {tot['passing_builds']} passing builds, mean layout {tot['layout']:.3f}, visual {tot['visual']:.3f}.", "",
          "**Failed standards (number of builds, for information):** " + (", ".join(f"{k} {v}" for k, v in tot["failed"].most_common()) or "none"), ""]
    if base:
        bper, btot = summary(load(base))
        L += [f"## Against {base}", "", "| Case | Mean layout_raw {0} → {1} | Flag | Old: layout {0} → {1} | Old: visual {0} → {1} |".format(base, name), "|---|---|---|---|---|"]
        back, worse_old = [], []
        for cid in rows:
            if cid not in bper: continue
            dr = per[cid]["raw"] - bper[cid]["raw"]; dl = per[cid]["layout"] - bper[cid]["layout"]; dv = per[cid]["visual"] - bper[cid]["visual"]
            if dr < -NOISE_RAW: back.append(cid)
            if dl <= -NOISE or dv <= -NOISE: worse_old.append(cid)
            L.append(f"| {cid} | {bper[cid]['raw']:.3f} → {per[cid]['raw']:.3f} ({dr:+.3f}) | {'**moved back**' if dr < -NOISE_RAW else ''} | "
                     f"{bper[cid]['layout']:.2f} → {per[cid]['layout']:.2f} ({dl:+.2f}) | {bper[cid]['visual']:.2f} → {per[cid]['visual']:.2f} ({dv:+.2f}) |")
        common = [c for c in rows if c in bper]
        m0 = statistics.mean(bper[c]["raw"] for c in common) if common else 0; m1 = statistics.mean(per[c]["raw"] for c in common) if common else 0
        L += ["", f"Mean layout_raw over the {len(common)} cases in both runs: {m0:.3f} → {m1:.3f}. "
              f"**Cases that moved back by more than {NOISE_RAW} in layout_raw: {', '.join(back) or 'none'}.** "
              f"Old rule, for comparison: cases worse by {NOISE} or more on layout or visual: {', '.join(worse_old) or 'none'}.", ""]
    open(os.path.join(B, "phase4", name, "results.md"), "w").write("\n".join(L)); print("\n".join(L))

if __name__ == "__main__":
    a = sys.argv[1:]; name = a[0]
    if a[1:2] == ["--report"]: report(name, a[2] if len(a) > 2 else None); sys.exit()
    for cid in [c for c in CASES if len(a) == 1 or any(c.startswith(p) for p in a[1:])]: score(name, cid)
