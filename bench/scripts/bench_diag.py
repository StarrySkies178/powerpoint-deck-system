"""bench_diag.py: roadmap step 1.4, find the cause of the 0 of 10 on the deck-as-reference (C) cases.

  python3 bench/scripts/bench_diag.py [case id prefixes...]    build and score every diagnosis-1.4/<case>/{a,b,c}/
  python3 bench/scripts/bench_diag.py --report                 rewrite diagnosis-1.4/results.md from the scored builds

Three builds per C case, each written by its own fresh builder, each blind (bench/scripts/heldout.py):
  a  from the case brief as today (prompt.md + leave-one-out brief)
  b  the same brief plus a plain-words description of the original slide's layout (zones, kind of figure in each,
     number of columns or rows, header and footer bands; no positions, sizes, fonts or colours), written beforehand
     by a separate subagent that looked at the original. It sits in b/brief/layout-description.md.
  c  the builder takes the closest OTHER slide of the same deck from the object store and edits it to carry this
     content; the target slide's own objects stay off limits.

Nothing in bench/cases/ is changed. As in bench_noise.py, the reference files the scorer needs (case.json,
original.json, original.png) are copied into a build folder only here, after the build was written. Scoring is
bench_score.score_case, unchanged; a leave-one-out finding fails the build. Run it in the official environment
(bench/README.md, "Official environment")."""
import json, os, sys, shutil, subprocess, datetime, statistics, glob
sys.path.insert(0, os.path.dirname(__file__))
from bench_score import score_case, PASS
import heldout
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(B, "diagnosis-1.4")
CASES = [c["id"] for c in json.load(open(os.path.join(B, "cases.json"))) if c["id"].startswith("C")]
VARIANTS = ("a", "b", "c")
NOISE = 0.14   # layout difference in one case under this counts as noise (noise band, v2.25)

def build(run):
    cand = os.path.join(run, "candidate.pptx"); t0 = __import__("time").time() - 1
    r = subprocess.run(["node", os.path.join(run, "build.js")], capture_output=True, text=True, cwd=run)
    if r.returncode == 0 and os.path.exists(os.path.join(run, "build.py")):
        r = subprocess.run([sys.executable, os.path.join(run, "build.py")], capture_output=True, text=True, cwd=run)
    if r.returncode or not os.path.exists(cand) or os.path.getmtime(cand) < t0:
        return (r.stderr or r.stdout or "no candidate.pptx written")[-400:]
    return None

def score(cid):
    out = {}
    for v in VARIANTS:
        run = os.path.join(D, cid, v)
        if not os.path.exists(os.path.join(run, "build.js")): out[v] = dict(error="no build.js"); continue
        for f in ("case.json", "original.json", "original.png"): shutil.copyfile(os.path.join(B, "cases", cid, f), os.path.join(run, f))
        err = build(run)
        if err: out[v] = dict(error=err); print(cid, v, "BUILD FAILED", err[-200:]); continue
        r = score_case(run); leak = heldout.check(cid, run)
        if leak: r["passed"] = False; r["leave_one_out"] = leak; json.dump(r, open(os.path.join(run, "result.json"), "w"), indent=1, ensure_ascii=False)
        out[v] = dict(passed=r["passed"], layout=r["layout"], visual=r["visual"], std=f"{r['n_std_ok']}/{r['n_std']}",
                      failed=[f"{s['check']} ({s['detail']})" for s in r["standards"] if not s["ok"]] + [f"leave-one-out ({x})" for x in leak])
        print(cid, v, "PASS" if r["passed"] else "fail", "std", out[v]["std"], "layout", r["layout"], "visual", r["visual"])
    json.dump(dict(case=cid, scored=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"), builds=out),
              open(os.path.join(D, cid, "diagnosis.json"), "w"), indent=1, ensure_ascii=False)
    return out

def report():
    rows = {}
    for cid in CASES:
        f = os.path.join(D, cid, "diagnosis.json")
        if os.path.exists(f): rows[cid] = json.load(open(f))["builds"]
    cell = lambda r: ("build failed" if "error" in r else f"{'**pass**' if r['passed'] else 'fail'} {r['std']} · {r['layout']:.2f} / " + ("–" if r["visual"] is None else f"{r['visual']:.2f}"))
    L = ["# Roadmap step 1.4: why do the deck-as-reference cases fail?", "",
         f"Written by `bench/scripts/bench_diag.py --report` ({datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}), scored with the unchanged scorer. "
         f"Bar: all standards, layout ≥ {PASS['layout']}, visual ≥ {PASS['visual']}. Each cell: result, standards passed, layout / visual.", "",
         "- **a** brief as today · **b** brief + plain-words layout description of the original · **c** closest other slide of the same deck from the object store, edited", "",
         "| Case | a | b | c |", "|---|---|---|---|"]
    for cid, r in rows.items(): L.append(f"| {cid} | " + " | ".join(cell(r.get(v, {"error": 1})) for v in VARIANTS) + " |")
    L += ["", "## Failed standards", "", "| Case | a | b | c |", "|---|---|---|---|"]
    for cid, r in rows.items(): L.append(f"| {cid} | " + " | ".join("; ".join(r[v].get("failed", [])) if v in r and "error" not in r[v] else "build failed" for v in VARIANTS) + " |")
    def diff(v, k):
        d = [r[v][k] - r["a"][k] for r in rows.values() if "error" not in r.get(v, {"error": 1}) and "error" not in r.get("a", {"error": 1}) and r[v][k] is not None and r["a"][k] is not None]
        return d
    L += ["", "## Summary", "", "| | b minus a | c minus a |", "|---|---|---|"]
    for k in ("layout", "visual"):
        db, dc = diff("b", k), diff("c", k)
        f = lambda d: "–" if not d else f"mean {statistics.mean(d):+.3f} (cases {len(d)}; up by ≥ {NOISE}: {sum(x >= NOISE for x in d)}, down by ≥ {NOISE}: {sum(x <= -NOISE for x in d)})" if k == "layout" else f"mean {statistics.mean(d):+.3f} (cases {len(d)})"
        L.append(f"| {k} | {f(db)} | {f(dc)} |")
    L.append("| passing cases | " + " | ".join(f"{v}: {sum(1 for r in rows.values() if r.get(v, {}).get('passed'))} of {len(rows)}" for v in ("b", "c")) + f" (a: {sum(1 for r in rows.values() if r.get('a', {}).get('passed'))} of {len(rows)}) |")
    L += ["", f"A layout difference under {NOISE} in a single case is noise (bench/README.md, \"Noise band\": spreads up to 0.14 between three rebuilds of the same prompt).", ""]
    open(os.path.join(D, "results.md"), "w").write("\n".join(L)); print("\n".join(L))

if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["--report"]: report(); sys.exit()
    for cid in [c for c in CASES if not args or any(c.startswith(a) for a in args)]: score(cid)
    report()
