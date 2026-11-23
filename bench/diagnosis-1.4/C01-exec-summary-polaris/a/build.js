// C01 variant a: executive summary as a decision framework (stage arrows x analysis dimensions -> implications -> goal bar),
// drawn in the Case-2019-Polaris style profile (title, red rule, source, page, red / grey roles, Arial 14 / 12 pt).
// Form: decision framework (Style/refs/case-competitions.md section 2; its own example is the 2017 Polaris GREE deck).
// Deck furniture reused from the reference deck's OTHER slides: vertical row-label bands (slide 5), grey filled panels with
// bold items and dash sub-items (slides 8, 14), red-outlined statement box (slide 8), grey down chevrons (slides 5, 12),
// full-red rounded conclusion bar with white bold text (slide 12).
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));

const TITLE = "Executive Summary: Pandora’s growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, B, P } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const C = P.C, F = P.THEME.bodyFontFace;

// ---------- grid ----------
const bandW = 0.42, gapL = 0.12, gap = 0.15;
const x0 = B.x + bandW + gapL, right = B.x + B.w, cw = (right - x0 - 2 * gap) / 3;
const colX = (j) => x0 + j * (cw + gap);
const yH = B.y + 0.1, hH = 0.55;               // stage arrows
const yA = yH + hH + 0.14, hA = 2.72;          // analysis dimensions
const yI = yA + hA + 0.32, hI = 1.3;           // implications
const yG = yI + hI + 0.32, hG = 0.5;           // goal bar

// ---------- column headers as arrows (grey stage chevrons, deck form: slide 14) ----------
const stages = ["Market", "Strategy Design", "Implementation"];
stages.forEach((s, j) => {
  const x = colX(j) - (j ? 0.12 : 0), w = cw + (j ? 0.12 : 0) + (j < 2 ? 0.12 : 0);
  slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: yH, w, h: hH, fill: { color: C.g3 }, line: { color: "FFFFFF", width: 1.5 } });
  slide.addText(s, { x: x + 0.3, y: yH, w: w - 0.6, h: hH, fontFace: F, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
});

// ---------- row labels: vertical bands ----------
function band(text, y, h, fill) {
  slide.addShape("rect", { x: B.x, y, w: bandW, h, fill: { color: fill }, line: { type: "none" } });
  slide.addText(text, { x: B.x + bandW / 2 - h / 2, y: y + h / 2 - bandW / 2, w: h, h: bandW, fontFace: F, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle", rotate: 270, margin: 0 });
}
band("Analysis Dimensions", yA, hA, C.g3);
band("Implications", yI, hI, C.navy);

// ---------- analysis cells: grey panels, bold items, dash sub-items ----------
const analysis = [
  [["Market Overview", ["Industry Trends", "Key Drivers"], "chart-line"], ["Customer Analysis", [], "users"], ["Competitive Analysis", [], "chart-dots"]],
  [["Offline Strategy", ["Store Expansion", "Sales Per Store Improvement"], "building-store"], ["Online Strategy", ["Enter new platforms", "Optimize operations"], "device-laptop"], ["Omni-channel Strategy", [], "arrows-exchange"]],
  [["Implementation Timeline", [], "calendar"], ["Risk & Mitigation", [], "shield-check"], ["Financial Forecast", [], "report-money"]],
];
const headH = 0.3, subH = 0.25, isz = 0.42;      // one row per dimension: red outline icon + bold item + dash sub-items (deck form: slides 4, 14)
analysis.forEach((items, j) => {
  const x = colX(j);
  slide.addShape("rect", { x, y: yA, w: cw, h: hA, fill: { color: C.g1 }, line: { type: "none" } });
  const hs = items.map(([, subs]) => Math.max(isz, headH + subs.length * subH));
  const free = hA - hs.reduce((a, c) => a + c, 0), g = free / (items.length + 1);
  let y = yA + g;
  items.forEach(([head, subs, ic], k) => {
    P.icon(slide, ic, x + 0.22, y + (subs.length ? 0 : (hs[k] - isz) / 2), isz, { color: C.navy });
    const runs = [{ text: head, options: { bold: true, fontSize: 14, color: C.text, breakLine: subs.length > 0 } }];
    subs.forEach((t, m) => runs.push({ text: "\u2013  " + t, options: { fontSize: 12, color: C.text, breakLine: m < subs.length - 1, paraSpaceBefore: 2 } }));
    slide.addText(runs, { x: x + 0.82, y, w: cw - 0.95, h: hs[k], fontFace: F, valign: subs.length ? "top" : "middle", margin: 0 });
    y += hs[k] + g;
  });
  // grey down chevron into the implication row (the Implementation column feeds the strategy implication)
  slide.addShape("chevron", { x: x + cw / 2 - 0.12, y: yA + hA + 0.04 - 0.13, w: 0.24, h: 0.5, rotate: 90, fill: { color: "A2A2A2" }, line: { type: "none" } });
});

// ---------- implications: red-outlined statement boxes (strategy spans Strategy Design + Implementation) ----------
const red = (t) => ({ text: t, options: { bold: true, color: C.navy } });
const plain = (t) => ({ text: t, options: {} });
const impl = [
  { x: colX(0), w: cw, runs: [plain("Pandora should follow "), red("market trends"), plain(" and "), red("customer needs"), plain(" to find growth opportunities")] },
  { x: colX(1), w: 2 * cw + gap, runs: [plain("Based on position of “"), red("a warm jewelry brand"), plain("”, Pandora should implement strategies to "), red("regain healthy growth"), plain(" in Mainland China")] },
];
impl.forEach((c) => {
  slide.addShape("rect", { x: c.x, y: yI, w: c.w, h: hI, fill: { color: "FFFFFF" }, line: { color: C.navy, width: 1.5 } });
  slide.addText(c.runs, { x: c.x + 0.2, y: yI + 0.05, w: c.w - 0.4, h: hI - 0.1, fontFace: F, fontSize: 14, color: C.text, align: "center", valign: "middle", margin: 0 });
});

// ---------- everything converges into the goal bar ----------
[0, 1].forEach((k) => slide.addShape("chevron", { x: (x0 + right) / 2 - 0.1, y: yI + hI + 0.04 - 0.35 + k * 0.1, w: 0.2, h: 0.9, rotate: 90, fill: { color: k ? "7E7E7E" : "A2A2A2" }, line: { type: "none" } }));
slide.addShape("roundRect", { x: x0, y: yG, w: right - x0, h: hG, rectRadius: 0.06, fill: { color: C.navy }, line: { type: "none" } });
slide.addText("Achieve healthy revenue growth in Mainland China jewelry market", { x: x0, y: yG, w: right - x0, h: hG, fontFace: F, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });

L.save(pres, __dirname + "/candidate.pptx");
