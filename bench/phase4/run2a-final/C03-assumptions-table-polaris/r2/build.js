// C03 rebuild 2 (run2a-final): backup slide, key assumptions of the financial analysis in three scenarios.
// Deck as reference (Case-2019-Polaris), leave-one-out. Form: the deck's own backup tables (Polaris 19-21, slide map
// "appendix | TABLE"): ruled table, red bold header text over a black rule, grey row rules, first column bold,
// numbers centred. Three scenarios (as on the deck's financial slide 17: High / Base / Low) stacked as three ruled
// tables, the scenario name in the header row's first cell, years 2019-2023 across.
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

// body: from just under the title rule to just above the source line, full width as on the deck's backup tables
const x = 0.37, w = 12.6, top = 1.08, bottom = 7.0, gap = 0.22;
const h = (bottom - top - gap * (cases.length - 1)) / cases.length;
cases.forEach((c, k) => {
  P.table(slide, {
    form: "ruled",
    header: [c.name, ...years],
    rows: c.rows,
    colW: [0.25, 0.15, 0.15, 0.15, 0.15, 0.15],
  }, { x, y: top + k * (h + gap), w, h });
});

// the deck's footer rule (thin grey line over the source line, full width on every content slide; not in the profile)
slide.addShape("line", { x: 0, y: 7.22, w: 12.97, h: 0, line: { color: "B4B4B4", width: 0.72 } });

L.save(pres, __dirname + "/candidate.pptx");
