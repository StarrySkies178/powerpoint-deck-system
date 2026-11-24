// C05 rebuild (run5 r2): Implementation Timeline in the E-Cluster deck's style (deck as reference, leave-one-out).
// Form: Gantt table (years across, workstreams down, grouped rows) over a risk list, i.e. BAND2 "timeline over risk table"
// (Style/refs/case-competitions-2019-2020.md §4b). Look from Style/refs/Case-2019-E-Cluster.profile.json: navy title band,
// breadcrumb, table header band in the main colour with white bold text, row blocks banded light blue / light grey
// separated by white rules (as the deck's appendix tables, slides 22-24), section heading with rule and round bullets
// (as the "Key Assumptions" blocks of slide 16).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, S, prof } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Implementation Timeline",
    crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
  });
  const R = prof.roles, font = "Arial";
  const MAIN = R.main, SEC = R.secondary, BLUE = prof.table.body_fill, GREY = R.panel, HEAD = prof.panel.colour;
  const LBL = prof.body.label_pt, BODYPT = prof.body.pt;
  const left = prof.margins.left, right = prof.page.right + 0.05;      // 0.27 .. 13.07
  const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: font, fontSize: o.size || LBL, color: o.color || R.text,
    bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.04, isTextBox: true });

  // ---------- Gantt table ----------
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const gx = 4.6, gw = right - gx, pw = gw / years.length;            // year columns start where the deck's heading rule starts
  const top = 1.43, hh = 0.36;
  slide.addShape("rect", { x: gx, y: top, w: gw + 0.04, h: hh, fill: { color: MAIN }, line: { type: "none" } });
  years.forEach((y, i) => t(y, gx + i * pw, top, pw, hh, { bold: true, color: "FFFFFF", align: "center", size: BODYPT }));

  // blocks: one band colour per block, white rules between blocks (deck's appendix tables)
  const blocks = [
    { fill: BLUE, rows: [{ label: "New Product R&D", from: 0, to: 1, kind: "row" }] },
    { fill: GREY, rows: [{ label: "Marketing & Reshaping Brand", from: 0, to: 3, kind: "row" }] },
    { fill: BLUE, rows: [{ label: "Offline: City Penetration Steps", kind: "group" },
      { label: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 3, kind: "sub" },
      { label: "Further expand into the tertiary cities with ~50 more stores", from: 2, to: 6, kind: "sub" }] },
    { fill: GREY, rows: [{ label: "Omni Channel Building", kind: "group" },
      { label: "Adjust the product offering and enter key e-commerce platforms", from: 0, to: 2, kind: "sub" },
      { label: "Further integrate online and offline channels", from: 2, to: 6, kind: "sub" }] },
  ];
  const RH = { row: 0.4, group: 0.32, sub: 0.5 }, PAD = 0.03, GAP = 0.03;
  // pass 1: row blocks (band + white rule between blocks), year separators; pass 2: labels and bars on top
  let y = top + hh + GAP;
  const placed = [];
  blocks.forEach((b) => {
    const bh = b.rows.reduce((a, r) => a + RH[r.kind], 0) + 2 * PAD;
    slide.addShape("rect", { x: left, y, w: right - left, h: bh, fill: { color: b.fill }, line: { type: "none" } });
    let ry = y + PAD;
    b.rows.forEach((r) => { placed.push({ ...r, y: ry, h: RH[r.kind] }); ry += RH[r.kind]; });
    y += bh + GAP;
  });
  const gEnd = y - GAP;
  for (let i = 0; i < years.length; i++)                               // year separators across the bands (white, as the table rules)
    slide.addShape("line", { x: gx + i * pw, y: top + hh, w: 0, h: gEnd - top - hh, line: { color: "FFFFFF", width: 1.5 } });
  placed.forEach((r) => {
    if (r.kind !== "sub") t(r.label, left + 0.08, r.y, gx - left - 0.16, r.h, { bold: true, color: HEAD });
    else slide.addText(r.label, { x: left + 0.25, y: r.y, w: gx - left - 0.3, h: r.h, fontFace: font, fontSize: LBL, color: R.text, valign: "middle",
      margin: 0.02, isTextBox: true, bullet: { code: "2022", indent: 15 } });
    if (r.to > r.from) slide.addShape("homePlate", { x: gx + r.from * pw + 0.08, y: r.y + r.h / 2 - 0.13, w: (r.to - r.from) * pw - 0.16, h: 0.26,
      fill: { color: r.kind === "sub" ? SEC : MAIN }, line: { type: "none" } });
  });

  // ---------- Potential Risks ----------
  const ry0 = gEnd + 0.1, rhd = 0.4;
  P.icon(slide, "alert-triangle", left, ry0 + 0.05, 0.32, { color: HEAD });
  t("Potential Risks", left + 0.4, ry0, 5, rhd, { bold: true, color: HEAD, size: prof.panel.pt, margin: 0 });
  slide.addShape("line", { x: left, y: ry0 + rhd + 0.02, w: right - left, h: 0, line: { color: HEAD, width: 1.5 } });
  const risks = [
    "Economy downturn",
    "Suffer from slow ramp up problem when entering the new market",
    "Potential brand image cannibalization, fail to launch new products in the market as expected",
    "Market dynamics: customer behavior change, competitors' response, etc.",
  ];
  const by = ry0 + rhd + 0.08, bottom = 7.24, colW = (right - left - 0.3) / 2, rowH = (bottom - by) / 2;
  risks.forEach((r, i) => {
    const cx = left + (i % 2) * (colW + 0.3), cy = by + Math.floor(i / 2) * rowH;
    slide.addText(r, { x: cx, y: cy, w: colW, h: rowH, fontFace: font, fontSize: BODYPT, color: R.text, valign: "top", margin: 0.02, isTextBox: true,
      bullet: { code: "25CF", indent: 24 } });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
