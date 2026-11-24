// C08 rebuild (run7 r1): risk heat map + solutions table, in the style of Case-2019-Mindcraft (deck as reference).
// Layout: two numbered panels side by side (HALF2 family, as the deck's two-panel analysis slides), the map narrower and
// the table wider because the table carries the words. Map drawn with S.riskHeatMap (DECK-SYSTEM 3: a risk map is a
// shaded heat map with each risk placed by position, dashed box over the priority corner); the table is drawn as the
// deck's own text tables are (italic bold grey headers over a black rule, dashed grey row rules, [label] runs in the main
// colour, as on the deck's strategy matrix), with the same risk numbers as the map.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, B, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion",
  source: "Source: MindCraft Analysis",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], current: 2 },
});
const C = P.C, PT = 14, LBL = 12;
const gap = 0.35, lw = 4.45;
const left = { x: B.x, y: B.y, w: lw, h: B.h }, right = { x: B.x + lw + gap, y: B.y, w: B.w - lw - gap, h: B.h };

// ---------- 1 Risk mapping ----------
let y1 = left.y + S.subhead(slide, 1, "Risk mapping", left.x, left.y, left.w);
const rd = 1.05;   // reading box under the map
const H = 0.833, M = 0.5, Lo = 0.167;
const mapBox = { x: left.x, y: y1 + 0.05, w: left.w, h: left.y + left.h - y1 - rd - 0.2 };
S.riskHeatMap(slide, {
  levels: ["Low", "Medium", "High"], fontSize: LBL,
  x: { label: "Severity" }, y: { label: "Likelihood" },
  zone: { x0: 2 / 3, x1: 1, y0: 1 / 3, y1: 1 },
  risks: [
    { id: 1, x: H - 0.09, y: H - 0.04 }, { id: 2, x: H + 0.09, y: H - 0.04 },
    { id: 3, x: H - 0.09, y: M - 0.04 }, { id: 4, x: H + 0.09, y: M - 0.04 },
    { id: 5, x: H + 0.1, y: Lo },
    { id: 6, x: Lo - 0.1, y: H + 0.04, name: "Competitor's response" },
    { id: 7, x: M - 0.12, y: Lo },
    { id: 8, x: Lo - 0.1, y: M + 0.04, name: "Cannibalization" },
  ],
}, mapBox);
// risks 5 and 7 share the low-likelihood row: their names are set by hand (5 to the left of its marker, 7 in the empty
// low/low cell), so the two names never run into each other
{ const lh = (LBL / 72) * 1.5, ax = mapBox.x + 2 * lh + 0.25, ay = mapBox.y + 0.05, aw = mapBox.w - (ax - mapBox.x) - 0.05, ah = mapBox.h - 2 * lh - 0.25;
  const X = (v) => ax + v * aw, Y = (v) => ay + (1 - v) * ah, d = Math.max(0.3, (LBL / 72) * 2.1), nh = 3 * (LBL * 1.125 / 72) * 1.25;
  const lab = (t, x, w, y) => P.txt(slide, [{ text: t, options: { italic: true } }], x, y - nh / 2, w, nh, { fontSize: LBL, color: C.text, align: "right", valign: "middle", margin: 0 });
  // the zone's name on two lines in the top corner of the dashed box (the generator's one-line box is too short for it here)
  P.txt(slide, [{ text: "Top priority", options: { italic: true, bold: true } }], X(2 / 3) + 0.06, ay + 0.03, aw / 3 - 0.1, 2 * lh, { fontSize: LBL, color: "FFFFFF", valign: "top", margin: 0, onDark: true });
  lab("Customer information safety", X(H + 0.1) - d / 2 - 1.35, 1.3, Y(Lo));
  lab("Customer preference change", ax + 0.04, X(M - 0.12) - d / 2 - ax - 0.08, Y(Lo)); }
S.readingBox(slide, [
  "Risks **1–4** sit in the **top-priority** zone: high severity, medium to high likelihood",
  "Risks 5–8 are either unlikely or of low severity",
], { x: left.x, y: left.y + left.h - rd, w: left.w, h: rd }, { size: LBL });

// ---------- 2 Solutions for important risks ----------
const y2 = right.y + S.subhead(slide, 2, "Solutions for important risks", right.x, right.y, right.w);
const rows = [
  ["Internal resistance", "Changes in functions and work relationships cause anger and panic",
    "Strengthen internal communication and provide employee training", "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
  ["Talent management", "Insufficient supply of trained salespersons for rapid expansion",
    "Make recruitment plan in advance", "Reduce labor demand with technology"],
  ["Supply chain mgmt.", "Rapid store expansion requires agile logistics",
    "Optimize logistics network", "Find reliable third-party logistic partner"],
  ["IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
];
const none = { type: "none" }, hdrRule = { type: "solid", color: "000000", pt: 1 }, rowRule = { type: "dash", color: C.g2, pt: 0.75 };
const head = (t) => ({ text: t, options: { bold: true, italic: true, color: C.g4, valign: "bottom", border: [none, none, hdrRule, none] } });
const body = rows.map(([name, desc, avoid, mitigate], i) => {
  const b = i < rows.length - 1 ? rowRule : none;
  return [
    { text: String(i + 1), options: { bold: true, color: "FFFFFF", fill: { color: C.accent }, align: "center", valign: "middle", border: [none, { type: "solid", color: "FFFFFF", pt: 6 }, b, none] } },
    { text: [{ text: name, options: { bold: true, breakLine: true } }, { text: desc }], options: { valign: "middle", border: [none, none, b, none] } },
    { text: [{ text: "[Avoid] ", options: { bold: true, color: C.navy } }, { text: avoid, options: { breakLine: true } },
             { text: "[Mitigate] ", options: { bold: true, color: C.navy } }, { text: mitigate }], options: { valign: "middle", border: [none, none, b, none] } },
  ];
});
const tw = right.w, colW = [0.36, 2.95, tw - 0.36 - 2.95], hH = 0.42, th = right.y + right.h - y2 - 0.05;
const rH = [1.35, 1.0, 0.85, 1.3], k = (th - hH) / rH.reduce((a, b) => a + b, 0);
slide.addTable([[{ text: "", options: { border: [none, none, hdrRule, none] } }, head("Risks"), head("Solutions")], ...body], {
  x: right.x, y: y2 + 0.05, w: tw, colW, rowH: [hH, ...rH.map((h) => h * k)], fontFace: P.THEME.bodyFontFace, fontSize: PT,
  color: C.text, margin: [0.04, 0.08, 0.04, 0.08], valign: "middle", autoPage: false,
});

L.save(pres, __dirname + "/candidate.pptx");
