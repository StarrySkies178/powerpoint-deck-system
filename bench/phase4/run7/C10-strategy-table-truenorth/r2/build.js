// C10 rebuild (run7 r2): strategy overview table in the TrueNorth (Pola 2016) deck style.
// Form: the deck's "panels" table look (Style/table-forms.md form 3, from TrueNorth slide 15: red header boxes with
// white text, light grey cells with white gaps, the row that matters outlined in red), drawn as shapes because the
// Risks and Mitigation columns span the four phase rows. Each consumer phase is joined to its strategy by a red arrow
// (one-to-one). Frame from the deck's profile; breadcrumb with red triangles and the grey footer band as on the
// deck's other slides (renders 07, 12, 15, 17).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, HOUSE } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
  source: "Source: TrueNorth Analysis",
});
const C = P.C, F = HOUSE.FONT.latin, B = P.BODY;
const PT = 13, LBL = 14, RPT = 12;   // deck table text 13 pt (profile table.pt); phase rows at the label size 12 pt
const LS = 0.9, LS_TIGHT = 0.85;   // line spacing only; type stays at the deck's sizes

// grey footer band behind the source line (build.py moves it to the back)
slide.addShape("rect", { x: 0, y: 7.17, w: 10, h: 0.33, fill: { color: "D9D9D9" }, line: { type: "none" }, objectName: "footer band" });

// breadcrumb in the deck's own form: other sections light grey, current one black, red triangles between
(() => {
  const cs = HOUSE.STYLE.crumb, items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1;
  const runs = [];
  items.forEach((it, i) => {
    if (i) runs.push({ text: " ► ", options: { color: C.navy } });
    runs.push({ text: it, options: { color: i === cur ? "000000" : "CCCCCC" } });
  });
  slide.addText(runs, { x: cs.x, y: cs.y, w: 8.0, h: 0.3, fontFace: F, fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true });
})();

const box = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" },
  line: line ? { color: line.c, width: line.w } : { type: "none" } });
// paragraphs: [{h:"Heading"} | "bullet text"]
function cellText(x, y, w, h, paras, o = {}) {
  const runs = [];
  paras.forEach((p, i) => {
    const last = i === paras.length - 1;
    if (typeof p === "object") runs.push({ text: p.h, options: { bold: true, color: C.navy, fontSize: PT, breakLine: !last, paraSpaceBefore: i ? 4 : 0 } });
    else runs.push({ text: p, options: { bullet: { indent: 9 }, bold: !!o.bold, color: C.text, fontSize: o.pt || PT, breakLine: !last } });
  });
  slide.addText(runs, { x, y, w, h, fontFace: F, fontSize: PT, valign: o.valign || "middle", margin: [1, 3, 1, 3], isTextBox: true, lineSpacingMultiple: o.ls || LS });
}

// column grid: four columns with white gaps, as the deck's panel tables
const gap = 0.05, x0 = B.x, W = B.w;
const colW = [2.64, 3.75, 1.56, W - 2.64 - 3.75 - 1.56 - 3 * gap];
const colX = colW.map((_, j) => x0 + colW.slice(0, j).reduce((a, b) => a + b, 0) + j * gap);
const head = ["Current situation", "Key strategies & initiatives", "Risks", "Mitigation"];

// header boxes
const hy = B.y, hh = 0.34;
head.forEach((t, j) => {
  box(colX[j], hy, colW[j], hh, C.navy);
  slide.addText(t, { x: colX[j], y: hy, w: colW[j], h: hh, fontFace: F, fontSize: LBL, color: C.white, bold: true, align: "center", valign: "middle", margin: 0, isTextBox: true });
});

// top row: the overview, outlined in red and bold (the row that matters)
const ty = hy + hh + gap + 0.03, th = 1.14;
const top = [
  ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"],
  ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"],
  ["Market Risks", "Political Risks"],
  ["R&D Process", "Product Intro", "Re-evaluation"],
];
top.forEach((ps, j) => { box(colX[j], ty, colW[j], th, C.g1); cellText(colX[j] + 0.03, ty + 0.01, colW[j] - 0.06, th - 0.02, ps, { bold: true, ls: LS_TIGHT }); });
box(x0 - 0.02, ty - 0.03, W + 0.04, th + 0.06, null, { c: C.navy, w: 1.75 });

// four phase rows: consumer phase -> strategy
const rows = [
  { phase: "Planning phase", sit: ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
    strat: "Brand position", ini: ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"] },
  { phase: "Awareness phase", sit: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
    strat: "Marketing strategy", ini: ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"] },
  { phase: "Purchase phase", sit: ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
    strat: "Channel optimization", ini: ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"] },
  { phase: "Aftersales phase", sit: ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
    strat: "Loyalty management", ini: ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"] },
];
const ry0 = ty + th + 0.08, rEnd = 7.13;
const wts = [5, 4, 5, 5], wsum = wts.reduce((a, b) => a + b, 0);
const rH = wts.map((k) => ((rEnd - ry0 - (rows.length - 1) * gap) * k) / wsum);
let y = ry0;
rows.forEach((r, i) => {
  box(colX[0], y, colW[0], rH[i], C.g1);
  box(colX[1], y, colW[1], rH[i], C.g1);
  cellText(colX[0] + 0.03, y + 0.01, colW[0] - 0.06, rH[i] - 0.02, [{ h: r.phase }, ...r.sit], { pt: RPT });
  cellText(colX[1] + 0.15, y + 0.01, colW[1] - 0.18, rH[i] - 0.02, [{ h: r.strat }, ...r.ini], { pt: RPT });
  // grey arrow: this phase's issues are fixed by this strategy
  slide.addShape("rightArrow", { x: colX[1] - 0.11, y: y + rH[i] / 2 - 0.12, w: 0.22, h: 0.24, fill: { color: C.g4 }, line: { type: "none" } });
  y += rH[i] + gap;
});

// risks and mitigation: one panel each across the four phase rows
const sh = rEnd - ry0;
box(colX[2], ry0, colW[2], sh, C.g1);
cellText(colX[2] + 0.03, ry0 + 0.03, colW[2] - 0.06, sh - 0.06, [
  { h: "Market Risks" }, "Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products",
  { h: "Political Risks" }, "Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area",
], { valign: "top", ls: LS_TIGHT });
box(colX[3], ry0, colW[3], sh, C.g1);
cellText(colX[3] + 0.03, ry0 + 0.03, colW[3] - 0.06, sh - 0.06, [
  "Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
  "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China",
], { valign: "top", ls: LS_TIGHT });

L.save(pres, __dirname + "/candidate.pptx");
