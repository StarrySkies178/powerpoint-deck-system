// C10 strategy overview (TrueNorth / Pola deck as the style reference, leave-one-out).
// Form: a four-column overview table in the deck's own table look (red header boxes with white text as on the
// deck's Harvey-ball tables, light grey F1F1F1 row bands, the highlighted row outlined in red, not tinted).
// Top row = the summary across all four columns; under it four journey rows pair a consumer phase with a strategy
// (red arrow between them); Risks and Mitigation run as two tall grey panels beside the four rows.
// Text at the deck's table size (profile table.pt, 13 pt), never shrunk: long bullets were cut, not made smaller.
// Deck furniture from its other slides: breadcrumb with red separators, grey footer band under the source line.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, B, P, prof } = L.start({
    ref: "Case-2016-TrueNorth-Pola-China-growth",
    title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
  });
  const C = P.C, FONT = P.THEME.bodyFontFace, W = P.HOUSE.W, H = P.HOUSE.H;
  const RED = C.navy, GREY = C.g1, WHITE = "FFFFFF", BLACK = C.text, BAND = "CDCDCD";
  const PT = (prof.table && prof.table.pt) || 13;      // the deck's table text size
  const LH = 0.218;                                    // one 13 pt line as rendered (Calibri / Carlito)

  // ---- breadcrumb: other sections light grey, current black, red separators (profile crumb)
  const cr = prof.crumb, items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1;
  const runs = [];
  items.forEach((t, i) => {
    if (i) runs.push({ text: " ► ", options: { color: RED } });
    runs.push({ text: t, options: { color: i === cur ? BLACK : cr.colours[0] } });
  });
  slide.addText(runs, { x: cr.x, y: cr.y, w: W - cr.x - 1.2, h: 0.3, fontFace: FONT, fontSize: cr.pt, margin: 0, valign: "top", isTextBox: true });
  // ---- grey footer band behind the source line and page number (every slide of the deck has it)
  slide.addShape("rect", { x: 0, y: 7.2, w: W, h: H - 7.2, fill: { color: BAND }, line: { type: "none" } });
  slide.addText("Source: TrueNorth Analysis", { placeholder: "source" });   // after the band, so it sits on top

  // ---- grid (inches): body 0.25 .. 9.84
  const x0 = B.x, right = B.x + B.w;
  const gap = 0.06, arrowW = 0.17;
  const wSit = 2.95, wStr = 3.27, wRisk = 1.68;
  const xSit = x0, xStr = xSit + wSit + arrowW, xRisk = xStr + wStr + gap, xMit = xRisk + wRisk + gap, wMit = right - xMit;

  const bullets = (list, o = {}) => list.map((t, i) => ({
    text: t, options: { bullet: { indent: 11 }, breakLine: i < list.length - 1 || !!o.more, paraSpaceBefore: o.space || 0 },
  }));
  const text = (r, x, y, w, h, valign = "middle") => slide.addText(r, {
    x, y, w, h, fontFace: FONT, fontSize: PT, color: BLACK, margin: [0.02, 0.06, 0.02, 0.06], valign, isTextBox: true,
  });
  const box = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" },
    line: line ? { color: line, width: 1.75 } : { type: "none" } });
  const arrow = (y, h, fill = RED) => slide.addShape("rightArrow", { x: xSit + wSit + 0.015, y: y + h / 2 - 0.12, w: arrowW - 0.03, h: 0.24, fill: { color: fill }, line: { type: "none" } });

  // ---- header row: red boxes, white text (the deck's table header)
  let y = B.y + 0.02;
  const hH = 0.34;
  [["Current situation", xSit, wSit], ["Key strategies & initiatives", xStr, wStr], ["Risks", xRisk, wRisk], ["Mitigation", xMit, wMit]].forEach(([t, x, w]) => {
    box(x, y, w, hH, RED);
    slide.addText(t, { x, y, w, h: hH, fontFace: FONT, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  y += hH + 0.05;

  // ---- top highlighted row: the summary across all four columns, outlined in red, key words bold
  const sH = 4 * LH + 0.1;
  box(x0, y, right - x0, sH, null, RED);
  // the highlighted row is outlined and bold (deck rule: never a tinted band)
  const bb = (list) => bullets(list).map((r) => ({ ...r, options: { ...r.options, bold: true } }));
  text(bb(["Growing mid & high-end skincare", "Emerging consumer preferences", "POLA Co.'s poor performance in China"]), xSit, y, wSit, sH);
  text(bb(["Improve penetration by repositioning", "Enhance brand recognition, image and memory along whole consumer decision journey"]), xStr, y, wStr, sH);
  text(bb(["Market Risks", "Political Risks"]), xRisk, y, wRisk, sH);
  text(bb(["R&D Process", "Product Intro", "Re-evaluation"]), xMit, y, wMit, sH);
  arrow(y, sH);
  y += sH + 0.06;

  // ---- four journey rows: consumer phase -> strategy (grey bands), Risks and Mitigation beside them
  const yRows = y, bottom = B.y + B.h;
  const rows = [
    ["Planning phase", ["Distinctive consumers", "Sophisticated & diversified needs", "Growing potential-consumer needs"],
      "Brand position", ["Launch POLA & Jurlique for target groups", "Tag brands with fancy & explicit concepts", "Design distinct product roadmaps"]],
    ["Awareness phase", ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
      "Marketing strategy", ["Compose fascinating stories or hot topics", "Run social media-focused marketing", "Invite celebrities as spokespersons"]],
    ["Purchase phase", ["Desire for experience consumption", "Higher expectation of offline stores", "More likely to shop on impulse", "Frequent mobile shopping"],
      "Channel optimization", ["Provide services such as massage", "Build experience shops & digitalize stores", "Stimulate purchase via multiple channels", "Optimize mobile shopping experience"]],
    ["Aftersales phase", ["Low brand loyalty", "Personal & value identification", "Fans culture"],
      "Loyalty management", ["Full lifecycle consumer management", "Implement brand culture proposition", "Build social fans-circle, e.g. WeChat"]],
  ];
  const rGap = 0.04;
  const need = rows.map((r) => (1 + Math.max(r[1].length, r[3].length)) * LH + 0.08);
  const spare = (bottom - yRows - rGap * (rows.length - 1)) - need.reduce((a, c) => a + c, 0);
  rows.forEach(([phase, sit, strat, act], i) => {
    const h = need[i] + spare / rows.length;
    box(xSit, y, wSit, h, GREY);
    box(xStr, y, wStr, h, GREY);
    text([{ text: phase, options: { bold: true, breakLine: true } }, ...bullets(sit)], xSit, y, wSit, h);
    text([{ text: strat, options: { bold: true, color: RED, breakLine: true } }, ...bullets(act)], xStr, y, wStr, h);
    arrow(y, h);
    y += h + rGap;
  });

  // Risks panel: two groups, headings in red
  const pH = bottom - yRows;
  box(xRisk, yRows, wRisk, pH, GREY);
  text([
    { text: "Market Risks", options: { bold: true, color: RED, breakLine: true } },
    ...bullets(["Competitor response to anti-hero products", "Four-channel management takes effort", "R&D process not fully aligned with consumer trends"], { more: true }),
    { text: "Political Risks", options: { bold: true, color: RED, breakLine: true, paraSpaceBefore: 8 } },
    ...bullets(["Import tax increase for premium cosmetics", "Floating exchange rate", "Political outrage in South Asia"]),
  ], xRisk, yRows + 0.03, wRisk, pH - 0.06, "top");

  // Mitigation panel
  box(xMit, yRows, wMit, pH, GREY);
  text(bullets(["Actively collect consumer feedback to facilitate R&D", "Roll out products quickly to meet consumer needs",
    "Prioritize management of weak channels", "Re-consider manufacturing strategy in 2 years; option: a factory in China"], { space: 6 }),
  xMit, yRows + 0.03, wMit, pH - 0.06, "top");

  await L.save(pres, __dirname + "/candidate.pptx");
})();
