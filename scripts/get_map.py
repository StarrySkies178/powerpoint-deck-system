#!/usr/bin/env python3
"""Fetch map boundaries into Objects/maps/ so decks can draw any country, region, city or district as editable shapes.

Run from the Powerpoint folder (needs internet; Python standard library only):
  python3 scripts/get_map.py world               # all countries                 -> Objects/maps/world.json
  python3 scripts/get_map.py cities              # ~7,300 towns and cities        -> Objects/maps/cities.json
  python3 scripts/get_map.py adm1 all            # states/provinces, any country  -> Objects/maps/adm1/<ISO3>.json
  python3 scripts/get_map.py gb GBR 2 3          # counties/districts (non-China) -> Objects/maps/gb/ADM2/GBR.json …
  python3 scripts/get_map.py cn 100000           # China provinces                -> Objects/maps/cn/100000.json
  python3 scripts/get_map.py cn 广东 深圳 上海     # a province's cities / a city's districts (name or adcode)
  python3 scripts/get_map.py cn all-cities       # every province's cities (34 files)
  python3 scripts/get_map.py list                # what is already here

Sources: Natural Earth (public domain) for world, adm1 and cities; geoBoundaries gbOpen (CC BY 4.0) for gb/;
DataV.GeoAtlas (Aliyun) for China (cn/, follows China's official administrative boundaries, Chinese names + adcodes;
English names added where an open dataset matches). Put the source in the slide's source line, e.g. "Map: DataV.GeoAtlas".
A map published in mainland China must follow the official standard map (审图号 rules): check before a public release.
Each feature: name, name_zh / name_en where known, codes, parent, bbox, centroid, area and polys (list of polygons, each a
list of [lon, lat] rings, outer ring first).
"""
import json, math, os, sys, urllib.request

ROOT = os.getcwd(); OUT = os.path.join(ROOT, "Objects", "maps"); CACHE = os.path.join(os.path.expanduser("~"), ".cache", "deck-maps")
NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
GB = "https://github.com/wmgeolab/geoBoundaries/raw/main/releaseData/gbOpen/{iso}/ADM{lvl}/geoBoundaries-{iso}-ADM{lvl}_simplified.geojson"
CN = "https://geo.datav.aliyun.com/areas_v3/bound/{code}_full.json"
TOL = {"world": 0.04, "adm1": 0.015, 2: 0.004, 3: 0.0015, "province": 0.02, "city": 0.006, "district": 0.0015}

def fetch(url, name, cache=True):
    os.makedirs(CACHE, exist_ok=True); p = os.path.join(CACHE, name)
    if not (cache and os.path.exists(p)):
        print("downloading", url, flush=True)
        req = urllib.request.Request(url, headers={"User-Agent": "deck-system-maps"})
        with urllib.request.urlopen(req, timeout=300) as r, open(p + ".part", "wb") as f:
            while True:
                b = r.read(1 << 20)
                if not b: break
                f.write(b)
        os.replace(p + ".part", p)
    return json.load(open(p, encoding="utf-8"))

def _dp(pts, tol):
    if len(pts) < 3: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True; stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop(); (x1, y1), (x2, y2) = pts[a][:2], pts[b][:2]; dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-12
        best, bi = -1, -1
        for i in range(a + 1, b):
            x, y = pts[i][:2]; d = abs(dy * (x - x1) - dx * (y - y1)) / L
            if d > best: best, bi = d, i
        if best > tol: keep[bi] = True; stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]

def _dp_ring(ring, tol):   # closed ring: split at the point farthest from the start, simplify both halves
    if len(ring) < 4: return ring
    x0, y0 = ring[0][:2]; m = max(range(len(ring)), key=lambda i: (ring[i][0] - x0) ** 2 + (ring[i][1] - y0) ** 2)
    if m == 0: return ring
    return _dp(ring[:m + 1], tol) + _dp(ring[m:], tol)[1:]

def simplify(geom, tol):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]] if geom["type"] == "Polygon" else []
    out = []
    for poly in polys:
        rings = []
        for k, ring in enumerate(poly):
            r = [[round(x, 4), round(y, 4)] for x, y in (p[:2] for p in _dp_ring(ring, tol))]
            if len(r) >= 4: rings.append(r)
            elif k == 0: break
        if rings: out.append(rings)
    return out

def area_centroid(polys):
    A = cx = cy = 0.0
    for poly in polys:
        ring = poly[0]
        for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
            c = x1 * y2 - x2 * y1; A += c; cx += (x1 + x2) * c; cy += (y1 + y2) * c
    if abs(A) < 1e-12:
        xs = [p[0] for poly in polys for p in poly[0]]; ys = [p[1] for poly in polys for p in poly[0]]
        return 0.0, [sum(xs) / len(xs), sum(ys) / len(ys)]
    return abs(A) / 2, [round(cx / (3 * A), 4), round(cy / (3 * A), 4)]

def bbox(polys):
    xs = [p[0] for poly in polys for p in poly[0]]; ys = [p[1] for poly in polys for p in poly[0]]
    return [min(xs), min(ys), max(xs), max(ys)]

def inside(pt, polys):
    x, y = pt; hit = False
    for poly in polys:
        for ring in poly:
            for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
                if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: hit = not hit
    return hit

def feature(name, polys, **props):
    a, c = area_centroid(polys)
    return {"name": name, **{k: v for k, v in props.items() if v not in (None, "")}, "bbox": bbox(polys), "centroid": c, "area": round(a, 5), "polys": polys}

def save(rel, feats, source, **meta):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    json.dump({"source": source, **meta, "features": feats}, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{rel}: {len(feats)} features, {os.path.getsize(p) // 1024} KB")

def load(rel):
    p = os.path.join(OUT, rel)
    return json.load(open(p, encoding="utf-8"))["features"] if os.path.exists(p) else []

def world():
    d = fetch(NE + "ne_50m_admin_0_countries.geojson", "ne50_countries.json"); feats = []
    for f in d["features"]:
        P = f["properties"]; polys = simplify(f["geometry"], TOL["world"])
        if polys: feats.append(feature(P.get("NAME_EN") or P["NAME"], polys, name_zh=P.get("NAME_ZH"), iso3=P.get("ADM0_A3"), continent=P.get("CONTINENT")))
    save("world.json", feats, "Natural Earth 1:50m (public domain)")

def cities():
    d = fetch(NE + "ne_10m_populated_places_simple.geojson", "ne10_places.json"); feats = []
    for f in d["features"]:
        P = f["properties"]
        feats.append({"name": P.get("name"), "name_zh": P.get("name_zh") or None, "iso3": P.get("adm0_a3"), "adm1": P.get("adm1name"),
                      "lon": round(P["longitude"], 4), "lat": round(P["latitude"], 4), "pop": P.get("pop_max"),
                      "capital": bool(P.get("adm0cap")), "rank": P.get("scalerank")})
    save("cities.json", feats, "Natural Earth 1:10m populated places (public domain)")

def adm1(isos):
    d = fetch(NE + "ne_10m_admin_1_states_provinces.geojson", "ne10_admin1.json"); by = {}
    for f in d["features"]:
        P = f["properties"]; iso = P.get("adm0_a3")
        if isos != ["ALL"] and iso not in isos: continue
        polys = simplify(f["geometry"], TOL["adm1"])
        if polys: by.setdefault(iso, []).append(feature(P.get("name_en") or P.get("name"), polys, name_zh=P.get("name_zh"), iso3=iso, type=P.get("type_en")))
    for iso, feats in by.items(): save(f"adm1/{iso}.json", feats, "Natural Earth 1:10m admin-1 (public domain)")

def _parent_of(c, ups):
    cand = [u for u in ups if u["bbox"][0] <= c[0] <= u["bbox"][2] and u["bbox"][1] <= c[1] <= u["bbox"][3]]
    return next((u for u in cand if inside(c, u["polys"])), cand[0] if cand else None)

def gb(iso, lvl):
    if lvl < 2: raise SystemExit("level 1 comes from Natural Earth: python3 scripts/get_map.py adm1 " + iso)
    d = fetch(GB.format(iso=iso, lvl=lvl), f"gb_{iso}_ADM{lvl}.json")
    ups = load(f"adm1/{iso}.json") if lvl == 2 else load(f"gb/ADM{lvl - 1}/{iso}.json")
    feats = []
    for f in d["features"]:
        polys = simplify(f["geometry"], TOL.get(lvl, 0.0015))
        if not polys: continue
        ft = feature(f["properties"].get("shapeName"), polys, iso3=iso, id=f["properties"].get("shapeID"))
        u = _parent_of(ft["centroid"], ups) if ups else None
        if u: ft["parent"] = u["name"]; ft["grandparent"] = u.get("parent")
        feats.append(ft)
    save(f"gb/ADM{lvl}/{iso}.json", feats, "geoBoundaries gbOpen (CC BY 4.0)")

# ---------------------------------------------------------------- China (DataV.GeoAtlas)
def _cn_index():
    p = os.path.join(OUT, "cn", "index.json")
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {}

def _en_names(feats, level):
    """Best-effort English names: provinces from Natural Earth (matched on Chinese name), cities from Natural Earth places,
    districts from geoBoundaries CHN ADM3 (matched by containment)."""
    if level == "province":
        ne = {}
        for f in load("adm1/CHN.json") + [x for x in load("world.json") if x.get("iso3") in ("TWN", "HKG", "MAC")]:
            for k in (f.get("name_zh") or "",): ne[k.rstrip("省市")] = f["name"]
        for f in feats:
            z = f["name"]
            for suf in ("壮族自治区", "回族自治区", "维吾尔自治区", "自治区", "特别行政区", "省", "市"): z = z.replace(suf, "")
            f["name_en"] = ne.get(z) or ne.get(f["name"].rstrip("省市")) or {"台湾": "Taiwan", "澳门": "Macau", "香港": "Hong Kong"}.get(z)
            if not f["name"]: f["name"] = f["name_zh"] = "南海诸岛"; f["name_en"] = "South China Sea islands"; f["inset"] = True
    elif level == "city":
        pl = [c for c in load("cities.json") if c.get("iso3") in ("CHN", "HKG", "MAC", "TWN")]
        for f in feats:
            z = f["name"].replace("市", "").replace("地区", "").replace("自治州", "")
            hit = next((c for c in pl if c.get("name_zh") and c["name_zh"].replace("市", "") == z), None)
            if not hit:
                inn = [c for c in pl if inside([c["lon"], c["lat"]], f["polys"])]
                hit = max(inn, key=lambda c: c.get("pop") or 0) if inn else None
            if hit: f["name_en"] = hit["name"]
    elif level == "district":
        g = load("gb/ADM3/CHN.json")
        for f in feats:   # accept only a two-way match (each centroid inside the other), so outdated or merged districts get no wrong name
            u = _parent_of(f["centroid"], g) if g else None
            if u and inside(u["centroid"], f["polys"]) and 0.67 < (u["area"] or 1e-9) / max(f["area"], 1e-9) < 1.5:   # same place, same size
                en = u["name"].replace(" district", " District")
                if f["name"].endswith("区"): en = en.replace(" County", " District").replace(" City", " District")
                f["name_en"] = en
            else: f.pop("name_en", None)

def cn(code_or_name):
    idx = _cn_index(); code = str(code_or_name)
    if not code.isdigit():
        hits = [k for k, v in idx.items() if v["name"].startswith(code) or (v.get("name_en") or "").lower().startswith(code.lower())]
        if not hits: raise SystemExit(f"unknown area '{code}': fetch its parent first (python3 scripts/get_map.py cn 100000, then the province)")
        code = min(hits, key=lambda k: (idx[k]["level"] != "city", idx[k]["level"] != "province", len(idx[k]["name"])))
    try: d = fetch(CN.format(code=code), f"cn_{code}.json")
    except Exception as e:
        print(f"cn {code} ({idx.get(code, {}).get('name', '?')}): no finer map available ({e})"); return
    feats = []; lvl = None
    for f in d["features"]:
        P = f["properties"]
        if not f.get("geometry"): continue
        lvl = P.get("level") or lvl
        polys = simplify(f["geometry"], TOL.get(P.get("level"), 0.002))
        if not polys: continue
        feats.append(feature(P["name"], polys, name_zh=P["name"], adcode=P.get("adcode"), level=P.get("level"), parent=(P.get("parent") or {}).get("adcode"),
                             has_children=bool(P.get("childrenNum"))))
    _en_names(feats, lvl)
    save(f"cn/{code}.json", feats, "DataV.GeoAtlas (Aliyun), China official administrative boundaries", adcode=int(code))
    for f in feats:
        idx[str(f["adcode"])] = {k: f.get(k) for k in ("name", "name_en", "level", "parent", "centroid", "bbox")}
    json.dump(idx, open(os.path.join(OUT, "cn", "index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

def listing():
    for r, _, fs in sorted(os.walk(OUT)):
        n = len(fs); s = sum(os.path.getsize(os.path.join(r, f)) for f in fs) // 1024
        print(os.path.relpath(r, OUT), n, "files", s, "KB")

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(1)
    if a[0] == "world": world()
    elif a[0] == "cities": cities()
    elif a[0] == "adm1": adm1([x.upper() for x in a[1:]] or ["ALL"])
    elif a[0] == "gb": [gb(a[1].upper(), int(l)) for l in sorted(a[2:])]
    elif a[0] == "cn":
        for x in a[1:]:
            if x == "all-cities":
                if not os.path.exists(os.path.join(OUT, "cn", "100000.json")): cn("100000")
                for k, v in list(_cn_index().items()):
                    if v["level"] == "province": cn(k)
            else: cn(x)
    elif a[0] == "list": listing()
    else: print(__doc__); sys.exit(1)
