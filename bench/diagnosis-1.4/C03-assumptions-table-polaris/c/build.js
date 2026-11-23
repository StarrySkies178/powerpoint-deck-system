// C03 variant c: "Backup: Key assumptions for financial analysis", in the style of Case-2019-Polaris.
// Closest other slide: Polaris slide 19 ("Backup: Prioritized pre-occupied cities"). It is the deck's
// backup data table: plain title over the red rule, native table with red bold column headers, a black
// rule under the header, grey row rules, bold first column and a red closing rule. Slides 20 and 21 are
// the same form but overflow the page; 19 is the clean one. This prompt is the same kind of slide (a
// backup page of figures), only cut into three small tables (one per scenario) instead of one long one.
// build.js draws the frame with the Polaris style profile; build.py places slide 19's stored table
// (case19-polaris-019, element 0) three times, cut to 4 rows x 6 columns and refilled.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));
(async () => {
  const { pres } = L.start({
    ref: "Case-2019-Polaris",
    title: "Backup: Key assumptions for financial analysis",
    source: "Source: Polaris Analysis",
  });
  await L.save(pres, __dirname + "/candidate.pptx");
})();
