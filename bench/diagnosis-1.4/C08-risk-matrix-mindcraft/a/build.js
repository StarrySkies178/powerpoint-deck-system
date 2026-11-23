// C08 risk matrix, Mindcraft style (deck as reference, leave-one-out).
// Approach: Mindcraft style profile + composeSlide HALF2 with panel boxes taken from Mindcraft slide 14
// (scripts/layout_skeleton.py, the deck's other two-panel slide). Left: 3x3 likelihood x severity heat map with a dashed
// "Top priority" zone and numbered risk dots (riskMatrix only draws a 2x2, so the 3x3 grid is drawn here in the
// generator's manner). Right: native table Risks | Solutions, header in the deck's table style (Mindcraft slide 7),
// [Avoid]/[Mitigate] tags in the main colour as the deck tags [Aim]/[How] (Mindcraft slide 8).
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));
const { pres, slide, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion",
});
const C = P.C, FONT = P.THEME.bodyFontFace;
const RED = C.navy;            // main colour of the profile (C00000)
const T = (s, x, y, w, h, o = {}) => slide.addText(s, { x, y, w, h, fontFace: FONT, fontSize: 12, color: C.text, margin: 0, isTextBox: true, valign: "middle", ...o });

// ---------- tracker: the deck's own form (bold italic items in fixed slots, red triangles between, current item red).
// The generator's crumbLine writes one run with grey separators and no italic, so it is drawn here (Mindcraft slides 7, 8, 12, 14).
[["Market Analysis", 0.36, false], ["Growth Strategy", 2.9, false], ["Risk & Mitigation", 5.57, true]].forEach(([t, x, on], i) => {
  T(t, x, 0.05, 2.3, 0.3, { fontSize: 14, bold: true, italic: true, color: on ? RED : "A6A6A6", valign: "top" });
  if (i) slide.addShape("triangle", { x: [2.43, 5.18][i - 1], y: 0.08, w: 0.2, h: 0.22, rotate: 90, fill: { color: RED }, line: { type: "none" } });
});

// ---------- panel 1: risk heat map ----------
function heatMap(sl, b) {
  const lab = 0.95, ax = b.x + lab, aw = b.w - lab - 0.05, legendH = 0.35, ah = b.h - 0.62 - legendH, ay = b.y + 0.08;
  const cw = aw / 3, ch = ah / 3;
  // shade by likelihood x severity score (2..6): light grey -> darker grey, the deck's neutrals
  const shade = (li, si) => { const s = li + si; return s >= 3 ? "A6A6A6" : s === 2 ? "D5D5D5" : "F1F1F1"; };
  for (let li = 0; li < 3; li++) for (let si = 0; si < 3; si++) {
    sl.addShape("rect", { x: ax + si * cw, y: ay + (2 - li) * ch, w: cw, h: ch, fill: { color: shade(li, si) }, line: { color: "FFFFFF", width: 2 } });
  }
  // axes labels
  const lv = ["Low", "Medium", "High"];
  lv.forEach((t, i) => {
    T(t, ax - 0.75, ay + (2 - i) * ch, 0.7, ch, { align: "right", fontSize: 12 });
    T(t, ax + i * cw, ay + ah + 0.04, cw, 0.28, { align: "center", fontSize: 12 });
  });
  T("Likelihood", b.x - 0.05 - ah / 2 + 0.15, ay + ah / 2 - 0.15, ah, 0.3, { align: "center", bold: true, italic: true, rotate: 270 });
  T("Severity", ax, ay + ah + 0.3, aw, 0.28, { align: "center", bold: true, italic: true });
  sl.addShape("line", { x: ax, y: ay + ah, w: aw, h: 0, line: { color: "000000", width: 1, endArrowType: "triangle" } });
  sl.addShape("line", { x: ax, y: ay, w: 0, h: ah, line: { color: "000000", width: 1, beginArrowType: "triangle" } });
  // top priority zone: high severity x medium/high likelihood
  const zx = ax + 2 * cw + 0.05, zy = ay + 0.05, zw = cw - 0.1, zh = 2 * ch - 0.1;
  sl.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: RED, width: 1.75, dashType: "dash" } });
  T("Top priority", zx + 0.05, zy + 0.04, zw - 0.1, 0.3, { align: "center", bold: true, italic: true, color: RED });
  // risks: [id, likelihood 0-2, severity 0-2, name]
  const d = 0.42;
  const dot = (id, cx, cy, hot) => {
    sl.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : "5C5C5C" }, line: { color: "FFFFFF", width: 1 } });
    T(String(id), cx - d / 2, cy - d / 2, d, d, { align: "center", bold: true, color: "FFFFFF", fontSize: 14 });
  };
  const cell = (li, si) => ({ x: ax + si * cw, y: ay + (2 - li) * ch });
  // in the zone: two dots side by side per cell
  [[1, 2, 2], [2, 2, 2], [3, 1, 2], [4, 1, 2]].forEach(([id, li, si], k) => {
    const c = cell(li, si), off = (k % 2 ? 1 : -1) * 0.3;
    dot(id, c.x + cw / 2 + off, c.y + ch / 2 + (li === 2 ? 0.12 : 0), true);
  });
  // the other risks: dot with its name under it
  [[5, 0, 2, "Customer information safety"], [6, 2, 0, "Competitor's response"], [7, 0, 1, "Customer preference change"], [8, 1, 0, "Cannibalization"]].forEach(([id, li, si, name]) => {
    const c = cell(li, si);
    dot(id, c.x + cw / 2, c.y + 0.12 + d / 2, false);
    T(name, c.x + 0.06, c.y + 0.16 + d, cw - 0.12, ch - d - 0.22, { align: "center", valign: "top", fontSize: 11 });
  });
  // legend
  const ly = b.y + b.h - legendH + 0.05, lx = b.x + lab;
  sl.addShape("ellipse", { x: lx, y: ly + 0.07, w: 0.18, h: 0.18, fill: { color: RED }, line: { type: "none" } });
  T("Important risk, see solutions", lx + 0.25, ly, 2.6, 0.32, { fontSize: 11 });
  sl.addShape("ellipse", { x: lx + 2.95, y: ly + 0.07, w: 0.18, h: 0.18, fill: { color: "5C5C5C" }, line: { type: "none" } });
  T("Risk to monitor", lx + 3.2, ly, 1.8, 0.32, { fontSize: 11 });
}

// ---------- panel 2: Risks | Solutions table ----------
const RISKS = [
  ["Internal resistance", "Changes in functions and work relationships cause anger and panic",
    "Strengthen internal communication and provide employee training", "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
  ["Talent management", "Insufficient supply of trained salespersons for rapid expansion",
    "Make recruitment plan in advance", "Reduce labor demand with technology"],
  ["Supply chain mgmt.", "Rapid store expansion requires agile logistics",
    "Optimize logistics network", "Find reliable third-party logistic partner"],
  ["IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
];
function solutionsTable(sl, b) {
  const pt = 12, nw = 0.5, rw = 2.3, hh = 0.38;
  const colW = [nw, rw, b.w - nw - rw];
  const rowH = [1.32, 0.95, 0.85, 1.25];
  const scale = Math.min(1, (b.h - hh) / rowH.reduce((a, c) => a + c, 0));
  const rh = rowH.map((h) => h * scale);
  const hdr = (t) => ({ text: t, options: { bold: true, italic: true, color: "000000", border: [{ type: "none" }, { type: "none" }, { type: "solid", color: "000000", pt: 1 }, { type: "none" }] } });
  const rows = [[hdr(""), hdr("Risks"), hdr("Solutions")]];
  RISKS.forEach(([name, desc, avoid, mitigate], i) => {
    const fill = { color: i % 2 ? "F1F1F1" : "FFFFFF" }, border = [{ type: "none" }, { type: "none" }, { type: "solid", color: "FFFFFF", pt: 1 }, { type: "none" }];
    rows.push([
      { text: "", options: { fill, border } },
      { text: [{ text: name, options: { bold: true, breakLine: true } }, { text: desc, options: {} }], options: { fill, border } },
      { text: [{ text: "[Avoid] ", options: { bold: true, color: RED } }, { text: avoid, options: { breakLine: true } },
               { text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: mitigate, options: {} }], options: { fill, border } },
    ]);
  });
  sl.addTable(rows, { x: b.x, y: b.y, w: b.w, colW, rowH: [hh, ...rh], h: hh + rh.reduce((a, c) => a + c, 0), fontFace: FONT, fontSize: pt, color: C.text, valign: "middle", margin: [0.04, 0.06, 0.04, 0.06] });
  // risk number chips in the first column, same numbers and colour as on the heat map
  let y = b.y + hh; const d = 0.36;
  rh.forEach((h, i) => {
    sl.addShape("ellipse", { x: b.x + (nw - d) / 2, y: y + (h - d) / 2, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
    T(String(i + 1), b.x + (nw - d) / 2, y + (h - d) / 2, d, d, { align: "center", bold: true, color: "FFFFFF", fontSize: 13 });
    y += h;
  });
}

const regions = [{ x: 0.36, y: 1.37, w: 6.02, h: 5.4 }, { x: 6.66, y: 1.37, w: 6.35, h: 5.4 }];   // Mindcraft slide 14 (HALF2)
S.composeSlide(pres, slide, { regions, panels: [
  { headline: "Risk mapping", draw: heatMap },
  { headline: "Solutions for important risks", draw: solutionsTable },
] });
// source line in italics, as the deck writes it (the frame's source option writes it upright)
slide.addText([{ text: "Source: MindCraft Analysis", options: { italic: true } }], { placeholder: "source" });
// deck frame: thin grey rule above the source line, as on every Mindcraft content slide
slide.addShape("line", { x: 0, y: 7.2, w: 13.333, h: 0, line: { color: "D5D5D5", width: 0.75 } });
L.save(pres, __dirname + "/candidate.pptx");
