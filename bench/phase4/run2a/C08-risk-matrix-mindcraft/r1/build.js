// C08 risk matrix, deck as reference (Case-2019-Mindcraft), leave-one-out build.
// Layout: HALF2 as on the deck's other two-panel slides (financial forecasting / strategy overview pages):
// numbered red-chip panel heads over a grey rule, panel 1 = risk heat map, panel 2 = risk -> solution table
// in the deck's own matrix form ([Aim]/[How] tags in red bold, grey cell on the first line, dashed row rules).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion",
  source: "Source: MindCraft Analysis",
});
const C = P.C, F = "Verdana";
// local text helper: fixed size (no fit-shrink), italic allowed, reference font
const txt = (sl, text, x, y, w, h, o = {}) => sl.addText(text, { x, y, w, h, fontFace: F, fontSize: o.fontSize || 12, color: o.color || "000000",
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0.04, rotate: o.rotate, isTextBox: true });
const RED = "C00000", DARK = "5C5C5C", MID = "A6A6A6", LIGHT = "D5D5D5", PANEL = "F1F1F1", RULE = "7E7E7E";
const PT = 12, TT = 13;    // heat-map labels at the label size; table text at 13 pt (body 14 pt, lint floor 13)
// breadcrumb as the deck draws it: bold italic 14 pt, past sections grey, current red, red triangles between
[["Market Analysis", 0.36, false], ["Growth Strategy", 2.88, false], ["Risk & Mitigation", 5.56, true]].forEach(([t, x, cur], i) => {
  txt(slide, t, x, 0.05, 3.2, 0.3, { fontSize: 14, bold: true, italic: true, color: cur ? RED : MID, valign: "middle", margin: 0 });
  if (i) slide.addShape("triangle", { x: x - 0.42, y: 0.09, w: 0.22, h: 0.22, rotate: 90, fill: { color: RED }, line: { type: "none" } });
});
// footer rule above the source line, as on every content page of the deck
slide.addShape("line", { x: 0, y: 7.2, w: 13.333, h: 0, line: { color: "BFBFBF", width: 0.75 } });
// table cells and labels: the profile's label size (body 14 pt)

// rough Verdana line count at a size (avg glyph ~0.6 em)
const lines = (t, wIn, pt = PT) => String(t).split("\n").reduce((a, para) => {
  const cpl = Math.max(1, Math.floor((wIn * 72) / (pt * 0.54))); let n = 1, cur = 0;
  for (const w of para.split(/\s+/)) { const l = w.length + 1; if (cur + l > cpl) { n++; cur = l; } else cur += l; }
  return a + n; }, 0);
const lh = (pt = PT) => (pt * 1.2) / 72;

// ---------------- panel 1: risk mapping (likelihood x severity heat map) ----------------
function heatMap(sl, b) {
  const ax = b.x + 0.98, ay = b.y + 0.1, aw = b.w - ax + b.x - 0.05, ah = b.h - 0.85, cw = aw / 3, ch = ah / 3;
  const lv = ["Low", "Medium", "High"];
  // cells: grey deepens toward high likelihood / high severity
  const shade = (i, j) => [PANEL, PANEL, LIGHT, MID, MID][i + j];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)          // i = severity col, j = likelihood row (0 = low)
    sl.addShape("rect", { x: ax + i * cw, y: ay + (2 - j) * ch, w: cw, h: ch, fill: { color: shade(i, j) }, line: { color: "FFFFFF", width: 2 } });
  // axes
  sl.addShape("line", { x: ax, y: ay + ah, w: aw, h: 0, line: { color: "000000", width: 1, endArrowType: "triangle" } });
  sl.addShape("line", { x: ax, y: ay, w: 0, h: ah, line: { color: "000000", width: 1, beginArrowType: "triangle" } });
  lv.forEach((t, i) => {
    txt(sl, t, ax + i * cw, ay + ah + 0.04, cw, 0.3, { fontSize: PT, keepSize: true, italic: true, align: "center", margin: 0 });
    txt(sl, t, b.x + 0.24, ay + (2 - i) * ch, 0.7, ch, { fontSize: PT, keepSize: true, align: "right", valign: "middle", margin: 0 });
  });
  txt(sl, "Severity", ax, ay + ah + 0.36, aw, 0.32, { fontSize: PT, keepSize: true, bold: true, align: "center", margin: 0 });
  txt(sl, "Likelihood", b.x - ch * 1.5 + 0.16, ay + ah / 2 - 0.16, ch * 3, 0.32, { fontSize: PT, keepSize: true, bold: true, align: "center", rotate: 270, margin: 0 });
  // top-priority zone: medium & high likelihood x high severity, dashed red frame as the deck's callouts
  const zx = ax + 2 * cw + 0.05, zy = ay + 0.05, zw = cw - 0.1, zh = 2 * ch - 0.1;
  sl.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: RED, width: 1.5, dashType: "dash" } });
  txt(sl, "Top priority", zx, zy + 0.06, zw, 0.3, { fontSize: PT, keepSize: true, bold: true, color: RED, align: "center", margin: 0 });
  // risks: priority ones in red, numbers only (named in panel 2); the others grey with their name
  const d = 0.42;
  const dot = (cx, cy, n, hot) => {
    sl.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : DARK }, line: { color: "FFFFFF", width: 1 } });
    txt(sl, String(n), cx - d / 2, cy - d / 2, d, d, { fontSize: 14, keepSize: true, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  };
  const cell = (i, j) => ({ x: ax + i * cw, y: ay + (2 - j) * ch });
  // high/high: 1, 2 ; medium/high: 3, 4
  [[1, 2, 2], [3, 4, 1]].forEach(([a, c2, j]) => { const p = cell(2, j), cy = p.y + ch / 2 + 0.16;
    dot(p.x + cw / 2 - 0.3, cy, a, true); dot(p.x + cw / 2 + 0.3, cy, c2, true); });
  [[6, "Competitor's response", 0, 2], [8, "Cannibali-zation", 0, 1], [7, "Customer preference change", 1, 0], [5, "Customer information safety", 2, 0]]
    .forEach(([n, name, i, j]) => { const p = cell(i, j);
      dot(p.x + cw / 2, p.y + 0.12 + d / 2, n, false);
      txt(sl, name.replace("-", "­"), p.x + 0.01, p.y + 0.18 + d, cw - 0.02, ch - d - 0.22, { fontSize: PT, keepSize: true, align: "center", valign: "top", margin: 0 }); });
}

// ---------------- panel 2: solutions for important risks (deck's matrix form) ----------------
const ROWS = [
  { n: 1, name: "Internal resistance", desc: "Changes in functions and work relationships cause anger and panic",
    avoid: "Strengthen internal communication and provide employee training", mitigate: "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary" },
  { n: 2, name: "Talent management", desc: "Insufficient supply of trained salespersons for rapid expansion",
    avoid: "Make recruitment plan in advance", mitigate: "Reduce labor demand with technology" },
  { n: 3, name: "Supply chain mgmt.", desc: "Rapid store expansion requires agile logistics",
    avoid: "Optimize logistics network", mitigate: "Find reliable third-party logistic partner" },
  { n: 4, name: "IT system upgrade", desc: "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    avoid: "Make upgrade plan in advance; careful selection of new system supplier", mitigate: "Hire external technology experts for help" },
];
function solutions(sl, b) {
  const c1 = 3.05, tagW = 1.05, x2 = b.x + c1 + 0.1, tx = x2 + tagW, tw = b.x + b.w - tx, hh = 0.38, pad = 0.06;
  txt(sl, "Risks", b.x + 0.5, b.y, c1 - 0.5, hh, { fontSize: 14, keepSize: true, bold: true, italic: true, color: DARK, valign: "middle", margin: 0 });
  txt(sl, "Solutions", x2, b.y, b.x + b.w - x2, hh, { fontSize: 14, keepSize: true, bold: true, italic: true, color: DARK, align: "center", valign: "middle", margin: 0 });
  sl.addShape("line", { x: b.x, y: b.y + hh + 0.02, w: b.w, h: 0, line: { color: "000000", width: 1 } });
  // row heights from content, then stretched to fill the panel
  const need = ROWS.map((r) => {
    const left = lh(14) * lines(r.name, c1 - 0.5, 14) + lh(TT) * lines(r.desc, c1 - 0.5, TT);
    const right = lh(TT) * (lines(r.avoid, tw - 0.1, TT) + lines(r.mitigate, tw - 0.1, TT)) + 0.12;
    return Math.max(left, right) + 2 * pad;
  });
  const avail = b.h - hh - 0.08, extra = Math.max(0, avail - need.reduce((a, v) => a + v, 0)) / ROWS.length;
  let y = b.y + hh + 0.08;
  ROWS.forEach((r, i) => {
    const rh = need[i] + extra;
    const cd = 0.36; sl.addShape("ellipse", { x: b.x + 0.02, y: y + pad + 0.02, w: cd, h: cd, fill: { color: RED }, line: { type: "none" } });
    txt(sl, String(r.n), b.x + 0.02, y + pad + 0.02, cd, cd, { fontSize: 14, keepSize: true, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    sl.addText([{ text: r.name, options: { bold: true, fontSize: 14, breakLine: true } }, { text: r.desc, options: { fontSize: TT } }],
      { x: b.x + 0.48, y: y + pad, w: c1 - 0.5, h: rh - 2 * pad, fontFace: F, color: "000000", valign: "top", margin: 0, isTextBox: true });
    // two solution lines: [Avoid] on a grey cell, [Mitigate] plain, as the deck's [Aim]/[How] rows
    const ha = lh(TT) * lines(r.avoid, tw - 0.1, TT) + 0.1, hm = rh - 2 * pad - ha - 0.04;
    sl.addShape("rect", { x: tx, y: y + pad, w: tw, h: ha, fill: { color: PANEL }, line: { type: "none" } });
    txt(sl, "[Avoid]", x2, y + pad, tagW - 0.08, ha, { fontSize: PT, keepSize: true, bold: true, color: RED, align: "right", valign: "middle", margin: 0 });
    txt(sl, r.avoid, tx + 0.05, y + pad, tw - 0.08, ha, { fontSize: TT, keepSize: true, italic: true, valign: "middle", margin: 0 });
    sl.addShape("line", { x: tx, y: y + pad + ha + 0.02, w: tw, h: 0, line: { color: "000000", width: 0.75 } });
    txt(sl, "[Mitigate]", x2, y + pad + ha + 0.04, tagW - 0.08, hm, { fontSize: PT, keepSize: true, bold: true, color: RED, align: "right", valign: "middle", margin: 0 });
    txt(sl, r.mitigate, tx + 0.05, y + pad + ha + 0.04, tw - 0.08, hm, { fontSize: TT, keepSize: true, valign: "middle", margin: 0 });
    y += rh;
    if (i < ROWS.length - 1) sl.addShape("line", { x: b.x, y, w: b.w, h: 0, line: { color: MID, width: 0.75, dashType: "sysDot" } });
  });
}

const top = 1.39, bot = 7.1, split = 4.9;
S.composeSlide(pres, slide, {
  regions: [{ x: 0.37, y: top, w: split - 0.37, h: bot - top }, { x: split + 0.25, y: top, w: 13.05 - split - 0.25, h: bot - top }],
  panels: [
    { headline: "Risk mapping", draw: heatMap },
    { headline: "Solutions for important risks", draw: solutions },
  ],
});

L.save(pres, __dirname + "/candidate.pptx");
