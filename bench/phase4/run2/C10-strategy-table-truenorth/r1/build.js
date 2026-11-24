// C10 strategy overview table, TrueNorth/Pola deck style (deck as reference, leave-one-out).
// Frame (red title band, Calibri, sizes) from the deck's style profile via the harness; the four-column overview
// is drawn as a banded table of shapes in the deck's own table look (red header row as on its Harvey-ball and
// three-issue tables, F1F1F1 bands with white gutters, pink highlight band, red ► pairing marks as in its crumb).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const RED = "CC0000", BLACK = "000000", BAND = "F1F1F1", PINK = "EBC6C5", FOOT = "D9D9D9", GREY = "777777", LIGHT = "CCCCCC";
const FONT = "Calibri";

(async () => {
  const title = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";
  const { pres, slide } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title });

  // ---- breadcrumb in the deck's form: grey sections, red ► separators, current section black
  const crumb = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1;
  const runs = [];
  crumb.forEach((t, i) => {
    if (i) runs.push({ text: " ► ", options: { color: RED } });
    runs.push({ text: t, options: { color: i === cur ? BLACK : LIGHT } });
  });
  slide.addText(runs, { x: 0.35, y: 0.07, w: 7.9, h: 0.3, fontFace: FONT, fontSize: 14, margin: 0, valign: "top", isTextBox: true });
  // logo slot: no official TrueNorth logo file in Objects/Brand, so the team name as a text label (Objects/images.md)
  slide.addText("True North", { x: 8.35, y: 0.04, w: 1.5, h: 0.34, fontFace: FONT, fontSize: 16, italic: true, bold: true, color: GREY, align: "right", valign: "middle", margin: 0, isTextBox: true });

  // ---- footer band with the source, as on every content slide of the deck
  slide.addShape("rect", { x: 0, y: 7.19, w: 10, h: 0.31, fill: { color: FOOT }, line: { type: "none" } });
  slide.addText("Source: TrueNorth Analysis", { x: 0.35, y: 7.21, w: 7, h: 0.26, fontFace: FONT, fontSize: 10, color: BLACK, valign: "middle", margin: 0, isTextBox: true });

  // ---- grid
  const G = 0.04;                                    // white gutter between bands
  const X = { c1: 0.25, c1w: 2.62, ar: 2.87, arw: 0.2, c2: 3.07, c2w: 3.73, c3: 6.84, c3w: 1.55, c4: 8.43, c4w: 1.41 };
  const yHead = 1.5, hHead = 0.36, yTop = yHead + hHead + G, hTop = 1.04, yRows = yTop + hTop + G, yEnd = 7.12;

  const box = (x, y, w, h, fill) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
  // paragraphs: {h: heading} bold label line, {b: text} bullet
  const para = (items, pt, o = {}) => items.map((it, k) => {
    const last = k === items.length - 1;
    if (it.h) return { text: it.h, options: { bold: true, color: it.c || RED, fontSize: o.hpt || pt, breakLine: !last, paraSpaceBefore: k && o.gap ? o.gap : 0 } };
    return { text: it.b, options: { bullet: { indent: 10 }, color: BLACK, fontSize: pt, breakLine: !last, paraSpaceBefore: 0 } };
  });
  const text = (items, x, y, w, h, pt, o = {}) => slide.addText(para(items, pt, o), {
    x, y, w, h, fontFace: FONT, fontSize: pt, valign: o.valign || "top", margin: [3, 5, 2, 5], isTextBox: true, lineSpacingMultiple: 0.95 });

  // ---- header row
  [["Current situation", X.c1, X.c1w + X.arw], ["Key strategies & initiatives", X.c2, X.c2w], ["Risks", X.c3, X.c3w], ["Mitigation", X.c4, X.c4w]]
    .forEach(([t, x, w]) => {
      box(x, yHead, w - (x === X.c1 ? G : 0), hHead, RED);
      slide.addText(t, { x, y: yHead, w: w - (x === X.c1 ? G : 0), h: hHead, fontFace: FONT, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
    });

  // ---- top highlighted row: the overall picture
  box(X.c1, yTop, X.c4 + X.c4w - X.c1, hTop, PINK);
  text([{ b: "Growing mid & high end skincare market" }, { b: "Emerging consumer preferences" }, { b: "POLA Co.'s poor performance in China" }], X.c1, yTop, X.c1w, hTop, 12, { valign: "middle" });
  text([{ b: "Improve penetration by product reposition" }, { b: "Enhance brand recognition, image and memory along whole consumer decision journey" }], X.c2, yTop, X.c2w, hTop, 12, { valign: "middle" });
  text([{ b: "Market Risks" }, { b: "Political Risks" }], X.c3, yTop, X.c3w, hTop, 12, { valign: "middle" });
  text([{ b: "R&D Process" }, { b: "Product Intro" }, { b: "Re-evaluation" }], X.c4, yTop, X.c4w, hTop, 12, { valign: "middle" });
  const mark = (x, y) => slide.addShape("triangle", { x, y: y - 0.09, w: 0.14, h: 0.18, rotate: 90, fill: { color: RED }, line: { type: "none" } });
  mark(X.ar + 0.03, yTop + hTop / 2);

  // ---- four rows: consumer phase ► strategy pillar
  const rows = [
    { phase: "Planning phase", sit: ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
      pillar: "Brand position", str: ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"], wt: 5 },
    { phase: "Awareness phase", sit: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
      pillar: "Marketing strategy", str: ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"], wt: 4 },
    { phase: "Purchase phase", sit: ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
      pillar: "Channel optimization", str: ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"], wt: 5 },
    { phase: "Aftersales phase", sit: ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
      pillar: "Loyalty management", str: ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"], wt: 5 },
  ];
  const avail = yEnd - yRows - G * (rows.length - 1), tw = rows.reduce((a, r) => a + r.wt, 0);
  let y = yRows;
  rows.forEach((r) => {
    const h = avail * r.wt / tw;
    box(X.c1, y, X.c1w, h, BAND);
    box(X.c2, y, X.c2w, h, BAND);
    text([{ h: r.phase, c: BLACK }, ...r.sit.map((b) => ({ b }))], X.c1, y, X.c1w, h, 12, { hpt: 13, valign: "middle" });
    text([{ h: r.pillar }, ...r.str.map((b) => ({ b }))], X.c2, y, X.c2w, h, 12, { hpt: 13, valign: "middle" });
    mark(X.ar + 0.03, y + h / 2);
    y += h + G;
  });

  // ---- risks and mitigation: one tall band each, spanning the four rows
  const hSpan = yEnd - yRows;
  box(X.c3, yRows, X.c3w, hSpan, BAND);
  box(X.c4, yRows, X.c4w, hSpan, BAND);
  text([{ h: "Market Risks", c: BLACK }, { b: "Competitor responses to anti-hero products" }, { b: "Four Channel management takes efforts" }, { b: "R&D process not entirely aligned with consumer trends for products" },
        { h: "Political Risks", c: BLACK }, { b: "Import tax increase for premium cosmetics products" }, { b: "Floating exchange" }, { b: "Political outrage in south Asia area" }],
       X.c3, yRows + 0.06, X.c3w, hSpan - 0.12, 12, { gap: 6 });
  slide.addText([
    "Actively collect consumer feedback to facilitate R&D process",
    "Roll out products quickly to meet consumer needs",
    "Prioritize channel management for weak channels",
    "Re-consider manufacturing strategy in 2 years and consider option of building factory in China",
  ].map((t, k, a) => ({ text: t, options: { bullet: { indent: 10 }, color: BLACK, breakLine: k < a.length - 1, paraSpaceBefore: k ? 6 : 0 } })),
  { x: X.c4, y: yRows + 0.06, w: X.c4w, h: hSpan - 0.12, fontFace: FONT, fontSize: 12, valign: "top", margin: [3, 5, 2, 5], isTextBox: true, lineSpacingMultiple: 0.95 });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
