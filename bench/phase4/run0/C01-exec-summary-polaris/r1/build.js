// C01 rebuild 1: executive summary in the decision-framework form (Style/refs/case-competitions.md §2:
// stage chevrons x "analysis dimensions / implications" -> converging arrows -> goal bar), drawn in the
// Case-2019-Polaris style profile (red CC0000 main colour, Arial, 24 pt black title over a red rule).
// The stock decisionFramework() has no sub-bullets and needs an answer in every column, so the grid is
// laid out here with the generators' helpers and the profile's colours.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const title = "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, P } = L.start({ ref: "Case-2019-Polaris", title, source: "Source: Polaris Analysis" });
const C = P.C, T = (t, x, y, w, h, o) => P.txt(slide, t, x, y, w, h, { keepSize: true, noScale: true, ...o });

// grid (profile margins: left 0.37, right edge 12.98, body top 1.13, source line 7.23)
const X0 = 0.37, XR = 12.98, LW = 1.6, GAP = 0.18;
const cx0 = X0 + LW + 0.1, cw = (XR - cx0 - 2 * GAP) / 3;
const colX = (j) => cx0 + j * (cw + GAP);
const yHead = 1.22, hHead = 0.62;
const yA = 2.02, hA = 2.32;              // analysis dimensions row
const yDiv = yA + hA + 0.1;             // divider with down triangle
const yI = yDiv + 0.24, hI = 1.3;        // implications row
const yBar = 6.48, hBar = 0.6;           // goal bar

// column headers as arrows
const heads = ["Market", "Strategy Design", "Implementation"];
heads.forEach((h, j) => {
  const x = colX(j);
  slide.addShape(j === 0 ? "homePlate" : "chevron", { x: x - (j ? GAP : 0), y: yHead, w: cw + (j ? GAP : 0), h: hHead,
    fill: { color: C.navy }, line: { type: "none" }, rectRadius: 0 });
  T(h, x + 0.25, yHead, cw - 0.4, hHead, { fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle", onDark: true, margin: 0 });
});

// row labels
const label = (t, y, h) => {
  slide.addShape("rect", { x: X0, y, w: LW, h, fill: { color: C.g1 }, line: { type: "none" } });
  T(t, X0 + 0.08, y, LW - 0.16, h, { fontSize: 14, bold: true, color: C.navy, align: "center", valign: "middle" });
};
label("Analysis Dimensions", yA, hA);
label("Implications", yI, hI);

// analysis dimensions: bold main items, en-dash sub-items (as slide 8 / 16 of the deck write them)
const dims = [
  [["Market Overview", ["Industry Trends", "Key Drivers"]], ["Customer Analysis"], ["Competitive Analysis"]],
  [["Offline Strategy", ["Store Expansion", "Sales Per Store Improvement"]], ["Online Strategy", ["Enter new platforms", "Optimize operations"]], ["Omni-channel Strategy"]],
  [["Implementation Timeline"], ["Risk & Mitigation"], ["Financial Forecast"]],
];
dims.forEach((items, j) => {
  const x = colX(j);
  const runs = [];
  items.forEach(([main, subs], k) => {
    runs.push({ text: main, options: { bold: true, fontSize: 14, bullet: { indent: 13 }, color: C.text, breakLine: true, paraSpaceBefore: k ? (j === 2 ? 14 : 9) : 0 } });
    (subs || []).forEach((s) => runs.push({ text: s, options: { fontSize: 12, color: C.text, bullet: { code: "2013", indent: 11 }, indentLevel: 1, breakLine: true, paraSpaceBefore: 3 } }));
  });
  runs[runs.length - 1].options.breakLine = false;
  const last = j === 2;                 // Implementation has no implication of its own: its column runs straight to the goal
  slide.addText(runs, { x: x + 0.12, y: yA + 0.1, w: cw - 0.2, h: (last ? yI + hI - yA : hA) - 0.2, fontFace: "Arial", valign: "top", margin: 0.04, isTextBox: true });
  if (last) return;
  // divider with down triangle (the analysis feeds the implication)
  slide.addShape("line", { x: x + 0.1, y: yDiv, w: cw - 0.2, h: 0, line: { color: C.navy, width: 1.5 } });
  slide.addShape("triangle", { x: x + cw / 2 - 0.15, y: yDiv, w: 0.3, h: 0.16, fill: { color: C.navy }, line: { type: "none" }, flipV: true });
});
// Implementation feeds the goal directly: a tint arrow down its column into the converging band
slide.addShape("downArrow", { x: colX(2) + cw / 2 - 0.3, y: yDiv - 0.2, w: 0.6, h: yI + hI - yDiv + 0.26,
  fill: { color: C.hiBand }, line: { type: "none" } });
// dashed column separators, as the deck divides its panels
[0, 1].forEach((j) => {
  const x = colX(j) + cw + GAP / 2;
  slide.addShape("line", { x, y: yA, w: 0, h: yI + hI - yA, line: { color: C.g3, width: 0.75, dashType: "dash" } });
});

// implications (grey reading boxes, key words bold in the main colour)
const K = (t) => ({ text: t, options: { bold: true, color: C.navy } }), N = (t) => ({ text: t, options: {} });
const impl = [
  [N("Pandora should follow "), K("market trends"), N(" and "), K("customer needs"), N(" to find growth opportunities")],
  [N("Based on position of "), K("“a warm jewelry brand”"), N(", Pandora should implement strategies to regain "), K("healthy growth"), N(" in Mainland China")],
];
impl.forEach((runs, j) => {
  const x = colX(j);
  slide.addShape("rect", { x, y: yI, w: cw, h: hI, fill: { color: C.g1 }, line: { type: "none" } });
  slide.addText(runs, { x: x + 0.12, y: yI, w: cw - 0.24, h: hI, fontFace: "Arial", fontSize: 14, color: C.text, valign: "middle", margin: 0.04, isTextBox: true });
});
// everything converges into the goal bar
const yC = yI + hI + 0.06, hC = yBar - yC - 0.04;
slide.addShape("trapezoid", { x: cx0, y: yC, w: XR - cx0, h: hC, fill: { color: C.hiBand }, line: { type: "none" }, flipV: true });
slide.addShape("rect", { x: X0, y: yBar, w: XR - X0, h: hBar, fill: { color: C.navy }, line: { type: "none" } });
T("Achieve healthy revenue growth in Mainland China jewelry market", X0, yBar, XR - X0, hBar, { fontSize: 18, bold: true, color: C.white, onDark: true, align: "center", valign: "middle" });

L.save(pres, __dirname + "/candidate.pptx");
