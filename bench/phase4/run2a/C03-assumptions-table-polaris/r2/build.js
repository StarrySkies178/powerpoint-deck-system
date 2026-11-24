// C03 rebuild: appendix assumptions slide in the style of Templates/Case-2019-Polaris.pptx (deck as reference).
// Form: the deck's own backup-table form ("ruled": no header band, header text bold in the main colour over a
// black rule, grey row rules, first column bold, numbers centred), as on the deck's other "Backup:" table slides;
// the three scenarios are stacked as three tables with the case name as the first header cell.
// Table text at the profile's table size (table.pt 12 = body.label_pt, the floor DECK-SYSTEM sets for table
// cells); P.table() would lift it to body.pt 14, so the ruled form is drawn here with the profile's own values.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, B, prof } = L.start({
  ref: "Case-2019-Polaris",
  title: "Backup: Key assumptions for financial analysis",
  source: "Source: Polaris Analysis",
});
const R = prof.roles, T = prof.table;
const years = ["2019", "2020", "2021", "2022", "2023"];
const cases = [
  { name: "High Case", rows: [["#stores", "261", "321", "381", "441", "551"], ["Organic Growth(%)", "4%", "8%", "10%", "12%", "15%"], ["Online Growth(%)", "31%", "41%", "40%", "45%", "38%"]] },
  { name: "Base Case", rows: [["#stores", "261", "306", "351", "396", "441"], ["Organic Growth(%)", "4%", "8%", "10%", "10%", "12%"], ["Online Growth(%)", "31%", "32%", "32%", "30%", "30%"]] },
  { name: "Low Base", rows: [["#stores", "261", "306", "351", "391", "431"], ["Organic Growth(%)", "4%", "4%", "4%", "3%", "5%"], ["Online Growth(%)", "31%", "29%", "29%", "27%", "25%"]] },
];
const x = B.x, w = prof.title.rule.w - B.x;               // tables run to the end of the title rule, as on the deck's backup tables
const top = B.y + 0.02, bottom = 6.85, gap = 0.32;
const th = (bottom - top - gap * (cases.length - 1)) / cases.length;
const hH = 0.46, rH = (th - hH) / 3;
const first = 2.9, colW = [first, ...years.map(() => (w - first) / years.length)];
const none = { type: "none" }, rule = (c, pt) => ({ type: "solid", color: c, pt });
const pt = T.pt;
cases.forEach((c, k) => {
  const head = [c.name, ...years].map((t, j) => ({ text: t, options: { bold: true, color: R.main, align: j ? "center" : "left", valign: "bottom",
    border: [none, none, rule(T.header_rule[0], T.header_rule[1]), none] } }));
  const body = c.rows.map((r) => r.map((t, j) => ({ text: t, options: { bold: j === 0, color: R.text, align: j ? "center" : "left", valign: "middle",
    border: [none, none, rule(T.row_rule[0], T.row_rule[1]), none] } })));
  slide.addTable([head, ...body], { x, y: top + k * (th + gap), w, colW, rowH: [hH, rH, rH, rH], fontFace: prof.fonts.latin, fontSize: pt,
    margin: [0.04, 0.08, 0.04, 0.08], autoPage: false });
});
// footer rule over the source line, as on every content slide of the deck
slide.addShape("line", { x: 0, y: 7.2, w: prof.title.rule.w, h: 0, line: { color: R.grey4, width: 0.75 } });
L.save(pres, __dirname + "/candidate.pptx");
