// C10 rebuild (run2 r2): five-year strategy overview table in the TrueNorth / Pola deck style.
// Deck as reference, leave-one-out: style from Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json;
// forms taken from the deck's other slides: red header cells over grey F1 rows with white rules (slide 15),
// red bold labels + black bullets (slides 12, 15), red triangle as the "leads to" mark (breadcrumb, slide 15),
// grey footer bar and TrueNorth logo of the deck's layout (logo copied from the deck's slide layout).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const { P, HOUSE } = L;
const pptxgen = require("pptxgenjs");
const fs = require("fs");

const prof = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../../../Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json"), "utf8"));
P.useStyle(prof);
const title = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";
const pres = HOUSE.newDeck(pptxgen, title);
const slide = pres.addSlide({ masterName: HOUSE.LAYOUT.titleOnly });

const RED = "CC0000", PINK = "EBC6C5", GREY = "F1F1F1", BAR = "CCCCCC", BLACK = "000000", LIGHT = "A6A6A6";
const FONT = prof.fonts.latin;            // Calibri
const PT = 12, HEAD = 14;                 // cell text / column heads

// grey footer bar of the deck's layout, drawn first so the source line sits on it
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: BAR }, line: { type: "none" } });
P.frame(pres, slide, { title, source: "Source: TrueNorth Analysis" });
// logo top right, as on every content slide of the deck
slide.addImage({ path: path.join(__dirname, "truenorth-logo.jpg"), x: 8.54, y: 0.0, w: 1.42, h: 0.41 });
// breadcrumb: other sections light grey, current black, red triangles between
{
  const items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1, runs = [];
  items.forEach((t, i) => {
    if (i) runs.push({ text: " ► ", options: { color: RED } });
    runs.push({ text: t, options: { color: i === cur ? BLACK : LIGHT } });
  });
  slide.addText(runs, { x: prof.crumb.x, y: prof.crumb.y, w: 8.15, h: 0.3, fontFace: FONT, fontSize: prof.crumb.pt, margin: 0, valign: "top" });
}

// text helpers
const bullets = (arr, o = {}) => arr.map((t) => ({ text: t, options: { bullet: { indent: 9 }, breakLine: true, color: BLACK, ...o } }));
const head = (t, color = RED) => ({ text: t, options: { bold: true, color, breakLine: true } });
function box(runs, x, y, w, h, fill, o = {}) {
  if (fill) slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
  // drop the last breakLine so no empty paragraph is left at the end
  const r = runs.map((q, i) => (i === runs.length - 1 ? { text: q.text, options: { ...q.options, breakLine: false } } : q));
  slide.addText(r, { x, y, w, h, fontFace: FONT, fontSize: o.pt || PT, color: BLACK, valign: o.valign || "top", align: o.align || "left",
    margin: o.margin ?? [3, 5, 2, 5], paraSpaceAfter: o.after ?? 0, lineSpacingMultiple: 0.95, isTextBox: true });
}

// column grid (left 0.25 .. right 9.84)
const X0 = 0.25, GAP = 0.05, ARW = 0.24;
const w1 = 2.6, w2 = 3.7, w3 = 1.56;
const x1 = X0, x2 = x1 + w1 + ARW, x3 = x2 + w2 + GAP, x4 = x3 + w3 + GAP, w4 = 9.84 - x4;
const cols = [[x1, w1], [x2, w2], [x3, w3], [x4, w4]];

// header row: red cells, white text (slide 15 table head)
const hy = 1.5, hh = 0.32;
["Current situation", "Key strategies & initiatives", "Risks", "Mitigation"].forEach((t, i) => {
  const [x, w] = cols[i];
  const xx = i === 1 ? x - ARW + GAP : x, ww = i === 1 ? w + ARW - GAP : w;   // head 2 also covers the arrow gutter
  slide.addShape("rect", { x: i === 0 ? x : xx, y: hy, w: i === 0 ? w : ww, h: hh, fill: { color: RED }, line: { type: "none" } });
  slide.addText(t, { x: i === 0 ? x : xx, y: hy, w: i === 0 ? w : ww, h: hh, fontFace: FONT, fontSize: HEAD, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
});

// top highlighted row (pink band across all four columns)
const ty = hy + hh + GAP, th = 0.98;
slide.addShape("rect", { x: X0, y: ty, w: 9.84 - X0, h: th, fill: { color: PINK }, line: { type: "none" } });
box(bullets(["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"]), x1, ty, w1, th, null, { valign: "middle" });
box(bullets(["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"]), x2, ty, w2, th, null, { valign: "middle" });
box(bullets(["Market Risks", "Political Risks"], { bold: true }), x3, ty, w3, th, null, { valign: "middle" });
box(bullets(["R&D Process", "Product Intro", "Re-evaluation"], { bold: true }), x4, ty, w4, th, null, { valign: "middle" });
// red triangle between situation and strategy in the band
const tri = (y, h) => slide.addShape("triangle", { x: x1 + w1 + 0.05, y: y + h / 2 - 0.1, w: ARW - 0.1, h: 0.2, rotate: 90, fill: { color: RED }, line: { type: "none" } });
tri(ty, th);

// four phase rows: consumer phase -> strategy
const rows = [
  ["Planning phase", ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
    "Brand position", ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"]],
  ["Awareness phase", ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
    "Marketing strategy", ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"]],
  ["Purchase phase", ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
    "Channel optimization", ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"]],
  ["Aftersales phase", ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
    "Loyalty management", ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"]],
];
const ry0 = ty + th + GAP, ryEnd = 7.16;
const weights = [5.2, 4.3, 5.1, 5.1];   // lines of text per row
const avail = ryEnd - ry0 - GAP * (rows.length - 1), wsum = weights.reduce((a, b) => a + b, 0);
let y = ry0;
rows.forEach(([ph, pb, st, sb], i) => {
  const h = (avail * weights[i]) / wsum;
  box([head(ph, BLACK), ...bullets(pb)], x1, y, w1, h, GREY);
  tri(y, h);
  box([head(st), ...bullets(sb)], x2, y, w2, h, GREY);
  y += h + GAP;
});

// risks and mitigation span the four rows
box([head("Market Risks"), ...bullets(["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"]),
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  head("Political Risks"), ...bullets(["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"])],
  x3, ry0, w3, ryEnd - ry0, GREY, { after: 2 });
box(bullets(["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs", "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"]),
  x4, ry0, w4, ryEnd - ry0, GREY, { after: 4 });

L.save(pres, path.join(__dirname, "candidate.pptx"));
