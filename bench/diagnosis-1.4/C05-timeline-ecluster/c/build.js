// C05 variant c: Implementation Timeline in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Closest other slide: E-Cluster slide 23 ("Appendix: City expansion forecast"). It is the deck's only table with
// a grouped first column (category cells merged over several rows, alternating light-blue / grey bands) and
// year columns under a navy header, which is exactly the shape of a Gantt by workstream over 2019-2024.
// build.py takes its stored table (case19-ecluster-023), rebuilds the rows for the six initiatives and fills the
// year cells each initiative spans as the bar. The "Potential Risks" block reuses the "Key Assumptions" header,
// rule and bullet list of slide 16 (case19-ecluster-016p2, elements 16-18), the deck's other Implementation slide.
// build.js draws only the frame: breadcrumb, title band, page number (from the E-Cluster style profile).
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));
const { pres, slide } = L.start({
  ref: "Case-2019-E-Cluster",
  title: "Implementation Timeline",
  crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
});
// thin navy rule above the footer, on every content slide of the deck
slide.addShape("line", { x: 0, y: 7.26, w: 13.33, h: 0, line: { color: "202C4F", width: 0.75 } });
L.save(pres, __dirname + "/candidate.pptx");
