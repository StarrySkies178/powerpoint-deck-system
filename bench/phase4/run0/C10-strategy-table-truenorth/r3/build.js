// C10 rebuild 3: strategy overview table in the style of the TrueNorth Pola deck (deck as reference, leave-one-out).
// Style: the deck's measured profile (Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json) through the harness.
// Forms taken from the deck's other slides: red header cells with white bold text (slides 12, 15), grey banded cells
// F1F1F1 (slide 15), bold red sub-heads over bullets (slide 17 Gantt labels), pink "in China" tint EBC6C5 as the
// highlight (slide 15 value chain), breadcrumb grey / black current / red arrows, logo top right, grey footer bar.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";

(async () => {
  const { pres, slide, P, HOUSE, prof } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
  const C = P.C, FONT = P.THEME.bodyFontFace;
  const RED = prof.roles.main, PANEL = prof.roles.panel, PINK = prof.roles.grey4, BLACK = prof.roles.text;

  // ---- deck furniture: breadcrumb (grey / black current / red arrow), logo, grey footer bar ----
  const cr = prof.crumb, items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1;
  const runs = [];
  items.forEach((t, i) => {
    if (i) runs.push({ text: " ► ", options: { color: RED } });
    runs.push({ text: t, options: { color: i === cur ? BLACK : "CCCCCC" } });
  });
  slide.addText(runs, { x: cr.x, y: cr.y, w: 7.6, h: 0.3, fontFace: FONT, fontSize: cr.pt, margin: 0, valign: "top", isTextBox: true });
  slide.addImage({ path: path.join(__dirname, "truenorth-logo.jpg"), x: 8.542, y: 0.0, w: 1.421, h: 0.408 });
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });
  slide.addText("Source: TrueNorth Analysis", { placeholder: "source" });   // after the bar, so it sits on top of it

  // ---- grid ----
  const X0 = 0.25, X1 = 9.84, GAP = 0.06, ARW = 0.2;
  const w1 = 2.75, w2 = 3.4, w3 = 1.62, w4 = X1 - X0 - w1 - ARW - w2 - 2 * GAP - w3;
  const x1 = X0, x2 = x1 + w1 + ARW, x3 = x2 + w2 + GAP, x4 = x3 + w3 + GAP;
  const BT = 11, HD = 12;   // bullet and sub-head sizes (pt)

  // cell text: optional bold red head, then bullets
  const cell = (x, y, w, h, head, bullets, o = {}) => {
    const t = [];
    if (head) t.push({ text: head, options: { bold: true, color: o.headColor || RED, fontSize: HD, breakLine: true, paraSpaceAfter: 1 } });
    bullets.forEach((b, i) => t.push({ text: b, options: { bullet: { indent: 9 }, fontSize: BT, color: BLACK, breakLine: i < bullets.length - 1, paraSpaceAfter: o.space || 0 } }));
    if (o.fill) slide.addShape("rect", { x, y, w, h, fill: { color: o.fill }, line: { type: "none" } });
    slide.addText(t, { x, y, w, h, fontFace: FONT, valign: o.valign || "top", margin: [3, 5, 3, 5], isTextBox: true, lineSpacingMultiple: 0.95 });
  };

  // right-pointing red triangle centred in the arrow gap (a triangle turned 90 degrees)
  const tri = (cy, len) => { const tw = ARW - 0.07, cx = x1 + w1 + ARW / 2;
    slide.addShape("triangle", { x: cx - len / 2, y: cy - tw / 2, w: len, h: tw, rotate: 90, fill: { color: RED }, line: { type: "none" } }); };

  // ---- header row: red cells, white bold ----
  const hy = 1.5, hh = 0.36;
  [["Current situation", x1, w1], ["Key strategies & initiatives", x2, w2], ["Risks", x3, w3], ["Mitigation", x4, w4]].forEach(([t, x, w]) => {
    slide.addShape("rect", { x, y: hy, w, h: hh, fill: { color: RED }, line: { type: "none" } });
    slide.addText(t, { x, y: hy, w, h: hh, fontFace: FONT, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  // arrow between the first two headers
  tri(hy + hh / 2, hh - 0.12);

  // ---- top highlighted row (pink tint, red outline): the overall answer ----
  const ty = hy + hh + 0.06, th = 0.98;
  slide.addShape("rect", { x: X0, y: ty, w: X1 - X0, h: th, fill: { color: PINK }, line: { type: "none" } });
  cell(x1, ty, w1, th, null, ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"], { valign: "middle" });
  cell(x2, ty, w2, th, null, ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"], { valign: "middle", space: 3 });
  cell(x3, ty, w3, th, null, ["Market Risks", "Political Risks"], { valign: "middle", space: 3 });
  cell(x4, ty, w4, th, null, ["R&D Process", "Product Intro", "Re-evaluation"], { valign: "middle" });
  // white separators between the columns of the pink row
  [x2 - ARW / 2, x3 - GAP / 2, x4 - GAP / 2].forEach((x) => slide.addShape("line", { x, y: ty + 0.08, w: 0, h: th - 0.16, line: { color: "FFFFFF", width: 1.5 } }));

  // ---- four phase -> strategy rows ----
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
  const ry0 = ty + th + 0.08, ryEnd = 7.15, rg = 0.06;
  const weight = [3.3, 3.2, 4.2, 3.3], tot = weight.reduce((a, b) => a + b, 0);
  const avail = ryEnd - ry0 - rg * (rows.length - 1);
  let y = ry0;
  rows.forEach(([ph, pb, st, sb], i) => {
    const h = avail * weight[i] / tot;
    cell(x1, y, w1, h, ph, pb, { fill: PANEL, valign: "middle" });
    cell(x2, y, w2, h, st, sb, { fill: PANEL, valign: "middle" });
    // red arrow: phase need -> strategy answer
    tri(y + h / 2, 0.3);
    y += h + rg;
  });

  // ---- risks column: two grey blocks spanning the rows ----
  const mH = (ryEnd - ry0) * 0.56;
  cell(x3, ry0, w3, mH, "Market Risks", ["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"], { fill: PANEL, space: 4 });
  cell(x3, ry0 + mH + rg, w3, ryEnd - ry0 - mH - rg, "Political Risks", ["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"], { fill: PANEL, space: 4 });

  // ---- mitigation column: one grey block spanning the rows ----
  cell(x4, ry0, w4, ryEnd - ry0, null, ["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
    "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"], { fill: PANEL, space: 16, valign: "top" });

  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
