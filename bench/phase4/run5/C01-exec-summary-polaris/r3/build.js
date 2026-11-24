// C01 rebuild 3 (run5): executive summary of the Polaris Pandora deck, deck-as-reference mode.
// Form: decision framework (Style/storytelling.md §8, Style/refs/case-competitions.md §2): stage arrows across the top,
// "Analysis Dimensions" and "Implications" rows, everything converging into one goal bar. The same team's earlier deck
// uses this form for its summary (Case-2017-Polaris-GREE-digital, slide-map row "exec-summary-tree").
// Look taken from the Case-2019-Polaris profile and its other slides: grey chevrons with white bold text (value-chain
// chevrons), vertical row-label bands in dark grey / red (two-row label bands), light grey F1F1F1 boxes, red-outlined
// statement boxes, grey down arrows and a red rounded goal bar with white bold text.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, B, P, S } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const C = P.C;
const T = (text, x, y, w, h, o = {}) => P.txt(slide, text, x, y, w, h, { noScale: true, ...o });

// ---------- grid ----------
const LX = B.x, LW = 1.3;                       // row-label bands on the left
const X0 = LX + LW + 0.2, XR = B.x + B.w - 0.05, GAP = 0.25;
const CW = (XR - X0 - 2 * GAP) / 3;
const colX = (i) => X0 + i * (CW + GAP);
const HY = B.y + 0.07, HH = 0.62;              // stage arrows
const AY = HY + HH + 0.12, AH = 2.75;            // analysis dimensions row
const IY = AY + AH + 0.43, IH = 1.0;           // implications row
const GH = 0.52, GY = B.y + B.h - GH - 0.02;    // goal bar

// ---------- column headers as arrows ----------
const stages = ["Market", "Strategy Design", "Implementation"];
stages.forEach((s, i) => {
  const x = colX(i) - (i ? 0.12 : 0), w = CW + (i ? 0.12 : 0) + (i < 2 ? 0.2 : 0);
  slide.addShape(i === 0 ? "homePlate" : "chevron", { x, y: HY, w, h: HH, fill: { color: C.g3 }, line: { color: "FFFFFF", width: 1.5 } });
  T(s, x + (i ? 0.35 : 0.15), HY, w - (i ? 0.6 : 0.4), HH, { fontSize: 18, bold: true, color: C.white, onDark: true, align: "center", valign: "middle", margin: 0 });
});

// ---------- row labels (filled bands, dark grey / red as in the deck's two-row label bands) ----------
const rowLabel = (t, y, h, fill) => {
  slide.addShape("rect", { x: LX, y, w: LW, h, fill: { color: fill }, line: { type: "none" } });
  T(t, LX + 0.08, y, LW - 0.16, h, { fontSize: 14, bold: true, color: C.white, onDark: true, align: "center", valign: "middle", margin: 0 });
};
rowLabel("Analysis Dimensions", AY, AH, C.g5);
rowLabel("Implications", IY, IH, C.navy);

// ---------- analysis dimensions: three stacked boxes per stage ----------
const dims = [
  [{ t: "Market Overview", s: ["Industry Trends", "Key Drivers"] }, { t: "Customer Analysis" }, { t: "Competitive Analysis" }],
  [{ t: "Offline Strategy", s: ["Store Expansion", "Sales Per Store Improvement"] }, { t: "Online Strategy", s: ["Enter new platforms", "Optimize operations"] }, { t: "Omni-channel Strategy" }],
  [{ t: "Implementation Timeline" }, { t: "Risk & Mitigation" }, { t: "Financial Forecast" }],
];
dims.forEach((col, i) => {
  const x = colX(i), bg = 0.12;
  // box heights follow their content (title + sub-items), so no box is a tall grey block around one line
  const need = col.map((d) => 0.55 + (d.s ? d.s.length * 0.27 : 0)), tot = need.reduce((a, b) => a + b, 0);
  const k = (AH - (col.length - 1) * bg) / tot;
  let y = AY;
  col.forEach((d, j) => {
    const h = need[j] * k;
    slide.addShape("rect", { x, y, w: CW, h, fill: { color: C.g1 }, line: { type: "none" } });
    const runs = [{ text: d.t, options: { bold: true, color: C.navy, breakLine: !!d.s } }];
    (d.s || []).forEach((s, m) => runs.push({ text: "– " + s, options: { color: C.text, breakLine: m < d.s.length - 1 } }));
    T(runs, x + 0.2, y + 0.04, CW - 0.4, h - 0.08, { fontSize: 14, valign: "middle", align: "center", margin: 0, onDark: true });
    y += h + bg;
  });
});

// ---------- arrows from analysis to implications ----------
const arrow = (cx, y, w = 0.5, h = 0.3) => slide.addShape("downArrow", { x: cx - w / 2, y, w, h, fill: { color: C.g2 }, line: { type: "none" } });
const bracket = (x1, x2, y) => {                 // thin grey bracket that gathers several columns into one arrow
  slide.addShape("line", { x: x1, y, w: x2 - x1, h: 0, line: { color: C.g2, width: 1.5 } });
  slide.addShape("line", { x: x1, y: y - 0.1, w: 0, h: 0.1, line: { color: C.g2, width: 1.5 } });
  slide.addShape("line", { x: x2, y: y - 0.1, w: 0, h: 0.1, line: { color: C.g2, width: 1.5 } });
};
const ay = AY + AH + 0.05;
arrow(colX(0) + CW / 2, ay + 0.02);
bracket(colX(1) + 0.3, colX(2) + CW - 0.3, ay + 0.1);
arrow((colX(1) + colX(2) + CW) / 2, ay + 0.1, 0.5, 0.25);

// ---------- implications: red-outlined statement boxes ----------
const impl = [
  { x: colX(0), w: CW, runs: [{ text: "Pandora should follow " }, { text: "market trends and customer needs", options: { bold: true } }, { text: " to find " }, { text: "growth opportunities", options: { bold: true } }] },
  { x: colX(1), w: 2 * CW + GAP, runs: [{ text: "Based on position of " }, { text: "“a warm jewelry brand”", options: { bold: true } }, { text: ", Pandora should implement strategies to " }, { text: "regain healthy growth", options: { bold: true } }, { text: " in Mainland China" }] },
];
impl.forEach((m) => {
  slide.addShape("rect", { x: m.x, y: IY, w: m.w, h: IH, fill: { color: C.white }, line: { color: C.navy, width: 1.5 } });
  T(m.runs, m.x + 0.2, IY + 0.05, m.w - 0.4, IH - 0.1, { fontSize: 14, align: "center", valign: "middle", margin: 0 });
});

// ---------- everything converges into the goal bar ----------
const by = IY + IH + 0.12;
bracket(colX(0) + 0.3, colX(2) + CW - 0.3, by + 0.06);
arrow((X0 + XR) / 2, by + 0.06, 0.6, GY - by - 0.1);
slide.addShape("roundRect", { x: X0, y: GY, w: XR - X0, h: GH, rectRadius: 0.08, fill: { color: C.navy }, line: { type: "none" } });
T("Achieve healthy revenue growth in Mainland China jewelry market", X0 + 0.2, GY, XR - X0 - 0.4, GH, { fontSize: 18, bold: true, color: C.white, onDark: true, align: "center", valign: "middle", margin: 0 });

L.save(pres, __dirname + "/candidate.pptx").then(() => console.log("saved"));
