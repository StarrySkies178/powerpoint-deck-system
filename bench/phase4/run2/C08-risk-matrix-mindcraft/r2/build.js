// C08 run2 r2: risk heat map + risk -> solution table, in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Layout: HALF2, panel boxes from the deck's slide 14 (scripts/layout_skeleton.py Templates/Case-2019-Mindcraft.pptx 14).
// Forms taken from the deck's other slides: breadcrumb with red triangles (slides 8, 10, 14), red numbered panel heads
// (profile.panel), dashed red callout zone with bold italic red label (slide 7 "Underpenetrated"), red bold [label] runs
// inside text (slide 8 "[Aim]" / "[How]"), bold italic table header over grey-banded cells (slide 7 panel 1.1),
// grey rule + red logo text at the foot (every content slide).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
const { pres, slide, P, S } = L.start({ ref: "Case-2019-Mindcraft", title: TITLE, source: [{ text: "Source: MindCraft Analysis", options: { italic: true } }] });
const C = P.C, F = P.THEME.bodyFontFace;
const RED = "C00000", GREY_T = "A6A6A6", LBL = 12;   // profile: main C00000, body 14 pt, labels 12 pt
const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.fontSize || LBL, bold: !!o.bold, italic: !!o.italic,
  color: o.color || "000000", align: o.align || "left", valign: o.valign || "top", margin: 0, isTextBox: true });

// ---- breadcrumb (fixed slots, as on the deck's slides 8 and 14): bold italic 14 pt, grey; current in red; red triangles
const crumb = ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], cur = 2, cx = [0.37, 2.88, 5.56], tx = [2.44, 5.18];
crumb.forEach((c, i) => slide.addText(c, { x: cx[i], y: 0.04, w: 2.6, h: 0.3, fontFace: F, fontSize: 14, bold: true, italic: true,
  color: i === cur ? RED : GREY_T, margin: 0, valign: "middle", isTextBox: true }));
tx.forEach((x) => slide.addShape("triangle", { x, y: 0.07, w: 0.22, h: 0.23, rotate: 90, fill: { color: RED }, line: { type: "none" } }));

// ---- foot: grey rule and the team's logo text, as on every content slide of the deck
slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: "BFBFBF", width: 0.75 } });
slide.addText([{ text: "MindCraft", options: { bold: true, color: RED } }], { x: 11.15, y: 7.24, w: 1.4, h: 0.23, fontFace: F, fontSize: 12, margin: 0, align: "right", valign: "middle", isTextBox: true });

// ---- panel 1: 3 x 3 heat map (likelihood x severity), numbered risks, dashed "Top priority" zone
const risks = [
  { id: 1, name: "Internal resistance", L: 2, S: 2 }, { id: 2, name: "Talent management", L: 2, S: 2 },
  { id: 3, name: "Supply chain mgmt.", L: 1, S: 2 }, { id: 4, name: "IT system upgrade", L: 1, S: 2 },
  { id: 5, name: "Customer information safety", L: 0, S: 2 }, { id: 6, name: "Competitor's response", L: 2, S: 0 },
  { id: 7, name: "Customer preference change", L: 0, S: 1 }, { id: 8, name: "Cannibalization", L: 1, S: 0 },
];
const levels = ["Low", "Medium", "High"];
function heatMap(sl, b) {
  const yAx = 0, rowLab = 0.9, x0 = b.x + yAx + rowLab, gw = b.x + b.w - 0.02 - x0, cw = gw / 3;
  const top = 0.42, y0 = b.y + top, gh = b.h - top - 0.72, ch = gh / 3, gap = 0.05;
  const shade = (s) => (s >= 3 ? "A6A6A6" : s === 2 ? "D5D5D5" : "F1F1F1");      // the deck's own greys, darker = more critical
  for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++)
    sl.addShape("rect", { x: x0 + s * cw + gap / 2, y: y0 + (2 - l) * ch + gap / 2, w: cw - gap, h: ch - gap, fill: { color: shade(l + s) }, line: { type: "none" } });
  // axes: arrows, level labels, axis titles
  sl.addShape("line", { x: x0, y: y0 + gh + 0.04, w: gw, h: 0, line: { color: "5C5C5C", width: 1.25, endArrowType: "triangle" } });
  sl.addShape("line", { x: x0 - 0.04, y: y0, w: 0, h: gh, line: { color: "5C5C5C", width: 1.25, beginArrowType: "triangle" } });
  levels.forEach((lv, i) => {
    t(lv, x0 - rowLab - 0.02, y0 + (2 - i) * ch, rowLab - 0.06, ch, { fontSize: 14, align: "right", valign: "middle" });
    t(lv, x0 + i * cw, y0 + gh + 0.08, cw, 0.28, { fontSize: 14, align: "center", valign: "middle" });
  });
  t("Severity", x0, y0 + gh + 0.38, gw, 0.3, { fontSize: 14, bold: true, italic: true, align: "center", valign: "middle" });
  t("Likelihood", b.x, b.y + 0.02, 2.2, top - 0.04, { fontSize: 14, bold: true, italic: true, valign: "middle" });   // y-axis title over the axis, in the strip above the grid
  // top-priority zone: severity High, likelihood Medium-High, label in the strip above the grid (deck's dashed red callout)
  const zx = x0 + 2 * cw - 0.02, zy = b.y + 0.02;
  sl.addShape("rect", { x: zx, y: zy, w: cw + 0.04, h: y0 + 2 * ch - zy + 0.02, fill: { type: "none" }, line: { color: RED, width: 1.5, dashType: "dash" } });
  t("Top priority", zx, zy, cw + 0.04, top - 0.04, { fontSize: 14, bold: true, italic: true, color: RED, align: "center", valign: "middle" });
  // numbered risks: in the priority zone the numbers alone (names are in the table beside, same numbers),
  // elsewhere the number over its name, centred in the cell
  for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++) {
    const inCell = risks.filter((r) => r.L === l && r.S === s); if (!inCell.length) continue;
    const hot = s === 2 && l >= 1, cxl = x0 + s * cw, cyt = y0 + (2 - l) * ch;
    if (hot) {
      const d = 0.46, g = 0.2, x1 = cxl + (cw - inCell.length * d - (inCell.length - 1) * g) / 2;
      inCell.forEach((r, k) => { const ex = x1 + k * (d + g), ey = cyt + (ch - d) / 2;
        sl.addShape("ellipse", { x: ex, y: ey, w: d, h: d, fill: { color: RED }, line: { color: "FFFFFF", width: 1.5 } });
        t(String(r.id), ex, ey, d, d, { fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" }); });
    } else {
      const d = 0.36, r = inCell[0], ex = cxl + (cw - d) / 2, ey = cyt + 0.1;
      sl.addShape("ellipse", { x: ex, y: ey, w: d, h: d, fill: { color: "5C5C5C" }, line: { color: "FFFFFF", width: 1 } });
      t(String(r.id), ex, ey, d, d, { fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
      t(r.name, cxl + 0.03, ey + d + 0.04, cw - 0.06, ch - d - 0.2, { fontSize: LBL, align: "center", valign: "top" });
    }
  }
}

// ---- panel 2: risks -> solutions table, the same numbers as the heat map
const rows = [
  { id: 1, name: "Internal resistance", desc: "Changes in functions and work relationships cause anger and panic",
    avoid: "Strengthen internal communication and provide employee training", mitigate: "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary" },
  { id: 2, name: "Talent management", desc: "Insufficient supply of trained salespersons for rapid expansion",
    avoid: "Make recruitment plan in advance", mitigate: "Reduce labor demand with technology" },
  { id: 3, name: "Supply chain mgmt.", desc: "Rapid store expansion requires agile logistics",
    avoid: "Optimize logistics network", mitigate: "Find reliable third-party logistic partner" },
  { id: 4, name: "IT system upgrade", desc: "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    avoid: "Make upgrade plan in advance; careful selection of new system supplier", mitigate: "Hire external technology experts for help" },
];
function solutionTable(sl, b) {
  const dash = { type: "dash", color: "A6A6A6", pt: 0.75 }, none = { type: "none" }, white = { type: "solid", color: "FFFFFF", pt: 2 };
  const hdr = (text) => ({ text, options: { fontSize: 14, bold: true, italic: true, color: "000000", align: "center", valign: "middle", border: [none, none, { type: "solid", color: "000000", pt: 1 }, none] } });
  const head = [{ ...hdr("Risks"), options: { ...hdr("Risks").options, colspan: 2 } }, hdr("Solutions")];
  const body = rows.map((r, i) => {
    const last = i === rows.length - 1, bb = last ? { type: "solid", color: "A6A6A6", pt: 0.75 } : dash;
    return [
      { text: String(r.id), options: { fontSize: 14, bold: true, color: "FFFFFF", fill: { color: RED }, align: "center", valign: "middle", border: [none, white, white, none] } },
      { text: [{ text: r.name, options: { fontSize: 14, bold: true, breakLine: true } }, { text: r.desc, options: {} }],
        options: { fill: { color: "F1F1F1" }, valign: "middle", margin: [0.03, 0.06, 0.03, 0.08], border: [none, white, white, none] } },
      { text: [{ text: "[Avoid] ", options: { bold: true, color: RED } }, { text: r.avoid, options: { breakLine: true } },
               { text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: r.mitigate, options: {} }],
        options: { fontSize: 14, valign: "middle", margin: [0.03, 0.03, 0.03, 0.1], border: [none, none, bb, none] } },
    ];
  });
  const hh = 0.32, weights = [1.45, 0.95, 0.9, 1.2], tot = weights.reduce((a, c) => a + c, 0), avail = b.h - hh - 0.04;
  slide.addTable([head, ...body], { x: b.x, y: b.y, w: b.w, colW: [0.34, 2.5, b.w - 2.84], rowH: [hh, ...weights.map((w) => (avail * w) / tot)],
    fontFace: F, fontSize: LBL, color: "000000", valign: "middle", margin: 0.06, objectName: "form:dataTable risks-solutions" });
}

S.composeSlide(pres, slide, {
  regions: [{ x: 0.36, y: 1.37, w: 5.1, h: 5.4 }, { x: 5.72, y: 1.37, w: 7.29, h: 5.4 }],
  panels: [
    { headline: "Risk mapping", draw: heatMap },
    { headline: "Solutions for important risks", draw: solutionTable },
  ],
});
L.save(pres, __dirname + "/candidate.pptx");
