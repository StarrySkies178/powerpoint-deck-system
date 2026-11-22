"""composition.py — measure how slides are composed: which panels (exhibits) a slide holds and how they are arranged.

For each whole-slide object: recursive whitespace cuts give a cut tree, e.g. 'H(V(a,b),c)' = left column of
2 stacked panels + one panel on the right. Each leaf is typed (chart, table, picture, diagram, text, connector)
and measured (share of content width/height). Connectors (chevrons/arrows between panels), numbered chips and
insight/so-what boxes are counted.
"""
import json, gzip, re, sys, os, collections
sys.path.insert(0, os.path.dirname(__file__))
import objstore as O, components as CP
A, P, NS = O.A, O.P, O.NS
EMU = 914400

def _leaf_type(els):
    xml = "".join(O.etree.tostring(e, encoding="unicode") for e in els)
    pr = re.findall(r'prst="(\w+)"', xml); txt = " ".join(O._text(e) for e in els)
    if "<a:tbl>" in xml or "<a:tbl " in xml: return "table"
    if "CHART:" in xml: return "chart"
    if sum(pr.count(x) for x in ("pie", "chord", "blockArc")) >= 4: return "table"       # Harvey grid
    if len(els) <= 2 and any(p in ("chevron", "rightArrow", "homePlate", "downArrow", "triangle") for p in pr) and len(txt) < 4: return "connector"
    rects = sum(pr.count(x) for x in ("rect",)); n_pic = xml.count("<p:pic>")
    if n_pic and len(txt) < 40: return "picture"
    if re.search(r"insight|comment|implication|recommend|key point|so what|we recommend", txt, re.I) and len(txt) > 30: return "insight"
    if len(pr) <= 2 and len(txt) > 40: return "text"
    if rects >= 6 and len(re.findall(r"\d", txt)) >= 6: return "chart"
    return "diagram"

def tree(idx, bbs, G, mw, mh, depth=0):
    """Like components._xycut but returns the cut tree."""
    if len(idx) < 2 or depth > 5: return ("L", idx)
    best = None
    for axis in (0, 1):
        iv = [(bbs[i][axis], bbs[i][axis] + bbs[i][axis + 2]) for i in idx]
        for size, pos in sorted(CP._gaps(iv, G), reverse=True):
            Aa = [i for i in idx if bbs[i][axis] + bbs[i][axis + 2] / 2 < pos]; Bb = [i for i in idx if i not in Aa]
            ext = lambda g, ax: max(bbs[i][ax] + bbs[i][ax + 2] for i in g) - min(bbs[i][ax] for i in g)
            if Aa and Bb and all(ext(g, 0) >= mw and ext(g, 1) >= mh for g in (Aa, Bb)):
                sc = size * (1.15 if axis == 1 else 1.0)
                if best is None or sc > best[0]: best = (sc, axis, Aa, Bb)
                break
    if best is None: return ("L", idx)
    _, axis, Aa, Bb = best
    a = tree(Aa, bbs, G, mw, mh, depth + 1); b = tree(Bb, bbs, G, mw, mh, depth + 1)
    tag = "H" if axis == 0 else "V"          # H = side by side (cut on x), V = stacked (cut on y)
    kids = (a[1] if a[0] == tag else [a]) + (b[1] if b[0] == tag else [b])
    return (tag, kids)

def describe(obj):
    f = O._frag(obj); els = list(f); bbs = [O._xfrm(e) for e in els]
    SW, SH = obj["src_slide"]; k = 13.333 * EMU / SW; s = EMU / k
    keep = [i for i, b in enumerate(bbs) if b and b[2] > 0 and b[3] > 0 and not (b[1] + b[3] < 0.15 * SH and b[3] < 0.06 * SH)]
    if len(keep) < 2: return None
    X0 = min(bbs[i][0] for i in keep); Y0 = min(bbs[i][1] for i in keep)
    X1 = max(bbs[i][0] + bbs[i][2] for i in keep); Y1 = max(bbs[i][1] + bbs[i][3] for i in keep)
    big = [i for i in keep if bbs[i][2] * bbs[i][3] > 0.4 * (X1 - X0) * (Y1 - Y0)]
    rest = [i for i in keep if i not in big] or keep
    T = tree(rest, bbs, 0.12 * s, 1.0 * s, 0.6 * s)
    leaves = []
    def walk(t):
        if t[0] == "L":
            g = t[1]; x0 = min(bbs[i][0] for i in g); y0 = min(bbs[i][1] for i in g)
            x1 = max(bbs[i][0] + bbs[i][2] for i in g); y1 = max(bbs[i][1] + bbs[i][3] for i in g)
            typ = _leaf_type([els[i] for i in g])
            leaves.append(dict(type=typ, box=[round((x0 - X0) / (X1 - X0), 3), round((y0 - Y0) / (Y1 - Y0), 3), round((x1 - x0) / (X1 - X0), 3), round((y1 - y0) / (Y1 - Y0), 3)]))
            return typ[0].upper() if typ != "connector" else ">"
        return t[0] + "(" + ",".join(walk(c) for c in t[1]) + ")"
    sig = walk(T)
    xml = obj["xml"]; txt = " ".join(O._text(e) for e in els)
    chips = sum(1 for e in f.iter(P + "sp") if O._xfrm(e) and O._xfrm(e)[2] < 0.45 * EMU / k * 1 and O._xfrm(e)[3] < 0.45 * EMU / k and re.fullmatch(r"\s*[0-9A-Ea-e]\s*", O._text(e) or "x"))
    connectors = sum(1 for l in leaves if l["type"] == "connector") + len(re.findall(r'prst="(chevron|rightArrow|homePlate)"', xml)) // 3
    exhibits = [l for l in leaves if l["type"] in ("chart", "table", "picture", "diagram")]
    return dict(sig=sig, n_panels=len([l for l in leaves if l["type"] != "connector"]), n_exhibits=len(exhibits), leaves=leaves, chips=chips,
                connectors=connectors, insight=any(l["type"] == "insight" for l in leaves) or bool(re.search(r"\binsights?\b|key insights|comment", txt, re.I)),
                recommend=bool(re.search(r"recommend|therefore|so what|implication", txt, re.I)), cut_dir=sig[0] if sig[0] in "HV" else "-")

if __name__ == "__main__":
    store = sys.argv[1]; decks = sys.argv[2:]; out = []
    for d in decks:
        for l in gzip.open(os.path.join(store, f"{d}.jsonl.gz"), "rt", encoding="utf-8"):
            o = json.loads(l)
            if o.get("part_of") or o.get("vector_of"): continue
            r = describe(o)
            if r: out.append(dict(id=o["id"], deck=d, slide=o["slide"], pattern=o.get("pattern"), **r))
    json.dump(out, open("/home/claude/study/composition.json", "w"), indent=0)
    print(len(out))
