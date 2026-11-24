// C03 run7 r3: "Backup: Key assumptions for financial analysis" in the Polaris 2019 style (deck as reference).
// Form: the deck's own backup-table form (Style/table-forms.md "ruled": header text bold in the main colour over one
// black rule, grey row rules, no fills, first column bold, number columns centred), taken from the deck's other
// backup slides (Polaris 19 to 21 in the filtered slide map: appendix | TABLE). Three scenario tables stacked
// down the body, one per case, years as the header.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, B, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "Backup: Key assumptions for financial analysis",
    source: "Source: Polaris Analysis",
  });

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

  // body under the title rule, down to just above the source line
  const top = B.y, bottom = B.y + B.h - 0.05, gap = 0.3;
  const h = (bottom - top - gap * (cases.length - 1)) / cases.length;
  const colW = [0.28, 0.144, 0.144, 0.144, 0.144, 0.144];
  cases.forEach((c, i) => {
    P.table(slide, { form: "ruled", header: [c.name, ...years], rows: c.rows, colW },
      { x: B.x, y: top + i * (h + gap), w: B.w, h });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
