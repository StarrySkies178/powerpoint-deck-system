// C08 risk matrix in the Mindcraft style (deck as reference, leave-one-out).
// Layout: HALF2 as the deck's two-panel slides draw it (panel boxes from Mindcraft slide 14 via scripts/layout_skeleton.py,
// left panel narrowed so the solutions table gets room). Panel 1: S.riskHeatMap (numbered heat map, dashed priority zone)
// with a grey reading box under it (Mindcraft 14 readings). Panel 2: risks -> solutions in the deck's own row form with
// red bracket labels ([Aim]/[How] rows of Mindcraft 8 panel 1, here [Avoid]/[Mitigate]); the same numbered markers as the map.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
const { pres, slide, P, S, prof } = L.start({
  ref: "Case-2019-Mindcraft",
  title: TITLE,
  source: "Source: MindCraft Analysis",
});
// section tracker as the deck draws it (Mindcraft 8, 10, 14): bold italic 14 pt, past sections grey, current red, red triangles
{ const cs = prof.crumb, items = ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], runs = [];
  items.forEach((t, i) => { if (i) runs.push({ text: "   \u25B6   ", options: { color: prof.roles.main } });
    runs.push({ text: t, options: { color: i === items.length - 1 ? prof.roles.main : prof.roles.grey4 } }); });
  slide.addText(runs, { x: cs.x, y: cs.y, w: 9, h: 0.3, fontFace: prof.fonts.latin, fontSize: cs.pt, bold: true, italic: true, margin: 0, valign: "top" }); }
const C = P.C, pt = prof.body.label_pt, bt = prof.body.pt;   // 12 pt labels on the map; 14 pt body (table text, reading), the deck's sizes
const TOP = 1.37, BOT = 7.08, GAP = 0.3;
const left = { x: 0.36, y: TOP, w: 4.0, h: BOT - TOP };
const right = { x: left.x + left.w + GAP, y: TOP, w: 13.01 - (left.x + left.w + GAP), h: BOT - TOP };
const lineH = (p) => (p * 1.2) / 72;
const em = 0.57;                                   // Verdana: ~0.57 em a character on average
const nLines = (t, wIn, p = bt) => {               // lines a text needs at p pt in a column wIn wide (word wrap)
  const cap = (wIn * 72) / (p * em); let n = 1, cur = 0;
  for (const w of String(t).split(/\s+/)) { const l = w.length + (cur ? 1 : 0); if (cur + l > cap && cur) { n++; cur = w.length; } else cur += l; }
  return n;
};

// ---------- panel 1: risk mapping ----------
let y = left.y + S.subhead(slide, 1, "Risk mapping", left.x, left.y, left.w);
const reading = [
  "**Risks 1 to 4** need mitigation now",
  "Risks 5 to 8 are **monitored**",
];
const rdH = 0.2 + reading.reduce((a, t) => a + nLines(t.replace(/\*\*/g, ""), left.w - 0.45, bt), 0) * lineH(bt) * 1.08;
const zl = 0.3;                                    // room above the map for the zone's name (a 1/3-wide zone is too narrow to hold it)
const mapBox = { x: left.x, y: y + 0.05 + zl, w: left.w, h: BOT - rdH - 0.15 - (y + 0.05 + zl) };
{ const ax = mapBox.x + 2 * (pt / 72) * 1.5 + 0.25, aw = mapBox.w - (ax - mapBox.x) - 0.05;   // riskHeatMap's own plot box
  P.txt(slide, "Top priority", ax + aw - 2.5, mapBox.y - zl, 2.5, zl - 0.02, { fontSize: pt, bold: true, italic: true, color: C.accent, align: "right", valign: "bottom", margin: 0, noScale: true }); }
S.riskHeatMap(slide, {
  levels: ["Low", "Medium", "High"],
  x: { label: "Severity" }, y: { label: "Likelihood" },
  fontSize: pt,
  zone: { x0: 2 / 3, x1: 1, y0: 1 / 3, y1: 1 },
  risks: [
    { id: 1, x: 0.76, y: 0.8 },
    { id: 2, x: 0.91, y: 0.8 },
    { id: 3, x: 0.76, y: 0.5 },
    { id: 4, x: 0.91, y: 0.5 },
    { id: 5, x: 0.92, y: 0.25, name: "Customer information safety" },
    { id: 6, x: 0.09, y: 0.83, name: "Competitor's response" },
    { id: 7, x: 0.6, y: 0.09, name: "Customer preference change" },
    { id: 8, x: 0.09, y: 0.5, name: "Cannibalization" },
  ],
}, mapBox);
S.readingBox(slide, reading, { x: left.x, y: BOT - rdH, w: left.w, h: rdH }, { size: bt });

// ---------- panel 2: solutions for important risks ----------
y = right.y + S.subhead(slide, 2, "Solutions for important risks", right.x, right.y, right.w);
const risks = [
  { name: "Internal resistance", text: "Changes in functions and work relationships cause anger and panic",
    avoid: "Strengthen internal communication and provide employee training",
    mitigate: "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary" },
  { name: "Talent management", text: "Insufficient supply of trained salespersons for rapid expansion",
    avoid: "Make recruitment plan in advance", mitigate: "Reduce labor demand with technology" },
  { name: "Supply chain mgmt.", text: "Rapid store expansion requires agile logistics",
    avoid: "Optimize logistics network", mitigate: "Find reliable third-party logistic partner" },
  { name: "IT system upgrade", text: "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    avoid: "Make upgrade plan in advance; careful selection of new system supplier", mitigate: "Hire external technology experts for help" },
];
const d = 0.3, cRisk = 3.3, xS = right.x + cRisk + 0.15, wSol = right.x + right.w - xS, wRiskTxt = cRisk - d - 0.12, xR = right.x + d + 0.12;
// header row: bold italic column names over a black rule (Mindcraft 8 and 10)
const hH = 0.3;
P.txt(slide, "Risks", xR, y, wRiskTxt, hH, { fontSize: bt, italic: true, bold: true, color: C.text, valign: "bottom", margin: 0, noScale: true });
P.txt(slide, "Solutions", xS, y, wSol, hH, { fontSize: bt, italic: true, bold: true, color: C.text, valign: "bottom", margin: 0, noScale: true });
y += hH + 0.04;
slide.addShape("line", { x: right.x, y, w: right.w, h: 0, line: { color: C.text, width: 1 } });
y += 0.05;
// row heights from their text (14 pt, never shrunk); spare room goes to the padding
const lh = lineH(bt), inner = 0.06, wT = wSol - 0.16;
const need = risks.map((r) => {
  const riskL = nLines(r.name + ": " + r.text, wRiskTxt), avL = nLines("[Avoid] " + r.avoid, wT), miL = nLines("[Mitigate] " + r.mitigate, wT);
  return { avL, miL, h: Math.max(riskL * lh, (avL + miL) * lh + inner + 0.08) };
});
const sep = 0.08, room = BOT - y - sep * (risks.length - 1), used = need.reduce((a, b) => a + b.h, 0);
const pad = Math.max(0.02, Math.min(0.12, (room - used) / (2 * risks.length)));
if (used + 2 * pad * risks.length > room + 0.02) console.warn(`solutions table needs ${(used + 2 * pad * risks.length).toFixed(2)} in, room ${room.toFixed(2)} in`);
risks.forEach((r, i) => {
  const n = need[i], h = n.h + 2 * pad;
  // the same red numbered marker as on the map
  slide.addShape("ellipse", { x: right.x, y: y + pad, w: d, h: d, fill: { color: C.accent }, line: { color: "FFFFFF", width: 1.25 } });
  P.txt(slide, String(i + 1), right.x, y + pad, d, d, { fontSize: pt, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, noScale: true });
  P.txt(slide, [{ text: r.name + ": ", options: { bold: true } }, { text: r.text, options: {} }], xR, y + pad, wRiskTxt, h - 2 * pad,
    { fontSize: bt, color: C.text, valign: "top", margin: 0, noScale: true });
  // [Avoid] on the grey band in italics, [Mitigate] plain: the red bracket labels of Mindcraft 8 ([Aim]/[How])
  const sh = h - 2 * pad, hA = n.avL * lh + 0.08 + (sh - n.h) / 2, hM = sh - hA - inner;
  [["[Avoid] ", r.avoid, y + pad, hA, true], ["[Mitigate] ", r.mitigate, y + pad + hA + inner, hM, false]].forEach(([lab, t, ry, rh, grey]) => {
    if (grey) slide.addShape("rect", { x: xS, y: ry, w: wSol, h: rh, fill: { color: C.g1 }, line: { type: "none" } });
    P.txt(slide, [{ text: lab, options: { bold: true, italic: false, color: C.accent } }, { text: t, options: { italic: grey } }], xS + 0.08, ry, wT, rh,
      { fontSize: bt, color: C.text, valign: "middle", margin: 0, noScale: true, onDark: true });
  });
  y += h;
  if (i < risks.length - 1) {
    slide.addShape("line", { x: right.x, y: y + sep / 2, w: right.w, h: 0, line: { color: C.g4, width: 0.75, dashType: "sysDot" } });
    y += sep;
  }
});

L.save(pres, __dirname + "/candidate.pptx");
