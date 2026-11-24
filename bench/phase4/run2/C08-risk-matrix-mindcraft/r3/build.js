// C08 risk matrix in the Case-2019-Mindcraft style (deck as reference, leave-one-out).
// Approach: the deck's style profile (title, red rule, panel chips, source line) + composeSlide with explicit regions
// taken from the deck's HALF2 sibling (slide 14 skeleton via scripts/layout_skeleton.py), panel 1 a 3x3 heat map
// drawn in the deck's greys with a red dashed priority zone, panel 2 a Risks | Solutions grid in the form of
// Mindcraft 8 ([Aim]/[How] tags in red bold, grey filled cells, dashed row rules).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
const { pres, slide, P, S, HOUSE } = L.start({ ref: "Case-2019-Mindcraft", title: TITLE, source: "Source: MindCraft Analysis" });
const C = P.C, FONT = "Verdana";
const RED = "C00000", G1 = "F1F1F1", G2 = "D5D5D5", G3 = "A6A6A6", G4 = "808080", G5 = "5C5C5C";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || 12, color: o.color || "000000",
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0.03, isTextBox: true, rotate: o.rotate,
  paraSpaceAfter: o.psa || 0 });

// ---- breadcrumb as the deck draws it: bold italic, grey items, current item red, red triangles between (fixed x positions)
[["Market Analysis", 0.36, false], ["Growth Strategy", 2.89, false], ["Risk & Mitigation", 5.56, true]].forEach(([t, x, cur]) =>
  T(t, x, 0.03, 3.0, 0.32, { size: 14, bold: true, italic: true, color: cur ? RED : G3, margin: 0, valign: "middle" }));
[2.47, 5.2].forEach((x) => slide.addShape("triangle", { x, y: 0.07, w: 0.24, h: 0.24, rotate: 90, fill: { color: RED }, line: { type: "none" } }));

// ---- footer furniture of the deck's master: grey rule over the source line, MindCraft logo bottom right
slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: "B4B4B4", width: 0.75 } });
slide.addImage({ path: path.join(__dirname, "mindcraft-logo.png"), x: 11.64, y: 7.17, w: 1.137, h: 0.325, altText: "MindCraft logo" });

// ---- panel 1: risk heat map (likelihood x severity, 3 x 3)
function heatMap(sl, b) {
  const lab = ["Low", "Medium", "High"];
  const ax = b.x + 0.72, aw = b.w - 0.74, top = b.y + 0.42, ah = b.h - 1.22, cw = aw / 3, ch = ah / 3;
  const shade = [G1, G1, G2, G3, G4];                      // by likelihood + severity: grey does the work
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {   // r = likelihood index (0 low), c = severity index
    sl.addShape("rect", { x: ax + c * cw, y: top + (2 - r) * ch, w: cw, h: ch, fill: { color: shade[r + c] }, line: { color: "FFFFFF", width: 2 } });
  }
  lab.forEach((t, i) => T(t, ax - 0.24 - ch / 2, top + (2.5 - i) * ch - 0.17, ch, 0.34, { size: 12, italic: true, align: "center", valign: "middle", margin: 0, rotate: 270 }));
  lab.forEach((t, i) => T(t, ax + i * cw, top + ah + 0.04, cw, 0.3, { size: 12, italic: true, align: "center", margin: 0 }));
  // axes with arrow heads, deck grey
  sl.addShape("line", { x: ax, y: top + ah, w: aw, h: 0, line: { color: G5, width: 1.25, endArrowType: "triangle" } });
  sl.addShape("line", { x: ax, y: top, w: 0, h: ah, line: { color: G5, width: 1.25, beginArrowType: "triangle" } });
  T("Severity", ax, top + ah + 0.36, aw, 0.32, { size: 14, bold: true, align: "center", margin: 0 });
  T("Likelihood", b.x - ah / 2 + 0.14, top + ah / 2 - 0.16, ah, 0.32, { size: 14, bold: true, align: "center", margin: 0, rotate: 270 });
  // top priority zone: medium + high likelihood at high severity
  const zx = ax + 2 * cw + 0.06, zy = top + 0.06, zw = cw - 0.12, zh = 2 * ch - 0.12;
  sl.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: RED, width: 2, dashType: "dash" } });
  T("Top priority", ax + 2 * cw, top - 0.36, cw, 0.3, { size: 12, bold: true, italic: true, color: RED, align: "center", margin: 0 });
  const d = 0.42, dot = (id, cx, cy, hot) => {
    sl.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : G5 }, line: { color: "FFFFFF", width: 1.25 } });
    T(String(id), cx - d / 2, cy - d / 2, d, d, { size: 14, bold: true, italic: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  };
  const cx = (c) => ax + (c + 0.5) * cw, cy = (r) => top + (2.5 - r) * ch;
  // risks 1-4: in the zone, two per cell
  dot(1, cx(2) - 0.3, cy(2) + 0.12, true); dot(2, cx(2) + 0.3, cy(2) + 0.12, true);
  dot(3, cx(2) - 0.3, cy(1), true); dot(4, cx(2) + 0.3, cy(1), true);
  // other risks: dot with its name under it, inside the cell
  [[6, 2, 0, "Competitor's response"], [8, 1, 0, "Cannibalization"], [7, 0, 1, "Customer preference change"], [5, 0, 2, "Customer information safety"]]
    .forEach(([id, r, c, name]) => {
      dot(id, cx(c), top + (2 - r) * ch + 0.38, false);
      T(name, ax + c * cw + 0.02, top + (2 - r) * ch + 0.64, cw - 0.04, ch - 0.68, { size: 11, align: "center", margin: 0 });
    });
}

// ---- panel 2: Risks | Solutions
const RISKS = [
  { id: 1, name: "Internal resistance", desc: "Changes in functions and work relationships cause anger and panic",
    avoid: "Strengthen internal communication and provide employee training",
    mitigate: "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary" },
  { id: 2, name: "Talent management", desc: "Insufficient supply of trained salespersons for rapid expansion",
    avoid: "Make recruitment plan in advance", mitigate: "Reduce labor demand with technology" },
  { id: 3, name: "Supply chain mgmt.", desc: "Rapid store expansion requires agile logistics",
    avoid: "Optimize logistics network", mitigate: "Find reliable third-party logistic partner" },
  { id: 4, name: "IT system upgrade", desc: "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    avoid: "Make upgrade plan in advance; careful selection of new system supplier", mitigate: "Hire external technology experts for help" },
];
function solutionTable(sl, b) {
  const nw = 0.5, rw = 2.45, sx = b.x + nw + rw + 0.1, sw = b.x + b.w - sx, hh = 0.4, size = 13;
  T("Risks", b.x + nw, b.y, rw, hh, { size: 14, bold: true, italic: true, color: G5, align: "center", valign: "middle" });
  T("Solutions", sx, b.y, sw, hh, { size: 14, bold: true, italic: true, color: G5, align: "center", valign: "middle" });
  const weights = [7.0, 4.0, 3.5, 5.6], tot = weights.reduce((a, v) => a + v, 0), avail = b.h - hh - 0.08;
  let y = b.y + hh + 0.08;
  RISKS.forEach((r, i) => {
    const h = (avail * weights[i]) / tot;
    const d = 0.42;
    slide.addShape("ellipse", { x: b.x + 0.02, y: y + 0.1, w: d, h: d, fill: { color: RED }, line: { color: "FFFFFF", width: 1.25 } });
    T(String(r.id), b.x + 0.02, y + 0.1, d, d, { size: 14, bold: true, italic: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    T([{ text: r.name, options: { bold: true, breakLine: true } }, { text: r.desc }], b.x + nw, y + 0.06, rw, h - 0.12, { size, valign: "top" });
    sl.addShape("rect", { x: sx, y: y + 0.04, w: sw, h: h - 0.08, fill: { color: G1 }, line: { type: "none" } });
    T([{ text: "[Avoid] ", options: { bold: true, color: RED } }, { text: r.avoid, options: { breakLine: true } },
       { text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: r.mitigate }],
      sx + 0.06, y + 0.04, sw - 0.1, h - 0.08, { size, valign: "middle", psa: 3 });
    if (i < RISKS.length - 1) sl.addShape("line", { x: b.x, y: y + h, w: b.w, h: 0, line: { color: G3, width: 1, dashType: "dash" } });
    y += h;
  });
  // solid rule under the header, as under the deck's table headers
  sl.addShape("line", { x: b.x + nw, y: b.y + hh + 0.02, w: b.w - nw, h: 0, line: { color: "000000", width: 1 } });
}

S.composeSlide(pres, slide, {
  regions: [{ x: 0.37, y: 1.37, w: 5.15, h: 5.72 }, { x: 5.8, y: 1.37, w: 7.22, h: 5.72 }],
  panels: [
    { headline: "Risk mapping", draw: heatMap },
    { headline: "Solutions for important risks", draw: solutionTable },
  ],
});
L.save(pres, __dirname + "/candidate.pptx");
