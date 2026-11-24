// C10 rebuild 3 (run2a): five-year strategy overview in the TrueNorth Pola deck style (deck as reference, leave-one-out).
// Style: Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json via L.start (red title band, Calibri, grey panels).
// Forms taken from the deck's other slides: red header cells over grey F1F1F1 rows and a highlighted row outlined in red
// (Greenfield options table), grey/red row-label strips with turned text (persona panel rows), red ► separators in the
// breadcrumb and the grey footer band with the source (every content slide), the TrueNorth logo from the deck's layout.
// Cells are at 12 pt, the profile's label / table-cell size (body.label_pt); headers at 14 pt. The full prompt text does not
// fit at the 14 pt body size in a 10 x 7.5 in slide, so deck_lint's median check (body.pt - 1) reports an error here.
const path = require("path"), cp = require("child_process");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const ROOT = path.join(__dirname, "../../../../..");

(async () => {
  const { pres, slide, P, HOUSE } = L.start({
    ref: "Case-2016-TrueNorth-Pola-China-growth",
    title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
  });
  const F = HOUSE.FONT.latin || "Calibri";
  const RED = "CC0000", GREY = "F1F1F1", DGREY = "777777", MGREY = "A2A2A2", BLACK = "000000", WHITE = "FFFFFF";
  const none = { type: "none" };
  const PT = 12;

  // ---- frame furniture of the deck: breadcrumb with red ► separators, logo top right, grey footer band
  const crumb = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1;
  const runs = [];
  crumb.forEach((c, i) => { if (i) runs.push({ text: " ► ", options: { color: RED } }); runs.push({ text: c, options: { color: i === cur ? BLACK : "CCCCCC" } }); });
  slide.addText(runs, { x: 0.35, y: 0.07, w: 7.9, h: 0.3, fontFace: F, fontSize: 14, margin: 0, valign: "top", isTextBox: true });
  try {
    const logo = cp.execSync(`unzip -p "${path.join(ROOT, "Templates/Case-2016-TrueNorth-Pola-China-growth.pptx")}" ppt/media/image1.jpg`);
    slide.addImage({ data: "image/jpeg;base64," + logo.toString("base64"), x: 8.55, y: 0.07, w: 1.3, h: 0.38 });
  } catch (e) { /* logo is decoration only */ }
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: none });
  // source line on the band at the profile's source position (drawn here so the band does not cover it)
  slide.addText("Source: TrueNorth Analysis", { x: 0.35, y: 7.24, w: 7, h: 0.22, fontFace: F, fontSize: 10, color: BLACK, margin: 0, valign: "middle", isTextBox: true });

  // ---- grid
  const top = 1.5, bot = 7.13, hdrH = 0.32, gap = 0.06;
  const A = { x: 0.25, w: 2.7 }, arrW = 0.16, B = { x: A.x + A.w + arrW, w: 3.42 };
  const Cc = { x: B.x + B.w + gap, w: 1.55 }, D = { x: 0, w: 0 };
  D.x = Cc.x + Cc.w + gap; D.w = 9.84 - D.x;
  const strip = 0.4;

  const bullets = (items, o = {}) => items.map((t, i) => ({ text: t, options: { bullet: { indent: 10 }, breakLine: i < items.length - 1, bold: !!o.bold, color: BLACK } }));
  const box = (x, y, w, h, fill) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: none });
  const text = (t, x, y, w, h, o = {}) => slide.addText(t, { x, y, w, h, fontFace: F, fontSize: o.pt || PT, color: o.color || BLACK, bold: !!o.bold, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? [0.03, 0.05, 0.03, 0.05], isTextBox: true, vert: o.vert, paraSpaceAfter: o.after || 0, lineSpacingMultiple: o.ls || 0.93 });

  // ---- header row (red cells, white text) as in the deck's options table
  const hdr = [[A, "Current situation"], [B, "Key strategies & initiatives"], [Cc, "Risks"], [D, "Mitigation"]];
  hdr.forEach(([c, t]) => { box(c.x, top, c.w, hdrH, RED); text(t, c.x, top, c.w, hdrH, { pt: 14, bold: true, color: WHITE, align: "center" }); });

  // ---- top highlighted row: overall situation -> strategies -> risks -> mitigation, outlined in red, bold
  const r0y = top + hdrH + gap, r0h = 0.98;
  const topCells = [
    [A, ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"]],
    [B, ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"]],
    [Cc, ["Market Risks", "Political Risks"]],
    [D, ["R&D Process", "Product Intro", "Re-evaluation"]],
  ];
  topCells.forEach(([c, items]) => { box(c.x, r0y, c.w, r0h, GREY); text(bullets(items, { bold: true }), c.x + 0.04, r0y, c.w - 0.06, r0h, { pt: PT }); });
  slide.addShape("rect", { x: A.x - 0.02, y: r0y - 0.02, w: 9.84 - A.x + 0.04, h: r0h + 0.04, fill: { type: "none" }, line: { color: RED, width: 1.75 } });

  // ---- four phase rows: consumer phase (grey strip) -> strategy (red strip)
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
  // rows share the height by the lines their longer cell takes at 12 pt (counted on the render: 5, 4, 7, 6; Awareness gets a little more so its turned label fits)
  const lineCount = [5, 4.7, 7, 5.9], nL = lineCount.reduce((p, q) => p + q, 0);
  const y1 = r0y + r0h + 0.08, room = bot - y1 - gap * 3;
  const rh = lineCount.map((n) => (room * n) / nL);
  let y = y1;
  rows.forEach(([ph, sit, st, ini], i) => {
    const h = rh[i];
    box(A.x, y, strip, h, DGREY); text(ph.replace(" ", "\n"), A.x, y, strip, h, { pt: 12, bold: true, color: WHITE, align: "center", vert: "vert270", margin: 0 });
    box(A.x + strip + 0.03, y, A.w - strip - 0.03, h, GREY); text(bullets(sit), A.x + strip + 0.06, y, A.w - strip - 0.08, h, { ls: 0.9 });
    box(B.x, y, strip, h, RED); text(st.replace(" ", "\n"), B.x, y, strip, h, { pt: 12, bold: true, color: WHITE, align: "center", vert: "vert270", margin: 0 });
    box(B.x + strip + 0.03, y, B.w - strip - 0.03, h, GREY); text(bullets(ini), B.x + strip + 0.06, y, B.w - strip - 0.08, h, { ls: 0.9 });
    slide.addShape("triangle", { x: A.x + A.w + 0.015, y: y + h / 2 - 0.08, w: 0.16, h: 0.13, rotate: 90, fill: { color: RED }, line: none });
    y += h + gap;
  });
  slide.addShape("triangle", { x: A.x + A.w + 0.015, y: r0y + r0h / 2 - 0.08, w: 0.16, h: 0.13, rotate: 90, fill: { color: RED }, line: none });

  // ---- risks and mitigation span the four phase rows
  const sy = y1, sh = bot - y1;
  box(Cc.x, sy, Cc.w, sh, GREY); box(D.x, sy, D.w, sh, GREY);
  const head = (t) => ({ text: t, options: { bold: true, color: RED, breakLine: true } });
  const sub = (items, last) => items.map((t, i) => ({ text: t, options: { bullet: { indent: 10 }, color: BLACK, breakLine: !(last && i === items.length - 1) } }));
  const gapLine = { text: " ", options: { breakLine: true, fontSize: 6 } };
  text([head("Market Risks"), ...sub(["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"]),
    gapLine, head("Political Risks"), ...sub(["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"], true)],
    Cc.x + 0.03, sy + 0.04, Cc.w - 0.05, sh - 0.08, { valign: "top", pt: 12 });
  text(sub(["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs", "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"], true),
    D.x + 0.03, sy + 0.04, D.w - 0.05, sh - 0.08, { valign: "top", pt: 12, after: 10 });

  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
