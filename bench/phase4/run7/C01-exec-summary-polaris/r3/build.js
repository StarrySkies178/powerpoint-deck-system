// C01 rebuild (run7 r3): executive summary in the decision-framework form
// (Style/refs/case-competitions.md §2: stage arrows x "analysis dimensions / implications" -> goal bar),
// drawn in the Case-2019-Polaris profile: red main colour, grey F1F1F1 panels, red bars with white bold text,
// body 14 pt. Form also seen in Case-2017-Polaris-GREE-digital (row labels left, numbered stage arrows).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Executive Summary: Pandora’s growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, P } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const C = P.C, FONT = P.THEME.bodyFontFace;
const RED = C.navy, PANEL = C.g1, MID = "D5D5D5", WHITE = "FFFFFF", BLACK = C.text;
const TINT = "FFC2C2", DARK = C.g3;   // the deck's light red (header tint, Polaris 4 "Demand Side") and mid grey (Polaris 8 driver boxes)
// red fill is kept for the one key point, the goal bar

// ---- grid ----
const X0 = 0.37, LBLW = 1.55, CX = X0 + LBLW + 0.13, RIGHT = 12.98, GAP = 0.12;
const CW = (RIGHT - CX - 2 * GAP) / 3, colX = (j) => CX + j * (CW + GAP);
const HY = 1.2, HH = 0.6;               // stage arrows
const AY = 1.95, AH = 2.2;             // analysis dimensions row
const ARY = AY + AH + 0.08, ARH = 0.32; // arrows down to implications
const IY = ARY + ARH + 0.07, IH = 1.15;  // implications row
const GY = 6.38, GH = 0.55;             // goal bar

const box = (x, y, w, h, fill) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
const text = (t, x, y, w, h, o = {}) => slide.addText(t, { x, y, w, h, fontFace: FONT, fontSize: o.pt || 14, color: o.color || BLACK, bold: !!o.bold,
  align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.06, isTextBox: true, paraSpaceAfter: o.after || 0 });
const downChevron = (cx, y, w, h, fill) => slide.addShape("chevron", { x: cx - h / 2, y: y + h / 2 - w / 2, w: h, h: w, rotate: 90, fill: { color: fill }, line: { type: "none" } });

// ---- row labels (left) ----
box(X0, AY, LBLW, AH, TINT);
text("Analysis Dimensions", X0, AY, LBLW, AH, { bold: true, align: "center" });
box(X0, IY, LBLW, IH, TINT);
text("Implications", X0, IY, LBLW, IH, { bold: true, align: "center" });

// ---- stage arrows (column headers) ----
const stages = ["Market", "Strategy Design", "Implementation"];
stages.forEach((s, j) => {
  const x = colX(j);
  slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: HY, w: CW + (j < 2 ? GAP + 0.05 : 0), h: HH, fill: { color: DARK }, line: { color: WHITE, width: 1.5 } });
  text(s, x + (j ? 0.3 : 0.1), HY, CW - 0.45, HH, { bold: true, color: WHITE, align: "center", pt: 16 });
});

// ---- analysis dimensions: L1 bold with a bullet, L2 dash sub-items ----
const L1 = (t, last) => ({ text: t, options: { bold: true, bullet: { indent: 14 }, breakLine: !last, paraSpaceBefore: 10 } });
const L2 = (t, last) => ({ text: t, options: { bullet: { code: "2013", indent: 14 }, indentLevel: 1, breakLine: !last } });
const analysis = [
  [L1("Market Overview"), L2("Industry Trends"), L2("Key Drivers"), L1("Customer Analysis"), L1("Competitive Analysis", true)],
  [L1("Offline Strategy"), L2("Store Expansion"), L2("Sales Per Store Improvement"), L1("Online Strategy"), L2("Enter new platforms"), L2("Optimize operations"), L1("Omni-channel Strategy", true)],
  [L1("Implementation Timeline"), L1("Risk & Mitigation"), L1("Financial Forecast", true)],
];
analysis.forEach((runs, j) => {
  box(colX(j), AY, CW, AH, PANEL);
  text(runs, colX(j) + 0.12, AY + 0.08, CW - 0.24, AH - 0.16, { valign: "top", margin: 0.05 });
});

// ---- arrows down from each column ----
[0, 1, 2].forEach((j) => downChevron(colX(j) + CW / 2, ARY, 0.9, ARH, MID));

// ---- implications: market (col 1), strategy (cols 2-3) ----
const IMPL = [
  { x: colX(0), w: CW, t: "Pandora should follow market trends and customer needs to find growth opportunities" },
  { x: colX(1), w: 2 * CW + GAP, t: "Based on position of “a warm jewelry brand”, Pandora should implement strategies to regain healthy growth in Mainland China" },
];
IMPL.forEach((im) => {
  box(im.x, IY, im.w, IH, PANEL);
  slide.addShape("line", { x: im.x, y: IY, w: im.w, h: 0, line: { color: RED, width: 2 } });
  text(im.t, im.x + 0.12, IY + 0.04, im.w - 0.24, IH - 0.08, { bold: true, align: "center" });
});

// ---- everything converges into the goal bar ----
const CY = IY + IH + 0.05, CH = GY - CY - 0.05;
const BW = (RIGHT - CX) * 0.8, BX = CX + (RIGHT - CX - BW) / 2;   // the bar is narrower than the grid: the funnel above it converges
slide.addShape("trapezoid", { x: CX, y: CY, w: RIGHT - CX, h: CH, flipV: true, adjustPoint: 0.25, fill: { color: MID }, line: { type: "none" } });
box(BX, GY, BW, GH, RED);
text("Achieve healthy revenue growth in Mainland China jewelry market", BX, GY, BW, GH, { bold: true, color: WHITE, align: "center", pt: 16 });

// page number: the master's number field, started at the prompt's page by build.py

L.save(pres, __dirname + "/candidate.pptx");
