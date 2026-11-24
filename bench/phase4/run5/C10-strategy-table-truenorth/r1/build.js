// C10 rebuild (run5 r1): strategy overview in the TrueNorth Pola deck style (deck as reference, leave-one-out).
// Form: "panels" table form of the deck (red header boxes over light-grey cells with white gaps, the highlighted row
// outlined in red, as on the deck's option table, TrueNorth slide 15), drawn as shapes because the Risks and Mitigation
// columns span several rows. Consumer phase cells point to their strategy (home-plate arrows, journey order top-down).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";
const { pres, slide, B, P } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: TITLE,
  source: "Source: TrueNorth Analysis",
  crumb: { items: ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], current: 1, sep: " \u25BA " },
});
const C = P.C, FONT = P.THEME.bodyFontFace;
const PT = 13, HPT = 14;                     // cell text at 13 pt (profile body 14, table 13), headers 14
const LH = (PT * 1.2 * 0.9) / 72;                  // line height, in

// rough Calibri wrap: ~0.5 em a character
function nLines(text, wIn, pt = PT) {
  const cap = (wIn * 72) / (pt * 0.45);
  let n = 1, cur = 0;
  for (const w of String(text).split(/\s+/)) { const l = w.length + (cur ? 1 : 0); if (cur + l > cap && cur > 0) { n++; cur = w.length; } else cur += l; }
  return n;
}
const BUL = 0.14;                             // bullet indent, in
const need = (head, items, w) => (head ? nLines(head, w - 0.12, PT) : 0) + items.reduce((a, t) => a + nLines(t.replace(/\*\*/g, ""), w - 0.12 - BUL), 0);

function cellText(head, items, x, y, w, h, o = {}) {
  const paras = [];
  if (head) paras.push({ text: head, options: { bold: true, color: o.headColor || C.navy, breakLine: true, fontSize: PT } });
  items.forEach((t, i) => {
    paras.push({ text: t, options: { fontSize: PT, color: C.text, bullet: { indent: BUL * 72 }, paraSpaceBefore: i || head ? 2 : 0, breakLine: i < items.length - 1 } });
  });
  slide.addText(paras, { x, y, w, h, fontFace: FONT, fontSize: PT, color: C.text, valign: o.valign || "middle", margin: [5, 4, 2, 2], lineSpacingMultiple: 0.9, isTextBox: true });
}

// ---- grid
const X0 = B.x, WT = B.w, G = 0.06;
const colW = [2.7, 3.2, 1.85, 0];
colW[3] = WT - colW[0] - colW[1] - colW[2] - 3 * G;
const colX = colW.map((_, j) => X0 + colW.slice(0, j).reduce((a, b) => a + b, 0) + j * G);
const ARW = 0.16;                             // home-plate point of the phase cells

// ---- content (from the prompt)
const HEAD = ["Current situation", "Key strategies & initiatives", "Risks", "Mitigation"];
// Text at 13 pt does not fit the brief's full wording in one slide body (rows needed 7.1 in against 3.4 in), so the
// wording is tightened (DECK-SYSTEM §1 rule 10: cut words, never shrink type); every item of the brief is kept.
const TOP = [
  ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"],
  ["Improve penetration by product reposition", "Enhance brand recognition, image & memory along the consumer journey"],
  ["Market Risks", "Political Risks"],
  ["R&D Process", "Product Intro", "Re-evaluation"],
];
const ROWS = [
  { phase: "Planning phase", needs: ["Distinctive consumers", "Sophisticated, diverse needs", "Growing potential consumers"],
    strat: "Brand position", acts: ["Target groups with POLA & Jurlique", "Fancy & explicit brand concepts", "Product diversification roadmaps"] },
  { phase: "Awareness phase", needs: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
    strat: "Marketing strategy", acts: ["Fascinating stories or hot topics", "Social media-focus marketing", "Celebrities as spokespersons"] },
  { phase: "Purchase phase", needs: ["Experience consumption", "Higher offline expectations", "More impulsive shopping", "Frequent mobile shopping"],
    strat: "Channel optimization", acts: ["Various services like massage", "Experience shops, digital stores", "Purchase via multiple channels", "Better mobile-end shopping"] },
  { phase: "Aftersales phase", needs: ["Low brand loyalty", "Personal & value identity", "Fans culture"],
    strat: "Loyalty management", acts: ["Full lifecycle consumer management", "Brand culture proposition", "WeChat fans-circle on social media"] },
];
const RISKS = [
  { head: "Market Risks", items: ["Competitor responses to anti-hero products", "Four channel management takes efforts", "R&D not fully aligned with consumer trends"] },
  { head: "Political Risks", items: ["Import tax increase for premium cosmetics", "Floating exchange", "Political outrage in south Asia area"] },
];
const MITIG = ["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
  "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years; consider building a factory in China"];

// ---- header boxes (red, white bold)
const HH = 0.38, yH = B.y;
HEAD.forEach((h, j) => {
  slide.addShape("rect", { x: colX[j], y: yH, w: colW[j], h: HH, fill: { color: C.navy }, line: { type: "none" }, objectName: "form:table panels header" });
  slide.addText(h, { x: colX[j], y: yH, w: colW[j], h: HH, fontFace: FONT, fontSize: HPT, bold: true, color: C.white, align: "center", valign: "middle", margin: 0.03, isTextBox: true });
});

// ---- top (highlighted) row
const yT = yH + HH + G;
const topLines = Math.max(...TOP.map((items, j) => need(null, items, colW[j])));
const HT = topLines * LH + 0.16;
TOP.forEach((items, j) => {
  slide.addShape("rect", { x: colX[j], y: yT, w: colW[j], h: HT, fill: { color: C.g1 }, line: { type: "none" } });
  cellText(null, items, colX[j], yT, colW[j], HT);
});
slide.addShape("rect", { x: X0, y: yT - 0.02, w: WT, h: HT + 0.04, fill: { type: "none" }, line: { color: C.navy, width: 1.75 } });

// ---- phase -> strategy rows, sized by their text, filling the rest of the body
const yR = yT + HT + 0.12, room = B.y + B.h - yR - 3 * G;
const rowNeed = ROWS.map((r) => Math.max(need(r.phase, r.needs, colW[0] - ARW), need(r.strat, r.acts, colW[1])) * LH + 0.1);
const sumNeed = rowNeed.reduce((a, b) => a + b, 0);
if (sumNeed > room + 0.02) console.warn(`rows need ${sumNeed.toFixed(2)} in, room ${room.toFixed(2)} in`);
const extra = Math.max(0, (room - sumNeed) / ROWS.length);
const rowH = rowNeed.map((h) => h + extra);
const rowY = rowH.map((_, i) => yR + rowH.slice(0, i).reduce((a, b) => a + b, 0) + i * G);
ROWS.forEach((r, i) => {
  slide.addShape("homePlate", { x: colX[0], y: rowY[i], w: colW[0] + G * 0.5, h: rowH[i], fill: { color: C.g1 }, line: { type: "none" }, rectRadius: 0, adjustPoint: 0.18 });
  cellText(r.phase, r.needs, colX[0], rowY[i], colW[0] - ARW, rowH[i], { headColor: C.text });
  slide.addShape("rect", { x: colX[1] + 0.04, y: rowY[i], w: colW[1] - 0.04, h: rowH[i], fill: { color: C.g1 }, line: { type: "none" } });
  cellText(r.strat, r.acts, colX[1] + 0.04, rowY[i], colW[1] - 0.04, rowH[i]);
});
const yEnd = rowY[3] + rowH[3];

// ---- risks: market risks above political risks, the column split by how much each holds
const rNeed = RISKS.map((r) => need(r.head, r.items, colW[2]) + 0.6), split = yR + (yEnd - yR - G) * rNeed[0] / (rNeed[0] + rNeed[1]);
const rk = [[yR, split], [split + G, yEnd]];
RISKS.forEach((r, k) => {
  const [a, b] = rk[k];
  slide.addShape("rect", { x: colX[2], y: a, w: colW[2], h: b - a, fill: { color: C.g1 }, line: { type: "none" } });
  cellText(r.head, r.items, colX[2], a, colW[2], b - a);
});

// ---- mitigation: one column panel over all four rows
slide.addShape("rect", { x: colX[3], y: yR, w: colW[3], h: yEnd - yR, fill: { color: C.g1 }, line: { type: "none" } });
cellText(null, MITIG, colX[3], yR, colW[3], yEnd - yR);

L.save(pres, __dirname + "/candidate.pptx");
