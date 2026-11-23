// C03 variant a: backup slide of three stacked assumption tables, in the style of Case-2019-Polaris.
// Approach: the deck's style profile (frame, title, rule, source line, colours) + native editable tables drawn in the
// form of the deck's other backup tables (Polaris 19-21: red bold header text, black 1.5 pt header rule,
// grey 0.75 pt row rules, red closing rule, first column bold, numbers centred, 12 pt).
// P.dataTable is not used: it cannot colour header text without a header fill, centre numbers or close with a red rule.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "Backup: Key assumptions for financial analysis",
    source: "Source: Polaris Analysis",
  });
  const S = P.HOUSE.STYLE, C = P.C;
  const t = S.table;                                  // measured table look of the deck
  const RED = C.navy, TEXT = C.text, ROW = t.row_rule[0], HEAD = t.header_rule;
  const pt = t.pt;                                    // 12 pt, as the deck's backup tables
  const x = S.margins.left, w = S.page.right - x;     // full body width, as the deck's backup tables
  const years = ["2019", "2020", "2021", "2022", "2023"];
  const cases = [
    { name: "High Case", rows: [["# stores", 261, 321, 381, 441, 551], ["Organic Growth (%)", "4%", "8%", "10%", "12%", "15%"], ["Online Growth (%)", "31%", "41%", "40%", "45%", "38%"]] },
    { name: "Base Case", rows: [["# stores", 261, 306, 351, 396, 441], ["Organic Growth (%)", "4%", "8%", "10%", "10%", "12%"], ["Online Growth (%)", "31%", "32%", "32%", "30%", "30%"]] },
    { name: "Low Base", rows: [["# stores", 261, 306, 351, 391, 431], ["Organic Growth (%)", "4%", "4%", "4%", "3%", "5%"], ["Online Growth (%)", "31%", "29%", "29%", "27%", "25%"]] },
  ];
  const none = { type: "none" };
  const line = (c, p) => ({ type: "solid", color: c, pt: p });
  const firstW = 3.0, colW = [firstW, ...years.map(() => (w - firstW) / years.length)];
  const headH = 0.5, rowH = 0.42;
  const tabH = headH + 3 * rowH;
  const top = S.margins.body_top, bottom = S.source_line.y - 0.25;
  const gap = (bottom - top - 3 * tabH) / 2;

  cases.forEach((cs, k) => {
    const y = top + k * (tabH + gap);
    const head = [cs.name, ...years].map((h, j) => ({ text: h, options: {
      bold: true, color: RED, align: j ? "center" : "left", valign: "bottom",
      border: [none, none, line(HEAD[0], HEAD[1]), none] } }));
    const body = cs.rows.map((r, i) => r.map((c, j) => ({ text: String(c), options: {
      bold: j === 0, color: TEXT, align: j ? "center" : "left", valign: "middle",
      border: [none, none, i === cs.rows.length - 1 ? line(RED, 0.75) : line(ROW, t.row_rule[1]), none] } })));
    slide.addTable([head, ...body], {
      x, y, w, colW, rowH: [headH, rowH, rowH, rowH], h: tabH,
      fontFace: P.THEME.bodyFontFace, fontSize: pt, margin: [2, 7, 2, 7],
      objectName: "form:dataTable assumptions " + cs.name,
    });
  });

  // footer rule above the source line, as on the deck's other content and backup slides (not in the style profile)
  slide.addShape("line", { x: 0, y: S.source_line.y - 0.013, w: S.page.right, h: 0, line: { color: ROW, width: 0.72 } });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
