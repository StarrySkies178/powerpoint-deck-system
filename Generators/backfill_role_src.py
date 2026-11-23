"""backfill_role_src.py <Templates dir> <store dir> [deck keys...]

Adds `role_src` (theme slot -> the colour it stood for in the source slide) to objects stored before
2026-11-23, so `place(..., colours="original")` can put a named reference slide back in its own colours.

How: re-extract the source deck into a scratch store and copy each slide object's role_src onto the stored
object of the same slide, and onto its parts (`part_of`) and vectorised pieces (`<id>c<n>`, `<id>v<n>`).
Safety: only when the re-extracted object has the same number of shapes as the stored one (else the source
file has changed since ingest, and the object is left alone and reported).
.ppt sources are converted to .pptx with LibreOffice first.
"""
import gzip, json, os, re, subprocess, sys, tempfile
sys.path.insert(0, os.path.dirname(__file__))
import objstore as O

SOURCES = {  # store deck key -> file in Templates/
    "del": "Deloitte-timesaver.pptx", "ey": "EY-graphics.pptx", "qpt": "Quick-Presentation-Toolkit.pptx", "bain": "Bain-concept-diagrams.pptx",
    "map": "Maps-world-US-China.pptx", "mono": "Concept-graphics-mono.ppt", "atk": "AT-Kearney-charts.ppt", "bcg": "BCG-writing-clear-slides.ppt",
    "bp": "BearingPoint-diagrams.ppt", "mck": "McKinsey-frequently-used.ppt", "rb": "Roland-Berger-modules.ppt",
    "case-harvester-lg": "Case-2016-Harvester-LG-HH-expansion.pptx", "case-jaguar-amorepacific": "Case-2016-Jaguar-Amorepacific-China.pptx",
    "case-olddriver-lg": "Case-2016-OldDriver-LG-HH-SUM37-rebuilt.pptx", "case-sparkle-shiseido": "Case-2016-Sparkle-Shiseido-China-rebuilt.pptx",
    "case-synergy-kose": "Case-2016-Synergy-KOSE-expansion.pptx", "case-truenorth-pola": "Case-2016-TrueNorth-Pola-China-growth.pptx",
    "case-littleboat-gree": "Case-2017-LittleBoat-GREE-digital.pptx", "case-neptune-appliance": "Case-2017-OnTheNeptune-appliance-digital.pptx",
    "case-polaris-gree": "Case-2017-Polaris-GREE-digital.pptx", "case-sssr-gree": "Case-2017-SSSR-GREE-online.pptx",
    "case19-bainology": "Case-2019-Bainology.pptx", "case19-ecluster": "Case-2019-E-Cluster.pptx", "case19-innovision": "Case-2019-InnoVision.pptx",
    "case19-mindcraft": "Case-2019-Mindcraft.pptx", "case19-polaris": "Case-2019-Polaris.pptx",
    "case20-baincraft": "Case-2020-Baincraft-rebuilt.pptx", "case20-doubleclick": "Case-2020-DoubleClick-rebuilt.pptx",
    "case20-gym-brief": "Case-2020-Gym-case-brief-rebuilt.pptx", "case20-tnt": "Case-2020-TNT-rebuilt.pptx", "case20-vaccine": "Case-2020-Vaccine-rebuilt.pptx",
}

def base_id(o):
    if o.get("part_of"): return o["part_of"]
    return re.sub(r"(c|v)\d+$", "", o["id"])

def backfill(tpl_dir, store, key):
    src = os.path.join(tpl_dir, SOURCES[key])
    if not os.path.exists(src): return f"{key}: source missing"
    tmp = tempfile.mkdtemp()
    if src.endswith(".ppt"):
        subprocess.run(["soffice", "--headless", "--convert-to", "pptx", "--outdir", tmp, src], capture_output=True, timeout=900)
        src = os.path.join(tmp, os.path.basename(src)[:-4] + ".pptx")
    fresh = {o["id"]: o for o in O.extract(src, key, tmp)}
    path = os.path.join(store, key + ".jsonl.gz")
    objs = [json.loads(l) for l in gzip.open(path, "rt", encoding="utf-8")]
    done = skipped = 0
    for o in objs:
        f = fresh.get(base_id(o))
        stored_base = next((x for x in objs if x["id"] == base_id(o)), o)
        if f and f.get("role_src") and f["n_shapes"] == stored_base.get("n_shapes"):
            o["role_src"] = f["role_src"]; done += 1
        else: skipped += 1
    with gzip.open(path, "wt", encoding="utf-8") as g:
        for o in objs: g.write(json.dumps(o, ensure_ascii=False) + "\n")
    O._CACHE.clear() if hasattr(O, "_CACHE") else None
    return f"{key}: {done} objects got role_src, {skipped} left as they were"

if __name__ == "__main__":
    tpl, store = sys.argv[1], sys.argv[2]
    keys = sys.argv[3:] or list(SOURCES)
    for k in keys: print(backfill(tpl, store, k), flush=True)
