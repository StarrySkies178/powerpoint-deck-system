// C01 rebuild (run1 r3): executive summary as a decision framework, in the style of Case-2019-Polaris.
// Form: stages as arrows x "analysis dimensions / implications" rows -> converging arrows -> goal bar
// (Style/refs/case-competitions.md §2 "Decision framework"; the team's earlier Polaris deck, GREE slide 2).
// Look taken from the deck's other slides: red title rule, grey/red fills, F1F1F1 grey boxes, dashed grey
// column dividers, grey down-chevrons and a full red conclusion bar with white bold text (Polaris 12, 13),
// red label boxes with white bold text (Polaris 16), red bold key words (Polaris 8).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Executive Summary: Pandora’s growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, B, P } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const C = P.C;
const RED = C.navy, GREY = C.g3, PANEL = C.g1, LINE = C.g2, TXT = C.text, WHITE = "FFFFFF";
const BODY_PT = 14, SUB_PT = 12;

const tb = (text, x, y, w, h, o = {}) => slide.addText(text, {
  x, y, w, h, fontFace: "Arial", fontSize: o.fontSize || BODY_PT, color: o.color || TXT, bold: !!o.bold,
  align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0.05, isTextBox: true,
  paraSpaceAfter: o.paraSpaceAfter || 0, lineSpacingMultiple: o.lineSpacingMultiple, rotate: o.rotate });
const rect = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h,
  fill: fill ? { color: fill } : { type: "none" }, line: line ? { color: line.c, width: line.w || 1, dashType: line.d } : { type: "none" } });

// ---- grid ----
const X0 = B.x, X1 = B.x + B.w;                 // 0.37 .. 13.01
const LW = 0.5, GAP = 0.16;                     // vertical row-label bars (Polaris 5)
const CX = X0 + LW + GAP, CW = (X1 - CX - 2 * GAP) / 3;
const colX = (j) => CX + j * (CW + GAP);
const yHead = B.y + 0.05, hHead = 0.62;
const yAn = yHead + hHead + 0.17, hAn = 2.3;
const yImp = yAn + hAn + 0.42, hImp = 1.42;
const yBar = yImp + hImp + 0.5, hBar = 0.58;

// ---- column headers: three arrows (stage flow) ----
const stages = ["Market", "Strategy Design", "Implementation"];
stages.forEach((s, j) => {
  const x = colX(j), w = CW + (j < 2 ? GAP + 0.12 : 0);
  slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: yHead, w, h: hHead,
    fill: { color: GREY }, line: { color: WHITE, width: 1.5 } });
  tb(s, x + (j ? 0.38 : 0.1), yHead, CW - (j ? 0.5 : 0.25), hHead, { fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle" });
});

// ---- row labels ----
// vertical label bars with turned white bold text, grey then red (Polaris 5)
const rowLab = (t, y, h, fill) => { rect(X0, y, LW, h, fill);
  tb(t, X0 + LW / 2 - h / 2, y + h / 2 - LW / 2, h, LW, { fontSize: BODY_PT, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, rotate: 270 }); };
rowLab("Analysis Dimensions", yAn, hAn, C.g2);
rowLab("Implications", yImp, hImp, RED);

// ---- analysis dimensions: grey boxes with bullets, sub-points as dashes ----
const runs = (items) => {
  const out = [];
  items.forEach((it, i) => {
    const last = i === items.length - 1 && !(it.sub && it.sub.length);
    out.push({ text: it.t, options: { bold: true, bullet: { indent: 14 }, fontSize: BODY_PT, breakLine: !last, paraSpaceBefore: i ? 9 : 0 } });
    (it.sub || []).forEach((s, k) => out.push({ text: s, options: { fontSize: SUB_PT, bullet: { code: "2013", indent: 14 }, indentLevel: 1, breakLine: !(i === items.length - 1 && k === it.sub.length - 1), paraSpaceBefore: 2 } }));
  });
  return out;
};
const analysis = [
  [{ t: "Market Overview", sub: ["Industry Trends", "Key Drivers"] }, { t: "Customer Analysis" }, { t: "Competitive Analysis" }],
  [{ t: "Offline Strategy", sub: ["Store Expansion", "Sales Per Store Improvement"] }, { t: "Online Strategy", sub: ["Enter new platforms", "Optimize operations"] }, { t: "Omni-channel Strategy" }],
  [{ t: "Implementation Timeline" }, { t: "Risk & Mitigation" }, { t: "Financial Forecast" }],
];
analysis.forEach((items, j) => {
  rect(colX(j), yAn, CW, hAn, PANEL);
  tb(runs(items), colX(j) + 0.12, yAn + 0.1, CW - 0.2, hAn - 0.2, { valign: "top" });
});

// dashed grey dividers between the columns (Polaris 4, 6, 12)
[1, 2].forEach((j) => slide.addShape("line", { x: colX(j) - GAP / 2, y: yHead + hHead + 0.08, w: 0, h: yImp + hImp - (yHead + hHead + 0.08),
  line: { color: GREY, width: 0.75, dashType: "dash" } }));

// grey down-chevrons from analysis to implications
const chevY = yAn + hAn + 0.06;
const mid = (j) => colX(j) + CW / 2;
[0, 1, 2].forEach((j) => slide.addShape("flowChartMerge", { x: mid(j) - 0.22, y: chevY, w: 0.44, h: 0.13, fill: { color: GREY }, line: { type: "none" } }));
[0, 1, 2].forEach((j) => slide.addShape("flowChartMerge", { x: mid(j) - 0.22, y: chevY + 0.13, w: 0.44, h: 0.13, fill: { color: GREY }, line: { type: "none" } }));

// ---- implications: red-outlined boxes, key words bold red (Polaris 8, 12) ----
const imp = (x, w, parts) => {
  rect(x, yImp, w, hImp, WHITE, { c: RED, w: 1.25 });
  tb(parts.map((p) => ({ text: p[0], options: p[1] ? { bold: true, color: RED } : {} })), x + 0.12, yImp, w - 0.24, hImp, { valign: "middle", align: "center" });
};
imp(colX(0), CW, [["Pandora should follow "], ["market trends", 1], [" and "], ["customer needs", 1], [" to find growth opportunities"]]);
imp(colX(1), 2 * CW + GAP, [["Based on position of "], ["“a warm jewelry brand”", 1], [", Pandora should implement strategies to "], ["regain healthy growth", 1], [" in Mainland China"]]);

// ---- convergence into the goal bar ----
const yC = yImp + hImp, yJoin = yBar - 0.22;
const cx0 = mid(0), cx1 = colX(1) + CW + GAP / 2, cMid = X0 + B.w / 2;
[cx0, cx1].forEach((x) => slide.addShape("line", { x, y: yC, w: 0, h: yJoin - yC, line: { color: GREY, width: 1.5 } }));
slide.addShape("line", { x: cx0, y: yJoin, w: cx1 - cx0, h: 0, line: { color: GREY, width: 1.5 } });
slide.addShape("flowChartMerge", { x: cMid - 0.25, y: yJoin - 0.02, w: 0.5, h: 0.2, fill: { color: GREY }, line: { type: "none" } });

// goal bar: full red bar, white bold text (Polaris 12, 13)
slide.addShape("roundRect", { x: X0, y: yBar, w: B.w, h: hBar, rectRadius: 0.06, fill: { color: RED }, line: { type: "none" } });
tb("Achieve healthy revenue growth in Mainland China jewelry market", X0, yBar, B.w, hBar, { fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle" });

L.save(pres, __dirname + "/candidate.pptx");
