// C08 rebuild (run5 r2): risk heat map + "Risks | Solutions" table, in the style of Case-2019-Mindcraft.
// Deck as reference: style profile Case-2019-Mindcraft; two numbered half panels (HALF2, as the deck's slides 8 and 14),
// the heat map is the deck's numbered-risk form (riskMatrix rule: same numbers in the mitigation list), drawn as a 3 x 3
// grid because the prompt gives Low / Medium / High levels; the table follows the deck's [Aim] / [How] rows (slide 8):
// grey label cells, red bold bracket labels, dotted row rules.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, B, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion",
  source: "Source: MindCraft Analysis",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], current: 2 },
});
const C = P.C, F = P.THEME.bodyFontFace;
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 14, color: o.color || C.text,
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0, rotate: o.rotate, isTextBox: true,
  paraSpaceAfter: o.psa || 0 });

const top = B.y + 0.04, bottom = B.y + B.h - 0.06;           // body 1.39 .. 7.10
const leftW = 5.1, gap = 0.3, rx = B.x + leftW + gap, rw = B.x + B.w - rx;
const h1 = S.subhead(slide, 1, "Risk mapping", B.x, top, leftW);
const h2 = S.subhead(slide, 2, "Solutions for important risks", rx, top, rw);

// ---------- 1 heat map: likelihood (rows) x severity (columns) ----------
const lev = ["Low", "Medium", "High"];
const axW = 0.32, lbW = 0.36, gx = B.x + axW + lbW + 0.06, gw = B.x + leftW - gx, cw = gw / 3;
const gy = top + h1 + 0.42, xlab = 0.62, legH = 0.4, gh = bottom - legH - xlab - gy, ch = gh / 3;
const fill = (l, s) => (l + s >= 3 ? "A6A6A6" : l + s === 2 ? "D5D5D5" : "F1F1F1");    // heat: darker grey = higher combined risk
for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++)
  slide.addShape("rect", { x: gx + s * cw, y: gy + (2 - l) * ch, w: cw, h: ch, fill: { color: fill(l, s) }, line: { color: "FFFFFF", width: 2 } });
const rot = (t, cxr, cyr, len, thick, o) => T(t, cxr - len / 2, cyr - thick / 2, len, thick, { ...o, align: "center", valign: "middle", rotate: 270 });   // rotated box: w/h before turning
lev.forEach((t, l) => rot(t, gx - lbW / 2 - 0.02, gy + (2 - l) * ch + ch / 2, ch, lbW, { size: 12 }));
lev.forEach((t, s) => T(t, gx + s * cw, gy + gh + 0.04, cw, 0.26, { size: 12, align: "center" }));
T("Severity", gx, gy + gh + 0.31, gw, 0.28, { size: 12, bold: true, italic: true, align: "center" });
rot("Likelihood", B.x + axW / 2, gy + gh / 2, gh, axW, { size: 12, bold: true, italic: true });
slide.addShape("line", { x: gx, y: gy + gh, w: gw, h: 0, line: { color: C.g4, width: 1.25, endArrowType: "triangle" } });
slide.addShape("line", { x: gx, y: gy, w: 0, h: gh, line: { color: C.g4, width: 1.25, beginArrowType: "triangle" } });

// top-priority zone: high severity, medium and high likelihood
const zx = gx + 2 * cw + 0.05, zy = gy + 0.05, zw = cw - 0.1, zh = 2 * ch - 0.1;
slide.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: C.accent, width: 2, dashType: "dash" } });
slide.addShape("rect", { x: zx + 0.1, y: gy - 0.3, w: zw - 0.2, h: 0.3, fill: { color: C.accent }, line: { type: "none" } });
T("Top priority", zx + 0.1, gy - 0.3, zw - 0.2, 0.3, { size: 12, bold: true, italic: true, color: "FFFFFF", align: "center", valign: "middle" });

const d = 0.42;
const dot = (id, cx, cy, hot) => {
  slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? C.accent : C.g4 }, line: { color: "FFFFFF", width: 1.5 } });
  T(String(id), cx - d / 2, cy - d / 2, d, d, { size: 14, bold: true, italic: true, color: "FFFFFF", align: "center", valign: "middle" });
};
const cx = (s, f = 0.5) => gx + s * cw + f * cw, cy = (l, f = 0.5) => gy + (2 - l) * ch + f * ch;
dot(1, cx(2, 0.3), cy(2, 0.42), true); dot(2, cx(2, 0.7), cy(2, 0.62), true);
dot(3, cx(2, 0.3), cy(1, 0.42), true); dot(4, cx(2, 0.7), cy(1, 0.62), true);
const other = (id, s, l, name) => { const f = 0.24; dot(id, cx(s), cy(l, f), false); T(name, gx + s * cw + 0.05, cy(l, f) + d / 2 + 0.04, cw - 0.1, ch * (1 - f) - d / 2 - 0.1, { size: 12, align: "center" }); };
other(6, 0, 2, "Competitor's response");
other(8, 0, 1, "Cannibalization");
other(7, 1, 0, "Customer preference change");
other(5, 2, 0, "Customer information safety");

// legend
const ly = bottom - 0.3;
slide.addShape("ellipse", { x: gx, y: ly + 0.04, w: 0.22, h: 0.22, fill: { color: C.accent }, line: { type: "none" } });
T("Important risk", gx + 0.3, ly, 1.9, 0.3, { size: 12, valign: "middle" });
slide.addShape("ellipse", { x: gx + 2.3, y: ly + 0.04, w: 0.22, h: 0.22, fill: { color: C.g4 }, line: { type: "none" } });
T("Other risk", gx + 2.6, ly, 1.6, 0.3, { size: 12, valign: "middle" });

// ---------- 2 table: Risks | Solutions ----------
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
const kw = 2.95, sx = rx + kw + 0.12, sw = rx + rw - sx, ty = top + h2 + 0.02, hh = 0.32;
T("Risks", rx + 0.48, ty, kw - 0.48, hh, { size: 14, bold: true, italic: true, color: C.g4, valign: "middle" });
T("Solutions", sx, ty, sw, hh, { size: 14, bold: true, italic: true, color: C.g4, valign: "middle" });
slide.addShape("line", { x: rx, y: ty + hh, w: rw, h: 0, line: { color: C.text, width: 1 } });
const weights = [5.1, 4.1, 3.3, 6.0], tot = weights.reduce((a, b) => a + b, 0), avail = bottom - (ty + hh + 0.06);
let y = ty + hh + 0.06;
rows.forEach((r, i) => {
  const h = (avail * weights[i]) / tot;
  slide.addShape("rect", { x: rx + 0.44, y: y + 0.04, w: kw - 0.44, h: h - 0.08, fill: { color: C.g1 }, line: { type: "none" } });
  slide.addShape("rect", { x: rx, y: y + 0.07, w: 0.34, h: 0.34, fill: { color: C.accent }, line: { type: "none" } });
  T(String(i + 1), rx, y + 0.07, 0.34, 0.34, { size: 14, bold: true, italic: true, color: "FFFFFF", align: "center", valign: "middle" });
  slide.addText([{ text: r[0], options: { bold: true, breakLine: true } }, { text: r[1], options: { size: 13 } }],
    { x: rx + 0.52, y: y + 0.06, w: kw - 0.58, h: h - 0.12, fontFace: F, fontSize: 13, color: C.text, valign: "middle", margin: 0, isTextBox: true });
  slide.addText([{ text: "[Avoid] ", options: { bold: true, color: C.accent } }, { text: r[2], options: { breakLine: true } },
    { text: "[Mitigate] ", options: { bold: true, color: C.accent } }, { text: r[3] }],
    { x: sx, y: y + 0.06, w: sw, h: h - 0.12, fontFace: F, fontSize: 13, color: C.text, valign: "middle", margin: 0, paraSpaceAfter: 4, isTextBox: true });
  if (i < rows.length - 1) slide.addShape("line", { x: rx + 0.44, y: y + h, w: rw - 0.44, h: 0, line: { color: C.g2, width: 1, dashType: "sysDot" } });
  y += h;
});

L.save(pres, __dirname + "/candidate.pptx");
