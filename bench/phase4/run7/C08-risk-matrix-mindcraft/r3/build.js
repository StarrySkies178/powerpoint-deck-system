// C08 risk matrix, Mindcraft deck as the style reference (deck-as-reference, leave-one-out).
// Layout: HALF2-like split as on the deck's other two-panel slides (numbered panel heads, grey rule):
// panel 1 = risk heat map drawn the way the case decks draw it (S.riskHeatMap), panel 2 = a ruled table
// Risks | Solutions (Avoid / Mitigate), numbered with the same chips as the map.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, B, P, S, HOUSE } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion",
  source: "Source: MindCraft Analysis",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], current: 2, sep: "   ▶   " },
});
const C = P.C, FONT = P.THEME.bodyFontFace, pt = Math.max(12, (L.HOUSE.STYLE && L.HOUSE.STYLE.body.label_pt) || 12);

const gap = 0.35, lw = 5.05;
const left = { x: B.x, y: B.y, w: lw, h: B.h }, right = { x: B.x + lw + gap, y: B.y, w: B.w - lw - gap, h: B.h };

// ---------- panel 1: risk mapping ----------
let y = left.y + S.subhead(slide, 1, "Risk mapping", left.x, left.y, left.w);
const lo = 1 / 6, mid = 0.5, hi = 5 / 6;
const readH = 0.95, map = { x: left.x, y, w: left.w, h: left.y + left.h - y - readH - 0.12 };
S.riskHeatMap(slide, {
  levels: ["Low", "Medium", "High"], x: { label: "Severity" }, y: { label: "Likelihood" }, fontSize: pt,
  zone: { x0: 2 / 3, x1: 1, y0: 1 / 3, y1: 1, label: "Top priority" },
  risks: [
    { id: 1, x: 0.76, y: 0.76, hot: true },
    { id: 2, x: 0.91, y: 0.76, hot: true },
    { id: 3, x: 0.76, y: 0.46, hot: true },
    { id: 4, x: 0.91, y: 0.46, hot: true },
    { id: 5, x: 0.83, y: 0.24, hot: false },
    { id: 6, x: 0.08, y: hi, name: "Competitor's response", hot: false },
    { id: 7, x: 0.56, y: 0.17, hot: false },
    { id: 8, x: 0.08, y: mid, name: "Cannibalization", hot: false },
  ],
}, map);
// names of 5 and 7 drawn here with room for three lines (the generator's label box holds two)
{ const lh = (pt / 72) * 1.5, ax = map.x + 2 * lh + 0.25, ay = map.y + 0.05, aw = map.w - 2 * lh - 0.3, ah = map.h - 2 * lh - 0.25, d = Math.max(0.3, (pt / 72) * 2.1);
  const th = 3 * (pt * 1.25) / 72 + 0.04, nm = (t, x, y, w, al) => slide.addText(t, { x, y, w, h: th, fontFace: FONT, fontSize: pt, italic: true, color: C.text, align: al, valign: "middle", margin: 0 });
  const P5 = [ax + 0.83 * aw, ay + (1 - 0.24) * ah], P7 = [ax + 0.56 * aw, ay + (1 - 0.17) * ah];
  nm("Customer information safety", P5[0] - 0.8, P5[1] + d / 2 + 0.01, 1.6, "center");
  nm("Customer preference change", P7[0] - d / 2 - 0.05 - 1.6, P7[1] - th / 2 - 0.12, 1.6, "right"); }
S.readingBox(slide, [
  "Risks **1 to 4** combine **high severity** with medium to high likelihood and need preparation now",
  "Risks 5 to 8 are less likely or less severe and are monitored",
], { x: left.x, y: left.y + left.h - readH, w: left.w, h: readH });

// ---------- panel 2: solutions for important risks ----------
let ry = right.y + S.subhead(slide, 2, "Solutions for important risks", right.x, right.y, right.w);
const rows = [
  ["Internal resistance", "Changes in functions and work relationships cause anger and panic",
    "Strengthen internal communication and provide employee training",
    "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
  ["Talent management", "Insufficient supply of trained salespersons for rapid expansion",
    "Make recruitment plan in advance", "Reduce labor demand with technology"],
  ["Supply chain mgmt.", "Rapid store expansion requires agile logistics",
    "Optimize logistics network", "Find reliable third-party logistic partner"],
  ["IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
];
const tw = right.w, cw = [0.42, 2.5, (tw - 2.92) / 2, (tw - 2.92) / 2];
const none = { type: "none" }, rule = (c, w) => ({ type: "solid", color: c, pt: w });
const hOpt = (extra) => ({ italic: true, bold: true, color: C.text, align: "left", valign: "bottom", border: [none, none, rule(C.text, 1), none], ...extra });
const head1 = [
  { text: "", options: hOpt({ rowspan: 2 }) },
  { text: "Risks", options: hOpt({ rowspan: 2 }) },
  { text: "Solutions", options: hOpt({ colspan: 2, align: "center", border: [none, none, rule(C.g3, 0.75), none] }) },
];
const head2 = [
  { text: "Avoid", options: hOpt({ align: "left" }) },
  { text: "Mitigate", options: hOpt({ align: "left" }) },
];
const hdrH = [0.36, 0.36];
const body = rows.map((r, i) => {
  const b = [none, none, i < rows.length - 1 ? rule(C.g2, 0.75) : rule(C.text, 1), none];
  return [
    { text: "", options: { border: b } },
    { text: [{ text: r[0], options: { bold: true, breakLine: true } }, { text: r[1] }], options: { valign: "middle", border: b } },
    { text: r[2], options: { valign: "middle", border: b } },
    { text: r[3], options: { valign: "middle", border: b } },
  ];
});
const avail = right.y + right.h - ry - hdrH[0] - hdrH[1];
const need = rows.map((r) => {                                       // lines per row at pt in Verdana (~0.6 em per char)
  const lines = (t, w) => Math.ceil((t.length * pt * 0.6) / ((w - 0.16) * 72));
  const n = Math.max(1 + lines(r[1], cw[1]), lines(r[2], cw[2]), lines(r[3], cw[3]));
  return n * (pt * 1.2) / 72 + 0.16;
});
const k = avail / need.reduce((a, b) => a + b, 0), rH = need.map((h) => h * k);
slide.addTable([head1, head2, ...body], { x: right.x, y: ry, w: tw, colW: cw, rowH: [...hdrH, ...rH], fontFace: FONT, fontSize: pt, color: C.text,
  margin: [0.04, 0.08, 0.04, 0.08], valign: "middle", autoPage: false });
let yy = ry + hdrH[0] + hdrH[1];
rH.forEach((h, i) => {                                             // the same numbered chips as on the map
  const s = 0.34;
  slide.addShape("ellipse", { x: right.x + 0.02, y: yy + h / 2 - s / 2, w: s, h: s, fill: { color: C.accent }, line: { color: "FFFFFF", width: 1.25 } });
  slide.addText(String(i + 1), { x: right.x + 0.02, y: yy + h / 2 - s / 2, w: s, h: s, fontFace: FONT, fontSize: pt, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  yy += h;
});

L.save(pres, __dirname + "/candidate.pptx");
