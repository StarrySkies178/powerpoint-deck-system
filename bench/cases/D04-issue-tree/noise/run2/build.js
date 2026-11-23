// D04-issue-tree, noise run 2: Deloitte timesaver slide 38 "Logic trees / Vertical".
// Frame (title, grey second title line, footer, page number) in the reference's measured style;
// the tree itself is the named slide's own stored object, placed by build.py.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
(async () => {
  const { pres } = L.start({ ref: "Deloitte-timesaver", title: "Logic trees", subtitle: "Vertical" });
  await L.save(pres, __dirname + "/candidate.pptx");
})();
