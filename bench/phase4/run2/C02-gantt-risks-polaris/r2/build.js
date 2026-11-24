// C02 rebuild 2: Gantt + challenges/mitigations in the style of Case-2019-Polaris (deck as reference, leave-one-out).
// Approach: the deck's style profile (title, rule, source, page, colours, type sizes) through the harness; the body is drawn
// with the deck's own furniture as seen on its other slides: bold 16 pt panel heads over a red rule and a dashed grey
// divider (Polaris 11-13), red letter / number chips (Polaris 12), dark-grey header cells with white text (Polaris 13),
// vertical dark-grey row labels (Polaris 11), grey filled text boxes and red-outlined boxes (Polaris 12), grey down chevron.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const RED = "CC0000", DG = "5C5C5C", MG = "A2A2A2", ARROW = "7E7E7E", LG = "F1F1F1", BAND = "D5D5D5", RULE = "B4B4B4", BLACK = "000000", WHITE = "FFFFFF";
const FONT = "Arial";

(async () => {
  const { pres, slide } = L.start({
    ref: "Case-2019-Polaris",
    title: "During strategy implementation, Pandora should take initiative to mitigate challenges",
    source: "Source: Polaris Analysis",
  });

  const T = (text, x, y, w, h, o = {}) => slide.addText(text, {
    x, y, w, h, fontFace: FONT, fontSize: o.pt || 14, color: o.color || BLACK, bold: !!o.bold, italic: !!o.italic,
    align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.03, isTextBox: true, rotate: o.rotate,
    fill: o.fill ? { color: o.fill } : undefined, paraSpaceAfter: o.psa || 0, lineSpacingMultiple: o.lsm,
  });
  const rect = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" }, line: line || { type: "none" } });
  const hline = (x, y, w, color, width, dash) => slide.addShape("line", { x, y, w, h: 0, line: { color, width, dashType: dash } });
  const vline = (x, y, h, color, width, dash) => slide.addShape("line", { x, y, w: 0, h, line: { color, width, dashType: dash } });
  const chip = (s, x, y, d = 0.28) => {
    slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
    T(s, x, y, d, d, { pt: 14, bold: true, color: WHITE, align: "center", margin: 0 });
  };
  const downChevron = (cx, y) => slide.addShape("chevron", { x: cx - 0.19, y: y - 0.19, w: 0.22, h: 0.38, rotate: 90, fill: { color: ARROW }, line: { type: "none" } });

  // ---------- panel frame: two heads over red rules, dashed divider ----------
  const LX = 0.19, LW = 7.56, RX = 8.17, RW = 12.98 - 8.17, DIV = 7.96;
  const headY = 1.1, ruleY = 1.47;
  T("Implementation Timeline", LX, headY, LW, 0.32, { pt: 16, bold: true, align: "center" });
  T("Main Challenges and Potential Mitigations", RX - 0.1, headY, RW + 0.1, 0.32, { pt: 16, bold: true, align: "center" });
  hline(LX, ruleY, LW, RED, 1.5);
  hline(RX, ruleY, RW, RED, 1.5);
  vline(DIV, 1.16, 5.84, DG, 0.75, "sysDot");

  // ---------- left: Gantt 2019-2023 ----------
  const years = ["2019", "2020", "2021", "2022", "2023"];
  const subX = 0.2, subW = 0.58, labX = 0.82, labW = 2.3, gx = 3.2, gw = LX + LW - gx, cw = gw / years.length;
  const yh = 1.62, hh = 0.38;
  years.forEach((y, j) => T(y, gx + j * cw + 0.02, yh, cw - 0.04, hh, { pt: 14, color: WHITE, fill: DG, align: "center", margin: 0 }));

  // row model: group heads (chip + bold name) and task rows; bars as [start, end, kind] with year indexes
  const P = "p", I = "i";
  const rows = [
    { group: "a", name: "Offline Strategy" },
    { sub: "Store Expansion", label: "Open new concept stores", bars: [[0, 4, P]] },
    { sub: "Store Expansion", label: "Open theme stores", bars: [[1, 2, I], [1, 4, P]] },
    { sub: "Store Expansion", label: "Open digital stores", bars: [[2, 2, P]] },
    { sub: "Sales per Store Improvement", label: "Loyal customer AD", bars: [[1, 4, P]] },
    { sub: "Sales per Store Improvement", label: "Charity series", bars: [[0, 4, P]] },
    { sub: "Sales per Store Improvement", label: "Personalized offerings", bars: [[2, 4, I]] },
    { sub: "Sales per Store Improvement", label: "Design competence", bars: [[2, 4, I]] },
    { group: "b", name: "Online Strategy" },
    { label: "Enter new platforms", bars: [[0, 1, P]] },          // timing not in the brief: assumption
    { label: "Optimize operations", bars: [[1, 4, I]] },          // timing not in the brief: assumption
    { group: "c", name: "Omni-channel Strategy" },
    { label: "Data synchronization", bars: [[1, 3, I]] },         // timing not in the brief: assumption
    { label: "Product mgt. & CRM", bars: [[2, 4, I]] },           // timing not in the brief: assumption
  ];
  const top = yh + hh + 0.08, legendY = 6.74, rh = (legendY - 0.08 - top) / rows.length;
  // year column guides
  for (let j = 1; j < years.length; j++) vline(gx + j * cw, top, rows.length * rh, RULE, 0.75, "dash");
  let k = 0;
  rows.forEach((r, i) => {
    const y = top + i * rh;
    if (r.group) {
      hline(LX, y + rh - 0.01, LW, DG, 0.75);
      chip(r.group, LX + 0.05, y + (rh - 0.28) / 2);
      T(r.name, LX + 0.42, y, 2.8, rh, { pt: 14, bold: true });
      k = 0; return;
    }
    if (k % 2 === 1) rect(r.sub ? labX : (labX), y, LX + LW - labX, rh, LG);
    k++;
    T(r.label, labX + 0.04, y, labW, rh, { pt: 12 });
    const both = r.bars.length > 1, bh = both ? rh * 0.26 : rh * 0.42;
    r.bars.forEach(([s, e, kind], n) => {
      const by = both ? y + rh * 0.18 + n * (bh + rh * 0.12) : y + (rh - bh) / 2;
      rect(gx + s * cw + 0.06, by, (e - s + 1) * cw - 0.12, bh, kind === P ? RED : MG);
    });
  });
  // vertical sub-group labels (dark grey, white bold, turned), spanning their rows
  const subs = {};
  rows.forEach((r, i) => { if (r.sub) (subs[r.sub] = subs[r.sub] || []).push(i); });
  Object.entries(subs).forEach(([name, idx]) => {
    const y0 = top + idx[0] * rh + 0.015, h = idx.length * rh - 0.03;
    rect(subX, y0, subW, h, DG);
    // a turned text box: give it the long side as width, then rotate 270 around its centre
    const txt = name === "Store Expansion" ? "Store\nExpansion" : "Sales per\nStore\nImprovement";
    T(txt, subX + subW / 2 - h / 2, y0 + h / 2 - subW / 2, h, subW, { pt: 12, bold: true, color: WHITE, align: "center", rotate: 270, margin: 0, lsm: 0.9 });
  });
  // legend
  rect(gx - 1.5, legendY + 0.1, 0.4, 0.14, RED);
  T("Period for prioritized strategy", gx - 1.05, legendY, 2.7, 0.34, { pt: 12 });
  rect(gx + 1.75, legendY + 0.1, 0.4, 0.14, MG);
  T("Period for implementation", gx + 2.2, legendY, 2.4, 0.34, { pt: 12 });

  // ---------- right: three numbered challenges, each with its mitigation ----------
  const bx = RX + 0.4, bw = 12.98 - bx;
  const blocks = [
    { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"], chH: 0.86,
      mit: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers", mitH: 0.84 },
    { ch: ["Competition from emerging players in entry luxury jewelry market"], chH: 0.58,
      mit: "Keep sustainability of a differentiate in product and positioning", mitH: 0.6 },
    { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"], chH: 0.84,
      mit: "Negotiate with platforms and outsource market analytics", mitH: 0.6 },
  ];
  const gapA = 0.2, gapB = 0.2;
  let y = 1.64;
  blocks.forEach((b, i) => {
    chip(String(i + 1), RX, y + 0.04);
    rect(bx, y, bw, b.chH, LG);
    slide.addText(b.ch.map((t) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: true } })), {
      x: bx + 0.04, y, w: bw - 0.08, h: b.chH, fontFace: FONT, fontSize: 14, color: BLACK, valign: "middle", margin: 0.04, isTextBox: true });
    downChevron(bx + bw / 2, y + b.chH + gapA / 2 + 0.01);
    const my = y + b.chH + gapA;
    rect(bx, my, bw, b.mitH, WHITE, { color: RED, width: 1.5 });
    slide.addText([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: b.mit }], {
      x: bx + 0.06, y: my, w: bw - 0.12, h: b.mitH, fontFace: FONT, fontSize: 14, color: BLACK, valign: "middle", margin: 0.04, isTextBox: true });
    y = my + b.mitH + gapB;
    if (i < blocks.length - 1) hline(RX, y - gapB / 2, RW, RULE, 0.75, "sysDot");
  });

  // footer rule as on every content slide of the deck
  hline(0, 7.22, 12.97, RULE, 0.75);

  await L.save(pres, __dirname + "/candidate.pptx");
})();
