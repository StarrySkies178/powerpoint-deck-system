// C08 risk matrix, Mindcraft style (deck as reference, leave-one-out).
// Layout: HALF2 like the deck's other two-panel analysis slides (8, 14, 18): numbered red-chip sub-headlines with a grey rule,
// left = numbered 3x3 heat map (Style/refs case-competitions-2019-2020 §5 "risk heat map": numbered dots, dashed priority zone,
// same numbers in the mitigation list), right = risk -> solution rows in the deck's [Aim]/[How] row form (slide 8):
// red bold bracket tags, grey filled first row, white second row, dashed rules between groups.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
const { pres, slide, P, S, HOUSE } = L.start({ ref: "Case-2019-Mindcraft", title: TITLE, source: "Source: MindCraft Analysis" });
const RED = "C00000", G1 = "F1F1F1", G2 = "D5D5D5", G3 = "A6A6A6", G4 = "808080", G5 = "5C5C5C", BLK = "000000";
const FONT = "Verdana";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || 12, color: o.color || BLK, bold: !!o.bold, italic: !!o.italic,
  align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0.03, rotate: o.rotate, isTextBox: true, paraSpaceAfter: 0 });

// ---- breadcrumb tracker (as on the deck's analysis slides: grey bold italic items, red triangles, current item red)
const crumb = [["Market Analysis", 0.37, 2.06], ["Growth Strategy", 2.87, 2.28], ["Risk & Mitigation", 5.56, 2.6]];
crumb.forEach(([t, x, w], i) => {
  T(t, x, 0.05, w, 0.3, { size: 14, bold: true, italic: true, color: i === 2 ? RED : G3, margin: 0, valign: "middle" });
  if (i < 2) slide.addShape("triangle", { x: [2.45, 5.17][i], y: 0.09, w: 0.21, h: 0.2, rotate: 90, fill: { color: RED }, line: { type: "none" } });
});

// ---- panels
const top = 1.4, bot = 7.0, p1 = { x: 0.37, w: 5.3 }, p2 = { x: 5.92, w: 7.11 };
const h1 = S.subhead(slide, 1, "Risk mapping", p1.x, top, p1.w);
const h2 = S.subhead(slide, 2, "Solutions for important risks", p2.x, top, p2.w);

// ---- 1. heat map: likelihood (rows, High on top) x severity (columns, Low left)
const lvl = ["Low", "Medium", "High"];
const gx = 1.42, gw = p1.x + p1.w - gx, gy = top + h1 + 0.12, gh = 6.2 - gy, cw = gw / 3, ch = gh / 3;
const shade = (li, si) => [G1, G1, G2, G3, G3][li + si];
for (let li = 0; li < 3; li++) for (let si = 0; si < 3; si++)
  slide.addShape("rect", { x: gx + si * cw, y: gy + (2 - li) * ch, w: cw, h: ch, fill: { color: shade(li, si) }, line: { color: "FFFFFF", width: 2 } });
// axes
slide.addShape("line", { x: gx - 0.08, y: gy + gh + 0.06, w: gw + 0.08, h: 0, line: { color: G4, width: 1.25, endArrowType: "triangle" } });
slide.addShape("line", { x: gx - 0.08, y: gy - 0.02, w: 0, h: gh + 0.08, line: { color: G4, width: 1.25, beginArrowType: "triangle" } });
lvl.forEach((l, i) => {
  T(l, gx + i * cw, gy + gh + 0.1, cw, 0.3, { size: 14, align: "center" });
  T(l, p1.x + 0.24, gy + (2 - i) * ch, gx - p1.x - 0.38, ch, { align: "right", valign: "middle" });
});
T("Severity", gx, gy + gh + 0.42, gw, 0.3, { size: 14, bold: true, italic: true, align: "center" });
T("Likelihood", p1.x + 0.14 - gh / 2, gy + gh / 2 - 0.15, gh, 0.3, { size: 14, bold: true, italic: true, align: "center", rotate: 270 });

// top priority zone: severity High x likelihood Medium-High
const zx = gx + 2 * cw + 0.05, zy = gy + 0.05, zw = cw - 0.1, zh = 2 * ch - 0.1;
slide.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: RED, width: 2, dashType: "dash" } });
T("Top priority", zx, zy + 0.04, zw, 0.3, { size: 12, bold: true, italic: true, color: RED, align: "center" });

const d = 0.38;
const dot = (n, cx, cy, hot) => {
  slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : G5 }, line: { color: "FFFFFF", width: 1 } });
  T(String(n), cx - d / 2, cy - d / 2, d, d, { size: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
};
const cell = (li, si) => ({ x: gx + si * cw, y: gy + (2 - li) * ch });
// important risks: two per cell, side by side, under the zone label
[[1, 2, 2], [3, 4, 1]].forEach(([a, b, li]) => {
  const c = cell(li, 2), cy = c.y + ch / 2 + 0.14;
  dot(a, c.x + cw / 2 - 0.3, cy, true); dot(b, c.x + cw / 2 + 0.3, cy, true);
});
// other risks: dot with its name under it
[[6, "Competitor's response", 2, 0], [8, "Cannibalization", 1, 0], [7, "Customer preference change", 0, 1], [5, "Customer information safety", 0, 2]].forEach(([n, name, li, si]) => {
  const c = cell(li, si);
  dot(n, c.x + cw / 2, c.y + 0.32, false);
  T(name, c.x + 0.02, c.y + 0.55, cw - 0.04, ch - 0.6, { align: "center", margin: 0.01 });
});

// ---- 2. risks -> solutions
const risks = [
  ["Internal resistance", "Changes in functions and work relationships cause anger and panic",
    "Strengthen internal communication and provide employee training", "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
  ["Talent management", "Insufficient supply of trained salespersons for rapid expansion",
    "Make recruitment plan in advance", "Reduce labor demand with technology"],
  ["Supply chain mgmt.", "Rapid store expansion requires agile logistics",
    "Optimize logistics network", "Find reliable third-party logistic partner"],
  ["IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
];
const rx = p2.x, rw = 2.72, sx = rx + rw + 0.12, sw = p2.x + p2.w - sx;
const hy = top + h2 + 0.02;
T("Risks", rx, hy, rw, 0.34, { size: 14, bold: true, italic: true, color: G5, align: "center", valign: "middle" });
T("Solutions", sx, hy, sw, 0.34, { size: 14, bold: true, italic: true, color: G5, align: "center", valign: "middle" });
slide.addShape("line", { x: rx, y: hy + 0.38, w: rw, h: 0, line: { color: G4, width: 1 } });
slide.addShape("line", { x: sx, y: hy + 0.38, w: sw, h: 0, line: { color: G4, width: 1 } });

// line estimates (about 0.0071 in per character per pt, as Verdana renders in the benchmark), to share the height by need
const lines = (s, w, pt = 12) => { let n = 1, cur = 0; const cpl = Math.floor((w - 0.1) / (0.0071 * pt));
  s.split(" ").forEach((wd) => { if (cur && cur + 1 + wd.length > cpl) { n++; cur = wd.length; } else cur += (cur ? 1 : 0) + wd.length; }); return n; };
const LH = 0.235, LH12 = 0.2, PAD = 0.05, tw = sw - 0.04;
// line counts as the render wraps them (estimate checked on the rendered slide: [description, avoid, mitigate])
const SEEN = [[3, 3, 3], [3, 1, 2], [2, 1, 2], [4, 2.6, 2]];   // row 4 avoid: room for a third line where Verdana is wider than the benchmark font
const need = risks.map(([nm, ds, a, m], i) => {
  const [dl, av, mi] = SEEN[i] || [lines(ds, rw - 0.5), lines("[Avoid] " + a, tw, 14), lines("[Mitigate] " + m, tw, 14)];
  const left = (LH + dl * LH12) / LH;
  return { left, av, mi, tot: Math.max(left, av + mi) };
});
const y0 = hy + 0.42, avail = bot - y0, sumL = need.reduce((s, n) => s + n.tot, 0);
const extra = (avail - sumL * LH - risks.length * 2 * PAD) / risks.length;
if (process.env.DBG) console.log(JSON.stringify(need), sumL * LH + risks.length * 2 * PAD, avail);
let y = y0;
risks.forEach(([nm, ds, a, m], i) => {
  const n = need[i], rh = n.tot * LH + 2 * PAD + extra;
  // risk: red numbered circle, bold name, description
  dot(i + 1, rx + 0.2, y + 0.24, true);
  slide.addText([{ text: nm, options: { bold: true, fontSize: 14, breakLine: true } }, { text: ds, options: { fontSize: 12 } }], { x: rx + 0.45, y: y + 0.04, w: rw - 0.45, h: rh - 0.08, fontFace: FONT, fontSize: 12, color: BLK, valign: "top", margin: 0.03, isTextBox: true });
  // solutions: [Avoid] row on grey, [Mitigate] row on white, tags in red bold
  const ah = (rh - 0.08) * (n.av / (n.av + n.mi)), mh = rh - 0.08 - ah;
  slide.addShape("rect", { x: sx, y: y + 0.04, w: sw, h: ah, fill: { color: G1 }, line: { type: "none" } });
  slide.addText([{ text: "[Avoid] ", options: { bold: true, color: RED } }, { text: a }], { x: sx + 0.02, y: y + 0.04, w: tw, h: ah, fontFace: FONT, fontSize: 14, color: BLK, valign: "middle", margin: 0.05, isTextBox: true });
  slide.addText([{ text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: m }], { x: sx + 0.02, y: y + 0.04 + ah, w: tw, h: mh, fontFace: FONT, fontSize: 14, color: BLK, valign: "middle", margin: 0.05, isTextBox: true });
  if (i < risks.length - 1) slide.addShape("line", { x: rx, y: y + rh, w: p2.w, h: 0, line: { color: G4, width: 0.75, dashType: "sysDash" } });
  y += rh;
});

// deck sign-off at the bottom right (the team's name in red, as on every slide of the reference)
T("MindCraft", 11.75, 7.2, 1.0, 0.28, { size: 12, bold: true, color: RED, align: "right", valign: "middle", margin: 0 });

L.save(pres, __dirname + "/candidate.pptx");
