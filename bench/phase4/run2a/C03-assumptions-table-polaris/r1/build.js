// C03 rebuild: appendix assumptions slide in the Polaris 2019 style.
// Form: the deck's own backup-table form (ruled table, red bold header text on a black rule, grey row rules,
// bold first column; Polaris backup slides 19-21), three tables stacked, one per scenario.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const years = ["2019E", "2020E", "2021E", "2022E", "2023E"];
const cases = [
  { name: "High Case", stores: [261, 321, 381, 441, 551], org: ["4%", "8%", "10%", "12%", "15%"], onl: ["31%", "41%", "40%", "45%", "38%"] },
  { name: "Base Case", stores: [261, 306, 351, 396, 441], org: ["4%", "8%", "10%", "10%", "12%"], onl: ["31%", "32%", "32%", "30%", "30%"] },
  { name: "Low Base", stores: [261, 306, 351, 391, 431], org: ["4%", "4%", "4%", "3%", "5%"], onl: ["31%", "29%", "29%", "27%", "25%"] },
];

(async () => {
  const { pres, slide, B, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "Backup: Key assumptions for financial analysis",
    source: "Source: Polaris Analysis",
  });
  const gap = 0.22, n = cases.length;
  const h = (B.h - gap * (n - 1)) / n;
  const colW = [0.28, 0.144, 0.144, 0.144, 0.144, 0.144];
  cases.forEach((c, i) => {
    P.table(slide, {
      form: "ruled",
      header: [c.name, ...years],
      rows: [
        ["# stores", ...c.stores.map(String)],
        ["Organic Growth (%)", ...c.org],
        ["Online Growth (%)", ...c.onl],
      ],
      colW,
    }, { x: B.x, y: B.y + i * (h + gap), w: B.w, h });
  });
  await L.save(pres, __dirname + "/candidate.pptx");
})();
