// C02 rebuild (run5 r1): Gantt of the three strategies + challenges and mitigations, in the style of Case-2019-Polaris.
// Deck as reference: the deck's style profile (title, rule, source, Arial, red + greys, 14 pt body / 12 pt labels) via the
// harness, and the deck's own panel furniture seen on its other slides: bold black panel headers over a red rule
// (Polaris 11, 12, 13), a dashed grey divider between the halves, grey group bands with white bold text (Polaris 5),
// grey table header boxes (Polaris 11), red numbered circles (Polaris 8), grey filled reading boxes and red-outlined boxes
// with red bold lead words (Polaris 10, 12). Layout HALF2 re-proportioned about 60 / 40 as the prompt asks.
// Assumption (prompt gives no periods for b and c): Enter new platforms prioritised 2019-20, Optimize operations
// implemented 2020-23, Data synchronization prioritised 2020-21, Product mgt. & CRM implemented 2021-23.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, B, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "During strategy implementation, Pandora should take initiative to mitigate challenges",
    source: "Source: Polaris Analysis",
  });
  const C = P.C, F = P.THEME.bodyFontFace;
  const RED = C.accent, BLACK = C.text, PANEL = "F1F1F1", HEADBOX = "D5D5D5", BAND = "7E7E7E", RULE = "D5D5D5", DIV = "A2A2A2";
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.pt || 14, color: o.color || BLACK, bold: !!o.bold,
    italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.04, isTextBox: true, objectName: o.name });
  const line = (x, y, w, h, color, width = 0.75, dash) => slide.addShape("line", { x, y, w, h, line: { color, width, dashType: dash } });

  const top = B.y, bottom = B.y + B.h;          // 1.13 .. 7.11
  const LX = B.x, LR = 7.82, RX = 8.2, RR = B.x + B.w;

  // ---------- panel headers (bold black, centred, red rule under) ----------
  const header = (text, x0, x1) => { T(text, x0, top, x1 - x0, 0.34, { bold: true, align: "center" }); line(x0, top + 0.38, x1 - x0, 0, RED, 1.5); };
  header("Implementation Timeline", LX, LR);
  header("Main Challenges and Potential Mitigations", RX, RR);
  line((LR + RX) / 2, top + 0.05, 0, bottom - top - 0.1, DIV, 0.75, "dash");   // divider between the halves

  // ---------- left: Gantt 2019-2023 ----------
  const years = ["2019", "2020", "2021", "2022", "2023"];
  const c1 = LX, w1 = 1.0, c3 = c1 + w1 + 0.06, w3 = 2.12, gx = c3 + w3 + 0.04, gw = LR - gx, pw = gw / years.length;
  const hy = top + 0.5, hh = 0.34;
  slide.addShape("rect", { x: c1, y: hy, w: gx - c1 - 0.04, h: hh, fill: { color: HEADBOX }, line: { type: "none" } });
  T("Strategy", c1 + 0.06, hy, gx - c1 - 0.1, hh, { pt: 12, bold: true });
  years.forEach((yr, i) => {
    slide.addShape("rect", { x: gx + i * pw + 0.02, y: hy, w: pw - 0.04, h: hh, fill: { color: HEADBOX }, line: { type: "none" } });
    T(yr, gx + i * pw, hy, pw, hh, { pt: 12, bold: true, align: "center", margin: 0 });
  });

  const P_ = "p", I_ = "i";   // bar kinds: prioritised (red) / implementation (grey)
  const groups = [
    { name: "a. Offline Strategy", subs: [
      { name: "Store Expansion", rows: [
        { label: "Open new concept stores", bars: [[P_, 0, 4]] },
        { label: "Open theme stores", bars: [[P_, 1, 4], [I_, 1, 2]] },
        { label: "Open digital stores", bars: [[P_, 2, 2]] } ] },
      { name: "Sales per Store Improvement", rows: [
        { label: "Loyal customer AD", bars: [[P_, 1, 4]] },
        { label: "Charity series", bars: [[P_, 0, 4]] },
        { label: "Personalized offerings", bars: [[I_, 2, 4]] },
        { label: "Design competence", bars: [[I_, 2, 4]] } ] } ] },
    { name: "b. Online Strategy", subs: [{ rows: [
      { label: "Enter new platforms", bars: [[P_, 0, 1]] },
      { label: "Optimize operations", bars: [[I_, 1, 4]] } ] }] },
    { name: "c. Omni-channel Strategy", subs: [{ rows: [
      { label: "Data synchronization", bars: [[P_, 1, 2]] },
      { label: "Product mgt. & CRM", bars: [[I_, 2, 4]] } ] }] },
  ];
  const legendH = 0.34, gy0 = hy + hh + 0.08, gy1 = bottom - legendH - 0.06, gGap = 0.1;
  const nLines = groups.reduce((a, g) => a + g.subs.reduce((b, s) => b + s.rows.length + (s.name ? 1 : 0), 0), 0);
  const rh = (gy1 - gy0 - gGap * (groups.length - 1)) / nLines;
  for (let i = 1; i < years.length; i++) line(gx + i * pw, gy0, 0, gy1 - gy0, RULE, 0.75, "dash");   // year boundaries
  let y = gy0;
  groups.forEach((g, gi) => {
    const gTop = y;
    g.subs.forEach((s) => {
      if (s.name) {        // sub-group heading row, across label and bars
        slide.addShape("rect", { x: c3, y: y + 0.03, w: LR - c3, h: rh - 0.06, fill: { color: PANEL }, line: { type: "none" } });
        T(s.name, c3 + 0.04, y, LR - c3 - 0.08, rh, { pt: 12, bold: true, color: RED });
        y += rh;
      }
      s.rows.forEach((r) => {
        T(r.label, c3 + 0.12, y, w3 - 0.12, rh, { pt: 12 });
        const lanes = r.bars.length, bh = lanes > 1 ? 0.13 : 0.2, gap = 0.03, by0 = y + (rh - (lanes * bh + (lanes - 1) * gap)) / 2;
        r.bars.forEach(([k, a, b], j) => slide.addShape("homePlate", { x: gx + a * pw + 0.05, y: by0 + j * (bh + gap), w: (b - a + 1) * pw - 0.1, h: bh,
          fill: { color: k === P_ ? RED : C.g3 }, line: { type: "none" } }));
        y += rh;
        line(c3, y, LR - c3, 0, RULE, 0.5);
      });
    });
    slide.addShape("rect", { x: c1, y: gTop, w: w1, h: y - gTop, fill: { color: BAND }, line: { type: "none" } });
    T(g.name, c1 + 0.04, gTop, w1 - 0.08, y - gTop, { pt: 12, bold: true, color: "FFFFFF", align: "center" });
    if (gi < groups.length - 1) y += gGap;
  });
  // legend
  const ly = bottom - legendH;
  const legend = [[RED, "Period for prioritized strategy"], [C.g3, "Period for implementation"]];
  let lx = c3;
  legend.forEach(([col, text]) => {
    slide.addShape("homePlate", { x: lx, y: ly + legendH / 2 - 0.09, w: 0.5, h: 0.18, fill: { color: col }, line: { type: "none" } });
    T(text, lx + 0.56, ly, 2.6, legendH, { pt: 12 });
    lx += 0.56 + 2.65;
  });

  // ---------- right: three challenge blocks, each with its mitigation ----------
  const blocks = [
    { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
      mit: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers", hc: 0.86, hm: 0.86 },
    { ch: ["Competition from emerging players in entry luxury jewelry market"],
      mit: "Keep sustainability of a differentiate in product and positioning", hc: 0.62, hm: 0.62 },
    { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
      mit: "Negotiate with platforms and outsource market analytics", hc: 0.8, hm: 0.62 },
  ];
  const by0 = top + 0.5, inner = 0.22;   // a grey down-arrow joins each challenge to its mitigation (Polaris 12, 13)
  const need = blocks.reduce((a, b) => a + b.hc + inner + b.hm, 0), bgap = (bottom - by0 - need) / (blocks.length - 1);
  const d = 0.34, cx = RX + d + 0.12, cw = RR - cx;
  let ry = by0;
  blocks.forEach((b, i) => {
    slide.addShape("ellipse", { x: RX, y: ry + (b.hc - d) / 2, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
    T(String(i + 1), RX, ry + (b.hc - d) / 2, d, d, { pt: 12, bold: true, color: "FFFFFF", align: "center", margin: 0 });
    slide.addShape("rect", { x: cx, y: ry, w: cw, h: b.hc, fill: { color: PANEL }, line: { type: "none" } });
    slide.addText(b.ch.map((t, j) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < b.ch.length - 1 } })),
      { x: cx + 0.08, y: ry, w: cw - 0.14, h: b.hc, fontFace: F, fontSize: 14, color: BLACK, valign: "middle", margin: 0.04, isTextBox: true });
    slide.addShape("flowChartMerge", { x: cx + cw / 2 - 0.3, y: ry + b.hc + 0.05, w: 0.6, h: inner - 0.1, fill: { color: DIV }, line: { type: "none" } });
    const my = ry + b.hc + inner;
    slide.addShape("rect", { x: cx, y: my, w: cw, h: b.hm, fill: { color: "FFFFFF" }, line: { color: RED, width: 1 } });
    slide.addText([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: b.mit, options: { color: BLACK } }],
      { x: cx + 0.08, y: my, w: cw - 0.14, h: b.hm, fontFace: F, fontSize: 14, valign: "middle", margin: 0.04, isTextBox: true });
    ry = my + b.hm + bgap;
    if (i < blocks.length - 1) line(RX, ry - bgap / 2, RR - RX, 0, DIV, 0.75, "dash");   // dashed separator between blocks (Polaris 11, 13)
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
