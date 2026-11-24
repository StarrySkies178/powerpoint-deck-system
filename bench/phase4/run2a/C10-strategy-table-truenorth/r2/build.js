// C10 rebuild: strategy overview table in the TrueNorth Pola deck style (deck as reference, leave-one-out).
// Form: four-column overview (situation | strategy | risks | mitigation) with red header cells and an outlined
// highlighted row, as in the deck's Harvey table (slide 15); grey row-label blocks as on slide 9; red arrows join
// each consumer phase to its strategy. Drawn with the deck's style profile (P.useStyle via the harness).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, HOUSE } = L.start({
    ref: "Case-2016-TrueNorth-Pola-China-growth",
    title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
  });
  const C = P.C, F = HOUSE.FONT.latin;
  const RED = C.navy, GREY = "F1F1F1", MID = "A2A2A2", WHITE = "FFFFFF";
  const PT = 12, HPT = 14;                   // cells at the deck's label size, column heads at its body size
  const none = { type: "none" };

  // footer band of the deck's slides
  slide.addShape("rect", { x: 0, y: 7.18, w: 10, h: 0.32, fill: { color: "D9D9D9" }, line: none });
  slide.addText("Source: TrueNorth Analysis", { placeholder: "source" });

  const crumb = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], runs = [];
  crumb.forEach((t, i) => { if (i) runs.push({ text: " \u25BA ", options: { color: RED } }); runs.push({ text: t, options: { color: i === 1 ? C.text : "CCCCCC" } }); });
  slide.addText(runs, { x: 0.35, y: 0.07, w: 8.0, h: 0.3, fontFace: F, fontSize: 14, margin: 0, valign: "top", isTextBox: true });
  const arrowR = (ax, ay, aw, ah) => slide.addShape("triangle", { x: ax + aw / 2 - ah / 2, y: ay + ah / 2 - aw / 2, w: ah, h: aw, rotate: 90, fill: { color: RED }, line: none });

  const bul = (items, o = {}) => items.map((t, i) => ({ text: t, options: { bullet: { indent: 10 }, breakLine: i < items.length - 1, bold: !!o.bold, color: o.color || C.text } }));
  const text = (runs, x, y, w, h, o = {}) => slide.addText(runs, { x, y, w, h, fontFace: F, fontSize: o.pt || PT, color: o.color || C.text, bold: !!o.bold,
    align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? [2, 3, 2, 3], lineSpacingMultiple: o.ls || 0.9, isTextBox: true });

  // columns: situation | arrow | strategy | risks | mitigation
  const X0 = 0.25, XR = 9.84, G = 0.05;
  const c1 = { x: X0, w: 2.7 }, arr = { x: X0 + 2.7, w: 0.22 }, c2 = { x: X0 + 2.92, w: 3.62 };
  const c3 = { x: c2.x + c2.w + G, w: 1.48 }, c4 = { x: XR - 1.47, w: 1.47 };

  // header row: red cells, white bold
  const yH = 1.47, hH = 0.38;
  [[c1, "Current situation"], [c2, "Key strategies & initiatives"], [c3, "Risks"], [c4, "Mitigation"]].forEach(([c, t]) => {
    slide.addShape("rect", { x: c.x, y: yH, w: c.w, h: hH, fill: { color: RED }, line: none });
    text(t, c.x, yH, c.w, hH, { pt: HPT, bold: true, color: WHITE, align: "center" });
  });

  // highlighted top row: outlined in red, bold
  const yT = yH + hH + 0.06, hT = 1.0;
  slide.addShape("rect", { x: X0, y: yT, w: XR - X0, h: hT, fill: { color: WHITE }, line: { color: RED, width: 1.75 } });
  const top = [
    [c1, ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"]],
    [c2, ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"]],
    [c3, ["Market Risks", "Political Risks"]],
    [c4, ["R&D Process", "Product Intro", "Re-evaluation"]],
  ];
  top.forEach(([c, items]) => text(bul(items, { bold: true }), c.x + 0.03, yT + 0.02, c.w - 0.06, hT - 0.04));
  arrowR(arr.x + 0.04, yT + hT / 2 - 0.15, 0.14, 0.3);

  // four consumer phase -> strategy rows
  const rows = [
    { ph: "Planning phase", sit: ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
      st: "Brand position", ini: ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"] },
    { ph: "Awareness phase", sit: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
      st: "Marketing strategy", ini: ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"] },
    { ph: "Purchase phase", sit: ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
      st: "Channel optimization", ini: ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"] },
    { ph: "Aftersales phase", sit: ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
      st: "Loyalty management", ini: ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"] },
  ];
  const yR = yT + hT + 0.08, yEnd = 7.13, gR = 0.05;
  const wts = [0.95, 0.86, 1.08, 0.92], hs = (yEnd - yR - gR * 3) / wts.reduce((a, b) => a + b, 0);
  const head = (t, col) => ({ text: t, options: { bold: true, color: col, breakLine: true } });
  let y = yR;
  rows.forEach((r, i) => {
    const h = wts[i] * hs;
    slide.addShape("rect", { x: c1.x, y, w: c1.w, h, fill: { color: GREY }, line: none });
    text([head(r.ph, C.text), ...bul(r.sit)], c1.x + 0.03, y, c1.w - 0.06, h);
    arrowR(arr.x + 0.04, y + h / 2 - 0.15, 0.14, 0.3);
    slide.addShape("rect", { x: c2.x, y, w: c2.w, h, fill: { color: GREY }, line: none });
    text([head(r.st, RED), ...bul(r.ini)], c2.x + 0.03, y, c2.w - 0.06, h);
    y += h + gR;
  });

  // risks and mitigation: market risks beside their three mitigations, political risks beside the fourth
  const hAll = yEnd - yR, hMk = hAll * 0.54, hPo = hAll - hMk - gR;
  const blocks = [
    { y: yR, h: hMk, head: "Market Risks", risks: ["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"],
      mit: ["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs", "Prioritize channel management for weak channels"] },
    { y: yR + hMk + gR, h: hPo, head: "Political Risks", risks: ["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"],
      mit: ["Re-consider manufacturing strategy in 2 years and consider option of building factory in China"] },
  ];
  blocks.forEach((b) => {
    slide.addShape("rect", { x: c3.x, y: b.y, w: c3.w, h: b.h, fill: { color: GREY }, line: none });
    text([head(b.head, RED), ...bul(b.risks)], c3.x + 0.02, b.y, c3.w - 0.04, b.h);
    slide.addShape("rect", { x: c4.x, y: b.y, w: c4.w, h: b.h, fill: { color: GREY }, line: none });
    text(bul(b.mit), c4.x + 0.02, b.y, c4.w - 0.04, b.h);
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
