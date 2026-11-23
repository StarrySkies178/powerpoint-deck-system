// C10 (variant a): strategy overview table in the TrueNorth Pola deck style (deck as reference, leave-one-out).
// Style: Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json via the harness (title band, crumb, Calibri, roles).
// Forms taken from the deck's OTHER slides (renders in other-slides/):
//   grey table header with white bold text (slides 7, 15), pink tint boxes (slide 7, its example box), red label boxes with white bold
//   text and light-grey bullet panels (slides 10, 12), grey source band at the foot (every content slide),
//   crumb with red separators (every content slide). The logo is placed by build.py from slide 7's stored object.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));
const TITLE = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";
const { pres, slide, P, HOUSE } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
const C = P.C, F = HOUSE.FONT.latin;
const RED = C.navy, G_HEAD = C.g3, G_LAB = C.g4, PANEL = C.g1, PINK = C.g2, BLACK = C.text, WHITE = "FFFFFF";

// ---- frame details the master does not draw: grey source band, crumb with red separators, source line on top
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });
slide.addText("Source: TrueNorth Analysis", { placeholder: "source" });
{
  const items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1, runs = [];
  items.forEach((it, i) => {
    if (i) runs.push({ text: " \u25BA ", options: { color: RED } });
    runs.push({ text: it, options: { color: i === cur ? BLACK : "CCCCCC" } });
  });
  slide.addText(runs, { x: 0.35, y: 0.07, w: 8.1, h: 0.3, fontFace: F, fontSize: 14, margin: 0, valign: "top", isTextBox: true });
}

// ---- helpers
const rect = (x, y, w, h, fill) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
const label = (x, y, w, h, text, fill, pt = 11) => {
  rect(x, y, w, h, fill);
  slide.addText(text, { x, y, w, h, fontFace: F, fontSize: pt, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0.03 });
};
// bullets: items are strings; "**x**" makes x bold
const runsOf = (s) => String(s).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => p.startsWith("**") ? { text: p.slice(2, -2), options: { bold: true } } : { text: p, options: {} });
function bullets(x, y, w, h, items, o = {}) {
  const runs = [];
  items.forEach((it, i) => {
    const parts = runsOf(it);
    // paragraph options only on the paragraph's first run: pptxgenjs writes a <a:pPr> for every run that carries any,
    // so a bullet item with a bold keyword would otherwise lose its bullet or be split into several paragraphs
    parts.forEach((r, j) => runs.push({ text: r.text, options: { ...r.options,
      ...(j === 0 ? { bullet: { indent: 9 }, paraSpaceAfter: o.space || 1, lineSpacingMultiple: 0.95 } : {}),
      breakLine: j === parts.length - 1 && i < items.length - 1, color: o.color || BLACK, bold: o.bold || r.options.bold } }));
  });
  slide.addText(runs, { x, y, w, h, fontFace: F, fontSize: o.pt || 10.5, color: BLACK, valign: o.valign || "middle", margin: [2, 4, 2, 4] });
}
const arrow = (x, y, w, h) => slide.addShape("rightArrow", { x, y, w, h, fill: { color: RED }, line: { type: "none" } });

// ---- grid (inches): body 0.25 .. 9.84
const X1 = 0.25, W1 = 2.7, LW1 = 0.8;            // current situation: phase label + needs
const XA = X1 + W1, WA = 0.24;                   // arrow lane
const X2 = XA + WA, W2 = 3.3, LW2 = 0.95;         // key strategies & initiatives: strategy label + initiatives
const X3 = X2 + W2 + 0.08, W3 = 1.66;            // risks
const X4 = X3 + W3 + 0.08, W4 = 9.84 - (X3 + W3 + 0.08);   // mitigation
const HY = 1.5, HH = 0.34;                       // column headers
const TY = HY + HH + 0.06, TH = 0.72;            // top highlighted row
const RY = TY + TH + 0.08, GAP = 0.05, RH = [1.0, 0.9, 1.32, 0.98];

// column headers
[[X1, W1, "Current situation"], [X2, W2, "Key strategies & initiatives"], [X3, W3, "Risks"], [X4, W4, "Mitigation"]]
  .forEach(([x, w, t]) => label(x, HY, w, HH, t, G_HEAD, 13));
arrow(XA + 0.03, HY + 0.07, WA - 0.06, HH - 0.14);

// top highlighted row: what each column comes down to
rect(X1, TY, W1, TH, PINK); rect(X2, TY, W2, TH, PINK); rect(X3, TY, W3, TH, PINK); rect(X4, TY, W4, TH, PINK);
bullets(X1, TY, W1, TH, ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"], { bold: true });
bullets(X2, TY, W2, TH, ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"], { bold: true });
bullets(X3, TY, W3, TH, ["Market Risks", "Political Risks"], { bold: true });
bullets(X4, TY, W4, TH, ["R&D Process", "Product Intro", "Re-evaluation"], { bold: true });
arrow(XA + 0.03, TY + TH / 2 - 0.13, WA - 0.06, 0.26);

// four rows: consumer phase -> strategy
const ROWS = [
  ["Planning phase", ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
   "Brand position", ["Launch **POLA & Jurlique** targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"]],
  ["Awareness phase", ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
   "Marketing strategy", ["Compose fascinating stories or hot topics", "Conduct **social media-focus** marketing initiatives", "Invite **celebrity** as spokespersons"]],
  ["Purchase phase", ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
   "Channel optimization", ["Provide various service like massage", "Build **experience shop** & digitalize current stores", "Stimulate purchase through **multiple channels**", "Optimize **mobile-end** shopping experience"]],
  ["Aftersales phase", ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
   "Loyalty management", ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build **fans-circle** on social media like WeChat"]],
];
let y = RY;
ROWS.forEach(([phase, needs, strat, inits], i) => {
  const h = RH[i];
  label(X1, y, LW1, h, phase, G_LAB);
  rect(X1 + LW1 + 0.04, y, W1 - LW1 - 0.04, h, PANEL);
  bullets(X1 + LW1 + 0.04, y, W1 - LW1 - 0.04, h, needs, { pt: 10 });
  arrow(XA + 0.03, y + h / 2 - 0.15, WA - 0.06, 0.3);
  label(X2, y, LW2, h, strat, RED);
  rect(X2 + LW2 + 0.04, y, W2 - LW2 - 0.04, h, PANEL);
  bullets(X2 + LW2 + 0.04, y, W2 - LW2 - 0.04, h, inits, { pt: 10 });
  y += h + GAP;
});
const BOT = y - GAP, SPAN = BOT - RY;

// risks: one panel over the four rows, two groups
rect(X3, RY, W3, SPAN, PANEL);
const riskGroup = (yy, h, head, items) => {
  slide.addText(head, { x: X3 + 0.08, y: yy, w: W3 - 0.16, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: RED, valign: "bottom", margin: [0, 2, 1, 2] });
  slide.addShape("line", { x: X3 + 0.08, y: yy + 0.31, w: W3 - 0.16, h: 0, line: { color: RED, width: 1 } });
  bullets(X3, yy + 0.34, W3, h - 0.34, items, { valign: "top", space: 4 });
};
const half = SPAN / 2;
riskGroup(RY + 0.06, half - 0.06, "Market Risks", ["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"]);
riskGroup(RY + half + 0.06, half - 0.06, "Political Risks", ["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"]);

// mitigation: one panel, four actions
rect(X4, RY, W4, SPAN, PANEL);
bullets(X4, RY + 0.06, W4, SPAN - 0.12, ["Actively collect **consumer feedback** to facilitate R&D process", "Roll out products **quickly** to meet consumer needs",
  "Prioritize **channel management** for weak channels", "Re-consider **manufacturing strategy** in 2 years and consider option of building factory in China"], { valign: "top", space: 26 });

L.save(pres, __dirname + "/candidate.pptx");
