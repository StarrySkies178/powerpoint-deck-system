// C10 rebuild 1 (run2a): strategy overview table in the TrueNorth Pola deck style (deck as reference, leave-one-out).
// Approach: the deck's style profile (frame, red title band, crumb, source line) + a four-column overview drawn
// in the deck's own table idiom (red header boxes with white gaps, light-grey cells, the key row outlined in red,
// red bold labels; Pola slides 12 and 15 of the slide map), with arrows pairing each consumer phase to its strategy.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";
const { pres, slide, P } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: TITLE,
  source: "Source: TrueNorth Analysis",
});
const C = P.C, F = P.THEME.bodyFontFace;
// breadcrumb as the deck draws it: done section grey, current black, red ► between (profile crumb position and size)
const CR = { done: "CCCCCC", on: "000000", sep: "CC0000" }, crumbItems = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"];
slide.addText(crumbItems.flatMap((t, i) => [...(i ? [{ text: " \u25BA ", options: { color: CR.sep } }] : []), { text: t, options: { color: i === 1 ? CR.on : CR.done } }]),
  { x: 0.35, y: 0.07, w: 8.0, h: 0.3, fontFace: F, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "crumb" });
// grey footer band behind the source line (every slide of the deck), sent to the back
slide.addShape("rect", { x: 0, y: 7.19, w: 10, h: 0.31, fill: { color: "D9D9D9" }, line: { type: "none" }, objectName: "footer band" });
slide._slideObjects.unshift(slide._slideObjects.pop());
const RED = C.navy, GREY = "F1F1F1", MID = "D9D9D9", BLACK = "000000", WHITE = "FFFFFF";
const PT = 12, HEAD = 14;                     // table cells at the deck's label size (12; 13 cannot hold this content in four columns), column heads at its body size (14)

// ---------- geometry ----------
const X0 = 0.25, XR = 9.85, GAP = 0.05, ARW = 0.2;
const w1 = 2.7, w3 = 1.6, w4 = 1.47;
const w2 = XR - X0 - w1 - ARW - w3 - w4 - 2 * GAP;
const x1 = X0, x2 = x1 + w1 + ARW, x3 = x2 + w2 + GAP, x4 = x3 + w3 + GAP;
const colX = [x1, x2, x3, x4], colW = [w1, w2, w3, w4];

const bullets = (items, o = {}) => items.map((t, i) => ({
  text: t, options: { bullet: { indent: 9 }, breakLine: true, bold: !!o.bold, color: o.color || BLACK, fontSize: o.pt || PT },
}));
const head = (t, o = {}) => ({ text: t, options: { bold: true, color: o.color || RED, breakLine: true, fontSize: o.pt || PT } });
const box = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" }, line: line || { type: "none" } });
const trim = (runs) => { if (Array.isArray(runs) && runs.length) runs[runs.length - 1] = { ...runs[runs.length - 1], options: { ...runs[runs.length - 1].options, breakLine: false } }; return runs; };
const text = (runs, x, y, w, h, o = {}) => slide.addText(trim(runs), { x, y, w, h, fontFace: F, fontSize: o.pt || PT, color: o.color || BLACK, bold: !!o.bold, valign: o.valign || "top",
  align: o.align || "left", margin: o.margin || [0.05, 0.07, 0.03, 0.07], paraSpaceAfter: 0, lineSpacingMultiple: 0.92, isTextBox: true, objectName: o.name });

// row heights in proportion to the lines each row needs (Calibri ~0.47 em a character)
const linesIn = (t, wIn, pt) => { const cap = Math.max(1, ((wIn - 0.33) * 72) / (pt * 0.41)); let n = 1, cur = 0;
  for (const wd of t.split(" ")) { const L2 = wd.length + 1; if (cur + L2 > cap && cur) { n++; cur = L2; } else cur += L2; } return n; };
// ---------- header row: red boxes, white bold text, white gaps (deck's table header) ----------
let y = 1.45;
const HH = 0.36;
const heads = ["Current situation", "Key strategies & initiatives", "Risks", "Mitigation"];
heads.forEach((h, j) => {
  const xx = j === 1 ? x2 - ARW : colX[j], ww = j === 1 ? w2 + ARW : colW[j];
  box(xx, y, ww, HH, RED);
  text(h, xx, y, ww, HH, { pt: HEAD, valign: "middle", align: "center", margin: 0, color: WHITE, bold: true, name: "head " + (j + 1) });
});
y += HH + 0.07;

// ---------- top highlighted row: the overview, outlined in red ----------
const TOP = [
  ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"],
  ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"],
  ["Market Risks", "Political Risks"],
  ["R&D Process", "Product Intro", "Re-evaluation"],
];
const TH = Math.max(...TOP.map((it, j) => it.reduce((a, t) => a + linesIn(t, j === 1 ? w2 + ARW : colW[j], PT), 0))) * 0.18 + 0.1;
TOP.forEach((items, j) => {
  const xx = j === 1 ? x2 - ARW : colX[j], ww = j === 1 ? w2 + ARW : colW[j];
  box(xx, y, ww, TH, "EBC6C5");
  text(bullets(items, { bold: true }), xx, y, ww, TH, { valign: "middle", name: "overview " + (j + 1) });
});
slide.addShape("rect", { x: X0 - 0.03, y: y - 0.03, w: XR - X0 + 0.06, h: TH + 0.06, fill: { type: "none" }, line: { color: RED, width: 1.75 }, objectName: "highlight row" });
y += TH + 0.09;

// ---------- four phase -> strategy rows ----------
const ROWS = [
  { phase: "Planning phase", needs: ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
    strat: "Brand position", acts: ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"] },
  { phase: "Awareness phase", needs: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
    strat: "Marketing strategy", acts: ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"] },
  { phase: "Purchase phase", needs: ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
    strat: "Channel optimization", acts: ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"] },
  { phase: "Aftersales phase", needs: ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
    strat: "Loyalty management", acts: ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"] },
];
const need = ROWS.map((r) => 1 + Math.max(r.needs.reduce((a, t) => a + linesIn(t, w1, PT), 0), r.acts.reduce((a, t) => a + linesIn(t, w2, PT), 0)));
const RG = 0.05, bottom = 7.13, avail = bottom - y - RG * (ROWS.length - 1), tot = need.reduce((a, b) => a + b, 0);
const rowH = need.map((n) => (avail * n) / tot);
const yTop = y;
ROWS.forEach((r, i) => {
  const h = rowH[i];
  box(x1, y, w1, h, GREY);
  text([head(r.phase, { color: BLACK }), ...bullets(r.needs)], x1, y, w1, h, { name: "phase " + (i + 1) });
  // arrow pairing the phase with its strategy
  slide.addShape("rightArrow", { x: x1 + w1 + 0.02, y: y + h / 2 - 0.16, w: ARW - 0.04, h: 0.32, fill: { color: RED }, line: { type: "none" } });
  box(x2, y, w2, h, GREY);
  text([head(r.strat), ...bullets(r.acts)], x2, y, w2, h, { name: "strategy " + (i + 1) });
  y += h + RG;
});
const spanH = bottom - yTop;

// ---------- risks and mitigation: one panel each across the four rows ----------
box(x3, yTop, w3, spanH, GREY);
text([head("Market Risks"), ...bullets(["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"]),
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  head("Political Risks"), ...bullets(["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"])],
  x3, yTop, w3, spanH, { name: "risks", margin: [0.08, 0.07, 0.03, 0.07] });
box(x4, yTop, w4, spanH, GREY);
const MIT = ["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
  "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"];
text(MIT.flatMap((t, i) => [{ text: t, options: { bullet: { indent: 9 }, breakLine: true } }, ...(i < MIT.length - 1 ? [{ text: " ", options: { breakLine: true, fontSize: 6 } }] : [])]),
  x4, yTop, w4, spanH, { name: "mitigation", margin: [0.08, 0.07, 0.03, 0.07] });

L.save(pres, __dirname + "/candidate.pptx");
