// C01 rebuild (run5 r2): executive summary as a decision framework (stage arrows x analysis dimensions / implications
// -> converging arrows -> goal bar), the exec-summary form `decisionFramework` of Style/refs/case-competitions-2019-2020.md,
// drawn in the Polaris profile (red main colour, grey panels, black 14 pt body) so the grid follows the prompt exactly:
// three stage arrows, two row labels, the strategy implication spanning Strategy Design and Implementation.
// Furniture taken from the deck's other slides: red filled boxes with white bold text and outlined red down arrow (slide 8),
// grey 7E7E7E label boxes with white text (slide 8), F1F1F1 grey panels (slide 16), red-outlined statement box (slide 8).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, P } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const C = P.C, F = P.THEME.bodyFontFace;
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.fontSize || 14, color: o.color || C.text,
  bold: !!o.bold, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0.06, isTextBox: true, paraSpaceAfter: o.psa || 0, objectName: o.name });

// grid
const X0 = 0.37, XR = 13.01, LW = 1.7, GAP = 0.12;
const CX = X0 + LW + GAP, CW = (XR - CX - 2 * GAP) / 3;
const col = (j) => CX + j * (CW + GAP);
const HY = 1.24, HH = 0.62;                  // stage arrows
const AY = 2.0, AH = 2.42;                   // analysis dimensions row
const IY = AY + AH + 0.14, IH = 1.2;         // implications row
const BY = 6.3, BH = 0.66;                   // goal bar

// 1. stage arrows (column headers)
["Market", "Strategy Design", "Implementation"].forEach((name, j) => {
  const x = col(j) - (j ? 0.06 : 0), w = CW + (j ? 0.06 : 0) + (j < 2 ? 0.2 : 0);
  slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: HY, w, h: HH, fill: { color: C.navy }, line: { type: "none" },
    objectName: j === 0 ? "form:decisionFramework stage" : "stage" });
  T(name, x + (j ? 0.35 : 0.15), HY, w - (j ? 0.6 : 0.45), HH, { fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle" });
});

// 2. row labels
[["Analysis\nDimensions", AY, AH], ["Implications", IY, IH]].forEach(([t, y, h]) => {
  slide.addShape("rect", { x: X0, y, w: LW, h, fill: { color: C.g3 }, line: { type: "none" } });
  T(t, X0, y, LW, h, { fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle" });
});

// 3. analysis dimensions: grey panels, main dimension bold with a bullet, sub-dimensions with a dash
const dims = [
  [["Market Overview", ["Industry Trends", "Key Drivers"]], ["Customer Analysis"], ["Competitive Analysis"]],
  [["Offline Strategy", ["Store Expansion", "Sales Per Store Improvement"]], ["Online Strategy", ["Enter new platforms", "Optimize operations"]], ["Omni-channel Strategy"]],
  [["Implementation Timeline"], ["Risk & Mitigation"], ["Financial Forecast"]],
];
dims.forEach((items, j) => {
  slide.addShape("rect", { x: col(j), y: AY, w: CW, h: AH, fill: { color: C.g1 }, line: { type: "none" } });
  const runs = [];
  items.forEach(([head, subs = []], i) => {
    const last = i === items.length - 1;
    runs.push({ text: head, options: { bold: true, fontSize: 14, bullet: { code: "25AA", indent: 18 }, indentLevel: 0, breakLine: true, paraSpaceAfter: subs.length || last ? 2 : 10 } });
    subs.forEach((s, k) => runs.push({ text: s, options: { fontSize: 14, bullet: { characterCode: "2013", indent: 18 }, indentLevel: 1, breakLine: true,
      paraSpaceAfter: k === subs.length - 1 && !last ? 10 : 2 } }));
  });
  runs[runs.length - 1].options.breakLine = false;
  T(runs, col(j) + 0.12, AY + 0.08, CW - 0.24, AH - 0.16, { valign: "middle" });
});

// 4. implications: red-outlined statement boxes; the strategy one spans Strategy Design and Implementation
const imp = [
  [col(0), CW, [{ text: "Pandora should follow " }, { text: "market trends", options: { bold: true, color: C.navy } }, { text: " and " },
    { text: "customer needs", options: { bold: true, color: C.navy } }, { text: " to find growth opportunities" }]],
  [col(1), 2 * CW + GAP, [{ text: "Based on position of " }, { text: "“a warm jewelry brand”", options: { bold: true, italic: true, color: C.navy } },
    { text: ", Pandora should implement strategies to regain " }, { text: "healthy growth", options: { bold: true, color: C.navy } }, { text: " in Mainland China" }]],
];
imp.forEach(([x, w, runs]) => {
  slide.addShape("rect", { x, y: IY, w, h: IH, fill: { color: C.white }, line: { color: C.navy, width: 1.5 } });
  T(runs, x + 0.15, IY + 0.05, w - 0.3, IH - 0.1, { fontSize: 16, align: "center", valign: "middle" });
  // 5. converging arrows into the goal bar (outlined red down arrow, as on slide 8)
  slide.addShape("downArrow", { x: x + w / 2 - 0.3, y: IY + IH + 0.06, w: 0.6, h: BY - IY - IH - 0.12, fill: { color: C.white }, line: { color: C.navy, width: 1.5 } });
});

// 6. goal bar
slide.addShape("rect", { x: X0, y: BY, w: XR - X0, h: BH, fill: { color: C.navy }, line: { type: "none" } });
T("Achieve healthy revenue growth in Mainland China jewelry market", X0, BY, XR - X0, BH, { fontSize: 18, bold: true, color: C.white, align: "center", valign: "middle" });

L.save(pres, __dirname + "/candidate.pptx");
