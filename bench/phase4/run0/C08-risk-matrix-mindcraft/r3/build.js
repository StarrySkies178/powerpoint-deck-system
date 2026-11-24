// C08 risk matrix, Mindcraft style (deck as reference, leave-one-out).
// Layout: HALF2 as on the deck's other two-panel analysis slides (numbered red chip + bold sub-headline + grey rule).
// Panel 1: 3 x 3 heat map (likelihood x severity) with a dashed red "Top priority" zone, as the deck marks a zone
// (dashed red box with a bold italic red label). Panel 2: risk -> solution table in the deck's matrix form
// (bold italic grey column heads, red bold [label] column, grey-filled first sub-row, dashed row separators).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, B, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion",
  source: [{ text: "Source: MindCraft Analysis", options: { italic: true } }],
});
const C = P.C, F = P.THEME.bodyFontFace;
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 12, color: o.color || C.text,
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.03, isTextBox: true,
  rotate: o.rotate, paraSpaceAfter: o.psa || 0 });

const top = B.y;                         // 1.39
const lx = B.x, lw = 5.35;               // panel 1
const rx = 6.0, rw = 13.333 - 0.33 - rx; // panel 2, to the right margin
const bottom = 6.98;

// ---------- tracker: bold italic grey sections, current in red, red triangles between (deck's own tracker) ----------
[["Market Analysis", 0.36, false], ["Growth Strategy", 2.87, false], ["Risk & Mitigation", 5.54, true]].forEach(([t, x, cur]) =>
  T(t, x, 0.04, 2.4, 0.3, { size: 14, bold: true, italic: true, color: cur ? C.accent : C.g2, margin: 0 }));
[2.44, 5.17].forEach((x) => slide.addShape("triangle", { x, y: 0.08, w: 0.25, h: 0.22, rotate: 90, fill: { color: C.accent }, line: { type: "none" } }));
// footer rule above the source line, as on the deck's content slides
slide.addShape("line", { x: 0, y: 7.2, w: 13.333, h: 0, line: { color: "D5D5D5", width: 1 } });

// ---------- panel heads: red square with italic white number, bold sub-headline, grey rule ----------
const head = (n, text, x, w) => {
  slide.addShape("rect", { x, y: top + 0.03, w: 0.35, h: 0.35, fill: { color: C.accent }, line: { type: "none" } });
  T(String(n), x, top + 0.03, 0.35, 0.35, { size: 14, bold: true, italic: true, color: "FFFFFF", align: "center", margin: 0 });
  T(text, x + 0.45, top + 0.02, w - 0.45, 0.37, { size: 14, bold: true, margin: 0 });
  slide.addShape("line", { x: x + 0.35, y: top + 0.43, w: w - 0.35, h: 0, line: { color: "7E7E7E", width: 1.2 } });
};
head(1, "Risk mapping", lx, lw);
head(2, "Solutions for important risks", rx, rw);
const by = top + 0.62;                   // body of each panel

// ---------- panel 1: heat map ----------
T("Potential risks by likelihood and severity", lx, by, lw, 0.32, { size: 14, italic: true });
const gx = lx + 1.15, gy = by + 0.5, gw = lw - 1.2, gh = bottom - 0.62 - gy, cw = gw / 3, ch = gh / 3;
const shade = [["D5D5D5", "A6A6A6", "A6A6A6"], ["F1F1F1", "D5D5D5", "A6A6A6"], ["F1F1F1", "F1F1F1", "D5D5D5"]]; // rows: High, Medium, Low likelihood
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
  slide.addShape("rect", { x: gx + c * cw, y: gy + r * ch, w: cw, h: ch, fill: { color: shade[r][c] }, line: { color: "FFFFFF", width: 2 } });
["High", "Medium", "Low"].forEach((t, r) => T(t, gx - 0.74, gy + r * ch, 0.7, ch, { size: 12, align: "right" }));
["Low", "Medium", "High"].forEach((t, c) => T(t, gx + c * cw, gy + gh + 0.03, cw, 0.28, { size: 12, align: "center" }));
T("Likelihood", lx + 0.13 - gh / 2, gy + gh / 2 - 0.14, gh, 0.28, { size: 12, bold: true, italic: true, align: "center", rotate: 270 });
slide.addShape("line", { x: lx + 0.36, y: gy, w: 0, h: gh, line: { color: C.g3, width: 1.25, beginArrowType: "triangle" } });
slide.addShape("line", { x: gx, y: gy + gh + 0.34, w: gw, h: 0, line: { color: C.g3, width: 1.25, endArrowType: "triangle" } });
T("Severity", gx, gy + gh + 0.34, gw, 0.26, { size: 12, bold: true, italic: true, align: "center" });

// priority zone: severity High, likelihood Medium + High
const zx = gx + 2 * cw + 0.06, zy = gy + 0.06, zw = cw - 0.12, zh = 2 * ch - 0.12;
slide.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: C.accent, width: 1.75, dashType: "dash" } });
T("Top priority", zx, zy + 0.04, zw, 0.3, { size: 12, bold: true, italic: true, color: C.accent, align: "center" });

const d = 0.4;
const dot = (id, cx, cy, hot) => {
  slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? C.accent : C.g4 }, line: { color: "FFFFFF", width: 1 } });
  T(String(id), cx - d / 2, cy - d / 2, d, d, { size: 13, bold: true, color: "FFFFFF", align: "center", margin: 0 });
};
const cell = (r, c) => ({ x: gx + c * cw, y: gy + r * ch });
// top-priority risks: two per cell, side by side
[[1, 0], [2, 0], [3, 1], [4, 1]].forEach(([id, r], i) => { const k = cell(r, 2); dot(id, k.x + cw * (i % 2 ? 0.68 : 0.32), k.y + ch * 0.58, true); });
// other risks: dot over a centred label
[[6, "Competitor's response", 0, 0], [8, "Cannibalization", 1, 0], [7, "Customer preference change", 2, 1], [5, "Customer information safety", 2, 2]]
  .forEach(([id, name, r, c]) => { const k = cell(r, c); dot(id, k.x + cw / 2, k.y + 0.36, false);
    T(name, k.x + 0.06, k.y + 0.6, cw - 0.12, ch - 0.66, { size: 11, align: "center", valign: "top" }); });

// ---------- panel 2: risk -> solutions table ----------
const c1 = rx, w1 = 2.55, c2 = rx + w1 + 0.08, w2 = 1.05, c3 = c2 + w2, w3 = rx + rw - c3;
T("Risks", c1, by, w1, 0.34, { size: 14, bold: true, italic: true, color: C.g4, align: "center" });
T("Solutions", c2, by, rw - w1 - 0.08, 0.34, { size: 14, bold: true, italic: true, color: C.g4, align: "center" });
slide.addShape("line", { x: rx, y: by + 0.4, w: rw, h: 0, line: { color: C.g3, width: 1 } });
const rows = [
  { n: 1, name: "Internal resistance", desc: "Changes in functions and work relationships cause anger and panic",
    avoid: "Strengthen internal communication and provide employee training",
    mitigate: "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary" },
  { n: 2, name: "Talent management", desc: "Insufficient supply of trained salespersons for rapid expansion",
    avoid: "Make recruitment plan in advance", mitigate: "Reduce labor demand with technology" },
  { n: 3, name: "Supply chain mgmt.", desc: "Rapid store expansion requires agile logistics",
    avoid: "Optimize logistics network", mitigate: "Find reliable third-party logistic partner" },
  { n: 4, name: "IT system upgrade", desc: "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    avoid: "Make upgrade plan in advance; careful selection of new system supplier", mitigate: "Hire external technology experts for help" },
];
const weights = [1.25, 0.9, 0.85, 1.15], wsum = weights.reduce((a, b) => a + b, 0);
let y = by + 0.48;
const avail = bottom - y;
rows.forEach((r, i) => {
  const h = (avail * weights[i]) / wsum, ih = h - 0.1, hh = ih / 2;
  // risk cell: red chip + bold name + description
  slide.addShape("ellipse", { x: c1, y: y + 0.06, w: 0.34, h: 0.34, fill: { color: C.accent }, line: { type: "none" } });
  T(String(r.n), c1, y + 0.06, 0.34, 0.34, { size: 12, bold: true, color: "FFFFFF", align: "center", margin: 0 });
  slide.addText([{ text: r.name, options: { bold: true, breakLine: true } }, { text: r.desc, options: { fontSize: 11, color: C.g4 } }],
    { x: c1 + 0.42, y: y + 0.02, w: w1 - 0.42, h: ih, fontFace: F, fontSize: 12, color: C.text, valign: "top", margin: 0.03, isTextBox: true });
  // solution sub-rows: [Avoid] on grey, [Mitigate] on white with a solid rule between (deck's [Aim]/[How] form)
  [["[Avoid]", r.avoid, true], ["[Mitigate]", r.mitigate, false]].forEach(([lab, text, grey], k) => {
    const sy = y + 0.02 + k * hh;
    T(lab, c2, sy, w2, hh, { size: 12, bold: true, color: C.accent, align: "right" });
    if (grey) slide.addShape("rect", { x: c3 + 0.06, y: sy, w: w3 - 0.06, h: hh, fill: { color: "F1F1F1" }, line: { type: "none" } });
    else slide.addShape("line", { x: c3 + 0.06, y: sy, w: w3 - 0.06, h: 0, line: { color: "000000", width: 0.75 } });
    T(text, c3 + 0.1, sy, w3 - 0.12, hh, { size: 12, italic: grey });
  });
  y += h;
  if (i < rows.length - 1) slide.addShape("line", { x: rx, y: y - 0.04, w: rw, h: 0, line: { color: C.g3, width: 0.75, dashType: "dash" } });
});

// brand mark bottom right, as on every content slide of the deck
T([{ text: "MindCraft", options: { bold: true, color: C.accent } }], 11.45, 7.2, 1.3, 0.26, { size: 12, align: "right", margin: 0 });

L.save(pres, __dirname + "/candidate.pptx");
