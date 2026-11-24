// C08 risk heat map + solutions table, in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Layout: two numbered panels side by side (HALF2), panel boxes from the deck's slide 14 (scripts/layout_skeleton.py).
// Forms: numbered heat map with a dashed priority zone (riskMatrix idea, drawn as a 3x3 grid because the prompt gives
// Low/Medium/High levels) and the same numbers in a risk -> solution list; [Avoid]/[Mitigate] tags in red bold
// like the deck's [Aim]/[How] tags (slide 8); grey reading box under the exhibit (slide 14).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, S, HOUSE } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion",
});
const C = P.C, F = P.THEME.bodyFontFace;
const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: 12, color: C.text, margin: 0, valign: "top", isTextBox: true, ...o });

// tracker as the deck draws it (bold italic grey items, red triangles, current item red), positions from the deck's slide 14,
// which has the same first two items; frame()'s crumb has no italic and no triangle shapes
[["Market Analysis", 0.36, "A6A6A6"], ["Growth Strategy", 2.88, "A6A6A6"], ["Risk & Mitigation", 5.55, C.accent]].forEach(([s, x, col]) =>
  t(s, x, 0.04, 2.6, 0.3, { fontSize: 14, bold: true, italic: true, color: col }));
[2.44, 5.19].forEach((x) => slide.addShape("triangle", { x, y: 0.08, w: 0.21, h: 0.24, rotate: 90, fill: { color: C.accent }, line: { type: "none" } }));
// source line in the deck's italic
t("Source: MindCraft Analysis", 0.39, 7.24, 8, 0.22, { fontSize: 10, italic: true });

// deck furniture: logo bottom right (from the deck's master)
slide.addImage({ path: path.join(__dirname, "mindcraft-logo.png"), x: 11.64, y: 7.175, w: 1.137, h: 0.325 });
slide.addShape("line", { x: 0, y: 7.2, w: 13.333, h: 0, line: { color: "D5D5D5", width: 0.75 } });

// panel boxes (slide 14 skeleton: left 0.36..6.38, right 6.66..13.01, top 1.37, bottom 6.77)
const top = 1.37, bot = 6.95;
const LB = { x: 0.36, y: top, w: 5.75, h: bot - top }, RB = { x: 6.4, y: top, w: 6.6, h: bot - top };
const hh1 = S.subhead(slide, 1, "Risk mapping", LB.x, LB.y, LB.w);
const hh2 = S.subhead(slide, 2, "Solutions for important risks", RB.x, RB.y, RB.w);

// ---------- 1 heat map: likelihood (x) x severity (y), 3 x 3 ----------
const lv = ["Low", "Medium", "High"];
const gx = LB.x + 1.1, gy = LB.y + hh1 + 0.15, gw = LB.w - 1.15, gh = 3.3, cw = gw / 3, ch = gh / 3;
const shade = (i, j) => [ "F1F1F1", "F1F1F1", "D5D5D5", "A6A6A6", "A6A6A6" ][i + j];   // i likelihood, j severity (0 low)
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
  slide.addShape("rect", { x: gx + i * cw, y: gy + (2 - j) * ch, w: cw, h: ch, fill: { color: shade(i, j) }, line: { color: "FFFFFF", width: 2 } });
// axes
slide.addShape("line", { x: gx, y: gy + gh, w: gw + 0.05, h: 0, line: { color: C.g5, width: 1.25, endArrowType: "triangle" } });
slide.addShape("line", { x: gx, y: gy - 0.05, w: 0, h: gh + 0.05, line: { color: C.g5, width: 1.25, beginArrowType: "triangle" } });
lv.forEach((s, i) => t(s, gx + i * cw, gy + gh + 0.05, cw, 0.25, { align: "center", italic: true }));
lv.forEach((s, j) => t(s, gx - 0.72, gy + (2 - j) * ch, 0.68, ch, { align: "right", valign: "middle", italic: true }));
t("Likelihood", gx, gy + gh + 0.3, gw, 0.28, { align: "center", bold: true });
t("Severity", LB.x - 0.55, gy + gh / 2 - 0.14, 1.3, 0.28, { align: "center", bold: true, rotate: 270 });
// top-priority zone: high severity x medium / high likelihood
const zx = gx + cw + 0.05, zy = gy + 0.05, zw = 2 * cw - 0.1, zh = ch - 0.1;
slide.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: C.accent, width: 1.75, dashType: "dash" } });
t("Top priority", zx + 0.08, zy + 0.05, zw - 0.16, 0.26, { bold: true, italic: true, color: C.accent, fontSize: 12 });
// numbered risks: [id, likelihood, severity, name, offset in cell]
const d = 0.4;
const dot = (id, cx, cy, hot) => {
  slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? C.accent : C.g4 }, line: { color: "FFFFFF", width: 1 } });
  t(String(id), cx - d / 2, cy - d / 2, d, d, { align: "center", valign: "middle", bold: true, color: "FFFFFF", fontSize: 13 });
};
const cell = (i, j) => ({ x: gx + i * cw, y: gy + (2 - j) * ch });
[[1, 2, 2, 0.35], [2, 2, 2, 0.68], [3, 1, 2, 0.35], [4, 1, 2, 0.68]].forEach(([id, i, j, f]) => {
  const c = cell(i, j); dot(id, c.x + cw * f, c.y + ch * 0.6, true); });
[[6, 2, 0, "Competitor's response"], [8, 1, 0, "Cannibalization"], [7, 0, 1, "Customer preference change"], [5, 0, 2, "Customer information safety"]].forEach(([id, i, j, name]) => {
  const c = cell(i, j); dot(id, c.x + 0.3, c.y + 0.32, false);
  t(name, c.x + 0.08, c.y + 0.56, cw - 0.14, ch - 0.6, { fontSize: 11, color: C.text }); });
// reading of the map
const ry = gy + gh + 0.66, rh = bot - ry;
slide.addShape("rect", { x: LB.x, y: ry, w: LB.w, h: rh, fill: { color: C.g1 }, line: { type: "none" } });
t([{ text: "\u2022 " }, { text: "Risks 1-4", options: { bold: true, color: C.accent } }, { text: " combine high severity with medium to high likelihood and need preparation now", options: { breakLine: true } },
   { text: "\u2022 Risks 5-8 are unlikely or mild and are monitored" }], LB.x + 0.12, ry + 0.06, LB.w - 0.24, rh - 0.12,
  { fontSize: 12, valign: "middle", paraSpaceAfter: 2 });

// ---------- 2 risks -> solutions ----------
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
const tx = RB.x, cx1 = tx + 0.5, w1 = 2.65, cx2 = cx1 + w1 + 0.15, w2 = RB.x + RB.w - cx2;
const hy = RB.y + hh2 + 0.08;
t("Risks", cx1, hy, w1, 0.32, { italic: true, bold: true, color: C.g4, fontSize: 14, align: "center", valign: "middle" });
t("Solutions", cx2, hy, w2, 0.32, { italic: true, bold: true, color: C.g4, fontSize: 14, align: "center", valign: "middle" });
slide.addShape("line", { x: tx, y: hy + 0.38, w: RB.w, h: 0, line: { color: C.g3, width: 1 } });
const y0 = hy + 0.46, wts = [1.38, 0.9, 0.82, 1.1], tot = wts.reduce((a, b) => a + b, 0), avail = bot - y0;
let y = y0;
rows.forEach(([name, desc, avoid, mit], k) => {
  const h = avail * wts[k] / tot;
  dot(k + 1, tx + 0.22, y + h / 2, true);
  slide.addShape("rect", { x: cx1, y: y + 0.04, w: w1, h: h - 0.08, fill: { color: C.g1 }, line: { type: "none" } });
  t([{ text: name, options: { bold: true, breakLine: true } }, { text: desc, options: { fontSize: 11 } }], cx1 + 0.08, y + 0.04, w1 - 0.16, h - 0.08, { valign: "middle", fontSize: 12 });
  t([{ text: "[Avoid] ", options: { bold: true, color: C.accent } }, { text: avoid, options: { breakLine: true } },
     { text: "[Mitigate] ", options: { bold: true, color: C.accent } }, { text: mit }], cx2, y + 0.04, w2, h - 0.08, { valign: "middle", fontSize: 12, paraSpaceAfter: 3 });
  if (k < rows.length - 1) slide.addShape("line", { x: tx, y: y + h, w: RB.w, h: 0, line: { color: C.g4, width: 0.75, dashType: "sysDot" } });
  y += h;
});

L.save(pres, __dirname + "/candidate.pptx");
