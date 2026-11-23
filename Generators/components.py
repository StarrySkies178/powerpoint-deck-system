"""Split stored slide drawings into their component diagrams (panels, tables, maps, process rows, ...).

Each part is saved next to its slide in the same deck file, id '<deck>-<slide>p<k>', so every objstore
operation (place, recolour, set_texts, extend, combine) works on a single diagram as well as on the whole slide.
"""
import copy, gzip, json, os, re, sys
from lxml import etree
sys.path.insert(0, os.path.dirname(__file__))
import objstore as O
A, P, NS = O.A, O.P, O.NS
EMU = 914400

def _kind(el): return etree.QName(el).localname
def _prsts(el): return [g.get("prst") for g in el.iter(A + "prstGeom")]
def _has(el, tag): return el.find(".//" + tag, NS) is not None

def classify(els, bbs, W, H):
    pr = [p for e in els for p in _prsts(e)]
    n_pic = sum(1 for e in els for _ in e.iter(P + "pic")); n_free = sum(1 for e in els for _ in e.iter(A + "custGeom"))
    txt = sum(1 for e in els for t in e.iter(A + "t") if (t.text or "").strip())
    cnt = lambda *k: sum(pr.count(x) for x in k)
    if any(_has(e, "a:tbl") for e in els):
        return "harvey-table" if cnt("pie", "chord", "blockArc", "arc", "donut") >= 4 else "table"
    if cnt("pie", "chord", "blockArc") >= 4: return "harvey-balls"
    if cnt("chevron", "homePlate") >= 2: return "process-chevrons"
    if cnt("rightArrow", "leftArrow", "downArrow", "upArrow", "stripedRightArrow") >= 3: return "arrows-flow"
    if n_free >= 15: return "map-or-freeform"
    if cnt("circularArrow", "blockArc") >= 2: return "cycle"
    rects = [b for e, b in zip(els, bbs) if _prsts(e)[:1] == ["rect"] and b[3] > b[2] * 0.8]
    bottoms = {}
    for b in rects: bottoms[round((b[1] + b[3]) / 40000)] = bottoms.get(round((b[1] + b[3]) / 40000), 0) + 1
    if bottoms and max(bottoms.values()) >= 4: return "chart-drawn (bars)"
    if cnt("ellipse") >= 5: return "bubbles-or-dots"
    if n_pic >= 2 and txt >= 3:
        big = [b for e, b in zip(els, bbs) if _kind(e) == "pic" and b[2] * b[3] > 0.12 * W * H]
        return "picture" if big else "cards-with-pictures"
    if n_pic == 1 and txt <= 2:
        return "picture (chart or image)"
    if pr and all(p in ("rect", "roundRect", "line", "straightConnector1") or p is None for p in pr) and txt >= 2:
        return "boxes-and-text"
    if not pr and txt: return "text-block"
    return "diagram"

def _gaps(iv, G):
    """Empty gutters between merged intervals: [(size, cut_position)]."""
    iv = sorted(iv); out = []; cur = list(iv[0])
    for a, b in iv[1:]:
        if a > cur[1]:
            if a - cur[1] >= G: out.append((a - cur[1], (a + cur[1]) / 2))
            cur = [a, b]
        else: cur[1] = max(cur[1], b)
    return out

def _xycut(idx, bbs, G, min_w, min_h, depth=0):
    """Recursive whitespace cut: split at the widest gutter whose both sides are still panel-sized."""
    if len(idx) < 2 or depth > 6: return [idx]
    best = None
    for axis in (0, 1):
        iv = [(bbs[i][axis], bbs[i][axis] + bbs[i][axis + 2]) for i in idx]
        for size, pos in sorted(_gaps(iv, G), reverse=True):
            A_ = [i for i in idx if bbs[i][axis] + bbs[i][axis + 2] / 2 < pos]; B_ = [i for i in idx if i not in A_]
            def ext(g, ax): return max(bbs[i][ax] + bbs[i][ax + 2] for i in g) - min(bbs[i][ax] for i in g)
            if A_ and B_ and all(ext(g, 0) >= min_w and ext(g, 1) >= min_h for g in (A_, B_)):
                score = size * (1.15 if axis == 1 else 1.0)   # slight preference for horizontal bands
                if best is None or score > best[0]: best = (score, A_, B_)
                break
    if best is None: return [idx]
    return _xycut(best[1], bbs, G, min_w, min_h, depth + 1) + _xycut(best[2], bbs, G, min_w, min_h, depth + 1)

def split(obj, gutter_in=0.14, min_w_in=1.6, min_h_in=0.9):
    f = O._frag(obj); els = list(f); bbs = [O._xfrm(e) for e in els]
    SW, SH = obj["src_slide"]; k = 13.333 * EMU / SW          # measure in house-slide inches whatever the source size
    keep = [i for i, b in enumerate(bbs) if b and b[2] > 0 and b[3] > 0]
    # top band crumbs (trackers, logos, page marks) are not diagram parts
    def crumb(i):
        x, y, w, h = bbs[i]
        return y + h < 0.15 * SH and (not _prsts(els[i]) or _kind(els[i]) == "pic" or h < 0.06 * SH)
    keep = [i for i in keep if not crumb(i)]
    # long thin divider lines (vertical between panels, horizontal rules) separate panels: they must not block a cut
    def divider(i):
        x, y, w, h = bbs[i]
        return (w < 0.03 * EMU / k and h > 0.4 * SH) or (h < 0.03 * EMU / k and w > 0.6 * SW)
    keep = [i for i in keep if not divider(i)]
    if len(keep) < 3: return []
    X0 = min(bbs[i][0] for i in keep); Y0 = min(bbs[i][1] for i in keep)
    X1 = max(bbs[i][0] + bbs[i][2] for i in keep); Y1 = max(bbs[i][1] + bbs[i][3] for i in keep)
    area = (X1 - X0) * (Y1 - Y0)
    big = [i for i in keep if bbs[i][2] * bbs[i][3] > 0.4 * area]
    rest = [i for i in keep if i not in big]
    if len(rest) < 3: return []
    s = EMU / k
    leaves = _xycut(rest, bbs, gutter_in * s, min_w_in * s, min_h_in * s)
    if len(leaves) < 2:
        # second try: text-only boxes and label tables often straddle the gutter (axis-label tables, long captions);
        # cut on the drawn elements only, then give each text element to the panel it overlaps most
        def texty(i):
            e = els[i]
            if _kind(e) == "graphicFrame": return e.find(".//a:tbl", NS) is not None and bbs[i][3] < 0.8 * s
            return _kind(e) == "sp" and not O._filled(e)
        drawn_ix = [i for i in rest if not texty(i)]
        if len(drawn_ix) >= 3:
            sh = 0.05 * s                                                            # tolerate hairline overlaps between bands
            tb = list(bbs)
            for i in drawn_ix: x, y, w, h = bbs[i]; tb[i] = (x + sh, y + sh, max(1, w - 2 * sh), max(1, h - 2 * sh)) if w > 3 * sh and h > 3 * sh else bbs[i]
            lv = _xycut(drawn_ix, tb, gutter_in * s, min_w_in * s, min_h_in * s)
            if len(lv) >= 2:
                box = lambda g: (min(bbs[i][0] for i in g), min(bbs[i][1] for i in g), max(bbs[i][0] + bbs[i][2] for i in g), max(bbs[i][1] + bbs[i][3] for i in g))
                lb = [box(g) for g in lv]
                for i in rest:
                    if i in drawn_ix: continue
                    x, y, w, h = bbs[i]
                    ov = [max(0, min(x + w, b[2]) - max(x, b[0])) * max(0, min(y + h, b[3]) - max(y, b[1])) for b in lb]
                    j = max(range(len(lb)), key=lambda q: ov[q])
                    if ov[j] > 0.5 * w * h: lv[j].append(i)                         # straddlers that fit no panel are left out
                leaves = lv
    if len(leaves) < 2: return []                                                  # the slide is one diagram already
    for b in big:                                                                  # a big box that wraps exactly one leaf is its frame
        bx, by, bw, bh = bbs[b]
        inside = [g for g in leaves if all(bx - s * 0.1 <= bbs[i][0] and bbs[i][0] + bbs[i][2] <= bx + bw + s * 0.1 and by - s * 0.1 <= bbs[i][1] and bbs[i][1] + bbs[i][3] <= by + bh + s * 0.1 for i in g)]
        if len(inside) == 1: inside[0].append(b)
    parts = []
    for g in leaves:
        sel = [els[i] for i in sorted(g)]
        n_sh = sum(1 for e in sel for _ in e.iter(P + "sp")) + sum(1 for e in sel for _ in e.iter(P + "pic")) + sum(1 for e in sel if _kind(e) == "graphicFrame")
        drawn = sum(1 for e in sel for g_ in e.iter(A + "prstGeom") if g_.get("prst") not in (None, "rect")) + sum(1 for e in sel for _ in e.iter(A + "custGeom")) \
            + sum(1 for e in sel for _ in e.iter(P + "pic")) + sum(1 for e in sel if _kind(e) == "graphicFrame") \
            + sum(1 for e in sel for sp in e.iter(P + "sp") if sp.find(".//a:solidFill", NS) is not None and sp.find("p:spPr/a:noFill", NS) is None)
        tchars = sum(len((t.text or "").strip()) for e in sel for t in e.iter(A + "t"))
        has_tbl_pic = any(_kind(e) in ("graphicFrame", "pic") for e in sel) or any(e.find(".//p:pic", NS) is not None for e in sel)
        if n_sh < 2 or (drawn < 3 and not has_tbl_pic): continue                   # plain text or a lone bar: not a diagram
        if tchars < 8 and not has_tbl_pic: continue                                # decoration without content
        gx0 = min(bbs[i][0] for i in g); gy0 = min(bbs[i][1] for i in g)
        gx1 = max(bbs[i][0] + bbs[i][2] for i in g); gy1 = max(bbs[i][1] + bbs[i][3] for i in g)
        fr = etree.Element(P + "spTree", nsmap={"a": NS["a"], "p": NS["p"], "r": NS["r"]})
        for e in sel: fr.append(copy.deepcopy(e))
        xml = etree.tostring(fr, encoding="unicode")
        kind = classify(sel, [bbs[i] for i in sorted(g)], SW, SH)
        media = sorted(set(re.findall(r'MEDIA:([0-9a-f]+\.\w+)', xml)))
        p = dict(obj); p.update(id=f"{obj['id']}p{len(parts) + 1}", part_of=obj["id"], part=len(parts) + 1, kind=kind,
                                bbox=[gx0, gy0, gx1 - gx0, gy1 - gy0], n_shapes=n_sh, xml=xml, media=media,
                                charts={k: v for k, v in (obj.get("charts") or {}).items() if "CHART:" + k in xml},
                                text=" | ".join(filter(None, (O._text(e)[:40] for e in sel)))[:200], slots=0)
        parts.append(p)
    return parts if len(parts) >= 2 else []

def split_deck(store_dir, deck):
    fp = os.path.join(store_dir, f"{deck}.jsonl.gz")
    objs = [json.loads(l) for l in gzip.open(fp, "rt", encoding="utf-8")]
    objs = [o for o in objs if "part_of" not in o]                                # idempotent
    allp = []
    for o in objs:
        if not o.get("vector_of"): allp += split(o)                               # vectorised objects are already single drawings
    with gzip.open(fp, "wt", encoding="utf-8") as f:
        for o in objs + allp: f.write(json.dumps(o, ensure_ascii=False) + "\n")
    O._CACHE.clear()
    return allp

if __name__ == "__main__":
    store = sys.argv[1]; decks = sys.argv[2:]
    idx_p = os.path.join(store, "index.json"); idx = json.load(open(idx_p))
    idx = [o for o in idx if not ("part_of" in o and o["deck"] in decks)]
    import collections; tot = collections.Counter()
    for d in decks:
        ps = split_deck(store, d)
        for p in ps:
            idx.append({k: p.get(k) for k in ("id", "deck", "slide", "title", "n_shapes", "text", "roles_used", "complete", "bbox", "src_slide", "part_of", "part", "kind")} |
                       {"pattern": p["kind"], "note": f"part {p['part']} of slide {p['slide']} (auto-split; kind guessed)", "slots": 0, "charts": 0})
            tot[p["kind"]] += 1
        print(d, len(ps))
    json.dump(idx, open(idx_p, "w"), ensure_ascii=False)
    print(dict(tot.most_common()))
