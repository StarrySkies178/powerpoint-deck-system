// C03 run5 r3: "Backup: Key assumptions for financial analysis" in the style of Case-2019-Polaris.
// Approach: the deck's style profile (P.useStyle via L.start) and the generic table() generator in its "ruled" form,
// the form of the deck's own backup tables (Polaris 19-21: bold red header text on one black rule, grey row rules,
// bold first column, centred numbers). Three scenario tables are stacked, each named in its first header cell.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, B, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "Backup: Key assumptions for financial analysis",
    source: "Source: Polaris Analysis",
  });

  const years = ["2019E", "2020E", "2021E", "2022E", "2023E"];
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

  // body area under the title rule, down to just above the source line
  const top = B.y, bottom = 6.95, gap = 0.3;
  const h = (bottom - top - gap * (cases.length - 1)) / cases.length;
  cases.forEach((c, i) => {
    P.table(slide, {
      form: "ruled",
      header: [c.name, ...years],
      rows: c.rows,
      colW: [0.25, 0.15, 0.15, 0.15, 0.15, 0.15],
    }, { x: B.x, y: top + i * (h + gap), w: B.w, h });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
