// C01 run1 r1: executive summary as a decision-framework grid, in the Case-2019-Polaris look.
// Form: decision framework (stage arrows x analysis dimensions -> implications -> goal bar), as studied in
// Style/refs/case-competitions.md §2 (the same team's 2017 GREE deck uses this form too).
// Look taken from the deck's other slides: red header boxes with white bold text (slides 9, 13), grey
// filled labels with white bold text (slide 8), light grey panels (slide 13), red-outlined boxes (slide 9),
// grey down chevrons into a red conclusion bar with white bold text (slide 13), "–" sub-points (slide 8).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const TITLE = "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, P, prof } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });

const R = prof.roles, RED = R.main, GREY = R.grey3, PANEL = R.panel, BLACK = R.text, WHITE = "FFFFFF";
const FONT = prof.fonts.latin, BODY_PT = prof.body.pt;

// ---------- grid ----------
const X0 = prof.margins.left, XR = 13.333 - prof.margins.right;   // 0.37 .. 13.01
const LW = 1.72, GAP = 0.14;                                       // row-label column
const CX = X0 + LW + GAP, CW = (XR - CX - 2 * GAP) / 3;           // three stage columns
const colX = (j) => CX + j * (CW + GAP);
const Y_HEAD = 1.2, H_HEAD = 0.62;
const Y_AN = Y_HEAD + H_HEAD + 0.14, H_AN = 2.5;
const Y_CH1 = Y_AN + H_AN + 0.06, H_CH = 0.26;
const Y_IM = Y_CH1 + H_CH + 0.06, H_IM = 1.0;
const Y_BAR = 6.32, H_BAR = 0.6;

const box = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" }, line: line ? { color: line, width: 1.5 } : { type: "none" } });
const text = (t, x, y, w, h, o = {}) => slide.addText(t, { x, y, w, h, fontFace: FONT, fontSize: o.pt || BODY_PT, color: o.color || BLACK, bold: !!o.bold,
  italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.06, isTextBox: true, paraSpaceAfter: o.after || 0 });
// down chevron of visual size w x h: drawn as a right chevron (h x w) turned 90 degrees about its centre
const downChev = (cx, y, w = 0.5, h = H_CH) => slide.addShape("chevron", { x: cx - h / 2, y: y + h / 2 - w / 2, w: h, h: w, rotate: 90, fill: { color: R.grey4 }, line: { type: "none" } });

// ---------- column headers: stage arrows ----------
const STAGES = ["Market", "Strategy Design", "Implementation"];
STAGES.forEach((s, j) => {
  const x = colX(j), w = CW + (j < 2 ? GAP + 0.12 : 0);
  slide.addShape(j === 0 ? "homePlate" : "chevron", { x: j ? x - 0.12 : x, y: Y_HEAD, w: j ? w + 0.12 : w, h: H_HEAD, fill: { color: RED }, line: { color: WHITE, width: 1.5 } });
  text(s, x + (j ? 0.25 : 0.1), Y_HEAD, CW - 0.45, H_HEAD, { bold: true, color: WHITE, align: "center", pt: 16 });
});

// ---------- row labels ----------
box(X0, Y_AN, LW, H_AN, GREY);
text("Analysis Dimensions", X0, Y_AN, LW, H_AN, { bold: true, color: WHITE, align: "center", pt: 16 });
box(X0, Y_IM, LW, H_IM, GREY);
text("Implications", X0, Y_IM, LW, H_IM, { bold: true, color: WHITE, align: "center", pt: 16 });

// ---------- analysis dimensions: bullets with "–" sub-points ----------
const head = (t) => ({ text: t, options: { bold: true, bullet: { indent: 14 }, breakLine: true, paraSpaceBefore: 8 } });
const sub = (t) => ({ text: t, options: { bullet: { characterCode: "2013", indent: 14 }, indentLevel: 1, breakLine: true, paraSpaceBefore: 2 } });
const DIMS = [
  [head("Market Overview"), sub("Industry Trends"), sub("Key Drivers"), head("Customer Analysis"), head("Competitive Analysis")],
  [head("Offline Strategy"), sub("Store Expansion"), sub("Sales Per Store Improvement"), head("Online Strategy"), sub("Enter new platforms"), sub("Optimize operations"), head("Omni-channel Strategy")],
  [head("Implementation Timeline"), head("Risk & Mitigation"), head("Financial Forecast")],
];
DIMS.forEach((runs, j) => {
  runs[runs.length - 1].options.breakLine = false;
  box(colX(j), Y_AN, CW, H_AN, PANEL);
  text(runs, colX(j) + 0.08, Y_AN + 0.04, CW - 0.16, H_AN - 0.08, { valign: "middle", margin: 0.08 });
  downChev(colX(j) + CW / 2, Y_CH1);
});

// ---------- implications: the strategy implication covers strategy design and its implementation ----------
const IMPL = [
  { j0: 0, j1: 0, t: "Pandora should follow market trends and customer needs to find growth opportunities" },
  { j0: 1, j1: 2, t: [{ text: "Based on position of " }, { text: "“a warm jewelry brand”", options: { bold: true, color: RED } },
    { text: ", Pandora should implement strategies to regain healthy growth in Mainland China" }] },
];
const mids = [];
IMPL.forEach((im) => {
  const x = colX(im.j0), w = colX(im.j1) + CW - x;
  box(x, Y_IM, w, H_IM, WHITE, RED);
  text(im.t, x + 0.1, Y_IM, w - 0.2, H_IM, { align: "center" });
  mids.push(x + w / 2);
});

// ---------- converge into the goal bar ----------
const yJ = Y_IM + H_IM, yLine = yJ + 0.14, mid = (mids[0] + mids[mids.length - 1]) / 2;
mids.forEach((m) => slide.addShape("line", { x: m, y: yJ, w: 0, h: yLine - yJ, line: { color: R.grey4, width: 2 } }));
slide.addShape("line", { x: mids[0], y: yLine, w: mids[mids.length - 1] - mids[0], h: 0, line: { color: R.grey4, width: 2 } });
downChev(mid, yLine + 0.01, 0.5, Y_BAR - yLine - 0.05);

box(X0, Y_BAR, XR - X0, H_BAR, RED);
text("Achieve healthy revenue growth in Mainland China jewelry market", X0, Y_BAR, XR - X0, H_BAR, { bold: true, color: WHITE, align: "center", pt: 18 });

L.save(pres, __dirname + "/candidate.pptx");
