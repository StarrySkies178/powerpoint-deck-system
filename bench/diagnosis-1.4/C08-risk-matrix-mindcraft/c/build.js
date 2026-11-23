// C08-risk-matrix-mindcraft, variant c: edit the closest OTHER slide of the same deck.
// Slide taken: Case-2019-Mindcraft slide 18 (store id case19-mindcraft-018), "CSS's online channel performance".
// Why it is the closest: it is a HALF2 slide whose panel 1 is a two-axis grid with labelled points split into
// zones by grid lines (the nearest thing in the deck to a likelihood x severity heat map) and whose panel 2 is a
// borderless two-column list with italic column headers and dashed row separators (the form a Risks | Solutions
// table takes in this deck). build.py places that slide's own panel heads (number chips, sub-headlines, rules) and
// its italic column headers with their original colours and refills them; this file draws what the stored slide
// cannot carry: the frame (tracker, title, source), the 3 x 3 heat map with its numbered dots and the four risk rows.
// The [Avoid] / [Mitigate] tags copy the deck's own red bold [Aim] / [How] tags (slide 8).
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));

const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
const { pres, slide, P } = L.start({
  ref: "Case-2019-Mindcraft",
  title: TITLE,
  source: "Source: MindCraft Analysis",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], current: 2 },
});
const C = P.C, F = P.THEME.bodyFontFace;
const T = (t, x, y, w, h, o = {}) => P.txt(slide, t, x, y, w, h, { noScale: true, margin: 0, ...o });
const RED = C.navy, PINK = "F2DCDB", MID = "D5D5D5", LIGHT = C.g1;

// ---------------- panel 1: risk heat map (likelihood x severity) ----------------
const gx = 1.45, gy = 2.0, cw = 1.5, ch = 1.38;           // grid origin and cell size (3 x 3)
const lev = ["Low", "Medium", "High"];
// heat by likelihood + severity: 0-1 light grey, 2 mid grey, 3-4 red tint
const heat = (li, si) => { const s = li + si; return s >= 3 ? PINK : s === 2 ? MID : LIGHT; };
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
  const li = 2 - r, si = c;                                  // top row = high likelihood, right column = high severity
  slide.addShape("rect", { x: gx + c * cw, y: gy + r * ch, w: cw, h: ch, fill: { color: heat(li, si) }, line: { color: "FFFFFF", width: 1.5 } });
}
// axes: arrows along the left and bottom edges, level labels, axis titles (italic, as the deck's axis captions)
slide.addShape("line", { x: gx, y: gy + 3 * ch, w: 3 * cw + 0.15, h: 0, line: { color: C.g3, width: 1.25, endArrowType: "triangle" } });
slide.addShape("line", { x: gx, y: gy - 0.15, w: 0, h: 3 * ch + 0.15, line: { color: C.g3, width: 1.25, beginArrowType: "triangle" } });
lev.forEach((l, i) => {
  T(l, gx + i * cw, gy + 3 * ch + 0.05, cw, 0.28, { fontSize: 12, align: "center", valign: "middle" });
  T(l, gx - 0.8, gy + (2 - i) * ch, 0.72, ch, { fontSize: 12, align: "right", valign: "middle" });
});
slide.addText("Severity", { x: gx, y: gy + 3 * ch + 0.34, w: 3 * cw, h: 0.3, fontFace: F, fontSize: 12, italic: true, color: C.text, align: "center", valign: "middle", margin: 0, isTextBox: true });
slide.addText("Likelihood", { x: 0.55 - 3 * ch / 2, y: gy + 3 * ch / 2 - 0.15, w: 3 * ch, h: 0.3, fontFace: F, fontSize: 12, italic: true, color: C.text, align: "center", valign: "middle", rotate: 270, margin: 0, isTextBox: true });

// "Top priority" zone: high severity column, medium + high likelihood (dashed red frame, as the deck marks what matters)
slide.addShape("rect", { x: gx + 2 * cw + 0.05, y: gy + 0.05, w: cw - 0.1, h: 2 * ch - 0.1, fill: { type: "none" }, line: { color: RED, width: 1.75, dashType: "dash" } });
T("Top priority", gx + 2 * cw + 0.1, gy + 0.1, cw - 0.2, 0.28, { fontSize: 12, bold: true, color: RED, align: "center", valign: "middle" });

// numbered dots: the four important risks in red (same numbers as the table), the others grey with their names
const d = 0.42;
const dot = (n, cx, cy, hot) => {
  slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : C.g3 }, line: { color: "FFFFFF", width: 1 } });
  T(String(n), cx - d / 2, cy - d / 2, d, d, { fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
};
const cell = (li, si) => ({ x: gx + si * cw, y: gy + (2 - li) * ch });
// top-priority risks: 1, 2 high / high; 3, 4 medium likelihood / high severity
[[1, 2, 2, -0.3], [2, 2, 2, 0.3], [3, 1, 2, -0.3], [4, 1, 2, 0.3]].forEach(([n, li, si, dx]) => {
  const c = cell(li, si); dot(n, c.x + cw / 2 + dx, c.y + ch / 2 + (li === 2 ? 0.12 : 0), true);
});
// others: dot at the top of the cell, name under it
[[6, "Competitor's response", 2, 0], [8, "Cannibalization", 1, 0], [7, "Customer preference change", 0, 1], [5, "Customer information safety", 0, 2]].forEach(([n, name, li, si]) => {
  const c = cell(li, si); dot(n, c.x + cw / 2, c.y + 0.42, false);
  T(name, c.x + 0.06, c.y + 0.68, cw - 0.12, ch - 0.74, { fontSize: 11, color: C.text, align: "center", valign: "top" });
});

// ---------------- panel 2: solutions for important risks ----------------
const tx = 6.66, tw = 12.95 - tx, rw = 2.75, sx = tx + rw + 0.15, sw = 12.95 - sx;
const ty = 2.3, rows = [
  ["Internal resistance", "Changes in functions and work relationships cause anger and panic",
    "Strengthen internal communication and provide employee training", "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
  ["Talent management", "Insufficient supply of trained salespersons for rapid expansion",
    "Make recruitment plan in advance", "Reduce labor demand with technology"],
  ["Supply chain mgmt.", "Rapid store expansion requires agile logistics",
    "Optimize logistics network", "Find reliable third-party logistic partner"],
  ["IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
];
const rh = (6.98 - ty) / rows.length;
rows.forEach(([name, desc, avoid, mitigate], i) => {
  const y = ty + i * rh;
  // risk cell: grey band, red number chip, bold name + description
  slide.addShape("rect", { x: tx, y: y + 0.05, w: rw, h: rh - 0.1, fill: { color: LIGHT }, line: { type: "none" } });
  slide.addShape("rect", { x: tx + 0.08, y: y + 0.14, w: 0.32, h: 0.32, fill: { color: RED }, line: { type: "none" } });
  T(String(i + 1), tx + 0.08, y + 0.14, 0.32, 0.32, { fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  slide.addText([{ text: name, options: { bold: true, breakLine: true } }, { text: desc, options: {} }],
    { x: tx + 0.5, y: y + 0.08, w: rw - 0.56, h: rh - 0.16, fontFace: F, fontSize: 11, color: C.text, valign: "top", margin: 0, isTextBox: true });
  // solutions cell: red bold [Avoid] / [Mitigate] tags (the deck's [Aim] / [How] form)
  slide.addText([
    { text: "[Avoid] ", options: { bold: true, color: RED } }, { text: avoid, options: { breakLine: true } },
    { text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: mitigate, options: {} },
  ], { x: sx, y: y + 0.08, w: sw, h: rh - 0.16, fontFace: F, fontSize: 10.5, color: C.text, valign: "middle", margin: 0, paraSpaceAfter: 4, isTextBox: true });
  if (i < rows.length - 1) slide.addShape("line", { x: tx, y: y + rh, w: tw, h: 0, line: { color: C.g2, width: 0.75, dashType: "dash" } });
});
// rules under the italic column headers (the headers themselves come from the stored slide, see build.py)
slide.addShape("line", { x: tx, y: 2.24, w: rw, h: 0, line: { color: C.g2, width: 1.5 } });
slide.addShape("line", { x: sx, y: 2.24, w: sw, h: 0, line: { color: C.g2, width: 1.5 } });

L.save(pres, __dirname + "/candidate.pptx");
