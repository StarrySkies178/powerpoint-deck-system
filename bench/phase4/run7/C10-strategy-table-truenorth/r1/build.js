// C10 strategy overview table, TrueNorth (Pola 2016) deck as the style reference (leave-one-out build).
// Form: a native table in the deck's own "panels" look (red header boxes with white text, light grey cells with white
// gaps, the row that matters outlined in red and bold), as on the deck's options table (slide 15) and channel table
// (slide 12). The four consumer-phase rows pair a phase with its strategy across a red arrow; Risks and Mitigation
// span the four rows. Table text at the profile's label size (12 pt, never smaller); breadcrumb with red separators.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P, HOUSE, prof } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
  source: "Source: TrueNorth Analysis",
});
const C = P.C, FONT = HOUSE.FONT.latin;
const RED = C.navy, GREY = prof.roles.panel.toUpperCase(), WHITE = "FFFFFF", BLACK = prof.roles.text.toUpperCase();

// ---- breadcrumb in the deck's form: grey sections, current one black, red ► separators
const cs = prof.crumb, items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1;
const runs = [];
items.forEach((t, i) => {
  if (i) runs.push({ text: " ► ", options: { color: RED } });
  runs.push({ text: t, options: { color: i === cur ? BLACK : "CCCCCC" } });
});
slide.addText(runs, { x: cs.x, y: cs.y, w: 8.6, h: 0.3, fontFace: FONT, fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true });

// ---- table content
const PT = prof.body.label_pt;                    // 12 pt: the deck's table / label size
const LS = 0.95;                                  // line spacing of the cell text
const none = { type: "none" }, gapB = { type: "solid", color: WHITE, pt: 3 };
const bul = (t, o = {}) => ({ text: t, options: { bullet: { indent: 10 }, breakLine: true, lineSpacingMultiple: LS, ...o } });
const head = (t, o = {}) => ({ text: t, options: { bold: true, color: RED, breakLine: true, lineSpacingMultiple: LS, ...o } });
const lastNoBreak = (arr) => { const a = arr.map((r) => ({ ...r, options: { ...r.options } })); a[a.length - 1].options.breakLine = false; return a; };
const cell = (text, o = {}) => ({ text: Array.isArray(text) ? lastNoBreak(text) : text,
  options: { fill: { color: GREY }, border: [gapB, gapB, gapB, gapB], valign: "top", color: BLACK, ...o } });
const hdr = (t, o = {}) => ({ text: t, options: { fill: { color: RED }, color: WHITE, bold: true, align: "center", valign: "middle", border: [gapB, gapB, gapB, gapB], ...o } });
const arrowCell = () => ({ text: "", options: { fill: { color: WHITE }, border: [gapB, gapB, gapB, gapB] } });

const phases = [
  { phase: "Planning phase", sit: ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
    strat: "Brand position", acts: ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"] },
  { phase: "Awareness phase", sit: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
    strat: "Marketing strategy", acts: ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"] },
  { phase: "Purchase phase", sit: ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
    strat: "Channel optimization", acts: ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"] },
  { phase: "Aftersales phase", sit: ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
    strat: "Loyalty management", acts: ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"] },
];
const risks = [head("Market Risks"), bul("Competitor responses to anti-hero products"), bul("Four Channel management takes efforts"),
  bul("R&D process not entirely aligned with consumer trends for products"), head("Political Risks", { paraSpaceBefore: 6 }),
  bul("Import tax increase for premium cosmetics products"), bul("Floating exchange"), bul("Political outrage in south Asia area")];
const mitig = [bul("Actively collect consumer feedback to facilitate R&D process"), bul("Roll out products quickly to meet consumer needs"),
  bul("Prioritize channel management for weak channels"), bul("Re-consider manufacturing strategy in 2 years and consider option of building factory in China")];

// columns: situation | arrow | strategies | risks | mitigation (x 0.25 .. 9.84, the deck's margins)
const X0 = prof.margins.left, WT = 10 - prof.margins.left - prof.margins.right;
const colW = [2.86, 0.2, 3.66, 1.5, 0];
colW[4] = +(WT - colW.slice(0, 4).reduce((a, b) => a + b, 0)).toFixed(3);
const Y0 = 1.48, BOTTOM = 7.16;
const hH = 0.32, topH = 0.92;
const rowH = [1.0, 0.84, 1.0, 1.0];            // sized to each phase's lines; grown below to fill the body
const room = BOTTOM - Y0 - hH - topH, used = rowH.reduce((a, b) => a + b, 0);
const rH = rowH.map((h) => +(h + (room - used) / rowH.length).toFixed(3));

const rows = [];
rows.push([hdr("Current situation"), hdr("", { fill: { color: WHITE } }), hdr("Key strategies & initiatives"), hdr("Risks"), hdr("Mitigation")]);
// top row: the whole picture, outlined in red and bold (the deck's highlight form)
rows.push([
  cell([bul("Growing mid & high end skincare market"), bul("Emerging consumer preferences"), bul("POLA Co.'s poor performance in China")], { bold: true }),
  arrowCell(),
  cell([bul("Improve penetration by product reposition"), bul("Enhance brand recognition, image and memory along whole consumer decision journey")], { bold: true }),
  cell([bul("Market Risks"), bul("Political Risks")], { bold: true }),
  cell([bul("R&D Process"), bul("Product Intro"), bul("Re-evaluation")], { bold: true }),
]);
phases.forEach((p, i) => {
  const r = [cell([head(p.phase), ...p.sit.map((t) => bul(t))]), arrowCell(), cell([head(p.strat), ...p.acts.map((t) => bul(t))])];
  if (i === 0) r.push(cell(risks, { rowspan: 4 }), cell(mitig, { rowspan: 4 }));
  rows.push(r);
});
const allH = [hH, topH, ...rH];
slide.addTable(rows, { x: X0, y: Y0, w: WT, colW, rowH: allH, h: allH.reduce((a, b) => a + b, 0), fontFace: FONT, fontSize: PT, color: BLACK,
  margin: [0.05, 0.05, 0.04, 0.05], valign: "top", autoPage: false, lineSpacingMultiple: LS, objectName: "form:table strategy overview" });

// overlays: red outline on the top row; a red arrow pairing each consumer phase with its strategy (and on the top row)
const xOf = (j) => X0 + colW.slice(0, j).reduce((a, b) => a + b, 0);
const yOf = (k) => Y0 + allH.slice(0, k).reduce((a, b) => a + b, 0);
slide.addShape("rect", { x: X0 + 0.02, y: yOf(1) + 0.02, w: WT - 0.04, h: topH - 0.04, fill: { type: "none" }, line: { color: RED, width: 1.75 }, objectName: "top row outline" });
for (let k = 1; k <= 5; k++) {
  const h = allH[k], ax = xOf(1) + 0.04, aw = colW[1] - 0.08, ah = 0.3;
  slide.addShape("rightArrow", { x: ax, y: yOf(k) + h / 2 - ah / 2, w: aw, h: ah, fill: { color: RED }, line: { type: "none" }, objectName: "pair arrow " + k });
}

L.save(pres, __dirname + "/candidate.pptx");
