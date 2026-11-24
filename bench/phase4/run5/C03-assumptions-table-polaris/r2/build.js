// C03 run5 r2: appendix slide "Backup: Key assumptions for financial analysis" in the style of Templates/Case-2019-Polaris.pptx.
// Deck as reference, leave-one-out. Form taken from the deck's other backup slides (slide-map rows 19-21, layout TABLE:
// one full-width ruled table under the title, red bold header text over a black rule, grey row rules, first column bold).
// Here three ruled tables are stacked, one per scenario, the scenario name in the header cell over the label column.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, B, P } = L.start({
  ref: "Case-2019-Polaris",
  title: "Backup: Key assumptions for financial analysis",
  source: "Source: Polaris Analysis",
});

const years = ["2019", "2020", "2021", "2022", "2023"];
const cases = [
  { name: "High Case", stores: [261, 321, 381, 441, 551], organic: ["4%", "8%", "10%", "12%", "15%"], online: ["31%", "41%", "40%", "45%", "38%"] },
  { name: "Base Case", stores: [261, 306, 351, 396, 441], organic: ["4%", "8%", "10%", "10%", "12%"], online: ["31%", "32%", "32%", "30%", "30%"] },
  { name: "Low Base", stores: [261, 306, 351, 391, 431], organic: ["4%", "4%", "4%", "3%", "5%"], online: ["31%", "29%", "29%", "27%", "25%"] },
];

const gap = 0.3, h = (B.h - gap * (cases.length - 1)) / cases.length;
const colW = [0.25, 0.15, 0.15, 0.15, 0.15, 0.15];
cases.forEach((c, k) => {
  const box = { x: B.x, y: B.y + k * (h + gap), w: B.w, h };
  P.table(slide, {
    form: "ruled",
    header: [c.name, ...years],
    rows: [
      ["#stores", ...c.stores.map(String)],
      ["Organic Growth (%)", ...c.organic],
      ["Online Growth (%)", ...c.online],
    ],
    colW,
  }, box);
});

L.save(pres, __dirname + "/candidate.pptx");
