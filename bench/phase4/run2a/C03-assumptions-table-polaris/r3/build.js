// C03 rebuild 3: backup slide of key financial assumptions, in the style of Case-2019-Polaris.
// Approach: the deck's style profile (title, red rule, source line, page number) and the framework's table() in the
// "ruled" form, which is the form of the deck's own backup tables (Polaris backups 19 to 21: red bold header text over a
// black rule, thin grey row rules, bold first column, numbers centred, no fills). Three stacked tables, one per scenario,
// the scenario name in the header's first cell. build.py then adds the deck's footer rule and logos.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const title = "Backup: Key assumptions for financial analysis";
const { pres, slide, B, P } = L.start({ ref: "Case-2019-Polaris", title, source: "Source: Polaris Analysis" });

const years = ["2019", "2020", "2021", "2022", "2023"];
const cases = [
  { name: "High Case", stores: [261, 321, 381, 441, 551], organic: ["4%", "8%", "10%", "12%", "15%"], online: ["31%", "41%", "40%", "45%", "38%"] },
  { name: "Base Case", stores: [261, 306, 351, 396, 441], organic: ["4%", "8%", "10%", "10%", "12%"], online: ["31%", "32%", "32%", "30%", "30%"] },
  { name: "Low Base", stores: [261, 306, 351, 391, 431], organic: ["4%", "4%", "4%", "3%", "5%"], online: ["31%", "29%", "29%", "27%", "25%"] },
];

// body from just under the title rule to just above the source line
const top = 1.13, bottom = 7.05, gap = 0.22;
const h = (bottom - top - gap * (cases.length - 1)) / cases.length;
const colW = [0.25, 0.15, 0.15, 0.15, 0.15, 0.15];
cases.forEach((c, i) => {
  P.table(slide, {
    form: "ruled",
    header: [c.name, ...years],
    rows: [
      ["#stores", ...c.stores.map(String)],
      ["Organic Growth(%)", ...c.organic],
      ["Online Growth(%)", ...c.online],
    ],
    colW,
  }, { x: B.x, y: top + i * (h + gap), w: 12.6, h });   // 12.6 in wide: ends at the title rule, as the deck's backup tables do
});

L.save(pres, __dirname + "/candidate.pptx");
