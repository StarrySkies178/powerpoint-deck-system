// C01 rebuild (run7 r1): executive summary as a decision framework (Style/refs/case-competitions.md §2:
// stage arrows across the top, rows "analysis dimensions" -> "implications", everything converging into one goal bar).
// Drawn in the Polaris deck's own look, taken from its other slides: red main colour, grey filled blocks,
// red-outlined statement boxes and an outlined down arrow into a red bar (strategy overview, Polaris 8),
// bold dimension heads with "–" sub-points (Polaris 8, 16). Body 14 pt, labels >= 12 pt (profile).
// decisionFramework() draws white numbered chevrons and a grey goal bar that this deck never uses, and it
// needs an answer under every stage (here Implementation has none), so the grid is drawn with the same helpers.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, P, HOUSE, prof } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const C = P.C, txt = P.txt;
const BODY_PT = prof.body.pt, LABEL_PT = prof.body.label_pt;   // 14 / 12

// ---- grid ----
const X0 = prof.margins.left, X1 = prof.title.rule.w;          // 0.37 .. 12.97
const LW = 1.75, GAP = 0.12;                                    // row-label column
const CX = X0 + LW + GAP, CW = (X1 - CX - 2 * GAP) / 3;        // three stage columns
const colX = (j) => CX + j * (CW + GAP);

const Y_HEAD = 1.2, H_HEAD = 0.55;
const Y_ANA = 1.92, H_ANA = 2.72;
const Y_IMP = 4.98, H_IMP = 0.98;
const Y_GOAL = 6.42, H_GOAL = 0.58;

// ---- column headers as arrows ----
const stages = ["Market", "Strategy Design", "Implementation"];
stages.forEach((s, j) => {
  const x = colX(j) - (j ? 0.06 : 0), w = CW + (j ? 0.06 : 0) + (j < 2 ? GAP + 0.06 : 0);
  slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: Y_HEAD, w, h: H_HEAD, fill: { color: C.navy }, line: { color: "FFFFFF", width: 1.5 }, objectName: "stage arrow " + (j + 1) });
  txt(slide, s, x + (j ? 0.35 : 0.1), Y_HEAD, w - (j ? 0.6 : 0.4), H_HEAD, { fontSize: BODY_PT, noScale: true, bold: true, color: "FFFFFF", onDark: true, align: "center", valign: "middle", margin: 0 });
});

// ---- row labels ----
function rowLabel(text, y, h) {
  slide.addShape("rect", { x: X0, y, w: LW, h, fill: { color: C.g3 }, line: { type: "none" } });   // grey label block, as the deck's grey "Offline / Online" blocks
  txt(slide, text, X0 + 0.08, y, LW - 0.16, h, { fontSize: BODY_PT, noScale: true, bold: true, color: "FFFFFF", onDark: true, align: "center", valign: "middle", margin: 0 });
}
rowLabel("Analysis Dimensions", Y_ANA, H_ANA);
rowLabel("Implications", Y_IMP, H_IMP);

// ---- analysis dimensions: grey blocks, bold heads with "–" sub-points ----
const analysis = [
  [["Market Overview", ["Industry Trends", "Key Drivers"]], ["Customer Analysis"], ["Competitive Analysis"]],
  [["Offline Strategy", ["Store Expansion", "Sales Per Store Improvement"]], ["Online Strategy", ["Enter new platforms", "Optimize operations"]], ["Omni-channel Strategy"]],
  [["Implementation Timeline"], ["Risk & Mitigation"], ["Financial Forecast"]],
];
analysis.forEach((items, j) => {
  const x = colX(j);
  slide.addShape("rect", { x, y: Y_ANA, w: CW, h: H_ANA, fill: { color: C.g1 }, line: { type: "none" } });
  const runs = [];
  items.forEach(([head, subs], i) => {
    runs.push({ text: head, options: { bold: true, bullet: { indent: 14 }, breakLine: true, paraSpaceBefore: i ? 8 : 0 } });
    (subs || []).forEach((s) => runs.push({ text: s, options: { fontSize: LABEL_PT, bullet: { code: "2013", indent: 14 }, indentLevel: 1, breakLine: true } }));
  });
  runs[runs.length - 1].options.breakLine = false;
  slide.addText(runs, { x: x + 0.15, y: Y_ANA + 0.1, w: CW - 0.3, h: H_ANA - 0.2, fontFace: "Arial", fontSize: BODY_PT, color: C.text, valign: "middle", margin: 0.04, isTextBox: true });
});

// ---- down arrows from analysis to implications ----
const arrowDown = (cx, y, h, w = 0.34) => slide.addShape("downArrow", { x: cx - w / 2, y, w, h, fill: { color: C.g3 }, line: { type: "none" } });
[0, 1, 2].forEach((j) => arrowDown(colX(j) + CW / 2, Y_ANA + H_ANA + 0.06, Y_IMP - Y_ANA - H_ANA - 0.12));

// ---- implications: red-outlined statement boxes (Market | Strategy Design + Implementation) ----
const impl = [
  { x: colX(0), w: CW, text: "Pandora should follow market trends and customer needs to find growth opportunities" },
  { x: colX(1), w: 2 * CW + GAP, text: "Based on position of “a warm jewelry brand”, Pandora should implement strategies to regain healthy growth in Mainland China" },
];
impl.forEach((b) => {
  slide.addShape("rect", { x: b.x, y: Y_IMP, w: b.w, h: H_IMP, fill: { color: "FFFFFF" }, line: { color: C.navy, width: 2 } });
  txt(slide, b.text, b.x + 0.15, Y_IMP, b.w - 0.3, H_IMP, { fontSize: BODY_PT, noScale: true, bold: true, color: C.text, align: "center", valign: "middle" });
});

// ---- everything converges into one goal bar ----
const Y_CONV = Y_IMP + H_IMP + 0.05, H_CONV = Y_GOAL - Y_CONV - 0.04;
slide.addShape("downArrow", { x: colX(0) + CW / 2 - 0.3, y: Y_CONV, w: 0.6, h: H_CONV, fill: { color: "FFFFFF" }, line: { color: C.navy, width: 1.5 } });
slide.addShape("downArrow", { x: colX(1) + CW + GAP / 2 - 0.3, y: Y_CONV, w: 0.6, h: H_CONV, fill: { color: "FFFFFF" }, line: { color: C.navy, width: 1.5 } });
slide.addShape("rect", { x: X0, y: Y_GOAL, w: X1 - X0, h: H_GOAL, fill: { color: C.navy }, line: { type: "none" } });
txt(slide, "Achieve healthy revenue growth in Mainland China jewelry market", X0 + 0.2, Y_GOAL, X1 - X0 - 0.4, H_GOAL, { fontSize: 16, noScale: true, bold: true, color: "FFFFFF", onDark: true, align: "center", valign: "middle" });

// page number: the master's own slide-number field (the prompt's "Page 2" is the slide's place in the full deck)

L.save(pres, __dirname + "/candidate.pptx");
