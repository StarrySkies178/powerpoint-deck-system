// C02 variant b: Gantt timeline (left, ~60%) | challenges with mitigations (right), Case-2019-Polaris style.
// Style: Style/refs/Case-2019-Polaris.profile.json via the harness (title, red title rule, source line, page position).
// Panel furniture follows the deck's two-panel slides 12, 13 and 17 (bold panel heading over a red rule, grey dashed
// vertical divider, lettered red circles as on slide 12, grey footer rule with the two logos and a divider line).
const path = require("path");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "During strategy implementation, Pandora should take initiative to mitigate challenges",
    source: "Source: Polaris Analysis",
  });
  const C = P.C, F = P.THEME.bodyFontFace;
  const RED = C.navy, BLACK = "000000", G_LINE = "B4B4B4", G_DARK = "5C5C5C", G_PALE = "D5D5D5", G_PANEL = "F1F1F1";
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.pt || 14, color: o.color || BLACK,
    bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0, isTextBox: true,
    paraSpaceAfter: o.after || 0, lineSpacingMultiple: o.lsm });
  const line = (x, y, w, h, color, width, dash) => slide.addShape("line", { x, y, w, h, line: { color, width, dashType: dash } });

  // ---------- frame extras the deck carries on every content slide ----------
  line(0, 7.22, 12.97, 0, G_LINE, 0.75);                                              // footer rule
  slide.addImage({ path: path.join(__dirname, "logo-pandora.jpg"), x: 10.75, y: 7.24, w: 1.07, h: 0.21 });
  line(11.91, 7.26, 0, 0.21, G_LINE, 0.75);                                           // divider between the logos
  slide.addImage({ path: path.join(__dirname, "logo-polaris.png"), x: 11.85, y: 7.12, w: 0.96, h: 0.38 });

  // ---------- panels ----------
  const LX = 0.39, LW = 7.3, DIV = 7.95, RX = 8.2, RW = 12.98 - 8.2, HEAD_Y = 0.98, RULE_Y = 1.68, TOP = 1.8, BOT = 7.05;
  line(DIV, 1.1, 0, 5.95, G_DARK, 0.75, "sysDash");                                    // dashed vertical divider
  T("Implementation Timeline", LX, HEAD_Y, LW, RULE_Y - HEAD_Y - 0.04, { pt: 16, bold: true, align: "center", valign: "bottom" });
  line(LX, RULE_Y, LW, 0, RED, 1.5);
  T("Main Challenges and\nPotential Mitigations", RX, HEAD_Y, RW, RULE_Y - HEAD_Y - 0.04, { pt: 16, bold: true, align: "center", valign: "bottom" });
  line(RX, RULE_Y, RW, 0, RED, 1.5);

  // ---------- left: Gantt 2019-2023 ----------
  const years = ["2019", "2020", "2021", "2022", "2023"], lab = 2.9, gx = LX + lab, cw = (LW - lab) / years.length;
  const hdrY = TOP + 0.02, hdrH = 0.36;
  years.forEach((y, i) => T(y, gx + i * cw, hdrY, cw, hdrH, { pt: 14, bold: true, align: "center" }));
  const legH = 0.45, rowsTop = hdrY + hdrH + 0.12, rowsBot = BOT - legH - 0.12;
  const groups = [
    { letter: "a", name: "Store Expansion", tasks: [
      { label: "Open new concept stores", bars: [[0, 5, "p"]] },
      { label: "Open theme stores", bars: [[1, 3, "i"], [3, 5, "p"]] },
      { label: "Open digital stores", bars: [[2, 3, "p"]] }] },
    { letter: "b", name: "Sales per Store Improvement", tasks: [
      { label: "Loyal customer AD", bars: [[1, 5, "p"]] },
      { label: "Charity series", bars: [[0, 5, "p"]] },
      { label: "Personalized offerings", bars: [[2, 5, "i"]] },
      { label: "Design competence", bars: [[2, 5, "i"]] }] },
  ];
  const nRows = groups.reduce((a, g) => a + 1 + g.tasks.length, 0), gap = 0.14;
  const rh = (rowsBot - rowsTop - gap * (groups.length - 1)) / nRows;
  for (let i = 1; i < years.length; i++) line(gx + i * cw, hdrY, 0, rowsBot - hdrY, G_PALE, 0.75);   // light year gridlines
  let y = rowsTop;
  groups.forEach((g, gi) => {
    if (gi) { line(LX, y - gap / 2, LW, 0, G_DARK, 0.75, "sysDash"); }
    const d = 0.27;
    slide.addShape("ellipse", { x: LX, y: y + (rh - d) / 2, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
    T(g.letter, LX, y + (rh - d) / 2, d, d, { pt: 13, bold: true, color: "FFFFFF", align: "center" });
    T(g.name, LX + d + 0.1, y, lab + cw * 2, rh, { pt: 14, bold: true });
    y += rh;
    g.tasks.forEach((t) => {
      slide.addText([{ text: t.label, options: { bullet: { indent: 12 } } }], { x: LX + 0.12, y, w: lab - 0.14, h: rh, fontFace: F, fontSize: 14, color: BLACK, valign: "middle", margin: 0, isTextBox: true });
      t.bars.forEach(([a, b, k]) => slide.addShape("rect", { x: gx + a * cw + 0.03, y: y + rh * 0.24, w: (b - a) * cw - 0.06, h: rh * 0.52,
        fill: { color: k === "p" ? RED : G_PALE }, line: { type: "none" } }));
      y += rh;
    });
    y += gap;
  });
  // legend: strong swatch, then pale swatch
  const ly = BOT - legH + 0.08, sw = 0.42, sh = 0.2;
  slide.addShape("rect", { x: LX + 0.4, y: ly + (0.3 - sh) / 2, w: sw, h: sh, fill: { color: RED }, line: { type: "none" } });
  T("Period for prioritized strategy", LX + 0.4 + sw + 0.1, ly, 3.0, 0.3, { pt: 12 });
  slide.addShape("rect", { x: LX + 4.0, y: ly + (0.3 - sh) / 2, w: sw, h: sh, fill: { color: G_PALE }, line: { type: "none" } });
  T("Period for implementation", LX + 4.0 + sw + 0.1, ly, 2.7, 0.3, { pt: 12 });

  // ---------- right: three challenge blocks, each with a shaded mitigation box ----------
  const blocks = [
    { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
      mit: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers", mitLines: 3 },
    { ch: ["Competition from emerging players in entry luxury jewelry market"],
      mit: "Keep sustainability of a differentiate in product and positioning", mitLines: 2 },
    { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
      mit: "Negotiate with platforms and outsource market analytics", mitLines: 2 },
  ];
  const chLines = [3, 2, 3], lh = 0.245, pad = 0.12, bgap = 0.16;
  const need = blocks.map((b, i) => chLines[i] * lh + 0.1 + b.mitLines * lh + 0.2);
  const spare = (BOT - TOP - 0.02 - need.reduce((a, c) => a + c, 0) - bgap * 2 * (blocks.length - 1)) / blocks.length;
  let by = TOP + 0.04;
  blocks.forEach((b, i) => {
    const chH = chLines[i] * lh + spare * 0.5, mbH = b.mitLines * lh + 0.2 + spare * 0.5;
    slide.addText(b.ch.map((c) => ({ text: c, options: { bullet: { indent: 12 }, breakLine: true } })),
      { x: RX + 0.05, y: by, w: RW - 0.1, h: chH, fontFace: F, fontSize: 14, color: BLACK, valign: "middle", margin: 0, isTextBox: true, paraSpaceAfter: 2 });
    by += chH + 0.06;
    slide.addShape("rect", { x: RX, y: by, w: RW, h: mbH, fill: { color: G_PANEL }, line: { type: "none" } });
    slide.addText([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: b.mit }],
      { x: RX + pad, y: by, w: RW - 2 * pad, h: mbH, fontFace: F, fontSize: 14, color: BLACK, valign: "middle", margin: 0, isTextBox: true });
    by += mbH;
    if (i < blocks.length - 1) { by += bgap; line(RX, by, RW, 0, G_LINE, 0.75); by += bgap; }
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
