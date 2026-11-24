// C03 rebuild 1 (run2a-final): "Backup: Key assumptions for financial analysis", in the style of Case-2019-Polaris.
// Approach: the deck's style profile + the framework's table() in its "ruled" form, the form of the deck's other
// backup tables (prioritised cities: red bold header text over a black rule, grey row rules, bold first column,
// numbers centred). Three scenario tables stacked in the body, one per case, years as columns.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, B, P, prof } = L.start({
    ref: "Case-2019-Polaris",
    title: "Backup: Key assumptions for financial analysis",
    source: "Source: Polaris Analysis",
  });

  const years = ["2019", "2020", "2021", "2022", "2023"];
  const cases = [
    { name: "High Case", rows: [
      ["#stores", 261, 321, 381, 441, 551],
      ["Organic Growth(%)", "4%", "8%", "10%", "12%", "15%"],
      ["Online Growth(%)", "31%", "41%", "40%", "45%", "38%"] ] },
    { name: "Base Case", rows: [
      ["#stores", 261, 306, 351, 396, 441],
      ["Organic Growth(%)", "4%", "8%", "10%", "10%", "12%"],
      ["Online Growth(%)", "31%", "32%", "32%", "30%", "30%"] ] },
    { name: "Low Base", rows: [
      ["#stores", 261, 306, 351, 391, 431],
      ["Organic Growth(%)", "4%", "4%", "4%", "3%", "5%"],
      ["Online Growth(%)", "31%", "29%", "29%", "27%", "25%"] ] },
  ];

  // the deck's body runs to the end of its title rule (12.97 in), as its backup tables do
  const right = (prof && prof.title.rule) ? prof.title.rule.x + prof.title.rule.w : B.x + B.w;
  const gap = 0.3, top = B.y + 0.05, bottom = 7.05;
  const h = (bottom - top - gap * (cases.length - 1)) / cases.length;
  const colW = [0.28, 0.144, 0.144, 0.144, 0.144, 0.144];
  cases.forEach((c, k) => {
    const box = { x: B.x, y: top + k * (h + gap), w: right - B.x, h };
    P.table(slide, { form: "ruled", header: [c.name, ...years], rows: c.rows.map((r) => r.map(String)), colW }, box);
  });

  // every slide of the deck carries a thin grey rule above the source line, from the left edge to the end of the title rule;
  // the style profile does not record it, so it is drawn here in the deck's grey row-rule colour
  const rr = (prof && prof.table && prof.table.row_rule) || ["B4B4B4", 0.75];
  slide.addShape("line", { x: 0, y: 7.21, w: right, h: 0, line: { color: rr[0], width: rr[1] } });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
