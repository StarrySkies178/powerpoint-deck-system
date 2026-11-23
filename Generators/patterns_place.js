// patterns_place.js — decompose a PLACE the way the case decks do (learned from the 2019–20 case decks, 2026-11-23):
//   country → regions → cities → districts → sites → building → floors → zones.
// Every region is its own editable freeform shape named after the place (Selection Pane), so a map can be recoloured,
// regrouped or relabelled in PowerPoint. Map data lives in Objects/maps/ (fetch more with scripts/get_map.py).
//
//   mapRegions      choropleth / highlight map of any area, with labels, sized dots, pins, stars and a legend
//   regionMultiples the same country split into regional small multiples (North / East / … panels)
//   geoZoom         zoom chain: country → province → city (→ sites) with zoom lines between the levels
//   siteCallouts    an area's map with numbered site pins and callout cards on leader lines
//   buildingExplode exploded isometric building: floors stacked apart, zones on each floor, detail cards on leaders
//   floorPlan       top-down zone plan: numbered zones, entrance, customer path, legend
//   geo / project / pointIn — data helpers for custom maps
//
// Rules (same as all generators): grey does the work, the place the story is about is in the main colour, one accent;
// labels only where they help; source line names the map source (e.g. "Map: DataV.GeoAtlas" or "Map: Natural Earth").
const fs = require("fs"), path = require("path");
const G = require("./patterns.js");
const { C, txt, BODY } = G;
const MAPS = process.env.DECK_MAPS || path.join(__dirname, "..", "Objects", "maps");

// ------------------------------------------------------------------ data
const _cache = {};
function readMap(rel) {
  const p = path.join(MAPS, rel);
  if (!_cache[p]) {
    if (!fs.existsSync(p)) throw new Error(`map data missing: Objects/maps/${rel}. Fetch it first, e.g. python3 scripts/get_map.py ${rel.startsWith("cn/") ? "cn <name or adcode>" : rel.startsWith("adm1/") ? "adm1 " + path.basename(rel, ".json") : rel.startsWith("gb/") ? "gb <ISO3> 2" : path.basename(rel, ".json")}`);
    _cache[p] = JSON.parse(fs.readFileSync(p, "utf8"));
  }
  return _cache[p];
}
const norm = (s) => String(s || "").toLowerCase().replace(/(特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|自治州|地区|新区|省|市|区|县| district| province| city| county| new area|\s|['’-])/g, "");
function matches(f, key) {
  if (key == null) return false;
  if (typeof key === "number" || /^\d+$/.test(String(key))) return String(f.adcode) === String(key);
  const k = norm(key);
  return [f.name, f.name_en, f.name_zh, f.name_short, f.iso3].some((v) => v && norm(v) === k) || (k === "china" && f.iso3 === "CHN") || (k === "uk" && f.iso3 === "GBR");
}
// ref: "world" | "adm1:CHN" | "gb2:GBR" (gb3:…) | "cn" (provinces) | "cn:广东" / "cn:Guangdong" / "cn:440300" (children of that area)
function geo(ref, o = {}) {
  if (ref && ref.features) return ref;
  let rel, src;
  const r = String(ref);
  if (r === "world") rel = "world.json";
  else if (/^adm1[:/]/i.test(r)) rel = `adm1/${r.split(/[:/]/)[1].toUpperCase()}.json`;
  else if (/^gb[23][:/]/i.test(r)) rel = `gb/ADM${r[2]}/${r.split(/[:/]/)[1].toUpperCase()}.json`;
  else if (r === "cn" || r === "cn:中国" || r === "cn:China") rel = "cn/100000.json";
  else if (/^cn[:/]/.test(r)) {
    const key = r.slice(3), idx = readMap("cn/index.json");
    let code = /^\d+$/.test(key) ? key : null;
    if (!code) {
      const hits = Object.entries(idx).filter(([c, v]) => matches({ ...v, adcode: c }, key));
      hits.sort((a, b) => ({ city: 0, province: 1, district: 2 }[a[1].level] ?? 3) - ({ city: 0, province: 1, district: 2 }[b[1].level] ?? 3));
      if (!hits.length) throw new Error(`unknown Chinese area '${key}': run python3 scripts/get_map.py cn <its province>, then cn ${key}`);
      code = hits[0][0];
    }
    rel = `cn/${code}.json`;
  } else throw new Error(`unknown map reference '${ref}'`);
  const d = readMap(rel);
  let features = d.features.filter((f) => f.polys && f.polys.length && !(o.insets === false && f.inset));
  if (o.parent) features = features.filter((f) => matches({ name: f.parent }, o.parent) || matches({ name: f.grandparent }, o.parent));
  if (o.only) features = features.filter((f) => o.only.some((k) => matches(f, k)));
  if (o.exclude) features = features.filter((f) => !o.exclude.some((k) => matches(f, k)));
  return { features, source: d.source, rel };
}
const label = (f, lang = "en") => (lang === "zh" ? f.name_zh || f.name : f.name_en || f.name).replace(/ (District|Province|City)$/, "");
function pointIn(lon, lat, polys) {
  let hit = false;
  for (const poly of polys) for (const ring of poly) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = ring[i], [x2, y2] = ring[j];
    if ((y1 > lat) !== (y2 > lat) && lon < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1) hit = !hit;
  }
  return hit;
}
function cityLL(name, iso) {   // lon/lat of a named city (cities.json, then Chinese area centroids)
  const cs = readMap("cities.json").features, k = norm(name);
  const hits = cs.filter((c) => (norm(c.name) === k || (c.name_zh && norm(c.name_zh) === k)) && (!iso || c.iso3 === iso));
  if (hits.length) { const c = hits.sort((a, b) => (b.pop || 0) - (a.pop || 0))[0]; return [c.lon, c.lat]; }
  try { const idx = readMap("cn/index.json"); const e = Object.values(idx).find((v) => matches(v, name)); if (e) return e.centroid; } catch (e) { /* no China index */ }
  throw new Error(`no location for '${name}': give lon/lat`);
}

// ------------------------------------------------------------------ projection
const RAD = Math.PI / 180;
function project(features, box, o = {}) {
  const bb = o.bbox || features.reduce((a, f) => [Math.min(a[0], f.bbox[0]), Math.min(a[1], f.bbox[1]), Math.max(a[2], f.bbox[2]), Math.max(a[3], f.bbox[3])], [180, 90, -180, -90]);
  const span = Math.max(bb[2] - bb[0], bb[3] - bb[1]), lon0 = (bb[0] + bb[2]) / 2, lat0 = (bb[1] + bb[3]) / 2;
  const kind = o.projection || (span > 120 ? "naturalEarth" : span > 12 ? "albers" : "equirect");
  let raw;
  if (kind === "naturalEarth") raw = (lon, lat) => {
    const l = lat * RAD, l2 = l * l, l4 = l2 * l2;
    return [lon * RAD * (0.8707 - 0.131979 * l2 + l4 * (-0.013791 + l4 * (0.003971 * l2 - 0.001529 * l4))), l * (1.007226 + l2 * (0.015085 + l4 * (-0.044475 + 0.028874 * l2 - 0.005916 * l4)))];
  };
  else if (kind === "albers") {
    const p1 = (bb[1] + (bb[3] - bb[1]) / 6) * RAD, p2 = (bb[3] - (bb[3] - bb[1]) / 6) * RAD, p0 = lat0 * RAD;
    const n = (Math.sin(p1) + Math.sin(p2)) / 2, Cc = Math.cos(p1) ** 2 + 2 * n * Math.sin(p1), r0 = Math.sqrt(Cc - 2 * n * Math.sin(p0)) / n;
    raw = (lon, lat) => { const r = Math.sqrt(Math.max(0, Cc - 2 * n * Math.sin(lat * RAD))) / n, t = n * (lon - lon0) * RAD; return [r * Math.sin(t), r0 - r * Math.cos(t)]; };
  } else { const k = Math.cos(lat0 * RAD); raw = (lon, lat) => [(lon - lon0) * RAD * k, lat * RAD]; }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const llArea = (r) => Math.abs(r.reduce((a, q, i) => { const z = r[(i + 1) % r.length]; return a + q[0] * z[1] - z[0] * q[1]; }, 0)) / 2;
  const rb = (r) => [Math.min(...r.map((q) => q[0])), Math.min(...r.map((q) => q[1])), Math.max(...r.map((q) => q[0])), Math.max(...r.map((q) => q[1]))];
  if (o.bbox && !features.length) for (let i = 0; i <= 20; i++) for (const [lo, la] of [[bb[0] + (bb[2] - bb[0]) * i / 20, bb[1]], [bb[0] + (bb[2] - bb[0]) * i / 20, bb[3]], [bb[0], bb[1] + (bb[3] - bb[1]) * i / 20], [bb[2], bb[1] + (bb[3] - bb[1]) * i / 20]]) {
    const [X, Y] = raw(lo, la); x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y);
  }
  for (const f of features) {
    const areas = f.polys.map((q) => llArea(q[0])), big = Math.max(...areas), mb = rb(f.polys[areas.indexOf(big)][0]);
    const diag = Math.hypot(mb[2] - mb[0], mb[3] - mb[1]);
    for (const [pi, poly] of f.polys.entries()) {
      if (!o.allParts && areas[pi] < big) {   // small or remote parts (far-off islands) don't set the frame
        const b = rb(poly[0]), dx = Math.max(mb[0] - b[2], b[0] - mb[2], 0), dy = Math.max(mb[1] - b[3], b[1] - mb[3], 0);
        if (areas[pi] < 0.05 * big || (areas[pi] < 0.25 * big && Math.hypot(dx, dy) > 0.5 * diag)) continue;
      }
      for (const [lo, la] of poly[0]) {
        if (o.bbox && (lo < bb[0] || lo > bb[2] || la < bb[1] || la > bb[3])) continue;
        const [X, Y] = raw(lo, la); x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y);
      }
    }
  }
  const pad = o.pad ?? 0.05, k = Math.min(box.w * (1 - 2 * pad) / (x1 - x0 || 1e-9), box.h * (1 - 2 * pad) / (y1 - y0 || 1e-9));
  const w = (x1 - x0) * k, h = (y1 - y0) * k;
  const ox = box.x + (o.align === "left" ? box.w * pad : (box.w - w) / 2), oy = box.y + (o.valign === "top" ? box.h * pad : (box.h - h) / 2);
  const p = (lon, lat) => { const [X, Y] = raw(lon, lat); return [ox + (X - x0) * k, oy + (y1 - Y) * k]; };
  return { p, k, bounds: { x: ox, y: oy, w, h }, kind };
}

// ------------------------------------------------------------------ drawing helpers
function _dp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1; const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(), [x1, y1] = pts[a], [x2, y2] = pts[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1e-12;
    let best = -1, bi = -1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * (pts[i][0] - x1) - dx * (pts[i][1] - y1)) / L; if (d > best) { best = d; bi = i; } }
    if (best > tol) { keep[bi] = 1; st.push([a, bi], [bi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const ringArea = (r) => Math.abs(r.reduce((a, p, i) => { const q = r[(i + 1) % r.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
function clipRing(pts, R) {
  const edges = [[(q) => q[0] >= R.x0, (a, b) => [R.x0, a[1] + (b[1] - a[1]) * (R.x0 - a[0]) / (b[0] - a[0])]],
    [(q) => q[0] <= R.x1, (a, b) => [R.x1, a[1] + (b[1] - a[1]) * (R.x1 - a[0]) / (b[0] - a[0])]],
    [(q) => q[1] >= R.y0, (a, b) => [a[0] + (b[0] - a[0]) * (R.y0 - a[1]) / (b[1] - a[1]), R.y0]],
    [(q) => q[1] <= R.y1, (a, b) => [a[0] + (b[0] - a[0]) * (R.y1 - a[1]) / (b[1] - a[1]), R.y1]]];
  let out = pts;
  for (const [ins, cut] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[(i + inp.length - 1) % inp.length], b = inp[i];
      if (ins(b)) { if (!ins(a)) out.push(cut(a, b)); out.push(b); } else if (ins(a)) out.push(cut(a, b));
    }
    if (!out.length) break;
  }
  return out;
}
function regionShape(pres, slide, f, P, st = {}) {
  const rings = []; let best = 0;
  for (const poly of f.polys) poly.forEach((ring, ri) => {
    let pts = ring.map(([lo, la]) => P.p(lo, la));
    if (st.clip) { pts = clipRing(pts, st.clip); if (pts.length < 3) return; }
    const m = Math.max(1, pts.findIndex((q, i) => i && Math.hypot(q[0] - pts[0][0], q[1] - pts[0][1]) === Math.max(...pts.map((z) => Math.hypot(z[0] - pts[0][0], z[1] - pts[0][1])))));
    pts = _dp(pts.slice(0, m + 1), st.tol || 0.008).concat(_dp(pts.slice(m), st.tol || 0.008).slice(1));
    const a = ringArea(pts);
    if (ri === 0) best = Math.max(best, a);
    if (pts.length >= 3 && (a > (st.minArea ?? 0.0006) || (ri === 0 && f.polys.length === 1))) rings.push(pts);
  });
  if (!rings.length) return null;
  const xs = rings.flat().map((q) => q[0]), ys = rings.flat().map((q) => q[1]);
  const x = Math.min(...xs), y = Math.min(...ys), w = Math.max(0.01, Math.max(...xs) - x), h = Math.max(0.01, Math.max(...ys) - y);
  const points = [];
  for (const r of rings) { r.forEach((q, i) => points.push({ x: +(q[0] - x).toFixed(4), y: +(q[1] - y).toFixed(4), ...(i === 0 ? { moveTo: true } : {}) })); points.push({ close: true }); }
  slide.addShape(pres.shapes.CUSTOM_GEOMETRY, {
    x, y, w, h, points, objectName: (st.prefix || "") + (f.name_en || f.name),
    fill: st.fill === "none" ? { type: "none" } : { color: st.fill || C.g2, transparency: st.transparency || 0 },
    line: st.line === "none" ? { type: "none" } : { color: st.line || C.white, width: st.lineWidth ?? 0.5, dashType: st.dash },
  });
  const [cx, cy] = f.centroid ? P.p(f.centroid[0], f.centroid[1]) : [x + w / 2, y + h / 2];
  return { x, y, w, h, cx, cy };
}
function mix(a, b, t) {
  const p = (h) => [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)), A = p(a), B = p(b);
  return A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, "0")).join("").toUpperCase();
}
function marker(slide, m, x, y, size, o = {}) {
  const col = m.color || (m.hi ? C.accent : o.color || C.navy), d = size;
  const kind = m.kind || o.kind || "dot";
  if (kind === "star") slide.addShape("star5", { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color: col }, line: { color: C.white, width: 0.5 }, objectName: "marker " + (m.label || m.name || "") });
  else if (kind === "pin") {
    slide.addShape("teardrop", { x: x - d / 2, y: y - d * 1.25, w: d, h: d, rotate: 135, fill: { color: col }, line: { color: C.white, width: 0.75 }, objectName: "pin " + (m.label || m.name || "") });
    if (m.n != null) txt(slide, String(m.n), x - d / 2, y - d * 1.25, d, d, { fontSize: Math.max(8, d * 36), bold: true, color: C.white, align: "center", valign: "middle", margin: 0, onDark: true });
  } else {
    slide.addShape("ellipse", { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color: col }, line: { color: C.white, width: 0.75 }, objectName: "marker " + (m.label || m.name || "") });
    if (m.n != null) txt(slide, String(m.n), x - d / 2, y - d / 2, d, d, { fontSize: Math.max(8, d * 30), bold: true, color: C.white, align: "center", valign: "middle", margin: 0, onDark: true });
  }
}
const markRect = (kind, x, y, s) => (kind === "pin" ? { x: x - s / 2, y: y - s * 1.25, w: s, h: s * 1.25 } : { x: x - s / 2, y: y - s / 2, w: s, h: s });   // the room a marker takes
function placeOf(m, P, regions, feats) {
  if (m.lon != null) return P.p(m.lon, m.lat);
  const at = m.at || m.name;
  const f = feats && feats.find((g) => matches(g, at));
  if (f) { const r = regions[f.name]; return r ? [r.cx, r.cy] : P.p(...f.centroid); }
  return P.p(...cityLL(at, m.iso));
}
// places a label beside a point without overlapping earlier labels/markers: right, left, above, below
function placeLabel(slide, used, text, x, y, r, o = {}) {
  const fs_ = o.fontSize || 9, w = Math.max(0.3, String(text).length * fs_ / 72 * 0.56 + 0.06), h = fs_ / 72 * 1.5;
  const cands = [[x + r + 0.03, y - h / 2], [x - r - 0.03 - w, y - h / 2], [x - w / 2, y - r - h], [x - w / 2, y + r]];
  const hit = (a) => used.some((b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h);
  let pick = cands.map(([cx, cy]) => ({ x: cx, y: cy, w, h })).find((c) => !hit(c));
  if (!pick) { if (o.skipIfCrowded) return; pick = { x: cands[0][0], y: cands[0][1], w, h }; }
  used.push(pick);
  const leftOf = pick.x + w <= x;   // the label sits left of its point: right-aligned, ending before the marker
  if (o.pad !== false) slide.addShape("roundRect", { x: pick.x - 0.02, y: pick.y, w: w + 0.04, h, rectRadius: 0.03, fill: { color: C.white, transparency: 20 }, line: { type: "none" }, objectName: "label pad " + text });
  txt(slide, text, leftOf ? pick.x - 0.05 : pick.x, pick.y, w + 0.05, h, { fontSize: fs_, bold: !!o.bold, color: o.color || C.text, valign: "middle", margin: 0, align: leftOf ? "right" : pick.x < x - w / 4 ? "center" : "left" });
}
function legend(slide, items, x, y, o = {}) {   // items: [{color, label, kind}]
  const rh = o.rowH || 0.24;
  if (o.title) { txt(slide, o.title, x, y, 2.6, rh, { fontSize: 10, bold: true, color: C.text }); y += rh; }
  items.forEach((it, i) => {
    const yy = y + i * rh;
    if (it.kind === "dot" || it.kind === "star" || it.kind === "pin") marker(slide, { color: it.color, kind: it.kind === "pin" ? "dot" : it.kind }, x + 0.09, yy + rh / 2, it.size || 0.14);
    else slide.addShape("rect", { x, y: yy + 0.04, w: 0.22, h: rh - 0.08, fill: { color: it.color }, line: { color: it.border || it.color, width: 0.5, dashType: it.dash } });
    txt(slide, it.label, x + 0.28, yy, (o.w || 2.4) - 0.28, rh, { fontSize: 10, color: C.text, valign: "middle", margin: 0 });
  });
  return y + items.length * rh;
}
const sizeOf = (v, vmax, smin = 0.1, smax = 0.3) => smin + (smax - smin) * Math.sqrt(Math.max(0, v) / (vmax || 1));

// ------------------------------------------------------------------ mapRegions
// spec: { geo: "cn" | "cn:广东" | "adm1:USA" | "world" | {features}, focus: [names] (zoom to these, draw the rest as context, clipped to the box),
//   values: {name: number} (shaded grey → main), bins: [cuts] + legend: {title, format}, highlight: [names] (main colour),
//   colors: {name: hex}, labels: "auto" | "all" | false | [names] | {name: text}, labelValues: true, lang: "en" | "zh",
//   markers: [{at|name|lon,lat, value, label, kind:"dot"|"pin"|"star", hi, n}], markerLegend: [{kind, color, label}],
//   contextGeo: ref drawn faintly behind, projection: "albers"|"equirect"|"naturalEarth", scsInset: false (China: no South China Sea inset) }
function mapRegions(pres, slide, spec, box = BODY) {
  const g = geo(spec.geo, { insets: spec.insets, only: spec.only, exclude: spec.exclude, parent: spec.parent });
  const feats = g.features, focusF = spec.focus ? feats.filter((f) => spec.focus.some((k) => matches(f, k))) : null;
  const chinaCountry = /cn\/100000/.test(g.rel || "") && spec.scsInset !== false && !focusF;
  const popt = { projection: spec.projection, pad: spec.pad, align: spec.align, bbox: chinaCountry ? [73, 17.6, 135.2, 53.6] : undefined, allParts: spec.allParts };
  const base = focusF && focusF.length ? focusF : feats.filter((f) => !f.inset);
  let P = project(base, box, popt);
  if (chinaCountry) {   // keep room for the South China Sea inset on the right
    const iw = Math.min(P.bounds.w * 0.17, 1.2);
    if (box.x + box.w - (P.bounds.x + P.bounds.w) < iw + 0.08) P = project(base, { ...box, w: box.w - iw - 0.1 }, { ...popt, align: "left" });
  }
  const vals = spec.values || {}, vkey = (f) => Object.keys(vals).find((k) => matches(f, k));
  const nums = Object.values(vals).filter((v) => typeof v === "number"), vmin = Math.min(...nums, 0), vmax = Math.max(...nums, 1);
  const bins = spec.bins;
  const shade = (v) => bins ? mix(C.g2, C.navy, bins.filter((c) => v >= c).length / bins.length) : mix(C.g2, C.navy, 0.15 + 0.85 * (v - vmin) / (vmax - vmin || 1));
  const clip = { x0: box.x, y0: box.y, x1: box.x + box.w, y1: box.y + box.h };
  if (chinaCountry) { const b = P.bounds; clip.y1 = Math.min(clip.y1, b.y + b.h + 0.02); }
  const fillOf = (f, inFocus) => {
    const k = vkey(f);
    if (f.inset) return "none";
    const ck = spec.colors && Object.keys(spec.colors).find((c) => matches(f, c));
    if (ck) return spec.colors[ck];
    if (spec.highlight && spec.highlight.some((h) => matches(f, h))) return spec.highlightColor || C.navy;
    if (k != null) return shade(vals[k]);
    return inFocus ? spec.base || C.g2 : "F2F2F2";
  };
  const regions = {};
  if (spec.contextGeo) for (const f of geo(spec.contextGeo).features) regionShape(pres, slide, f, P, { fill: "F7F7F7", line: C.g2, lineWidth: 0.5, prefix: "context ", clip });
  for (const f of feats) {
    if (f.inset && chinaCountry) continue;
    const inFocus = !focusF || focusF.includes(f);
    const r = regionShape(pres, slide, f, P, { fill: fillOf(f, inFocus), line: f.inset ? C.g4 : C.white, lineWidth: f.inset ? 0.75 : spec.lineWidth ?? 0.5, tol: spec.tol, minArea: spec.minArea, clip });
    if (r) regions[f.name] = { ...r, f, inFocus };
  }
  if (chinaCountry) {   // South China Sea islands inset, bottom right (standard on maps of China)
    const b = P.bounds, iw = Math.min(b.w * 0.17, 1.2), ih = iw * 1.45;
    const room = box.x + box.w - (b.x + b.w);   // outside the map on the right when there is room, else in its bottom-right corner
    const ib = { x: room > iw + 0.08 ? b.x + b.w + 0.05 : b.x + b.w - iw, y: b.y + b.h - ih, w: iw, h: ih };
    slide.addShape("rect", { x: ib.x, y: ib.y, w: ib.w, h: ib.h, fill: { color: C.white }, line: { color: C.g4, width: 0.75 } });
    const IP = project([], ib, { bbox: [106.5, 2.8, 122.5, 24.2], projection: "equirect", pad: 0.02, allParts: true });
    const ic = { x0: ib.x, y0: ib.y, x1: ib.x + ib.w, y1: ib.y + ib.h };
    for (const f of feats) regionShape(pres, slide, f, IP, { fill: f.inset ? C.g5 : fillOf(f, true), line: f.inset ? C.g5 : f.name.startsWith("海南") ? C.g4 : C.white, lineWidth: f.inset ? 0.25 : 0.4, clip: ic, minArea: 0, tol: 0.002, prefix: "inset " });
    const zhI = spec.lang === "zh", iLines = zhI ? 1 : 2;   // label at the smallest readable size (8 pt); left out when the inset is too narrow for it
    if (iw >= (zhI ? 0.5 : 0.9)) txt(slide, zhI ? "南海诸岛" : "South China Sea\nIslands", ib.x, ib.y + ib.h - 0.03 - iLines * 0.14, ib.w, iLines * 0.14, { fontSize: 8, color: C.g5, align: "center", valign: "middle", margin: 0 });
  }
  const used = [];   // occupied label/marker rectangles
  const mk = spec.markers || [], mmax = Math.max(1, ...mk.map((m) => m.value || 0));
  const placed = mk.map((m) => { const [x, y] = placeOf(m, P, regions, feats); const s = m.size || (m.value != null ? sizeOf(m.value, mmax, spec.minDot, spec.maxDot) : 0.16); used.push(markRect(m.kind || spec.markerKind, x, y, s)); return { m, x, y, s }; });
  (spec.pins || []).forEach((m) => { const [x, y] = placeOf(m, P, regions, feats); used.push(markRect("pin", x, y, m.size || 0.3)); });   // pins another generator draws later (siteCallouts): region labels keep clear of them
  // region labels (centred; skipped where they would collide)
  const lab = spec.labels ?? "auto", lang = spec.lang || "en";
  if (lab) for (const [name, r] of Object.entries(regions)) {
    if (!r.inFocus || r.f.inset) continue;
    const f = r.f, k = vkey(f);
    let text = null;
    if (typeof lab === "object" && !Array.isArray(lab)) { const kk = Object.keys(lab).find((q) => matches(f, q)); text = kk ? lab[kk] : null; }
    else if (Array.isArray(lab)) text = lab.some((q) => matches(f, q)) ? label(f, lang) : null;
    else if (lab === "all" || (lab === "auto" && r.w * r.h > (spec.labelMinArea ?? 0.12))) text = label(f, lang);
    if (text == null) continue;
    if (spec.labelValues && k != null) text += (lang === "zh" ? " " : ", ") + (spec.format ? spec.format(vals[k]) : vals[k]);
    const dark = (spec.highlight || []).some((h) => matches(f, h)) || (k != null && bins && bins.filter((c) => vals[k] >= c).length / bins.length > 0.6);
    const fs_ = spec.labelSize || (typeof lab === "object" ? 8 : Math.max(8, Math.min(10, Math.sqrt(r.w * r.h) * 6)));
    const w = String(text).length * fs_ / 72 * 0.56 + 0.06, h = fs_ / 72 * 1.5, rc = { x: r.cx - w / 2, y: r.cy - h / 2, w, h };
    if (rc.x < box.x || rc.x + w > box.x + box.w || used.some((b) => rc.x < b.x + b.w && b.x < rc.x + rc.w && rc.y < b.y + b.h && b.y < rc.y + rc.h)) continue;
    used.push(rc);
    txt(slide, text, rc.x - 0.02, rc.y, w + 0.04, h, { fontSize: fs_, color: dark ? C.white : C.text, align: "center", valign: "middle", margin: 0, onDark: dark, bold: dark });
  }
  for (const { m, x, y, s } of placed) marker(slide, m, x, y, s, { kind: spec.markerKind });   // all markers first, labels on top
  for (const { m, x, y, s } of placed) {
    if (m.label) placeLabel(slide, used, m.label, x, y, s / 2, { fontSize: spec.markerLabelSize || 9, bold: !!m.hi, color: m.hi ? C.navy : C.text });
  }
  if (spec.legend !== false && (bins || spec.markerLegend || spec.legendItems)) {
    const items = spec.legendItems || (bins ? bins.map((c, i) => ({ color: mix(C.g2, C.navy, (i + 1) / bins.length), label: (spec.legend && spec.legend.format ? spec.legend.format(c, bins[i + 1]) : (bins[i + 1] != null ? `${c}–${bins[i + 1] - 1}` : `≥ ${c}`)) })).reverse() : []).concat(spec.markerLegend || []);
    const lh = (items.length + (spec.legend && spec.legend.title ? 1 : 0)) * 0.24;
    const lx = spec.legendAt ? spec.legendAt.x : box.x + 0.05, ly = spec.legendAt ? spec.legendAt.y : box.y + box.h - lh - 0.05;
    legend(slide, items, lx, ly, { title: spec.legend && spec.legend.title });
  }
  return { P, regions, bounds: P.bounds, features: feats, source: g.source };
}

// ------------------------------------------------------------------ regionMultiples
// spec: { geo, groups: [{title, regions: [names], note}], markers: [{at|lon,lat, kind, label, hi}] (shown in the panel that contains them),
//   highlight, markerLegend, cols }
function regionMultiples(pres, slide, spec, box = BODY) {
  const g = geo(spec.geo), n = spec.groups.length;
  let best = null;
  for (let cols = 1; cols <= n; cols++) {   // grid whose cells are closest to the shape of a typical group map
    const rows = Math.ceil(n / cols), cw = box.w / cols, ch = box.h / rows, score = Math.abs(Math.log((cw / ch) / 1.25)) + 0.15 * (rows * cols - n);
    if (!best || score < best.score) best = { cols, rows, score };
  }
  const cols = spec.cols || best.cols, rows = Math.ceil(n / cols), gap = 0.15, free = rows * cols - n;
  const legendInCell = spec.markerLegend && free > 0, legendH = spec.markerLegend && !legendInCell ? 0.32 : 0;
  const cw = (box.w - (cols - 1) * gap) / cols, ch = (box.h - legendH - (rows - 1) * gap) / rows;
  spec.groups.forEach((grp, i) => {
    const x = box.x + (i % cols) * (cw + gap), y = box.y + Math.floor(i / cols) * (ch + gap);
    slide.addShape("rect", { x, y, w: cw, h: ch, fill: { type: "none" }, line: { color: C.g4, width: 0.75, dashType: "dash" } });
    txt(slide, grp.title, x + 0.08, y + 0.04, cw - 0.16, 0.3, { fontSize: 12, bold: true, color: C.navy, margin: 0 });
    const feats = g.features.filter((f) => grp.regions.some((k) => matches(f, k)));
    const inner = { x: x + 0.05, y: y + 0.34, w: cw - 0.1, h: ch - 0.4 - (grp.note ? 0.25 : 0) };
    const P = project(feats, inner, { pad: 0.04 }), clip = { x0: x + 0.02, y0: y + 0.3, x1: x + cw - 0.02, y1: y + ch - 0.02 }, used = [];
    for (const f of feats) {
      const hi = (spec.highlight || []).some((h) => matches(f, h));
      regionShape(pres, slide, f, P, { fill: hi ? mix(C.g2, C.navy, 0.35) : C.g2, clip });
    }
    const ms = [];
    for (const m of spec.markers || []) {
      let ll; try { ll = m.lon != null ? [m.lon, m.lat] : cityLL(m.at || m.name, m.iso); } catch (e) { continue; }
      if (!feats.some((f) => pointIn(ll[0], ll[1], f.polys))) continue;
      const [mx, my] = P.p(ll[0], ll[1]), s = m.size || (m.kind === "star" ? 0.24 : 0.16);
      used.push({ x: mx - s / 2, y: my - s / 2, w: s, h: s }); ms.push({ m, mx, my, s });
    }
    ms.sort((a, b) => (b.m.kind === "star") - (a.m.kind === "star"));
    for (const { m, mx, my, s } of ms) marker(slide, m, mx, my, s);
    for (const { m, mx, my, s } of ms) {
      if (m.label !== false) placeLabel(slide, used, m.label || m.at || m.name, mx, my, s / 2, { fontSize: 9, bold: !!m.hi, color: m.hi ? C.navy : C.text });
    }
    if (grp.note) txt(slide, grp.note, x + 0.08, y + ch - 0.3, cw - 0.16, 0.26, { fontSize: 9, color: C.g5, margin: 0 });
  });
  if (spec.markerLegend) {
    if (legendInCell) {
      const i = n, x = box.x + (i % cols) * (cw + gap), y = box.y + Math.floor(i / cols) * (ch + gap);
      legend(slide, spec.markerLegend.map((it) => ({ ...it, kind: it.kind || "dot", size: 0.18 })), x + 0.2, y + 0.2, { title: spec.legendTitle || "Legend" });
    } else {
      let lx = box.x; const ly = box.y + box.h - legendH + 0.05;
      spec.markerLegend.forEach((it) => { marker(slide, { kind: it.kind, color: it.color }, lx + 0.1, ly + 0.12, 0.18); txt(slide, it.label, lx + 0.24, ly, 2, 0.24, { fontSize: 10, valign: "middle", margin: 0 }); lx += 0.4 + it.label.length * 0.075; });
    }
  }
}

// ------------------------------------------------------------------ siteCallouts
// spec: { geo, focus, highlight, values, sites: [{at|lon,lat, title, bullets:[..], tag, hi}], side: "right" | "both", mapShare: 0.5, lang }
function siteCallouts(pres, slide, spec, box = BODY) {
  const both = spec.side === "both", share = spec.mapShare || (both ? 0.44 : 0.52);
  const mapBox = both ? { x: box.x + box.w * (1 - share) / 2, y: box.y, w: box.w * share, h: box.h } : { x: box.x, y: box.y, w: box.w * share, h: box.h };
  const M = mapRegions(pres, slide, { ...spec, markers: [], pins: spec.sites, legend: spec.legend ?? false }, mapBox);
  const pins = spec.sites.map((s, i) => ({ s, i, xy: placeOf(s, M.P, M.regions, M.features) }));
  let left = [], right = pins;
  if (both) { const byX = [...pins].sort((a, b) => a.xy[0] - b.xy[0]); left = byX.slice(0, Math.floor(pins.length / 2)); right = byX.slice(left.length); }
  const cw = both ? (box.w - mapBox.w) / 2 - 0.25 : box.w - mapBox.w - 0.35;
  const place = (list, cx) => {
    list.sort((a, b) => a.xy[1] - b.xy[1]);
    const gap = 0.12, ch = Math.min(1.45, (box.h - gap * (list.length - 1)) / Math.max(1, list.length));
    const top = box.y + (box.h - (list.length * ch + (list.length - 1) * gap)) / 2;
    list.forEach((p, k) => {
      const y = top + k * (ch + gap), s = p.s, hi = !!s.hi;
      const ex = cx < p.xy[0] ? cx + cw : cx, ey = y + 0.23;
      slide.addShape("line", { x: Math.min(p.xy[0], ex), y: Math.min(p.xy[1], ey), w: Math.abs(ex - p.xy[0]) || 0.01, h: Math.abs(ey - p.xy[1]) || 0.01,
        flipV: (ex < p.xy[0]) !== (ey < p.xy[1]), line: { color: hi ? C.accent : C.g4, width: 1, dashType: "dash" } });
      slide.addShape("rect", { x: cx, y, w: cw, h: ch, fill: { color: hi ? C.hiBand : C.white }, line: { color: hi ? C.navy : C.g3, width: 0.75 } });
      slide.addShape("ellipse", { x: cx + 0.08, y: y + 0.08, w: 0.3, h: 0.3, fill: { color: hi ? C.accent : C.navy }, line: { type: "none" } });
      txt(slide, String(p.i + 1), cx + 0.08, y + 0.08, 0.3, 0.3, { fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle", margin: 0, onDark: true });
      txt(slide, s.title || s.at || s.name, cx + 0.45, y + 0.05, cw - 0.5 - (s.tag ? 1.2 : 0), 0.36, { max: 12, min: 9, bold: true, color: C.navy, valign: "middle" });
      if (s.tag) txt(slide, s.tag, cx + cw - 1.25, y + 0.05, 1.18, 0.36, { fontSize: 9, color: C.g5, align: "right", valign: "middle" });
      if (s.bullets) txt(slide, s.bullets.map((b) => "• " + b).join("\n"), cx + 0.12, y + 0.42, cw - 0.2, ch - 0.47, { max: 11, min: 8 });
    });
  };
  if (both) place(left, box.x);
  place(right, box.x + box.w - cw);
  pins.forEach((p) => marker(slide, { ...p.s, n: p.i + 1, kind: "pin" }, p.xy[0], p.xy[1], 0.3));
  return M;
}

// ------------------------------------------------------------------ geoZoom
// spec: { levels: [{geo, highlight: name (zoomed into next), title, label (e.g. "Country"), values, bins, labels, markers}], sites: [...] (on the last level),
//   weights: [..] }  e.g. China → Guangdong → Shenzhen districts → 4 sites
function geoZoom(pres, slide, spec, box = BODY) {
  const L = spec.levels, n = L.length, gap = 0.55, hasSites = !!spec.sites;
  const wts = spec.weights || L.map((_, i) => (i === n - 1 ? (hasSites ? 3.2 : 1.6) : 0.85));
  const tot = wts.reduce((a, b) => a + b, 0), aw = box.w - gap * (n - 1);
  let x = box.x; const out = [];
  L.forEach((lv, i) => {
    const w = aw * wts[i] / tot, head = 0.36;
    if (lv.label || lv.title) {
      if (lv.label) { slide.addShape("rect", { x, y: box.y, w: Math.min(w, 0.3 + lv.label.length * 0.085), h: 0.26, fill: { color: C.navy }, line: { type: "none" } });
        txt(slide, lv.label, x, box.y, Math.min(w, 0.3 + lv.label.length * 0.085), 0.26, { fontSize: 9, bold: true, color: C.white, align: "center", valign: "middle", margin: 0, onDark: true }); }
      if (lv.title) txt(slide, lv.title, x + (lv.label ? Math.min(w, 0.3 + lv.label.length * 0.085) + 0.08 : 0), box.y, Math.max(0.3, w - (lv.label ? Math.min(w, 0.3 + lv.label.length * 0.085) + 0.08 : 0)), 0.26, { fontSize: 11, bold: true, color: C.navy, valign: "middle", margin: 0 });
    }
    const pb = { x, y: box.y + head, w, h: box.h - head };
    let M;
    if (i === n - 1 && hasSites) M = siteCallouts(pres, slide, { ...lv, highlight: lv.highlightAll || lv.highlight, sites: spec.sites, mapShare: spec.mapShare || 0.56 }, pb);
    else M = mapRegions(pres, slide, { labels: false, ...lv, highlight: lv.highlight ? [lv.highlight].concat(lv.highlightAlso || []) : lv.highlightAll }, pb);
    out.push({ M, pb });
    x += w + gap;
  });
  for (let i = 0; i < n - 1; i++) {   // zoom lines: highlighted region's box → next map's bounds
    const { M } = out[i], nxt = out[i + 1].M.bounds, hl = L[i].highlight;
    const r = hl && Object.values(M.regions).find((q) => matches(q.f, hl));
    if (!r) continue;
    slide.addShape("rect", { x: r.x - 0.03, y: r.y - 0.03, w: r.w + 0.06, h: r.h + 0.06, fill: { type: "none" }, line: { color: C.accent, width: 1.25 } });
    const seg = (x1, y1, x2, y2) => slide.addShape("line", { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.01, h: Math.abs(y2 - y1) || 0.01, flipV: (y2 < y1) !== (x2 < x1), line: { color: C.accent, width: 0.75, dashType: "dash" } });
    seg(r.x + r.w + 0.03, r.y - 0.03, nxt.x, nxt.y);
    seg(r.x + r.w + 0.03, r.y + r.h + 0.03, nxt.x, nxt.y + nxt.h);
  }
  return out;
}

// ------------------------------------------------------------------ buildingExplode
// spec: { floors: [{name, zones: [{name, share, hi}], hi}] (bottom → top), cards: [{floor: i|name, title, bullets, tag}],
//   visible: 0.6 (share of each lower floor left visible), depth: 0.62 (depth / width), labels: "zones" | "numbers" }
function buildingExplode(pres, slide, spec, box = BODY) {
  const F = spec.floors, n = F.length, cardsOn = !!(spec.cards && spec.cards.length);
  const nameW = 1.0, dw = (cardsOn ? box.w * (spec.drawShare || 0.5) : box.w) - nameW, c30 = Math.cos(Math.PI / 6), s30 = 0.5;
  const ratio = spec.depth || 0.62, th = 0.14, vis = spec.visible || 0.6;
  const S = Math.min(dw / c30, (box.h - 0.1 - n * th) / (s30 * (1 + vis * (n - 1)))), Wf = S / (1 + ratio), D = S - Wf;
  const faceH = S * s30, step = th + vis * faceH, totalH = faceH + th + (n - 1) * step;
  const ox = box.x + nameW + (dw - S * c30) / 2, yTop = box.y + (box.h - totalH) / 2 + D * s30;
  const poly = (pts, fill, line, name) => {
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), x = Math.min(...xs), y = Math.min(...ys);
    slide.addShape(pres.shapes.CUSTOM_GEOMETRY, { x, y, w: Math.max(0.01, Math.max(...xs) - x), h: Math.max(0.01, Math.max(...ys) - y), objectName: name,
      points: pts.map((q, i) => ({ x: +(q[0] - x).toFixed(4), y: +(q[1] - y).toFixed(4), ...(i ? {} : { moveTo: true }) })).concat([{ close: true }]),
      fill: { color: fill }, line: { color: line || C.white, width: 0.75 } });
  };
  const anchors = [], numbered = {};
  for (let k = 0; k < n; k++) {                                            // bottom floor first; upper floors cover the back of lower ones
    const fl = F[k], hi = !!fl.hi, O = [ox, yTop + (n - 1 - k) * step];
    const U = (t) => [O[0] + t * Wf * c30, O[1] + t * Wf * s30], V = (p, t) => [p[0] + t * D * c30, p[1] - t * D * s30];
    const A = U(0), B = U(1), Cr = V(B, 1);
    poly([A, B, [B[0], B[1] + th], [A[0], A[1] + th]], hi ? C.navy : C.g4, null, `${fl.name} front`);
    poly([B, Cr, [Cr[0], Cr[1] + th], [B[0], B[1] + th]], hi ? mix(C.navy, "000000", 0.3) : C.g5, null, `${fl.name} side`);
    const zs = fl.zones && fl.zones.length ? fl.zones : [{ name: fl.name, share: 1 }];
    const tot = zs.reduce((a, z) => a + (z.share || 1), 0); let t0 = 0;
    const vLab = k === n - 1 ? 0.5 : vis * 0.45;
    zs.forEach((z, zi) => {
      const t1 = t0 + (z.share || 1) / tot, a = U(t0), b = U(t1);
      const fill = z.hi ? C.navy : hi ? mix(C.g1, C.navy, zi % 2 ? 0.2 : 0.1) : (zi % 2 ? C.g2 : C.g1);
      poly([a, b, V(b, 1), V(a, 1)], fill, C.white, `${fl.name} – ${z.name}`);
      const m = V(U((t0 + t1) / 2), vLab), fits = z.name.length * 9 / 72 * 0.55 < (t1 - t0) * Wf * c30 * 0.95 + D * c30 * 0.35;
      const lab = spec.labels === "numbers" || !fits ? String(zi + 1) : z.name;
      if (lab !== z.name) numbered[k] = true;
      txt(slide, lab, m[0] - 0.65, m[1] - 0.12, 1.3, 0.24, { fontSize: 9, bold: !!z.hi, color: z.hi ? C.white : C.text, align: "center", valign: "middle", margin: 0, onDark: !!z.hi });
      t0 = t1;
    });
    txt(slide, fl.name, box.x, A[1] - 0.02, nameW + (ox - box.x - nameW) - 0.1, 0.3, { fontSize: 11, bold: true, color: hi ? C.navy : C.text, align: "right", valign: "middle", margin: 0 });
    anchors[k] = [Cr[0], Cr[1] + th / 2];
  }
  if (!cardsOn) return;
  const cx0 = box.x + nameW + dw + 0.5, cw = box.x + box.w - cx0, cards = spec.cards;
  const gap = 0.12, ch = Math.min(1.7, (box.h - gap * (cards.length - 1)) / cards.length);
  const top0 = box.y + (box.h - (cards.length * ch + (cards.length - 1) * gap)) / 2;
  cards.forEach((cd, i) => {
    const fi = typeof cd.floor === "number" ? cd.floor : F.findIndex((f) => f.name === cd.floor);
    const y = top0 + i * (ch + gap), hi = fi >= 0 && F[fi].hi;
    if (fi >= 0 && anchors[fi]) {   // elbow leader from the floor's right corner to the card
      const [ax, ay] = anchors[fi], ey = y + ch / 2, mx = cx0 - 0.22;
      slide.addShape("line", { x: ax, y: Math.min(ay, ey), w: Math.max(0.01, mx - ax), h: Math.abs(ey - ay) || 0.01, flipV: ey < ay, line: { color: hi ? C.accent : C.g4, width: 1 } });
      slide.addShape("line", { x: mx, y: ey, w: cx0 - mx, h: 0, line: { color: hi ? C.accent : C.g4, width: 1, endArrowType: "triangle" } });
    }
    slide.addShape("rect", { x: cx0, y, w: cw, h: ch, fill: { color: hi ? C.hiBand : C.white }, line: { color: hi ? C.navy : C.g3, width: 0.75 } });
    txt(slide, cd.title || (fi >= 0 ? F[fi].name : ""), cx0 + 0.15, y + 0.03, cw - 0.2 - (cd.tag ? 1.2 : 0), 0.32, { max: 12, min: 9, bold: true, color: C.navy, valign: "middle" });
    if (cd.tag) txt(slide, cd.tag, cx0 + cw - 1.25, y + 0.03, 1.18, 0.32, { fontSize: 9, color: C.g5, align: "right", valign: "middle" });
    const zl = fi >= 0 && numbered[fi] ? [(F[fi].zones || []).map((z, zi) => `${zi + 1} ${z.name}`).join("   ")] : [];
    const body = zl.map((t) => ({ text: t, options: { bold: true, color: C.g5, breakLine: !!(cd.bullets && cd.bullets.length) } }))
      .concat((cd.bullets || []).map((b, bi, a) => ({ text: "• " + b, options: { breakLine: bi < a.length - 1 } })));
    if (body.length) txt(slide, body, cx0 + 0.15, y + 0.36, cw - 0.22, ch - 0.4, { max: 11, min: 8 });
  });
}

// ------------------------------------------------------------------ floorPlan
// spec: { zones: [{name, x, y, w, h (0–1 of the footprint), hi, note}], entrance: {side: "bottom"|"top"|"left"|"right", at: 0–1, width: 0–1},
//   path: [[x, y], …] (0–1, customer route), legend: true, aspect: footprint w/h }
function floorPlan(pres, slide, spec, box = BODY) {
  const legendOn = spec.legend !== false, pw = legendOn ? box.w * (spec.planShare || 0.55) : box.w, asp = spec.aspect || 1.5;
  let fw = pw - 0.2, fh = fw / asp; if (fh > box.h - 0.2) { fh = box.h - 0.2; fw = fh * asp; }
  const fx = box.x + (pw - fw) / 2, fy = box.y + (box.h - fh) / 2, X = (u) => fx + u * fw, Y = (v) => fy + v * fh;
  slide.addShape("rect", { x: fx, y: fy, w: fw, h: fh, fill: { color: "FAFAFA" }, line: { color: C.g5, width: 3 } });
  spec.zones.forEach((z, i) => {
    const x = X(z.x) + 0.04, y = Y(z.y) + 0.04, w = z.w * fw - 0.08, h = z.h * fh - 0.08;
    slide.addShape("rect", { x, y, w, h, fill: { color: z.hi ? C.navy : i % 2 ? C.g2 : C.g1 }, line: { color: z.hi ? C.navy : C.g3, width: 0.75 }, objectName: "zone " + z.name });
    slide.addShape("ellipse", { x: x + 0.06, y: y + 0.06, w: 0.28, h: 0.28, fill: { color: z.hi ? C.accent : C.navy }, line: { color: C.white, width: 0.5 } });
    txt(slide, String(i + 1), x + 0.06, y + 0.06, 0.28, 0.28, { fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle", margin: 0, onDark: true });
    if (w > 0.9 && h > 0.45) txt(slide, z.name, x + 0.05, y + 0.3, w - 0.1, h - 0.34, { max: 12, min: 8, bold: true, color: z.hi ? C.white : C.text, align: "center", valign: "middle", onDark: !!z.hi });
  });
  if (spec.entrance) {   // gap in the wall + arrow pointing in
    const e = spec.entrance, ew = (e.width || 0.14) * (e.side === "left" || e.side === "right" ? fh : fw), at = e.at ?? 0.5;
    let gx, gy, gw, gh, ax, ay, aw, ah, rot;
    if (e.side === "left" || e.side === "right") { gx = e.side === "left" ? fx - 0.06 : fx + fw - 0.06; gy = Y(at) - ew / 2; gw = 0.12; gh = ew; ax = e.side === "left" ? fx - 0.7 : fx + fw + 0.12; ay = Y(at) - 0.18; aw = 0.55; ah = 0.36; rot = e.side === "left" ? 0 : 180; }
    else { gx = X(at) - ew / 2; gy = e.side === "top" ? fy - 0.06 : fy + fh - 0.06; gw = ew; gh = 0.12; ax = X(at) - 0.18; ay = e.side === "top" ? fy - 0.7 : fy + fh + 0.12; aw = 0.36; ah = 0.55; rot = 0; }
    slide.addShape("rect", { x: gx, y: gy, w: gw, h: gh, fill: { color: C.white }, line: { type: "none" } });
    slide.addShape(e.side === "top" ? "downArrow" : e.side === "bottom" ? "upArrow" : "rightArrow", { x: ax, y: ay, w: aw, h: ah, rotate: rot, fill: { color: C.accent }, line: { type: "none" } });
    txt(slide, e.label || "Entrance", e.side === "bottom" ? ax + aw + 0.05 : ax, e.side === "bottom" ? ay + 0.1 : ay - 0.28, 1.2, 0.26, { fontSize: 9, bold: true, color: C.text, margin: 0 });
  }
  if (spec.path && spec.path.length > 1) spec.path.slice(1).forEach((q, i) => {
    const [x1, y1] = [X(spec.path[i][0]), Y(spec.path[i][1])], [x2, y2] = [X(q[0]), Y(q[1])], last = i === spec.path.length - 2;
    slide.addShape("line", { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.01, h: Math.abs(y2 - y1) || 0.01,
      flipH: x2 < x1, flipV: y2 < y1, line: { color: C.accent, width: 2, dashType: "dash", endArrowType: last ? "triangle" : undefined } });
  });
  if (!legendOn) return;
  const lx = box.x + pw + 0.3, lw = box.w - pw - 0.3, rh = Math.min(0.75, box.h / spec.zones.length);
  spec.zones.forEach((z, i) => {
    const y = box.y + i * rh;
    slide.addShape("ellipse", { x: lx, y: y + 0.06, w: 0.3, h: 0.3, fill: { color: z.hi ? C.accent : C.navy }, line: { type: "none" } });
    txt(slide, String(i + 1), lx, y + 0.06, 0.3, 0.3, { fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle", margin: 0, onDark: true });
    txt(slide, z.note ? [{ text: z.name, options: { bold: true, color: C.navy, breakLine: true } }, { text: z.note }] : [{ text: z.name, options: { bold: true, color: C.navy } }],
      lx + 0.4, y, lw - 0.4, rh - 0.04, { max: 11, min: 8 });
  });
}

module.exports = { geo, project, pointIn, cityLL, label, matches, mapRegions, regionMultiples, siteCallouts, geoZoom, buildingExplode, floorPlan, regionShape, marker, legend, MAPS };
