// C03 rebuild: "Backup: Key assumptions for financial analysis", in the style of Case-2019-Polaris (deck as reference).
// Form: the deck's own backup tables (its other appendix slides, ruled tables: red bold header text over a black rule,
// grey row rules, first column bold, numbers centred) -> table({ form: "ruled" }), one per scenario, stacked.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, B, P } = L.start({
  ref: "Case-2019-Polaris",
  title: "Backup: Key assumptions for financial analysis",
  source: "Source: Polaris Analysis",
});

const years = ["2019", "2020", "2021", "2022", "2023"];
const cases = [
  { name: "High Case", rows: [
    ["# stores", "261", "321", "381", "441", "551"],
    ["Organic Growth (%)", "4%", "8%", "10%", "12%", "15%"],
    ["Online Growth (%)", "31%", "41%", "40%", "45%", "38%"] ] },
  { name: "Base Case", rows: [
    ["# stores", "261", "306", "351", "396", "441"],
    ["Organic Growth (%)", "4%", "8%", "10%", "10%", "12%"],
    ["Online Growth (%)", "31%", "32%", "32%", "30%", "30%"] ] },
  { name: "Low Base", rows: [
    ["# stores", "261", "306", "351", "391", "431"],
    ["Organic Growth (%)", "4%", "4%", "4%", "3%", "5%"],
    ["Online Growth (%)", "31%", "29%", "29%", "27%", "25%"] ] },
];

// three equal stacked boxes over the body, small gap between tables
const gap = 0.22, h = (B.h - 2 * gap) / 3;
const colW = [0.28, 0.144, 0.144, 0.144, 0.144, 0.144];
cases.forEach((c, i) => {
  P.table(slide, { form: "ruled", header: [c.name, ...years], rows: c.rows, colW },
    { x: B.x, y: B.y + i * (h + gap), w: B.w, h });
});

L.save(pres, __dirname + "/candidate.pptx");
