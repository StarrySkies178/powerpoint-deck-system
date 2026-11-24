// C05 rebuild: Implementation Timeline in the E-Cluster deck style (deck as reference, leave-one-out).
// Style: Case-2019-E-Cluster profile (navy title band, bold grey/navy breadcrumb, Arial, 15 pt body).
// Gantt drawn in the deck's table look (E-Cluster 23: dark navy header row, light-blue / grey bands per group,
// merged group cell on the left, white rules); risks under it as a panel head with rule + round bullets (E-Cluster 16).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Implementation Timeline",
    crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
  });
  const C = P.C, F = "Arial";
  const HEAD = C.g5;            // 253449, table header fill in the deck
  const BLUE = "DFECF5", GREY = "F1F1F1";
  const BAR = C.cyan, BAR2 = "63A4CC";   // 354B70 first step, 63A4CC follow-on step (deck light blue)
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 14, bold: !!o.bold, italic: !!o.italic,
    color: o.color || "000000", align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? [0, 4, 0, 4], isTextBox: true });

  // ---------- Gantt ----------
  const x0 = 0.27, xR = 13.07, gW = 2.15, iW = 4.15, xY = x0 + gW + iW, nY = 6, yW = (xR - xY) / nY;
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const hY = 1.52, hH = 0.46;
  slide.addShape("rect", { x: x0, y: hY, w: xR - x0, h: hH, fill: { color: HEAD }, line: { type: "none" } });
  T("Initiatives", x0, hY, gW + iW, hH, { size: 15, bold: true, color: "FFFFFF", align: "center" });
  years.forEach((yr, j) => T(yr, xY + j * yW, hY, yW, hH, { size: 15, bold: true, color: "FFFFFF", align: "center" }));

  // rows: [group, label, from, to (inclusive year index), height]
  const r1 = 0.46, r2 = 0.56;
  const blocks = [
    { fill: BLUE, rows: [{ label: "New Product R&D", from: 0, to: 0, h: r1 }] },
    { fill: GREY, rows: [{ label: "Marketing & Reshaping Brand", from: 0, to: 2, h: r1 }] },
    { fill: BLUE, group: "Offline: City Penetration Steps", rows: [
      { label: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 2, h: r2 },
      { label: "Further expand into the tertiary cities with ~50 more stores", from: 2, to: 5, h: r2, next: true }] },
    { fill: GREY, group: "Omni Channel Building", rows: [
      { label: "Adjust the product offering and enter key e-commerce platforms", from: 0, to: 1, h: r2 },
      { label: "Further integrate online and offline channels", from: 2, to: 5, h: r2, next: true }] },
  ];
  const top = hY + hH + 0.04, white = { color: "FFFFFF", width: 1.5 };
  const bot = top + blocks.reduce((a, b) => a + b.rows.reduce((c, r) => c + r.h, 0), 0);
  // pass 1: group bands, then the year column rules (white, as the deck's table rules)
  let y = top;
  blocks.forEach((b) => { b.y = y; b.h = b.rows.reduce((a, r) => a + r.h, 0);
    slide.addShape("rect", { x: x0, y, w: xR - x0, h: b.h, fill: { color: b.fill }, line: { type: "none" } }); y += b.h; });
  for (let j = 0; j < nY; j++) slide.addShape("line", { x: xY + j * yW, y: top, w: 0, h: bot - top, line: white });
  // pass 2: labels, row rules, bars
  blocks.forEach((b) => {
    if (b.group) {
      T(b.group, x0, b.y, gW, b.h, { size: 14, bold: true, color: C.navy, align: "center", margin: [6, 6, 0, 0] });
      slide.addShape("line", { x: x0 + gW, y: b.y, w: 0, h: b.h, line: white });
    }
    let ry = b.y;
    b.rows.forEach((r, k) => {
      const lx = b.group ? x0 + gW : x0, lw = b.group ? iW : gW + iW;
      T(r.label, lx, ry, lw, r.h, { size: 14, bold: !b.group, color: b.group ? "000000" : C.navy, margin: [8, 6, 0, 0] });
      if (k < b.rows.length - 1) slide.addShape("line", { x: x0 + gW, y: ry + r.h, w: xR - x0 - gW, h: 0, line: { color: "FFFFFF", width: 1, dashType: "dash" } });
      const bx = xY + r.from * yW + 0.1, bw = (r.to - r.from + 1) * yW - 0.2, bH = 0.26;
      slide.addShape("homePlate", { x: bx, y: ry + r.h / 2 - bH / 2, w: bw, h: bH, fill: { color: r.next ? BAR2 : BAR }, line: { type: "none" } });
      ry += r.h;
    });
    if (b !== blocks[blocks.length - 1]) slide.addShape("line", { x: x0, y: b.y + b.h, w: xR - x0, h: 0, line: white });
  });
  y = bot;

  // ---------- Potential risks ----------
  const ry0 = y + 0.18;
  T("Potential Risks", x0, ry0, 6, 0.36, { size: 17, bold: true, color: "10366C", valign: "bottom", margin: [2, 0, 0, 0] });
  slide.addShape("line", { x: x0, y: ry0 + 0.4, w: xR - x0, h: 0, line: { color: "10366C", width: 1.5 } });
  const risks = [
    "Economy downturn",
    "Suffer from slow ramp up problem when entering the new market",
    "Potential brand image cannibalization, fail to launch new products in the market as expected",
    "Market dynamics: customer behavior change, competitors’ response, etc.",
  ];
  slide.addText(risks.map((t) => ({ text: t, options: { bullet: { code: "25CF", indent: 20 }, breakLine: true } })), {
    x: x0 + 0.1, y: ry0 + 0.48, w: xR - x0 - 0.1, h: 7.18 - (ry0 + 0.48), fontFace: F, fontSize: 15, color: "000000",
    valign: "top", margin: 0, isTextBox: true, paraSpaceBefore: 3, lineSpacingMultiple: 1.15 });

  // footer rule of the deck master (full width, 7.25 in)
  slide.addShape("line", { x: 0, y: 7.252, w: 13.333, h: 0, line: { color: "202C4F", width: 0.75 } });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
