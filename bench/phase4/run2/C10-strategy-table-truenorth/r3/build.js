// C10 strategy overview table, TrueNorth Pola deck style (deck as reference, leave-one-out).
// Frame (title band, breadcrumb, source) from the deck's style profile via bench_lib; the body is a
// four-column overview drawn in the deck's own forms: red header bars with white text (as the
// deck's Harvey table header), light grey panels, bold red labels, red arrows between stages.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";
const { pres, slide, P } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: TITLE,   // source and breadcrumb are drawn below, after the footer band, so the band sits under them
});
const C = P.C, FONT = P.THEME.bodyFontFace;
const RED = "CC0000", BLACK = "000000", PANEL = "F1F1F1", PINK = "EBC6C5", WHITE = "FFFFFF";
const PT = 11, HEAD = 14;

// deck furniture the profile's master does not draw: grey footer band (under the source line) and the
// breadcrumb with red separators, current section black, the others light grey
slide.addShape("rect", { x: 0, y: 7.19, w: 10, h: 0.31, fill: { color: "D9D9D9" }, line: { type: "none" }, objectName: "footer band" });
slide.addText("Source: TrueNorth Analysis", { placeholder: "source" });
const crumb = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1, runs = [];
crumb.forEach((t, i) => { if (i) runs.push({ text: " \u25BA ", options: { color: RED } }); runs.push({ text: t, options: { color: i === cur ? BLACK : "CCCCCC" } }); });
slide.addText(runs, { x: 0.35, y: 0.07, w: 8.2, h: 0.3, fontFace: FONT, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "breadcrumb" });

// bullet paragraphs (optionally led by a bold label line)
function para(items, o = {}) {
  const runs = [];
  if (o.label) runs.push({ text: o.label, options: { bold: true, color: o.labelColor || RED, fontSize: o.labelPt || PT + 1, breakLine: true } });
  items.forEach((t, i) => {
    if (typeof t === "object" && t.label) { runs.push({ text: t.label, options: { bold: true, color: RED, fontSize: PT + 1, breakLine: true, paraSpaceBefore: i ? 4 : 0 } }); return; }
    runs.push({ text: t, options: { bullet: { indent: 10 }, breakLine: i < items.length - 1, bold: !!o.bold, color: BLACK, fontSize: PT } });
  });
  return runs;
}
function box(x, y, w, h, fill, runs, o = {}) {
  slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" }, objectName: o.name });
  slide.addText(runs, { x, y, w, h, fontFace: FONT, fontSize: PT, color: BLACK, valign: o.valign || "top", align: "left",
    margin: [3, 5, 3, 4], isTextBox: true, paraSpaceAfter: 1, lineSpacingMultiple: 0.95 });
}
function arrowR(x, y, w, h) { slide.addShape("triangle", { x, y, w, h, rotate: 90, fill: { color: RED }, line: { type: "none" } }); }
function arrowD(x, y, w, h) { slide.addShape("triangle", { x, y, w, h, rotate: 180, fill: { color: RED }, line: { type: "none" } }); }

// ---- grid ----
const X1 = 0.25, W1 = 2.72;            // current situation
const XA = X1 + W1, WA = 0.2;          // arrow gutter
const X2 = XA + WA, W2 = 3.56;         // key strategies & initiatives
const X3 = X2 + W2 + 0.08, W3 = 1.55;   // risks
const X4 = X3 + W3 + 0.16, W4 = 9.82 - (X3 + W3 + 0.16); // mitigation
const Y0 = 1.5, HH = 0.34;             // header row
const YT = Y0 + HH + 0.05, HT = 0.8;  // top highlighted row
const YR = YT + HT + 0.11, YEND = 7.1; // detail rows

// header row: red bars, white text
[["Current situation", X1, W1], ["Key strategies & initiatives", X2, W2], ["Risks", X3, W3], ["Mitigation", X4, W4]].forEach(([t, x, w]) => {
  slide.addShape("rect", { x, y: Y0, w, h: HH, fill: { color: RED }, line: { type: "none" } });
  slide.addText(t, { x, y: Y0, w, h: HH, fontFace: FONT, fontSize: HEAD, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
});

// top highlighted row
box(X1, YT, W1, HT, PINK, para(["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"], { bold: true }), { valign: "middle" });
box(X2, YT, W2, HT, PINK, para(["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"], { bold: true }), { valign: "middle" });
box(X3, YT, W3, HT, PINK, para(["Market Risks", "Political Risks"], { bold: true }), { valign: "middle" });
box(X4, YT, W4, HT, PINK, para(["R&D Process", "Product Intro", "Re-evaluation"], { bold: true }), { valign: "middle" });
arrowR(XA + 0.02, YT + HT / 2 - 0.1, 0.17, 0.2);
// down arrows from the overview row into the detail
[X1 + W1 / 2, X2 + W2 / 2].forEach((cx) => arrowD(cx - 0.12, YT + HT + 0.015, 0.24, 0.09));

// four phase -> strategy rows
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
const lines = [5, 4, 5, 5], gap = 0.06;   // text lines per row (label + wrapped bullets): rows get height by their content
const avail = YEND - YR - gap * (rows.length - 1), weights = lines.map((n) => 0.6 + n), sumW = weights.reduce((a, b) => a + b, 0);
let y = YR;
rows.forEach(([ph, phB, st, stB], i) => {
  const h = (avail * weights[i]) / sumW;
  box(X1, y, W1, h, PANEL, para(phB, { label: ph, labelColor: BLACK }));
  box(X2, y, W2, h, PANEL, para(stB, { label: st }));
  arrowR(XA + 0.02, y + h / 2 - 0.1, 0.17, 0.2);
  y += h + gap;
});

// risks and mitigation span the four rows
box(X3, YR, W3, YEND - YR, PANEL, para([
  { label: "Market Risks" }, "Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products",
  { label: "Political Risks" }, "Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"]));
box(X4, YR, W4, YEND - YR, PANEL, para(["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
  "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"]));
arrowR(X3 + W3 + 0.0, YR + (YEND - YR) / 2 - 0.1, 0.16, 0.2);

L.save(pres, __dirname + "/candidate.pptx");
