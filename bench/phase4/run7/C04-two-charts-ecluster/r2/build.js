// C04 rebuild (run7 r2): "deck as reference" (Case-2019-E-Cluster), built from prompt.md.
// Layout: T2B1 as the deck's own market-overview slide draws it (two numbered exhibits on top, a grey band of three
// icon points below; deck renders 05/06/16 studied). Charts are drawn with shapes and labelled directly, no value axis,
// as the deck draws them (profile chart entry). Text at the deck's body size (15 pt), labels >= 14 pt.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const title = "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition";
const { pres, slide, P, S } = L.start({
  ref: "Case-2019-E-Cluster", title,
  source: [{ text: "Sources: Euromonitor International, Lit research, E-Cluster Analysis", options: { italic: true } }],
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
});
const C = P.C, FONT = "Arial";
const LIGHT = "C1DBEB", RED = "CC0000", PT = 15;
const T = (text, x, y, w, h, o = {}) => P.txt(slide, text, x, y, w, h, { noScale: true, margin: 0, valign: "middle", fontSize: PT, ...o });
const box = (x, y, w, h, fill) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { color: "FFFFFF", width: 0.75 } });
const line = (x, y, w, h, color, width = 0.75, extra = {}) => slide.addShape("line", { x, y, w, h, line: { color, width, ...extra } });

// ---------- panel headlines (the deck's numbered sub-headline: round chip, bold navy sentence, rule) ----------
const LX = 0.27, LW = 6.15, RX = 6.87, RW = 13.07 - 6.87, HY = 1.42;
S.subhead(slide, 1, "Fine jewelry has a lower growth rate", LX, HY, LW);
S.subhead(slide, 2, "Fine jewelry accounts for the majority of CTF*", RX, HY, RW);

// ---------- 1: stacked columns (fine at the foot, light; fashion on top, dark) + CAGR table with the key value circled ----------
T("China fine jewelry annual market size and growth", 0.62, 1.9, 5.8, 0.26);
T([{ text: "CNY Billion", options: { italic: true } }], 0.62, 2.15, 3, 0.26);
const yb = 4.5, maxH = 1.85, colW = 0.66;
const mk = [
  { y: "2013", tot: 532, fash: 0.15 },
  { y: "2018", tot: 722, fash: 0.18 },
  { y: "2023E", tot: 998, fash: 0.24 },
];
mk.forEach((m, i) => {
  const cx = 1.05 + i * 0.98, h = (m.tot / 998) * maxH, hf = h * m.fash, x = cx - colW / 2;
  box(x, yb - h + hf, colW, h - hf, LIGHT);           // fine jewelry
  box(x, yb - h, colW, hf, C.navy);                   // fashion jewelry (highlighted)
  T(String(m.tot), cx - 0.5, yb - h - 0.32, 1.0, 0.28, { align: "center" });
  T(m.y, cx - 0.5, yb + 0.06, 1.0, 0.28, { align: "center" });
});
line(0.6, yb, 2.9, 0, C.g4, 0.75);
// CAGR table beside the stack: rows level with the segments they describe
const nx = 3.62, nw = 1.35, cw = 0.76, c1 = nx + nw, c2 = c1 + cw;
[["13-18", c1], ["18-23", c2]].forEach(([h, x]) => {
  T([{ text: "CAGR", options: { underline: true } }], x, 2.3, cw, 0.26, { align: "center" });
  T(h, x, 2.56, cw, 0.26, { align: "center" });
});
const rows = [
  { name: "Fashion jewelry", v: ["9%", "13%"], y: 2.9 },
  { name: "Fine jewelry", v: ["4%", "5%"], y: 3.5 },
  { name: "Total", v: ["4%", "7%"], y: 4.1 },
];
rows.forEach((r) => {
  T(r.name, nx, r.y, nw, 0.5, { valign: "middle" });
  r.v.forEach((v, j) => T(v, j ? c2 : c1, r.y, cw, 0.5, { align: "center" }));
});
slide.addShape("ellipse", { x: c1 + 0.08, y: 3.5 + 0.04, w: cw - 0.16, h: 0.42, fill: { type: "none" }, line: { color: RED, width: 1.5 } });

// ---------- 2a: CTF revenue, two columns with a CAGR callout ----------
T("CTF's annual revenue", RX + 0.35, 1.9, 2.8, 0.26);
T([{ text: "CNY Billion", options: { italic: true } }], RX + 0.35, 2.15, 2.8, 0.26);
const rev = [["2013", 47], ["2018", 48]], rMax = 1.2, rcx = [7.75, 9.0];
rev.forEach(([y, v], i) => {
  const h = (v / 48) * rMax;
  box(rcx[i] - colW / 2, yb - h, colW, h, C.navy);
  T(String(v), rcx[i] - 0.5, yb - h - 0.32, 1.0, 0.28, { align: "center" });
  T(y, rcx[i] - 0.5, yb + 0.06, 1.0, 0.28, { align: "center" });
});
line(7.2, yb, 2.35, 0, C.g4, 0.75);
line(rcx[0] - 0.33, 2.7, rcx[1] - rcx[0] + 0.66, 0, C.text, 1.25, { endArrowType: "triangle" });
slide.addShape("ellipse", { x: (rcx[0] + rcx[1]) / 2 - 0.53, y: 2.52, w: 1.06, h: 0.36, fill: { color: "FFFFFF" }, line: { color: C.text, width: 1 } });
T([{ text: "CAGR 1%", options: { bold: true } }], (rcx[0] + rcx[1]) / 2 - 0.53, 2.52, 1.06, 0.36, { fontSize: 14, align: "center" });

// ---------- 2b: CTF 2018 revenue by segment, one 100% column labelled beside it ----------
T("CTF's 2018 revenue", 10.05, 1.9, 3.0, 0.26);
T([{ text: "by segment, %", options: { italic: true } }], 10.05, 2.15, 3.0, 0.26);
S.shareColumn(slide, {
  parts: [{ label: "Fine jewelry", value: 89, hi: true }, { label: "Fashion jewelry", value: 11 }],
  colors: [LIGHT, C.navy], colW: colW, fontSize: PT / (15 / 12.5),   // txt() scales by the reference's body/working size: lands on 15 pt
  format: (v) => v + "%",
}, { x: 10.1, y: 2.55, w: 2.97, h: 1.97 });
T("2018", 10.15 - 0.34 + colW / 2, yb + 0.06, 1.0, 0.28, { align: "center" });

// ---------- 3: three constraints, icon points in a grey band ----------
const BY = 4.92;
S.subhead(slide, 3, "Major constraints limit the further development of fine jewelry", LX, BY, 13.07 - LX);
const gx = 0.62, gy = 5.38, gw = 13.07 - gx, gh = 1.64, k = 3, w = gw / k;
slide.addShape("rect", { x: gx, y: gy, w: gw, h: gh, fill: { color: C.g1 }, line: { type: "none" } });
const pts = [
  { icon: "users", label: "Customer changing preference", text: "New emerging customers value the fashion design more and show different preference" },
  { icon: "gavel", label: "Tightened anti-corruption policies", text: "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption" },
  { icon: "trending-down", label: "Increasingly fierce competition", text: "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment" },
];
pts.forEach((p, i) => {
  const x = gx + i * w;
  if (i) line(x, gy + 0.15, 0, gh - 0.3, C.g4, 0.75);
  P.icon(slide, p.icon, x + 0.18, gy + 0.15, 0.34, { color: C.g5 });
  T(p.label, x + 0.62, gy + 0.06, w - 0.74, 0.52, { bold: true, color: C.text, fontSize: 15 });
  T([{ text: p.text, options: { italic: true } }], x + 0.62, gy + 0.62, w - 0.74, gh - 0.64, { valign: "top" });
});

// note line above the source, as the deck places it
T([{ text: "Note: *CTF is the abbreviation for Chow Tai Fook", options: { italic: true } }], 0.27, 7.06, 8, 0.2, { fontSize: 10, color: "585858", valign: "top" });

L.save(pres, __dirname + "/candidate.pptx");
