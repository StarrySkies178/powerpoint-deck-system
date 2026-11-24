"""bench_run.py [--label NAME] [case ids... | regression | capability]: build every case from its build.js, score it,
write results.md and add to results-log.md.

Two suites (roadmap step 1.1, v2.25): `suite` in cases.json.
  regression  cases that pass today; must stay all-pass. A drop here is a broken build, whatever else improved.
  capability  cases that fail today; they measure progress. A capability case moves to regression only when it
              passes 3 of 3 fresh rebuilds (bench/README.md, "Noise band"), never on one run.
The scorer is the same for every case (bench_score.py). What is reported as pass (Run 2c step 4, v2.62, decided with the
user 2026-11-24 14:40):
  regression and the named-slide capability cases (D02, Z01, Z02): pass or fail against bench_score.PASS, as before.
  deck-as-reference cases (C01-C10): NO pass mark. Reported: the overlap before the floor (layout_raw) against the
              original, its change against the previous run (bench/results-raw.json) and a flag when it falls by more
              than NOISE_RAW. The old pass/fail is still computed and kept in results-log.md beside the new numbers."""
import json, os, sys, subprocess, datetime
sys.path.insert(0, os.path.dirname(__file__))
from bench_score import score_case, PASS, layout_raw
import heldout   # leave-one-out check for deck-as-reference cases (v2.29): a C build that cites its own target slide fails
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOISE_RAW = 0.05   # deck-as-reference cases: a fall in layout_raw larger than this is flagged (README, "Deck-as-reference cases")
RAW = os.path.join(B, "results-raw.json")   # layout_raw of the C cases' stored builds at the last run
is_ref = lambda cid: cid.startswith("C")

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
    if is_ref(cid): res["layout_raw"] = round(layout_raw(os.path.join(d, "original.png"), os.path.join(d, "candidate.png")), 4)
    rows.append(res)
    print(f"[{SUITE[cid][:3]}]", cid, "PASS" if res["passed"] else "fail", f"std {res['n_std_ok']}/{res['n_std']}", "layout", res["layout"], "visual", res["visual"], "LEAVE-ONE-OUT: " + "; ".join(leak) if leak else "")

prev_raw = json.load(open(RAW)) if os.path.exists(RAW) else {}
def count(suite=None, ref=None):
    rr = [r for r in rows if (suite is None or SUITE[r["id"]] == suite) and (ref is None or is_ref(r["id"]) == ref)]
    return sum(1 for r in rr if r.get("passed")), len(rr)
n_pass, n_all = count(); rp, rn = count("regression"); cp, cn = count("capability"); np_, nn_ = count("capability", False)
broken = [r["id"] for r in rows if SUITE[r["id"]] == "regression" and not r.get("passed")]
refs = [r for r in rows if is_ref(r["id"])]
for r in refs:
    pv = (prev_raw.get(r["id"]) or {}).get("layout_raw")
    r["prev_raw"] = pv; r["change"] = None if (pv is None or "layout_raw" not in r) else round(r["layout_raw"] - pv, 4)
    r["flag"] = r["change"] is not None and r["change"] < -NOISE_RAW
flagged = [r["id"] for r in refs if r["flag"]]
now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
L = [f"# Benchmark results: {label} ({now})", "",
     f"**Regression {rp} / {rn}** (must stay all-pass) · **Named-slide capability {np_} / {nn_}** · **Deck-as-reference: {len(refs)} cases, no pass mark, "
     f"{len(flagged)} moved back by more than {NOISE_RAW}**" + (f" ({', '.join(flagged)})" if flagged else ""), "",
     f"Bar for regression and named-slide cases: all standards, layout ≥ {PASS['layout']}, visual ≥ {PASS['visual']}. Deck-as-reference cases (C01 to C10) "
     "carry no pass mark since v2.62 (decided with the user 2026-11-24 14:40): they report the overlap with the original before the floor (layout_raw) and its "
     f"change against the previous run; a fall of more than {NOISE_RAW} is flagged. One run of the stored builds; claims about progress use 3 fresh rebuilds "
     "(README, \"Noise band\" and \"Deck-as-reference cases\").", "", ENV_LINE, ""]
if broken: L += [f"**REGRESSION BROKEN:** {', '.join(broken)}", ""]
def std_fails(r): return "; ".join([f"{s['check']} ({s['detail']})" for s in r["standards"] if not s["ok"]] + [f"leave-one-out ({x})" for x in r.get("leave_one_out", [])])
for title, sel in (("Regression suite", lambda r: SUITE[r["id"]] == "regression"), ("Capability suite, named-slide cases", lambda r: SUITE[r["id"]] == "capability" and not is_ref(r["id"]))):
    rr = [r for r in rows if sel(r)]
    if not rr: continue
    L += [f"## {title}: {sum(1 for r in rr if r.get('passed'))} / {len(rr)}", "", "| Case | Result | Standards | Layout | Visual | Failed checks |", "|---|---|---|---|---|---|"]
    for r in rr:
        if "error" in r: L.append(f"| {r['id']} | build failed | | | | {r['error'][:80]} |"); continue
        vis = "–" if r["visual"] is None else f"{r['visual']:.2f}"
        L.append(f"| {r['id']} | {'**pass**' if r['passed'] else 'fail'} | {r['n_std_ok']}/{r['n_std']} | {r['layout']:.2f} | {vis} | {std_fails(r)} |")
    L.append("")
if refs:
    L += [f"## Capability suite, deck-as-reference cases (no pass mark)", "",
          "| Case | Overlap before the floor (layout_raw) | Previous run | Change | Flag | Standards (for information) | Failed checks |", "|---|---|---|---|---|---|---|"]
    for r in refs:
        if "error" in r: L.append(f"| {r['id']} | build failed | | | | | {r['error'][:80]} |"); continue
        pv = "–" if r["prev_raw"] is None else f"{r['prev_raw']:.3f}"; ch = "–" if r["change"] is None else f"{r['change']:+.3f}"
        L.append(f"| {r['id']} | {r['layout_raw']:.3f} | {pv} | {ch} | {'**moved back**' if r['flag'] else ''} | {r['n_std_ok']}/{r['n_std']} | {std_fails(r)} |")
    old_lay = ", ".join(f"{r['id'][:3]} {r['layout']:.2f}" for r in refs if "error" not in r)
    L += ["", f"Old bar, for comparison only: {sum(1 for r in refs if r.get('passed'))} of {len(refs)} would pass (layout after the floor: {old_lay}).", ""]
open(os.path.join(B, "results.md"), "w").write("\n".join(L))
if refs and (not args or len(refs) == sum(1 for c in CASES if is_ref(c["id"]))):   # the previous-run file moves on only after a run of all C cases
    json.dump({r["id"]: dict(layout_raw=r.get("layout_raw"), run=label, when=now) for r in refs}, open(RAW, "w"), indent=1)
log = os.path.join(B, "results-log.md")
prev = open(log).read() if os.path.exists(log) else "# Benchmark history\n"
NEWHEAD = ("\n## Since v2.62 (Run 2c step 4): deck-as-reference cases without a pass mark\n\n"
           "The old columns continue (Pass and Standards counted with the old bar for every case, mean layout and visual after the floor); the new columns are the "
           "regression and named-slide counts that now carry the pass mark, and the deck-as-reference cases' mean overlap before the floor with the number flagged.\n\n"
           "| When | Run | Pass, old bar (all cases) | Standards OK | Mean layout | Mean visual | Regression | Named-slide capability | C cases: mean layout_raw (flagged) |\n"
           "|---|---|---|---|---|---|---|---|---|\n")
if "## Since v2.62" not in prev: prev = prev.rstrip("\n") + "\n" + NEWHEAD
ok = [r for r in rows if "error" not in r]
ml = sum(r["layout"] for r in ok) / max(1, len(ok)); vv = [r["visual"] for r in ok if r["visual"] is not None]
rawv = [r["layout_raw"] for r in refs if "layout_raw" in r]
prev += (f"| {now} | {label} ({len(rows)} cases{'' if ENV['official'] else ', NOT official environment: ' + ENV['libreoffice'] + ' ' + ENV['arch']}) | {n_pass}/{n_all} (regression {rp}/{rn}, capability {cp}/{cn}) | "
         f"{sum(r['n_std_ok'] for r in ok)}/{sum(r['n_std'] for r in ok)} | {ml:.2f} | {sum(vv)/max(1,len(vv)):.2f} | {rp}/{rn} | {np_}/{nn_} | "
         + (f"{sum(rawv)/len(rawv):.3f} ({len(flagged)})" if rawv else "–") + " |\n")
open(log, "w").write(prev)
print(f"Regression {rp}/{rn}{'  BROKEN: ' + ', '.join(broken) if broken else ' (must stay all-pass)'}")
print(f"Named-slide capability {np_}/{nn_}")
print(f"Deck-as-reference: {len(refs)} cases, mean layout_raw {sum(rawv)/max(1,len(rawv)):.3f}, moved back: {', '.join(flagged) or 'none'}")
print(f"Old bar, all cases: {n_pass}/{n_all} pass (regression {rp}/{rn}, capability {cp}/{cn})")
