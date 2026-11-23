// D04 issue tree, noise run 1: frame in the Deloitte timesaver style; the tree itself is placed by build.py
// from slide 38's own stored object (del-038), with its original colours.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
(async () => {
  const { pres } = L.start({ ref: "Deloitte-timesaver", title: "Logic trees", subtitle: "Vertical" });
  await L.save(pres, __dirname + "/candidate.pptx");
})();
