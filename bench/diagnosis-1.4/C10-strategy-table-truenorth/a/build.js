// C10 strategy overview table, in the style of Case-2016-TrueNorth-Pola-China-growth (deck as reference).
// Built with the deck's style profile (frame: crumb, red title band, source line) and hand-drawn cells in the
// deck's table look: red header cells with white text (as the deck's Harvey tables, slides 12 and 15),
// grey F1F1F1 bands with white gutters, red label chips (as "Example" / "Given more time"), no generator for this form.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));

const { pres, slide, B, P, prof } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
});

const R = prof.roles, RED = R.main, PANEL = R.panel, PINK = R.grey4, TXT = R.text, WHITE = "FFFFFF", GREY = R.grey2;
const FONT = "Calibri";
const BAND = "CCCCCC";    // the deck's grey footer band (bottom 0.29 in of every content slide), CCCCCC as in the crumb
// footer band first, then the source placeholder and a slide number on top of it (the band would hide the layout's number)
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: BAND }, line: { type: "none" } });
slide.addText("Source: TrueNorth Analysis", { placeholder: "source" });
slide.slideNumber = { x: 9.45, y: 7.27, w: 0.5, h: 0.19, fontFace: "Calibri", fontSize: 10, color: "000000", align: "right" };
// breadcrumb as the deck draws it: grey sections, current one black, red triangles between (crumbLine colours the triangles black)
{ const cs = prof.crumb, items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1, runs = [];
  items.forEach((it, i) => { if (i) runs.push({ text: " \u25BA ", options: { color: R.main } }); runs.push({ text: it, options: { color: i === cur ? "000000" : "CCCCCC" } }); });
  slide.addText(runs, { x: cs.x, y: cs.y, w: 8.0, h: 0.3, fontFace: "Calibri", fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true }); }
const PT = 10.5;          // body text inside the cells
const add = (text, x, y, w, h, o = {}) => slide.addText(text, {
  x, y, w, h, fontFace: FONT, fontSize: o.pt || PT, color: o.color || TXT, bold: !!o.bold, align: o.align || "left",
  valign: o.valign || "top", margin: o.margin ?? [2, 4, 2, 4], isTextBox: true, paraSpaceAfter: o.psa || 0, objectName: o.name,
});
const rect = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: 1.25 } : { type: "none" } });
const bullets = (items, o = {}) => items.map((t, i) => ({ text: t, options: { bullet: { indent: 9 }, breakLine: i < items.length - 1, bold: !!o.bold } }));
const head = (label, items, o = {}) => [{ text: label, options: { bold: true, color: o.labelColor || TXT, breakLine: true } }, ...bullets(items)];

// ---- grid ----
const X0 = 0.25, X1 = 9.84, GUT = 0.05;   // the profile margins
const colW = [2.52, 3.12, 2.05, 1.75];             // situation | strategy | risks | mitigation
const xs = []; { let x = X0; colW.forEach((w) => { xs.push(x); x += w + GUT; }); }
const Y0 = B.y + 0.0, HH = 0.36;                   // header row
const TOPY = Y0 + HH + GUT, TOPH = 0.9;           // highlighted top row
const ROWY = TOPY + TOPH + 0.1, ROWEND = 7.13;

// header row: red cells, white text
["Current situation", "Key strategies & initiatives", "Risks", "Mitigation"].forEach((h, j) => {
  rect(xs[j], Y0, colW[j], HH, RED);
  add(h, xs[j], Y0, colW[j], HH, { pt: 13, color: WHITE, bold: true, align: "center", valign: "middle" });
});

// top highlighted row: the issue and the answer in one line, pink band boxed in red
rect(X0, TOPY, X1 - X0, TOPH, PINK, RED);
const top = [
  ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"],
  ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"],
  ["Market Risks", "Political Risks"],
  ["R&D Process", "Product Intro", "Re-evaluation"],
];
top.forEach((it, j) => add(bullets(it, { bold: true }), xs[j] + (j ? 0.14 : 0.02), TOPY + 0.03, colW[j] - (j ? 0.16 : 0.04), TOPH - 0.06, { pt: 10, valign: "middle" }));
const tri = (x, y, h, color = RED) => slide.addShape("rightArrow", { x, y, w: 0.2, h, fill: { color }, line: { type: "none" } });
[1, 3].forEach((j) => tri(xs[j] - 0.09, TOPY + TOPH / 2 - 0.14, 0.28));

// phase rows: consumer phase -> strategy
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
const lines = rows.map((r) => 1 + Math.max(r[1].length, r[3].length) + 0.4);   // rows sized by their content
const free = ROWEND - ROWY - (rows.length - 1) * GUT, tot = lines.reduce((a, b) => a + b, 0);
let yy = ROWY;
rows.forEach(([ph, needs, st, acts], i) => {
  const y = yy, RH = free * lines[i] / tot; yy += RH + GUT;
  rect(xs[0], y, colW[0], RH, PANEL);
  rect(xs[1], y, colW[1], RH, PANEL);
  add(head(ph, needs, { labelColor: RED }), xs[0] + 0.03, y + 0.03, colW[0] - 0.06, RH - 0.06, { valign: "middle" });
  add(head(st, acts, { labelColor: RED }), xs[1] + 0.16, y + 0.03, colW[1] - 0.18, RH - 0.06, { valign: "middle" });
  tri(xs[1] - 0.09, y + RH / 2 - 0.15, 0.3);
});

// risks column spanning the phase rows
const RY = ROWY, RHT = ROWEND - ROWY;
rect(xs[2], RY, colW[2], RHT, PANEL);
const risks = [
  ["Market Risks", ["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"]],
  ["Political Risks", ["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"]],
];
const half = (RHT - GUT) / 2;
risks.forEach(([lab, it], k) => {
  const y = RY + k * (half + GUT);
  if (k) slide.addShape("line", { x: xs[2] + 0.12, y: y - GUT / 2, w: colW[2] - 0.24, h: 0, line: { color: WHITE, width: 3 } });
  rect(xs[2] + 0.12, y + 0.18, 1.45, 0.3, RED);
  add(lab, xs[2] + 0.12, y + 0.18, 1.45, 0.3, { pt: 12, color: WHITE, bold: true, valign: "middle", margin: [0, 6, 0, 6] });
  add(bullets(it), xs[2] + 0.04, y + 0.56, colW[2] - 0.08, half - 0.7, { pt: 11, psa: 4 });
});

// mitigation column spanning the phase rows
rect(xs[3], RY, colW[3], RHT, PANEL);
tri(xs[3] - 0.09, RY + RHT / 2 - 0.2, 0.4);
add(bullets([
  "Actively collect consumer feedback to facilitate R&D process",
  "Roll out products quickly to meet consumer needs",
  "Prioritize channel management for weak channels",
  "Re-consider manufacturing strategy in 2 years and consider option of building factory in China",
]), xs[3] + 0.16, RY + 0.1, colW[3] - 0.2, RHT - 0.2, { pt: 11, psa: 10, valign: "middle" });

L.save(pres, __dirname + "/candidate.pptx");
