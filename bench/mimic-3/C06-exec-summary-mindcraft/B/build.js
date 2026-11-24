// Build B (changed content: five paragraphs instead of four): the frame only carries the title placeholder in the Mindcraft style;
// build.py then places the stored slide object case19-mindcraft-003 (photo + gradient picture group and the
// four-paragraph body text box) and lifts the title above it in the slide's own look (white, bold).
const path = require("path");
const L = require(path.resolve(__dirname, "../../../lib/bench_lib.js"));
(async () => {
  const { pres } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
