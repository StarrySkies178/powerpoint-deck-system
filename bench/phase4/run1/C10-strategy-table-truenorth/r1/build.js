// C10 rebuild (run1, r1): strategy overview table in the TrueNorth Pola deck style.
// Style from the deck's profile (Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json) and its other slides:
// red title band, grey breadcrumb with red triangles, logo top right, grey footer bar,
// red header cells with white text (as on the deck's Harvey-ball tables), grey F1F1F1 body cells, light red tint for a highlighted row.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2016-TrueNorth-Pola-China-growth",
    title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
    source: "Source: TrueNorth Analysis",
  });
  const C = P.C, FONT = P.THEME.bodyFontFace;
  const RED = C.navy, GREY = C.g1, PINK = C.g2, BLACK = C.text, WHITE = "FFFFFF";
  const PT = 12, LS = 13.5;   // table cells at the profile's label_pt (12): the prompt's full text does not fit four columns at 13-14 pt

  // ---- deck furniture the generic master does not carry: breadcrumb with red triangles, logo, grey footer bar
  const crumb = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1;
  const runs = [];
  crumb.forEach((t, i) => {
    if (i) runs.push({ text: " ► ", options: { color: RED } });
    runs.push({ text: t, options: { color: i === cur ? BLACK : "CCCCCC" } });
  });
  slide.addText(runs, { x: 0.35, y: 0.07, w: 8.1, h: 0.3, fontFace: FONT, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "breadcrumb" });
  slide.addImage({ path: path.join(__dirname, "logo.jpg"), x: 8.54, y: 0.0, w: 1.42, h: 0.41, objectName: "logo" });
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" }, objectName: "footer bar" });
  // footer bar goes to the back so the source line (filled by frame) stays on top of it
  const objs = slide._slideObjects; objs.unshift(objs.pop());

  // ---- helpers
  const box = (x, y, w, h, fill, name) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" }, objectName: name });
  const bullets = (items) => items.map((t) => ({ text: t, options: { bullet: { code: "2022", indent: 10 }, breakLine: true } }));
  const cell = (paras, x, y, w, h, o = {}) => slide.addText(paras, {
    x, y, w, h, fontFace: FONT, fontSize: PT, color: BLACK, valign: o.valign || "top", align: "left",
    margin: [3, 4, 2, 4], lineSpacing: LS, isTextBox: true, objectName: o.name });
  const b = (r) => ({ ...r, options: { ...r.options, bold: true } });
  const head = (t, color = BLACK) => ({ text: t, options: { bold: true, color, breakLine: true } });

  // ---- columns: situation | arrow | strategies | risks | mitigation
  const X = { sit: 0.25, arr: 2.99, str: 3.21, risk: 6.91, mit: 8.43 }, Wd = { sit: 2.74, str: 3.64, risk: 1.46, mit: 1.41 };
  const top = 1.47, hH = 0.32;
  [["Current situation", "sit"], ["Key strategies & initiatives", "str"], ["Risks", "risk"], ["Mitigation", "mit"]].forEach(([t, k]) => {
    box(X[k], top, Wd[k], hH, RED, "header " + t);
    slide.addText(t, { x: X[k], y: top, w: Wd[k], h: hH, fontFace: FONT, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });

  // ---- highlighted top row: the overview in one line of cells
  const y1 = top + hH + 0.04, h1 = 0.98;
  box(X.sit, y1, 9.59, h1, PINK, "highlight row");
  cell(bullets(["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"]), X.sit, y1, Wd.sit, h1, { valign: "middle" });
  cell(bullets(["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"]), X.str, y1, Wd.str, h1, { valign: "middle" });
  cell(bullets(["Market Risks", "Political Risks"]).map(b), X.risk, y1, Wd.risk, h1, { valign: "middle" });
  cell(bullets(["R&D Process", "Product Intro", "Re-evaluation"]).map(b), X.mit, y1, Wd.mit, h1, { valign: "middle" });
  slide.addShape("rightArrow", { x: X.arr + 0.02, y: y1 + h1 / 2 - 0.13, w: 0.2, h: 0.26, fill: { color: RED }, line: { type: "none" } });

  // ---- four phase -> strategy rows
  const rows = [
    ["Planning phase", ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
      "Brand position", ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"], 5],
    ["Awareness phase", ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
      "Marketing strategy", ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"], 4],
    ["Purchase phase", ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
      "Channel optimization", ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"], 5],
    ["Aftersales phase", ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
      "Loyalty management", ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"], 5],
  ];
  const y2 = y1 + h1 + 0.04, bottom = 7.14, gap = 0.04;
  const units = rows.reduce((a, r) => a + r[4], 0), unit = (bottom - y2 - gap * (rows.length - 1)) / units;
  let y = y2;
  rows.forEach(([ph, sit, st, ini, n], i) => {
    const h = unit * n;
    box(X.sit, y, Wd.sit, h, GREY, "situation " + (i + 1));
    box(X.str, y, Wd.str, h, GREY, "strategy " + (i + 1));
    cell([head(ph), ...bullets(sit)], X.sit, y, Wd.sit, h, { valign: "middle", name: "situation text " + (i + 1) });
    cell([head(st, RED), ...bullets(ini)], X.str, y, Wd.str, h, { valign: "middle", name: "strategy text " + (i + 1) });
    slide.addShape("rightArrow", { x: X.arr + 0.02, y: y + h / 2 - 0.13, w: 0.2, h: 0.26, fill: { color: RED }, line: { type: "none" } });
    y += h + gap;
  });

  // ---- risks and mitigation span the four rows
  const hR = bottom - y2;
  box(X.risk, y2, Wd.risk, hR, GREY, "risks");
  cell([head("Market Risks", RED),
    ...bullets(["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"]),
    { text: " ", options: { fontSize: 6, breakLine: true } },
    head("Political Risks", RED),
    ...bullets(["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"])],
    X.risk, y2, Wd.risk, hR, { valign: "middle", name: "risk text" });
  box(X.mit, y2, Wd.mit, hR, GREY, "mitigation");
  cell(bullets(["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
    "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"])
    .map((r) => ({ ...r, options: { ...r.options, paraSpaceAfter: 6 } })),
    X.mit, y2, Wd.mit, hR, { valign: "middle", name: "mitigation text" });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
