// D04-issue-tree, attempt 3: frame in the Deloitte timesaver look (style profile); the tree itself is the
// named slide's own stored object (del-038), placed by build.py with its original colours.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
(async () => {
  const { pres } = L.start({ ref: "Deloitte-timesaver", title: "Logic trees", subtitle: "Vertical" });
  await L.save(pres, __dirname + "/candidate.pptx");
})();
