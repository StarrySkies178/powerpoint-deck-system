// C10 strategy overview table, TrueNorth Pola deck, variant c (edit the closest other slide of the same deck).
// Closest other slide: slide 15 of the deck ("Greenfield direct investment ..."), stored object case-truenorth-pola-015.
// Why: the prompt asks for a full-width grid of 4 columns with a coloured header row, one highlighted row and
// 4 body rows. Slide 15 is the deck's only native table with exactly that furniture: red header row with white
// text, grey/white banded body rows, a row label column and one row singled out. Slide 17 (Gantt) is also a
// full-width grid, but it is drawn with loose shapes and pictures, so its cells cannot be refilled.
// build.js draws the deck frame (breadcrumb, red title band, source) with the TrueNorth style profile;
// build.py lifts the table out of case-truenorth-pola-015 (element 3), resizes it to 6 rows x 4 columns,
// places it over the whole body and refills its cells (merged Risks and Mitigation cells over the 4 phase rows).
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));
const { pres } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
  source: "Source: TrueNorth Analysis",
  crumb: { items: ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], current: 1 },
});
L.save(pres, __dirname + "/candidate.pptx");
