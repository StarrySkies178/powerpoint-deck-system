// C05 rebuild 2: "Implementation Timeline" in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Approach: the deck's style profile (frame, crumb, fonts, colours) + a Gantt drawn as a native table in the
// deck's table form (navy header row, light-blue / grey bands, white rules: E-Cluster 23 and 24) with bar shapes
// over the year columns, then a "Key Assumptions"-style section head (E-Cluster 16) over a row of grey icon cards
// (E-Cluster 7, KSF row) for the risks. build.py then fixes frame details the generators do not draw (logo, title
// inset, footer rule, page number).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Implementation Timeline",
    source: "Sources: E-Cluster Analysis",
    crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
  });

  // deck colours (profile roles + the rendered navy of the deck's bands and table headers)
  const NAVY = "202C4E", HEAD = "253449", SEC = "354B70", LBLUE = "63A4CC", BAND = "DFECF5", GREY = "F1F1F1", RULE = "10366C";
  const X0 = 0.27, WTOT = 12.8;

  // ---------- Gantt: native table ----------
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const cG = 2.15, cI = 4.25, cY = (WTOT - cG - cI) / years.length;
  const colW = [cG, cI, ...years.map(() => cY)];
  const hH = 0.42, r1 = 0.44, r2 = 0.56;                 // header, single-line row, two-line row
  const rowH = [hH, r1, r1, r2, r2, r2, r2];
  const T0 = 1.5;
  const b = (c) => ({ type: "solid", color: "FFFFFF", pt: 1.5 });
  const cell = (text, fill, o = {}) => ({ text, options: { fill: { color: fill }, border: [b(), b(), b(), b()], valign: "middle", fontSize: 14, color: "000000", margin: [0.03, 0.1, 0.03, 0.1], ...o } });
  const head = (t, o = {}) => cell(t, HEAD, { bold: true, color: "FFFFFF", align: "center", fontSize: 15, ...o });
  const yrs = (fill) => years.map(() => cell("", fill));
  const wsLabel = { bold: true, color: NAVY };
  const rows = [
    [head("Workstream", { colspan: 2, align: "left" }), ...years.map((y) => head(y))],
    [cell("New Product R&D", BAND, { colspan: 2, ...wsLabel }), ...yrs(BAND)],
    [cell("Marketing & Reshaping Brand", GREY, { colspan: 2, ...wsLabel }), ...yrs(GREY)],
    [cell("Offline: City Penetration Steps", BAND, { rowspan: 2, ...wsLabel }), cell("Set up 3~5 monobrand stores in prioritized and secondary cities", BAND), ...yrs(BAND)],
    [cell("Further expand into the tertiary cities with ~50 more stores", BAND), ...yrs(BAND)],
    [cell("Omni Channel Building", GREY, { rowspan: 2, ...wsLabel }), cell("Adjust the product offering and enter key e-commerce platforms", GREY), ...yrs(GREY)],
    [cell("Further integrate online and offline channels", GREY), ...yrs(GREY)],
  ];
  slide.addTable(rows, { x: X0, y: T0, w: WTOT, colW, rowH, h: rowH.reduce((a, c) => a + c, 0), fontFace: "Arial", fontSize: 14, autoPage: false });

  // ---------- bars over the year columns ----------
  const YX = X0 + cG + cI;
  const rowTop = (i) => T0 + rowH.slice(0, i).reduce((a, c) => a + c, 0);
  const bars = [ // [row, from, to (inclusive, 0 = 2019), colour, label]
    [1, 0, 0, SEC, "2019"],
    [2, 0, 2, SEC, "2019–2021"],
    [3, 0, 2, SEC, "2019–2021"],
    [4, 2, 5, LBLUE, "2021–2024"],
    [5, 0, 1, SEC, "2019–2020"],
    [6, 2, 5, LBLUE, "2021–2024"],
  ];
  bars.forEach(([r, f, t, col]) => {
    const y = rowTop(r), h = rowH[r], bh = 0.28;
    slide.addShape("homePlate", { x: YX + f * cY + 0.1, y: y + (h - bh) / 2, w: (t - f + 1) * cY - 0.2, h: bh,
      fill: { color: col }, line: { type: "none" }, adjustPoint: 0.35, objectName: "gantt bar" });
  });

  // ---------- Potential Risks ----------
  const RY = 5.0;
  P.txt(slide, "Potential Risks", X0, RY, 5, 0.38, { fontSize: 17, keepSize: true, bold: true, color: RULE, valign: "bottom", margin: [0, 0, 0, 0.02] });
  slide.addShape("line", { x: X0, y: RY + 0.42, w: WTOT, h: 0, line: { color: RULE, width: 1.5 } });
  const risks = [
    { icon: "trending-down", runs: [["Economy downturn", true]] },
    { icon: "hourglass", runs: [["Suffer from ", false], ["slow ramp up", true], [" problem when entering the new market", false]] },
    { icon: "alert-triangle", runs: [["Potential ", false], ["brand image cannibalization", true], [", fail to launch new products in the market as expected", false]] },
    { icon: "users", runs: [["Market dynamics", true], [": customer behavior change, competitors’ response, etc.", false]] },
  ];
  const gap = 0.15, cw = (WTOT - gap * (risks.length - 1)) / risks.length, cy = RY + 0.55, ch = 1.55;
  risks.forEach((r, i) => {
    const x = X0 + i * (cw + gap);
    slide.addShape("rect", { x, y: cy, w: cw, h: ch, fill: { color: GREY }, line: { type: "none" } });
    P.icon(slide, r.icon, x + 0.14, cy + (ch - 0.5) / 2, 0.5, { color: SEC });
    slide.addText(r.runs.map(([t, bold]) => ({ text: t, options: { bold, color: bold ? NAVY : "000000" } })),
      { x: x + 0.76, y: cy + 0.05, w: cw - 0.86, h: ch - 0.1, fontFace: "Arial", fontSize: 14, valign: "middle", margin: 0.02, isTextBox: true });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
