// C05 rebuild (run5 r1): implementation Gantt 2019-2024 over a "Potential Risks" row, in the E-Cluster deck's style.
// Style: Style/refs/Case-2019-E-Cluster.profile.json (navy title band, crumb, Arial, 15 pt body / 14 pt labels).
// Forms taken from the deck's other slides: navy header boxes with white text over light-blue bands (promotion matrix,
// slide 12), navy row-group blocks with white bold text and light-blue label cells (KSF table, slide 7), section header
// with a navy rule (city prioritisation, slide 13), icon + bold label cells on light grey (store experience, slide 14).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, S, prof } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Implementation Timeline",
    source: "Sources: E-Cluster Analysis",
    crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
  });
  const C = P.C, txt = P.txt;
  const NAVY = prof.roles.main;            // 08163B
  const BLUE = prof.roles.secondary;       // 354B70
  const SKY = "63A4CC", PALE = "C1DBEB", ROWBG = prof.roles.panel;   // F1F1F1
  const RULE = prof.panel.colour;          // 10366C
  const LBL = prof.body.label_pt;          // 14 pt
  const X0 = prof.margins.left, X1 = 13.333 - prof.margins.right, Wd = X1 - X0;

  // ---------------- Gantt ----------------
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const lw = 3.0, gx = X0 + lw + 0.1, gw = X1 - gx, pw = gw / years.length;
  let y = 1.52;
  const hh = 0.40;
  // header: workstream cell + one navy box per year
  slide.addShape("rect", { x: X0, y, w: lw, h: hh, fill: { color: NAVY }, line: { type: "none" } });
  txt(slide, "Workstream", X0, y, lw, hh, { fontSize: LBL + 1, keepSize: true, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  // one navy band over the six years, split by white dividers that run on down through the rows
  slide.addShape("rect", { x: gx, y, w: gw, h: hh, fill: { color: NAVY }, line: { type: "none" } });
  years.forEach((yr, i) => txt(slide, yr, gx + i * pw, y, pw, hh, { fontSize: LBL + 1, keepSize: true, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 }));
  // the layout's section rule (y 1.74, to x 13.09) runs under this header: cover its last hair past the margin
  slide.addShape("rect", { x: X1, y: 1.70, w: 0.06, h: 0.08, fill: { color: "FFFFFF" }, line: { type: "none" } });
  const headTop = y;
  y += hh + 0.06;

  // rows: single workstreams, then two groups of two steps (bars carry the step text)
  const single = [
    { label: "New Product R&D", from: 0, to: 1 },
    { label: "Marketing & Reshaping Brand", from: 0, to: 3 },
  ];
  const groups = [
    { name: "Offline: City Penetration Steps", rows: [
      { text: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 3 },
      { text: "Further expand into the tertiary cities with ~50 more stores", from: 2, to: 6 },
    ] },
    { name: "Omni Channel Building", rows: [
      { text: "Adjust the product offering and enter key e-commerce platforms", from: 0, to: 2 },
      { text: "Further integrate online and offline channels", from: 2, to: 6 },
    ] },
  ];
  const sh = 0.42, gh = 0.58, gap = 0.06;
  // pass 1: lay out rows (label cells + grey row bands)
  const rowsTop = y, bars = [];
  single.forEach((r) => {
    slide.addShape("rect", { x: gx, y, w: gw, h: sh, fill: { color: ROWBG }, line: { type: "none" } });
    slide.addShape("rect", { x: X0, y, w: lw, h: sh, fill: { color: PALE }, line: { type: "none" } });
    txt(slide, r.label, X0 + 0.12, y, lw - 0.2, sh, { fontSize: LBL, keepSize: true, bold: true, color: NAVY, valign: "middle", margin: 0 });
    bars.push({ r, y: y + 0.06, h: sh - 0.12, fill: BLUE, text: null });
    y += sh + gap;
  });
  groups.forEach((g) => {
    const gTop = y, gH = g.rows.length * gh + (g.rows.length - 1) * gap;
    slide.addShape("rect", { x: X0, y: gTop, w: lw, h: gH, fill: { color: NAVY }, line: { type: "none" } });
    txt(slide, g.name, X0 + 0.12, gTop, lw - 0.2, gH, { fontSize: LBL, keepSize: true, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
    g.rows.forEach((r, i) => {
      slide.addShape("rect", { x: gx, y, w: gw, h: gh, fill: { color: ROWBG }, line: { type: "none" } });
      bars.push({ r, y: y + 0.03, h: gh - 0.06, fill: i === 0 ? BLUE : SKY, text: r.text });
      y += gh + gap;
    });
  });
  const rowsBottom = y - gap;
  // pass 2: white year dividers through the grey bands, then the bars on top
  for (let i = 1; i < years.length; i++)
    slide.addShape("line", { x: gx + i * pw, y: headTop, w: 0, h: rowsBottom - headTop, line: { color: "FFFFFF", width: 1.5 } });
  bars.forEach(({ r, y: yy, h, fill, text }) => {
    const x = gx + r.from * pw + 0.05, w = (r.to - r.from) * pw - 0.1;
    slide.addShape("homePlate", { x, y: yy, w, h, fill: { color: fill }, line: { type: "none" } });
    if (text) txt(slide, text, x + 0.08, yy, w - 0.26, h, { fontSize: LBL, keepSize: true, color: "FFFFFF", valign: "middle", margin: 0 });
  });

  // ---------------- Potential Risks ----------------
  y = rowsBottom + 0.1;
  txt(slide, "Potential Risks", X0, y, 5, 0.4, { fontSize: prof.panel.pt, keepSize: true, bold: true, color: RULE, valign: "middle", margin: 0 });
  slide.addShape("line", { x: X0, y: y + 0.42, w: Wd, h: 0, line: { color: RULE, width: prof.panel.rule[1] } });
  y += 0.52;
  const risks = [
    { ic: "trending-down", t: "Economy downturn" },
    { ic: "hourglass", t: "Suffer from slow ramp up problem when entering the new market" },
    { ic: "diamond", t: "Potential brand image cannibalization, fail to launch new products in the market as expected" },
    { ic: "users-group", t: "Market dynamics: customer behavior change, competitors' response, etc." },
  ];
  const cg = 0.14, cw = (Wd - cg * (risks.length - 1)) / risks.length, ch = 7.12 - y, iw = 0.62;
  risks.forEach((r, i) => {
    const x = X0 + i * (cw + cg);
    slide.addShape("rect", { x, y, w: iw, h: ch, fill: { color: PALE }, line: { type: "none" } });
    P.icon(slide, r.ic, x + (iw - 0.42) / 2, y + (ch - 0.42) / 2, 0.42, { color: NAVY, width: 1.5 });
    slide.addShape("rect", { x: x + iw, y, w: cw - iw, h: ch, fill: { color: ROWBG }, line: { type: "none" } });
    txt(slide, r.t, x + iw + 0.1, y, cw - iw - 0.16, ch, { fontSize: LBL, keepSize: true, color: C.text, valign: "middle", margin: 0 });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
