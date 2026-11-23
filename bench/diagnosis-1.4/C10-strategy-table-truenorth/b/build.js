// C10 variant b: four-column strategy overview table in the TrueNorth (Pola) deck style.
// Frame (red title band, title, source placeholder) from the harness with the deck's style profile.
// Breadcrumb, logo and grey footer band drawn as on the deck's other slides (crumb style from the profile,
// footer band and logo position as on the deck's master / other content slides). The table body is hand-built
// (no generator draws a phase -> strategy grid with spanning risk / mitigation columns): NEW form.
const path = require("path");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));

const TITLE = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";
const { pres, slide, P, prof } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE, source: "Source: TrueNorth Analysis" });
const R = prof.roles, FONT = prof.fonts.latin;
const RED = R.main, BLACK = R.text, WHITE = "FFFFFF";
const HEAD = prof.table.header_fill;       // CDCDCD: the deck's table cell grey
const LIGHT = R.panel;                     // F1F1F1: light panel grey
const MUTED = "CCCCCC";                    // muted breadcrumb steps (profile crumb colours)

// ---- frame furniture of the deck: grey footer band (behind the source line), breadcrumb, logo ----
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: MUTED }, line: { type: "none" } });
slide._slideObjects.unshift(slide._slideObjects.pop());   // band to the back, under the source placeholder
const cs = prof.crumb, items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1;
const runs = [];
items.forEach((it, i) => {
  if (i) runs.push({ text: " ► ", options: { color: RED } });
  runs.push({ text: it, options: { color: i === cur ? BLACK : MUTED } });
});
slide.addText(runs, { x: cs.x, y: cs.y, w: 7.6, h: 0.27, fontFace: FONT, fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true });
slide.addImage({ path: path.join(__dirname, "truenorth-logo.jpg"), x: 8.54, y: 0, w: 1.42, h: 0.41 });

// ---- table geometry ----
const X0 = 0.26, GAP = 0.07, VG = 0.06;
const CW = [3.0, 3.0, 1.8, 1.55];
const CX = CW.map((_, j) => X0 + CW.slice(0, j).reduce((a, b) => a + b, 0) + j * GAP);
const Y0 = 1.47, HH = 0.34, SH = 0.86, BOT = 7.13;
const YS = Y0 + HH + VG, YD = YS + SH + VG;

const T = (t, o = {}) => ({ text: t, options: { breakLine: true, ...o } });
const bul = (t, o = {}) => T(t, { bullet: { indent: 9 }, ...o });
const box = (x, y, w, h, fill) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
const text = (runs, x, y, w, h, o = {}) => {
  runs[runs.length - 1].options.breakLine = false;
  slide.addText(runs, { x, y, w, h, fontFace: FONT, fontSize: o.pt || 10, color: o.color || BLACK, margin: [3, 5, 3, 5], valign: o.valign || "top", align: o.align || "left", isTextBox: true, bold: !!o.bold, paraSpaceAfter: o.after || 0 });
};

// row 1: column headers (fourth left empty)
["Current situation", "Key strategies & initiatives", "Risks", ""].forEach((h, j) => {
  box(CX[j], Y0, CW[j], HH, HEAD);
  if (h) text([T(h)], CX[j], Y0, CW[j], HH, { pt: prof.table.pt, align: "center", valign: "middle" });
});

// row 2: summary row, strongly filled
const sum = [
  [bul("Growing mid & high end skincare market"), bul("Emerging consumer preferences"), bul("POLA Co.’s poor performance in China")],
  [bul("Improve penetration by product reposition"), bul("Enhance brand recognition, image and memory along whole consumer decision journey")],
  [T("Market Risks"), T("Political Risks")],
  [T("R&D Process"), T("Product Intro"), T("Re-evaluation")],
];
sum.forEach((r, j) => {
  box(CX[j], YS, CW[j], SH, RED);
  text(r, CX[j], YS, CW[j], SH, { pt: 10.5, color: WHITE, valign: "middle", bold: true, align: j > 1 ? "center" : "left" });
});

// rows 3-6: phase -> strategy pairs
const rows = [
  [["Planning phase", "Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
   ["Brand position", "Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"]],
  [["Awareness phase", "Desire for emotional empathy", "Dependence on social media", "Idol effect"],
   ["Marketing strategy", "Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"]],
  [["Purchase phase", "Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
   ["Channel optimization", "Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"]],
  [["Aftersales phase", "Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
   ["Loyalty management", "Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"]],
];
// row heights in proportion to the lines each pair needs (approx. 46 characters per line at 10 pt in a 3.0 in box)
const lines = (c) => 1 + c.slice(1).reduce((a, s) => a + Math.ceil(s.length / 46), 0);
const need = rows.map((r) => Math.max(lines(r[0]), lines(r[1])) + 1.5);
const avail = BOT - YD - VG * (rows.length - 1), tot = need.reduce((a, b) => a + b, 0);
let y = YD;
rows.forEach((r, i) => {
  const h = (avail * need[i]) / tot;
  r.forEach((c, j) => {
    box(CX[j], y, CW[j], h, LIGHT);
    text([T(c[0], { bold: true, fontSize: 11 }), ...c.slice(1).map((s) => bul(s))], CX[j], y + 0.02, CW[j], h - 0.04, { pt: 10, valign: "middle", after: 2 });
  });
  y += h + VG;
});

// column 3: one tall box, two sub-headed groups
const YT = YD, HT = BOT - YD;
box(CX[2], YT, CW[2], HT, LIGHT);
text([
  T("Market Risks", { bold: true, fontSize: 11 }),
  bul("Competitor responses to anti-hero products"), bul("Four Channel management takes efforts"), bul("R&D process not entirely aligned with consumer trends for products", { paraSpaceAfter: 22 }),
  T("Political Risks", { bold: true, fontSize: 11 }),
  bul("Import tax increase for premium cosmetics products"), bul("Floating exchange"), bul("Political outrage in south Asia area"),
], CX[2], YT + 0.08, CW[2], HT - 0.16, { pt: 11, valign: "top", after: 5 });

// column 4: one tall box, four bullets with a gap before the last
box(CX[3], YT, CW[3], HT, LIGHT);
text([
  bul("Actively collect consumer feedback to facilitate R&D process"), bul("Roll out products quickly to meet consumer needs"),
  bul("Prioritize channel management for weak channels", { paraSpaceAfter: 48 }),
  bul("Re-consider manufacturing strategy in 2 years and consider option of building factory in China"),
], CX[3], YT + 0.08, CW[3], HT - 0.16, { pt: 11, valign: "top", after: 8 });

L.save(pres, __dirname + "/candidate.pptx");
