// C03 run2 r3: backup assumptions table in the Polaris 2019 style.
// Form: the deck's own backup-table form (Polaris 19-21: native table, header text bold in the main colour,
// black header rule, grey row rules, first column bold, numbers centred, no fills), three tables stacked.
// Formatting values from Style/refs/Case-2019-Polaris.profile.json (table.pt, header_rule, row_rule, roles.main).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, B, P, prof } = L.start({
  ref: "Case-2019-Polaris",
  title: "Backup: Key assumptions for financial analysis",
  source: "Source: Polaris Analysis",
});
const T = prof.table, R = prof.roles, font = prof.fonts.body;
const years = ["2019", "2020", "2021", "2022", "2023"];
const cases = [
  { name: "High Case", rows: [["#stores", "261", "321", "381", "441", "551"],
    ["Organic Growth(%)", "4%", "8%", "10%", "12%", "15%"],
    ["Online Growth(%)", "31%", "41%", "40%", "45%", "38%"]] },
  { name: "Base Case", rows: [["#stores", "261", "306", "351", "396", "441"],
    ["Organic Growth(%)", "4%", "8%", "10%", "10%", "12%"],
    ["Online Growth(%)", "31%", "32%", "32%", "30%", "30%"]] },
  { name: "Low Base", rows: [["#stores", "261", "306", "351", "391", "431"],
    ["Organic Growth(%)", "4%", "4%", "4%", "3%", "5%"],
    ["Online Growth(%)", "31%", "29%", "29%", "27%", "25%"]] },
];
const none = { type: "none" };
const hdrB = [none, none, { type: "solid", color: T.header_rule[0], pt: T.header_rule[1] }, none];
const rowB = [none, none, { type: "solid", color: T.row_rule[0], pt: T.row_rule[1] }, none];
const x = prof.margins.left, w = prof.page.right - x;             // full body width, as Polaris 19-21
const top = prof.margins.body_top + 0.07, bottom = 7.08, gap = 0.3;
const tabH = (bottom - top - 2 * gap) / 3, rowH = tabH / 4;
const colW = [w * 0.25, ...years.map(() => (w * 0.75) / 5)];
cases.forEach((c, k) => {
  const y = top + k * (tabH + gap);
  const head = [c.name, ...years].map((t, j) => ({ text: t, options: { bold: true, color: R.main, align: j ? "center" : "left", valign: "bottom", border: hdrB, margin: [0, 0.1, 0.07, 0.1] } }));
  const body = c.rows.map((r) => r.map((t, j) => ({ text: t, options: { bold: j === 0, color: R.text, align: j ? "center" : "left", valign: "middle", border: rowB } })));
  slide.addTable([head, ...body], { x, y, w, colW, rowH, h: tabH, fontFace: font, fontSize: T.pt + 2, margin: [0, 0.1, 0.03, 0.1] });
});
// Logo slot (bottom right on every Polaris slide): no official logo files in Objects/Brand/logos, so per
// Objects/images.md the names go in as a plain text label (assets needed: Pandora and Polaris logos).
slide.addText("PANDORA  |  Polaris", { x: 10.15, y: prof.page.y - 0.05, w: 2.5, h: 0.28, fontFace: font, fontSize: 10,
  color: R.text, align: "right", valign: "middle", margin: 0 });
L.save(pres, __dirname + "/candidate.pptx");
