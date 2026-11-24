"""Re-baseline numbers for the deck-as-reference cases (measuring tool only; bench_rebuilds.py's rule is unchanged).
For every C case: mean and spread of layout_raw over every fresh blind build made with code that was KEPT,
and what each tried run looks like against that baseline. Writes bench/phase4/baseline.md."""
import sys, os, statistics as st, datetime
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import bench_rebuilds as R
KEPT = {"run0": "v2.46 baseline (Run 0)", "run1": "Run 1, body text size (v2.49, kept)", "run2a-final": "Run 2a closed, final table code (v2.59, kept; C03, C08, C10 only)"}
LEFT_OUT = {"run2a": "Run 2a's first 9 builds: made while table() still forced 14 pt, so not the code kept (v2.59 rebuilt them as run2a-final)",
            "run2": "not kept (v2.51)", "run5": "not kept (v2.68)", "run7": "not kept (v2.70)"}
TRIED = ["run2", "run5", "run7"]
D = {r: R.load(r) for r in list(KEPT) + list(LEFT_OUT)}
val = lambda r, c: [D[r][c][k]["layout_raw"] for k in ("r1", "r2", "r3") if c in D[r] and k in D[r][c] and D[r][c][k].get("layout_raw") is not None]
cases = sorted(D["run1"])
L = [f"# Re-baseline of the deck-as-reference rebuilds (measuring tool only)", "",
     f"Written by `bench/phase4/baseline.py` ({datetime.datetime.now():%Y-%m-%d %H:%M}), official environment, from the stored scores of each run (`bench_rebuilds.load`). **Nothing in `bench_rebuilds.py` or its rule changed**: today every run is still compared with the run before (run1), with a band of 0.05 on the mean `layout_raw` of 3 fresh builds. This file prepares the alternative the planner put to Mike: each case compared with its mean over all fresh builds made with kept code.", "",
     "**Builds counted (kept code):** " + "; ".join(f"`{r}` = {t}" for r, t in KEPT.items()) + ".", "",
     "**Left out:** " + "; ".join(f"`{r}` ({t})" for r, t in LEFT_OUT.items()) + ". The 15 noise rebuilds of v2.25 (`cases/<id>/noise/`) are also left out: older code, scored against the LibreOffice originals of that day.", "",
     "## Baseline per case", "", "| Case | Builds | From | Mean layout_raw | SD | Min to max | run1 mean | run1 minus baseline |", "|---|---|---|---|---|---|---|---|"]
base = {}
for c in cases:
    v = []; src = []
    for r in KEPT:
        x = val(r, c)
        if x: v += x; src.append(f"{r} ({len(x)})")
    m, sd = st.mean(v), st.stdev(v); base[c] = (m, sd, len(v)); r1 = st.mean(val("run1", c))
    L.append(f"| {c} | {len(v)} | {', '.join(src)} | {m:.3f} | {sd:.3f} | {min(v):.3f} to {max(v):.3f} | {r1:.3f} | {r1 - m:+.3f} |")
L += ["", "## The tried runs against this baseline, for information (no verdict changes here)", "",
      "Mean of the run's 3 builds minus the baseline mean. A fall of more than 0.05 is marked. Today's rule compares with run1 instead.", "",
      "| Case | " + " | ".join(f"{r} vs baseline" for r in TRIED) + " | " + " | ".join(f"{r} vs run1" for r in TRIED) + " |", "|---|" + "---|" * (2 * len(TRIED))]
for c in cases:
    a = []; b = []
    for r in TRIED:
        x = val(r, c)
        if not x: a.append("–"); b.append("–"); continue
        d = st.mean(x) - base[c][0]; e = st.mean(x) - st.mean(val("run1", c))
        a.append(f"{d:+.3f}" + (" **back**" if d < -0.05 else "")); b.append(f"{e:+.3f}" + (" **back**" if e < -0.05 else ""))
    L.append(f"| {c} | " + " | ".join(a) + " | " + " | ".join(b) + " |")
sd_within = st.mean([b[1] for b in base.values()])
L += ["", "## Reading", "",
      f"- **Spread between builds of the same case, kept code only:** mean SD {sd_within:.3f} per build, so the mean of 3 builds has an SD of about {sd_within / 3 ** 0.5:.3f}, and the difference of two such means about {sd_within * (2 / 3) ** 0.5:.3f}. The 0.05 band is about 2.3 of these. This spread now includes differences between runs (other builders, other days, the kept changes themselves), which the v2.62 band (0.027 within a run) did not.",
      "- **C05 is not explained by run1 alone.** run1 sits only 0.018 above the baseline, and C05 still falls by more than 0.05 against the baseline in all three tried runs (run2, run5, run7), whose changes did not touch timelines. All three were built after run1, so something that changed between run1 and the later runs and that C05's builders depend on (for example the files they read, or how the builders approach a Gantt) is a better candidate than the changes themselves. A run with no change at all would settle it.",
      "- **Run 7 against the baseline:** C05 −0.108 and C04 −0.052 fall beyond 0.05; C10 is −0.050, on the edge (against run1 it was −0.056). C04 is a case Run 7 touches (the share column), so under the alternative rule C04, not C10, would be the question.",
      "- The rule itself (which cases count against a change, and what it is compared with) is the user's decision; this file only gives the numbers both ways."]
open(os.path.join(os.path.dirname(__file__), "baseline.md"), "w").write("\n".join(L) + "\n")
print("\n".join(L))
