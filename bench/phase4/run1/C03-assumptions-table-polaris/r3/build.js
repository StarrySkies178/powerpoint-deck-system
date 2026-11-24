// C03 rebuild 3: backup slide with three stacked scenario tables, in the style of Case-2019-Polaris.
// Approach: the deck's style profile (title, red rule, source line, page number, logos via the master) and
// native tables drawn in the deck's backup-table form (slides 19-21: red bold 12 pt header text with no fill,
// 1.5 pt black rule under the header, 0.75 pt grey row rules, bold black first column, centred values).
// dataTable() right-aligns numbers and colours headers black in "lines" style, so the cells are set here directly.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, HOUSE, prof } = L.start({
    ref: "Case-2019-Polaris",
    title: "Backup: Key assumptions for financial analysis",
    source: "Source: Polaris Analysis",
  });
  const C = P.C, T = prof.table, B = HOUSE.GRID.body;
  const pt = T.pt || 12, red = C.navy, grey = T.row_rule[0], ink = C.text;
  const years = ["2019", "2020", "2021", "2022", "2023"];
  const cases = [
    ["High Case", [["#stores", 261, 321, 381, 441, 551], ["Organic Growth(%)", "4%", "8%", "10%", "12%", "15%"], ["Online Growth(%)", "31%", "41%", "40%", "45%", "38%"]]],
    ["Base Case", [["#stores", 261, 306, 351, 396, 441], ["Organic Growth(%)", "4%", "8%", "10%", "10%", "12%"], ["Online Growth(%)", "31%", "32%", "32%", "30%", "30%"]]],
    ["Low Base", [["#stores", 261, 306, 351, 391, 431], ["Organic Growth(%)", "4%", "4%", "4%", "3%", "5%"], ["Online Growth(%)", "31%", "29%", "29%", "27%", "25%"]]],
  ];
  const none = { type: "none" };
  const under = (c, w) => [none, none, { type: "solid", color: c, pt: w }, none];
  const x = B.x, w = B.w, firstW = 3.2, colW = [firstW, ...years.map(() => (w - firstW) / years.length)];
  const headH = 0.42, rowH = 0.42, gap = 0.36;
  const tblH = headH + 3 * rowH, total = 3 * tblH + 2 * gap;
  let y = B.y + Math.max(0, (B.h - total) / 2) * 0.3;
  for (const [name, rows] of cases) {
    const head = [name, ...years].map((t, j) => ({ text: t, options: { bold: true, color: red, align: j ? "center" : "left", valign: "bottom", border: under(T.header_rule[0], T.header_rule[1]) } }));
    const body = rows.map((r) => r.map((c, j) => ({ text: String(c), options: { bold: j === 0, color: ink, align: j ? "center" : "left", valign: "middle", border: under(grey, T.row_rule[1]) } })));
    slide.addTable([head, ...body], { x, y, w, h: tblH, colW, rowH: [headH, rowH, rowH, rowH], fontFace: P.THEME.bodyFontFace, fontSize: pt, color: ink, margin: [0.03, 0.1, 0.05, 0.1], objectName: "table " + name });
    y += tblH + gap;
  }
  await L.save(pres, __dirname + "/candidate.pptx");
})();
