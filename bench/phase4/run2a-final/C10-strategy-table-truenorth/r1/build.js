// C10 rebuild: strategy overview table in the TrueNorth (Pola) deck style, deck as reference (leave-one-out).
// Form: one native table in the deck's own look (red header cells, grey F1F1F1 rows split by white rules,
// the highlighted row white and outlined in red, as in the deck's entry-mode scoring table), with red arrows
// pairing each consumer phase with its strategy. table() cannot span Risks / Mitigation down the four phase
// rows (rowspan outside the first column), so the table is drawn here with the profile's colours and sizes.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const title = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";
  const { pres, slide, P, prof } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title });
  const font = P.THEME.bodyFontFace;
  const RED = prof.roles.main, TXT = prof.roles.text, PANEL = prof.roles.panel, GREY = prof.neutrals_ranked[0];
  const PT = prof.body.label_pt;                       // 12 pt: the profile's smallest allowed body size

  // breadcrumb: deck's crumb (14 pt, done sections light grey, current black, red separators)
  const cr = prof.crumb, items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1;
  const runs = [];
  items.forEach((t, i) => { if (i) runs.push({ text: " ► ", options: { color: RED } }); runs.push({ text: t, options: { color: i === cur ? "000000" : "CCCCCC" } }); });
  slide.addText(runs, { x: cr.x, y: cr.y, w: 8.0, h: 0.3, fontFace: font, fontSize: cr.pt, margin: 0, valign: "top", isTextBox: true });

  // grey footer band of the deck, then the source line on it
  slide.addShape("rect", { x: 0, y: 7.2, w: 10, h: 0.3, fill: { color: GREY }, line: { type: "none" } });
  slide.addText("Source: TrueNorth Analysis", { placeholder: "source" });

  // ---- table geometry ----
  const x0 = prof.margins.left, right = 10 - prof.margins.right;
  const colW = [2.68, 0.2, 3.58, 1.62, 1.51];
  const k = (right - x0) / colW.reduce((a, b) => a + b, 0); for (let i = 0; i < colW.length; i++) colW[i] *= k;
  const y0 = 1.5, hH = 0.36, topH = 1.06, rowH = [1.1, 0.9, 1.1, 1.06];

  const LS = 0.95, ind = 8;
  const para = (t, o = {}) => ({ text: t, options: { breakLine: true, lineSpacingMultiple: LS, ...o } });
  const bullets = (arr, o = {}) => arr.map((t) => para(t, { bullet: { indent: ind }, ...o }));
  const head = (t, o = {}) => para(t, { bold: true, ...o });
  const last = (a) => { a[a.length - 1].options.breakLine = false; return a; };

  const none = { type: "none" }, wb = (w) => ({ type: "solid", color: "FFFFFF", pt: w });
  const cellB = [wb(3), wb(3), wb(3), wb(3)];
  const mar = [0.05, 0.05, 0.05, 0.07];
  const grey = (text, o = {}) => ({ text, options: { fill: { color: PANEL }, border: cellB, valign: "middle", margin: mar, ...o } });
  const arrowCell = (o = {}) => ({ text: "", options: { fill: { color: "FFFFFF" }, border: cellB, ...o } });

  const header = ["Current situation", "", "Key strategies & initiatives", "Risks", "Mitigation"].map((t, j) => ({
    text: t, options: { bold: true, color: "FFFFFF", fontSize: prof.panel.pt, align: "center", valign: "middle",
      fill: { color: j === 1 ? "FFFFFF" : RED }, border: cellB, margin: [0.02, 0.04, 0.02, 0.04] } }));

  const top = [
    { text: last(bullets(["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"], { bold: true })), options: { fill: { color: "FFFFFF" }, border: cellB, valign: "middle", margin: mar } },
    arrowCell(),
    { text: last(bullets(["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"], { bold: true })), options: { fill: { color: "FFFFFF" }, border: cellB, valign: "middle", margin: mar } },
    { text: last(bullets(["Market Risks", "Political Risks"], { bold: true })), options: { fill: { color: "FFFFFF" }, border: cellB, valign: "middle", margin: mar } },
    { text: last(bullets(["R&D Process", "Product Intro", "Re-evaluation"], { bold: true })), options: { fill: { color: "FFFFFF" }, border: cellB, valign: "middle", margin: mar } },
  ];

  const pairs = [
    ["Planning phase", ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
      "Brand position", ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"]],
    ["Awareness phase", ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
      "Marketing strategy", ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"]],
    ["Purchase phase", ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
      "Channel optimization", ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"]],
    ["Aftersales phase", ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
      "Loyalty management", ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"]],
  ];
  const risks = last([
    head("Market Risks"),
    ...bullets(["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"]),
    head("Political Risks", { paraSpaceBefore: 8 }),
    ...bullets(["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"]),
  ]);
  const mitig = last(bullets(["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
    "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"], { paraSpaceAfter: 6 }));

  const body = pairs.map(([ph, needs, st, acts], i) => {
    const r = [grey(last([head(ph), ...bullets(needs)])), arrowCell(), grey(last([head(st), ...bullets(acts)]))];
    if (i === 0) r.push(grey(risks, { rowspan: 4, valign: "top", margin: [0.1, 0.05, 0.05, 0.07] }), grey(mitig, { rowspan: 4, valign: "top", margin: [0.1, 0.05, 0.05, 0.07] }));
    return r;
  });

  const allH = [hH, topH, ...rowH];
  slide.addTable([header, top, ...body], { x: x0, y: y0, w: right - x0, colW, rowH: allH, fontFace: font, fontSize: PT, color: TXT, autoPage: false });

  // overlays: red outline on the highlighted row, red arrows pairing situation -> strategy
  const yRow = (i) => y0 + allH.slice(0, i).reduce((a, b) => a + b, 0);
  slide.addShape("rect", { x: x0 + 0.01, y: yRow(1) + 0.03, w: right - x0 - 0.02, h: topH - 0.06, fill: { type: "none" }, line: { color: RED, width: 1.75 } });
  const ax = x0 + colW[0] + colW[1] / 2;
  for (let i = 1; i < allH.length; i++) {
    const cy = yRow(i) + allH[i] / 2, aw = 0.15, ah = 0.24;
    slide.addShape("triangle", { x: ax - ah / 2, y: cy - aw / 2, w: ah, h: aw, rotate: 90, fill: { color: RED }, line: { type: "none" } });
  }

  await L.save(pres, __dirname + "/candidate.pptx");
})();
