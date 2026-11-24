// C03 run2 r2: "Backup: Key assumptions for financial analysis", deck as reference (Case-2019-Polaris).
// Form taken from the deck's other backup slides (19-21, layout TABLE): native table(s) on lines, header text
// bold in the main red with a black 1.5 pt rule under it, grey 0.75 pt row rules, first column bold, values centred,
// 12 pt cells, full body width (x 0.37 in, w 12.6 in). Here: three stacked tables, one per scenario.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, prof } = L.start({
  ref: "Case-2019-Polaris",
  title: "Backup: Key assumptions for financial analysis",
  source: "Source: Polaris Analysis",
});
const C = P.C, FONT = P.THEME.bodyFontFace;
const red = C.navy;            // profile role "main" = CC0000
const black = C.text;
const rowRule = (prof.table.row_rule || ["B4B4B4", 0.75]);
const headRule = (prof.table.header_rule || ["000000", 1.5]);
const pt = prof.table.pt || 12;

const years = ["2019", "2020", "2021", "2022", "2023"];
const cases = [
  { name: "High Case", rows: [
    ["#stores", "261", "321", "381", "441", "551"],
    ["Organic Growth(%)", "4%", "8%", "10%", "12%", "15%"],
    ["Online Growth(%)", "31%", "41%", "40%", "45%", "38%"] ] },
  { name: "Base Case", rows: [
    ["#stores", "261", "306", "351", "396", "441"],
    ["Organic Growth(%)", "4%", "8%", "10%", "10%", "12%"],
    ["Online Growth(%)", "31%", "32%", "32%", "30%", "30%"] ] },
  { name: "Low Base", rows: [
    ["#stores", "261", "306", "351", "391", "431"],
    ["Organic Growth(%)", "4%", "4%", "4%", "3%", "5%"],
    ["Online Growth(%)", "31%", "29%", "29%", "27%", "25%"] ] },
];

const X = 0.37, Wd = 12.6;
const colW = [3.1, ...Array(5).fill((Wd - 3.1) / 5)];
const hH = 0.46, rH = 0.41, gap = 0.3;
const none = { type: "none" };
const bottom = (rule) => [none, none, { type: "solid", color: rule[0], pt: rule[1] }, none];

let y = 1.1;
cases.forEach((cs) => {
  const head = [cs.name, ...years].map((t, j) => ({ text: t, options: {
    bold: true, color: red, align: j ? "center" : "left", valign: "bottom", border: bottom(headRule) } }));
  const body = cs.rows.map((r) => r.map((t, j) => ({ text: t, options: {
    bold: j === 0, color: black, align: j ? "center" : "left", valign: "middle", border: bottom(rowRule) } })));
  slide.addTable([head, ...body], {
    x: X, y, w: Wd, colW, rowH: [hH, rH, rH, rH], h: hH + 3 * rH,
    fontFace: FONT, fontSize: pt, color: black, margin: [0.02, 0.1, 0.04, 0.1],
  });
  y += hH + 3 * rH + gap;
});

// team / client marks bottom right, as on every content slide of the deck (the logo pictures are not in the store; typed)
slide.addText("PANDORA", { x: 10.62, y: 7.2, w: 1.3, h: 0.26, fontFace: FONT, fontSize: 12, color: black, charSpacing: 2, align: "right", valign: "middle", margin: 0 });
slide.addShape("line", { x: 11.98, y: 7.23, w: 0, h: 0.2, line: { color: black, width: 0.75 } });
slide.addText("Polaris", { x: 12.04, y: 7.2, w: 0.72, h: 0.26, fontFace: FONT, fontSize: 12, bold: true, color: red, align: "left", valign: "middle", margin: 0 });

L.save(pres, __dirname + "/candidate.pptx");
