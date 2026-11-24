// C10 rebuild 1: strategy overview table in the TrueNorth Pola deck style (deck as reference, leave-one-out).
// Frame (4:3, red title band, crumb, source) from the deck's style profile via the harness.
// Body drawn by hand in the deck's own table vocabulary seen on its other slides: red header cells with
// white bold text (deck slides 12 and 15), light grey bands (12, 15), pink tint for the highlighted row,
// bold row heads, bullets at the deck's dense-table size; grey footer band and TrueNorth logo as on every content slide.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";
const { pres, slide, P } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: TITLE,
});
// crumb, footer band and source are drawn below, in z-order band -> source (the harness would put its source under the band)

const FONT = P.THEME.bodyFontFace;
const RED = "CC0000", BLACK = "000000", WHITE = "FFFFFF", BAND = "F1F1F1", PINK = "EBC6C5", GREY = "A2A2A2", FOOT = "CCCCCC";
const PT = 11, HEAD_PT = 12;

// ---- frame pieces the master does not carry: grey footer band and the logo (every content slide of the deck)
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: FOOT }, line: { type: "none" } });
slide.addImage({ path: path.join(__dirname, "logo-truenorth.jpg"), x: 8.54, y: 0.0, w: 1.42, h: 0.41 });
const prof = require(path.join(__dirname, "../../../../../Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json"));
const sl = prof.source_line, cr = prof.crumb;
slide.addText("Source: TrueNorth Analysis", { x: sl.x, y: sl.y, w: 7, h: 0.22, fontFace: FONT, fontSize: sl.pt, color: BLACK, margin: 0, valign: "top", isTextBox: true });
// breadcrumb as on the deck's other slides: past/future sections light grey, current section black, red "\u25BA" separators
{
  const items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1, runs = [];
  items.forEach((t, i) => { if (i) runs.push({ text: " \u25BA ", options: { color: RED } }); runs.push({ text: t, options: { color: i === cur ? BLACK : "CCCCCC" } }); });
  slide.addText(runs, { x: cr.x, y: cr.y, w: 8.1, h: 0.3, fontFace: FONT, fontSize: cr.pt, margin: 0, valign: "top", isTextBox: true });
}

function box(x, y, w, h, fill) { slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } }); }
function text(runs, x, y, w, h, o = {}) {
  slide.addText(runs, { x, y, w, h, fontFace: FONT, fontSize: o.pt || PT, color: o.color || BLACK, bold: !!o.bold,
    align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? [2, 4, 2, 4], isTextBox: true,
    paraSpaceAfter: o.after ?? 1, lineSpacingMultiple: 0.95 });
}
const bullets = (items, o = {}) => items.map((t, i) => ({ text: t, options: { bullet: { indent: 9 }, breakLine: i < items.length - 1, color: o.color || BLACK } }));
const headed = (head, items, headColor) => [{ text: head, options: { bold: true, color: headColor, breakLine: true } }, ...bullets(items)];

// ---- columns (left margin 0.25, right edge 9.84)
const X0 = 0.25, XR = 9.84;
const A = { x: X0, w: 2.5 };
const B = { x: A.x + A.w + 0.2, w: 3.22 };
const Cc = { x: B.x + B.w + 0.08, w: 1.75 };
const D = { x: Cc.x + Cc.w + 0.2, w: XR - (Cc.x + Cc.w + 0.2) };
const cols = [A, B, Cc, D];

// ---- header row
const yH = 1.5, hH = 0.36;
["Current situation", "Key strategies & initiatives", "Risks", "Mitigation"].forEach((t, i) => {
  box(cols[i].x, yH, cols[i].w, hH, RED);
  text(t, cols[i].x, yH, cols[i].w, hH, { pt: HEAD_PT, bold: true, color: WHITE, align: "center", valign: "middle" });
});

// ---- top highlighted row (the overall picture)
const yT = yH + hH + 0.06, hT = 0.9;
cols.forEach((c) => box(c.x, yT, c.w, hT, PINK));
text(bullets(["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"]), A.x, yT, A.w, hT, { valign: "middle" });
text(bullets(["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"]), B.x, yT, B.w, hT, { valign: "middle" });
text(bullets(["Market Risks", "Political Risks"]), Cc.x, yT, Cc.w, hT, { valign: "middle", bold: true });
text(bullets(["R&D Process", "Product Intro", "Re-evaluation"]), D.x, yT, D.w, hT, { valign: "middle", bold: true });
// arrow between the two halves of the top row
arrow(A.x + A.w + 0.03, yT + hT / 2 - 0.13, 0.14, 0.26);

// ---- four phase rows: consumer phase -> strategy (one-to-one)
const rows = [
  { phase: "Planning phase", needs: ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
    strat: "Brand position", acts: ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"] },
  { phase: "Awareness phase", needs: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
    strat: "Marketing strategy", acts: ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"] },
  { phase: "Purchase phase", needs: ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
    strat: "Channel optimization", acts: ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"] },
  { phase: "Aftersales phase", needs: ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
    strat: "Loyalty management", acts: ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"] },
];
const y0 = yT + hT + 0.08, yEnd = 7.12, gap = 0.06;
const weights = [5, 4.3, 5.2, 5];                   // lines each row carries
const sumW = weights.reduce((a, b) => a + b, 0), avail = yEnd - y0 - gap * (rows.length - 1);
let y = y0;
rows.forEach((r, i) => {
  const h = (avail * weights[i]) / sumW;
  box(A.x, y, A.w, h, BAND); box(B.x, y, B.w, h, BAND);
  text(headed(r.phase, r.needs, BLACK), A.x, y, A.w, h, { valign: "middle" });
  text(headed(r.strat, r.acts, RED), B.x, y, B.w, h, { valign: "middle" });
  arrow(A.x + A.w + 0.03, y + h / 2 - 0.13, 0.14, 0.26);
  y += h + gap;
});

// ---- risks and mitigation: one tall cell each beside the four rows
const hR = yEnd - y0;
box(Cc.x, y0, Cc.w, hR, BAND); box(D.x, y0, D.w, hR, BAND);
const half = (hR - 0.1) / 2;
text(headed("Market Risks", ["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"], RED),
  Cc.x, y0 + 0.04, Cc.w, half, { valign: "middle", after: 3 });
slide.addShape("line", { x: Cc.x + 0.1, y: y0 + 0.05 + half, w: Cc.w - 0.2, h: 0, line: { color: GREY, width: 0.75, dashType: "dash" } });
text(headed("Political Risks", ["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"], RED),
  Cc.x, y0 + 0.06 + half, Cc.w, half, { valign: "middle", after: 3 });
// mitigation answers the risks one by one: three against the market risks, one against the political risks
text(bullets(["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs", "Prioritize channel management for weak channels"]),
  D.x, y0 + 0.04, D.w, half, { valign: "middle", after: 6 });
slide.addShape("line", { x: D.x + 0.1, y: y0 + 0.05 + half, w: D.w - 0.2, h: 0, line: { color: GREY, width: 0.75, dashType: "dash" } });
arrow(Cc.x + Cc.w + 0.03, y0 + 0.04 + half / 2 - 0.13, 0.14, 0.26);
arrow(Cc.x + Cc.w + 0.03, y0 + 0.06 + half * 1.5 - 0.13, 0.14, 0.26);
text(bullets(["Re-consider manufacturing strategy in 2 years and consider option of building factory in China"]),
  D.x, y0 + 0.06 + half, D.w, half, { valign: "middle" });

function arrow(x, y, w, h) { // small red pointer between paired cells (the deck's red "►")
  slide.addShape("triangle", { x: x + w / 2 - h / 2, y: y + h / 2 - w / 2, w: h, h: w, rotate: 90, fill: { color: RED }, line: { type: "none" } });
}

L.save(pres, path.join(__dirname, "candidate.pptx"));
