// C03 rebuild 2: "Backup: Key assumptions for financial analysis" in the Case-2019-Polaris style.
// Form: the deck's own backup-table form (appendix tables, slides 19-21: header text red bold over a black rule,
// thin grey rules between rows, first column bold, values centred, no fills), stacked three times, one per scenario.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, HOUSE, prof } = L.start({
    ref: "Case-2019-Polaris",
    title: "Backup: Key assumptions for financial analysis",
    source: "Source: Polaris Analysis",
  });
  const C = P.C, ts = prof.table, font = P.THEME.bodyFontFace;
  const years = ["2019", "2020", "2021", "2022", "2023"];
  const cases = [
    { name: "High Case", rows: [["#stores", 261, 321, 381, 441, 551], ["Organic Growth(%)", "4%", "8%", "10%", "12%", "15%"], ["Online Growth(%)", "31%", "41%", "40%", "45%", "38%"]] },
    { name: "Base Case", rows: [["#stores", 261, 306, 351, 396, 441], ["Organic Growth(%)", "4%", "8%", "10%", "10%", "12%"], ["Online Growth(%)", "31%", "32%", "32%", "30%", "30%"]] },
    { name: "Low Base", rows: [["#stores", 261, 306, 351, 391, 431], ["Organic Growth(%)", "4%", "4%", "4%", "3%", "5%"], ["Online Growth(%)", "31%", "29%", "29%", "27%", "25%"]] },
  ];

  // body box: the deck's measured margins (left 0.37, right edge 12.98 = slide width - 0.32 - title rule end), below the title rule
  const x = prof.margins.left, ruleEnd = prof.title.rule.x + prof.title.rule.w, w = ruleEnd - x;   // tables end where the title rule ends, as on the backup tables
  const top = prof.margins.body_top, bottom = 6.95;
  const rowH = 0.42, gap = 0.32, n = cases.length;
  const tblH = rowH * 4;
  const y0 = top + 0.05;
  const pt = ts.pt || 12;
  const hr = ts.header_rule, rr = ts.row_rule;
  const none = { type: "none" };
  const colW = [3.1, ...years.map(() => (w - 3.1) / years.length)];

  cases.forEach((cs, k) => {
    const y = y0 + k * (tblH + gap);
    const head = [cs.name, ...years].map((h, j) => ({ text: h, options: {
      bold: true, color: C.navy, align: j ? "center" : "left", valign: "bottom",
      border: [none, none, { type: "solid", color: hr[0], pt: hr[1] }, none] } }));
    const body = cs.rows.map((r) => r.map((c, j) => ({ text: String(c), options: {
      bold: j === 0, color: C.text, align: j ? "center" : "left", valign: "middle",
      border: [none, none, { type: "solid", color: rr[0], pt: rr[1] }, none] } })));
    slide.addTable([head, ...body], { x, y, w, h: tblH, colW, rowH, fontFace: font, fontSize: pt, color: C.text, margin: [0.04, 0.08, 0.04, 0.08] });
  });

  // footer rule above the source line, full width to the title rule's end, as on every content slide of the deck
  slide.addShape("line", { x: 0, y: 7.13, w: ruleEnd, h: 0, line: { color: "D5D5D5", width: 0.75 } });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
