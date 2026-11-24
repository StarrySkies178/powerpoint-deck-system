// C01 rebuild 2: executive summary in the decision-framework form (stage arrows x analysis dimensions / implications -> goal bar),
// drawn in the Case-2019-Polaris style profile. Form from Style/refs/case-competitions.md §2 (decision framework) and the
// same team's 2017 GREE deck (its executive summary in Objects/store); look (red arrows, grey panels, vertical row labels, red conclusion bar,
// downward double chevrons) from the 2019 deck's other slides (4, 5, 13, 14, 16).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, prof } = L.start({
  ref: "Case-2019-Polaris",
  title: "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy",
  source: "Source: Polaris Analysis",
});
const C = P.C, F = P.THEME.bodyFontFace;
const RED = C.accent, GREY = C.g5, PANEL = C.g1, MID = "A2A2A2";

// grid
const X0 = prof.margins.left, X1 = 13.333 - prof.margins.right;   // 0.37 .. 13.01
const LBW = 0.42, GAP = 0.14, CX = X0 + LBW + 0.12, CW = (X1 - CX - 2 * GAP) / 3;
const colX = (j) => CX + j * (CW + GAP);
const HY = 1.17, HH = 0.58;              // stage arrows
const AY = 1.87, AH = 2.45;              // analysis row
const DY = AY + AH + 0.04, DH = 0.3;     // down chevrons between rows
const IY = DY + DH + 0.04, IH = 1.3;     // implication row
const GH = 0.56, GY = 7.0 - GH;          // goal bar

// stage arrows: first a pentagon, then chevrons, red with white bold text
["Market", "Strategy Design", "Implementation"].forEach((name, j) => {
  const x = colX(j) - (j ? 0.12 : 0), w = CW + (j ? 0.12 : 0) + (j < 2 ? 0.12 : 0);
  slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: HY, w, h: HH, fill: { color: RED }, line: { type: "none" }, rectRadius: 0 });
  slide.addText(name, { x: x + 0.25, y: HY, w: w - 0.55, h: HH, fontFace: F, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
});

// vertical row labels (as on the deck's customer slide)
function vlab(text, y, h, fill) {
  slide.addShape("rect", { x: X0, y, w: LBW, h, fill: { color: fill }, line: { type: "none" } });
  slide.addText(text, { x: X0 + LBW / 2 - h / 2, y: y + h / 2 - LBW / 2, w: h, h: LBW, rotate: 270, fontFace: F, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
}
vlab("Analysis Dimensions", AY, AH, GREY);
vlab("Implications", IY, IH, RED);

// analysis cells: grey panels; each dimension = red line icon + bold name + dash sub-points
const cells = [
  [["chart-line", "Market Overview", ["Industry Trends", "Key Drivers"]], ["users", "Customer Analysis", []], ["target", "Competitive Analysis", []]],
  [["building-store", "Offline Strategy", ["Store Expansion", "Sales Per Store Improvement"]], ["device-mobile", "Online Strategy", ["Enter new platforms", "Optimize operations"]], ["arrows-exchange", "Omni-channel Strategy", []]],
  [["calendar", "Implementation Timeline", []], ["shield-check", "Risk & Mitigation", []], ["coins", "Financial Forecast", []]],
];
const HL = 0.36, SL = 0.27, PAD = 0.16, IC = 0.34;
cells.forEach((items, j) => {
  const h = AH;
  slide.addShape("rect", { x: colX(j), y: AY, w: CW, h, fill: { color: PANEL }, line: { type: "none" } });
  const hs = items.map(([, , subs]) => HL + subs.length * SL);
  const gap = Math.min(0.55, (h - 2 * PAD - hs.reduce((a, b) => a + b, 0)) / (items.length - 1));
  let y = AY + PAD;
  items.forEach(([ic, name, subs], i) => {
    P.icon(slide, ic, colX(j) + 0.16, y + (HL - IC) / 2, IC, { color: RED });
    slide.addText(name, { x: colX(j) + 0.62, y, w: CW - 0.74, h: HL, fontFace: F, fontSize: 14, bold: true, color: "000000", valign: "middle", margin: 0 });
    if (subs.length) slide.addText(subs.map((t, k) => ({ text: t, options: { bullet: { code: "2013", indent: 12 }, breakLine: k < subs.length - 1 } })),
      { x: colX(j) + 0.62, y: y + HL, w: CW - 0.74, h: subs.length * SL, fontFace: F, fontSize: 13, color: "000000", valign: "top", margin: 0, lineSpacingMultiple: 0.95 });
    y += hs[i] + gap;
  });
});

// down double chevrons (as on the deck's platform slide): two stacked V shapes
function downTwin(cx, y, w = 0.5, h = 0.26) {
  const t = h * 0.45;
  [0, h - t].forEach((dy) => slide.addShape("custGeom", { x: cx - w / 2, y: y + dy, w, h: t, fill: { color: MID }, line: { type: "none" },
    points: [{ x: 0, y: 0 }, { x: w / 2, y: t * 0.55 }, { x: w, y: 0 }, { x: w, y: t * 0.45 }, { x: w / 2, y: t }, { x: 0, y: t * 0.45 }, { close: true }] }));
}
[0, 1, 2].forEach((j) => downTwin(colX(j) + CW / 2, DY + 0.02));

// implication cells: white boxes with a grey outline, key words bold red
const imps = [
  [{ text: "Pandora should follow " }, { text: "market trends", options: { bold: true, color: RED } }, { text: " and " }, { text: "customer needs", options: { bold: true, color: RED } }, { text: " to find growth opportunities" }],
  [{ text: "Based on position of " }, { text: "“a warm jewelry brand”", options: { bold: true, color: RED } }, { text: ", Pandora should implement strategies to " }, { text: "regain healthy growth", options: { bold: true, color: RED } }, { text: " in Mainland China" }],
];
// the strategy implication spans Strategy Design and Implementation (it is the strategy to implement)
const impBox = [{ x: colX(0), w: CW }, { x: colX(1), w: colX(2) + CW - colX(1) }];
imps.forEach((runs, j) => {
  const { x, w } = impBox[j];
  slide.addShape("rect", { x, y: IY, w, h: IH, fill: { color: "FFFFFF" }, line: { color: MID, width: 1 } });
  slide.addText(runs, { x: x + 0.2, y: IY, w: w - 0.4, h: IH, fontFace: F, fontSize: 14, color: "000000", valign: "middle", align: "center", margin: 0.04 });
});

// convergence: one line under all three columns, arrows down into the goal bar
const LY = IY + IH + 0.1;
const cxs = [0, 1, 2].map((j) => colX(j) + CW / 2);   // one drop under each stage, symmetric about the centre arrow
cxs.forEach((cx) => slide.addShape("line", { x: cx, y: IY + IH, w: 0, h: LY - IY - IH, line: { color: MID, width: 1.5 } }));
slide.addShape("line", { x: cxs[0], y: LY, w: cxs[2] - cxs[0], h: 0, line: { color: MID, width: 1.5 } });
downTwin(X0 + (X1 - X0) / 2, LY + 0.03, 0.5, GY - LY - 0.06);
slide.addShape("rect", { x: X0, y: GY, w: X1 - X0, h: GH, fill: { color: RED }, line: { type: "none" } });
slide.addText("Achieve healthy revenue growth in Mainland China jewelry market", { x: X0, y: GY, w: X1 - X0, h: GH, fontFace: F, fontSize: 18, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });

L.save(pres, __dirname + "/candidate.pptx");
